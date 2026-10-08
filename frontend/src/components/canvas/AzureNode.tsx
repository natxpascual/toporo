import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import {
  AlertTriangle, CheckCircle2, DollarSign, Copy, Trash2,
  ExternalLink, Layers, Check, ChevronRight, SlidersHorizontal,
  Pencil,
} from 'lucide-react';
import { AzureResourceIR } from '../../services/api';
import { AzureIcon, getAzureColor } from '../icons/AzureIcons';
import { useTopologyStore } from '../../store/useTopologyStore';

// ─── Security severity helpers ────────────────────────────────────────────

const getSeverityState = (findings: any[]) => {
  if (findings.some(f => f.severity === 'CRITICAL')) return 'critical';
  if (findings.some(f => f.severity === 'HIGH'))     return 'high';
  if (findings.some(f => f.severity === 'MEDIUM'))   return 'medium';
  if (findings.length > 0)                           return 'low';
  return 'clean';
};

const SEVERITY_STYLES = {
  critical: { border: 'var(--color-danger)',   shadow: '0 0 0 1px var(--color-danger)', badge: 'badge-critical' },
  high:     { border: 'var(--color-warning)',  shadow: '0 0 0 1px var(--color-warning)', badge: 'badge-high' },
  medium:   { border: 'var(--color-info)',     shadow: 'none', badge: 'badge-medium' },
  low:      { border: 'var(--color-primary)',  shadow: 'none', badge: 'badge-low' },
  clean:    { border: 'var(--color-border)',   shadow: 'none', badge: 'badge-ok' },
};

// ─── AzureNode Component ──────────────────────────────────────────────────

interface AncestorInfo {
  id: string;
  name: string;
  type: string;
  container_level?: string;
}

interface AzureNodeData {
  resource: AzureResourceIR;
  ancestors?: AncestorInfo[];
  isParentHovered?: boolean;
  isChildHovered?: boolean;
  activeFocusId?: string | null;
}

export const AzureNode = memo(({ data, selected }: NodeProps & { data: AzureNodeData }) => {
  const res = data.resource;
  const ancestors = data.ancestors ?? [];
  const isParentHovered = data.isParentHovered;
  const findings = res.security_findings ?? [];
  const cost = res.cost?.monthly_cost_usd ?? 0;
  const [showMenu, setShowMenu] = useState(false);
  const [copiedHcl, setCopiedHcl] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(res.name);

  // Sync editName when external resource name updates
  React.useEffect(() => {
    if (!isEditingName) {
      setEditName(res.name);
    }
  }, [res.name, isEditingName]);

  const {
    hoveredResourceId,
    selectResource,
    setHoveredResource,
    openInspector,
    duplicateResource,
    getResourceHcl,
    removeResource,
    renameResource,
    viewMode,
  } = useTopologyStore();

  const isDirectHovered = hoveredResourceId === res.id;

  const severity = getSeverityState(findings);
  const severityStyle = SEVERITY_STYLES[severity];
  const accentColor = getAzureColor(res.type);

  // Extract 2 key properties to preview
  const propEntries = Object.entries(res.properties ?? {})
    .filter(([k]) => !['tags', 'timeouts', 'depends_on', 'lifecycle'].includes(k))
    .slice(0, 2);

  const handleInspect = () => {
    selectResource(res.id);
    openInspector(res.id);
    setShowMenu(false);
  };

  const handleStartRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditName(res.name);
    setIsEditingName(true);
    setShowMenu(false);
  };

  const handleSaveRename = async () => {
    setIsEditingName(false);
    const trimmed = editName.trim();
    if (trimmed && trimmed !== res.name) {
      await renameResource(res.id, trimmed);
    } else {
      setEditName(res.name);
    }
  };

  const handleCancelRename = () => {
    setIsEditingName(false);
    setEditName(res.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename();
    }
  };

  const handleDuplicate = async () => {
    await duplicateResource(res.id);
    setShowMenu(false);
  };

  const handleCopyHcl = () => {
    const hcl = getResourceHcl(res.id);
    navigator.clipboard.writeText(hcl);
    setCopiedHcl(true);
    setTimeout(() => setCopiedHcl(false), 2000);
    setShowMenu(false);
  };

  const handleViewDocs = () => {
    const cleanType = res.type.replace('azurerm_', '');
    const url = `https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/${cleanType}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowMenu(false);
  };

  const handleDelete = async () => {
    await removeResource(res.id);
    setShowMenu(false);
  };

  const [isResizing, setIsResizing] = useState(false);
  const [liveDimensions, setLiveDimensions] = useState<{ width: number; height: number } | null>(null);
  const width = liveDimensions?.width ?? res.dimensions?.width ?? 240;
  const height = liveDimensions?.height ?? res.dimensions?.height;

  const renderContextMenu = () => {
    if (!showMenu) return null;
    return (
      <div
        className="absolute left-full top-0 ml-1.5 z-50 min-w-[170px] rounded-[var(--radius-sm)] py-1 animate-fade-in nodrag"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 8px -2px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
        }}
        onMouseLeave={() => setShowMenu(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleInspect}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
          Inspect Properties
        </button>
        <button
          onClick={handleStartRename}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
        >
          <Pencil className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          Rename
        </button>
        <div className="h-px my-1 bg-[var(--color-border)]" />
        <button
          onClick={handleDuplicate}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
        >
          <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          Duplicate
        </button>
        <button
          onClick={handleCopyHcl}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
        >
          <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          Copy Terraform HCL
        </button>
        <button
          onClick={handleViewDocs}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-[var(--color-surface-2)] text-[var(--color-text-primary)]"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          Terraform Docs
        </button>
        <div className="h-px my-1 bg-[var(--color-border)]" />
        <button
          onClick={handleDelete}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-[#FFEDEB] dark:hover:bg-[#441C17] text-[#CA3521] dark:text-[#FD9891]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    );
  };

  // ─── Simple View Mode (SVG Icon with Name + Type Underneath) ───
  if (viewMode === 'simple') {
    return (
      <div
        className="relative group select-none flex flex-col items-center justify-start"
        style={{
          width: 120,
          minHeight: 88,
        }}
        onMouseEnter={() => setHoveredResource(res.id)}
        onMouseLeave={() => setHoveredResource(null)}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu((p) => !p);
        }}
      >
        {/* ── 4-Way Omni-Directional Connection Handles ── */}
        {/* TOP */}
        <Handle
          type="source"
          position={Position.Top}
          id="top-source"
          isConnectable={true}
          className="!w-3 !h-3 !-top-[6px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
          style={{ background: accentColor, left: '50%' }}
          title="Connect from Top"
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top-target"
          isConnectable={true}
          className="!w-3 !h-3 !-top-[6px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
          style={{ background: accentColor, left: '50%' }}
          title="Connect to Top"
        />

        {/* RIGHT */}
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          isConnectable={true}
          className="!w-3 !h-3 !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
          style={{ background: accentColor, right: '14px', top: '24px' }}
          title="Connect from Right"
        />
        <Handle
          type="target"
          position={Position.Right}
          id="right-target"
          isConnectable={true}
          className="!w-3 !h-3 !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
          style={{ background: accentColor, right: '14px', top: '24px' }}
          title="Connect to Right"
        />

        {/* BOTTOM */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-source"
          isConnectable={true}
          className="!w-3 !h-3 !-bottom-[6px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
          style={{ background: accentColor, left: '50%' }}
          title="Connect from Bottom"
        />
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom-target"
          isConnectable={true}
          className="!w-3 !h-3 !-bottom-[6px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
          style={{ background: accentColor, left: '50%' }}
          title="Connect to Bottom"
        />

        {/* LEFT */}
        <Handle
          type="source"
          position={Position.Left}
          id="left-source"
          isConnectable={true}
          className="!w-3 !h-3 !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
          style={{ background: accentColor, left: '14px', top: '24px' }}
          title="Connect from Left"
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          isConnectable={true}
          className="!w-3 !h-3 !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
          style={{ background: accentColor, left: '14px', top: '24px' }}
          title="Connect to Left"
        />

        {/* ── Center SVG Icon Tile ── */}
        <div
          className={`relative w-12 h-12 rounded-[10px] flex items-center justify-center transition-all duration-150 ${
            selected
              ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg)] shadow-md'
              : isDirectHovered
              ? 'ring-2 ring-[var(--color-primary-light)] shadow-sm'
              : isParentHovered
              ? 'ring-1 ring-[var(--color-primary-light)]'
              : ''
          }`}
          style={{
            background: 'var(--color-surface)',
            border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            boxShadow: selected ? '0 0 0 2px var(--color-primary-glow)' : undefined,
          }}
        >
          <AzureIcon type={res.type} size={28} />
          {findings.length > 0 && (
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8.5px] font-bold text-white shadow"
              style={{ background: severity === 'critical' ? 'var(--color-danger)' : 'var(--color-warning)' }}
              title={`${findings.length} security finding(s)`}
            >
              !
            </span>
          )}
        </div>

        {/* ── Name and Type Underneath ── */}
        <div className="mt-1.5 w-full text-center px-1">
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              autoFocus
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              className="nodrag nowheel text-[11px] font-semibold px-1 py-0.5 rounded outline-none w-full text-center border bg-[var(--color-surface)] border-[var(--color-primary)] text-[var(--color-text-primary)]"
            />
          ) : (
            <div
              className="text-[11.5px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary-light)] transition-colors truncate cursor-text"
              title={`${res.name}\n(Double-click to rename)`}
              onDoubleClick={handleStartRename}
            >
              {res.name}
            </div>
          )}
          <div
            className="text-[9.5px] text-[var(--color-text-muted)] font-mono truncate mt-0.5"
            title={res.type}
          >
            {res.type.replace('azurerm_', '')}
          </div>
        </div>

        {/* Context Menu */}
        {renderContextMenu()}
      </div>
    );
  }

  return (
    <div
      className="relative group"
      style={{
        width: `${width}px`,
        height: height ? `${height}px` : undefined,
        minWidth: 220,
        minHeight: 120,
        transition: isResizing ? 'none' : undefined,
      }}
      onMouseEnter={() => setHoveredResource(res.id)}
      onMouseLeave={() => setHoveredResource(null)}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu((p) => !p);
      }}
    >
      {/* ── Sizing Box Handles ── */}
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={120}
        handleStyle={{
          width: 7,
          height: 7,
          borderRadius: 2,
          background: '#FFFFFF',
          borderColor: accentColor,
          borderWidth: 1.5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}
        lineStyle={{
          borderColor: isResizing ? accentColor : selected ? accentColor : 'transparent',
          borderWidth: 1.5,
          borderStyle: 'solid',
        }}
        onResizeStart={(_, params) => {
          setIsResizing(true);
          setLiveDimensions({
            width: Math.round(params.width),
            height: Math.round(params.height),
          });
        }}
        onResize={(_, params) => {
          setLiveDimensions({
            width: Math.round(params.width),
            height: Math.round(params.height),
          });
        }}
        onResizeEnd={(_, params) => {
          setIsResizing(false);
          setLiveDimensions(null);
          const newWidth = Math.round(params.width);
          const newHeight = Math.round(params.height);
          const newX = params.x !== undefined ? Math.round(params.x) : undefined;
          const newY = params.y !== undefined ? Math.round(params.y) : undefined;
          const positionChanged = newX !== undefined && newY !== undefined && (newX !== res.position?.x || newY !== res.position?.y);

          useTopologyStore.getState().updateResourceBounds(res.id, {
            position: positionChanged ? { x: newX, y: newY } : undefined,
            dimensions: { width: newWidth, height: newHeight },
          });
        }}
      />

      {/* ── 4-Way Omni-Directional Connection Handles ── */}
      {/* TOP */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-top-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
        style={{ background: accentColor }}
        title="Connect from Top"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-top-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
        style={{ background: accentColor }}
        title="Connect to Top"
      />

      {/* RIGHT */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-right-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
        style={{ background: accentColor }}
        title="Connect from Right"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-right-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
        style={{ background: accentColor }}
        title="Connect to Right"
      />

      {/* BOTTOM */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-bottom-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
        style={{ background: accentColor }}
        title="Connect from Bottom"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-bottom-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
        style={{ background: accentColor }}
        title="Connect to Bottom"
      />

      {/* LEFT */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-left-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
        style={{ background: accentColor }}
        title="Connect from Left"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-left-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
        style={{ background: accentColor }}
        title="Connect to Left"
      />

      {/* ── Card Body ── */}
      <div
        className={`node-card rounded-[var(--radius-md)] overflow-hidden transition-all duration-150 ${
          isDirectHovered
            ? 'ring-2 ring-[var(--color-primary)]'
            : isParentHovered
            ? 'ring-1 ring-[var(--color-primary-light)]'
            : ''
        }`}
        style={{
          borderColor: selected
            ? 'var(--color-primary)'
            : isDirectHovered
            ? 'var(--color-primary-light)'
            : severityStyle.border,
          boxShadow: selected
            ? '0 0 0 2px var(--color-primary-glow), 0 4px 12px rgba(0,0,0,0.2)'
            : undefined,
          background: 'var(--color-surface)',
        }}
      >
        {/* Top Accent Color Bar */}
        <div
          className="h-[3px] w-full"
          style={{ background: accentColor }}
        />

        <div className="p-2.5">
          {/* ── Top row: official icon + name + cost ── */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Official Azure Architecture Icon in Card Tile */}
              <div
                className="w-7 h-7 rounded-[3px] flex items-center justify-center shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-border)]"
              >
                <AzureIcon type={res.type} size={18} />
              </div>

              {/* Name + Type */}
              <div className="overflow-hidden flex-1 min-w-0">
                {isEditingName ? (
                  <input
                    type="text"
                    value={editName}
                    autoFocus
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleSaveRename}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    className="nodrag nowheel text-[12px] font-semibold px-1.5 py-0.5 rounded outline-none w-full border bg-[var(--color-surface)] border-[var(--color-primary)] text-[var(--color-text-primary)]"
                  />
                ) : (
                  <div
                    className="text-[12px] font-semibold truncate cursor-text hover:text-[var(--color-primary-light)] transition-colors flex items-center gap-1 group/name text-[var(--color-text-primary)]"
                    title="Double-click to rename"
                    onDoubleClick={handleStartRename}
                  >
                    <span className="truncate">{res.name}</span>
                    <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/name:opacity-70 shrink-0 text-[var(--color-primary-light)]" />
                  </div>
                )}
                <div
                  className="text-[10px] truncate text-[var(--color-text-muted)] font-mono"
                >
                  {res.type.replace('azurerm_', '')}
                </div>
              </div>
            </div>

            {/* Cost or Copied badge (Status Lozenge) */}
            {copiedHcl ? (
              <span className="text-[10px] font-bold text-[#1F845A] bg-[#DCFFF1] dark:bg-[#143B2B] dark:text-[#4BCE97] px-1.5 py-0.5 rounded-[3px] flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Copied
              </span>
            ) : cost > 0 ? (
              <div className="badge-cost px-1.5 py-0.5 rounded-[3px] text-[10px] shrink-0 flex items-center gap-0.5">
                <DollarSign className="w-2.5 h-2.5" />
                {cost.toFixed(2)}
              </div>
            ) : null}
          </div>

          {/* ── Containment Ancestry Breadcrumb ── */}
          {ancestors.length > 0 && (
            <div
              className="mb-2 px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium flex items-center flex-wrap gap-1 bg-[var(--color-surface-2)] border border-[var(--color-border)]"
            >
              <Layers className="w-2.5 h-2.5 shrink-0 text-[var(--color-primary-light)]" />
              {ancestors.map((anc, idx) => (
                <React.Fragment key={anc.id}>
                  {idx > 0 && (
                    <ChevronRight className="w-2.5 h-2.5 text-[var(--color-text-muted)] shrink-0" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectResource(anc.id);
                    }}
                    className="hover:underline hover:text-[var(--color-primary-light)] transition-colors truncate max-w-[80px] text-[var(--color-text-secondary)]"
                    title={`Parent ${anc.container_level?.toUpperCase()}: ${anc.name}`}
                  >
                    {anc.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── Property preview ── */}
          {propEntries.length > 0 && (
            <div
              className="mb-2 p-1.5 rounded-[var(--radius-sm)] space-y-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)]"
            >
              {propEntries.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                    {k.replace(/_/g, ' ')}
                  </span>
                  <span
                    className="text-[10px] font-medium truncate max-w-[105px] font-mono text-[var(--color-text-secondary)]"
                  >
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Footer: location + security status lozenge ── */}
          <div
            className="flex items-center justify-between pt-1.5 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-[10px] truncate text-[var(--color-text-muted)] font-medium">
              {res.location || 'eastus'}
            </span>

            {findings.length > 0 ? (
              <div className={`${severityStyle.badge} px-1.5 py-0.2 rounded-[3px] text-[9.5px] font-bold flex items-center gap-1`}>
                <AlertTriangle className="w-2.5 h-2.5" />
                {findings.length} {severity}
              </div>
            ) : (
              <div className="badge-ok px-1.5 py-0.2 rounded-[3px] text-[9.5px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                COMPLIANT
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Context Menu (Dropdown Menu) ── */}
      {renderContextMenu()}
    </div>
  );
});

AzureNode.displayName = 'AzureNode';
