import React from 'react';
import { LegalLayout } from './LegalLayout';

export const AccessibilityPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <LegalLayout
      title="Accessibility Statement"
      subtitle="Toporo's ongoing commitment to providing an inclusive, barrier-free cloud architecture and code editing experience for all engineers."
      lastUpdated="November 11, 2026"
      activePath="/accessibility"
      onNavigate={onNavigate}
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">1. Our Accessibility Commitment</h2>
        <p>
          Toporo is dedicated to ensuring digital accessibility for individuals with diverse abilities. We are continually improving the user
          experience for everyone and applying the relevant accessibility standards based on the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">2. Core Accessibility Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
            <h3 className="text-sm font-semibold text-[var(--tp-main)] mb-1">Keyboard Navigation</h3>
            <p className="text-xs text-[var(--tp-muted)] leading-relaxed">
              Global keyboard shortcuts allow navigating the visual canvas (`F` fit to screen, `+`/`-` zoom, `A` auto-layout, `Del` remove), toggling the Code Drawer (`⌘\`), launching Copilot (`⌘/`), and inspecting properties (`I`).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
            <h3 className="text-sm font-semibold text-[var(--tp-main)] mb-1">High-Contrast Dark &amp; Light Themes</h3>
            <p className="text-xs text-[var(--tp-muted)] leading-relaxed">
              Carefully calibrated text contrast ratios exceeding 4.5:1 against surfaces for optimal legibility under varying ambient lighting conditions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
            <h3 className="text-sm font-semibold text-[var(--tp-main)] mb-1">Semantic HTML &amp; Focus Rings</h3>
            <p className="text-xs text-[var(--tp-muted)] leading-relaxed">
              Standard button roles, accessible ARIA labels on all toolbar controls, and clear 2px focus indicators for screen reader and keyboard-only users.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
            <h3 className="text-sm font-semibold text-[var(--tp-main)] mb-1">Monaco Editor Accessibility</h3>
            <p className="text-xs text-[var(--tp-muted)] leading-relaxed">
              Powered by Microsoft VS Code&apos;s Monaco Editor, featuring full screen reader support, audio cues for syntax diagnostics, and customizable font sizing.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">3. Feedback &amp; Contact</h2>
        <p>
          We welcome your feedback on the accessibility of Toporo. If you encounter accessibility barriers on any portion of our visual studio
          or documentation, please let us know so we can implement rapid accommodations.
        </p>
      </section>
    </LegalLayout>
  );
};

