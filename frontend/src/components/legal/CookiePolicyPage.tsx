import React from 'react';
import { LegalLayout } from './LegalLayout';

export const CookiePolicyPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Details regarding how Toporo uses cookies and local browser storage technologies to maintain sessions and provide high-performance visual modeling."
      lastUpdated="November 11, 2026"
      activePath="/cookies"
      onNavigate={onNavigate}
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">1. What Are Cookies and Local Storage?</h2>
        <p>
          Cookies and local storage objects (`localStorage` and `sessionStorage`) are small data files stored on your device that enable web applications
          to remember your preferences, keep you securely authenticated, and preserve your visual workspace layout between sessions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">2. Categories of Cookies We Use</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
            <h3 className="text-sm font-semibold text-[var(--tp-main)] mb-1">Strictly Necessary &amp; Functional Cookies</h3>
            <p className="text-xs text-[var(--tp-muted)] leading-relaxed">
              Essential for logging in, routing within the application, maintaining cryptographic tokens, and preventing CSRF attacks. The platform cannot function properly without these.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
            <h3 className="text-sm font-semibold text-[var(--tp-main)] mb-1">Studio UI &amp; Workspace Preferences (`localStorage`)</h3>
            <p className="text-xs text-[var(--tp-muted)] leading-relaxed">
              We store your theme preference (`azure_theme`), bottom panel height (`azure_bottom_panel_height`), code drawer width (`azure_code_drawer_width`), canvas view mode (`azure_canvas_view_mode`), and pinned catalog components so your personalized layout is restored immediately upon reloading.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-line)]">
            <h3 className="text-sm font-semibold text-[var(--tp-main)] mb-1">Telemetry &amp; FinOps Analysis Cookies</h3>
            <p className="text-xs text-[var(--tp-muted)] leading-relaxed">
              Help us measure API latency when fetching Infracost pricing and Azure Retail meters, ensuring snappy performance across all cloud geographic regions.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">3. Managing and Rejecting Cookies</h2>
        <p>
          When you first visit Toporo, you are presented with our Cookie Consent banner where you can choose to <strong>Accept all</strong> or <strong>Reject all</strong> non-essential cookies. You can also clear cookies and site data at any time directly through your web browser preferences.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">4. Updates to this Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in legal requirements or platform architecture. Any modifications will be posted here with an updated revision date.
        </p>
      </section>
    </LegalLayout>
  );
};

