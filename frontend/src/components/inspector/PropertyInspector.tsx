import React, { useState } from 'react';
import {
  Trash2, Shield, DollarSign, Settings, Info,
  CheckCircle2, AlertTriangle, ExternalLink, Copy,
  Sparkles, BookOpen, TrendingDown, ChevronRight, X,
  Pin, PinOff,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';
import { AzureResourceIR } from '../../services/api';
import { AzureIcon } from '../icons/AzureIcons';

// ─── Severity badge (Status Lozenge Style) ──────────────────────────────────

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const cls = severity === 'CRITICAL' ? 'badge-critical'
            : severity === 'HIGH'     ? 'badge-high'
            : severity === 'MEDIUM'   ? 'badge-medium'
            : 'badge-low';
  return (
    <span className={`${cls} px-1.5 py-0.2 rounded-[3px] text-[10px] font-bold font-mono tracking-wide uppercase`}>
      {severity}
    </span>
  );
};

// ─── Properties Tab ────────────────────────────────────────────────────────

const PropertiesTab: React.FC<{
  resource: AzureResourceIR;
  containers: AzureResourceIR[];
  allResources: AzureResourceIR[];
  onPropertyChange: (key: string, value: any) => void;
  onParentChange: (parentId: string | null) => void;
  onSelectResource: (id: string) => void;
  onRename: (newName: string) => void;
}> = ({ resource, containers, allResources, onPropertyChange, onParentChange, onSelectResource, onRename }) => {
  const props = resource.properties ?? {};
  const [nameVal, setNameVal] = useState(resource.name);

  // Keep nameVal in sync if resource changes
  React.useEffect(() => {
    setNameVal(resource.name);
  }, [resource.name, resource.id]);

  const handleNameBlur = () => {
    const trimmed = nameVal.trim();
    if (trimmed && trimmed !== resource.name) {
      onRename(trimmed);
    } else {
      setNameVal(resource.name);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // Build full ancestor path: [Grandparent, Parent]
  const ancestors: AzureResourceIR[] = [];
  let curr = allResources.find((r) => r.id === resource.id);
  while (curr && curr.parent_id) {
    const p = allResources.find((r) => r.id === curr!.parent_id);
    if (p) {
      ancestors.unshift(p);
      curr = p;
    } else {
      break;
    }
  }

  // Find direct nested children if container
  const directChildren = allResources.filter((r) => r.parent_id === resource.id);

  const FormField: React.FC<{ label: string; children: React.ReactNode; mono?: boolean; hint?: string }> = ({ label, children, mono, hint }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          {label}
        </label>
        {hint && (
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
            {hint}
          </span>
        )}
      </div>
      <div style={mono ? { fontFamily: "'SFMono-Medium', 'SF Mono', monospace" } : {}}>
        {children}
      </div>
    </div>
  );

  const TextInput: React.FC<{
    value: string;
    onChange?: (v: string) => void;
    onBlur?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    disabled?: boolean;
  }> = ({ value, onChange, onBlur, onKeyDown, disabled }) => (
    <input
      type="text"
      value={value}
      disabled={disabled}
      onChange={e => onChange?.(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={`input-dark text-[12px] ${disabled ? 'opacity-70 cursor-not-allowed bg-[var(--color-surface-2)]' : ''}`}
    />
  );

  const SelectInput: React.FC<{ value: string; onChange: (v: string) => void; options: [string, string][] }> = ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input-dark text-[12px] cursor-pointer"
    >
      {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
    </select>
  );

  const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void; danger?: boolean }> = ({ label, checked, onChange, danger }) => (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[12px] text-[var(--color-text-primary)]">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-all duration-150 relative ${checked
          ? (danger ? 'bg-[#CA3521]' : 'bg-[var(--color-primary)]')
          : 'bg-[var(--color-surface-3)]'
        }`}
        style={{ border: '1px solid var(--color-border)' }}
      >
        <span
          className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-150"
          style={{
            background: 'white',
            left: checked ? '18px' : '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        />
      </button>
    </div>
  );

  return (
    <div className="p-3.5 space-y-3.5">
      {/* General section */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5 text-[var(--color-text-muted)]">
          Details & Hierarchy
        </div>
        <div className="space-y-2.5">
          <FormField label="Resource Name" hint="Enter to save">
            <TextInput
              value={nameVal}
              onChange={setNameVal}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
            />
          </FormField>
          <FormField label="Resource Type" mono>
            <TextInput value={resource.type} disabled />
          </FormField>
          <FormField label="Parent Container">
            <SelectInput
              value={resource.parent_id || ''}
              onChange={v => onParentChange(v ? v : null)}
              options={[
                ['', '(None - Standalone / Root)'],
                ...containers.map(c => [
                  c.id,
                  `${c.name} [${c.type.replace('azurerm_', '')}]`
                ] as [string, string])
              ]}
            />
          </FormField>

          {/* ── Hierarchy Path ── */}
          {ancestors.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[var(--color-text-muted)]">
                Hierarchy Trail
              </label>
              <div
                className="p-1.5 rounded-[var(--radius-sm)] flex items-center flex-wrap gap-1 bg-[var(--color-surface-2)] border border-[var(--color-border)]"
              >
                {ancestors.map((anc, idx) => (
                  <React.Fragment key={anc.id}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />}
                    <button
                      onClick={() => onSelectResource(anc.id)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-surface)] hover:bg-[var(--color-surface-3)] text-[11px] font-medium text-[var(--color-text-primary)] transition-colors"
                      title={`Select ${anc.name}`}
                    >
                      <AzureIcon type={anc.type} size={13} />
                      <span className="truncate max-w-[85px]">{anc.name}</span>
                    </button>
                  </React.Fragment>
                ))}
                <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
                <span className="px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] text-[11px] font-semibold flex items-center gap-1">
                  <AzureIcon type={resource.type} size={13} />
                  <span className="truncate max-w-[85px]">{resource.name}</span>
                </span>
              </div>
            </div>
          )}

          {/* ── Contained Resources ── */}
          {directChildren.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[var(--color-text-muted)]">
                Contained Items ({directChildren.length})
              </label>
              <div
                className="p-1 rounded-[var(--radius-sm)] space-y-0.5 max-h-36 overflow-y-auto bg-[var(--color-surface-2)] border border-[var(--color-border)]"
              >
                {directChildren.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => onSelectResource(ch.id)}
                    className="w-full flex items-center justify-between p-1.5 rounded hover:bg-[var(--color-surface)] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <AzureIcon type={ch.type} size={15} />
                      <div className="overflow-hidden">
                        <div className="text-[11px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] truncate">
                          {ch.name}
                        </div>
                        <div className="text-[9.5px] text-[var(--color-text-muted)] truncate font-mono">
                          {ch.type.replace('azurerm_', '')}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <FormField label="Azure Region">
            <SelectInput
              value={resource.location || 'eastus'}
              onChange={v => onPropertyChange('location', v)}
              options={[
                ['eastus',         'East US'],
                ['eastus2',        'East US 2'],
                ['westus2',        'West US 2'],
                ['westeurope',     'West Europe'],
                ['northeurope',    'North Europe'],
                ['southeastasia',  'Southeast Asia'],
                ['australiaeast',  'Australia East'],
                ['uksouth',        'UK South'],
              ]}
            />
          </FormField>
        </div>
      </div>

      <div className="h-px bg-[var(--color-border)]" />

      {/* Resource-type specific config */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5 text-[var(--color-text-muted)]">
          Configuration
        </div>
        <div className="space-y-2.5">
          {resource.type === 'azurerm_linux_virtual_machine' && (
            <FormField label="VM Size">
              <SelectInput
                value={props.size || 'Standard_B2s'}
                onChange={v => onPropertyChange('size', v)}
                options={[
                  ['Standard_B1s',    'B1s — 1 vCPU, 1GB ($7.59/mo)'],
                  ['Standard_B2s',    'B2s — 2 vCPU, 4GB ($30.37/mo)'],
                  ['Standard_D2s_v3', 'D2s v3 — 2 vCPU, 8GB ($70.08/mo)'],
                  ['Standard_D4s_v3', 'D4s v3 — 4 vCPU, 16GB ($140.16/mo)'],
                  ['Standard_F4s_v2', 'F4s v2 — 4 vCPU, 8GB ($152.92/mo)'],
                ]}
              />
            </FormField>
          )}

          {resource.type === 'azurerm_storage_account' && (
            <>
              <FormField label="Replication Type">
                <SelectInput
                  value={props.account_replication_type || 'LRS'}
                  onChange={v => onPropertyChange('account_replication_type', v)}
                  options={[
                    ['LRS', 'Locally Redundant (LRS)'],
                    ['ZRS', 'Zone Redundant (ZRS)'],
                    ['GRS', 'Geo-Redundant (GRS)'],
                    ['RAGRS', 'RA-GRS (Read-Access GRS)'],
                  ]}
                />
              </FormField>
              <Toggle label="HTTPS-Only Traffic" checked={props.enable_https_traffic_only !== false} onChange={v => onPropertyChange('enable_https_traffic_only', v)} />
              <Toggle label="Allow Public Blob Access" checked={props.allow_nested_items_to_be_public === true} onChange={v => onPropertyChange('allow_nested_items_to_be_public', v)} danger />
            </>
          )}

          {resource.type === 'azurerm_mssql_database' && (
            <FormField label="SKU Performance Tier">
              <SelectInput
                value={props.sku_name || 'S1'}
                onChange={v => onPropertyChange('sku_name', v)}
                options={[
                  ['Basic',     'Basic — 5 DTUs ($4.99/mo)'],
                  ['S0',        'S0 Standard — 10 DTUs ($14.72/mo)'],
                  ['S1',        'S1 Standard — 20 DTUs ($29.43/mo)'],
                  ['S2',        'S2 Standard — 50 DTUs ($73.58/mo)'],
                  ['GP_Gen5_2', 'General Purpose — 2 vCores ($248.20/mo)'],
                ]}
              />
            </FormField>
          )}

          {resource.type === 'azurerm_key_vault' && (
            <>
              <FormField label="SKU">
                <SelectInput
                  value={props.sku_name || 'standard'}
                  onChange={v => onPropertyChange('sku_name', v)}
                  options={[['standard', 'Standard'], ['premium', 'Premium (HSM)']]}
                />
              </FormField>
              <Toggle label="Purge Protection" checked={props.purge_protection_enabled !== false} onChange={v => onPropertyChange('purge_protection_enabled', v)} />
              <Toggle label="RBAC Authorization" checked={props.enable_rbac_authorization === true} onChange={v => onPropertyChange('enable_rbac_authorization', v)} />
            </>
          )}

          {/* Generic property display for any other resource */}
          {!['azurerm_linux_virtual_machine', 'azurerm_storage_account', 'azurerm_mssql_database', 'azurerm_key_vault'].includes(resource.type) && (
            Object.entries(props).filter(([k]) => !['tags', 'timeouts'].includes(k)).slice(0, 8).map(([k, v]) => (
              <FormField key={k} label={k.replace(/_/g, ' ')}>
                <TextInput
                  value={String(v)}
                  onChange={val => onPropertyChange(k, val)}
                />
              </FormField>
            ))
          )}
        </div>
      </div>

      {/* Copy HCL snippet */}
      <button
        className="w-full btn-ghost text-[11px] py-1.5 justify-center"
        onClick={() => navigator.clipboard.writeText(`resource "${resource.type}" "${resource.name}" {}`)}
      >
        <Copy className="w-3.5 h-3.5" />
        Copy HCL Block
      </button>
    </div>
  );
};

// ─── Security Tab ──────────────────────────────────────────────────────────

const SecurityTab: React.FC<{ resource: AzureResourceIR; onAiFix?: () => void }> = ({ resource, onAiFix }) => {
  const findings = resource.security_findings ?? [];
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;

  if (findings.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-2.5 text-center min-h-[180px]">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#DCFFF1] text-[#1F845A] dark:bg-[#143B2B] dark:text-[#4BCE97]">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[#1F845A] dark:text-[#4BCE97]">All checks passed</div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Compliant with CIS benchmarks</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 space-y-2.5">
      {/* Summary row */}
      <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-[#FFEDEB] border border-[#CA3521]/20 dark:bg-[#441C17] dark:border-[#FD9891]/20">
        <AlertTriangle className="w-4 h-4 text-[#CA3521] dark:text-[#FD9891] shrink-0" />
        <div className="text-[11.5px] text-[var(--color-text-primary)]">
          <strong className="text-[#CA3521] dark:text-[#FD9891]">{criticalCount}</strong> critical, <strong className="text-[#9E6C00] dark:text-[#F5CD47]">{highCount}</strong> high findings
        </div>
        <button
          onClick={onAiFix}
          className="ml-auto btn-primary text-[11px] py-1 px-2 h-auto"
        >
          <Sparkles className="w-3 h-3" />
          Fix All
        </button>
      </div>

      {/* Findings list — sorted by severity */}
      {[...findings]
        .sort((a, b) => {
          const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
          return order.indexOf(a.severity) - order.indexOf(b.severity);
        })
        .map((f) => (
          <div
            key={f.rule_id}
            className="p-3 rounded-[var(--radius-sm)] space-y-1.5 bg-[var(--color-surface)] border border-[var(--color-border)]"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                {f.rule_id}
              </span>
              <SeverityBadge severity={f.severity} />
              <button className="ml-auto text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]" title="View rule documentation">
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">{f.rule_name}</div>
            <div className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">{f.description}</div>
            {f.fix_suggestion && (
              <div
                className="p-2 rounded-[var(--radius-sm)] text-[10px] font-mono leading-relaxed bg-[#DCFFF1]/30 border border-[#1F845A]/20 text-[#1F845A] dark:bg-[#143B2B]/40 dark:text-[#4BCE97]"
              >
                💡 {f.fix_suggestion}
              </div>
            )}
            <button
              onClick={onAiFix}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--color-surface-2)] text-[var(--color-primary-light)] border border-[var(--color-border)]"
            >
              <Sparkles className="w-3 h-3" />
              Fix with Copilot
            </button>
          </div>
        ))}
    </div>
  );
};

// ─── FinOps Tab ────────────────────────────────────────────────────────────

const FinOpsTab: React.FC<{ resource: AzureResourceIR }> = ({ resource }) => {
  const cost = resource.cost;
  const monthly = cost?.monthly_cost_usd ?? 0;
  const annual  = monthly * 12;

  return (
    <div className="p-3.5 space-y-3.5">
      {/* Main cost card */}
      <div
        className="p-3.5 rounded-[var(--radius-sm)] text-center bg-[#DCFFF1]/30 border border-[#1F845A]/20 dark:bg-[#143B2B]/30 dark:border-[#4BCE97]/20"
      >
        <div className="text-[10px] uppercase tracking-widest font-bold mb-1 text-[var(--color-text-muted)]">
          Estimated Monthly Cost
        </div>
        <div className="text-2xl font-bold font-mono text-[#1F845A] dark:text-[#4BCE97]">
          ${monthly.toFixed(2)}
        </div>
        <div className="text-[11px] mt-0.5 text-[var(--color-text-muted)]">
          ${annual.toFixed(2)} / year
        </div>
      </div>

      {/* Cost breakdown */}
      {cost?.breakdown && Object.keys(cost.breakdown).length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5 text-[var(--color-text-muted)]">
            Cost Breakdown
          </div>
          <div className="rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-border)]">
            {Object.entries(cost.breakdown).map(([k, v], idx, arr) => (
              <div
                key={k}
                className="flex items-center justify-between px-3 py-2"
                style={{
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                  background: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                }}
              >
                <span className="text-[11.5px] capitalize text-[var(--color-text-secondary)]">
                  {k.replace(/_/g, ' ')}
                </span>
                <span className="text-[11.5px] font-semibold font-mono text-[var(--color-text-primary)]">
                  ${Number(v).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {monthly === 0 && (
        <div className="text-center py-4 text-[var(--color-text-muted)]">
          <TrendingDown className="w-5 h-5 mx-auto mb-1 opacity-50" />
          <div className="text-[12px]">No cost metrics available</div>
          <div className="text-[11px] mt-0.5">Run FinOps copilot to compute estimates</div>
        </div>
      )}

      <button
        className="w-full btn-ghost text-[11px] py-2 justify-center"
      >
        <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
        Optimize Cost with AI
      </button>
    </div>
  );
};

// ─── Docs Tab ─────────────────────────────────────────────────────────────

const DocsTab: React.FC<{ resource: AzureResourceIR }> = ({ resource }) => {
  const resourceSlug = resource.type.replace('azurerm_', '').replace(/_/g, '-');
  const docsUrl = `https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/${resource.type.replace('azurerm_', '')}`;

  return (
    <div className="p-3.5 space-y-3">
      <div
        className="p-3 rounded-[var(--radius-sm)] flex items-start gap-2.5 bg-[var(--color-surface)] border border-[var(--color-border)]"
      >
        <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-primary-light)]" />
        <div>
          <div className="text-[12px] font-semibold mb-1 text-[var(--color-text-primary)]">
            {resource.type}
          </div>
          <div className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
            Manages an Azure {resourceSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} resource.
            Refer to the official documentation for available parameters and schemas.
          </div>
        </div>
      </div>

      <a
        href={docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full btn-ghost text-[12px] py-2"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Terraform Registry Documentation
      </a>

      <a
        href={`https://learn.microsoft.com/azure/${resourceSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full btn-ghost text-[12px] py-2"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Microsoft Learn Reference
      </a>
    </div>
  );
};

// ─── Main PropertyInspector ────────────────────────────────────────────────

type InspectorTab = 'properties' | 'security' | 'cost' | 'docs';

export const PropertyInspector: React.FC = () => {
  const {
    topology,
    selectedResourceId,
    selectResource,
    updateResourceProperties,
    updateResourceParent,
    removeResource,
    renameResource,
    toggleCopilot,
    isInspectorOpen,
    isInspectorPinned,
    closeInspector,
    toggleInspectorPin,
  } = useTopologyStore() as any;

  const [activeTab, setActiveTab] = useState<InspectorTab>('properties');

  const selectedResource: AzureResourceIR | undefined = topology.resources.find(
    (r: AzureResourceIR) => r.id === selectedResourceId
  );

  if (!isInspectorPinned && (!isInspectorOpen || !selectedResource)) {
    return null;
  }

  const containerClass = isInspectorPinned
    ? 'inspector-docked select-none'
    : `inspector-drawer ${isInspectorOpen ? 'open' : ''} select-none`;

  if (!selectedResource) {
    return (
      <aside className={containerClass}>
        {/* Header with pin & close */}
        <div
          className="px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0 border-b"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Inspector
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleInspectorPin()}
              className={`p-1 rounded-[var(--radius-sm)] transition-colors ${isInspectorPinned ? 'text-[var(--color-primary-light)] bg-[var(--color-surface-2)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'}`}
              title={isInspectorPinned ? 'Unpin panel' : 'Pin panel to workspace'}
            >
              {isInspectorPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => closeInspector()}
              className="p-1 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
              title="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-2.5 p-6 text-center">
          <div
            className="w-12 h-12 rounded-[4px] flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
          >
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold mb-1 text-[var(--color-text-primary)]">
              No Resource Selected
            </h3>
            <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
              Click or right-click any resource on the canvas to inspect its configuration and security checks.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const findings = selectedResource.security_findings ?? [];
  const criticalCount = findings.filter((f: any) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f: any) => f.severity === 'HIGH').length;

  const containers = topology.resources.filter(
    (r: AzureResourceIR) => r.id !== selectedResource.id && ['rg', 'vnet', 'subnet'].includes(r.container_level ?? '')
  );

  const TABS: { id: InspectorTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'properties', label: 'Config',   icon: <Settings className="w-3.5 h-3.5" /> },
    { id: 'security',   label: 'Security', icon: <Shield className="w-3.5 h-3.5" />,   badge: findings.length },
    { id: 'cost',       label: 'Cost',     icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'docs',       label: 'Docs',     icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside className={containerClass}>
      {/* Header (Details Panel Header) */}
      <div
        className="px-3.5 py-2.5 flex items-start justify-between gap-2 shrink-0 border-b"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-border)]"
          >
            <AzureIcon type={selectedResource.type} size={22} />
          </div>

          <div className="overflow-hidden">
            <h3 className="text-[13px] font-bold truncate text-[var(--color-text-primary)]">
              {selectedResource.name}
            </h3>
            <p
              className="text-[10px] truncate mt-0.5 text-[var(--color-text-muted)] font-mono"
            >
              {selectedResource.type}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {criticalCount > 0 && (
                <span className="badge-critical text-[9px] px-1.5 py-0.2 rounded font-bold">
                  {criticalCount} CRITICAL
                </span>
              )}
              {highCount > 0 && (
                <span className="badge-high text-[9px] px-1.5 py-0.2 rounded font-bold">
                  {highCount} HIGH
                </span>
              )}
              {findings.length === 0 && (
                <span className="badge-ok text-[9px] px-1.5 py-0.2 rounded font-bold">
                  COMPLIANT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action icons: Pin, Delete, Close */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => toggleInspectorPin()}
            className={`p-1 rounded-[var(--radius-sm)] transition-colors ${isInspectorPinned ? 'text-[var(--color-primary-light)] bg-[var(--color-surface-2)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'}`}
            title={isInspectorPinned ? 'Unpin panel' : 'Pin panel to workspace'}
          >
            {isInspectorPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => removeResource(selectedResource.id)}
            className="p-1 rounded-[var(--radius-sm)] transition-colors text-[var(--color-text-muted)] hover:bg-[#FFEDEB] dark:hover:bg-[#441C17] hover:text-[#CA3521]"
            title="Delete resource"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => closeInspector()}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
            title="Close panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-item flex items-center gap-1.5 flex-1 justify-center relative ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-[#CA3521] text-white ml-1"
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'properties' && (
          <PropertiesTab
            resource={selectedResource}
            containers={containers}
            allResources={topology.resources}
            onPropertyChange={(k, v) => updateResourceProperties(selectedResource.id, { [k]: v })}
            onParentChange={(pId) => updateResourceParent(selectedResource.id, pId)}
            onSelectResource={(id) => selectResource(id)}
            onRename={(newName) => renameResource(selectedResource.id, newName)}
          />
        )}
        {activeTab === 'security' && (
          <SecurityTab
            resource={selectedResource}
            onAiFix={() => toggleCopilot?.(true)}
          />
        )}
        {activeTab === 'cost' && <FinOpsTab resource={selectedResource} />}
        {activeTab === 'docs'  && <DocsTab  resource={selectedResource} />}
      </div>
    </aside>
  );
};
