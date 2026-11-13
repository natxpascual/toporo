import React from 'react';
import { ArrowLeft, Shield, Lock, Cookie, Eye } from 'lucide-react';
import { ToporoLogo } from '../icons/ToporoLogo';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  activePath: '/terms' | '/privacy' | '/cookies' | '/accessibility';
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated,
  activePath,
  onNavigate,
  children,
}) => {
  const legalLinks = [
    { label: 'Terms of Service', route: '/terms', icon: Shield },
    { label: 'Privacy Policy', route: '/privacy', icon: Lock },
    { label: 'Cookie Policy', route: '/cookies', icon: Cookie },
    { label: 'Accessibility', route: '/accessibility', icon: Eye },
  ];

  return (
    <div className="tp-canvas flex flex-col">
      <div className="tp-frame flex-1 flex flex-col">
        {/* Topbar matching Homepage Sticky Blueprint Header */}
        <header className="tp-nav sticky top-0 z-50 px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => onNavigate('/')}
                className="inline-flex items-center gap-2.5 cursor-pointer"
                title="Return to Home"
              >
                <ToporoLogo className="w-8 h-8 shrink-0" />
                <span className="text-lg font-bold tracking-tight text-[var(--tp-main)]">
                  Toporo<sup className="text-[10px] font-medium ml-0.5">™</sup>
                </span>
              </button>

              <span className="text-[var(--tp-line)] hidden sm:inline">/</span>

              <button
                onClick={() => onNavigate('/')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--tp-muted)] hover:text-[var(--tp-main)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/login')}
                className="px-3 py-1.5 text-sm font-medium text-[var(--tp-main)] hover:opacity-75 transition-opacity cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('/signup')}
                className="tp-btn tp-btn-dark !py-2 !px-3.5 !text-sm"
              >
                Start Building
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {/* Header Hero */}
          <div className="tp-cell py-10 sm:py-12 border-b border-[var(--tp-line)]">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {legalLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => onNavigate(item.route)}
                    className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0b1d0b] text-[#a7e68f] border-[#0b1d0b]'
                        : 'bg-[var(--tp-surface)] text-[var(--tp-muted)] border-[var(--tp-line)] hover:text-[var(--tp-main)] hover:border-[var(--tp-main)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <h1 className="tp-h2 text-[var(--tp-main)] mb-3">{title}</h1>
            <p className="tp-body max-w-3xl">{subtitle}</p>
            <div className="mt-4 text-xs font-mono text-[var(--tp-green)]">
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Prose Content */}
          <div className="tp-cell py-10 sm:py-12 max-w-4xl text-[var(--tp-muted)] leading-relaxed space-y-8 text-sm sm:text-[15px]">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 text-xs text-[var(--tp-muted)]">
          <div className="tp-cell flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ToporoLogo className="w-5 h-5 shrink-0" />
              <span className="font-bold text-[var(--tp-main)]">Toporo™</span>
              <span>· Cloud Topology &amp; Terraform Engine</span>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <button onClick={() => onNavigate('/')} className="hover:text-[var(--tp-main)] transition-colors cursor-pointer">
                Home
              </button>
              <button onClick={() => onNavigate('/terms')} className="hover:text-[var(--tp-main)] transition-colors cursor-pointer">
                Terms of Service
              </button>
              <button onClick={() => onNavigate('/privacy')} className="hover:text-[var(--tp-main)] transition-colors cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => onNavigate('/cookies')} className="hover:text-[var(--tp-main)] transition-colors cursor-pointer">
                Cookie Policy
              </button>
              <button onClick={() => onNavigate('/accessibility')} className="hover:text-[var(--tp-main)] transition-colors cursor-pointer">
                Accessibility
              </button>
              <span>© {new Date().getFullYear()} Toporo™</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

