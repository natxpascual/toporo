import React from 'react';
import { LegalLayout } from './LegalLayout';

export const PrivacyPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How Toporo collects, processes, and protects your information when designing cloud architectures and generating Infrastructure as Code."
      lastUpdated="November 11, 2026"
      activePath="/privacy"
      onNavigate={onNavigate}
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">1. Information We Collect</h2>
        <p>
          We adhere to data minimization principles. We only collect information strictly required to authenticate your account and
          render your cloud topology workspace:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[var(--tp-muted)]">
          <li><strong>Account Information:</strong> Name, professional email address, and encrypted credentials.</li>
          <li><strong>Project Telemetry:</strong> Anonymized component counts, canvas zoom/pan settings, and UI preferences (stored locally in your browser).</li>
          <li><strong>Architecture Code:</strong> Terraform definitions (`.tf`) and project files (`.ats`) are processed ephemerally in-session for AST synchronization.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">2. Zero-Retention Code Privacy &amp; AI Copilot Data Handling</h2>
        <p>
          Your proprietary architectural topology is not used to train global public machine learning models. Natural language prompts sent to
          the Architecture Copilot are routed via secure, private enterprise Azure OpenAI instances governed by strict enterprise confidentiality
          agreements and zero-data-retention policies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">3. Local-First Browser Storage</h2>
        <p>
          To ensure peak speed and maximum privacy, Toporo stores temporary canvas states, UI layout dimensions (such as drawer widths and inspector
          heights), and pinned blueprints in your browser&apos;s `localStorage`. You may clear this data at any time via your browser settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">4. Your Data Protection Rights (GDPR / CCPA)</h2>
        <p>
          Depending on your jurisdiction, you have the right to request access to, correction of, or permanent deletion of your personal data.
          To exercise your privacy rights, please reach out via our contact channels or account deletion settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">5. Security Standards</h2>
        <p>
          All network traffic between your client and our services is encrypted in transit using Transport Layer Security (TLS 1.3). We employ
          stringent access controls, multi-factor authentication for operational staff, and continuous vulnerability monitoring.
        </p>
      </section>
    </LegalLayout>
  );
};

