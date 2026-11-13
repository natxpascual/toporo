import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  DollarSign,
  Code2,
  Upload,
  Download,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  FileCode,
  FileBox,
  Image,
  Package,
  Sun,
  Moon,
  SlidersHorizontal,
  FilePlus,
  Undo2,
  Redo2,
  LayoutGrid,
  Trash2,
  Check,
  Map,
  Grid3x3,
  Magnet,
  Layers,
  Crown,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ToporoLogo } from '../icons/ToporoLogo';
import { ExportProjectModal } from '../modals/ExportProjectModal';
import {
  exportProjectFile,
  exportTerraformFile,
  exportProjectZip,
  exportDiagramPng,
  copyTerraformCode,
} from '../../utils/exportUtils';

// ─── Project Title with inline editing ──────────────────────────────────────

const ProjectTitle: React.FC<{ name: string; onChange: (v: string) => void }> = ({ name, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(name);
  }, [name]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) {
      onChange(trimmed);
    } else {
      setDraft(name);
    }
  };

  return (
    <div className="flex items-center">
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setEditing(false);
              setDraft(name);
            }
          }}
          className="bg-[var(--color-surface)] border border-[var(--color-primary)] outline-none text-[var(--color-text-primary)] font-semibold text-[13px] px-2 py-0.5 rounded-[var(--radius-sm)] w-48 shadow-xs"
        />
      ) : (
        <button
          onClick={() => {
            setDraft(name);
            setEditing(true);
          }}
          aria-label="Project name"
          data-testid="project-name-btn"
          className="font-bold text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] px-2 py-1 rounded-[var(--radius-sm)] transition-colors truncate max-w-[210px] text-left border border-transparent hover:border-[var(--color-border)]"
          title="Click to rename project"
        >
          {name || 'Untitled Project'}
        </button>
      )}
    </div>
  );
};

// ─── Sync Status Indicator ──────────────────────────────────────────────────

const SyncStatusBadge: React.FC<{ isSyncing: boolean; isSaved: boolean }> = ({ isSyncing, isSaved }) => {
  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary-light)]">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="hidden sm:inline">Saving…</span>
      </div>
    );
  }

  if (isSaved) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1F845A] dark:text-[#4BCE97]">
        <span className="w-2 h-2 rounded-full bg-[#1F845A] dark:bg-[#4BCE97] shadow-xs" />
        <span className="hidden sm:inline">Saved</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#9E6C00] dark:text-[#F5CD47]">
      <span className="w-2 h-2 rounded-full bg-[#9E6C00] dark:bg-[#F5CD47] animate-pulse" />
      <span className="hidden sm:inline">Unsaved</span>
    </div>
  );
};

// ─── Canva-Style Menu Bar Dropdown ──────────────────────────────────────────

const MenuDropdown: React.FC<{
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ label, isOpen, onToggle, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={`px-2 py-1 rounded-[var(--radius-sm)] text-[12px] font-semibold transition-colors flex items-center gap-1 ${
          isOpen
            ? 'bg-[var(--color-surface-2)] text-[var(--color-primary-light)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
        }`}
      >
        <span>{label}</span>
      </button>

      {isOpen && (
        <div
          className="dropdown-menu absolute top-full left-0 mt-1 min-w-[210px] rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl z-50 py-1 animate-fade-in"
          onClick={() => onClose()}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Main Header Component ──────────────────────────────────────────────────

export const Header: React.FC<{
  isSplitView: boolean;
  toggleSplitView: () => void;
  onNavigate?: (route: string) => void;
}> = ({ isSplitView, toggleSplitView, onNavigate }) => {
  const {
    topology,
    finopsSummary,
    securitySummary,
    toggleCopilot,
    openImport,
    themeMode,
    toggleThemeMode,
    isInspectorOpen,
    isInspectorPinned,
    toggleInspector,
    openInspector,
    setActiveTab,
    isSaved,
    isSyncing,
    renameProject,
    resetProject,
    clearCanvas,
    undo,
    redo,
    history,
    future,
    runAutoLayout,
    showMiniMap,
    toggleMiniMap,
    viewMode,
    setViewMode,
    gridMode,
    cycleGridMode,
    snapToGrid,
    toggleSnapToGrid,
    generatedCode,
  } = useTopologyStore() as any;

  // Modals & Menu Dropdown states
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'view' | 'export' | null>(null);
  const [isExportProjectModalOpen, setIsExportProjectModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { user, isElevatedAdminSession, logout } = useAuthStore();
  const isProPlan = user?.effectivePlan === 'pro';
  const isFreePlan = !isProPlan;

  const projectName = topology?.metadata?.project_name || 'Untitled Project';

  const totalMonthly = finopsSummary?.totalMonthlyCostUsd ?? 0;
  const healthScore = securitySummary?.score ?? 100;
  const criticalCount = securitySummary?.critical ?? 0;
  const highCount = securitySummary?.high ?? 0;
  const totalAlerts = criticalCount + highCount;

  const handleExportOption = async (type: string) => {
    setActiveMenu(null);
    if (type === 'project') {
      setIsExportProjectModalOpen(true);
    } else if (type === 'tf') {
      exportTerraformFile(generatedCode, projectName, 'main.tf');
    } else if (type === 'zip') {
      exportProjectZip(generatedCode, topology, projectName);
    } else if (type === 'png') {
      await exportDiagramPng(topology, projectName, themeMode);
    } else if (type === 'copy') {
      const ok = await copyTerraformCode(generatedCode);
      if (ok) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  return (
    <>
      <header
        className="h-[50px] flex items-center justify-between px-3 gap-3 select-none z-30 shrink-0 border-b relative"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* ── Left: Home Icon + Canva-Inspired Menu Bar + Project Title + Save Status ── */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Studio Brand Icon -> Homepage */}
          <button
            onClick={() => onNavigate?.('/')}
            className="flex items-center gap-2 shrink-0 group hover:opacity-90 transition-opacity text-left p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-2)]"
            title="Return to Home"
            data-testid="brand-home-btn"
          >
            <ToporoLogo className="w-7 h-7 shrink-0" />
          </button>

          {/* Canva-Inspired Menu Bar: File, Edit, View */}
          <div className="flex items-center gap-0.5">
            {/* File Menu */}
            <MenuDropdown
              label="File"
              isOpen={activeMenu === 'file'}
              onToggle={() => setActiveMenu(p => p === 'file' ? null : 'file')}
              onClose={() => setActiveMenu(null)}
            >
              <button
                onClick={() => { resetProject(); setActiveMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <FilePlus className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>New Project</span>
              </button>
              <button
                onClick={() => { openImport?.(); setActiveMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>Import...</span>
              </button>
              <button
                onClick={() => { setIsExportProjectModalOpen(true); setActiveMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <FileBox className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
                <span>Save Project File (.ats)...</span>
              </button>
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <button
                onClick={() => handleExportOption('tf')}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>Export Terraform (.tf)</span>
              </button>
              <button
                onClick={() => handleExportOption('zip')}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <Package className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>Export Project Archive (.zip)</span>
              </button>
              <button
                onClick={() => handleExportOption('png')}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <Image className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>Export Diagram (.png)</span>
              </button>
            </MenuDropdown>

            {/* Edit Menu */}
            <MenuDropdown
              label="Edit"
              isOpen={activeMenu === 'edit'}
              onToggle={() => setActiveMenu(p => p === 'edit' ? null : 'edit')}
              onClose={() => setActiveMenu(null)}
            >
              <button
                disabled={history.length === 0}
                onClick={() => { undo(); setActiveMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Undo2 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Undo</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">⌘Z</span>
              </button>
              <button
                disabled={future.length === 0}
                onClick={() => { redo(); setActiveMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Redo2 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Redo</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">⇧⌘Z</span>
              </button>
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <button
                onClick={() => { runAutoLayout?.(); setActiveMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
                  <span>Auto-Layout Architecture</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">A</span>
              </button>
              <button
                disabled={topology?.resources?.length === 0}
                onClick={() => { clearCanvas?.(); setActiveMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#CA3521] hover:bg-[#FFEDEB] dark:hover:bg-[#441C17] disabled:opacity-40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Canvas</span>
              </button>
            </MenuDropdown>

            {/* View Menu */}
            <MenuDropdown
              label="View"
              isOpen={activeMenu === 'view'}
              onToggle={() => setActiveMenu(p => p === 'view' ? null : 'view')}
              onClose={() => setActiveMenu(null)}
            >
              <button
                onClick={() => { toggleSplitView(); setActiveMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Code Editor</span>
                </div>
                {isSplitView && <Check className="w-3 h-3 text-[var(--color-primary-light)]" />}
              </button>
              <button
                onClick={() => { toggleInspector?.(); setActiveMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Properties Panel</span>
                </div>
                {isInspectorOpen && <Check className="w-3 h-3 text-[var(--color-primary-light)]" />}
              </button>
              <button
                onClick={() => { toggleMiniMap?.(); setActiveMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Map className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Mini-Map</span>
                </div>
                {showMiniMap && <Check className="w-3 h-3 text-[var(--color-primary-light)]" />}
              </button>
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <button
                onClick={() => { setViewMode?.(viewMode === 'detailed' ? 'simple' : 'detailed'); setActiveMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Node Style: {viewMode === 'detailed' ? 'Cards' : 'Icons'}</span>
                </div>
              </button>
              <button
                onClick={() => { cycleGridMode?.(); setActiveMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Grid3x3 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Grid: {gridMode}</span>
                </div>
              </button>
              <button
                onClick={() => { toggleSnapToGrid?.(); setActiveMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Magnet className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Snap to Grid</span>
                </div>
                {snapToGrid && <Check className="w-3 h-3 text-[var(--color-primary-light)]" />}
              </button>
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <button
                onClick={() => { toggleThemeMode?.(); setActiveMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                {themeMode === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-[#F5CD47]" />}
                <span>Theme: {themeMode === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span>
              </button>
            </MenuDropdown>
          </div>

          <div className="w-px h-4 bg-[var(--color-border)] mx-1" />

          {/* Project Title (Inline editable, default "Untitled Project") */}
          <ProjectTitle name={projectName} onChange={renameProject} />

          {/* Save Status Badge (Turns green "Saved" after export / import) */}
          <div className="ml-1 shrink-0">
            <SyncStatusBadge isSyncing={isSyncing} isSaved={isSaved} />
          </div>
        </div>

        {/* ── Center: Telemetry Badges (Cost & Security, linked to Bottom Panel tabs) ── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <div
              className="flex items-center gap-1 cursor-pointer hover:opacity-85 transition-opacity"
              onClick={() => {
                setActiveTab?.('cost');
                openInspector?.();
              }}
              title="Click to view FinOps cost estimate"
            >
              <DollarSign className="w-3.5 h-3.5 text-[#1F845A] dark:text-[#4BCE97] shrink-0" />
              <span className="text-[11.5px] font-semibold font-mono text-[var(--color-text-primary)]">
                ${totalMonthly.toFixed(2)}
                <span className="text-[10px] font-normal text-[var(--color-text-muted)]">/mo</span>
              </span>
            </div>

            <span className="text-[var(--color-border)]">·</span>

            <div
              className="flex items-center gap-1 cursor-pointer hover:opacity-85 transition-opacity"
              onClick={() => {
                setActiveTab?.('security');
                openInspector?.();
              }}
              title={totalAlerts > 0 ? `${criticalCount} critical, ${highCount} high findings` : 'Security checks compliant'}
            >
              {healthScore >= 90 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1F845A] dark:text-[#4BCE97] shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[#CA3521] dark:text-[#FD9891] shrink-0" />
              )}
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                {healthScore >= 90 ? 'Compliant' : `${totalAlerts} Alerts`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: Action Toolbar, AI Copilot & Working Export Dropdown ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Split View Toggle */}
          <button
            onClick={toggleSplitView}
            title="Toggle Terraform Code Drawer (⌘\)"
            className={`toolbar-btn flex items-center gap-1 px-2 w-auto ${isSplitView ? 'active' : ''}`}
          >
            <Code2 className="w-4 h-4" />
            <span className="text-[11.5px] font-medium hidden xl:inline">Code</span>
          </button>

          {/* Properties Panel Toggle */}
          <button
            onClick={() => toggleInspector?.()}
            title={isInspectorOpen || isInspectorPinned ? "Hide Properties Panel (I)" : "Show Properties Panel (I)"}
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

          <div className="toolbar-divider" />

          {/* AI Copilot CTA (Pro Feature: Golden Crown & Unclickable on Free Plan) */}
          {isFreePlan ? (
            <span
              className="relative group inline-flex"
              title="Toporo Pro feature — Upgrade or start a 7-day trial to unlock AI Copilot"
              data-testid="copilot-pro-lock-wrapper"
            >
              <button
                type="button"
                disabled
                aria-disabled="true"
                data-testid="header-ai-copilot-btn"
                className="h-8 px-3 text-[12px] font-semibold rounded-[var(--radius-sm)] border border-amber-500/40 bg-amber-500/10 text-[var(--color-text-muted)] inline-flex items-center gap-1.5 opacity-80 cursor-not-allowed select-none"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400/25 shrink-0" aria-hidden="true" />
                <Sparkles className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <span>AI Copilot</span>
              </button>
              <span
                role="tooltip"
                className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute top-full right-0 mt-1.5 w-60 p-2 rounded-md bg-[#0B1D0B] border border-amber-400/40 text-[#F5F5F4] text-[11px] leading-snug shadow-xl z-50"
              >
                <span className="font-semibold text-amber-300 inline-flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Toporo Pro Feature
                </span>
                <span className="block text-[#D6D3D1] mt-0.5">
                  AI Architecture Copilot is locked on the Free plan.
                </span>
              </span>
            </span>
          ) : (
            <button
              onClick={() => toggleCopilot(true)}
              data-testid="header-ai-copilot-btn"
              className="btn-primary h-8 px-3 text-[12px] font-semibold shadow-xs"
              title="Open Architecture AI Copilot (⌘/)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-on-primary)] opacity-90" />
              AI Copilot
            </button>
          )}

          {/* Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(p => p === 'export' ? null : 'export')}
              data-testid="export-dropdown-btn"
              className="btn-ghost h-8 px-2.5 text-[12px] font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Export
              <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
            </button>

            {activeMenu === 'export' && (
              <div
                data-testid="export-dropdown-menu"
                className="dropdown-menu absolute top-full right-0 mt-1 w-56 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl z-50 overflow-hidden py-1 animate-fade-in"
              >
                {/* 1. Project File (.ats) */}
                <button
                  onClick={() => handleExportOption('project')}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-[var(--color-surface-2)] transition-colors group"
                >
                  <FileBox className="w-3.5 h-3.5 mt-0.5 text-[var(--color-primary-light)] shrink-0" />
                  <div>
                    <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">
                      Project File (.ats)
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">
                      Save complete architecture topology
                    </div>
                  </div>
                </button>

                {/* 2. Terraform Files (.tf) */}
                <button
                  onClick={() => handleExportOption('tf')}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-[var(--color-surface-2)] transition-colors group"
                >
                  <FileCode className="w-3.5 h-3.5 mt-0.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] shrink-0" />
                  <div>
                    <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">
                      Terraform Files (.tf)
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">
                      Download generated HCL code
                    </div>
                  </div>
                </button>

                {/* 3. Project Archive (.zip) */}
                <button
                  onClick={() => handleExportOption('zip')}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-[var(--color-surface-2)] transition-colors group"
                >
                  <Package className="w-3.5 h-3.5 mt-0.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] shrink-0" />
                  <div>
                    <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">
                      Project Archive (.zip)
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">
                      All .tf files, README, and .ats
                    </div>
                  </div>
                </button>

                {/* 4. Export PNG */}
                <button
                  onClick={() => handleExportOption('png')}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-[var(--color-surface-2)] transition-colors group"
                >
                  <Image className="w-3.5 h-3.5 mt-0.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] shrink-0" />
                  <div>
                    <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">
                      Export Diagram (.png)
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">
                      High-resolution visual snapshot
                    </div>
                  </div>
                </button>

                <div className="my-1 h-px bg-[var(--color-border)]" />

                {/* 5. Copy Terraform Code */}
                <button
                  onClick={() => handleExportOption('copy')}
                  className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-[var(--color-surface-2)] transition-colors group"
                >
                  {copySuccess ? (
                    <Check className="w-3.5 h-3.5 mt-0.5 text-[#1F845A] dark:text-[#4BCE97] shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 mt-0.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] shrink-0" />
                  )}
                  <div>
                    <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">
                      {copySuccess ? 'Copied to Clipboard!' : 'Copy Terraform Code'}
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">
                      Copy main.tf to system clipboard
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="toolbar-divider" />

          {/* User Plan Badge + Optional Admin Shortcut + Sign Out */}
          {user && (
            <div className="flex items-center gap-1.5 pl-0.5">
              <div
                data-testid="studio-plan-badge"
                title={`Signed in as ${user.email}`}
                className={`h-7 px-2 rounded-[var(--radius-sm)] border text-[11px] font-mono font-semibold inline-flex items-center gap-1 ${
                  isProPlan
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                }`}
              >
                {isProPlan && <Crown className="w-3 h-3 text-amber-400 fill-amber-400/20" />}
                <span>
                  {user.isTrialActive
                    ? `Pro Trial (${user.trialDaysRemaining}d)`
                    : isProPlan
                      ? 'Pro'
                      : 'Free'}
                </span>
              </div>

              {user.role === 'admin' && isElevatedAdminSession && (
                <button
                  type="button"
                  onClick={() => onNavigate?.('/manage')}
                  className="toolbar-btn !px-2 !w-auto gap-1 text-[11px] font-mono text-[var(--color-primary-light)]"
                  title="Open Elevated Admin Portal (/manage)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Manage</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  logout();
                  onNavigate?.('/login');
                }}
                data-testid="studio-logout-btn"
                title={`Sign out (${user.email})`}
                className="toolbar-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Project File Export Modal with Project Name prompt */}
      <ExportProjectModal
        isOpen={isExportProjectModalOpen}
        onClose={() => setIsExportProjectModalOpen(false)}
      />
    </>
  );
};
