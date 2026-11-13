import React from 'react';
import { LegalLayout } from './LegalLayout';

export const TermsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these Terms of Service carefully before utilizing Toporo's cloud topology engine, bidirectional Terraform generation, and AI copilot services."
      lastUpdated="November 11, 2026"
      activePath="/terms"
      onNavigate={onNavigate}
    >
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">1. Acceptance of Terms</h2>
        <p>
          By creating an account, accessing, or using Toporo (&quot;Platform&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;),
          you agree to be bound by these Terms of Service. If you do not agree to all terms, you must not access or use the platform.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">2. Scope of Service &amp; Architecture Intellectual Property</h2>
        <p>
          Toporo provides an intelligent developmental platform for visual cloud modeling, bidirectional Abstract Syntax Tree (AST)
          Terraform synchronization, Checkov CIS benchmark auditing, and Infracost FinOps estimation.
        </p>
        <p>
          You retain full, exclusive ownership of all infrastructure-as-code definitions, architecture topologies, and customized parameters
          created or imported into Toporo. Toporo claims no ownership over generated `.tf` code, `.ats` project files, or deployment pipelines.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">3. User Responsibilities &amp; Azure Account Security</h2>
        <p>
          When utilizing the platform to design cloud infrastructure for Microsoft Azure or other target clouds:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[var(--tp-muted)]">
          <li>You are responsible for safeguarding your authentication credentials and API access tokens.</li>
          <li>You are solely responsible for reviewing generated Terraform code prior to applying it against production Azure subscriptions.</li>
          <li>Toporo provides advisory FinOps and security audits based on publicly available benchmarks and price lists; live billing depends on runtime cloud provider consumption.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">4. AI Architecture Copilot Acceptable Use</h2>
        <p>
          Our Architecture Copilot integrates Azure OpenAI models to synthesize topologies and remediate security findings. You agree not to
          submit malicious prompts, attempt model exfiltration, or generate infrastructure intentionally designed to conduct denial-of-service,
          unauthorized surveillance, or illicit cryptomining activities.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">5. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, Toporo and its affiliates shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages, including loss of data, cloud provider billing overages, or service interruptions
          resulting from infrastructure deployments.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--tp-main)]">6. Changes to Terms</h2>
        <p>
          We reserve the right to revise these Terms of Service at our sole discretion. We will indicate the date of the latest revisions at
          the top of this page. Continued use of Toporo constitutes acceptance of modified terms.
        </p>
      </section>
    </LegalLayout>
  );
};

