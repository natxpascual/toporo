import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, Crown, GraduationCap } from 'lucide-react';
import { CookieBanner } from '../legal/CookieBanner';
import { AzureIcon } from '../icons/AzureIcons';
import { ToporoLogo } from '../icons/ToporoLogo';
import { FeatureStage } from './FeatureStages';
import {
  HeroArchitecturalMatrix,
  AgentCopilotShowcase,
  HowItWorksBoard,
} from './InteractiveModules';
import {
  HERO_STANDARDS,
  FEATURE_SECTIONS,
  BENTO_CAPABILITIES,
  AZURE_ECOSYSTEM,
  PRICING_TIERS,
  FAQ_ITEMS,
  WALL_OF_LOVE,
} from './brandData';

interface BrandSiteProps {
  onNavigate: (route: string) => void;
}

const BentoWireframeSvg: React.FC<{ variant: 'elk' | 'sandbox' | 'export'; strokeColor: string }> = ({
  variant,
  strokeColor,
}) => {
  if (variant === 'elk') {
    return (
      <svg
        className="pointer-events-none absolute -top-8 right-5 w-64 h-64 opacity-70"
        viewBox="0 0 280 280"
        fill="none"
        aria-hidden="true"
      >
        <ellipse cx="140" cy="70" rx="88" ry="26" stroke={strokeColor} strokeWidth="1" />
        <ellipse cx="140" cy="112" rx="88" ry="26" stroke={strokeColor} strokeWidth="1" />
        <ellipse cx="140" cy="154" rx="88" ry="26" stroke={strokeColor} strokeWidth="1" />
        <path d="M52 70v84M228 70v84" stroke={strokeColor} strokeWidth="1" />
      </svg>
    );
  }
  if (variant === 'sandbox') {
    return (
      <svg
        className="pointer-events-none absolute -top-8 right-5 w-64 h-64 opacity-70"
        viewBox="0 0 280 280"
        fill="none"
        aria-hidden="true"
      >
        <rect x="52" y="24" width="176" height="176" rx="18" stroke={strokeColor} strokeWidth="1" />
        <rect x="78" y="50" width="124" height="124" rx="14" stroke={strokeColor} strokeWidth="1" />
        <rect x="106" y="78" width="68" height="68" rx="10" stroke={strokeColor} strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg
      className="pointer-events-none absolute -top-8 right-5 w-64 h-64 opacity-70"
      viewBox="0 0 280 280"
      fill="none"
      aria-hidden="true"
    >
      <polygon
        points="140,72 172,91 172,129 140,148 108,129 108,91"
        stroke={strokeColor}
        strokeWidth="1"
      />
      <circle cx="72" cy="52" r="20" stroke={strokeColor} strokeWidth="1" />
      <circle cx="208" cy="52" r="20" stroke={strokeColor} strokeWidth="1" />
      <circle cx="140" cy="196" r="20" stroke={strokeColor} strokeWidth="1" />
      <path d="M88 64l24 27M192 64l-24 27M140 148v28" stroke={strokeColor} strokeWidth="1" />
    </svg>
  );
};

export const BrandSite: React.FC<BrandSiteProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Global keyboard shortcut matching blueprint [S]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        onNavigate('/signup');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  const ecosystemMarqueeItems = [...AZURE_ECOSYSTEM, ...AZURE_ECOSYSTEM];
  const marqueeItems = [...WALL_OF_LOVE, ...WALL_OF_LOVE];

  return (
    <div className="tp-canvas">
      <main className="tp-frame">
        {/* ─── 01. Sticky Blueprint Navbar (Single Canonical Light Theme) ── */}
        <nav className="tp-nav sticky top-0 z-50 px-4">
          <div className="flex items-center justify-between py-3">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2.5 text-left cursor-pointer"
            >
              <ToporoLogo className="w-8 h-8 shrink-0" />
              <span className="text-lg font-bold tracking-tight text-[var(--tp-main)]">
                Toporo<sup className="text-[10px] font-medium ml-0.5">™</sup>
              </span>
            </button>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => scrollToSection('screenshots')}
                className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-[var(--tp-muted)] hover:text-[var(--tp-main)] transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-[var(--tp-muted)] hover:text-[var(--tp-main)] transition-colors cursor-pointer"
              >
                Architecture
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('pricing')}
                className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-[var(--tp-muted)] hover:text-[var(--tp-main)] transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button
                id="topbar-login-btn"
                type="button"
                onClick={() => onNavigate('/login')}
                className="px-3 py-1.5 text-sm font-medium text-[var(--tp-main)] hover:opacity-75 transition-opacity cursor-pointer"
              >
                Log In
              </button>
              <button
                id="topbar-get-started-btn"
                type="button"
                onClick={() => onNavigate('/signup')}
                className="tp-btn tp-btn-dark !py-2 !px-3.5 !text-sm"
              >
                <span>Start Building</span>
                <kbd className="hidden sm:inline-flex tp-kbd border border-white/25 bg-white/10 text-stone-200">
                  S
                </kbd>
              </button>
            </div>
          </div>
        </nav>

        {/* ─── 02. Deep Forest-Black Hero Island (#0b1d0b) ──────────────────── */}
        <section className="tp-fill">
          <div className="overflow-hidden rounded-xl bg-[#0b1d0b] p-4 max-sm:p-3 text-white">
            <div className="grid border border-white/30 lg:grid-cols-2">
              {/* Left Cell */}
              <div className="px-12 py-10 max-sm:px-6 max-sm:py-8 flex flex-col justify-between">
                <div>
                  <h1 className="tp-h1 max-w-[16ch] text-white">
                    Design Azure topology. Sync Terraform. Ship secure.
                  </h1>

                  <p className="mt-6 max-w-[38ch] text-xl leading-snug text-stone-200">
                    Connect visual diagrams directly to live Terraform code. Catch CIS security flaws and cost spikes before deployment.
                  </p>
                </div>

                <div className="mt-8">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <button
                      id="hero-get-started-btn"
                      type="button"
                      onClick={() => onNavigate('/signup')}
                      className="tp-btn tp-btn-light"
                    >
                      <span>Start building</span>
                      <kbd className="tp-kbd border border-stone-300 bg-stone-100 text-stone-600">S</kbd>
                    </button>
                  </div>

                  <p className="mt-5 text-sm text-white/70">
                    Zero Azure credentials required. Instant visual &amp; Terraform workspace.
                  </p>
                </div>
              </div>

              {/* Right Cell: 2x4 Architectural Grid */}
              <HeroArchitecturalMatrix />
            </div>
          </div>
        </section>

        {/* ─── 03. Standards Logo Bar + Featured Quote w/ #F1ED92 Highlighter ─ */}
        <section>
          <div className="tp-cell pt-16 pb-3 text-center max-sm:pt-12">
            <span className="font-mono text-xs sm:text-sm text-[var(--tp-muted)]">
              Built on verified DevSecOps &amp; IaC foundations
            </span>
          </div>

          <div className="flex items-stretch border-t border-[var(--tp-line)]">
            {HERO_STANDARDS.map((item, idx) => {
              const responsiveClass =
                idx === 2
                  ? 'max-[500px]:hidden'
                  : idx === 3
                    ? 'max-[680px]:hidden'
                    : idx === 4
                      ? 'max-[860px]:hidden'
                      : '';
              return (
                <div
                  key={item.label}
                  className={`flex-1 px-4 py-8 flex flex-col items-center justify-center text-center ${idx > 0 ? 'border-l border-[var(--tp-line)]' : ''
                    } ${responsiveClass}`}
                >
                  <span className="font-mono text-sm font-bold text-[var(--tp-main)]">{item.label}</span>
                  <span className="text-xs text-[var(--tp-muted)] mt-1">{item.sub}</span>
                </div>
              );
            })}
          </div>

          <div className="tp-fill tp-divide">
            <div className="flex items-start justify-between gap-10 px-16 py-20 max-md:flex-col max-sm:px-7 max-sm:py-12">
              <blockquote className="max-w-[700px]">
                <p className="text-[22px] max-sm:text-[18px] font-medium leading-[1.45] text-[var(--tp-main)]">
                  &ldquo;We used to maintain static diagrams in shared docs that went stale within a week of our first pull request. With Toporo,{' '}
                  <mark className="inline bg-[#F1ED92] text-[#1c1917] font-semibold px-1.5 py-0.5 rounded-[4px] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                    our canvas topology, security guardrails, and Terraform code stay locked in exact sync
                  </mark>{' '}
                  from initial design through production review.&rdquo;
                </p>
                <footer className="mt-6 text-sm font-mono text-[var(--tp-muted)]">
                  Marcus Bennett — Principal Cloud Security Architect
                </footer>
              </blockquote>

              {/* 2x2 Architectural Stamp Block (200x200px exact) */}
              <div className="grid grid-cols-2 shrink-0 outline outline-1 outline-[var(--tp-line)]">
                <div className="w-[100px] h-[100px] bg-[#0b1d0b] text-[#a7e68f] flex items-center justify-center font-mono text-xl font-bold border-r border-b border-[var(--tp-line)]">
                  MB
                </div>
                <div className="w-[100px] h-[100px] bg-[var(--tp-surface)] flex items-center justify-center border-b border-[var(--tp-line)] text-[var(--tp-main)]/25 font-serif text-5xl">
                  &ldquo;
                </div>
                <div className="w-[100px] h-[100px] bg-[var(--tp-surface)] flex items-center justify-center border-r border-[var(--tp-line)]">
                  <ToporoLogo className="w-10 h-10" />
                </div>
                <div className="w-[100px] h-[100px] bg-[var(--tp-surface)] flex flex-col items-center justify-center p-2 text-center font-mono text-[11px] font-semibold text-[var(--tp-muted)]">
                  <span>CIS v2.0</span>
                  <span className="text-[var(--tp-green)] mt-0.5">VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 04–06. Feature Stages 01, 02, 03 (#d6d3d1 Sunken Cards) ─────── */}
        <div id="screenshots" className="divide-y divide-[var(--tp-line)]">
          {FEATURE_SECTIONS.map((feat) => (
            <section key={feat.index} id={feat.anchorId} className="tp-fill">
              <div className="rounded-xl bg-[var(--tp-sunken)] overflow-hidden">
                <div className="flex items-baseline gap-6 px-16 pt-16 max-md:flex-col max-md:gap-2 max-sm:px-7 max-sm:pt-8">
                  <span className="font-mono text-2xl text-[var(--tp-muted)] shrink-0">{feat.index}</span>
                  <div>
                    <h2 className="tp-h2 text-[var(--tp-main)]">{feat.title}</h2>
                    <p className="mt-5 max-w-[58ch] text-xl leading-snug text-[var(--tp-muted)]">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <FeatureStage stageKey={feat.stageKey} />
              </div>
            </section>
          ))}
        </div>

        {/* ─── 07. Feature 04 — AI Copilot CLI Showcase (#171717 Dark Island) */}
        <AgentCopilotShowcase />

        {/* ─── 08. 3-Card Bento Grid ("Not just a Diagramming Canvas") ─────── */}
        <section>
          <div className="tp-cell pt-24 pb-10 max-sm:py-10">
            <h2 className="tp-h2 text-[var(--tp-main)]">Not just static cloud boxes</h2>
          </div>

          <div className="tp-fill grid grid-cols-3 gap-2 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {BENTO_CAPABILITIES.map((card) => (
              <div key={card.id} className="tp-card">
                <BentoWireframeSvg variant={card.variant} strokeColor={card.strokeColor} />
                <div className="relative z-10 mt-auto flex flex-col gap-4">
                  <span className="tp-card-tag">
                    <span style={{ color: card.tagAccentColor }}>✲</span>
                    <span>{card.tag}</span>
                  </span>
                  <p className="text-base leading-snug text-[var(--tp-main)]">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 09. How It Works Architectural Schematic Board (#2b5a43) ────── */}
        <HowItWorksBoard />

        {/* ─── 10. Azure & IaC Ecosystem Logos Strip (Single-Line Marquee) ── */}
        <section className="py-10 max-sm:py-8 text-center overflow-hidden">
          <div className="tp-cell">
            <p className="text-xs sm:text-sm font-mono text-[var(--tp-muted)]">
              Engineered natively for core Azure &amp; Terraform primitives
            </p>
          </div>
          <div className="tp-marquee mt-6">
            <div className="tp-marquee-track tp-marquee-track-ecosystem">
              {ecosystemMarqueeItems.map((svc, idx) => (
                <div
                  key={`${svc.name}-${idx}`}
                  className="inline-flex shrink-0 items-center gap-2.5 rounded-lg border border-[var(--tp-line)] bg-[var(--tp-surface)] px-3.5 py-2 font-mono text-sm font-semibold text-[var(--tp-main)] whitespace-nowrap"
                >
                  <AzureIcon type={svc.iconType} size={18} className="shrink-0" />
                  <span>{svc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 11. Built for Cloud Teams Dark Island (#171717) ─────────────── */}
        <section className="tp-fill">
          <div className="overflow-hidden rounded-xl bg-neutral-900 px-16 pt-16 max-sm:px-6 max-sm:pt-6 text-white">
            <div className="flex items-start justify-between gap-16 max-md:flex-col max-sm:gap-6">
              <p className="tp-h4 max-w-2xl text-white">
                Built for Cloud Teams.{' '}
                <span className="text-stone-400">
                  Shared Azure blueprints, live CIS benchmark scoring, real-time FinOps budgets, and modular Terraform exports.
                </span>
              </p>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('/studio')}
                  className="tp-btn tp-btn-light"
                >
                  Open Team Studio
                </button>
                <p className="mt-4 text-xs font-mono text-stone-400">
                  7-day full workspace access. Zero setup required.
                </p>
              </div>
            </div>

            <div className="mt-14 max-sm:mt-8 aspect-[16/8] overflow-hidden lg:px-14">
              <img
                src="/screenshots/studio-security-guardrails.png"
                alt="Toporo Studio workspace with split Terraform HCL2 code inspector"
                className="w-full h-auto rounded-t-xl border border-b-0 border-white/15 max-sm:scale-125 origin-top-left"
              />
            </div>
          </div>
        </section>

        {/* ─── 12. Pricing & Editions Matrix (Option C: 3-Col Balanced Grid) ──── */}
        <section id="pricing" className="scroll-mt-4">
          <div className="tp-cell pt-24 pb-10 max-sm:py-10">
            <h2 className="tp-h2 max-w-[26ch] text-[var(--tp-main)]">
              Simple pricing for solo architects, teams, and research labs
            </h2>
            <p className="tp-body mt-4">
              Start any workspace immediately with zero cloud credentials.{' '}
              <button
                type="button"
                onClick={() => onNavigate('/signup')}
                className="text-[var(--tp-blue)] underline underline-offset-4 cursor-pointer"
              >
                Create an account
              </button>
              .
            </p>

            {/* Billing Cycle Segmented Toggle */}
            <div className="mt-6 inline-flex gap-1 rounded-xl bg-[var(--tp-sunken)] p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${billingCycle === 'monthly'
                  ? 'bg-[var(--tp-surface)] text-[var(--tp-main)] shadow-xs'
                  : 'text-[var(--tp-muted)] hover:text-[var(--tp-main)]'
                  }`}
              >
                Pay monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 cursor-pointer ${billingCycle === 'annual'
                  ? 'bg-[var(--tp-surface)] text-[var(--tp-main)] shadow-xs'
                  : 'text-[var(--tp-muted)] hover:text-[var(--tp-main)]'
                  }`}
              >
                <span>Pay yearly</span>
                <span className="font-mono text-xs text-[var(--tp-green)]">Save 24%</span>
              </button>
            </div>
          </div>

          {/* 3-Column Hairline Grid via gap-px over bg-[var(--tp-line)] */}
          <div className="tp-fill">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-[var(--tp-line)] max-md:grid-cols-1">
              {PRICING_TIERS.map((tier) => {
                const displayPrice =
                  billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
                const isPro = tier.id === 'pro';
                const isAcademic = tier.id === 'academic';
                const annualTotal = tier.annualPrice * 12;

                return (
                  <div
                    key={tier.id}
                    className={`px-8 pt-6 pb-8 max-sm:p-6 flex flex-col ${isPro
                      ? 'bg-[#fafaf9] border-t-2 border-t-[var(--tp-amber)]'
                      : 'bg-[var(--tp-surface)]'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="inline-flex items-center gap-2 text-base font-semibold text-[var(--tp-main)]">
                        {isPro && (
                          <Crown
                            className="w-4 h-4 text-[var(--tp-amber)] fill-[var(--tp-pro-pill)] shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {isAcademic && (
                          <GraduationCap
                            className="w-5 h-5 text-[#7c3aed] fill-[#c4b4ff] shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span>{tier.name}</span>
                      </h3>
                      {tier.badge && (
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--tp-pro-ink)] ${isAcademic ? 'bg-[#c4b4ff]' : 'bg-[var(--tp-pro-pill)]'
                            }`}
                        >
                          {tier.badge}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      <span className="text-3xl font-semibold tracking-tight text-[var(--tp-main)]">
                        {tier.customPriceLabel ?? `$${displayPrice}`}
                      </span>
                      {tier.periodLabel && (
                        <span className="text-sm text-[var(--tp-muted)]">{tier.periodLabel}</span>
                      )}
                      {billingCycle === 'annual' && annualTotal > 0 && (
                        <span className="text-xs font-mono text-[var(--tp-muted)]">
                          · billed ${annualTotal}/yr
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-[var(--tp-muted)] min-h-[40px]">
                      {tier.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => onNavigate(tier.route)}
                      className={`mt-6 w-full !py-2.5 !text-sm tp-btn ${isPro ? 'tp-btn-dark' : 'tp-btn-outline'
                        }`}
                    >
                      {tier.ctaLabel}
                    </button>

                    <div className="mt-6 pt-5 border-t border-[var(--tp-line)] text-sm">
                      {tier.introLine && (
                        <p className="font-medium text-[var(--tp-main)] text-xs mb-3">{tier.introLine}</p>
                      )}
                      <div className="space-y-3">
                        {tier.features.map((f) => (
                          <div key={f.title} className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-[var(--tp-green)] shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[var(--tp-main)] font-medium leading-tight">{f.title}</div>
                              {f.subtitle && (
                                <div className="text-xs text-[var(--tp-muted)] mt-0.5">{f.subtitle}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 13. Asymmetric 0.8fr / 1.4fr FAQ Accordion ────────────────────── */}
        <section id="faq" className="tp-cell py-20 max-sm:py-14">
          <div className="grid grid-cols-[0.8fr_1.4fr] gap-12 max-lg:grid-cols-1 max-lg:gap-6">
            <div>
              <h2 className="tp-h2 text-[var(--tp-main)]">Frequently asked questions</h2>
            </div>

            <div className="border-b border-[var(--tp-line)]">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={item.question} className="border-t border-[var(--tp-line)]">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full py-4 flex items-center justify-between gap-4 text-left text-[18px] font-medium text-[var(--tp-main)] hover:opacity-75 transition-opacity cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--tp-muted)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-5 pr-8 text-[15px] leading-relaxed text-[var(--tp-muted)]">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 14. Wall of Love Sunken Card + Edge-Masked Marquee ──────────── */}
        <section className="tp-fill">
          <div className="rounded-xl bg-[var(--tp-sunken)] p-10 max-sm:p-5 overflow-hidden">
            <h2 className="tp-h2 text-3xl text-[var(--tp-main)]">What engineers say.</h2>

            <div className="tp-marquee -mx-10 max-sm:-mx-5 mt-8">
              <div className="tp-marquee-track">
                {marqueeItems.map((card, i) => (
                  <div
                    key={`${card.handle}-${i}`}
                    className="w-72 shrink-0 rounded-xl bg-[var(--tp-bg)] px-5 py-4 border border-black/5 flex flex-col justify-between"
                  >
                    <p className="text-sm leading-relaxed text-[var(--tp-main)]">
                      {card.mentionHighlight ? (
                        <>
                          {card.quote.split(card.mentionHighlight)[0]}
                          <span className="rounded-md bg-[#1b8a4b]/10 px-1 font-mono text-xs text-[#1b8a4b]">
                            {card.mentionHighlight}
                          </span>
                          {card.quote.split(card.mentionHighlight)[1]}
                        </>
                      ) : (
                        card.quote
                      )}
                    </p>
                    <div className="mt-4 pt-3 border-t border-[var(--tp-line)]">
                      <div className="text-sm font-semibold text-[var(--tp-main)]">{card.name}</div>
                      <div className="text-xs font-mono text-[var(--tp-muted)]">
                        {card.handle} · {card.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 15. Bottom High-Impact Forest CTA (#0b1d0b + Mint Button) ───── */}
        <section className="tp-fill">
          <div className="relative overflow-hidden rounded-xl bg-[#0b1d0b] px-12 py-14 max-sm:px-6 max-sm:py-10 text-white">
            <div className="tp-pixel-horizon pointer-events-none absolute inset-x-0 bottom-0 h-36" aria-hidden="true" />

            <div className="relative z-10 flex items-start justify-between gap-12 max-lg:flex-col">
              <p className="tp-h4 max-w-xl text-white">
                Visual clarity. Exact HCL2.{' '}
                <span className="text-stone-400">
                  Zero-drift architecture, instant CIS audits, and live FinOps in one studio.
                </span>
              </p>

              <div className="shrink-0">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('/signup')}
                    className="tp-btn tp-btn-green"
                  >
                    <span>Start building</span>
                    <kbd className="tp-kbd border border-[#0b1d0b]/25 bg-black/10 text-[#0b1d0b]">S</kbd>
                  </button>
                </div>

                <p className="mt-4 text-xs font-mono text-white/65">
                  Instant browser workspace. Export Terraform bundles anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 16. Structural 3-Column Newspaper Footer ────────────────────── */}
        <footer className="py-14">
          <div className="tp-cell flex items-start justify-between gap-12 max-lg:flex-col">
            <div className="lg:flex-1 max-w-xs">
              <div className="inline-flex items-center gap-2.5">
                <ToporoLogo className="w-7 h-7" />
                <span className="text-base font-bold tracking-tight text-[var(--tp-main)]">Toporo™</span>
              </div>
              <p className="mt-3 text-sm text-[var(--tp-muted)] leading-relaxed">
                Design cloud topologies, audit CIS Azure v2.0 compliance, and forecast Azure spend from a single synchronized workspace.
              </p>
            </div>

            <div className="w-full max-w-[42rem] columns-2 gap-x-8 md:columns-3 text-sm">
              <div className="mb-8 break-inside-avoid">
                <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--tp-main)]">
                  Platform
                </div>
                <ul className="mt-3 space-y-2 text-[var(--tp-muted)]">
                  <li>
                    <button type="button" onClick={() => onNavigate('/studio')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      Topology Studio
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => scrollToSection('visual-studio')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      Terraform Sync Engine
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => scrollToSection('code-inspector')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      CIS Guardrails
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => scrollToSection('finops-telemetry')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      FinOps Telemetry
                    </button>
                  </li>
                </ul>
              </div>

              <div className="mb-8 break-inside-avoid">
                <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--tp-main)]">
                  Workflow
                </div>
                <ul className="mt-3 space-y-2 text-[var(--tp-muted)]">
                  <li>
                    <button type="button" onClick={() => scrollToSection('ai-copilot')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      AI Architecture Copilot
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => scrollToSection('how-it-works')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      How It Works
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => scrollToSection('pricing')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      Editions &amp; Pricing
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => scrollToSection('faq')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      FAQ
                    </button>
                  </li>
                </ul>
              </div>

              <div className="mb-8 break-inside-avoid">
                <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--tp-main)]">
                  Account
                </div>
                <ul className="mt-3 space-y-2 text-[var(--tp-muted)]">
                  <li>
                    <button type="button" onClick={() => onNavigate('/signup')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      Sign Up Free
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => onNavigate('/login')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      Log In
                    </button>
                  </li>
                </ul>
              </div>

              <div className="mb-8 break-inside-avoid">
                <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--tp-main)]">
                  Legal &amp; Trust
                </div>
                <ul className="mt-3 space-y-2 text-[var(--tp-muted)]">
                  <li>
                    <button type="button" onClick={() => onNavigate('/terms')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => onNavigate('/privacy')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => onNavigate('/cookies')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      Cookie Policy
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => onNavigate('/accessibility')} className="hover:text-[var(--tp-main)] cursor-pointer">
                      Accessibility
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-[var(--tp-line)]">
            <div className="tp-cell pt-6 text-sm text-[var(--tp-muted)] flex flex-wrap items-center justify-between gap-4">
              <span>© {new Date().getFullYear()} Toporo™. Azure Cloud Topology Engine.</span>
              <span className="font-mono text-xs">ISO/IEC 25010 Evaluated · CIS Azure v2.0 Ready</span>
            </div>
          </div>
        </footer>
      </main>

      {/* ─── Legal Compliance Cookie Consent Banner ─────────────────────────── */}
      <CookieBanner onNavigate={onNavigate} />
    </div>
  );
};
