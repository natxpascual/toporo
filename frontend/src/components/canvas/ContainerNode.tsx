import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import {
  ChevronDown, ChevronUp, Copy, Trash2, Check,
  ExternalLink, SlidersHorizontal,
  Pencil,
} from 'lucide-react';
import { AzureResourceIR } from '../../services/api';
import { AzureIcon } from '../icons/AzureIcons';
import { useTopologyStore } from '../../store/useTopologyStore';

// ─── Container type configuration ─────────────────────────────────────────

const CONTAINER_CONFIG = {
  azurerm_resource_group: {
    borderColor: 'rgba(27,138,75,0.38)',
    borderColorHover: 'rgba(27,138,75,0.72)',
    bgColor: 'rgba(27,138,75,0.025)',
    headerColor: 'rgba(27,138,75,0.08)',
    badgeText: 'Resource Group',
    badgeBg: 'rgba(27,138,75,0.12)',
    badgeColor: 'var(--color-primary-light)',
    badgeBorder: 'rgba(27,138,75,0.28)',
    accentColor: 'var(--color-primary)',
  },
  azurerm_virtual_network: {
    borderColor: 'rgba(1,179,159,0.38)',
    borderColorHover: 'rgba(1,179,159,0.72)',
    bgColor: 'rgba(1,179,159,0.025)',
    headerColor: 'rgba(1,179,159,0.08)',
    badgeText: 'Virtual Network',
    badgeBg: 'rgba(1,179,159,0.12)',
    badgeColor: 'var(--azure-network)',
    badgeBorder: 'rgba(1,179,159,0.28)',
    accentColor: '#01B39F',
  },
  azurerm_subnet: {
    borderColor: 'rgba(43,90,67,0.42)',
    borderColorHover: 'rgba(43,90,67,0.75)',
    bgColor: 'rgba(43,90,67,0.025)',
    headerColor: 'rgba(43,90,67,0.08)',
    badgeText: 'Subnet',
    badgeBg: 'rgba(43,90,67,0.12)',
    badgeColor: 'var(--color-success)',
    badgeBorder: 'rgba(43,90,67,0.28)',
    accentColor: '#2B5A43',
  },
} as const;

type ContainerType = keyof typeof CONTAINER_CONFIG;

const DEFAULT_CONFIG = {
  borderColor: 'rgba(115,132,150,0.3)',
  borderColorHover: 'rgba(115,132,150,0.6)',
  bgColor: 'rgba(115,132,150,0.02)',
  headerColor: 'rgba(115,132,150,0.08)',
  badgeText: 'Container',
  badgeBg: 'rgba(115,132,150,0.1)',
  badgeColor: '#9FADBC',
  badgeBorder: 'rgba(115,132,150,0.25)',
  accentColor: '#738496',
};

// ─── ContainerNode Component ──────────────────────────────────────────────

interface AncestorInfo {
  id: string;
  name: string;
  type: string;
  container_level?: string;
}

interface ContainerNodeData {
  resource: AzureResourceIR;
  childCount?: number;
  childrenList?: AzureResourceIR[];
  ancestors?: AncestorInfo[];
  isChildHovered?: boolean;
  isParentHovered?: boolean;
  activeFocusId?: string | null;
}

export const ContainerNode = memo(({ data, selected }: NodeProps & { data: ContainerNodeData }) => {
  const res = data.resource;
  const cfg = CONTAINER_CONFIG[res.type as ContainerType] ?? DEFAULT_CONFIG;
  const ancestors = data.ancestors ?? [];
  const childrenList = data.childrenList ?? [];
  const isChildHovered = data.isChildHovered;
  const isParentHovered = data.isParentHovered;

  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedHcl, setCopiedHcl] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [liveDimensions, setLiveDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(res.name);

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
    updateResourceBounds,
    duplicateResource,
    getResourceHcl,
    removeResource,
    renameResource,
  } = useTopologyStore();

  const { effectiveMinWidth, effectiveMinHeight } = React.useMemo(() => {
    let minW = 240;
    let minH = collapsed ? 46 : 110;

    if (!collapsed && childrenList.length > 0 && res.position) {
      const directChildren = childrenList.filter((c) => c.parent_id === res.id);
      const UNIFORM_PADDING = 16;
      for (const child of directChildren) {
        if (child.position) {
          const relX = child.position.x - res.position.x;
          const relY = child.position.y - res.position.y;
          // Only constrain resizer if child is positioned inside the container
          if (relX >= 0 && relY >= 0) {
            const childW = child.dimensions?.width ?? (['rg', 'vnet', 'subnet'].includes(child.container_level ?? '')
              ? (child.container_level === 'rg' ? 560 : child.container_level === 'vnet' ? 480 : 400)
              : 220);
            const childH = child.dimensions?.height ?? (['rg', 'vnet', 'subnet'].includes(child.container_level ?? '')
              ? (child.container_level === 'rg' ? 340 : child.container_level === 'vnet' ? 240 : 180)
              : 110);
            minW = Math.max(minW, relX + childW + UNIFORM_PADDING);
            minH = Math.max(minH, relY + childH + UNIFORM_PADDING);
          }
        }
      }
    }
    return { effectiveMinWidth: minW, effectiveMinHeight: minH };
  }, [childrenList, res.position, res.id, collapsed]);

  const cidr =
    res.properties?.address_space?.[0] ??
    res.properties?.address_prefixes?.[0] ??
    null;

  const childCount = data.childCount ?? childrenList.length;

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

  const isDirectHovered = hoveredResourceId === res.id;
  const isIlluminated = isDirectHovered || isChildHovered || isParentHovered;

  const width = liveDimensions?.width ?? res.dimensions?.width ?? (res.container_level === 'rg' ? 560 : res.container_level === 'vnet' ? 480 : 400);
  const height = liveDimensions?.height ?? (collapsed ? 46 : (res.dimensions?.height ?? (res.container_level === 'rg' ? 340 : res.container_level === 'vnet' ? 240 : 180)));

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        minHeight: collapsed ? '46px' : '100px',
        minWidth: '220px',
        transition: isResizing ? 'none' : 'box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      className="relative group rounded-[var(--radius-lg)]"
      onMouseEnter={() => {
        setHovered(true);
        setHoveredResource(res.id);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setHoveredResource(null);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu((p) => !p);
      }}
    >
      {/* ── Container Resizer ── */}
      <NodeResizer
        isVisible={(selected || hovered) && !collapsed}
        minWidth={effectiveMinWidth}
        minHeight={effectiveMinHeight}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: 2,
          background: '#FFFFFF',
          borderColor: cfg.accentColor,
          borderWidth: 1.5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}
        lineStyle={{
          borderColor: isResizing ? cfg.accentColor : (selected || hovered) ? `${cfg.accentColor}80` : 'transparent',
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

          updateResourceBounds(res.id, {
            position: positionChanged ? { x: newX, y: newY } : undefined,
            dimensions: { width: newWidth, height: newHeight },
          });
        }}
      />

      {/* ── Live Dimensions HUD Badge ── */}
      {isResizing && liveDimensions && (
        <div
          className="absolute -bottom-6 right-0 z-40 px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow pointer-events-none flex items-center gap-1 animate-fade-in"
          style={{
            background: 'var(--color-surface)',
            border: `1px solid ${cfg.accentColor}`,
            color: 'var(--color-text-primary)',
          }}
        >
          <span style={{ color: cfg.badgeColor }}>{liveDimensions.width}</span>
          <span className="opacity-40">×</span>
          <span style={{ color: cfg.badgeColor }}>{liveDimensions.height}</span>
          <span className="text-[9px] opacity-60">px</span>
        </div>
      )}

      {/* ── 4-Way Omni-Directional Connection Handles ── */}
      {/* TOP */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-top-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
        style={{ background: cfg.accentColor }}
        title="Connect from Top"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-top-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
        style={{ background: cfg.accentColor }}
        title="Connect to Top"
      />

      {/* RIGHT */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-right-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
        style={{ background: cfg.accentColor }}
        title="Connect from Right"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-right-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
        style={{ background: cfg.accentColor }}
        title="Connect to Right"
      />

      {/* BOTTOM */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-bottom-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
        style={{ background: cfg.accentColor }}
        title="Connect from Bottom"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-bottom-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
        style={{ background: cfg.accentColor }}
        title="Connect to Bottom"
      />

      {/* LEFT */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-left-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-30"
        style={{ background: cfg.accentColor }}
        title="Connect from Left"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={true}
        className="!w-3.5 !h-3.5 !-left-[7px] !border-2 !border-[var(--color-bg)] !opacity-0 group-hover:!opacity-100 hover:!scale-125 !transition-all !cursor-crosshair !z-20"
        style={{ background: cfg.accentColor }}
        title="Connect to Left"
      />

      {/* Main container boundary area */}
      <div
        className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
        style={{
          background: isDirectHovered ? `${cfg.accentColor}12` : isIlluminated ? `${cfg.accentColor}08` : cfg.bgColor,
          border: `2px ${isIlluminated || selected ? 'solid' : 'dashed'} ${selected || isDirectHovered
              ? cfg.accentColor
              : isIlluminated
                ? cfg.accentColor
                : hovered
                  ? cfg.borderColorHover
                  : cfg.borderColor
            }`,
          boxShadow: selected || isDirectHovered
            ? `0 0 0 2px var(--color-primary-glow), 0 4px 16px rgba(0,0,0,0.2)`
            : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
        }}
      />

      {/* Inner content */}
      <div className="relative h-full overflow-hidden rounded-[var(--radius-lg)]">
        {/* Header strip */}
        <div
          className="flex items-center justify-between px-3 h-[46px] shrink-0 pointer-events-auto"
          style={{
            background: isIlluminated ? `${cfg.accentColor}20` : cfg.headerColor,
            borderBottom: collapsed ? 'none' : `1px solid ${cfg.borderColor}`,
          }}
        >
          {/* Left: icon + editable name */}
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <div
              className="w-7 h-7 rounded-[3px] flex items-center justify-center shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <AzureIcon type={res.type} size={18} />
            </div>

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
                  className="nodrag nowheel text-[12px] font-bold px-1.5 py-0.5 rounded outline-none w-full border bg-[var(--color-surface)] border-[var(--color-primary)] text-[var(--color-text-primary)]"
                />
              ) : (
                <div
                  className="text-[12px] font-bold truncate flex items-center gap-1.5 cursor-text hover:text-[var(--color-primary-light)] transition-colors group/name text-[var(--color-text-primary)]"
                  title="Double-click to rename"
                  onDoubleClick={handleStartRename}
                >
                  <span className="truncate">{res.name}</span>
                  <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/name:opacity-70 shrink-0 text-[var(--color-primary-light)]" />
                </div>
              )}
            </div>
          </div>

          {/* Right: CIDR pill + type badge + collapse button */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {copiedHcl && (
              <span className="text-[10px] font-bold text-[#1F845A] bg-[#DCFFF1] dark:bg-[#143B2B] dark:text-[#4BCE97] px-1.5 py-0.5 rounded-[3px] flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied
              </span>
            )}

            {cidr && !collapsed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                {cidr}
              </span>
            )}

            <div
              className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] hidden sm:block uppercase tracking-wider"
              style={{ background: cfg.badgeBg, color: cfg.badgeColor, border: `1px solid ${cfg.badgeBorder}` }}
            >
              {cfg.badgeText}
            </div>
            <button
              className="w-6 h-6 rounded-[3px] flex items-center justify-center transition-colors hover:bg-[var(--color-surface-3)] pointer-events-auto text-[var(--color-text-secondary)]"
              onClick={e => { e.stopPropagation(); setCollapsed(p => !p); }}
              title={collapsed ? 'Expand container' : 'Collapse container'}
            >
              {collapsed
                ? <ChevronDown className="w-3.5 h-3.5" />
                : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Drop zone hint when empty & not collapsed */}
        {!collapsed && childCount === 0 && (
          <div
            className="absolute inset-0 top-[46px] flex items-center justify-center pointer-events-none"
          >
            <div className="text-center p-3 rounded border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)]/40">
              <div
                className="text-[11px] font-semibold"
                style={{ color: cfg.accentColor }}
              >
                Drop Azure Resources Here
              </div>
              <div
                className="text-[10px] mt-0.5 text-[var(--color-text-muted)]"
              >
                {res.type === 'azurerm_resource_group'
                  ? 'VNets, compute, databases, storage & PaaS'
                  : res.type === 'azurerm_virtual_network'
                    ? 'Subnets & network gateways'
                    : 'VMs, private endpoints & application services'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Context Menu (Dropdown Menu) ── */}
      {showMenu && (
        <div
          className="absolute left-8 top-10 z-50 min-w-[170px] rounded-[var(--radius-sm)] py-1 animate-fade-in"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 8px -2px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
          }}
          onMouseLeave={() => setShowMenu(false)}
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
      )}
    </div>
  );
});

ContainerNode.displayName = 'ContainerNode';
