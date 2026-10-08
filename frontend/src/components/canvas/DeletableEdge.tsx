import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  Position,
} from '@xyflow/react';
import { X } from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';

// ─── Relation Type Color Configuration (ADS Tokens) ───────────────────────

export const RELATION_STYLE: Record<
  string,
  { stroke: string; label: string; strokeDash?: string; animated?: boolean }
> = {
  // Network Traffic / Flow (Primary Blue)
  network_traffic: { stroke: '#0C66E4', label: 'Traffic Flow', animated: true },

  // VNet Peering (Teal)
  network_peering: { stroke: '#00A3BF', label: 'VNet Peering', animated: true },
  virtual_network_peering: { stroke: '#00A3BF', label: 'VNet Peering', animated: true },
  vnet_peering:    { stroke: '#00A3BF', label: 'VNet Peering', animated: true },
  peering:         { stroke: '#00A3BF', label: 'VNet Peering', animated: true },

  // Private Endpoints / Private Links (Green)
  private_endpoint:{ stroke: '#1F845A', label: 'Private Endpoint', animated: true },
  private_link:    { stroke: '#1F845A', label: 'Private Link', animated: true },
  data:            { stroke: '#1F845A', label: 'Data Flow', animated: true },

  // NSG / Route Association / Security Binding (Amber)
  security_binding:{ stroke: '#E2B203', label: 'NSG / Security', animated: false, strokeDash: '5,3' },
  nsg_association: { stroke: '#E2B203', label: 'NSG Rule', animated: false, strokeDash: '5,3' },
  route_table:     { stroke: '#E2B203', label: 'Route Association', animated: false, strokeDash: '5,3' },
  network:         { stroke: '#E2B203', label: 'Network Rule', animated: true },

  // IAM / Managed Identity Role Assignments (Purple)
  identity:        { stroke: '#8270DB', label: 'IAM / Identity', animated: false, strokeDash: '4,4' },
  iam:             { stroke: '#8270DB', label: 'IAM Role', animated: false, strokeDash: '4,4' },
  rbac:            { stroke: '#8270DB', label: 'RBAC Assignment', animated: false, strokeDash: '4,4' },

  // Subnet Association (Blue)
  subnet_association: { stroke: '#579DFF', label: 'Subnet Attached', animated: false, strokeDash: '4,3' },

  // Containment (Subtle Blue dashed)
  containment:     { stroke: 'rgba(12,102,228,0.45)', label: 'Contains', animated: false, strokeDash: '6,4' },

  // Default Dependency (Primary Blue)
  dependency:      { stroke: '#0C66E4', label: 'Depends On', animated: true },
};

export const getRelationConfig = (relationType?: string) => {
  const norm = (relationType || 'dependency').toLowerCase();
  return RELATION_STYLE[norm] || RELATION_STYLE.dependency;
};

export const DeletableEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
}) => {
  const { removeEdge } = useTopologyStore();
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relationType = String(label || 'dependency');
  const relCfg = getRelationConfig(relationType);
  const strokeColor = (style?.stroke as string) || relCfg.stroke;
  const strokeDash = (style?.strokeDasharray as string) || relCfg.strokeDash;

  const sourceBtnX = sourcePosition === Position.Left ? sourceX - 12 : sourcePosition === Position.Right ? sourceX + 12 : sourceX;
  const sourceBtnY = sourcePosition === Position.Top ? sourceY - 12 : sourcePosition === Position.Bottom ? sourceY + 12 : sourceY;

  const targetBtnX = targetPosition === Position.Left ? targetX - 12 : targetPosition === Position.Right ? targetX + 12 : targetX;
  const targetBtnY = targetPosition === Position.Top ? targetY - 12 : targetPosition === Position.Bottom ? targetY + 12 : targetY;

  const showDeleteButtons = isHovered || selected;

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      {/* Invisible wider hit-path to easily detect mouse hover over edge */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={28}
        className="cursor-pointer"
      />

      {/* Visible styled edge line */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isHovered || selected ? '#CA3521' : strokeColor,
          strokeWidth: isHovered || selected ? 2.5 : 1.75,
          strokeDasharray: strokeDash,
          transition: 'stroke 0.1s ease, stroke-width 0.1s ease',
        }}
      />

      <EdgeLabelRenderer>
        {/* ── Center Label (Badge) ── */}
        <div
          className="nodrag nopan flex items-center px-2 py-0.5 rounded-[3px] shadow pointer-events-none transition-all duration-100"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'var(--color-surface)',
            border: `1px solid ${isHovered || selected ? '#CA3521' : strokeColor}55`,
          }}
        >
          <span
            className="text-[9.5px] font-bold tracking-wide uppercase font-mono"
            style={{
              color: isHovered || selected ? '#FD9891' : strokeColor,
            }}
          >
            {relCfg.label}
          </span>
        </div>

        {/* ── Side Delete Button at Source Resource Box ── */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${sourceBtnX}px,${sourceBtnY}px)`,
            pointerEvents: 'all',
            zIndex: 100,
          }}
          className="nodrag nopan"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeEdge(id);
            }}
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-100 shadow border ${
              showDeleteButtons
                ? 'opacity-100 scale-100 bg-[#CA3521] border-[#CA3521] text-white hover:bg-[#AE2A19] hover:scale-110'
                : 'opacity-0 scale-75 pointer-events-none bg-[var(--color-surface)] border-[var(--color-border)] text-white/50'
            }`}
            title="Disconnect relationship"
          >
            <X className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>

        {/* ── Side Delete Button at Target Resource Box ── */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${targetBtnX}px,${targetBtnY}px)`,
            pointerEvents: 'all',
            zIndex: 100,
          }}
          className="nodrag nopan"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeEdge(id);
            }}
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-100 shadow border ${
              showDeleteButtons
                ? 'opacity-100 scale-100 bg-[#CA3521] border-[#CA3521] text-white hover:bg-[#AE2A19] hover:scale-110'
                : 'opacity-0 scale-75 pointer-events-none bg-[var(--color-surface)] border-[var(--color-border)] text-white/50'
            }`}
            title="Disconnect relationship"
          >
            <X className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </g>
  );
};
