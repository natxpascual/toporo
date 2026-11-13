import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ToporoLogo } from '../icons/ToporoLogo';
import { AuthApi } from '../../services/authApi';
import { useAuthStore } from '../../store/useAuthStore';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  onSuccess?: (opts?: { elevated?: boolean }) => void;
}

function detectElevateQuery(): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('session') === 'elevate') return true;
  const hashParts = window.location.hash.split('?');
  if (hashParts.length > 1) {
    const hashParams = new URLSearchParams(hashParts[1]);
    if (hashParams.get('session') === 'elevate') return true;
  }
  return false;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onSuccess }) => {
  const setSession = useAuthStore((s) => s.setSession);

  const [isElevateMode, setIsElevateMode] = useState<boolean>(detectElevateQuery);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unverified email inline OTP flow
  const [pendingOtpEmail, setPendingOtpEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  useEffect(() => {
    const syncParams = () => {
      setIsElevateMode(detectElevateQuery());
      const params = new URLSearchParams(window.location.search);
      const oauthErr = params.get('oauth_error');
      if (oauthErr) {
        setError(oauthErr);
      }
    };
    syncParams();
    window.addEventListener('popstate', syncParams);
    window.addEventListener('hashchange', syncParams);
    return () => {
      window.removeEventListener('popstate', syncParams);
      window.removeEventListener('hashchange', syncParams);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthApi.login({
        identifier: username.trim(),
        password,
        rememberMe: isElevateMode ? false : rememberMe,
        elevate: isElevateMode,
      });
      setSession({
        accessToken: res.accessToken,
        user: res.user,
        elevated: res.elevated,
        expiresAt: res.expiresAt,
        rememberMe: isElevateMode ? false : rememberMe,
      });
      if (onSuccess) {
        onSuccess({ elevated: res.elevated });
      } else {
        onNavigate(res.elevated ? '/manage' : '/studio');
      }
    } catch (err: any) {
      if (err?.code === 'EMAIL_NOT_VERIFIED' && err?.email) {
        setPendingOtpEmail(err.email);
        setDevOtpHint(err.devOtpHint || null);
      }
      setError(err?.message || 'Unable to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPendingOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingOtpEmail) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await AuthApi.verifyEmailOtp(pendingOtpEmail, otpCode.trim());
      if (res.accessToken && res.user) {
        setSession({
          accessToken: res.accessToken,
          user: res.user,
          elevated: Boolean(res.elevated),
          expiresAt: res.expiresAt,
          rememberMe,
        });
        onNavigate('/studio');
      } else {
        setPendingOtpEmail(null);
        setError('Email verified. Please sign up again or log in.');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSso = (provider: 'google' | 'github') => {
    setIsLoading(true);
    const suffix = isElevateMode ? '?elevate=true' : '';
    window.location.href = `/api/auth/oauth/${provider}/authorize${suffix}`;
  };

  return (
    <div className="tp-canvas flex flex-col justify-between min-h-screen">
      <div className="tp-frame flex-1 flex flex-col justify-between">
        {/* Top Header Navigation */}
        <div className="tp-cell py-4 sm:py-5 flex items-center justify-between w-full">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--tp-muted)] hover:text-[var(--tp-main)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Homepage
          </button>

          <span className="text-xs text-[var(--tp-muted)]">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => onNavigate('/signup')}
              className="text-[var(--tp-blue)] hover:underline font-semibold cursor-pointer"
            >
              Sign up
            </button>
          </span>
        </div>

        {/* Main Centered Architectural Auth Card Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-[400px] bg-[var(--tp-surface)] rounded-xl border border-[var(--tp-line)] p-8 sm:p-10 transition-all">
            {/* Brand Logo & Product Name */}
            <div className="flex flex-col items-center mb-6 text-center">
              <ToporoLogo className="w-12 h-12 mb-3" />
              <h1 className="text-[20px] font-semibold text-[var(--tp-main)] tracking-tight">
                {pendingOtpEmail
                  ? 'Verify your email'
                  : isElevateMode
                    ? 'Elevated Admin Sign-In'
                    : 'Log in to your account'}
              </h1>
              <p className="text-xs font-mono text-[var(--tp-muted)] mt-1">
                Toporo Azure Cloud Topology Engine
              </p>
            </div>

            {isElevateMode && !pendingOtpEmail && (
              <div
                id="elevate-session-banner"
                className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <div>
                  <div className="font-semibold">Elevated Session Requested</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Sign in with administrator credentials to access the <code className="font-mono">/manage</code> portal (30-minute session).
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {devOtpHint && pendingOtpEmail && (
              <div className="mb-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900 text-center">
                [Local Dev Mode] Verification code: <strong>{devOtpHint}</strong>
              </div>
            )}

            {pendingOtpEmail ? (
              <form onSubmit={handleVerifyPendingOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--tp-muted)] mb-1">
                    6-Digit Verification Code for {pendingOtpEmail}
                  </label>
                  <input
                    id="login-otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3 py-2 text-center font-mono text-lg tracking-widest bg-white border border-[var(--tp-line)] rounded-lg outline-none text-[var(--tp-main)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="tp-btn tp-btn-dark w-full !py-2.5 !text-sm inline-flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying...' : 'Verify & Log in'}</span>
                </button>
              </form>
            ) : (
              <>
                {/* Login Form (Username / Password) */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--tp-muted)] mb-1">
                      Email or username
                    </label>
                    <input
                      id="login-username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter email or username"
                      className="w-full px-3 py-2 text-sm bg-white border border-[var(--tp-line)] rounded-lg outline-none text-[var(--tp-main)] placeholder-stone-400 focus:border-[var(--tp-main)] focus:ring-2 focus:ring-[#1c1917]/15 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[var(--tp-muted)]">
                        Password
                      </label>
                      {!isElevateMode && (
                        <a
                          href="#forgot"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Please contact your Toporo workspace administrator to reset your password.');
                          }}
                          className="text-[11px] text-[var(--tp-blue)] hover:underline"
                        >
                          Can&apos;t log in?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-3 py-2 pr-10 text-sm bg-white border border-[var(--tp-line)] rounded-lg outline-none text-[var(--tp-main)] placeholder-stone-400 focus:border-[var(--tp-main)] focus:ring-2 focus:ring-[#1c1917]/15 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--tp-muted)] hover:text-[var(--tp-main)] cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {!isElevateMode && (
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-[#1c1917] border-[var(--tp-line)] rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 text-xs text-[var(--tp-muted)] select-none cursor-pointer">
                        Remember this device
                      </label>
                    </div>
                  )}

                  {/* Primary Submit Button */}
                  <button
                    id="login-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="tp-btn tp-btn-dark w-full !py-2.5 !text-sm disabled:opacity-60"
                  >
                    {isLoading
                      ? 'Authenticating...'
                      : isElevateMode
                        ? 'Authenticate Elevated Session'
                        : 'Log in'}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--tp-line)]" />
                  </div>
                  <span className="relative bg-[var(--tp-surface)] px-3 text-[11px] font-mono font-semibold text-[var(--tp-muted)] uppercase tracking-wider">
                    Or
                  </span>
                </div>

                {/* SSO Authentication Methods: Restricted strictly to Google and GitHub only */}
                <div className="space-y-2.5">
                  <button
                    id="login-google-sso-btn"
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSso('google')}
                    className="tp-btn tp-btn-outline w-full !bg-white !py-2 !text-sm !border-[var(--tp-line)] hover:!border-[var(--tp-main)]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    id="login-github-sso-btn"
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSso('github')}
                    className="tp-btn tp-btn-outline w-full !bg-white !py-2 !text-sm !border-[var(--tp-line)] hover:!border-[var(--tp-main)]"
                  >
                    <svg className="w-4 h-4 text-[#1c1917]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>Continue with GitHub</span>
                  </button>
                </div>
              </>
            )}

            {/* Card Footer: Switch to Signup */}
            <div className="mt-8 pt-6 border-t border-[var(--tp-line)] text-center text-xs text-[var(--tp-muted)]">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => onNavigate('/signup')}
                className="text-[var(--tp-blue)] hover:underline font-semibold cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <footer className="tp-cell py-6 text-center text-xs text-[var(--tp-muted)]">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
            <button type="button" onClick={() => onNavigate('/privacy')} className="hover:text-[var(--tp-main)] hover:underline cursor-pointer">
              Privacy Policy
            </button>
            <span>·</span>
            <button type="button" onClick={() => onNavigate('/terms')} className="hover:text-[var(--tp-main)] hover:underline cursor-pointer">
              Terms of Service
            </button>
            <span>·</span>
            <button type="button" onClick={() => onNavigate('/cookies')} className="hover:text-[var(--tp-main)] hover:underline cursor-pointer">
              Cookie Policy
            </button>
            <span>·</span>
            <button type="button" onClick={() => onNavigate('/accessibility')} className="hover:text-[var(--tp-main)] hover:underline cursor-pointer">
              Accessibility
            </button>
          </div>
          <div className="font-mono text-[11px]">
            One account for Toporo Cloud Topology Studio, Checkov Audits, and FinOps
          </div>
        </footer>
      </div>
    </div>
  );
};
