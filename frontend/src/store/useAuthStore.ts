import { create } from 'zustand';
import {
  AUTH_TOKEN_STORAGE_KEY,
  AuthApi,
  AuthUser,
  ELEVATED_TOKEN_STORAGE_KEY,
  getStoredAuthToken,
} from '../services/authApi';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isElevatedAdminSession: boolean;
  elevatedExpiresAt: string | null;
  isAuthReady: boolean;
  isAuthenticated: () => boolean;
  isPro: () => boolean;

  initializeSession: () => Promise<void>;
  setSession: (params: {
    accessToken: string;
    user: AuthUser;
    elevated?: boolean;
    expiresAt?: string;
    rememberMe?: boolean;
  }) => void;
  applyOAuthToken: (token: string, elevated: boolean) => Promise<AuthUser | null>;
  refreshProfile: () => Promise<AuthUser | null>;
  startProTrial: () => Promise<AuthUser>;
  upgradeToPro: () => Promise<AuthUser>;
  exitElevatedSession: () => void;
  logout: () => void;
}

const AUTH_USER_CACHE_KEY = 'toporo_auth_user_cache';

function persistToken(token: string, elevated: boolean, rememberMe: boolean) {
  if (typeof window === 'undefined') return;
  if (elevated) {
    sessionStorage.setItem(ELEVATED_TOKEN_STORAGE_KEY, token);
  } else {
    sessionStorage.removeItem(ELEVATED_TOKEN_STORAGE_KEY);
    if (rememberMe) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } else {
      sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  }
}

function clearAllAuthStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_CACHE_KEY);
  localStorage.removeItem('archon_auth_user');
  sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(ELEVATED_TOKEN_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? getStoredAuthToken() : null,
  isElevatedAdminSession: false,
  elevatedExpiresAt: null,
  isAuthReady: false,

  isAuthenticated: () => {
    const { user, token } = get();
    return Boolean(token && user && user.emailVerified && user.status === 'active');
  },

  isPro: () => {
    const { user } = get();
    return user?.effectivePlan === 'pro';
  },

  initializeSession: async () => {
    const token = getStoredAuthToken();
    if (!token) {
      set({ user: null, token: null, isElevatedAdminSession: false, isAuthReady: true });
      return;
    }

    try {
      const { user, elevated } = await AuthApi.getMe(token);
      set({
        user,
        token,
        isElevatedAdminSession: Boolean(elevated && user.role === 'admin'),
        isAuthReady: true,
      });
    } catch {
      clearAllAuthStorage();
      set({
        user: null,
        token: null,
        isElevatedAdminSession: false,
        elevatedExpiresAt: null,
        isAuthReady: true,
      });
    }
  },

  setSession: ({ accessToken, user, elevated = false, expiresAt, rememberMe = true }) => {
    persistToken(accessToken, elevated, rememberMe);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(user));
    }
    set({
      token: accessToken,
      user,
      isElevatedAdminSession: Boolean(elevated && user.role === 'admin'),
      elevatedExpiresAt: elevated ? expiresAt || null : null,
      isAuthReady: true,
    });
  },

  applyOAuthToken: async (token, elevated) => {
    persistToken(token, elevated, !elevated);
    try {
      const res = await AuthApi.getMe(token);
      set({
        token,
        user: res.user,
        isElevatedAdminSession: Boolean(res.elevated && res.user.role === 'admin'),
        isAuthReady: true,
      });
      return res.user;
    } catch {
      clearAllAuthStorage();
      set({ token: null, user: null, isElevatedAdminSession: false, isAuthReady: true });
      return null;
    }
  },

  refreshProfile: async () => {
    const token = get().token || getStoredAuthToken();
    if (!token) return null;
    try {
      const res = await AuthApi.getMe(token);
      set({
        user: res.user,
        token,
        isElevatedAdminSession: Boolean(res.elevated && res.user.role === 'admin'),
      });
      return res.user;
    } catch {
      return null;
    }
  },

  startProTrial: async () => {
    const res = await AuthApi.startSevenDayTrial();
    set({ user: res.user });
    return res.user;
  },

  upgradeToPro: async () => {
    const res = await AuthApi.upgradeToPro();
    set({ user: res.user });
    return res.user;
  },

  exitElevatedSession: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ELEVATED_TOKEN_STORAGE_KEY);
    }
    clearAllAuthStorage();
    set({
      user: null,
      token: null,
      isElevatedAdminSession: false,
      elevatedExpiresAt: null,
    });
  },

  logout: () => {
    clearAllAuthStorage();
    set({
      user: null,
      token: null,
      isElevatedAdminSession: false,
      elevatedExpiresAt: null,
    });
  },
}));

