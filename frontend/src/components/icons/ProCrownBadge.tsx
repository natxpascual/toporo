import React from 'react';
import { Crown } from 'lucide-react';

interface ProCrownBadgeProps {
  /** Optional text label alongside the crown icon (recommended for accessibility). */
  label?: string;
  /** Compact inline icon-only mode for tight Studio toolbar buttons (requires title/aria-label on parent). */
  compact?: boolean;
  className?: string;
}

/**
 * Shared Toporo Pro crown signifier using the canonical amber/gold tokens.
 * Pair with an explicit label or interactive upgrade popover so gated Studio features stay discoverable.
 */
export const ProCrownBadge: React.FC<ProCrownBadgeProps> = ({
  label,
  compact = false,
  className = '',
}) => {
  if (compact) {
    return (
      <Crown
        className={`w-3.5 h-3.5 text-[#d97706] fill-[#fff085] shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-[#fff085] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#1c1917] ${className}`}
    >
      <Crown className="w-3 h-3 text-[#d97706] fill-[#d97706]/20 shrink-0" aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  );
};

