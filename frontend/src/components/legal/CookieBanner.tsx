import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck } from 'lucide-react';

interface CookieBannerProps {
  onNavigate: (route: string) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('toporo_cookie_consent');
      if (!consent) {
        // Show after a brief delay so page loads smoothly
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore in private storage sandbox
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem('toporo_cookie_consent', choice);
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      data-testid="cookie-policy-popup"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-in-up"
    >
      <div className="p-4 sm:p-5 rounded-[12px] bg-[#0E1118]/95 backdrop-blur-xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(20,110,245,0.18)] text-white">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[6px] bg-[#146EF5]/15 border border-[#146EF5]/30 flex items-center justify-center text-[#66A3FF]">
              <Cookie className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Cookie & Telemetry Preferences
            </h4>
          </div>
          <button
            onClick={() => handleChoice('rejected')}
            className="text-[#898E99] hover:text-white p-1 rounded transition-colors"
            title="Dismiss (Reject non-essential)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explanatory text */}
        <p className="text-xs text-[#9BA1AE] leading-relaxed mb-4">
          We use essential cookies to maintain your workspace session and telemetry cookies to benchmark Azure AST
          copilot synthesis. You can view full details in our{' '}
          <button
            onClick={() => onNavigate('/cookies')}
            className="text-[#66A3FF] hover:underline font-medium inline-block"
          >
            Cookie Policy
          </button>
          .
        </p>

        {/* Actions: Reject all & Accept all */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleChoice('rejected')}
            data-testid="cookie-reject-btn"
            className="flex-1 py-2 px-3 rounded-[6px] text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-[#C4C9D4] border border-white/[0.1] transition-all text-center"
          >
            Reject all
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            data-testid="cookie-accept-btn"
            className="flex-1 py-2 px-3 rounded-[6px] text-xs font-semibold bg-[#146EF5] hover:bg-[#2B7FFF] text-white shadow-[0_0_16px_rgba(20,110,245,0.35)] transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Accept all</span>
          </button>
        </div>
      </div>
    </div>
  );
};

