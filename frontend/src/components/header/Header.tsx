import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  DollarSign,
  Code2,
  Upload,
  Download,
  ChevronDown,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Settings,
  LayoutGrid,
  Copy,
  FileCode,
  FileJson,
  Image,
  Package,
  Sun,
  Moon,
  SlidersHorizontal,
  Grid,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';

// ─── Sub-components ────────────────────────────────────────────────────────

/** Project breadcrumb with inline editing */
const ProjectBreadcrumb: React.FC<{ name: string; onChange: (v: string) => void }> = ({ name, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim()) onChange(draft.trim());
    else setDraft(name);
  };

  return (
    <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-secondary)] font-medium">
      <span className="text-[var(--color-text-muted)]">Projects</span>
      <span className="text-[var(--color-text-muted)]">/</span>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(name); } }}
          className="bg-[var(--color-surface)] border border-[var(--color-primary)] outline-none text-[var(--color-text-primary)] font-semibold px-1.5 py-0.5 rounded-[var(--radius-sm)] w-44"
        />
      ) : (
        <button
          onClick={() => { setDraft(name); setEditing(true); }}
          className="font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded-[var(--radius-sm)] transition-colors truncate max-w-[180px] text-left"
          title="Click to rename project"
        >
          {name || 'Azure Architecture'}
        </button>
      )}
    </div>
  );
};

/** Status Lozenge Environment switcher */
type Env = 'dev' | 'staging' | 'prod';
const ENV_CONFIG: Record<Env, { label: string; badgeCls: string }> = {
  dev:     { label: 'DEV',     badgeCls: 'bg-[#DCFFF1] text-[#1F845A] dark:bg-[#143B2B] dark:text-[#4BCE97] border-[#1F845A]/20' },
  staging: { label: 'STAGING', badgeCls: 'bg-[#FFF7D6] text-[#9E6C00] dark:bg-[#332E1B] dark:text-[#F5CD47] border-[#9E6C00]/20' },
  prod:    { label: 'PROD',    badgeCls: 'bg-[#FFEDEB] text-[#CA3521] dark:bg-[#441C17] dark:text-[#FD9891] border-[#CA3521]/20' },
};

const EnvironmentSwitcher: React.FC = () => {
  const [env, setEnv] = useState<Env>('dev');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cfg = ENV_CONFIG[env];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] border text-[11px] font-bold tracking-wide uppercase transition-colors ${cfg.badgeCls}`}
      >
        <span>{cfg.label}</span>
        <ChevronDown className="w-2.5 h-2.5 opacity-70" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-36 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-panel z-50 overflow-hidden animate-fade-in-up py-1">
          {(Object.keys(ENV_CONFIG) as Env[]).map(e => (
            <button
              key={e}
              onClick={() => { setEnv(e); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[var(--color-surface-2)] ${e === env ? 'text-[var(--color-primary-light)] font-bold' : 'text-[var(--color-text-secondary)]'}`}
            >
              <span className={`px-1.5 py-0.2 rounded-[2px] text-[10px] ${ENV_CONFIG[e].badgeCls}`}>
                {ENV_CONFIG[e].label}
              </span>
              {e === env && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** Sync status indicator */
const SyncStatus: React.FC<{ status: 'synced' | 'unsaved' | 'syncing' | 'error' }> = ({ status }) => {
  const cfg = {
    synced:  { dot: 'synced',  label: 'Saved',      cls: 'text-[#1F845A] dark:text-[#4BCE97]' },
    unsaved: { dot: 'unsaved', label: 'Unsaved',    cls: 'text-[#9E6C00] dark:text-[#F5CD47]' },
    syncing: { dot: 'loading', label: 'Saving…',    cls: 'text-[var(--color-primary-light)]' },
    error:   { dot: 'error',   label: 'Sync Error', cls: 'text-[#CA3521] dark:text-[#FD9891]' },
  }[status];

  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-medium ${cfg.cls}`}>
      {status === 'syncing'
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <span className={`status-dot ${cfg.dot}`} />}
      <span className="hidden sm:inline">{cfg.label}</span>
    </div>
  );
};

/** Export dropdown button */
const ExportButton: React.FC<{ onExport: (type: string) => void }> = ({ onExport }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options = [
    { id: 'tf',    icon: FileCode, label: 'Export .tf files',     sub: 'Download Terraform HCL' },
    { id: 'zip',   icon: Package,  label: 'Export .zip bundle',   sub: 'All files + variables' },
    { id: 'json',  icon: FileJson, label: 'Export topology.json', sub: 'Canonical IR' },
    { id: 'png',   icon: Image,    label: 'Export as PNG',         sub: 'Canvas screenshot' },
    { id: 'copy',  icon: Copy,     label: 'Copy HCL to clipboard', sub: 'main.tf content' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="btn-ghost h-8 px-2.5 text-[12px]"
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-52 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-panel z-50 overflow-hidden animate-fade-in-up py-1">
          {options.map(({ id, icon: Icon, label, sub }) => (
            <button
              key={id}
              onClick={() => { onExport(id); setOpen(false); }}
              className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-[var(--color-surface-2)] transition-colors group"
            >
              <Icon className="w-3.5 h-3.5 mt-0.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] transition-colors shrink-0" />
              <div>
                <div className="text-[12px] font-medium text-[var(--color-text-primary)] transition-colors">{label}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">{sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Header ────────────────────────────────────────────────────────────

export const Header: React.FC<{
  isSplitView: boolean;
  toggleSplitView: () => void;
}> = ({ isSplitView, toggleSplitView }) => {
  const {
    topology,
    finopsSummary,
    securitySummary,
    toggleCopilot,
    runAutoLayout,
    openImport,
    themeMode,
    toggleThemeMode,
    isInspectorOpen,
    isInspectorPinned,
    toggleInspector,
  } = useTopologyStore() as any;

  const totalMonthly = finopsSummary?.totalMonthlyCostUsd ?? 0;
  const healthScore  = securitySummary?.score ?? 100;
  const criticalCount = securitySummary?.critical ?? 0;
  const highCount    = securitySummary?.high ?? 0;
  const totalAlerts  = criticalCount + highCount;

  const syncStatus: 'synced' | 'unsaved' | 'syncing' | 'error' =
    topology?.resources?.length === 0 ? 'unsaved' : 'synced';

  const handleProjectRename = (name: string) => {
    if ((useTopologyStore.getState() as any).renameProject) {
      (useTopologyStore.getState() as any).renameProject(name);
    }
  };

  const handleExport = (type: string) => {
    if (type === 'copy') {
      navigator.clipboard.writeText(topology?.generatedCode ?? '').catch(() => {});
    }
  };

  return (
    <header
      className="h-[50px] flex items-center justify-between px-3 gap-3 select-none z-20 shrink-0 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* ── Left: App Launcher + Brand Mark + Project Breadcrumbs + Env ── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* 9-dots App Switcher */}
        <button
          className="toolbar-btn w-7 h-7 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          title="App Switcher"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Studio Logo Mark */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-[3px] flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-primary)' }}
            title="Azure Cloud Topology Engine"
          >
            {/* Geometric logo symbol */}
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6 3L3 11.6L7.3 15.9L15.9 7.3L11.6 3Z" fill="white" fillOpacity="0.8"/>
              <path d="M12.4 21L21 12.4L16.7 8.1L8.1 16.7L12.4 21Z" fill="white"/>
            </svg>
          </div>

          <div className="hidden sm:flex flex-col justify-center leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[var(--color-text-primary)] tracking-tight">
                Topology Studio
              </span>
              <span className="text-[10px] font-semibold px-1 py-0.2 rounded-[2px] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                Cloud Console
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-[var(--color-border)] mx-1" />

        {/* Project Breadcrumb */}
        <div className="hidden md:flex items-center">
          <ProjectBreadcrumb
            name={topology?.metadata?.project_name || 'Azure Architecture'}
            onChange={handleProjectRename}
          />
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-5 bg-[var(--color-border)] mx-1" />

        {/* Environment + Git branch + Sync */}
        <div className="hidden lg:flex items-center gap-2">
          <EnvironmentSwitcher />
          <button className="flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            <GitBranch className="w-3 h-3 text-[var(--color-text-muted)]" />
            <span>main</span>
          </button>
          <SyncStatus status={syncStatus} />
        </div>
      </div>

      {/* ── Center: Metric Lozenges (FinOps & CIS Security) ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* FinOps Lozenge */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border bg-[#DCFFF1]/30 border-[#1F845A]/25 dark:bg-[#143B2B]/40 dark:border-[#4BCE97]/25"
        >
          <DollarSign className="w-3.5 h-3.5 text-[#1F845A] dark:text-[#4BCE97] shrink-0" />
          <span className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase">
            Cost
          </span>
          <span className="text-[12px] font-bold font-mono text-[#1F845A] dark:text-[#4BCE97]">
            ${totalMonthly.toFixed(2)}
            <span className="text-[10px] font-normal opacity-75">/mo</span>
          </span>
        </div>

        {/* Security Health Lozenge */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border cursor-pointer transition-colors ${
            healthScore >= 90
              ? 'bg-[#E9F2FF]/40 border-[#0052CC]/25 dark:bg-[#0C294D]/40 dark:border-[#579DFF]/25'
              : 'bg-[#FFEDEB]/40 border-[#CA3521]/25 dark:bg-[#441C17]/40 dark:border-[#FD9891]/25'
          }`}
          title={totalAlerts > 0 ? `${criticalCount} critical, ${highCount} high severity findings` : 'No security issues found'}
        >
          {healthScore >= 90
            ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary-light)] shrink-0" />
            : <AlertTriangle className="w-3.5 h-3.5 text-[#CA3521] dark:text-[#FD9891] shrink-0" />}
          <span className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase">
            CIS
          </span>
          <span className="text-[12px] font-bold font-mono text-[var(--color-text-primary)]">
            {healthScore}
            <span className="text-[10px] font-normal opacity-75">/100</span>
          </span>
          {totalAlerts > 0 && (
            <span className="text-[10px] font-bold px-1 rounded bg-[#CA3521] text-white">
              {totalAlerts}
            </span>
          )}
        </div>
      </div>

      {/* ── Right: Action Toolbar & Primary Copilot CTA ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Auto Layout */}
        <button
          onClick={runAutoLayout}
          title="Auto-arrange architecture (A)"
          className="toolbar-btn"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Split View Toggle */}
        <button
          onClick={toggleSplitView}
          title="Toggle Terraform HCL split editor (⌘\\)"
          className={`toolbar-btn ${isSplitView ? 'active' : ''}`}
        >
          <Code2 className="w-4 h-4" />
        </button>

        {/* Inspector Drawer Toggle */}
        <button
          onClick={() => toggleInspector()}
          title={isInspectorOpen || isInspectorPinned ? "Hide Details Panel (I)" : "Show Details Panel (I)"}
          className={`toolbar-btn ${isInspectorOpen || isInspectorPinned ? 'active' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleThemeMode}
          title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Theme`}
          className="toolbar-btn"
        >
          {themeMode === 'light' ? (
            <Moon className="w-4 h-4 text-[var(--color-text-secondary)]" />
          ) : (
            <Sun className="w-4 h-4 text-[#F5CD47]" />
          )}
        </button>

        {/* Settings */}
        <button
          title="Project Settings"
          className="toolbar-btn"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="toolbar-divider" />

        {/* Import */}
        <button
          onClick={() => openImport?.()}
          className="btn-ghost h-8 px-2.5 text-[12px]"
          title="Import Terraform or Azure subscription"
        >
          <Upload className="w-3.5 h-3.5" />
          Import
        </button>

        {/* Export */}
        <ExportButton onExport={handleExport} />

        {/* Divider */}
        <div className="toolbar-divider" />

        {/* AI Copilot Primary CTA */}
        <button
          onClick={() => toggleCopilot(true)}
          className="btn-primary h-8 px-3 text-[12px] font-semibold"
          title="Ask Architecture AI Copilot (⌘/)"
        >
          <Sparkles className="w-3.5 h-3.5 text-white/90" />
          AI Copilot
        </button>
      </div>
    </header>
  );
};
