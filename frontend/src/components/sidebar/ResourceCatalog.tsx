import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, ChevronDown, ChevronRight, Pin, Clock,
  Layers, Star, TrendingUp, ChevronLeft, ChevronRight as ChevronRightIcon,
  Package,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';
import { CatalogItem } from '../../services/api';
import { AzureIcon } from '../icons/AzureIcons';

// ─── Official Azure Icon Helper ───────────────────────────────────────────

const getIcon = (type: string): React.ReactNode => {
  return <AzureIcon type={type} size={18} />;
};

// ─── Fallback + Extended Catalog ─────────────────────────────────────────

const FULL_CATALOG: CatalogItem[] = [
  // Containers
  { resourceType: 'azurerm_resource_group',       displayName: 'Resource Group',     category: 'Containers',   containerLevel: 'rg',     icon: 'folder-lock', defaultProperties: { location: 'eastus' }, allowedParents: [], description: 'Logical container for related resources' },
  { resourceType: 'azurerm_virtual_network',       displayName: 'Virtual Network',    category: 'Containers',   containerLevel: 'vnet',   icon: 'network',     defaultProperties: { address_space: ['10.0.0.0/16'] }, allowedParents: ['azurerm_resource_group'], description: 'Isolated network boundary (VNet)' },
  { resourceType: 'azurerm_subnet',                displayName: 'Subnet',             category: 'Containers',   containerLevel: 'subnet', icon: 'git-fork',    defaultProperties: { address_prefixes: ['10.0.1.0/24'] }, allowedParents: ['azurerm_virtual_network'], description: 'Subnet subdivision with NSG support' },
  // Compute
  { resourceType: 'azurerm_linux_virtual_machine', displayName: 'Linux VM',           category: 'Compute',      containerLevel: 'none', icon: 'cpu',    defaultProperties: { size: 'Standard_B2s', admin_username: 'azureuser' }, allowedParents: ['azurerm_subnet'], description: 'Ubuntu / Debian Linux Virtual Machine' },
  { resourceType: 'azurerm_windows_virtual_machine', displayName: 'Windows VM',       category: 'Compute',      containerLevel: 'none', icon: 'cpu',    defaultProperties: { size: 'Standard_B2s' }, allowedParents: ['azurerm_subnet'], description: 'Windows Server Virtual Machine' },
  { resourceType: 'azurerm_linux_web_app',         displayName: 'App Service',        category: 'Compute',      containerLevel: 'none', icon: 'globe',  defaultProperties: { service_plan_sku: 'P1v3', https_only: true }, allowedParents: ['azurerm_resource_group'], description: 'Managed PaaS web application' },
  { resourceType: 'azurerm_linux_function_app',    displayName: 'Function App',       category: 'Compute',      containerLevel: 'none', icon: 'zap',    defaultProperties: { https_only: true }, allowedParents: ['azurerm_resource_group'], description: 'Serverless function execution' },
  { resourceType: 'azurerm_kubernetes_cluster',    displayName: 'AKS Cluster',        category: 'Compute',      containerLevel: 'none', icon: 'boxes',  defaultProperties: { dns_prefix: 'aks-cluster', default_node_pool: { node_count: 3, vm_size: 'Standard_D2s_v3' } }, allowedParents: ['azurerm_resource_group'], description: 'Managed Kubernetes cluster' },
  { resourceType: 'azurerm_container_app',         displayName: 'Container App',      category: 'Compute',      containerLevel: 'none', icon: 'layers', defaultProperties: {}, allowedParents: ['azurerm_resource_group'], description: 'Serverless container hosting' },
  { resourceType: 'azurerm_batch_account',         displayName: 'Batch Account',      category: 'Compute',      containerLevel: 'none', icon: 'cpu',    defaultProperties: {}, allowedParents: ['azurerm_resource_group'], description: 'Large-scale parallel jobs' },
  // Networking
  { resourceType: 'azurerm_application_gateway',   displayName: 'App Gateway',        category: 'Networking',   containerLevel: 'none', icon: 'shield', defaultProperties: { sku_name: 'WAF_v2' }, allowedParents: ['azurerm_subnet'], description: 'L7 load balancer + WAF' },
  { resourceType: 'azurerm_network_security_group',displayName: 'NSG',                category: 'Networking',   containerLevel: 'none', icon: 'shield', defaultProperties: {}, allowedParents: ['azurerm_subnet'], description: 'Network Security Group rules' },
  { resourceType: 'azurerm_public_ip',             displayName: 'Public IP',          category: 'Networking',   containerLevel: 'none', icon: 'globe',  defaultProperties: { allocation_method: 'Static' }, allowedParents: ['azurerm_resource_group'], description: 'Static or dynamic public IP' },
  { resourceType: 'azurerm_private_endpoint',      displayName: 'Private Endpoint',   category: 'Networking',   containerLevel: 'none', icon: 'network',defaultProperties: {}, allowedParents: ['azurerm_subnet'], description: 'Private connectivity via PaaS' },
  { resourceType: 'azurerm_virtual_network_peering',displayName: 'VNet Peering',      category: 'Networking',   containerLevel: 'none', icon: 'network',defaultProperties: {}, allowedParents: ['azurerm_virtual_network'], description: 'Connect two VNets' },
  { resourceType: 'azurerm_firewall',              displayName: 'Azure Firewall',     category: 'Networking',   containerLevel: 'none', icon: 'shield', defaultProperties: { sku_name: 'AZFW_VNet', sku_tier: 'Premium' }, allowedParents: ['azurerm_subnet'], description: 'Cloud-native stateful firewall' },
  { resourceType: 'azurerm_lb',                    displayName: 'Load Balancer',      category: 'Networking',   containerLevel: 'none', icon: 'cpu',    defaultProperties: { sku: 'Standard' }, allowedParents: ['azurerm_resource_group'], description: 'L4 load balancing' },
  // Storage
  { resourceType: 'azurerm_storage_account',       displayName: 'Storage Account',    category: 'Storage',      containerLevel: 'none', icon: 'hard-drive', defaultProperties: { account_tier: 'Standard', account_replication_type: 'LRS', enable_https_traffic_only: true, min_tls_version: 'TLS1_2' }, allowedParents: ['azurerm_resource_group'], description: 'Blob, file, queue & table storage' },
  { resourceType: 'azurerm_backup_vault',          displayName: 'Backup Vault',       category: 'Storage',      containerLevel: 'none', icon: 'hard-drive', defaultProperties: {}, allowedParents: ['azurerm_resource_group'], description: 'Unified backup management' },
  { resourceType: 'azurerm_recovery_services_vault', displayName: 'Recovery Vault',   category: 'Storage',      containerLevel: 'none', icon: 'hard-drive', defaultProperties: {}, allowedParents: ['azurerm_resource_group'], description: 'Disaster recovery + backup' },
  // Databases
  { resourceType: 'azurerm_mssql_database',        displayName: 'Azure SQL DB',       category: 'Databases',    containerLevel: 'none', icon: 'database', defaultProperties: { sku_name: 'S1', max_size_gb: 50 }, allowedParents: ['azurerm_resource_group'], description: 'Managed relational SQL database' },
  { resourceType: 'azurerm_cosmosdb_account',      displayName: 'Cosmos DB',          category: 'Databases',    containerLevel: 'none', icon: 'database', defaultProperties: { offer_type: 'Standard', consistency_level: 'Session' }, allowedParents: ['azurerm_resource_group'], description: 'Multi-model distributed database' },
  { resourceType: 'azurerm_postgresql_flexible_server', displayName: 'PostgreSQL',    category: 'Databases',    containerLevel: 'none', icon: 'database', defaultProperties: { sku_name: 'B_Standard_B2s', version: '14' }, allowedParents: ['azurerm_resource_group'], description: 'Managed PostgreSQL server' },
  { resourceType: 'azurerm_redis_cache',           displayName: 'Redis Cache',        category: 'Databases',    containerLevel: 'none', icon: 'zap',      defaultProperties: { sku_name: 'Standard', family: 'C', capacity: 1 }, allowedParents: ['azurerm_resource_group'], description: 'In-memory data cache' },
  // Security
  { resourceType: 'azurerm_key_vault',             displayName: 'Key Vault',          category: 'Security',     containerLevel: 'none', icon: 'key',    defaultProperties: { sku_name: 'standard', purge_protection_enabled: true, enable_rbac_authorization: true }, allowedParents: ['azurerm_resource_group'], description: 'Secrets, keys & certificate vault' },
  { resourceType: 'azurerm_user_assigned_identity',displayName: 'Managed Identity',   category: 'Security',     containerLevel: 'none', icon: 'shield', defaultProperties: {}, allowedParents: ['azurerm_resource_group'], description: 'Azure AD managed identity' },
  { resourceType: 'azurerm_role_assignment',       displayName: 'RBAC Assignment',    category: 'Security',     containerLevel: 'none', icon: 'shield', defaultProperties: {}, allowedParents: ['azurerm_resource_group'], description: 'Role-based access control' },
  // AI
  { resourceType: 'azurerm_cognitive_account',     displayName: 'Azure OpenAI',       category: 'AI',           containerLevel: 'none', icon: 'brain', defaultProperties: { kind: 'OpenAI', sku_name: 'S0' }, allowedParents: ['azurerm_resource_group'], description: 'GPT-4o & Azure AI services' },
  { resourceType: 'azurerm_machine_learning_workspace', displayName: 'ML Workspace',  category: 'AI',           containerLevel: 'none', icon: 'brain', defaultProperties: {}, allowedParents: ['azurerm_resource_group'], description: 'Azure Machine Learning platform' },
  // Integration
  { resourceType: 'azurerm_servicebus_namespace',  displayName: 'Service Bus',        category: 'Integration',  containerLevel: 'none', icon: 'workflow', defaultProperties: { sku: 'Standard' }, allowedParents: ['azurerm_resource_group'], description: 'Enterprise message broker' },
  { resourceType: 'azurerm_eventhub_namespace',    displayName: 'Event Hub',          category: 'Integration',  containerLevel: 'none', icon: 'chart',    defaultProperties: { sku: 'Standard', capacity: 1 }, allowedParents: ['azurerm_resource_group'], description: 'Real-time event streaming' },
  { resourceType: 'azurerm_logic_app_workflow',    displayName: 'Logic App',          category: 'Integration',  containerLevel: 'none', icon: 'workflow', defaultProperties: {}, allowedParents: ['azurerm_resource_group'], description: 'Low-code workflow automation' },
  { resourceType: 'azurerm_api_management',        displayName: 'API Management',     category: 'Integration',  containerLevel: 'none', icon: 'workflow', defaultProperties: { sku_name: 'Developer_1' }, allowedParents: ['azurerm_resource_group'], description: 'API gateway & developer portal' },
];

// ─── Category config ──────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'Containers',  label: 'Containers',  color: '#0C66E4' },
  { id: 'Compute',     label: 'Compute',     color: '#E2B203' },
  { id: 'Networking',  label: 'Networking',  color: '#0C66E4' },
  { id: 'Storage',     label: 'Storage',     color: '#1F845A' },
  { id: 'Databases',   label: 'Databases',   color: '#8270DB' },
  { id: 'Security',    label: 'Security',    color: '#E54937' },
  { id: 'AI',          label: 'AI & ML',     color: '#E34935' },
  { id: 'Integration', label: 'Integration', color: '#00A3BF' },
];

// ─── Architecture Templates ───────────────────────────────────────────────
import { ARCHITECTURE_TEMPLATES, ArchitectureTemplate } from '../../data/architectureTemplates';


// ─── Catalog Item Card ───────────────────────────────────────────────────

const CatalogCard: React.FC<{
  item: CatalogItem;
  pinned?: boolean;
  onPin?: () => void;
}> = ({ item, pinned, onPin }) => {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="catalog-item group animate-fade-in"
      title={`${item.displayName}\n${item.description}`}
    >
      <div
        className="w-7 h-7 rounded-[3px] flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        {getIcon(item.resourceType)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">
          {item.displayName}
        </div>
        <div className="text-[11px] text-[var(--color-text-muted)] truncate">{item.description}</div>
      </div>
      {onPin && (
        <button
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--color-surface-3)] ${pinned ? '!opacity-100 text-[var(--color-primary-light)]' : 'text-[var(--color-text-muted)]'}`}
          title={pinned ? 'Unpin' : 'Pin to top'}
        >
          <Pin className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

// ─── Category Accordion Section ──────────────────────────────────────────

const CategorySection: React.FC<{
  category: (typeof CATEGORIES)[0];
  items: CatalogItem[];
  pinned: Set<string>;
  onPin: (type: string) => void;
  defaultOpen?: boolean;
}> = ({ category, items, pinned, onPin, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[var(--color-surface-2)] transition-colors rounded-[var(--radius-sm)] mb-1"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-[2px]" style={{ background: category.color }} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            {category.label}
          </span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
          >
            {items.length}
          </span>
        </div>
        {open
          ? <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
          : <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)]" />}
      </button>

      {open && (
        <div className="space-y-1 mb-2 pl-1">
          {items.map(item => (
            <CatalogCard
              key={item.resourceType}
              item={item}
              pinned={pinned.has(item.resourceType)}
              onPin={() => onPin(item.resourceType)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Templates Tab ────────────────────────────────────────────────────────

const COMPLEXITY_STYLES = {
  Simple: { badge: 'text-[#1F845A] bg-[#DCFFF1] dark:bg-[#143B2B] dark:text-[#4BCE97] border-[#1F845A]/25' },
  Intermediate: { badge: 'text-[#0C66E4] bg-[#E9F2FF] dark:bg-[#1C2B42] dark:text-[#579DFF] border-[#0C66E4]/25' },
  Advanced: { badge: 'text-[#8270DB] bg-[#F3F0FF] dark:bg-[#2C2442] dark:text-[#B8ACF6] border-[#8270DB]/25' },
};

const TEMPLATE_CATEGORIES = [
  'All',
  'Starter',
  'Web & PaaS',
  'Networking',
  'AI & Data',
  'Containers',
  'Security & Enterprise',
] as const;

const TemplatesTab: React.FC<{ onApply: (template: ArchitectureTemplate) => void }> = ({ onApply }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filtered = useMemo(() => {
    return ARCHITECTURE_TEMPLATES.filter(tpl => {
      const matchCat = selectedCategory === 'All' || tpl.category === selectedCategory;
      const matchSearch =
        !search ||
        tpl.name.toLowerCase().includes(search.toLowerCase()) ||
        tpl.desc.toLowerCase().includes(search.toLowerCase()) ||
        tpl.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [search, selectedCategory]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Search & Category Filter */}
      <div className="p-2.5 pb-2 border-b border-[var(--color-border)] shrink-0 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blueprints..."
            className="w-full pl-8 pr-3 py-1.5 text-[11.5px] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {TEMPLATE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap transition-colors font-medium border ${
                selectedCategory === cat
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blueprints List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] px-1 pb-0.5">
          <span>{filtered.length} Enterprise Blueprint{filtered.length !== 1 ? 's' : ''}</span>
          <span className="text-[10px]">Drag to canvas or click</span>
        </div>

        {filtered.map(tpl => {
          const compStyle = COMPLEXITY_STYLES[tpl.complexity] || COMPLEXITY_STYLES.Simple;
          const onDragStart = (e: React.DragEvent) => {
            e.dataTransfer.setData('application/azure-template', JSON.stringify(tpl.topology));
            e.dataTransfer.setData('application/json', JSON.stringify(tpl.topology));
            e.dataTransfer.effectAllowed = 'copy';
          };

          return (
            <div
              key={tpl.id}
              draggable={true}
              onDragStart={onDragStart}
              onClick={() => onApply(tpl)}
              className="w-full text-left p-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-all cursor-grab active:cursor-grabbing group hover:border-[var(--color-primary-light)] hover:shadow-xs"
              title="Drag onto canvas or click to load this architecture"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-[4px] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-primary-light)] transition-colors">
                  <AzureIcon type={tpl.iconType} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-[12px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors truncate">
                      {tpl.name}
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${compStyle.badge} shrink-0`}>
                      {tpl.complexity}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-tight line-clamp-2">
                    {tpl.desc}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {tpl.tags.map(tag => (
                      <span key={tag} className="text-[9.5px] px-1.5 py-0.2 rounded-[2px] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)] font-medium">
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10px] ml-auto text-[var(--color-text-muted)] font-mono shrink-0">
                      {tpl.resourceCount} items
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Modules Tab ──────────────────────────────────────────────────────────

const ModulesTab: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3 text-center">
    <div
      className="w-12 h-12 rounded-[4px] flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-primary-light)]"
    >
      <Layers className="w-6 h-6" />
    </div>
    <div>
      <div className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-1">Terraform Modules</div>
      <div className="text-[11px] text-[var(--color-text-muted)] leading-relaxed max-w-[200px]">
        Connect a Git repository to access your private and community Terraform modules.
      </div>
    </div>
    <button className="btn-primary text-[12px] px-3 py-1.5">
      <Package className="w-3.5 h-3.5" />
      Connect Git Repo
    </button>
    <div className="text-[10px] text-[var(--color-text-muted)]">
      GitHub, GitLab, Bitbucket, Azure DevOps
    </div>
  </div>
);

// ─── Main Sidebar ─────────────────────────────────────────────────────────

type TabId = 'resources' | 'templates' | 'modules';

export const ResourceCatalog: React.FC = () => {
  const { catalog, fetchCatalog, loadTemplate } = useTopologyStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('resources');
  const [pinned, setPinned] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('pinnedResources') ?? '[]')); }
    catch { return new Set(); }
  });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { fetchCatalog().catch(() => {}); }, [fetchCatalog]);

  const items = (catalog?.length ?? 0) > 0 ? catalog : FULL_CATALOG;

  const togglePin = useCallback((type: string) => {
    setPinned(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      localStorage.setItem('pinnedResources', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleLoadTemplate = (tpl: ArchitectureTemplate) => {
    loadTemplate(tpl.topology);
  };

  const filteredBySearch = useMemo(() =>
    items.filter(item =>
      !search ||
      item.displayName.toLowerCase().includes(search.toLowerCase()) ||
      item.resourceType.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  );

  const pinnedItems = useMemo(() =>
    items.filter(item => pinned.has(item.resourceType)),
    [items, pinned]
  );

  const recentItems = useMemo(() =>
    items.slice(0, 3),
    [items]
  );

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'resources',  label: 'Components', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'templates',  label: 'Templates',  icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'modules',    label: 'Modules',    icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  // ── Collapsed icon rail ──
  if (collapsed) {
    return (
      <aside
        className="flex flex-col items-center py-2.5 gap-2 shrink-0 z-10 border-r"
        style={{ width: 48, background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <button onClick={() => setCollapsed(false)} className="toolbar-btn" title="Expand sidebar">
          <ChevronRightIcon className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-[var(--color-border)]" />
        {CATEGORIES.slice(0, 6).map(cat => {
          const icon = items.find(i => i.category === cat.id);
          return (
            <div key={cat.id} className="toolbar-btn w-8 h-8" title={cat.label}>
              {icon ? getIcon(icon.resourceType) : <Package className="w-4 h-4" />}
            </div>
          );
        })}
      </aside>
    );
  }

  return (
    <aside
      className="flex flex-col h-full shrink-0 z-10 overflow-hidden border-r"
      style={{ width: 290, background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="px-3 pt-2.5 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Resource Catalog
          </h2>
          <button
            onClick={() => setCollapsed(true)}
            className="toolbar-btn w-6 h-6"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search components…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dark pl-8 pr-7 text-[12px]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >✕</button>
          )}
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="tab-bar shrink-0 w-full flex">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-item flex items-center gap-1.5 flex-1 min-w-0 justify-center px-2 py-2 text-[12px] truncate ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="shrink-0">{tab.icon}</span>
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'resources' && (
        <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1">
          {/* Search results */}
          {search ? (
            <>
              <div className="px-1 pb-1 text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                {filteredBySearch.length} results for "{search}"
              </div>
              <div className="space-y-1">
                {filteredBySearch.map(item => (
                  <CatalogCard key={item.resourceType} item={item} pinned={pinned.has(item.resourceType)} onPin={() => togglePin(item.resourceType)} />
                ))}
                {filteredBySearch.length === 0 && (
                  <div className="text-center py-8 text-[12px] text-[var(--color-text-muted)]">
                    No resources match "{search}"
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Pinned Items */}
              {pinnedItems.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 px-1 py-1 text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                    <Pin className="w-3 h-3" /> Pinned
                  </div>
                  <div className="space-y-1">
                    {pinnedItems.map(item => (
                      <CatalogCard key={item.resourceType} item={item} pinned onPin={() => togglePin(item.resourceType)} />
                    ))}
                  </div>
                  <div className="my-2 h-px bg-[var(--color-border)]" />
                </div>
              )}

              {pinnedItems.length === 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 px-1 py-1 text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                    <Clock className="w-3 h-3" /> Quick Access
                  </div>
                  <div className="space-y-1 mb-2">
                    {recentItems.map(item => (
                      <CatalogCard key={item.resourceType} item={item} pinned={false} onPin={() => togglePin(item.resourceType)} />
                    ))}
                  </div>
                  <div className="my-2 h-px bg-[var(--color-border)]" />
                </div>
              )}

              {/* Category sections */}
              {CATEGORIES.map(cat => (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  items={filteredBySearch.filter(i => i.category === cat.id)}
                  pinned={pinned}
                  onPin={togglePin}
                  defaultOpen={cat.id === 'Containers' || cat.id === 'Compute'}
                />
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'templates' && <TemplatesTab onApply={handleLoadTemplate} />}
      {activeTab === 'modules' && <ModulesTab />}

      {/* Footer hint */}
      {activeTab === 'resources' && !search && (
        <div
          className="px-3 py-2 border-t text-[11px] flex items-center gap-1.5 text-[var(--color-text-muted)]"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          Drag components onto canvas
        </div>
      )}
    </aside>
  );
};
