import React, { useState, useEffect, useRef } from 'react';
import { X, FileBox, Download, Check } from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';
import { exportProjectFile } from '../../utils/exportUtils';

interface ExportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportProjectModal: React.FC<ExportProjectModalProps> = ({ isOpen, onClose }) => {
  const { topology, renameProject, markSaved } = useTopologyStore();
  const currentProjectName = topology?.metadata?.project_name || 'Untitled Project';
  const [projectName, setProjectName] = useState(currentProjectName);
  const [isExported, setIsExported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setProjectName(topology?.metadata?.project_name || 'Untitled Project');
      setIsExported(false);
      setTimeout(() => inputRef.current?.select(), 80);
    }
  }, [isOpen, topology?.metadata?.project_name]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = projectName.trim() || 'Untitled Project';
    renameProject(finalName);
    exportProjectFile(topology, finalName);
    markSaved(true);
    setIsExported(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="export-project-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-xl overflow-hidden bg-[var(--color-surface)] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] flex items-center justify-center border border-[var(--color-primary)]/30">
              <FileBox className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-[var(--color-text-primary)]">
                Export Project File
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Save full architecture topology in native .ats format
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
              Project Name
            </label>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Untitled Project"
                className="input-dark pr-14 text-[13px] font-semibold"
                autoFocus
              />
              <span className="absolute right-2 px-1.5 py-0.5 rounded-[3px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text-muted)] uppercase pointer-events-none">
                .ats
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
              This file preserves all resources, properties, container hierarchies, and security telemetry for later re-import.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-[12px] h-8 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-[12px] h-8 px-3 font-semibold"
            >
              {isExported ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Save & Export .ats
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

