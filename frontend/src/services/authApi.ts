/**
 * Authentication, Subscription Lifecycle & Admin Portal API Client.
 */

import { apiUrl } from './config';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending_verification' | 'pending_password' | 'active' | 'suspended';
export type PlanTier = 'free' | 'pro';

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
  fullName: string;
  authProviders: string[];
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  plan: PlanTier;
  effectivePlan: PlanTier;
  trialAvailed: boolean;
  isTrialActive: boolean;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialDaysRemaining: number;
  shouldPromptTrial: boolean;
  shouldNudgeUpgrade30m: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminKpis {
  totalUsers: number;
  activePro: number;
  activeTrials: number;
  freeTier: number;
  pendingVerification: number;
  suspendedUsers: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  actor: string;
  target: string;
  detail: string;
  severity: 'info' | 'warning' | 'error';
}

export const AUTH_TOKEN_STORAGE_KEY = 'toporo_auth_token';
export const ELEVATED_TOKEN_STORAGE_KEY = 'toporo_elevated_token';

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem(ELEVATED_TOKEN_STORAGE_KEY) ||
    localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
    sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  );
}

export function getAuthHeaders(tokenOverride?: string | null): Record<string, string> {
  const token = tokenOverride ?? getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response, fallback: string): Promise<never> {
  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    throw new Error(fallback);
  }
  const detail = payload?.detail;
  if (typeof detail === 'string') {
    throw new Error(detail);
  }
  if (detail && typeof detail === 'object') {
    const err: any = new Error(detail.message || fallback);
    err.code = detail.code;
    err.email = detail.email;
    err.devOtpHint = detail.devOtpHint;
    throw err;
  }
  throw new Error(fallback);
}

export const AuthApi = {
  async signupEmail(email: string): Promise<{
    status: string;
    email: string;
    message: string;
    expiresInMinutes: number;
    devOtpHint?: string;
  }> {
    const res = await fetch(apiUrl('/api/auth/signup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) await parseError(res, 'Failed to start signup');
    return res.json();
  },

  async resendOtp(email: string): Promise<{ status: string; message: string; devOtpHint?: string }> {
    const res = await fetch(apiUrl('/api/auth/resend-otp'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) await parseError(res, 'Failed to resend verification code');
    return res.json();
  },

  async verifyEmailOtp(email: string, otpCode: string): Promise<{
    status: 'password_setup_required' | 'authenticated';
    email?: string;
    setupToken?: string;
    accessToken?: string;
    expiresAt?: string;
    elevated?: boolean;
    user?: AuthUser;
    message?: string;
  }> {
    const res = await fetch(apiUrl('/api/auth/verify-email'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode }),
    });
    if (!res.ok) await parseError(res, 'Verification failed');
    return res.json();
  },

  async setupPassword(payload: {
    email: string;
    setupToken: string;
    password: string;
    fullName?: string;
    username?: string;
  }): Promise<{
    accessToken: string;
    expiresAt: string;
    elevated: boolean;
    user: AuthUser;
  }> {
    const res = await fetch(apiUrl('/api/auth/setup-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) await parseError(res, 'Failed to set password');
    return res.json();
  },

  async login(payload: {
    identifier: string;
    password: string;
    rememberMe: boolean;
    elevate: boolean;
  }): Promise<{
    accessToken: string;
    expiresAt: string;
    elevated: boolean;
    user: AuthUser;
  }> {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) await parseError(res, 'Login failed');
    return res.json();
  },

  async getMe(token?: string | null): Promise<{ user: AuthUser; elevated: boolean }> {
    const res = await fetch(apiUrl('/api/auth/me'), {
      headers: { ...getAuthHeaders(token) },
    });
    if (!res.ok) await parseError(res, 'Session expired');
    return res.json();
  },

  async startSevenDayTrial(): Promise<{ message: string; user: AuthUser }> {
    const res = await fetch(apiUrl('/api/auth/trial/start'), {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) await parseError(res, 'Unable to start 7-day Pro trial');
    return res.json();
  },

  async upgradeToPro(): Promise<{ message: string; user: AuthUser }> {
    const res = await fetch(apiUrl('/api/auth/upgrade'), {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) await parseError(res, 'Unable to upgrade account');
    return res.json();
  },
};

export const AdminApi = {
  async listUsers(): Promise<{
    admin: AuthUser;
    kpis: AdminKpis;
    users: AuthUser[];
    auditEvents: AuditEvent[];
  }> {
    const res = await fetch(apiUrl('/api/admin/users'), {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) await parseError(res, 'Failed to load admin portal data');
    return res.json();
  },

  async updateUser(
    email: string,
    patch: {
      plan?: PlanTier;
      role?: UserRole;
      status?: UserStatus;
      emailVerified?: boolean;
      resetTrial?: boolean;
      fullName?: string;
    }
  ): Promise<{ user: AuthUser }> {
    const res = await fetch(apiUrl(`/api/admin/users/${encodeURIComponent(email)}`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(patch),
    });
    if (!res.ok) await parseError(res, 'Failed to update user');
    return res.json();
  },

  async deleteUser(email: string): Promise<{ deleted: boolean; email: string }> {
    const res = await fetch(apiUrl(`/api/admin/users/${encodeURIComponent(email)}`), {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) await parseError(res, 'Failed to delete user');
    return res.json();
  },
};

