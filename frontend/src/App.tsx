import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/header/Header';
import { ResourceCatalog } from './components/sidebar/ResourceCatalog';
import { Canvas } from './components/canvas/Canvas';
import { MonacoEditor } from './components/editor/MonacoEditor';
import { PropertyInspector } from './components/inspector/PropertyInspector';
import { CopilotModal } from './components/copilot/CopilotModal';
import { ImportModal } from './components/import/ImportModal';
import { useTopologyStore } from './store/useTopologyStore';
import { GripVertical } from 'lucide-react';

// ─── Status Bar ────────────────────────────────────────────────────────────

const StatusBar: React.FC<{ resourceCount: number; edgeCount: number }> = ({ resourceCount, edgeCount }) => (
  <div
    className="flex items-center justify-between px-3 h-[24px] shrink-0 text-[11px] select-none"
    style={{
      background:  'var(--color-surface)',
      borderTop:   '1px solid var(--color-border)',
      color:       'var(--color-text-muted)',
    }}
  >
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 font-medium">
        <span
          className="status-dot synced"
          style={{ width: 6, height: 6 }}
        />
        Topology Studio Connected
      </span>
      <span className="text-[var(--color-border)]">|</span>
      <span>{resourceCount} resource{resourceCount !== 1 ? 's' : ''}</span>
      {edgeCount > 0 && <span>· {edgeCount} connections</span>}
    </div>
    <div className="flex items-center gap-3 font-mono text-[10px]">
      <span>Azure Cloud Infra</span>
      <span className="px-1 py-0.2 rounded bg-[var(--color-surface-2)] text-[var(--color-primary-light)] font-bold">
        v2.5
      </span>
    </div>
  </div>
);

// ─── App Root ─────────────────────────────────────────────────────────────

export const App: React.FC = () => {
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [codeDrawerWidth, setCodeDrawerWidth] = useState<number>(() => {
    const saved = localStorage.getItem('azure_code_drawer_width');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 260 && parsed <= 1400) return parsed;
    }
    return Math.max(340, Math.min(600, Math.round(window.innerWidth * 0.38)));
  });
  const [isDraggingDrawer, setIsDraggingDrawer] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    refreshCodeAndAnalysis,
    topology,
    toggleCopilot,
    openImport,
    toggleInspector,
    toggleMiniMap,
  } = useTopologyStore() as any;

  useEffect(() => {
    refreshCodeAndAnalysis?.();
  }, [refreshCodeAndAnalysis]);

  // Persist code drawer width
  useEffect(() => {
    localStorage.setItem('azure_code_drawer_width', String(codeDrawerWidth));
  }, [codeDrawerWidth]);

  // ── Horizontal Resizer Drag Handling ──
  const handleStartResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingDrawer(true);
    const startX = e.clientX;
    const startW = editorContainerRef.current
      ? editorContainerRef.current.getBoundingClientRect().width
      : codeDrawerWidth;

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      // Dragging left increases editor drawer width
      const deltaX = startX - moveEvent.clientX;
      const minW = 280;
      const maxW = Math.max(minW, window.innerWidth - 320);
      const newW = Math.max(minW, Math.min(maxW, startW + deltaX));
      setCodeDrawerWidth(newW);
    };

    const onPointerUp = () => {
      setIsDraggingDrawer(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [codeDrawerWidth]);

  const handleResetDrawerWidth = useCallback(() => {
    const defaultW = Math.max(340, Math.min(600, Math.round(window.innerWidth * 0.38)));
    setCodeDrawerWidth(defaultW);
  }, []);

  // ── Global keyboard shortcuts ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) ||
      (e.target as HTMLElement)?.isContentEditable;
    if (isInput) return;

    const ctrl = e.metaKey || e.ctrlKey;

    // ⌘/ → AI Copilot
    if (ctrl && e.key === '/') {
      e.preventDefault();
      toggleCopilot?.(true);
    }
    // ⌘\ → Toggle split view
    if (ctrl && e.key === '\\') {
      e.preventDefault();
      setIsSplitView(p => !p);
    }
    // 'I' or 'i' (or ⌘I) → Toggle Property Inspector
    if ((e.key === 'i' || e.key === 'I') && !e.shiftKey && !e.altKey && !ctrl) {
      e.preventDefault();
      toggleInspector?.();
    }
    // 'M' or 'm' → Toggle Mini-Map
    if ((e.key === 'm' || e.key === 'M') && !e.shiftKey && !e.altKey && !ctrl) {
      e.preventDefault();
      toggleMiniMap?.();
    }
  }, [toggleCopilot, toggleInspector, toggleMiniMap]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const resourceCount = topology?.resources?.length ?? 0;
  const edgeCount     = topology?.edges?.length ?? 0;

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden ${isDraggingDrawer ? 'select-none' : ''}`}
      style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
    >
      {/* ── Top Application Bar ── */}
      <Header
        isSplitView={isSplitView}
        toggleSplitView={() => setIsSplitView(p => !p)}
      />

      {/* ── Main Studio Viewport ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar — Azure Resource Catalog */}
        <ResourceCatalog />

        {/* Center — Visual Canvas */}
        <main className="flex-1 h-full relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
          <Canvas />
        </main>

        {/* Resizable Split — Monaco HCL Editor */}
        {isSplitView && (
          <>
            {/* Draggable resize handle */}
            <div
              className={`drawer-resizer ${isDraggingDrawer ? 'resizing' : ''}`}
              onPointerDown={handleStartResize}
              onDoubleClick={handleResetDrawerWidth}
              title="Drag to resize code drawer horizontally (Double-click to reset)"
            >
              <div className="drawer-resizer-handle">
                <GripVertical className="w-2.5 h-2.5 text-[var(--color-text-muted)]" />
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div
              ref={editorContainerRef}
              className="h-full shrink-0 relative"
              style={{ width: `${codeDrawerWidth}px`, minWidth: 280, maxWidth: 'calc(100vw - 320px)' }}
            >
              <MonacoEditor />
            </div>
          </>
        )}

        {/* Right — Property Inspector */}
        <PropertyInspector />
      </div>

      {/* ── Status Bar ── */}
      <StatusBar resourceCount={resourceCount} edgeCount={edgeCount} />

      {/* ── Modals & Overlays ── */}
      <CopilotModal />
      <ImportModal />
    </div>
  );
};
