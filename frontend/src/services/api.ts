export interface AzureResourceIR {
  id: string;
  type: string;
  name: string;
  location: string;
  parent_id?: string | null;
  container_level?: 'none' | 'rg' | 'vnet' | 'subnet';
  properties?: Record<string, any>;
  tags?: Record<string, string>;
  position?: { x: number; y: number };
  dimensions?: { width?: number; height?: number };
  security_findings?: Array<{
    rule_id: string;
    rule_name: string;
    severity: string;
    description: string;
    fix_suggestion?: string;
    applied_fix?: boolean;
  }>;
  cost?: {
    monthly_cost_usd: number;
    hourly_cost_usd: number;
    currency: string;
    breakdown: Record<string, number>;
  };
}

export interface TopologyEdgeIR {
  id: string;
  source: string;
  target: string;
  source_handle?: string;
  target_handle?: string;
  relation_type: string;
  properties?: Record<string, any>;
}

export interface CanonicalTopologyIR {
  version: string;
  metadata: {
    project_name: string;
    target_cloud: string;
    iac_format: string;
    default_location: string;
    version: string;
  };
  resources: AzureResourceIR[];
  edges: TopologyEdgeIR[];
}

export interface CatalogItem {
  resourceType: string;
  displayName: string;
  category: string;
  containerLevel: string;
  icon: string;
  defaultProperties: Record<string, any>;
  allowedParents: string[];
  description: string;
}

import { getAuthHeaders } from './authApi';

const API_BASE = '/api';

export const ApiService = {
  async getCatalog(): Promise<CatalogItem[]> {
    const res = await fetch(`${API_BASE}/catalog`);
    if (!res.ok) throw new Error('Failed to fetch catalog');
    const data = await res.json();
    return data.catalog;
  },

  async generateCode(topology: CanonicalTopologyIR): Promise<Record<string, string>> {
    const res = await fetch(`${API_BASE}/codegen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topology),
    });
    if (!res.ok) throw new Error('Failed to generate Terraform code');
    return res.json();
  },

  async parseCode(hcl: string, projectName: string = 'Imported Topology'): Promise<CanonicalTopologyIR> {
    const res = await fetch(`${API_BASE}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hcl, projectName }),
    });
    if (!res.ok) throw new Error('Failed to parse HCL code');
    return res.json();
  },

  async scanSecurity(topology: CanonicalTopologyIR): Promise<{
    topology: CanonicalTopologyIR;
    summary: any;
    blastRadius: any;
  }> {
    const res = await fetch(`${API_BASE}/security/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topology),
    });
    if (!res.ok) throw new Error('Failed to run security scan');
    return res.json();
  },

  async estimateFinOps(topology: CanonicalTopologyIR): Promise<{
    topology: CanonicalTopologyIR;
    summary: any;
  }> {
    const res = await fetch(`${API_BASE}/finops/cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topology),
    });
    if (!res.ok) throw new Error('Failed to estimate costs');
    return res.json();
  },

  async autoLayout(topology: CanonicalTopologyIR): Promise<CanonicalTopologyIR> {
    const res = await fetch(`${API_BASE}/graph/layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topology),
    });
    if (!res.ok) throw new Error('Failed to compute layout');
    return res.json();
  },

  async generateCopilot(prompt: string, currentTopology?: CanonicalTopologyIR): Promise<CanonicalTopologyIR> {
    const res = await fetch(`${API_BASE}/copilot/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ prompt, currentTopology }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail?.message || err?.detail || 'Failed to run Copilot');
    }
    const data = await res.json();
    return data.topology;
  },

  async generateArchitecture(prompt: string): Promise<{ topology: CanonicalTopologyIR }> {
    const topology = await ApiService.generateCopilot(prompt);
    return { topology };
  },

  async remediateSecurity(topology: CanonicalTopologyIR, finding: any): Promise<CanonicalTopologyIR> {
    const res = await fetch(`${API_BASE}/copilot/remediate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ topology, finding }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail?.message || err?.detail || 'Failed to apply remediation');
    }
    const data = await res.json();
    return data.topology;
  },

  async importState(stateJson: string, projectName: string = 'Imported State'): Promise<CanonicalTopologyIR> {
    const res = await fetch(`${API_BASE}/import/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stateJson, projectName }),
    });
    if (!res.ok) throw new Error('Failed to import state file');
    return res.json();
  },

  async importAzure(queryResultsJson: string, subscriptionId: string = 'Live Azure Subscription'): Promise<CanonicalTopologyIR> {
    const res = await fetch(`${API_BASE}/import/azure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryResultsJson, subscriptionId }),
    });
    if (!res.ok) throw new Error('Failed to import Azure resources');
    return res.json();
  },
};

