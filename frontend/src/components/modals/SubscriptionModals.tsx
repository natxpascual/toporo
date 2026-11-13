import React, { useState } from 'react';
import { Crown, Sparkles, ShieldCheck, DollarSign, X, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SubscriptionModalsProps {
  mode: 'trial-offer' | 'upgrade-nudge' | null;
  onClose: () => void;
}

export const SubscriptionModals: React.FC<SubscriptionModalsProps> = ({ mode, onClose }) => {
  const { startProTrial, upgradeToPro } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mode) return null;

  const isTrialOffer = mode === 'trial-offer';

  const handleActivateTrial = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await startProTrial();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unable to activate 7-day Pro trial.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await upgradeToPro();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unable to upgrade to Toporo Pro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-modal-title"
      data-testid={isTrialOffer ? 'trial-offer-modal' : 'upgrade-nudge-modal'}
    >
      <div className="w-full max-w-[460px] rounded-xl border border-[#2E3830] bg-[#181D19] text-[#F5F5F4] shadow-2xl overflow-hidden">
        {/* Top Banner */}
        <div className="relative bg-[#0B1D0B] px-6 py-5 border-b border-[#2E3830]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 p-1 rounded-md text-[#A8A29E] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-mono font-semibold mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>{isTrialOffer ? '7-DAY FREE TRIAL' : 'TOPORO PRO'}</span>
          </div>

          <h2 id="subscription-modal-title" className="text-lg font-bold tracking-tight text-white">
            {isTrialOffer
              ? 'Unlock Toporo Pro free for 7 days'
              : 'Upgrade to Toporo Pro for AI Copilot'}
          </h2>
          <p className="text-xs text-[#D6D3D1] mt-1 leading-relaxed">
            {isTrialOffer
              ? 'Experience the full AI Architecture Copilot and automated remediation in your Studio workspace—one-time free trial, no credit card needed.'
              : 'Your 7-day Pro trial has ended and your account is currently on the Free tier. Upgrade to Toporo Pro to re-enable AI Copilot features.'}
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#F5F5F4]">AI Architecture Copilot</div>
                <div className="text-[#A8A29E]">
                  Generate multi-tier hub-and-spoke Azure topologies from natural language prompts.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#A7E68F] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#F5F5F4]">1-Click CIS Azure v2.0 AI Remediation</div>
                <div className="text-[#A8A29E]">
                  Automatically patch security findings in Terraform HCL2 with blast-radius awareness.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <DollarSign className="w-4 h-4 text-[#4BCE97] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#F5F5F4]">AI FinOps SKU Optimization</div>
                <div className="text-[#A8A29E]">
                  Right-size compute and database tiers without compromising availability.
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            {isTrialOffer ? (
              <>
                <button
                  id="start-pro-trial-btn"
                  type="button"
                  disabled={isLoading}
                  onClick={handleActivateTrial}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B1D0B] font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Crown className="w-4 h-4" />
                  <span>{isLoading ? 'Activating 7-Day Trial...' : 'Start Free 7-Day Pro Trial'}</span>
                </button>
                <button
                  id="decline-pro-trial-btn"
                  type="button"
                  disabled={isLoading}
                  onClick={onClose}
                  className="w-full py-2 px-4 rounded-lg border border-[#2E3830] hover:bg-[#1F2620] text-[#D6D3D1] text-xs font-medium transition-colors cursor-pointer"
                >
                  Continue with Free Plan
                </button>
              </>
            ) : (
              <>
                <button
                  id="upgrade-to-pro-btn"
                  type="button"
                  disabled={isLoading}
                  onClick={handleUpgrade}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B1D0B] font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{isLoading ? 'Upgrading to Toporo Pro...' : 'Upgrade to Toporo Pro ($19/mo)'}</span>
                </button>
                <button
                  id="dismiss-upgrade-nudge-btn"
                  type="button"
                  disabled={isLoading}
                  onClick={onClose}
                  className="w-full py-2 px-4 rounded-lg border border-[#2E3830] hover:bg-[#1F2620] text-[#D6D3D1] text-xs font-medium transition-colors cursor-pointer"
                >
                  Remind me in 30 minutes
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

