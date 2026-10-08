import React, { useState, useRef, useEffect } from 'react';
import {
  X, Sparkles, Send, Loader2, Check, RotateCcw,
  ChevronDown, ChevronUp, Lightbulb, History, Wand2,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';

// ─── Example prompt cards ─────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  {
    label: '3-Tier Web App',
    prompt: 'Create a 3-tier web architecture with Azure App Service, Azure SQL Database, and Redis Cache, all secured with a Key Vault and private endpoints.',
    color: '#0C66E4',
  },
  {
    label: 'AKS + Cosmos DB',
    prompt: 'Design a microservices architecture using AKS cluster connected to Cosmos DB and Azure Service Bus for event-driven communication, with a managed identity.',
    color: '#0052CC',
  },
  {
    label: 'Hub & Spoke Network',
    prompt: 'Build a hub and spoke network topology with a central hub VNet containing an Azure Firewall, and two spoke VNets for workloads peered to the hub.',
    color: '#1F845A',
  },
  {
    label: 'OpenAI Workload',
    prompt: 'Set up an Azure OpenAI workload with a Function App as the API layer, Storage Account for blob data, Key Vault for secrets, and User Assigned Identity.',
    color: '#E34935',
  },
  {
    label: 'Secure Landing Zone',
    prompt: 'Create a secure Azure landing zone with Application Gateway with WAF, NSGs on all subnets, private endpoints for all PaaS services, and Key Vault.',
    color: '#E2B203',
  },
];

// ─── Message types ─────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'pending' | 'success' | 'error';
  resourceCount?: number;
  timestamp: Date;
}

// ─── Streaming typewriter ─────────────────────────────────────────────────

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, ++i));
      } else {
        clearInterval(timer);
      }
    }, 8);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayed}</span>;
};

// ─── Copilot Drawer ──────────────────────────────────────────────────────────

export const CopilotModal: React.FC = () => {
  const {
    isCopilotOpen,
    toggleCopilot,
    generateArchitecture,
    applyGeneratedTopology,
    isGenerating,
    generatedTopologyPreview,
  } = useTopologyStore() as any;

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea when drawer opens
  useEffect(() => {
    if (isCopilotOpen) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isCopilotOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userMsg: Message = {
      id:        `user_${Date.now()}`,
      role:      'user',
      content:   prompt,
      timestamp: new Date(),
    };
    const pendingMsg: Message = {
      id:        `ai_${Date.now()}`,
      role:      'assistant',
      content:   '',
      status:    'pending',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg, pendingMsg]);
    setPrompt('');
    setShowExamples(false);

    try {
      const result = await generateArchitecture?.(prompt);
      const count = result?.topology?.resources?.length ?? 0;
      setMessages(prev => prev.map(m =>
        m.id === pendingMsg.id
          ? { ...m, content: `Generated ${count} Azure resource${count !== 1 ? 's' : ''}. Review the architecture below, then apply it to the canvas.`, status: 'success', resourceCount: count }
          : m
      ));
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === pendingMsg.id
          ? { ...m, content: `Failed to generate: ${err.message ?? 'Unknown error'}`, status: 'error' }
          : m
      ));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isCopilotOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
          onClick={() => toggleCopilot(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`copilot-drawer z-50 flex flex-col ${isCopilotOpen ? 'open' : ''}`}
      >
        {/* ── Drawer Header ── */}
        <div
          className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-[3px] flex items-center justify-center bg-[var(--color-primary)] text-white shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-[var(--color-text-primary)]">Architecture Copilot</h2>
              <p className="text-[10.5px] text-[var(--color-text-muted)]">AI Architecture Assistant for Azure</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory(p => !p)}
              className={`toolbar-btn ${showHistory ? 'active' : ''}`}
              title="Prompt history"
            >
              <History className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleCopilot(false)}
              className="toolbar-btn"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Message history ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5">
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="text-center py-5 space-y-2.5">
              <div
                className="w-12 h-12 mx-auto rounded-[4px] flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-primary-light)]"
              >
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[13px] font-semibold mb-1 text-[var(--color-text-primary)]">
                  Describe what you want to build
                </p>
                <p className="text-[11.5px] leading-relaxed text-[var(--color-text-muted)] max-w-[320px] mx-auto">
                  Copilot converts your natural language requirements into compliant Azure architecture, complete with Terraform HCL, security rules, and cost metrics.
                </p>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
                style={msg.role === 'assistant'
                  ? { background: 'var(--color-primary)', color: 'white' }
                  : { background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }
                }
              >
                {msg.role === 'assistant' ? <Sparkles className="w-3 h-3" /> : 'You'}
              </div>

              {/* Bubble */}
              <div
                className="max-w-[340px] rounded-[var(--radius-md)] px-3 py-2 text-[12px] leading-relaxed"
                style={{
                  background: msg.role === 'user' ? 'var(--color-surface-2)' : 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {msg.status === 'pending' ? (
                  <div className="flex items-center gap-2 py-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-primary-light)]" />
                    <span className="text-[11.5px] text-[var(--color-text-muted)]">Synthesizing architecture…</span>
                  </div>
                ) : (
                  <>
                    <p className="text-[12px]">
                      {msg.role === 'assistant' && msg.status === 'success'
                        ? <TypewriterText text={msg.content} />
                        : msg.content
                      }
                    </p>

                    {/* Apply / Discard buttons */}
                    {msg.role === 'assistant' && msg.status === 'success' && generatedTopologyPreview && (
                      <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-[var(--color-border)]">
                        <button
                          onClick={() => { applyGeneratedTopology?.(); setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: undefined } : m)); }}
                          className="flex-1 btn-primary text-[11px] h-7 justify-center font-semibold"
                        >
                          <Check className="w-3 h-3" />
                          Apply to Canvas
                        </button>
                        <button
                          onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                          className="btn-ghost text-[11px] h-7 px-2.5 font-medium"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Discard
                        </button>
                      </div>
                    )}

                    {msg.status === 'error' && (
                      <div className="mt-1.5 text-[11px] text-[#CA3521] dark:text-[#FD9891] flex items-center gap-1 font-medium">
                        <span>⚠️</span> {msg.content}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Example Prompts ── */}
        {showExamples && messages.length === 0 && (
          <div className="px-4 pb-3">
            <button
              onClick={() => setShowExamples(p => !p)}
              className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider mb-2 w-full text-left text-[var(--color-text-muted)]"
            >
              <Lightbulb className="w-3 h-3" />
              Example Prompts
              {showExamples ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>
            <div className="space-y-1.5">
              {EXAMPLE_PROMPTS.map(ex => (
                <button
                  key={ex.label}
                  onClick={() => { setPrompt(ex.prompt); setShowExamples(false); textareaRef.current?.focus(); }}
                  className="w-full text-left px-2.5 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9.5px] px-1.5 py-0.2 rounded-[2px] font-bold uppercase tracking-wider"
                      style={{ background: `${ex.color}15`, color: ex.color, border: `1px solid ${ex.color}30` }}
                    >
                      {ex.label}
                    </span>
                    <ChevronDown className="w-3 h-3 ml-auto -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)]" />
                  </div>
                  <p className="mt-1 leading-snug line-clamp-2 text-[11px] text-[var(--color-text-secondary)]">
                    {ex.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input area ── */}
        <div
          className="px-4 pb-3.5 pt-2.5 shrink-0 border-t"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          <div
            className="rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)]"
          >
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the Azure architecture you want to build…"
              rows={3}
              disabled={isGenerating}
              className="w-full resize-none px-3 pt-2.5 pb-2 text-[12px] bg-transparent outline-none text-[var(--color-text-primary)]"
              style={{ lineHeight: '1.5' }}
            />
            <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                <kbd className="kbd">⌘ Enter</kbd> to generate
              </span>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="btn-primary h-7 px-3 text-[11.5px] font-semibold"
              >
                {isGenerating
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Send className="w-3 h-3" />}
                {isGenerating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
          <p className="text-[10px] mt-1.5 text-center text-[var(--color-text-muted)]">
            Review generated architecture and HCL before deploying to Azure.
          </p>
        </div>
      </div>
    </>
  );
};
