import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  Code2,
  Sparkles,
  Server,
  Database,
  Lock,
  Play,
  Pause,
} from 'lucide-react';

export type FeatureStageKey = 'ast-sync' | 'secops' | 'finops';

interface FeatureStageProps {
  stageKey: FeatureStageKey;
}

const CYCLE_MS = 6000;
const TICK_MS = 100;
const RING_RADIUS = 21;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const FeatureStage: React.FC<FeatureStageProps> = ({ stageKey }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setElapsedMs((prev) => (prev + TICK_MS) % CYCLE_MS);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  const progress = elapsedMs / CYCLE_MS;
  const phase = elapsedMs < 2000 ? 0 : elapsedMs < 4000 ? 1 : 2;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative mt-8 sm:mt-10 px-4 sm:px-10 pb-0 overflow-hidden">
      {/* 16:9 Framed Product Stage on Desktop; Auto-height min-340px on Mobile so zero panes clip */}
      <div className="tp-stage-mask relative mx-auto w-full max-w-[1100px] md:aspect-[16/9] max-md:min-h-[340px] rounded-t-[14px] border border-b-0 border-stone-400/50 bg-[#f5f5f4] shadow-sm overflow-hidden flex flex-col">
        {/* Window Chrome Bar */}
        <div className="h-9 sm:h-10 px-3 sm:px-4 bg-[#e7e5e4] border-b border-stone-300 flex items-center justify-between text-[11px] font-mono text-stone-600 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400/70 shrink-0" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400/70 shrink-0" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400/70 shrink-0" />
            <span className="ml-2 font-semibold text-stone-800 truncate">
              {stageKey === 'ast-sync' && 'toporo://hub-spoke-prod · main.tf'}
              {stageKey === 'secops' && 'toporo://cis-audit · CIS v2.0'}
              {stageKey === 'finops' && 'toporo://finops-ledger · East US 2'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Synced
            </span>
          </div>
        </div>

        {/* Stage Body */}
        <div className="flex-1 min-h-0 w-full">
          {stageKey === 'ast-sync' && <AstSyncStage phase={phase} />}
          {stageKey === 'secops' && <SecOpsStage phase={phase} />}
          {stageKey === 'finops' && <FinOpsStage phase={phase} />}
        </div>
      </div>

      {/* Bottom-Right Circular Glassmorphic Play/Pause Progress Ring */}
      <button
        type="button"
        onClick={() => setIsPlaying((p) => !p)}
        aria-label={isPlaying ? 'Pause stage animation' : 'Play stage animation'}
        className="absolute bottom-4 right-5 sm:bottom-6 sm:right-14 w-12 h-12 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-colors z-10 cursor-pointer"
      >
        <svg className="w-12 h-12 -rotate-90 absolute inset-0" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="2"
          />
          <circle
            cx="24"
            cy="24"
            r={RING_RADIUS}
            fill="none"
            stroke="#a7e68f"
            strokeWidth="2"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {isPlaying ? <Pause className="w-4 h-4 relative z-10" /> : <Play className="w-4 h-4 relative z-10 ml-0.5" />}
      </button>
    </div>
  );
};

const AstSyncStage: React.FC<{ phase: number }> = ({ phase }) => {
  const vmSku = phase === 0 ? 'Standard_D2s_v5' : phase === 1 ? 'Standard_D4s_v5' : 'Standard_E4s_v5';
  const httpsOnly = phase === 2 ? 'true' : phase === 1 ? 'true' : 'false';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 h-full bg-[#fafaf9]">
      {/* Visual Topology Side */}
      <div className="md:col-span-7 p-3 sm:p-6 border-b md:border-b-0 md:border-r border-stone-300 flex flex-col justify-between bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-stone-600">
          <span className="px-2 py-0.5 rounded bg-white border border-stone-300 font-semibold text-stone-800">
            rg-enterprise-prod
          </span>
          <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300/70">
            Smart Layout · 3 Nodes
          </span>
        </div>

        {/* Connected Nodes Mock */}
        <div className="my-auto flex items-center justify-center gap-3 sm:gap-5 py-3">
          <div
            className={`rounded-lg border p-2.5 sm:p-3.5 bg-white transition-all duration-300 w-32 sm:w-44 ${
              phase === 0 ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-stone-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500 mb-1">
              <Server className="w-3 h-3 text-emerald-700" />
              <span>FIREWALL</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900 truncate">afw-hub-central</div>
            <div className="text-[10px] font-mono text-stone-500 mt-1">10.0.1.0/24</div>
          </div>

          <div className="w-6 sm:w-10 h-px bg-stone-400 relative">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          </div>

          <div
            className={`rounded-lg border p-2.5 sm:p-3.5 bg-white transition-all duration-300 w-36 sm:w-48 ${
              phase > 0 ? 'border-[#155dfc] ring-2 ring-[#155dfc]/20' : 'border-stone-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500 mb-1">
              <Database className="w-3 h-3 text-[#155dfc]" />
              <span>AKS + COMPUTE</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900 truncate">aks-spoke-workloads</div>
            <div className="text-[10px] font-mono text-stone-600 mt-1 truncate">{vmSku}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-stone-500">
          <span>Sync Step {phase + 1}/3: Canvas Attribute &rarr; Code Sync</span>
          <span className="hidden sm:inline">0.4ms Live Diff</span>
        </div>
      </div>

      {/* Live HCL2 Code Side */}
      <div className="md:col-span-5 bg-[#171717] text-stone-200 p-3 sm:p-5 font-mono text-[10px] sm:text-xs flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-stone-400">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#a7e68f]" />
            <span>main.tf (HCL2)</span>
          </span>
          <span className="text-[#a7e68f] text-[10px]">LIVE WRITE</span>
        </div>

        <pre className="my-auto leading-relaxed overflow-hidden text-[10px] sm:text-[11px]">
          <code>
            <span className="text-purple-300">resource</span>{' '}
            <span className="text-amber-200">&quot;azurerm_kubernetes_cluster&quot;</span>{' '}
            <span className="text-white">&quot;aks_spoke&quot;</span> {'{\n'}
            {'  name                = '}
            <span className="text-[#a7e68f]">&quot;aks-spoke-workloads&quot;</span>
            {'\n  default_node_pool {\n'}
            {'    vm_size           = '}
            <span className="px-1 rounded bg-[#a7e68f]/20 text-[#a7e68f] transition-all">&quot;{vmSku}&quot;</span>
            {'\n    node_count        = 3\n  }\n'}
            {'  https_proxy_only    = '}
            <span className="px-1 rounded bg-sky-400/20 text-sky-300 transition-all">{httpsOnly}</span>
            {'\n}'}
          </code>
        </pre>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400">
          <span>Line 14 mutated from Node Inspector</span>
          <span className="text-[#a7e68f]">0 Syntax Errors</span>
        </div>
      </div>
    </div>
  );
};

const SecOpsStage: React.FC<{ phase: number }> = ({ phase }) => {
  const remediated = phase === 2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 h-full bg-[#fafaf9]">
      <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-stone-300 p-3 sm:p-5 bg-[#f5f5f4] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-stone-600 mb-1">
          <span className="font-semibold text-stone-900">CIS GUARDRAIL QUEUE</span>
          <span
            className={`px-2 py-0.5 rounded font-semibold ${
              remediated ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            Score: {remediated ? '100%' : '78%'}
          </span>
        </div>

        <div
          className={`rounded-lg border p-2.5 sm:p-3 transition-colors ${
            remediated ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold">
            <span className="flex items-center gap-1.5 text-stone-900">
              {remediated ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              )}
              CIS-AZ-10
            </span>
            <span className={remediated ? 'text-emerald-700' : 'text-rose-700'}>
              {remediated ? 'PASSED' : 'HIGH RISK'}
            </span>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">
            NSG inbound rule must restrict SSH port 22 from Any (*) CIDR.
          </p>
        </div>

        <div className="rounded-lg border border-stone-300 bg-white p-2.5 sm:p-3">
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold">
            <span className="flex items-center gap-1.5 text-stone-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              CIS-AZ-35
            </span>
            <span className="text-emerald-700">PASSED</span>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">Storage account default network action set to Deny.</p>
        </div>
      </div>

      <div className="md:col-span-7 p-3 sm:p-6 flex flex-col justify-between bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="text-xs sm:text-sm font-semibold text-stone-900">
              nsg-app-spoke · Security Guardrail Inspector
            </span>
          </div>
          <span
            className={`text-[11px] font-mono px-2.5 py-1 rounded-md font-medium transition-all ${
              phase === 1
                ? 'bg-stone-900 text-white ring-4 ring-stone-900/15'
                : remediated
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 text-stone-700'
            }`}
          >
            {phase === 0 ? 'Flagged Violation' : phase === 1 ? 'Applying Patch…' : 'CIS Compliant'}
          </span>
        </div>

        <div className="my-auto rounded-lg bg-[#171717] text-stone-200 p-3 sm:p-4 font-mono text-[10px] sm:text-xs">
          <div className="text-stone-400 mb-2"># Auto-Remediation Diff (nsg.tf)</div>
          <div className="text-rose-400">- source_address_prefix = &quot;*&quot;</div>
          <div className="text-[#a7e68f]">+ source_address_prefix = &quot;10.0.10.0/24&quot;</div>
          <div className="text-[#a7e68f]">+ access                = &quot;Deny&quot;</div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            Zero exposed management endpoints
          </span>
          <span className="hidden sm:inline">CIS Azure Foundations v2.0</span>
        </div>
      </div>
    </div>
  );
};

const FinOpsStage: React.FC<{ phase: number }> = ({ phase }) => {
  const isRightSized = phase >= 1;
  const rows = [
    {
      name: 'Azure Firewall Premium',
      sku: isRightSized ? 'AZFW_Standard' : 'AZFW_Premium',
      cost: isRightSized ? '$452.60' : '$912.50',
    },
    {
      name: 'AKS User Node Pool (x3)',
      sku: phase === 2 ? 'Standard_B4ms' : 'Standard_D4s_v5',
      cost: phase === 2 ? '$189.20' : '$418.40',
    },
    {
      name: 'PostgreSQL Flexible',
      sku: 'GP_Standard_D2ds_v4',
      cost: '$142.80',
    },
  ];
  const total = phase === 0 ? '$1,473.70' : phase === 1 ? '$1,013.80' : '$784.60';

  return (
    <div className="p-3 sm:p-6 bg-white h-full flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
            LIVE FINOPS BILL OF MATERIALS
          </div>
          <div className="text-sm sm:text-lg font-semibold text-stone-900">
            Estimated Monthly Spend: <span className="font-mono text-[#1b8a4b]">{total}/mo</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-mono text-emerald-800">
          <DollarSign className="w-3.5 h-3.5" />
          <span>{phase === 0 ? 'Baseline Tier' : phase === 1 ? '-$459.90 Saved' : '-$689.10 Optimized'}</span>
        </div>
      </div>

      <div className="my-auto space-y-2 py-2">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-lg bg-[#f5f5f4] border border-stone-200 text-xs sm:text-sm"
          >
            <div className="min-w-0 pr-2">
              <div className="font-medium text-stone-900 truncate">{r.name}</div>
              <div className="font-mono text-[10px] sm:text-xs text-stone-500">{r.sku}</div>
            </div>
            <div className="font-mono font-semibold text-stone-900 shrink-0">{r.cost}/mo</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-stone-500 border-t border-stone-200 pt-2">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#1b8a4b]" />
          Synced with Azure Retail Prices API
        </span>
        <span className="hidden sm:inline">730 hrs/mo continuous run-rate</span>
      </div>
    </div>
  );
};

