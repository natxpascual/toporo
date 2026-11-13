import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2, Shield, DollarSign, Settings, Info,
  CheckCircle2, AlertTriangle, ExternalLink, Copy,
  Sparkles, BookOpen, TrendingDown, ChevronRight, X,
  Pin, PinOff, Maximize2, Minimize2, GripHorizontal, Crown,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { AzureResourceIR } from '../../services/api';
import { AzureIcon, getFriendlyTypeName } from '../icons/AzureIcons';

// ─── Severity badge ─────────────────────────────────────────────────────────

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

// ─── Properties Tab (Horizontal Multi-Column Layout) ───────────────────────

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

  useEffect(() => {
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
      className={`input-dark text-[12px] h-7 ${disabled ? 'opacity-70 cursor-not-allowed bg-[var(--color-surface-2)]' : ''}`}
    />
  );

  const SelectInput: React.FC<{ value: string; onChange: (v: string) => void; options: [string, string][] }> = ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input-dark text-[12px] h-7 cursor-pointer"
    >
      {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
    </select>
  );

  const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void; danger?: boolean }> = ({ label, checked, onChange, danger }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-[12px] text-[var(--color-text-primary)]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-8 h-4 rounded-full transition-all duration-150 relative ${checked
          ? (danger ? 'bg-[#CA3521]' : 'bg-[var(--color-primary)]')
          : 'bg-[var(--color-surface-3)]'
        }`}
        style={{ border: '1px solid var(--color-border)' }}
      >
        <span
          className="absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-150"
          style={{
            background: checked && !danger ? 'var(--color-on-primary)' : 'white',
            left: checked ? '17px' : '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        />
      </button>
    </div>
  );

  return (
    <div className="p-3.5 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Column 1: Details & Hierarchy */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-1">
          Identity & Hierarchy
        </div>
        <FormField label="Resource Name" hint="Enter to save">
          <TextInput
            value={nameVal}
            onChange={setNameVal}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
          />
        </FormField>
        <FormField label="Parent Container">
          <SelectInput
            value={resource.parent_id || ''}
            onChange={v => onParentChange(v ? v : null)}
            options={[
              ['', '(None - Standalone / Root)'],
              ...containers.map(c => [
                c.id,
                `${c.name} (${getFriendlyTypeName(c.type)})`
              ] as [string, string])
            ]}
          />
        </FormField>
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

      {/* Column 2: Specific Configuration */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-1">
          Configuration & SKUs
        </div>

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

        {resource.type === 'azurerm_firewall' && (
          <>
            <FormField label="SKU Tier">
              <SelectInput
                value={props.sku_tier || 'Standard'}
                onChange={v => onPropertyChange('sku_tier', v)}
                options={[['Standard', 'Standard ($912.50/mo)'], ['Premium', 'Premium (IDPS & TLS)'], ['Basic', 'Basic (SMB)']]}
              />
            </FormField>
            <FormField label="Threat Intel Mode">
              <SelectInput
                value={props.threat_intel_mode || 'Alert'}
                onChange={v => onPropertyChange('threat_intel_mode', v)}
                options={[['Alert', 'Alert Only'], ['Deny', 'Alert and Deny'], ['Off', 'Disabled']]}
              />
            </FormField>
          </>
        )}

        {resource.type === 'azurerm_redis_cache' && (
          <>
            <FormField label="SKU Tier">
              <SelectInput
                value={props.sku_name || 'Standard'}
                onChange={v => onPropertyChange('sku_name', v)}
                options={[['Basic', 'Basic (No SLA)'], ['Standard', 'Standard (HA)'], ['Premium', 'Premium (Clustering)']]}
              />
            </FormField>
            <Toggle label="Non-SSL Port Enabled" checked={props.enable_non_ssl_port === true} onChange={v => onPropertyChange('enable_non_ssl_port', v)} danger />
          </>
        )}

        {/* Fallback for other resources */}
        {!['azurerm_linux_virtual_machine', 'azurerm_storage_account', 'azurerm_mssql_database', 'azurerm_key_vault', 'azurerm_firewall', 'azurerm_redis_cache'].includes(resource.type) && (
          Object.entries(props).slice(0, 4).map(([k, v]) => (
            <FormField key={k} label={k.replace(/_/g, ' ')}>
              <TextInput value={String(v)} onChange={val => onPropertyChange(k, val)} />
            </FormField>
          ))
        )}
      </div>

      {/* Column 3: Hierarchy Trail & Quick Actions */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-1">
          Topology Trail & Quick Snippet
        </div>

        {ancestors.length > 0 ? (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[var(--color-text-muted)]">
              Ancestor Path
            </label>
            <div className="p-1.5 rounded-[var(--radius-sm)] flex items-center flex-wrap gap-1 bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              {ancestors.map((anc, idx) => (
                <React.Fragment key={anc.id}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />}
                  <button
                    type="button"
                    onClick={() => onSelectResource(anc.id)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-surface)] hover:bg-[var(--color-surface-3)] text-[11px] font-medium text-[var(--color-text-primary)] transition-colors"
                  >
                    <AzureIcon type={anc.type} size={12} />
                    <span className="truncate max-w-[85px]">{anc.name}</span>
                  </button>
                </React.Fragment>
              ))}
              <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
              <span className="px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] text-[11px] font-semibold flex items-center gap-1">
                <AzureIcon type={resource.type} size={12} />
                <span className="truncate max-w-[85px]">{resource.name}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-[var(--color-text-muted)] italic">
            Root resource (no parent container)
          </div>
        )}

        {directChildren.length > 0 && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[var(--color-text-muted)]">
              Contained Items ({directChildren.length})
            </label>
            <div className="p-1 rounded-[var(--radius-sm)] space-y-0.5 max-h-24 overflow-y-auto bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              {directChildren.map((ch) => (
                <button
                  type="button"
                  key={ch.id}
                  onClick={() => onSelectResource(ch.id)}
                  className="w-full flex items-center justify-between p-1 rounded hover:bg-[var(--color-surface)] transition-colors text-left"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <AzureIcon type={ch.type} size={13} />
                    <span className="text-[11px] font-medium text-[var(--color-text-primary)] truncate">{ch.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="w-full btn-ghost text-[11px] py-1.5 justify-center"
          onClick={() => navigator.clipboard.writeText(`resource "${resource.type}" "${resource.name}" {}`)}
        >
          <Copy className="w-3.5 h-3.5" />
          Copy HCL Resource Block
        </button>
      </div>
    </div>
  );
};

// ─── Security Tab ──────────────────────────────────────────────────────────

const SecurityTab: React.FC<{ resource: AzureResourceIR; onAiFix?: () => void; isFreePlan?: boolean }> = ({
  resource,
  onAiFix,
  isFreePlan = false,
}) => {
  const findings = resource.security_findings ?? [];
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;

  if (findings.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[140px]">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
        >
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[13px] font-semibold" style={{ color: 'var(--color-success)' }}>
            All security checks passed
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            Compliant with CIS Azure Benchmarks
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 space-y-3">
      {/* Summary Row */}
      <div
        className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] border"
        style={{
          background: 'var(--color-danger-bg)',
          borderColor: 'rgba(253, 152, 145, 0.25)',
        }}
      >
        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-danger)' }} />
        <div className="text-[11.5px] text-[var(--color-text-primary)]">
          <strong style={{ color: 'var(--color-danger)' }}>{criticalCount}</strong> critical,{' '}
          <strong style={{ color: 'var(--color-warning)' }}>{highCount}</strong> high findings detected.
        </div>
        {isFreePlan ? (
          <span
            className="ml-auto relative group inline-flex shrink-0"
            title="Toporo Pro feature — Upgrade or start a 7-day trial to unlock AI remediation"
          >
            <button
              type="button"
              disabled
              aria-disabled="true"
              data-testid="inspector-ai-fix-btn"
              className="text-[11px] py-1 px-2.5 h-auto rounded-[var(--radius-sm)] border border-amber-500/40 bg-amber-500/10 text-[var(--color-text-muted)] inline-flex items-center gap-1 opacity-80 cursor-not-allowed select-none"
            >
              <Crown className="w-3 h-3 text-amber-500 fill-amber-400/25 shrink-0" aria-hidden="true" />
              <Sparkles className="w-3 h-3 opacity-60 shrink-0" />
              <span>Fix with AI Copilot</span>
            </button>
            <span
              role="tooltip"
              className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full right-0 mb-1.5 w-56 p-2 rounded-md bg-[#0B1D0B] border border-amber-400/40 text-[#F5F5F4] text-[10.5px] leading-snug shadow-xl z-50"
            >
              Toporo Pro feature — AI security remediation requires Toporo Pro.
            </span>
          </span>
        ) : (
          <button
            onClick={onAiFix}
            data-testid="inspector-ai-fix-btn"
            className="ml-auto btn-primary text-[11px] py-1 px-2.5 h-auto shadow-xs shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            Fix with AI Copilot
          </button>
        )}
      </div>

      {/* Grid of findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {findings.map((f) => (
          <div
            key={f.rule_id}
            className="p-2.5 rounded-[var(--radius-sm)] space-y-1 bg-[var(--color-surface)] border border-[var(--color-border)]"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                {f.rule_id}
              </span>
              <SeverityBadge severity={f.severity} />
            </div>
            <div className="text-[11.5px] font-semibold text-[var(--color-text-primary)]">{f.rule_name}</div>
            <div className="text-[10.5px] text-[var(--color-text-muted)] leading-relaxed">{f.description}</div>
            {f.fix_suggestion && (
              <div
                className="p-1.5 rounded-[var(--radius-sm)] text-[10px] font-mono border"
                style={{
                  background: 'var(--color-success-bg)',
                  borderColor: 'rgba(75, 206, 151, 0.25)',
                  color: 'var(--color-success)',
                }}
              >
                💡 {f.fix_suggestion}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── FinOps Tab ────────────────────────────────────────────────────────────

const FinOpsTab: React.FC<{ resource: AzureResourceIR; onOptimize?: () => void; isFreePlan?: boolean }> = ({
  resource,
  onOptimize,
  isFreePlan = false,
}) => {
  const cost = resource.cost;
  const monthly = cost?.monthly_cost_usd ?? 0;
  const annual  = monthly * 12;

  return (
    <div className="p-3.5 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {/* Cost KPI card */}
      <div
        className="p-3 rounded-[var(--radius-sm)] text-center border"
        style={{
          background: 'var(--color-success-bg)',
          borderColor: 'rgba(75, 206, 151, 0.25)',
        }}
      >
        <div className="text-[10px] uppercase tracking-widest font-bold mb-1 text-[var(--color-text-secondary)]">
          Estimated Spend
        </div>
        <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-success)' }}>
          ${monthly.toFixed(2)}
          <span className="text-xs font-normal text-[var(--color-text-secondary)]">/mo</span>
        </div>
        <div className="text-[11px] mt-0.5 text-[var(--color-text-secondary)]">
          ${annual.toFixed(2)} / year
        </div>
        {isFreePlan ? (
          <span
            className="mt-3 w-full relative group inline-flex"
            title="Toporo Pro feature — Upgrade or start a 7-day trial to unlock AI FinOps optimization"
          >
            <button
              type="button"
              disabled
              aria-disabled="true"
              data-testid="inspector-ai-optimize-btn"
              className="w-full text-[11px] py-1.5 px-2.5 rounded-[var(--radius-sm)] border border-amber-500/40 bg-amber-500/10 text-[var(--color-text-muted)] inline-flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed select-none"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400/25 shrink-0" aria-hidden="true" />
              <Sparkles className="w-3.5 h-3.5 opacity-60 shrink-0" />
              <span>Optimize with AI</span>
            </button>
            <span
              role="tooltip"
              className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 p-2 rounded-md bg-[#0B1D0B] border border-amber-400/40 text-[#F5F5F4] text-[10.5px] leading-snug shadow-xl z-50 text-left"
            >
              Toporo Pro feature — AI FinOps optimization requires Toporo Pro.
            </span>
          </span>
        ) : (
          <button
            onClick={onOptimize}
            data-testid="inspector-ai-optimize-btn"
            className="mt-3 w-full btn-ghost text-[11px] py-1.5 justify-center shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
            Optimize with AI
          </button>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="md:col-span-2 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          Cost Breakdown (Infracost / Azure Retail API)
        </div>
        {cost?.breakdown && Object.keys(cost.breakdown).length > 0 ? (
          <div className="rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-border)]">
            {Object.entries(cost.breakdown).map(([k, v], idx, arr) => (
              <div
                key={k}
                className="flex items-center justify-between px-3 py-1.5 text-[11.5px]"
                style={{
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                  background: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                }}
              >
                <span className="capitalize text-[var(--color-text-secondary)]">{k.replace(/_/g, ' ')}</span>
                <span className="font-semibold font-mono text-[var(--color-text-primary)]">${Number(v).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[12px]">
            Baseline compute profile evaluated without extra meter charges.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Docs Tab ─────────────────────────────────────────────────────────────

const DocsTab: React.FC<{ resource: AzureResourceIR }> = ({ resource }) => {
  const resourceSlug = resource.type.replace('azurerm_', '').replace(/_/g, '-');
  const docsUrl = `https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/${resource.type.replace('azurerm_', '')}`;

  return (
    <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-3 rounded-[var(--radius-sm)] flex items-start gap-2.5 bg-[var(--color-surface)] border border-[var(--color-border)]">
        <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-primary-light)]" />
        <div>
          <div className="text-[12px] font-semibold mb-1 text-[var(--color-text-primary)]">
            {resource.type}
          </div>
          <div className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
            Manages an Azure {resourceSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} resource in HashiCorp Terraform syntax.
          </div>
        </div>
      </div>

      <div className="space-y-2">
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
          Microsoft Learn Documentation
        </a>
      </div>
    </div>
  );
};

// ─── Main PropertyInspector (VS Code Bottom Panel Style) ───────────────────

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
    activeTab: storeActiveTab,
  } = useTopologyStore() as any;

  const [activeTab, setActiveTab] = useState<InspectorTab>('properties');
  const [panelHeight, setPanelHeight] = useState<number>(() => {
    const saved = localStorage.getItem('azure_bottom_panel_height');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 140 && parsed <= 700) return parsed;
    }
    return 260;
  });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isFreePlan = user?.effectivePlan !== 'pro';

  // Sync tab with store if requested via Header telemetry
  useEffect(() => {
    if (storeActiveTab === 'finops' || storeActiveTab === 'cost') {
      setActiveTab('cost');
    } else if (storeActiveTab === 'security') {
      setActiveTab('security');
    } else if (storeActiveTab === 'inspector') {
      setActiveTab('properties');
    }
  }, [storeActiveTab]);

  useEffect(() => {
    localStorage.setItem('azure_bottom_panel_height', String(panelHeight));
  }, [panelHeight]);

  const selectedResource: AzureResourceIR | undefined = topology.resources.find(
    (r: AzureResourceIR) => r.id === selectedResourceId
  );

  // If closed and unpinned, hide
  if (!isInspectorPinned && !isInspectorOpen) {
    return null;
  }

  const handleStartResize = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startH = panelHeight;

    const onPointerMove = (me: PointerEvent) => {
      const deltaY = startY - me.clientY;
      const minH = 140;
      const maxH = Math.round(window.innerHeight * 0.65);
      const newH = Math.max(minH, Math.min(maxH, startH + deltaY));
      setPanelHeight(newH);
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const findings = selectedResource?.security_findings ?? [];
  const criticalCount = findings.filter((f: any) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f: any) => f.severity === 'HIGH').length;

  const containers = topology.resources.filter(
    (r: AzureResourceIR) => r.id !== selectedResource?.id && ['rg', 'vnet', 'subnet'].includes(r.container_level ?? '')
  );

  const TABS: { id: InspectorTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'properties', label: 'PROPERTIES',  icon: <Settings className="w-3.5 h-3.5" /> },
    { id: 'security',   label: 'SECURITY',    icon: <Shield className="w-3.5 h-3.5" />,   badge: findings.length },
    { id: 'cost',       label: 'FINOPS COST', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'docs',       label: 'DOCS',        icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  const currentHeight = isMaximized ? '55vh' : `${panelHeight}px`;

  return (
    <>
      {/* Horizontal Top Drag Resizer */}
      {!isMaximized && (
        <div
          className={`bottom-panel-resizer ${isResizing ? 'resizing' : ''}`}
          onPointerDown={handleStartResize}
          title="Drag up/down to resize bottom properties panel"
        >
          <div className="bottom-panel-resizer-handle">
            <GripHorizontal className="w-3 h-3 text-[var(--color-text-muted)]" />
          </div>
        </div>
      )}

      {/* Bottom Panel Container */}
      <section
        className="bottom-panel-container select-none animate-slide-up"
        style={{ height: currentHeight }}
      >
        {/* VS Code Style Header Bar */}
        <div
          className="h-8 flex items-center justify-between px-3 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] select-none"
        >
          {/* Left: VS Code Tabs */}
          <div className="flex items-center h-full gap-0.5 shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-full px-2 flex items-center gap-1 text-[10.5px] font-bold tracking-wider transition-colors border-b-2 uppercase whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'border-[var(--color-primary)] text-[var(--color-text-primary)] bg-[var(--color-surface-2)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-[#CA3521] text-white ml-0.5">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Center: Selected Resource Context Pill */}
          <div className="hidden md:flex items-center justify-end gap-2 min-w-0 flex-1 px-2 overflow-hidden">
            {selectedResource ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-border)] min-w-0 max-w-full">
                <AzureIcon type={selectedResource.type} size={14} />
                <span className="text-[11px] font-bold text-[var(--color-text-primary)] truncate max-w-[110px]">
                  {selectedResource.name}
                </span>
                <span className="hidden xl:inline text-[10px] text-[var(--color-text-muted)] font-mono truncate">
                  {getFriendlyTypeName(selectedResource.type)}
                </span>
                {criticalCount > 0 ? (
                  <span className="badge-critical text-[9px] px-1 rounded font-bold shrink-0">
                    {criticalCount} CRIT
                  </span>
                ) : highCount > 0 ? (
                  <span className="badge-high text-[9px] px-1 rounded font-bold shrink-0">
                    {highCount} HIGH
                  </span>
                ) : (
                  <span className="badge-ok text-[9px] px-1 rounded font-bold shrink-0">
                    OK
                  </span>
                )}
                <button
                  onClick={() => removeResource(selectedResource.id)}
                  className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[#CA3521] transition-colors ml-0.5 shrink-0"
                  title="Delete resource"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-[var(--color-text-muted)] italic truncate">
                No resource selected — Click any canvas node to inspect
              </span>
            )}
          </div>

          {/* Right: Window Controls (Pin, Maximize, Close) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toggleInspectorPin()}
              className={`p-1 rounded-[var(--radius-sm)] transition-colors ${
                isInspectorPinned
                  ? 'text-[var(--color-primary-light)] bg-[var(--color-surface-2)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
              }`}
              title={isInspectorPinned ? 'Unpin bottom panel' : 'Keep panel pinned'}
            >
              {isInspectorPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsMaximized(p => !p)}
              className="p-1 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
              title={isMaximized ? "Restore panel size" : "Maximize panel"}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => closeInspector()}
              className="p-1 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
              title="Close panel (I)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedResource ? (
            <>
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
                  onAiFix={() => !isFreePlan && toggleCopilot?.(true)}
                  isFreePlan={isFreePlan}
                />
              )}
              {activeTab === 'cost' && (
                <FinOpsTab
                  resource={selectedResource}
                  onOptimize={() => !isFreePlan && toggleCopilot?.(true)}
                  isFreePlan={isFreePlan}
                />
              )}
              {activeTab === 'docs' && <DocsTab resource={selectedResource} />}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                <Info className="w-4 h-4" />
              </div>
              <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">
                No Resource Selected
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] max-w-sm">
                Click or drag any Azure component on the canvas to configure its properties, inspect security telemetry, or review FinOps costs.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
