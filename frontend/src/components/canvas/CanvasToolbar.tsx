import React from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import {
  ZoomIn, ZoomOut, Maximize2, Grid3x3, Magnet, Undo2, Redo2,
  LayoutGrid, Map, Layers, Copy, Trash2,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';

export const CanvasToolbar: React.FC = () => {
  const { zoomIn, zoomOut, fitView, setViewport, getViewport } = useReactFlow();
  const { zoom } = useViewport();
  const zoomPercent = Math.round((zoom || 1) * 100);

  const {
    topology,
    selectedResourceId,
    history,
    future,
    gridMode,
    snapToGrid,
    showMiniMap,
    viewMode,
    setViewMode,
    cycleGridMode,
    toggleSnapToGrid,
    toggleMiniMap,
    undo,
    redo,
    runAutoLayout,
    duplicateResource,
    removeResource,
  } = useTopologyStore();

  const resourceCount = topology?.resources?.length ?? 0;
  const edgeCount = topology?.edges?.length ?? 0;

  const handleZoomIn = () => zoomIn({ duration: 150 });
  const handleZoomOut = () => zoomOut({ duration: 150 });
  const handleFit = () => fitView({ padding: 0.18, duration: 250 });
  const handleZoom100 = () => {
    const vp = getViewport();
    setViewport({ x: vp.x, y: vp.y, zoom: 1 }, { duration: 200 });
  };

  const renderGridIcon = () => {
    if (gridMode === 'grid') {
      return <Grid3x3 className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />;
    }
    if (gridMode === 'dotted') {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-[var(--color-primary-light)]">
          <circle cx="3" cy="3" r="1.2" />
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="13" cy="3" r="1.2" />
          <circle cx="3" cy="8" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="13" cy="8" r="1.2" />
          <circle cx="3" cy="13" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
          <circle cx="13" cy="13" r="1.2" />
        </svg>
      );
    }
    return (
      <div className="relative flex items-center justify-center">
        <Grid3x3 className="w-3.5 h-3.5 opacity-35" />
        <span className="absolute w-4 h-[1.5px] bg-[#CA3521]/80 rotate-45 pointer-events-none" />
      </div>
    );
  };

  const getGridTooltip = () => {
    if (gridMode === 'grid') return 'Canvas Grid: Lines (Click for Dotted)';
    if (gridMode === 'dotted') return 'Canvas Grid: Dotted (Click for Hidden)';
    return 'Canvas Grid: Hidden (Click for Lines)';
  };

  const ToolbarBtn: React.FC<{
    icon: React.ReactNode;
    title: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    label?: string;
    danger?: boolean;
  }> = ({ icon, title, onClick, active, disabled, label, danger }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-btn ${label ? '!w-auto px-2 gap-1.5' : ''} ${active ? 'active' : ''} ${danger && !disabled ? 'hover:!text-[#CA3521] dark:hover:!text-[#FD9891]' : ''
        } ${disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
        }`}
    >
      {icon}
      {label && <span className="text-[11px] font-medium hidden md:inline">{label}</span>}
    </button>
  );

  return (
    <div
      data-testid="studio-toolbox"
      className="canvas-toolbar w-full h-[38px] px-3 flex items-center justify-between gap-2 bg-[var(--color-surface)] border-b border-[var(--color-border)] select-none z-20 shrink-0"
    >
      {/* ── Left & Center: Draw.io-Inspired Horizontal Tool Strip ── */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {/* 1. Icons / Cards View Segmented Switch */}
        <div
          className="flex items-center p-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-border)] select-none mr-0.5 shrink-0"
          title="Toggle Resource View: Icons (Clean official SVG icons) or Cards (Expanded specification cards)"
        >
          <button
            type="button"
            onClick={() => setViewMode('simple')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[11px] font-semibold transition-all ${viewMode === 'simple'
                ? 'bg-[var(--color-surface)] text-[var(--color-primary-light)] shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            title="Icons View: Official Azure SVG icons with clean resource labels"
          >
            <Layers className="w-3 h-3" />
            <span>Icons</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('detailed')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[11px] font-semibold transition-all ${viewMode === 'detailed'
                ? 'bg-[var(--color-surface)] text-[var(--color-primary-light)] shadow-xs border border-[var(--color-border)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            title="Cards View: Specification cards with configuration properties and security telemetry"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Cards</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* 2. Undo / Redo */}
        <ToolbarBtn
          icon={<Undo2 className="w-3.5 h-3.5" />}
          title="Undo (Ctrl/⌘+Z)"
          disabled={history.length === 0}
          onClick={undo}
        />
        <ToolbarBtn
          icon={<Redo2 className="w-3.5 h-3.5" />}
          title="Redo (Ctrl/⌘+Shift+Z)"
          disabled={future.length === 0}
          onClick={redo}
        />

        <div className="toolbar-divider" />

        {/* 3. Zoom & Viewport Controls (Draw.io style) */}
        <ToolbarBtn
          icon={<ZoomOut className="w-3.5 h-3.5" />}
          title="Zoom Out (-)"
          onClick={handleZoomOut}
        />

        <button
          onClick={handleZoom100}
          title="Reset zoom to 100%"
          className="toolbar-btn min-w-[46px] px-1.5 hover:bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] transition-colors font-mono text-[11px] font-semibold text-[var(--color-text-primary)]"
          style={{ width: 'auto' }}
        >
          {zoomPercent}%
        </button>

        <ToolbarBtn
          icon={<ZoomIn className="w-3.5 h-3.5" />}
          title="Zoom In (+)"
          onClick={handleZoomIn}
        />
        <ToolbarBtn
          icon={<Maximize2 className="w-3.5 h-3.5" />}
          title="Fit Architecture to Screen (F)"
          onClick={handleFit}
        />

        <div className="toolbar-divider" />

        {/* 4. Arrange, Grid, Snap & Mini-Map */}
        <ToolbarBtn
          icon={<LayoutGrid className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />}
          title="Auto-organize Architecture Layout (A)"
          label="Auto-Layout"
          onClick={runAutoLayout}
        />

        <ToolbarBtn
          icon={renderGridIcon()}
          title={getGridTooltip()}
          active={gridMode !== 'hidden'}
          onClick={cycleGridMode}
        />
        <ToolbarBtn
          icon={<Magnet className="w-3.5 h-3.5" />}
          title={`Snap to Grid: ${snapToGrid ? 'ON' : 'OFF'}`}
          active={snapToGrid}
          onClick={toggleSnapToGrid}
        />
        <ToolbarBtn
          icon={<Map className="w-3.5 h-3.5" />}
          title={`${showMiniMap ? 'Hide' : 'Show'} Mini-Map (M)`}
          active={showMiniMap}
          onClick={() => toggleMiniMap()}
        />

        <div className="toolbar-divider" />

        {/* 5. Selected Node Quick Actions (Draw.io style) */}
        <ToolbarBtn
          icon={<Copy className="w-3.5 h-3.5" />}
          title="Duplicate Selected Resource"
          disabled={!selectedResourceId}
          onClick={() => selectedResourceId && duplicateResource(selectedResourceId)}
        />
        <ToolbarBtn
          icon={<Trash2 className="w-3.5 h-3.5" />}
          title="Delete Selected Resource (Del)"
          disabled={!selectedResourceId}
          danger
          onClick={() => selectedResourceId && removeResource(selectedResourceId)}
        />
      </div>

      {/* ── Right: Topology Summary ── */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10.5px] font-mono text-[var(--color-text-muted)]">
          <span>
            <strong className="text-[var(--color-text-primary)]">{resourceCount}</strong> nodes
          </span>
          <span>·</span>
          <span>
            <strong className="text-[var(--color-text-primary)]">{edgeCount}</strong> edges
          </span>
        </div>
      </div>
    </div>
  );
};
