import React from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import {
  ZoomIn, ZoomOut, Maximize2, Grid3x3, Magnet, Undo2, Redo2,
  MousePointer2, Download, LayoutGrid, Map, Layers,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';

export const CanvasToolbar: React.FC = () => {
  const { zoomIn, zoomOut, fitView, setViewport, getViewport } = useReactFlow();
  const { zoom } = useViewport();
  const zoomPercent = Math.round((zoom || 1) * 100);

  const {
    topology,
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
  } = useTopologyStore();

  const handleZoomIn = () => zoomIn({ duration: 150 });
  const handleZoomOut = () => zoomOut({ duration: 150 });
  const handleFit = () => fitView({ padding: 0.18, duration: 250 });
  const handleZoom100 = () => {
    const vp = getViewport();
    setViewport({ x: vp.x, y: vp.y, zoom: 1 }, { duration: 200 });
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(topology, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${(topology.metadata.project_name || 'azure-architecture').toLowerCase().replace(/\s+/g, '-')}-topology.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
  }> = ({ icon, title, onClick, active, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-btn ${active ? 'active' : ''} ${
        disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="canvas-toolbar pointer-events-auto flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-md">
      {/* ── Simple / Detailed View Slider Toggle Button ── */}
      <div
        className="flex items-center p-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-border)] select-none mr-0.5"
        title="Toggle Resource View: Detailed (Cards with properties) or Simple (Official SVG icons)"
      >
        <button
          type="button"
          onClick={() => setViewMode('detailed')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-[11px] font-semibold transition-all ${
            viewMode === 'detailed'
              ? 'bg-[var(--color-surface)] text-[var(--color-primary-light)] shadow-xs border border-[var(--color-border)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
          title="Detailed View: Rectangular cards with configuration properties, security status, and telemetry"
        >
          <LayoutGrid className="w-3 h-3" />
          <span>Detailed</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('simple')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-[11px] font-semibold transition-all ${
            viewMode === 'simple'
              ? 'bg-[var(--color-surface)] text-[var(--color-primary-light)] shadow-xs border border-[var(--color-border)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
          title="Simple View: Official Azure SVG icons with resource name and type underneath"
        >
          <Layers className="w-3 h-3" />
          <span>Simple</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Selection Pointer */}
      <ToolbarBtn
        icon={<MousePointer2 className="w-3.5 h-3.5" />}
        title="Select and Move Mode"
        active={true}
      />

      <div className="toolbar-divider" />

      {/* Undo / Redo */}
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

      {/* Zoom controls */}
      <ToolbarBtn
        icon={<ZoomOut className="w-3.5 h-3.5" />}
        title="Zoom Out (-)"
        onClick={handleZoomOut}
      />

      <button
        onClick={handleZoom100}
        title="Reset zoom to 100%"
        className="toolbar-btn min-w-[42px] px-1 hover:bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] transition-colors font-mono text-[10.5px]"
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
        title="Fit to Screen (F)"
        onClick={handleFit}
      />

      <div className="toolbar-divider" />

      {/* Auto-Layout */}
      <ToolbarBtn
        icon={<LayoutGrid className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />}
        title="Auto-organize Architecture Layout (A)"
        onClick={runAutoLayout}
      />

      {/* Grid + Snap */}
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

      {/* Mini-Map Toggle */}
      <ToolbarBtn
        icon={<Map className="w-3.5 h-3.5" />}
        title={`${showMiniMap ? 'Hide' : 'Show'} Mini-Map`}
        active={showMiniMap}
        onClick={() => toggleMiniMap()}
      />

      <div className="toolbar-divider" />

      {/* Export */}
      <ToolbarBtn
        icon={<Download className="w-3.5 h-3.5" />}
        title="Export Topology IR JSON"
        onClick={handleExportJson}
      />
    </div>
  );
};
