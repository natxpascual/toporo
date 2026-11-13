import React, { useEffect, useState } from 'react';
import { COPILOT_WORKFLOWS } from './brandData';

/* --------------------------------------------------------------------------
   01. HERO 2x4 ARCHITECTURAL MATRIX (Right Column inside #0b1d0b Island)
   -------------------------------------------------------------------------- */
export const HeroArchitecturalMatrix: React.FC = () => {
  const [pulseIndex, setPulseIndex] = useState(0);
  const events = [
    { method: 'AST', path: 'vnet-hub-central · synced', badge: '200', ms: '12ms' },
    { method: 'CIS', path: 'CIS-AZ-35 · private', badge: 'PASS', ms: '18ms' },
    { method: 'COST', path: 'East US 2 · Standard_B4ms', badge: '$148', ms: '9ms' },
  ];

  useEffect(() => {
    const id = window.setInterval(() => {
      setPulseIndex((i) => (i + 1) % events.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [events.length]);

  const activeEvt = events[pulseIndex];

  return (
    <div className="grid grid-cols-2 border-t border-white/30 max-lg:auto-rows-[minmax(8rem,1fr)] lg:grid-rows-4 lg:border-t-0 lg:border-l">
      {/* Row 1 Col 1 */}
      <div className="border-r border-b border-white/30 flex items-center justify-center p-4">
        <svg className="w-12 h-12 text-[#a7e68f]/85" viewBox="0 0 48 48" fill="none">
          <path d="M24 8v32M8 24h32M15 15l18 18M33 15L15 33" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x="20" y="20" width="8" height="8" rx="1" fill="#a7e68f" />
        </svg>
      </div>

      {/* Row 1 Col 2 */}
      <div className="border-b border-white/30 flex items-center justify-center p-4">
        <svg className="w-12 h-12 text-white/60" viewBox="0 0 48 48" fill="none">
          <path
            d="M15 33h19a7 7 0 0 0 1.4-13.86A10 10 0 0 0 16.2 16.5 8 8 0 0 0 15 33Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Row 2 Col 1 — Pixel Topology Mosaic Highlight */}
      <div className="border-r border-b border-white/30 relative overflow-hidden bg-[#132b13] flex items-center justify-center p-3">
        <div className="grid grid-cols-4 gap-1 w-24 h-24 opacity-90">
          {[1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1].map((lit, idx) => (
            <div
              key={idx}
              className={`rounded-[2px] transition-colors duration-500 ${
                lit
                  ? idx === (pulseIndex * 5) % 16
                    ? 'bg-[#a7e68f]'
                    : 'bg-[#F1ED92]/80'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Row 2 Col 2 */}
      <div className="border-b border-white/30 flex items-center justify-center p-4">
        <svg className="w-12 h-12 text-white/55" viewBox="0 0 48 48" fill="none">
          <rect x="10" y="12" width="28" height="19" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 35h36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Row 3 Col 1 — Hidden below lg to mirror crisp Mobile 2x2 grid */}
      <div className="hidden lg:flex border-r border-b border-white/30 items-center justify-center p-4">
        <svg className="w-12 h-12 text-white/55" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="24" cy="24" rx="6" ry="14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 24h28" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Row 3 Col 2 — Live Event Feed Pill */}
      <div className="hidden lg:flex border-b border-white/30 items-center justify-center p-4">
        <div className="w-full rounded-lg border border-white/20 bg-black/35 px-3 py-2 font-mono text-[11px] text-stone-200">
          <div className="flex items-center justify-between text-[#a7e68f]">
            <span>{activeEvt.method}</span>
            <span>{activeEvt.ms}</span>
          </div>
          <div className="truncate text-white/85 mt-1">{activeEvt.path}</div>
        </div>
      </div>

      {/* Row 4 Col 1 */}
      <div className="hidden lg:flex border-r border-white/30 items-center justify-center p-4">
        <svg className="w-12 h-12 text-[#F1ED92]/75" viewBox="0 0 48 48" fill="none">
          <path d="M12 24h24M24 12v24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
          <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Row 4 Col 2 */}
      <div className="hidden lg:flex items-center justify-center p-4">
        <div className="text-center font-mono">
          <div className="text-[11px] text-white/50">COMPLIANCE</div>
          <div className="text-sm font-bold text-[#a7e68f] mt-0.5">CIS v2.0 100%</div>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
   02. FEATURE 04 — AI COPILOT INTERACTIVE CLI SHOWCASE (bg-neutral-900)
   -------------------------------------------------------------------------- */
export const AgentCopilotShowcase: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % COPILOT_WORKFLOWS.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [isPaused]);

  const active = COPILOT_WORKFLOWS[activeIdx];

  return (
    <section id="ai-copilot" className="tp-fill">
      <div className="overflow-hidden rounded-xl bg-neutral-900 p-4 max-sm:p-3 text-white">
        <div className="grid border border-white/15 lg:grid-cols-2">
          {/* Left Column: Title + Interactive Prompt Tabs */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-5 px-12 py-10 max-sm:flex-col max-sm:gap-2 max-sm:px-6 max-sm:py-8">
              <span className="font-mono text-xl text-stone-400">04</span>
              <div>
                <h2 className="tp-h2 font-mono font-bold text-white">
                  Everything above, <span className="tp-holo">agents</span> can do
                </h2>
                <p className="mt-4 text-lg text-stone-300 leading-relaxed max-w-[42ch]">
                  Invoke the built-in Toporo AI Copilot to synthesize compliant networks, patch CIS alerts, and optimize FinOps directly inside the live canvas.
                </p>
              </div>
            </div>

            <div className="mt-auto">
              {COPILOT_WORKFLOWS.map((wf, idx) => {
                const selected = idx === activeIdx;
                return (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`w-full text-left border-t border-white/15 px-12 max-sm:px-6 py-3.5 font-mono text-sm flex items-center gap-3 transition-colors cursor-pointer ${
                      selected ? 'bg-white/[0.06] text-white' : 'text-stone-400 hover:text-stone-200 hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className={selected ? 'text-[#a7e68f]' : 'text-stone-500'}>
                      {selected ? '⏺︎' : '>'}
                    </span>
                    <span>{wf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Auto-Cycling CLI Transcript + Hover Pause Badge */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="group relative min-h-[380px] lg:min-h-[480px] border-white/15 max-lg:border-t lg:border-l bg-[#121212] p-6 sm:p-8 flex flex-col justify-end overflow-hidden"
          >
            {/* Hover Paused Indicator */}
            <div
              className={`absolute top-3 right-3 rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs text-stone-300 transition-opacity duration-150 ${
                isPaused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              ⏸︎ paused
            </div>

            <div key={active.id} className="tp-terminal-mask space-y-5 font-mono text-xs sm:text-sm pt-6">
              <div className="tp-animate-reveal rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-stone-200">
                {active.userPrompt}
              </div>

              <p className="tp-animate-reveal text-stone-300 leading-relaxed">
                {active.assistantIntro}
              </p>

              <div className="tp-animate-reveal rounded-lg border border-[#a7e68f]/25 bg-black/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#a7e68f]">
                  <span>●</span>
                  <span className="font-semibold">{active.toolCall}</span>
                </div>
                <div className="text-stone-400 break-all text-xs">{active.toolArgs}</div>
                <div className="pt-2 border-t border-white/10 text-emerald-300 text-xs">
                  ↳ {active.toolResult}
                </div>
              </div>

              <div className="tp-animate-reveal text-white flex items-center gap-1.5">
                <span>{active.summary}</span>
                <span className="inline-block w-2 h-4 bg-[#a7e68f] tp-cursor-blink shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------------------------------------------------
   03. SECTION 09 — HOW IT WORKS ARCHITECTURAL SCHEMATIC BOARD (#2b5a43)
   -------------------------------------------------------------------------- */
export const HowItWorksBoard: React.FC = () => {
  return (
    <section id="how-it-works" className="tp-fill">
      <div className="tp-board">
        {/* SVG Noise Overlay (Matches Blueprint feTurbulence Spec) */}
        <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-35 mix-blend-soft-light" aria-hidden="true">
          <filter id="tp-board-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#tp-board-grain)" />
        </svg>

        {/* Desktop 10x4 Lattice vs Mobile 4x7 Stacked Schematic */}
        <div className="relative z-10 hidden md:block">
          <div className="tp-board-grid">
            {Array.from({ length: 40 }).map((_, idx) => (
              <div key={idx} className="tp-board-cell" />
            ))}

            {/* Section Heading in Top Left of Schematic */}
            <div className="absolute top-6 left-7 pointer-events-none">
              <h2 className="font-mono text-3xl lg:text-4xl font-bold tracking-tight text-white leading-[1.05]">
                How it
                <br />
                works
              </h2>
            </div>

            {/* Dashed Horizontal & Branching Track Lines (continuous trunk from Input -> Core -> T-junction) */}
            <div
              className="pointer-events-none absolute top-1/2 left-[18%] right-[35%] border-t-2 border-dashed border-[#E7CD84]/85"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute top-[26%] bottom-[26%] left-[65%] border-l-2 border-dashed border-[#E7CD84]/85"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute top-[26%] left-[65%] right-[20%] border-t-2 border-dashed border-[#E7CD84]/85"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute top-[74%] left-[65%] right-[20%] border-t-2 border-dashed border-[#E7CD84]/85"
              aria-hidden="true"
            />

            {/* Animated Packet Dots */}
            <div className="tp-packet-dot-a pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#65ca98] shadow-[0_0_12px_#65ca98]" />
            <div className="tp-packet-dot-b pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#65ca98] shadow-[0_0_12px_#65ca98]" />

            {/* Input Yellow Pointer Pill */}
            <div className="absolute top-1/2 left-[8%] -translate-y-1/2 rounded-full bg-[#FFDF85] text-[#1c1917] px-5 py-2.5 font-mono text-xs font-bold shadow-sm border border-black/10 text-center">
              Canvas Edits
              <br />
              HCL2 / Copilot
            </div>

            {/* Center Core Engine Module */}
            <div className="absolute top-1/2 left-[48%] -translate-x-1/2 -translate-y-1/2 w-44 rounded-xl bg-[#111c15] border border-white/25 p-4 text-center shadow-lg">
              <div className="w-10 h-10 mx-auto rounded-lg bg-[#2b5a43] border border-[#a7e68f]/50 flex items-center justify-center font-mono text-sm font-bold text-[#a7e68f]">
                CORE
              </div>
              <div className="mt-2 font-mono text-xs font-bold tracking-wide text-white">TOPORO ENGINE</div>
              <div className="mt-1 font-mono text-[10px] text-white/65 leading-snug">
                Smart Layout · CIS Guardrails · Azure FinOps
              </div>
            </div>

            {/* Output Target A: Terraform Bundle */}
            <div className="absolute top-[26%] right-[4%] -translate-y-1/2 w-48">
              <div className="tp-node-target-a rounded-lg border border-white/30 bg-[#1a3b2b] px-4 py-3 font-mono">
                <div className="text-xs font-bold text-white">Terraform HCL2</div>
                <div className="text-[11px] text-white/75 mt-0.5">Modular .tf bundle</div>
              </div>
            </div>

            {/* Output Target B: Compliance & BOM */}
            <div className="absolute top-[74%] right-[4%] -translate-y-1/2 w-48">
              <div className="tp-node-target-b rounded-lg border border-white/30 bg-[#1a3b2b] px-4 py-3 font-mono">
                <div className="text-xs font-bold text-white">CIS + FinOps BOM</div>
                <div className="text-[11px] text-white/75 mt-0.5">Zero-drift audit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Vertical Schematic Flow (< 768px) */}
        <div className="relative z-10 md:hidden px-4 py-6 border border-white/20 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:44px_44px] flex flex-col items-center gap-6">
          <h2 className="self-start font-mono text-3xl font-bold text-white">How it works</h2>

          <div className="rounded-full bg-[#FFDF85] text-[#1c1917] px-5 py-2.5 font-mono text-xs font-bold text-center">
            Canvas Edits / HCL2 / Copilot
          </div>

          <div className="h-8 border-l-2 border-dashed border-[#E7CD84]" />

          <div className="w-52 rounded-xl bg-[#111c15] border border-white/25 p-4 text-center">
            <div className="font-mono text-xs font-bold text-[#a7e68f]">TOPORO CORE ENGINE</div>
            <div className="mt-1 font-mono text-[11px] text-white/70">Auto-Layout · CIS v2.0 · FinOps</div>
          </div>

          <div className="h-8 border-l-2 border-dashed border-[#E7CD84]" />

          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="tp-node-target-a rounded-lg border border-white/30 bg-[#1a3b2b] p-3 font-mono text-center">
              <div className="text-xs font-bold text-white">Terraform</div>
              <div className="text-[10px] text-white/75 mt-0.5">Modular .tf</div>
            </div>
            <div className="tp-node-target-b rounded-lg border border-white/30 bg-[#1a3b2b] p-3 font-mono text-center">
              <div className="text-xs font-bold text-white">CIS + FinOps</div>
              <div className="text-[10px] text-white/75 mt-0.5">Live telemetry</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

