import { create } from 'zustand';
import { CanonicalTopologyIR, AzureResourceIR, TopologyEdgeIR, CatalogItem, ApiService } from '../services/api';
import { ARCHITECTURE_TEMPLATES } from '../data/architectureTemplates';

export type GridMode = 'grid' | 'dotted' | 'hidden';

interface TopologyStore {
  topology: CanonicalTopologyIR;
  catalog: CatalogItem[];
  selectedResourceId: string | null;
  generatedCode: Record<string, string>;
  activeCodeFile: string;
  securitySummary: any;
  blastRadius: any;
  finopsSummary: any;
  isSyncing: boolean;
  isCopilotOpen: boolean;
  isImportOpen: boolean;
  isInspectorOpen: boolean;
  isInspectorPinned: boolean;
  themeMode: 'dark' | 'light';
  generatedTopologyPreview: CanonicalTopologyIR | null;
  isGenerating: boolean;
  activeTab: 'inspector' | 'security' | 'finops';
  hoveredResourceId: string | null;
  history: CanonicalTopologyIR[];
  future: CanonicalTopologyIR[];
  gridMode: GridMode;
  showGrid: boolean;
  showMiniMap: boolean;
  snapToGrid: boolean;
  isSaved: boolean;
  viewMode: 'detailed' | 'simple';

  // Actions
  fetchCatalog: () => Promise<void>;
  setTopology: (topology: CanonicalTopologyIR) => void;
  loadTemplate: (templateTopology: CanonicalTopologyIR) => Promise<void>;
  resetProject: () => void;
  clearCanvas: () => void;
  markSaved: (saved?: boolean) => void;
  setViewMode: (mode: 'detailed' | 'simple') => void;
  toggleViewMode: () => void;
  selectResource: (id: string | null) => void;
  setHoveredResource: (id: string | null) => void;
  setActiveCodeFile: (filename: string) => void;
  setActiveTab: (tab: 'inspector' | 'security' | 'finops') => void;
  toggleCopilot: (open?: boolean) => void;
  openImport: () => void;
  closeImport: () => void;
  openInspector: (resourceId?: string) => void;
  closeInspector: () => void;
  toggleInspector: (open?: boolean) => void;
  toggleInspectorPin: (pinned?: boolean) => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
  toggleThemeMode: () => void;
  renameProject: (name: string) => void;
  setGridMode: (mode: GridMode) => void;
  cycleGridMode: () => void;
  toggleGrid: () => void;
  toggleMiniMap: (show?: boolean) => void;
  toggleSnapToGrid: () => void;
  undo: () => void;
  redo: () => void;

  addResource: (item: CatalogItem, position: { x: number; y: number }, parentId?: string | null) => Promise<void>;
  renameResource: (id: string, newName: string) => Promise<void>;
  updateResourceProperties: (id: string, properties: Record<string, any>) => Promise<void>;
  updateResourcePosition: (id: string, position: { x: number; y: number }) => void;
  updateResourceDimensions: (id: string, dimensions: { width: number; height: number }) => void;
  updateResourceBounds: (id: string, bounds: { position?: { x: number; y: number }; dimensions: { width: number; height: number } }) => void;
  updateResourceParent: (id: string, newParentId: string | null) => Promise<void>;
  duplicateResource: (id: string) => Promise<void>;
  getResourceHcl: (id: string) => string;
  moveContainerAndChildren: (containerId: string, delta: { x: number; y: number }) => void;
  findContainingContainer: (position: { x: number; y: number }, resourceType?: string, excludeId?: string, nodeDimensions?: { width: number; height: number }) => AzureResourceIR | null;
  removeResource: (id: string) => Promise<void>;
  addEdge: (edge: TopologyEdgeIR) => Promise<void>;
  removeEdge: (edgeId: string) => Promise<void>;

  refreshCodeAndAnalysis: () => Promise<void>;
  syncFromHcl: (hcl: string) => Promise<void>;
  importFromHcl: (hcl: string) => Promise<void>;
  importFromState: (stateJson: string, projectName?: string) => Promise<void>;
  importFromAzure: (queryResultsJson: string, subscriptionId?: string) => Promise<void>;
  runAutoLayout: () => Promise<void>;
  applyRemediation: (finding: any) => Promise<void>;
  generateArchitecture: (prompt: string) => Promise<{ topology: CanonicalTopologyIR }>;
  applyGeneratedTopology: () => void;
  loadSample: (id: string) => void;
}

const DEFAULT_TOPOLOGY: CanonicalTopologyIR = {
  version: '1.0.0',
  metadata: {
    project_name: 'Untitled Project',
    target_cloud: 'Azure',
    iac_format: 'Terraform',
    default_location: 'eastus',
    version: '1.0.0',
  },
  resources: [],
  edges: [],
};

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('azure_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
};

const applyThemeToDOM = (theme: 'dark' | 'light') => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  }
};

const getInitialGridMode = (): GridMode => {
  const saved = localStorage.getItem('azure_grid_mode');
  if (saved === 'grid' || saved === 'dotted' || saved === 'hidden') return saved;
  return 'grid';
};

const getInitialShowMiniMap = (): boolean => {
  const saved = localStorage.getItem('azure_show_minimap');
  return saved !== null ? saved === 'true' : false;
};

const getInitialViewMode = (): 'detailed' | 'simple' => {
  if (typeof window === 'undefined') return 'simple';
  const saved = localStorage.getItem('azure_canvas_view_mode');
  if (saved === 'detailed' || saved === 'simple') return saved;
  return 'simple';
};

const initialTheme = getInitialTheme();
const initialGridMode = getInitialGridMode();
applyThemeToDOM(initialTheme);

export const useTopologyStore = create<TopologyStore>((set, get) => ({
  topology: DEFAULT_TOPOLOGY,
  catalog: [],
  selectedResourceId: null,
  generatedCode: {},
  activeCodeFile: 'main.tf',
  securitySummary: null,
  blastRadius: null,
  finopsSummary: null,
  isSyncing: false,
  isCopilotOpen: false,
  isImportOpen: false,
  isInspectorOpen: false,
  isInspectorPinned: false,
  themeMode: initialTheme,
  generatedTopologyPreview: null,
  isGenerating: false,
  activeTab: 'inspector',
  hoveredResourceId: null,
  history: [],
  future: [],
  gridMode: initialGridMode,
  showGrid: initialGridMode !== 'hidden',
  showMiniMap: getInitialShowMiniMap(),
  snapToGrid: false,
  isSaved: false,
  viewMode: getInitialViewMode(),

  markSaved: (saved = true) => set({ isSaved: saved }),

  resetProject: () => {
    const empty: CanonicalTopologyIR = {
      version: '1.0.0',
      metadata: {
        project_name: 'Untitled Project',
        target_cloud: 'Azure',
        iac_format: 'Terraform',
        default_location: 'eastus',
        version: '1.0.0',
      },
      resources: [],
      edges: [],
    };
    const state = get();
    const newHistory = [...state.history, JSON.parse(JSON.stringify(state.topology))].slice(-25);
    set({
      topology: empty,
      history: newHistory,
      future: [],
      selectedResourceId: null,
      hoveredResourceId: null,
      isSaved: false,
    });
    get().refreshCodeAndAnalysis();
  },

  clearCanvas: () => {
    const state = get();
    if (state.topology.resources.length === 0) return;
    const cleared: CanonicalTopologyIR = {
      ...state.topology,
      resources: [],
      edges: [],
    };
    const newHistory = [...state.history, JSON.parse(JSON.stringify(state.topology))].slice(-25);
    set({
      topology: cleared,
      history: newHistory,
      future: [],
      selectedResourceId: null,
      hoveredResourceId: null,
      isSaved: false,
    });
    get().refreshCodeAndAnalysis();
  },

  setViewMode: (mode: 'detailed' | 'simple') => {
    localStorage.setItem('azure_canvas_view_mode', mode);
    set({ viewMode: mode });
  },

  toggleViewMode: () => {
    const next = get().viewMode === 'detailed' ? 'simple' : 'detailed';
    localStorage.setItem('azure_canvas_view_mode', next);
    set({ viewMode: next });
  },

  loadTemplate: async (templateTopology: CanonicalTopologyIR) => {
    const state = get();
    const cloned = JSON.parse(JSON.stringify(templateTopology));
    const newHistory = [...state.history, JSON.parse(JSON.stringify(state.topology))].slice(-25);
    set({
      topology: cloned,
      history: newHistory,
      future: [],
      selectedResourceId: null,
      hoveredResourceId: null,
      isSaved: false,
    });
    await get().refreshCodeAndAnalysis();
  },

  fetchCatalog: async () => {
    try {
      const catalog = await ApiService.getCatalog();
      set({ catalog });
    } catch (err) {
      console.warn('Could not load dynamic catalog, using fallback', err);
    }
  },

  setTopology: (topology) => {
    const state = get();
    const newHistory = [...state.history, JSON.parse(JSON.stringify(state.topology))].slice(-25);
    set({ topology, history: newHistory, future: [], isSaved: false });
    get().refreshCodeAndAnalysis();
  },

  selectResource: (id) => set({
    selectedResourceId: id,
  }),
  setHoveredResource: (id) => set({ hoveredResourceId: id }),
  setActiveCodeFile: (filename) => set({ activeCodeFile: filename }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleCopilot: (open) => set((state) => ({ isCopilotOpen: open !== undefined ? open : !state.isCopilotOpen })),
  openImport: () => set({ isImportOpen: true }),
  closeImport: () => set({ isImportOpen: false }),

  openInspector: (resourceId) => {
    if (resourceId) {
      set({ selectedResourceId: resourceId, isInspectorOpen: true });
    } else {
      set((state) => {
        const targetId = state.selectedResourceId || state.topology.resources[0]?.id || null;
        return { selectedResourceId: targetId, isInspectorOpen: true };
      });
    }
  },
  closeInspector: () => set({ isInspectorOpen: false, isInspectorPinned: false }),
  toggleInspector: (open) => set((state) => {
    const currentlyVisible = state.isInspectorOpen || state.isInspectorPinned;
    const nextOpen = open !== undefined ? open : !currentlyVisible;
    return {
      isInspectorOpen: nextOpen,
      isInspectorPinned: nextOpen ? state.isInspectorPinned : false,
    };
  }),
  toggleInspectorPin: (pinned) => set((state) => {
    const nextPinned = pinned !== undefined ? pinned : !state.isInspectorPinned;
    return { isInspectorPinned: nextPinned, isInspectorOpen: true };
  }),
  setThemeMode: (mode) => {
    localStorage.setItem('azure_theme', mode);
    applyThemeToDOM(mode);
    set({ themeMode: mode });
  },
  toggleThemeMode: () => {
    const next = get().themeMode === 'light' ? 'dark' : 'light';
    localStorage.setItem('azure_theme', next);
    applyThemeToDOM(next);
    set({ themeMode: next });
  },

  renameProject: (name) => set((state) => ({
    topology: { ...state.topology, metadata: { ...state.topology.metadata, project_name: name } },
    isSaved: false,
  })),

  setGridMode: (mode) => {
    localStorage.setItem('azure_grid_mode', mode);
    set({ gridMode: mode, showGrid: mode !== 'hidden' });
  },

  cycleGridMode: () => {
    const cycleOrder: Record<GridMode, GridMode> = {
      grid: 'dotted',
      dotted: 'hidden',
      hidden: 'grid',
    };
    const current = get().gridMode;
    const next = cycleOrder[current] || 'grid';
    localStorage.setItem('azure_grid_mode', next);
    set({ gridMode: next, showGrid: next !== 'hidden' });
  },

  toggleGrid: () => {
    get().cycleGridMode();
  },

  toggleMiniMap: (show) => {
    const next = show !== undefined ? show : !get().showMiniMap;
    localStorage.setItem('azure_show_minimap', String(next));
    set({ showMiniMap: next });
  },

  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  undo: () => {
    const state = get();
    if (state.history.length === 0) return;
    const prev = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    const newFuture = [JSON.parse(JSON.stringify(state.topology)), ...state.future];
    set({ topology: prev, history: newHistory, future: newFuture, selectedResourceId: null, isSaved: false });
    get().refreshCodeAndAnalysis();
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    const newHistory = [...state.history, JSON.parse(JSON.stringify(state.topology))];
    set({ topology: next, history: newHistory, future: newFuture, selectedResourceId: null, isSaved: false });
    get().refreshCodeAndAnalysis();
  },

  findContainingContainer: (position, resourceType, excludeId, nodeDimensions) => {
    const state = get();
    const containers = state.topology.resources.filter((r) => {
      if (excludeId && r.id === excludeId) return false;
      return ['rg', 'vnet', 'subnet'].includes(r.container_level ?? '');
    });

    const isInside = (r: AzureResourceIR, pos: { x: number; y: number }) => {
      const rx = r.position?.x ?? 0;
      const ry = r.position?.y ?? 0;
      const rw = r.dimensions?.width ?? (r.container_level === 'rg' ? 560 : r.container_level === 'vnet' ? 480 : 400);
      const rh = r.dimensions?.height ?? (r.container_level === 'rg' ? 340 : r.container_level === 'vnet' ? 240 : 180);

      // Symmetrically test center of dragged resource if dimensions are provided
      const testX = nodeDimensions ? pos.x + nodeDimensions.width / 2 : pos.x;
      const testY = nodeDimensions ? pos.y + nodeDimensions.height / 2 : pos.y;

      return testX >= rx && testX <= rx + rw && testY >= ry && testY <= ry + rh;
    };

    // Sort containers by depth: subnet (depth 3) -> vnet (depth 2) -> rg (depth 1)
    const matchingContainers = containers
      .filter((c) => isInside(c, position))
      .sort((a, b) => {
        const depth = { subnet: 3, vnet: 2, rg: 1 };
        return (depth[b.container_level as 'subnet' | 'vnet' | 'rg'] || 0) -
          (depth[a.container_level as 'subnet' | 'vnet' | 'rg'] || 0);
      });

    if (matchingContainers.length === 0) return null;

    // Filter based on valid hierarchy for resourceType if provided
    if (resourceType === 'azurerm_resource_group') return null;
    if (resourceType === 'azurerm_virtual_network') {
      return matchingContainers.find((c) => c.container_level === 'rg') || null;
    }
    if (resourceType === 'azurerm_subnet') {
      return matchingContainers.find((c) => c.container_level === 'vnet' || c.container_level === 'rg') || null;
    }

    // For other resources (VMs, DBs, Storage, etc.) return the innermost container
    return matchingContainers[0];
  },

  addResource: async (item, position, parentId) => {
    const state = get();
    const cleanTypeName = item.resourceType.replace('azurerm_', '');
    const uniqueName = `${cleanTypeName}-${Date.now().toString().slice(-4)}`;
    const newId = `${item.resourceType}_${uniqueName.replace(/-/g, '_')}`;

    // Auto-detect container if parentId is not specified
    const resolvedParent = parentId !== undefined
      ? parentId
      : state.findContainingContainer(position, item.resourceType)?.id ?? null;

    const newResource: AzureResourceIR = {
      id: newId,
      type: item.resourceType,
      name: uniqueName,
      location: 'eastus',
      parent_id: resolvedParent,
      container_level: item.containerLevel as any,
      properties: { ...item.defaultProperties },
      position,
      dimensions: item.containerLevel === 'rg'
        ? { width: 560, height: 340 }
        : item.containerLevel === 'vnet'
          ? { width: 480, height: 260 }
          : item.containerLevel === 'subnet'
            ? { width: 400, height: 180 }
            : undefined,
    };

    const newEdges = [...state.topology.edges];
    if (resolvedParent) {
      const parent = state.topology.resources.find((r) => r.id === resolvedParent);
      const relationType = parent?.container_level === 'subnet'
        ? 'subnet_association'
        : 'containment';
      newEdges.push({
        id: `edge_${resolvedParent}_${newId}`,
        source: resolvedParent,
        target: newId,
        relation_type: relationType,
      });
    }

    const updatedTopology: CanonicalTopologyIR = {
      ...state.topology,
      resources: [...state.topology.resources, newResource],
      edges: newEdges,
    };

    const history = [...state.history, JSON.parse(JSON.stringify(state.topology))].slice(-25);
    set({ topology: updatedTopology, selectedResourceId: newId, history, future: [], isSaved: false });
    await get().refreshCodeAndAnalysis();
  },

  updateResourceParent: async (id, newParentId) => {
    const state = get();
    const targetResource = state.topology.resources.find((r) => r.id === id);
    if (!targetResource || targetResource.parent_id === newParentId) return;

    const updatedResources = state.topology.resources.map((r) =>
      r.id === id ? { ...r, parent_id: newParentId } : r
    );

    // Remove existing parent containment/association edges targeting this resource
    let updatedEdges = state.topology.edges.filter((e) =>
      !(e.target === id && (e.relation_type === 'containment' || e.relation_type === 'subnet_association'))
    );

    if (newParentId) {
      const parent = state.topology.resources.find((r) => r.id === newParentId);
      const relationType = parent?.container_level === 'subnet'
        ? 'subnet_association'
        : 'containment';
      updatedEdges.push({
        id: `edge_${newParentId}_${id}_${Date.now()}`,
        source: newParentId,
        target: id,
        relation_type: relationType,
      });
    }

    set({ topology: { ...state.topology, resources: updatedResources, edges: updatedEdges }, isSaved: false });
    await get().refreshCodeAndAnalysis();
  },

  moveContainerAndChildren: (containerId, delta) => {
    const state = get();
    const getDescendants = (parentId: string): string[] => {
      const children = state.topology.resources.filter((r) => r.parent_id === parentId).map((r) => r.id);
      return [...children, ...children.flatMap(getDescendants)];
    };

    const movedIds = new Set([containerId, ...getDescendants(containerId)]);

    const updatedResources = state.topology.resources.map((r) => {
      if (movedIds.has(r.id)) {
        return {
          ...r,
          position: {
            x: (r.position?.x ?? 0) + delta.x,
            y: (r.position?.y ?? 0) + delta.y,
          },
        };
      }
      return r;
    });

    set({ topology: { ...state.topology, resources: updatedResources }, isSaved: false });
  },

  renameResource: async (id, newName) => {
    const state = get();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const target = state.topology.resources.find((r) => r.id === id);
    if (!target || target.name === trimmed) return;

    const history = [...state.history, JSON.parse(JSON.stringify(state.topology))].slice(-25);
    const updatedResources = state.topology.resources.map((r) =>
      r.id === id ? { ...r, name: trimmed, properties: { ...r.properties, name: trimmed } } : r
    );
    const updatedTopology: CanonicalTopologyIR = { ...state.topology, resources: updatedResources };
    set({ topology: updatedTopology, history, future: [], isSaved: false });
    await get().refreshCodeAndAnalysis();
  },

  updateResourceProperties: async (id, properties) => {
    const state = get();
    const updatedResources = state.topology.resources.map((r) =>
      r.id === id ? { ...r, properties: { ...r.properties, ...properties } } : r
    );
    const updatedTopology = { ...state.topology, resources: updatedResources };
    set({ topology: updatedTopology, isSaved: false });
    await get().refreshCodeAndAnalysis();
  },

  updateResourcePosition: (id, position) => {
    const state = get();
    const updatedResources = state.topology.resources.map((r) =>
      r.id === id ? { ...r, position } : r
    );
    set({ topology: { ...state.topology, resources: updatedResources }, isSaved: false });
  },

  updateResourceDimensions: (id, dimensions) => {
    const state = get();
    const updatedResources = state.topology.resources.map((r) =>
      r.id === id ? { ...r, dimensions } : r
    );
    set({ topology: { ...state.topology, resources: updatedResources }, isSaved: false });
  },

  updateResourceBounds: (id, bounds) => {
    const state = get();
    const updatedResources = state.topology.resources.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          ...(bounds.position ? { position: bounds.position } : {}),
          dimensions: bounds.dimensions,
        };
      }
      return r;
    });
    set({ topology: { ...state.topology, resources: updatedResources }, isSaved: false });
  },

  duplicateResource: async (id) => {
    const state = get();
    const target = state.topology.resources.find((r) => r.id === id);
    if (!target) return;

    const baseName = target.name.replace(/-copy\d*$/, '');
    const cleanName = `${baseName}-copy${Date.now().toString().slice(-3)}`;
    const newId = `${target.type}_${cleanName.replace(/-/g, '_')}`;
    const newPos = {
      x: (target.position?.x ?? 100) + 30,
      y: (target.position?.y ?? 100) + 30,
    };

    const cloned: AzureResourceIR = {
      ...target,
      id: newId,
      name: cleanName,
      position: newPos,
      dimensions: target.dimensions ? { ...target.dimensions } : undefined,
    };

    const newEdges = [...state.topology.edges];
    if (target.parent_id) {
      const parent = state.topology.resources.find((r) => r.id === target.parent_id);
      const rel = parent?.container_level === 'subnet' ? 'subnet_association' : 'containment';
      newEdges.push({
        id: `edge_${target.parent_id}_${newId}`,
        source: target.parent_id,
        target: newId,
        relation_type: rel,
      });
    }

    set({
      topology: {
        ...state.topology,
        resources: [...state.topology.resources, cloned],
        edges: newEdges,
      },
      selectedResourceId: newId,
      isSaved: false,
    });
    await get().refreshCodeAndAnalysis();
  },

  getResourceHcl: (id) => {
    const state = get();
    const resource = state.topology.resources.find((r) => r.id === id);
    if (!resource) return '';
    const mainTf = state.generatedCode['main.tf'] || '';
    const pattern = new RegExp(`resource\\s+"${resource.type}"\\s+"[^"]*"\\s*\\{[\\s\\S]*?\\n\\}`, 'g');
    const matches = mainTf.match(pattern);
    if (matches && matches.length > 0) {
      const matched = matches.find((m) => m.includes(resource.name) || m.includes(resource.id));
      if (matched) return matched;
      return matches[0];
    }
    const props = Object.entries(resource.properties || {})
      .map(([k, v]) => `  ${k} = ${JSON.stringify(v)}`)
      .join('\n');
    return `resource "${resource.type}" "${resource.name.replace(/[^a-zA-Z0-9_]/g, '_')}" {\n  name     = "${resource.name}"\n  location = "${resource.location}"\n${props}\n}`;
  },

  removeResource: async (id) => {
    const state = get();
    const updatedResources = state.topology.resources.filter((r) => r.id !== id && r.parent_id !== id);
    const updatedEdges = state.topology.edges.filter((e) => e.source !== id && e.target !== id);
    const updatedTopology = { ...state.topology, resources: updatedResources, edges: updatedEdges };
    const isSelected = state.selectedResourceId === id;
    set({
      topology: updatedTopology,
      selectedResourceId: isSelected ? null : state.selectedResourceId,
      isInspectorOpen: isSelected && !state.isInspectorPinned ? false : state.isInspectorOpen,
      isSaved: false,
    });
    await get().refreshCodeAndAnalysis();
  },

  addEdge: async (edge) => {
    const state = get();
    const updatedEdges = [...state.topology.edges, edge];
    const updatedTopology = { ...state.topology, edges: updatedEdges };
    set({ topology: updatedTopology, isSaved: false });
    await get().refreshCodeAndAnalysis();
  },

  removeEdge: async (edgeId) => {
    const state = get();
    const updatedEdges = state.topology.edges.filter((e) => e.id !== edgeId);
    const updatedTopology = { ...state.topology, edges: updatedEdges };
    set({ topology: updatedTopology, isSaved: false });
    await get().refreshCodeAndAnalysis();
  },

  refreshCodeAndAnalysis: async () => {
    const state = get();
    set({ isSyncing: true });
    try {
      const codeFiles = await ApiService.generateCode(state.topology);
      // Immediately set the generated code so the code drawer is responsive and never lags behind
      set({ generatedCode: codeFiles });

      try {
        const securityRes = await ApiService.scanSecurity(state.topology);
        const finopsRes = await ApiService.estimateFinOps(securityRes.topology);

        set({
          topology: finopsRes.topology,
          securitySummary: securityRes.summary,
          blastRadius: securityRes.blastRadius,
          finopsSummary: finopsRes.summary,
        });
      } catch (scanErr) {
        console.warn('Security/FinOps background analysis warning:', scanErr);
      }
    } catch (err) {
      console.error('Error syncing code and analysis:', err);
    } finally {
      set({ isSyncing: false });
    }
  },

  syncFromHcl: async (hcl) => {
    set({ isSyncing: true });
    try {
      const parsedTopology = await ApiService.parseCode(hcl);
      set({ topology: parsedTopology, isSyncing: false, isSaved: false });
      await get().refreshCodeAndAnalysis();
    } catch (err) {
      console.error('Failed to sync from HCL:', err);
      set({ isSyncing: false });
    }
  },

  importFromHcl: async (hcl) => {
    set({ isSyncing: true });
    try {
      const parsedTopology = await ApiService.parseCode(hcl);
      set({ topology: parsedTopology, isSyncing: false, isImportOpen: false });
      await get().refreshCodeAndAnalysis();
    } catch (err) {
      console.error('Failed to import HCL:', err);
      set({ isSyncing: false });
      throw err;
    }
  },

  importFromState: async (stateJson: string, projectName: string = 'Imported State') => {
    set({ isSyncing: true });
    try {
      const parsedTopology = await ApiService.importState(stateJson, projectName);
      set({ topology: parsedTopology, isSyncing: false, isImportOpen: false });
      await get().refreshCodeAndAnalysis();
    } catch (err) {
      console.error('Failed to import state:', err);
      set({ isSyncing: false });
      throw err;
    }
  },

  importFromAzure: async (queryResultsJson: string, subscriptionId: string = 'Live Azure Subscription') => {
    set({ isSyncing: true });
    try {
      const parsedTopology = await ApiService.importAzure(queryResultsJson, subscriptionId);
      set({ topology: parsedTopology, isSyncing: false, isImportOpen: false });
      await get().refreshCodeAndAnalysis();
    } catch (err) {
      console.error('Failed to import Azure resources:', err);
      set({ isSyncing: false });
      throw err;
    }
  },

  generateArchitecture: async (prompt: string) => {
    set({ isGenerating: true, generatedTopologyPreview: null });
    try {
      const result = await ApiService.generateArchitecture(prompt);
      set({ generatedTopologyPreview: result.topology, isGenerating: false });
      return result;
    } catch (err) {
      set({ isGenerating: false });
      throw err;
    }
  },

  applyGeneratedTopology: () => {
    const preview = get().generatedTopologyPreview;
    if (preview) {
      set({ topology: preview, generatedTopologyPreview: null, isSaved: false });
      get().refreshCodeAndAnalysis();
    }
  },

  loadSample: (id: string) => {
    const templateMap: Record<string, string> = {
      'hub-spoke': 'intermediate-hub-spoke',
      '3tier-web': 'intermediate-3tier-web',
      'aks-micro': 'starter-paas-sql',
      'ai-workload': 'intermediate-ai-rag',
    };
    const targetId = templateMap[id] || id;
    const found = ARCHITECTURE_TEMPLATES.find((t) => t.id === targetId || t.id.includes(id));
    if (found && found.topology) {
      get().loadTemplate(JSON.parse(JSON.stringify(found.topology)));
      return;
    }
    const SAMPLES: Record<string, Partial<CanonicalTopologyIR>> = {
      'hub-spoke': { metadata: { ...get().topology.metadata, project_name: 'Hub & Spoke Network' } },
      '3tier-web': { metadata: { ...get().topology.metadata, project_name: '3-Tier Web App' } },
      'aks-micro': { metadata: { ...get().topology.metadata, project_name: 'AKS Microservices' } },
      'ai-workload': { metadata: { ...get().topology.metadata, project_name: 'AI OpenAI Workload' } },
    };
    const patch = SAMPLES[id];
    if (patch) set((state) => ({ topology: { ...state.topology, ...patch } }));
  },

  runAutoLayout: async () => {
    const state = get();
    try {
      const layouted = await ApiService.autoLayout(state.topology);
      set({ topology: layouted });
    } catch (err) {
      console.error('Failed to run auto-layout:', err);
    }
  },

  applyRemediation: async (finding) => {
    const state = get();
    try {
      const remediated = await ApiService.remediateSecurity(state.topology, finding);
      set({ topology: remediated, isSaved: false });
      await get().refreshCodeAndAnalysis();
    } catch (err) {
      console.error('Failed to apply remediation:', err);
    }
  },
}));

if (typeof window !== 'undefined') {
  (window as any).useTopologyStore = useTopologyStore;
}
