import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge as flowAddEdge,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTopologyStore } from '../../store/useTopologyStore';
import { AzureNode } from './AzureNode';
import { ContainerNode } from './ContainerNode';
import { DeletableEdge, getRelationConfig } from './DeletableEdge';
import { CatalogItem, AzureResourceIR, CanonicalTopologyIR } from '../../services/api';

// ─── Custom Flow Types ───────────────────────────────────────────────────

const nodeTypes: Record<string, React.ComponentType<any>> = {
  azureResource: AzureNode,
  containerResource: ContainerNode,
};

const edgeTypes: Record<string, React.ComponentType<any>> = {
  deletableEdge: DeletableEdge,
};

// ─── Empty Canvas State ───────────────────────────────────────────────────

const EmptyState: React.FC<{ onOpenCopilot?: () => void }> = ({ onOpenCopilot }) => (
  <div className="canvas-empty-state animate-fade-in-up">
    <div
      className="w-20 h-20 rounded-[var(--radius-xl)] flex items-center justify-center mb-2"
      style={{ background: 'var(--color-primary-glow)', border: '1px dashed var(--color-border-active)' }}
    >
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="14" height="14" rx="3" fill="#1B8A4B" fillOpacity="0.28" stroke="#1B8A4B" strokeOpacity="0.7" strokeWidth="1.5" />
        <rect x="26" y="8" width="14" height="14" rx="3" fill="#01B39F" fillOpacity="0.28" stroke="#01B39F" strokeOpacity="0.7" strokeWidth="1.5" />
        <rect x="8" y="26" width="14" height="14" rx="3" fill="#2B5A43" fillOpacity="0.28" stroke="#4BCE97" strokeOpacity="0.7" strokeWidth="1.5" />
        <rect x="26" y="26" width="14" height="14" rx="3" fill="#D97706" fillOpacity="0.28" stroke="#F5CD47" strokeOpacity="0.7" strokeWidth="1.5" />
        <line x1="22" y1="15" x2="26" y2="15" stroke="#1B8A4B" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="2,2" />
        <line x1="15" y1="22" x2="15" y2="26" stroke="#01B39F" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="2,2" />
        <line x1="33" y1="22" x2="33" y2="26" stroke="#4BCE97" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="2,2" />
      </svg>
    </div>
    <h3>Design your Azure architecture</h3>
    <p>
      Drag resources or blueprints from the left catalog onto the canvas,<br />
      or let the <strong style={{ color: 'var(--color-primary-light)' }}>AI Copilot</strong> synthesize an architecture for you
    </p>
    <div className="flex items-center gap-3 mt-3 pointer-events-auto">
      {onOpenCopilot && (
        <button
          onClick={onOpenCopilot}
          className="btn-primary flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold shadow-xs"
        >
          <span>Open AI Copilot</span>
          <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-black/15 font-mono">⌘/</kbd>
        </button>
      )}
    </div>
  </div>
);

// ─── Canvas Inner (needs ReactFlow context) ───────────────────────────────

const CanvasInner: React.FC = () => {
  const {
    topology,
    selectedResourceId,
    hoveredResourceId,
    gridMode,
    snapToGrid,
    showMiniMap,
    selectResource,
    setHoveredResource,
    updateResourcePosition,
    updateResourceParent,
    moveContainerAndChildren,
    findContainingContainer,
    addResource,
    addEdge,
    removeEdge,
    removeResource,
    themeMode,
    loadTemplate,
    toggleCopilot,
  } = useTopologyStore();

  const isLight = themeMode === 'light';
  const reactFlow = useReactFlow();
  const isEmpty = topology.resources.length === 0;

  // Track React Flow's ResizeObserver-measured dimensions so MiniMap and bounds have accurate sizes
  const [measuredDimensions, setMeasuredDimensions] = React.useState<
    Record<string, { width: number; height: number }>
  >({});

  // Track drag start positions for delta calculation
  const dragStartPositions = React.useRef<Record<string, { x: number; y: number }>>({});

  // Helper to resolve ancestor path for a resource: [Grandparent, Parent]
  const getAncestors = useCallback((resourceId: string) => {
    const path: Array<{ id: string; name: string; type: string; container_level?: string }> = [];
    let curr = topology.resources.find((r) => r.id === resourceId);
    while (curr && curr.parent_id) {
      const parent = topology.resources.find((r) => r.id === curr!.parent_id);
      if (parent) {
        path.unshift({
          id: parent.id,
          name: parent.name,
          type: parent.type,
          container_level: parent.container_level,
        });
        curr = parent;
      } else {
        break;
      }
    }
    return path;
  }, [topology.resources]);

  // Helper to resolve all descendants for a container
  const getNestedChildren = useCallback((containerId: string) => {
    const children: AzureResourceIR[] = [];
    const collect = (parentId: string) => {
      const direct = topology.resources.filter((r) => r.parent_id === parentId);
      for (const ch of direct) {
        children.push(ch);
        collect(ch.id);
      }
    };
    collect(containerId);
    return children;
  }, [topology.resources]);

  // Convert Canonical IR resources into React Flow nodes with rich hierarchy context
  const nodes: Node[] = useMemo(() => {
    const activeFocusId = hoveredResourceId || selectedResourceId;
    const focusAncestors = activeFocusId ? getAncestors(activeFocusId).map((a) => a.id) : [];

    return topology.resources.map((res) => {
      const isContainer = ['rg', 'vnet', 'subnet'].includes(res.container_level ?? '');
      const containerZ = res.container_level === 'rg' ? 1 : res.container_level === 'vnet' ? 2 : 3;
      const ancestors = getAncestors(res.id);
      const nestedChildren = isContainer ? getNestedChildren(res.id) : [];
      const childCount = nestedChildren.length;

      // Cross-highlight state:
      // 1. Container glows if the currently hovered/selected item is inside this container
      const isChildHovered = Boolean(activeFocusId && (focusAncestors.includes(res.id) || (isContainer && nestedChildren.some((c) => c.id === activeFocusId))));
      // 2. Resource card glows if its containing parent container is currently hovered/selected
      const isParentHovered = Boolean(activeFocusId && ancestors.some((a) => a.id === activeFocusId));

      const defaultW = res.container_level === 'rg' ? 560 : res.container_level === 'vnet' ? 480 : 400;
      const defaultH = res.container_level === 'rg' ? 340 : res.container_level === 'vnet' ? 240 : 180;
      const nodeWidth = res.dimensions?.width ?? (isContainer ? defaultW : undefined);
      const nodeHeight = res.dimensions?.height ?? (isContainer ? defaultH : undefined);
      const measured = measuredDimensions[res.id] ?? (
        nodeWidth !== undefined && nodeHeight !== undefined
          ? { width: nodeWidth, height: nodeHeight }
          : undefined
      );

      return {
        id: res.id,
        type: isContainer ? 'containerResource' : 'azureResource',
        position: res.position ?? { x: 100, y: 100 },
        ...(measured ? { measured } : {}),
        data: {
          resource: res,
          childCount,
          childrenList: nestedChildren,
          ancestors,
          isChildHovered,
          isParentHovered,
          activeFocusId,
        },
        selected: selectedResourceId === res.id,
        zIndex: isContainer ? containerZ : 10,
        style: isContainer ? { pointerEvents: 'all' as const } : undefined,
      };
    }).sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  }, [topology.resources, selectedResourceId, hoveredResourceId, measuredDimensions, getAncestors, getNestedChildren]);

  const extractHandleSide = (handleId?: string | null): string => {
    if (!handleId) return '';
    const h = handleId.toLowerCase();
    if (h.includes('top')) return 'top';
    if (h.includes('right')) return 'right';
    if (h.includes('bottom')) return 'bottom';
    if (h.includes('left')) return 'left';
    return h;
  };

  // Convert Canonical IR edges into React Flow edges (filter out containment edges to eliminate diagram flooding!)
  const edges: Edge[] = useMemo(() =>
    topology.edges
      .filter((e) => e.relation_type !== 'containment' && e.relation_type !== 'subnet_association')
      .map((e) => {
        const relCfg = getRelationConfig(e.relation_type);
        const srcSide = extractHandleSide(e.source_handle) || 'right';
        const tgtSide = extractHandleSide(e.target_handle) || 'left';
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: `${srcSide}-source`,
          targetHandle: `${tgtSide}-target`,
          type: 'deletableEdge',
          animated: relCfg.animated,
          label: e.relation_type || 'dependency',
          style: {
            stroke: relCfg.stroke,
            strokeDasharray: relCfg.strokeDash,
            strokeWidth: 2,
          },
        };
      }),
    [topology.edges]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const dimUpdates: Record<string, { width: number; height: number }> = {};
      const removedIds: string[] = [];

      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateResourcePosition(change.id, change.position);
        } else if (change.type === 'dimensions' && change.dimensions) {
          if (change.dimensions.width > 0 && change.dimensions.height > 0) {
            dimUpdates[change.id] = {
              width: change.dimensions.width,
              height: change.dimensions.height,
            };
          }
        } else if (change.type === 'select' && change.selected) {
          selectResource(change.id);
        } else if (change.type === 'remove') {
          removedIds.push(change.id);
          removeResource(change.id);
        }
      });

      if (Object.keys(dimUpdates).length > 0 || removedIds.length > 0) {
        setMeasuredDimensions((prev) => {
          let changed = false;
          const next = { ...prev };

          for (const [id, dims] of Object.entries(dimUpdates)) {
            if (prev[id]?.width !== dims.width || prev[id]?.height !== dims.height) {
              next[id] = dims;
              changed = true;
            }
          }
          for (const id of removedIds) {
            if (id in next) {
              delete next[id];
              changed = true;
            }
          }

          return changed ? next : prev;
        });
      }
    },
    [updateResourcePosition, selectResource, removeResource]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeEdge(change.id);
        }
      });
    },
    [removeEdge]
  );

  const onNodeDragStart = useCallback((_event: MouseEvent | TouchEvent, node: Node) => {
    dragStartPositions.current[node.id] = { ...node.position };
  }, []);

  const onNodeDrag = useCallback(
    (_event: MouseEvent | TouchEvent, node: Node) => {
      const res = topology.resources.find((r) => r.id === node.id);
      if (!res || !['rg', 'vnet', 'subnet'].includes(res.container_level ?? '')) return;

      const prevPos = dragStartPositions.current[node.id];
      if (prevPos) {
        const delta = {
          x: node.position.x - prevPos.x,
          y: node.position.y - prevPos.y,
        };
        if (delta.x !== 0 || delta.y !== 0) {
          moveContainerAndChildren(node.id, delta);
          dragStartPositions.current[node.id] = { ...node.position };
        }
      }
    },
    [topology.resources, moveContainerAndChildren]
  );

  const onNodeDragStop = useCallback(
    (_event: MouseEvent | TouchEvent, node: Node) => {
      delete dragStartPositions.current[node.id];

      const res = topology.resources.find((r) => r.id === node.id);
      if (!res) return;

      // When dragging any resource (VM, DB, or subnet/vnet), detect target container
      const isContainer = ['rg', 'vnet', 'subnet'].includes(res.container_level ?? '');
      const defaultW = isContainer
        ? (res.container_level === 'rg' ? 560 : res.container_level === 'vnet' ? 480 : 400)
        : 220;
      const defaultH = isContainer
        ? (res.container_level === 'rg' ? 340 : res.container_level === 'vnet' ? 240 : 180)
        : 120;
      const nodeW = node.measured?.width ?? node.width ?? res.dimensions?.width ?? defaultW;
      const nodeH = node.measured?.height ?? node.height ?? res.dimensions?.height ?? defaultH;

      const containing = findContainingContainer(node.position, res.type, node.id, { width: nodeW, height: nodeH });
      const targetParentId = containing ? containing.id : null;

      if (targetParentId !== res.parent_id) {
        updateResourceParent(node.id, targetParentId);
      }
    },
    [topology.resources, findContainingContainer, updateResourceParent]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const srcRes = topology.resources.find((r) => r.id === connection.source);
        const tgtRes = topology.resources.find((r) => r.id === connection.target);
        const srcType = srcRes?.type || '';
        const tgtType = tgtRes?.type || '';

        // Infer relation type according to Azure architectural patterns
        let relationType = 'dependency';
        if (srcType === 'azurerm_virtual_network' && tgtType === 'azurerm_virtual_network') {
          relationType = 'network_peering'; // Cyan
        } else if (
          srcType.includes('private_endpoint') ||
          tgtType.includes('private_endpoint') ||
          srcType.includes('storage') ||
          tgtType.includes('storage') ||
          srcType.includes('database') ||
          tgtType.includes('database') ||
          srcType.includes('mssql') ||
          tgtType.includes('mssql') ||
          srcType.includes('cosmos') ||
          tgtType.includes('cosmos') ||
          srcType.includes('redis') ||
          tgtType.includes('redis')
        ) {
          relationType = 'private_endpoint'; // Green
        } else if (
          srcType.includes('network_security_group') ||
          tgtType.includes('network_security_group') ||
          srcType.includes('firewall') ||
          tgtType.includes('firewall') ||
          srcType.includes('route_table') ||
          tgtType.includes('route_table')
        ) {
          relationType = 'security_binding'; // Amber
        } else if (
          srcType.includes('identity') ||
          tgtType.includes('identity') ||
          srcType.includes('role_assignment') ||
          tgtType.includes('role_assignment') ||
          srcType.includes('key_vault') ||
          tgtType.includes('key_vault')
        ) {
          relationType = 'identity'; // Purple
        } else if (srcType === 'azurerm_subnet' || tgtType === 'azurerm_subnet') {
          relationType = 'subnet_association'; // Indigo
        }

        const srcSide = extractHandleSide(connection.sourceHandle) || 'right';
        const tgtSide = extractHandleSide(connection.targetHandle) || 'left';

        addEdge({
          id: `edge_${connection.source}_${connection.target}_${Date.now()}`,
          source: connection.source,
          target: connection.target,
          source_handle: srcSide,
          target_handle: tgtSide,
          relation_type: relationType,
        });
      }
    },
    [topology.resources, addEdge, extractHandleSide]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw =
        event.dataTransfer.getData('application/azure-template') ||
        event.dataTransfer.getData('application/json') ||
        event.dataTransfer.getData('text/plain');

      if (!raw) return;

      try {
        const item = JSON.parse(raw);

        // Check if dropped payload was an entire template blueprint
        if (item && Array.isArray(item.resources)) {
          loadTemplate(item as CanonicalTopologyIR);
          setTimeout(() => {
            reactFlow.fitView({ padding: 0.18, duration: 400 });
          }, 80);
          return;
        }

        // Handle single resource drop from catalog
        if (item && item.resourceType) {
          const flowPos = reactFlow.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });

          const isContainer = ['rg', 'vnet', 'subnet'].includes(item.containerLevel || '');
          const targetPos = {
            x: Math.round(flowPos.x - (isContainer ? 60 : 30)),
            y: Math.round(flowPos.y - 25),
          };

          addResource(item as CatalogItem, targetPos);
        }
      } catch (err) {
        console.error('Drop parse error:', err);
      }
    },
    [reactFlow, addResource, loadTemplate]
  );

  return (
    <div className="w-full h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectResource(node.id)}
        onPaneClick={() => {
          selectResource(null);
          setHoveredResource(null);
        }}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        fitViewOptions={{ padding: 0.2, duration: 600 }}
        minZoom={0.1}
        maxZoom={2.5}
        snapToGrid={snapToGrid}
        snapGrid={[16, 16]}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Grid Background (Lines, Dots, or Hidden) */}
        {gridMode === 'grid' && (
          <Background
            variant={BackgroundVariant.Lines}
            gap={32}
            size={0.5}
            color={isLight ? 'rgba(203,213,225,0.75)' : 'rgba(42,43,56,0.7)'}
          />
        )}
        {gridMode === 'dotted' && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color={isLight ? 'rgba(87,83,78,0.45)' : 'rgba(167,230,143,0.24)'}
          />
        )}

        {/* Custom Controls */}
        <Controls
          showFitView={false}
          showZoom={false}
          className="!bottom-4 !left-4 !top-auto !right-auto"
        />

        {/* Interactive MiniMap */}
        {showMiniMap && (
          <MiniMap
            pannable
            zoomable
            onNodeClick={(_, node) => selectResource(node.id)}
            nodeStrokeColor={(n) => {
              if (n.id === selectedResourceId) return isLight ? '#1B7A43' : '#A7E68F';
              if (n.id === hoveredResourceId) return isLight ? '#2B5A43' : '#4FD1C5';
              if (n.type === 'containerResource') return isLight ? 'rgba(27,122,67,0.65)' : 'rgba(167,230,143,0.55)';
              return isLight ? 'rgba(28,25,23,0.6)' : 'rgba(167,230,143,0.75)';
            }}
            nodeColor={(n) => {
              if (n.id === selectedResourceId) return isLight ? 'rgba(27,122,67,0.32)' : 'rgba(167,230,143,0.42)';
              if (n.type === 'containerResource') return isLight ? 'rgba(27,122,67,0.08)' : 'rgba(167,230,143,0.09)';
              return isLight ? '#FFFFFF' : '#2D3A30';
            }}
            nodeStrokeWidth={1.5}
            maskColor={isLight ? 'rgba(231,229,228,0.65)' : 'rgba(12,15,13,0.65)'}
            className="!bottom-4 !right-4 !top-auto !left-auto !rounded-[var(--radius-lg)] !overflow-hidden"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.4)',
            }}
          />
        )}
      </ReactFlow>

      {/* Empty state overlay */}
      {isEmpty && <EmptyState onOpenCopilot={() => toggleCopilot(true)} />}
    </div>
  );
};

// ─── Exported Canvas (uses ReactFlowProvider from TopologyStudio) ─────────

export const Canvas: React.FC = () => <CanvasInner />;
