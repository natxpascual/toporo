import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { ToporoLogo } from '../icons/ToporoLogo';
import { AuthApi } from '../../services/authApi';
import { useAuthStore } from '../../store/useAuthStore';

interface SignupPageProps {
  onNavigate: (route: string) => void;
  onSuccess?: () => void;
}

type SignupStep = 'email' | 'otp' | 'password';

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate, onSuccess }) => {
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [setupToken, setSetupToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    }
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthApi.signupEmail(trimmed);
      setEmail(res.email);
      setOtpDigits(['', '', '', '', '', '']);
      setDevOtpHint(res.devOtpHint || null);
      setInfoMessage(res.message);
      setResendCooldown(60);
      setStep('otp');
    } catch (err: any) {
      setError(err?.message || 'Unable to start registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    // Handle pasting full 6-digit code
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      chars.forEach((c, i) => {
        next[i] = c;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(5, chars.length);
      otpRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned;
    setOtpDigits(next);
    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthApi.verifyEmailOtp(email, code);
      if (res.status === 'password_setup_required' && res.setupToken) {
        setSetupToken(res.setupToken);
        setDevOtpHint(null);
        setInfoMessage('Email verified! Now set up a strong password for your account.');
        setStep('password');
      } else if (res.accessToken && res.user) {
        setSession({
          accessToken: res.accessToken,
          user: res.user,
          elevated: Boolean(res.elevated),
          expiresAt: res.expiresAt,
          rememberMe: true,
        });
        if (onSuccess) onSuccess();
        else onNavigate('/studio');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await AuthApi.resendOtp(email);
      setOtpDigits(['', '', '', '', '', '']);
      setDevOtpHint(res.devOtpHint || null);
      setInfoMessage(res.message);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthApi.setupPassword({
        email,
        setupToken,
        password,
      });
      setSession({
        accessToken: res.accessToken,
        user: res.user,
        elevated: res.elevated,
        expiresAt: res.expiresAt,
        rememberMe: true,
      });
      if (onSuccess) {
        onSuccess();
      } else {
        onNavigate('/studio');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to complete account setup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSso = (provider: 'google' | 'github') => {
    setIsLoading(true);
    window.location.href = `/api/auth/oauth/${provider}/authorize`;
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
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('/login')}
              className="text-[var(--tp-blue)] hover:underline font-semibold cursor-pointer"
            >
              Log in
            </button>
          </span>
        </div>

        {/* Main Centered Architectural Auth Card Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-[420px] bg-[var(--tp-surface)] rounded-xl border border-[var(--tp-line)] p-8 sm:p-10 transition-all">
            {/* Brand Logo & Step Header */}
            <div className="flex flex-col items-center mb-6 text-center">
              <ToporoLogo className="w-12 h-12 mb-3" />
              <h1 className="text-[20px] font-semibold text-[var(--tp-main)] tracking-tight">
                {step === 'email' && 'Create your account'}
                {step === 'otp' && 'Verify your email'}
                {step === 'password' && 'Set up your password'}
              </h1>
              <p className="text-xs font-mono text-[var(--tp-muted)] mt-1">
                Toporo: Azure Cloud Topology Engine
              </p>

              {/* Step Progress Indicator */}
              <div className="flex items-center gap-2 mt-4 text-[10px] font-mono uppercase tracking-wider text-[var(--tp-muted)]">
                <span className={step === 'email' ? 'text-[var(--tp-main)] font-bold' : 'text-[var(--tp-green)]'}>
                  1. Email
                </span>
                <span>→</span>
                <span
                  className={
                    step === 'otp'
                      ? 'text-[var(--tp-main)] font-bold'
                      : step === 'password'
                        ? 'text-[var(--tp-green)]'
                        : ''
                  }
                >
                  2. Verify Code
                </span>
                <span>→</span>
                <span className={step === 'password' ? 'text-[var(--tp-main)] font-bold' : ''}>
                  3. Password
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && !error && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{infoMessage}</span>
              </div>
            )}

            {devOtpHint && step === 'otp' && (
              <div className="mb-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900 text-center">
                [Local Dev Mode] Verification code: <strong>{devOtpHint}</strong>
              </div>
            )}

            {/* STEP 1: Email Only */}
            {step === 'email' && (
              <>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--tp-muted)] mb-1">
                      Email address <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-3 py-2 text-sm bg-white border border-[var(--tp-line)] rounded-lg outline-none text-[var(--tp-main)] placeholder-stone-400 focus:border-[var(--tp-main)] focus:ring-2 focus:ring-[#1c1917]/15 transition-all"
                    />
                  </div>

                  <p className="text-[11px] text-[var(--tp-muted)] leading-normal pt-1">
                    By signing up, you agree to the{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('/terms')}
                      className="text-[var(--tp-blue)] hover:underline cursor-pointer"
                    >
                      Terms of Service
                    </button>{' '}
                    and acknowledge our{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('/privacy')}
                      className="text-[var(--tp-blue)] hover:underline cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    .
                  </p>

                  <button
                    id="signup-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="tp-btn tp-btn-dark w-full !py-2.5 !text-sm disabled:opacity-60"
                  >
                    {isLoading ? 'Sending verification code...' : 'Continue with Email'}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--tp-muted)] pt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>We will send a 6-digit verification code to your email.</span>
                  </div>
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
                    id="signup-google-sso-btn"
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
                    id="signup-github-sso-btn"
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

            {/* STEP 2: 6-Digit Email OTP Verification */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center text-xs text-[var(--tp-muted)]">
                  Enter the 6-digit code sent to <strong className="text-[var(--tp-main)]">{email}</strong>
                </div>

                <div className="flex items-center justify-center gap-2" id="signup-otp-inputs">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      id={`signup-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      aria-label={`Verification digit ${idx + 1}`}
                      className="w-11 h-12 text-center font-mono text-lg font-bold bg-white border border-[var(--tp-line)] rounded-lg outline-none text-[var(--tp-main)] focus:border-[var(--tp-main)] focus:ring-2 focus:ring-[#1c1917]/15 transition-all"
                    />
                  ))}
                </div>

                <button
                  id="signup-verify-otp-btn"
                  type="submit"
                  disabled={isLoading}
                  className="tp-btn tp-btn-dark w-full !py-2.5 !text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying code...' : 'Verify Email Code'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className="text-[var(--tp-muted)] hover:text-[var(--tp-main)] cursor-pointer"
                  >
                    Change email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleResendOtp}
                    className="text-[var(--tp-blue)] hover:underline font-medium disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend 6-digit code'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Password Setup */}
            {step === 'password' && (
              <form onSubmit={handleSetupPassword} className="space-y-4">
                <div className="p-2.5 rounded-lg bg-[var(--tp-bg)]/60 border border-[var(--tp-line)] text-xs text-[var(--tp-muted)] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[var(--tp-green)] shrink-0" />
                  <span className="truncate">
                    Account: <strong className="text-[var(--tp-main)]">{email}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--tp-muted)] mb-1">
                    Create password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
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

                <div>
                  <label className="block text-xs font-semibold text-[var(--tp-muted)] mb-1">
                    Confirm password <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full px-3 py-2 text-sm bg-white border border-[var(--tp-line)] rounded-lg outline-none text-[var(--tp-main)] placeholder-stone-400 focus:border-[var(--tp-main)] focus:ring-2 focus:ring-[#1c1917]/15 transition-all"
                  />
                </div>

                <button
                  id="signup-complete-btn"
                  type="submit"
                  disabled={isLoading}
                  className="tp-btn tp-btn-dark w-full !py-2.5 !text-sm disabled:opacity-60"
                >
                  {isLoading ? 'Activating Free Account...' : 'Complete Account Setup'}
                </button>
              </form>
            )}

            {/* Card Footer: Switch to Login */}
            <div className="mt-8 pt-6 border-t border-[var(--tp-line)] text-center text-xs text-[var(--tp-muted)]">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('/login')}
                className="text-[var(--tp-blue)] hover:underline font-semibold cursor-pointer"
              >
                Log in
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
