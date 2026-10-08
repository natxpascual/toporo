import React, { useState, useRef, useCallback } from 'react';
import {
  X, Upload, FileCode, Clipboard, Cloud, Layers,
  CheckCircle2, AlertCircle, Loader2, ChevronRight,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';

// ─── Import method config ─────────────────────────────────────────────────

type ImportMethod = 'upload' | 'paste' | 'azure' | 'sample';

const METHODS: { id: ImportMethod; icon: React.ElementType; label: string; desc: string; color: string }[] = [
  { id: 'upload', icon: Upload,   label: 'Upload files',        desc: '.tf / .tfstate / tfplan.json',   color: '#0C66E4' },
  { id: 'paste',  icon: Clipboard,label: 'Paste HCL',           desc: 'Paste raw Terraform HCL',         color: '#0052CC' },
  { id: 'azure',  icon: Cloud,    label: 'Azure Subscription',   desc: 'Connect via subscription ID',      color: '#0078D4' },
  { id: 'sample', icon: Layers,   label: 'Sample Architecture',  desc: 'Load a pre-built example',         color: '#1F845A' },
];

const SAMPLES = [
  { id: 'hub-spoke',   label: 'Hub & Spoke Network',   resources: 8  },
  { id: '3tier-web',   label: '3-Tier Web Application', resources: 12 },
  { id: 'aks-micro',   label: 'AKS Microservices',      resources: 15 },
  { id: 'ai-workload', label: 'AI / OpenAI Workload',   resources: 7  },
];

// ─── Drag-drop zone (ADS Style) ───────────────────────────────────────────

const DropZone: React.FC<{
  onFiles: (files: File[]) => void;
  accept: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMsg?: string;
}> = ({ onFiles, accept, status, errorMsg }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }, [onFiles]);

  const Icon = status === 'success' ? CheckCircle2
             : status === 'error'   ? AlertCircle
             : status === 'loading' ? Loader2
             : Upload;

  const iconColor = status === 'success' ? '#1F845A'
                  : status === 'error'   ? '#CA3521'
                  : status === 'loading' ? 'var(--color-primary)'
                  : dragging             ? 'var(--color-primary-light)'
                  : 'var(--color-text-muted)';

  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-2.5 p-7 rounded-[var(--radius-md)] border-2 border-dashed cursor-pointer transition-all duration-150 ${dragging ? 'drop-active' : ''}`}
      style={{
        borderColor: dragging ? 'var(--color-primary)' : 'var(--color-border)',
        background: dragging ? 'var(--color-primary-glow)' : 'var(--color-surface)',
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={e => { if (e.target.files?.length) onFiles(Array.from(e.target.files)); }}
      />

      <div
        className="w-11 h-11 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border)]"
      >
        <Icon className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`} style={{ color: iconColor }} />
      </div>

      <div className="text-center">
        <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">
          {status === 'success' ? 'Import successful!' : status === 'error' ? 'Import failed' : 'Drop files here or click to browse'}
        </div>
        <div className="text-[11px] mt-0.5 text-[var(--color-text-muted)]">
          {status === 'error' ? errorMsg : 'Supports .tf, .tfstate, and tfplan.json files'}
        </div>
      </div>
    </div>
  );
};

// ─── Import Modal ─────────────────────────────────────────────────────────

export const ImportModal: React.FC = () => {
  const { isImportOpen, closeImport, importFromHcl, loadSample } = useTopologyStore() as any;
  const [method, setMethod] = useState<ImportMethod>('upload');
  const [pasteValue, setPasteValue] = useState('');
  const [subId, setSubId]     = useState('');
  const [authMethod, setAuthMethod] = useState('service-principal');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');

  if (!isImportOpen) return null;

  const handleFiles = async (files: File[]) => {
    setUploadStatus('loading');
    try {
      const tfFile = files.find(f => f.name.endsWith('.tf') || f.name.endsWith('.tfstate') || f.name.endsWith('.json'));
      if (!tfFile) throw new Error('No supported file format found');
      const content = await tfFile.text();
      await importFromHcl?.(content);
      setUploadStatus('success');
      setTimeout(() => closeImport?.(), 800);
    } catch (e: any) {
      setUploadStatus('error');
      setUploadError(e.message ?? 'Failed to parse file');
    }
  };

  const handlePasteImport = async () => {
    if (!pasteValue.trim()) return;
    try {
      await importFromHcl?.(pasteValue);
      closeImport?.();
    } catch {}
  };

  const handleSampleLoad = (id: string) => {
    loadSample?.(id);
    closeImport?.();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 animate-fade-in"
        onClick={closeImport}
      />

      {/* Modal Dialog */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg rounded-[var(--radius-lg)] overflow-hidden animate-fade-in"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 16px -4px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 className="text-[14px] font-bold text-[var(--color-text-primary)]">
              Import Infrastructure
            </h2>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              Load Terraform configuration or connect an Azure subscription
            </p>
          </div>
          <button
            onClick={closeImport}
            className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center transition-colors hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method selector cards */}
        <div className="px-5 pt-3.5">
          <div className="grid grid-cols-4 gap-2">
            {METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-[var(--radius-sm)] border transition-all text-center"
                style={{
                  background: method === m.id ? 'var(--color-surface-2)' : 'var(--color-surface)',
                  borderColor: method === m.id ? 'var(--color-primary)' : 'var(--color-border)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-[3px] flex items-center justify-center bg-[var(--color-surface-2)]"
                  style={{ color: method === m.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                >
                  <m.icon className="w-4 h-4" />
                </div>
                <div className="text-[10.5px] font-semibold leading-tight text-[var(--color-text-primary)]">
                  {m.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Method content */}
        <div className="px-5 py-4">
          {method === 'upload' && (
            <DropZone
              onFiles={handleFiles}
              accept=".tf,.tfstate,.json"
              status={uploadStatus}
              errorMsg={uploadError}
            />
          )}

          {method === 'paste' && (
            <div className="space-y-3">
              <textarea
                value={pasteValue}
                onChange={e => setPasteValue(e.target.value)}
                placeholder="# Paste your Terraform HCL here...&#10;resource &quot;azurerm_resource_group&quot; &quot;example&quot; {&#10;  name     = &quot;my-rg&quot;&#10;  location = &quot;East US&quot;&#10;}"
                rows={9}
                className="input-dark w-full resize-none text-[12px] font-mono"
              />
              <button
                onClick={handlePasteImport}
                disabled={!pasteValue.trim()}
                className="btn-primary w-full justify-center disabled:opacity-40"
              >
                <FileCode className="w-4 h-4" />
                Parse & Visualize
              </button>
            </div>
          )}

          {method === 'azure' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10.5px] font-bold mb-1 uppercase tracking-wider text-[var(--color-text-muted)]">
                  Azure Subscription ID
                </label>
                <input
                  type="text"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={subId}
                  onChange={e => setSubId(e.target.value)}
                  className="input-dark font-mono text-[12px]"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold mb-1 uppercase tracking-wider text-[var(--color-text-muted)]">
                  Authentication Method
                </label>
                <select value={authMethod} onChange={e => setAuthMethod(e.target.value)} className="input-dark text-[12px]">
                  <option value="service-principal">Service Principal</option>
                  <option value="managed-identity">Managed Identity</option>
                  <option value="cli">Azure CLI (az login)</option>
                </select>
              </div>
              <div
                className="p-2.5 rounded-[var(--radius-sm)] text-[11px] bg-[#FFF7D6] border border-[#9E6C00]/20 text-[#9E6C00] dark:bg-[#332E1B] dark:border-[#F5CD47]/20 dark:text-[#F5CD47]"
              >
                ⚠️ Azure subscription discovery requires backend API connectivity. Ensure the FastAPI backend is running.
              </div>
              <button disabled className="btn-primary w-full justify-center opacity-50">
                <Cloud className="w-4 h-4" />
                Connect & Discover Resources
              </button>
            </div>
          )}

          {method === 'sample' && (
            <div className="space-y-2">
              {SAMPLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSampleLoad(s.id)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-sm)] border text-left transition-colors hover:bg-[var(--color-surface-2)] group border-[var(--color-border)] bg-[var(--color-surface)]"
                >
                  <div
                    className="w-7 h-7 rounded-[3px] flex items-center justify-center shrink-0 bg-[var(--color-surface-2)] text-[var(--color-primary-light)]"
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">{s.label}</div>
                    <div className="text-[10.5px] text-[var(--color-text-muted)] font-mono">{s.resources} resources</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
