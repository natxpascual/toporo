import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  FileCode, RefreshCw, Copy, Download, Play, FileJson,
  Package, CheckCircle2, Loader2, Wand2, AlignLeft,
  MoreHorizontal,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';
import { exportProjectZip } from '../../utils/exportUtils';

// ─── File tab config ───────────────────────────────────────────────────────

const FILE_TABS = [
  { id: 'main.tf',           label: 'main.tf',           icon: FileCode },
  { id: 'variables.tf',      label: 'variables.tf',      icon: FileCode },
  { id: 'outputs.tf',        label: 'outputs.tf',        icon: FileCode },
  { id: 'terraform.tfvars',  label: 'terraform.tfvars',  icon: FileJson },
] as const;

type FileTab = typeof FILE_TABS[number]['id'];

// ─── Monaco custom themes ───────────────────────────────────────────────────

const STUDIO_DARK_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: '',           foreground: 'F5F5F4', background: '121613' },
    { token: 'comment',    foreground: 'A8A29E', fontStyle: 'italic' },
    { token: 'keyword',    foreground: 'A7E68F', fontStyle: 'bold' },
    { token: 'string',     foreground: '4BCE97' },
    { token: 'number',     foreground: 'F5CD47' },
    { token: 'type',       foreground: '4FD1C5' },
    { token: 'variable',   foreground: 'F5F5F4' },
    { token: 'identifier', foreground: 'C4B4FF' },
    { token: 'delimiter',  foreground: '3F4D42' },
    { token: 'operator',   foreground: 'D6D3D1' },
  ],
  colors: {
    'editor.background':          '#121613',
    'editor.foreground':          '#F5F5F4',
    'editor.lineHighlightBackground': '#1F262077',
    'editor.selectionBackground': '#A7E68F2E',
    'editor.findMatchBackground': '#A7E68F40',
    'editorCursor.foreground':    '#A7E68F',
    'editorLineNumber.foreground':'#78716C',
    'editorLineNumber.activeForeground': '#D6D3D1',
    'editorGutter.background':    '#121613',
    'editorIndentGuide.background':'#2E3830',
    'editorIndentGuide.activeBackground': '#3F4D42',
    'scrollbar.shadow':           '#00000000',
    'scrollbarSlider.background': '#2E383088',
    'scrollbarSlider.hoverBackground': '#3F4D4288',
    'scrollbarSlider.activeBackground':'#A7E68F55',
    'minimap.background':         '#0E120F',
    'editorWidget.background':    '#181D19',
    'editorWidget.border':        '#2E3830',
    'dropdown.background':        '#181D19',
    'dropdown.border':            '#2E3830',
  },
};

const STUDIO_LIGHT_THEME = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: '',           foreground: '1C1917', background: 'F5F5F4' },
    { token: 'comment',    foreground: '6E6863', fontStyle: 'italic' },
    { token: 'keyword',    foreground: '145E33', fontStyle: 'bold' },
    { token: 'string',     foreground: '1B8A4B' },
    { token: 'number',     foreground: '9E6C00' },
    { token: 'type',       foreground: '0E7490' },
    { token: 'variable',   foreground: '1C1917' },
    { token: 'identifier', foreground: '6E5DC6' },
    { token: 'delimiter',  foreground: 'D6D3D1' },
    { token: 'operator',   foreground: '57534E' },
  ],
  colors: {
    'editor.background':          '#F5F5F4',
    'editor.foreground':          '#1C1917',
    'editor.lineHighlightBackground': '#EBE9E7',
    'editor.selectionBackground': '#1B7A4324',
    'editor.findMatchBackground': '#1B7A4336',
    'editorCursor.foreground':    '#1B7A43',
    'editorLineNumber.foreground':'#78716C',
    'editorLineNumber.activeForeground': '#57534E',
    'editorGutter.background':    '#EBE9E7',
    'editorIndentGuide.background':'#D6D3D1',
    'editorIndentGuide.activeBackground': '#A8A29E',
    'scrollbar.shadow':           '#00000000',
    'scrollbarSlider.background': '#D6D3D188',
    'scrollbarSlider.hoverBackground': '#A8A29E88',
    'scrollbarSlider.activeBackground':'#1B7A4344',
    'minimap.background':         '#EBE9E7',
    'editorWidget.background':    '#F5F5F4',
    'editorWidget.border':        '#D6D3D1',
    'dropdown.background':        '#F5F5F4',
    'dropdown.border':            '#D6D3D1',
  },
};

import { AzureResourceIR } from '../../services/api';

/**
 * Match a Terraform HCL line position to the enclosing resource block.
 */
function findResourceAtLine(
  hcl: string,
  lineNumber: number,
  resources: AzureResourceIR[]
): string | null {
  if (!hcl || !resources || resources.length === 0) return null;

  const lines = hcl.split('\n');
  const totalLines = lines.length;
  if (lineNumber < 1 || lineNumber > totalLines) return null;

  const blockRegex = /^\s*resource\s+"([^"]+)"\s+"([^"]+)"/i;
  const outputRegex = /^\s*output\s+"([^"]+)"/i;

  let currentBlock: {
    resourceType: string;
    hclName: string;
    startLine: number;
    endLine: number;
  } | null = null;

  let depth = 0;

  for (let i = 0; i < totalLines; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    const match = line.match(blockRegex);
    if (match && depth === 0) {
      currentBlock = {
        resourceType: match[1],
        hclName: match[2],
        startLine: lineNum,
        endLine: totalLines,
      };
    }

    // Update brace depth
    for (const char of line) {
      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0 && currentBlock) {
          currentBlock.endLine = lineNum;
          if (lineNumber >= currentBlock.startLine && lineNumber <= currentBlock.endLine) {
            return matchResource(currentBlock.resourceType, currentBlock.hclName, resources);
          }
          currentBlock = null;
        }
      }
    }

    if (currentBlock && depth > 0 && lineNumber >= currentBlock.startLine && lineNum >= lineNumber) {
      return matchResource(currentBlock.resourceType, currentBlock.hclName, resources);
    }
  }

  // Also match outputs in outputs.tf
  for (let i = 0; i < totalLines; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const outMatch = line.match(outputRegex);
    if (outMatch) {
      const outName = outMatch[1];
      if (Math.abs(lineNumber - lineNum) <= 4) {
        for (const res of resources) {
          const cleanName = res.name.replace(/[^a-zA-Z0-9_]/g, '_');
          const cleanId = res.id.replace(/[^a-zA-Z0-9_]/g, '_');
          if (outName.startsWith(cleanName) || outName.startsWith(cleanId)) {
            return res.id;
          }
        }
      }
    }
  }

  return null;
}

function matchResource(resourceType: string, hclName: string, resources: AzureResourceIR[]): string | null {
  const normHcl = hclName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // If this is an azurerm_network_interface (e.g. vm_web_frontend_nic), target the parent VM
  let searchName = normHcl;
  if (resourceType === 'azurerm_network_interface' && searchName.endsWith('_nic')) {
    searchName = searchName.slice(0, -4);
  }

  // Direct ID match
  const byId = resources.find((r) => r.id.toLowerCase().replace(/[^a-z0-9_]/g, '_') === searchName);
  if (byId) return byId.id;

  // Direct Name match
  const byName = resources.find((r) => r.name.toLowerCase().replace(/[^a-z0-9_]/g, '_') === searchName);
  if (byName) return byName.id;

  // Substring or sanitized match
  const byPartial = resources.find((r) => {
    const rId = r.id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const rName = r.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return searchName.includes(rId) || searchName.includes(rName) || rId.includes(searchName) || rName.includes(searchName);
  });
  if (byPartial) return byPartial.id;

  // Match by resource type if only one exists of that type
  const sameType = resources.filter((r) => r.type === resourceType);
  if (sameType.length === 1) return sameType[0].id;

  return null;
}

/**
 * Locate the line range [startLine, endLine] of a resource's code block in Terraform HCL.
 */
export function findResourceCodeRange(
  hcl: string,
  resource: AzureResourceIR
): { startLine: number; endLine: number } | null {
  if (!hcl || !resource) return null;

  const lines = hcl.split('\n');
  const totalLines = lines.length;
  if (totalLines === 0) return null;

  const blockRegex = /^\s*resource\s+"([^"]+)"\s+"([^"]+)"/i;
  const outputRegex = /^\s*output\s+"([^"]+)"/i;

  const normId = resource.id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const normName = resource.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  type Candidate = {
    resourceType: string;
    hclName: string;
    startLine: number;
    endLine: number;
    score: number;
  };

  const candidates: Candidate[] = [];
  let currentBlock: {
    resourceType: string;
    hclName: string;
    startLine: number;
  } | null = null;
  let depth = 0;

  for (let i = 0; i < totalLines; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    const match = line.match(blockRegex);
    if (match && depth === 0) {
      currentBlock = {
        resourceType: match[1],
        hclName: match[2],
        startLine: lineNum,
      };
    }

    for (const char of line) {
      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0 && currentBlock) {
          const endLine = lineNum;
          const hclNorm = currentBlock.hclName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          let score = 0;

          // Check type match
          const typeMatches = currentBlock.resourceType === resource.type;
          // Check associated nic type if resource is VM
          const isAssociatedNic =
            resource.type.includes('virtual_machine') &&
            currentBlock.resourceType === 'azurerm_network_interface';

          if (typeMatches || isAssociatedNic) {
            if (hclNorm === normName) {
              score = 100;
            } else if (hclNorm === normId) {
              score = 95;
            } else if (hclNorm.startsWith(normName) || normName.startsWith(hclNorm)) {
              score = 85;
            } else if (hclNorm.startsWith(normId) || normId.startsWith(hclNorm)) {
              score = 80;
            } else {
              // Check block text for explicit resource name
              const blockContent = lines.slice(currentBlock.startLine - 1, endLine).join('\n');
              if (blockContent.includes(`"${resource.name}"`)) {
                score = 90;
              } else if (typeMatches) {
                score = 50;
              }
            }
          }

          if (score > 0) {
            candidates.push({
              resourceType: currentBlock.resourceType,
              hclName: currentBlock.hclName,
              startLine: currentBlock.startLine,
              endLine,
              score,
            });
          }

          currentBlock = null;
        }
      }
    }
  }

  // Also check outputs in outputs.tf
  for (let i = 0; i < totalLines; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const outMatch = line.match(outputRegex);
    if (outMatch) {
      const outName = outMatch[1].toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (outName.includes(normName) || outName.includes(normId)) {
        let endLine = lineNum;
        let d = 0;
        for (let j = i; j < totalLines; j++) {
          for (const char of lines[j]) {
            if (char === '{') d++;
            else if (char === '}') {
              d--;
              if (d === 0) {
                endLine = j + 1;
                break;
              }
            }
          }
          if (d === 0 && endLine > lineNum) break;
        }
        candidates.push({
          resourceType: 'output',
          hclName: outMatch[1],
          startLine: lineNum,
          endLine,
          score: 70,
        });
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return { startLine: candidates[0].startLine, endLine: candidates[0].endLine };
}

// ─── MonacoEditor Component ────────────────────────────────────────────────

export const MonacoEditor: React.FC = () => {
  const {
    topology,
    selectedResourceId,
    generatedCode,
    activeCodeFile,
    setActiveCodeFile,
    syncFromHcl,
    isSyncing,
    refreshCodeAndAnalysis,
    setHoveredResource,
    themeMode,
  } = useTopologyStore();

  const [currentCode, setCurrentCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [themeRegistered, setThemeRegistered] = useState(false);
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);
  const decorationsRef = React.useRef<string[]>([]);
  const moreMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [isMoreOpen]);

  const activeFile: FileTab = (activeCodeFile as FileTab) || 'main.tf';

  useEffect(() => {
    setCurrentCode(generatedCode?.[activeFile] || '');
  }, [generatedCode, activeFile]);

  const handleCursorPositionChange = useCallback((lineNumber: number, code: string) => {
    const matchedId = findResourceAtLine(code, lineNumber, topology.resources);
    setHoveredResource(matchedId);
  }, [topology.resources, setHoveredResource]);

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register custom dark & light themes
    monaco.editor.defineTheme('studio-dark', STUDIO_DARK_THEME);
    monaco.editor.defineTheme('studio-light', STUDIO_LIGHT_THEME);
    const activeTheme = themeMode === 'light' ? 'studio-light' : 'studio-dark';
    monaco.editor.setTheme(activeTheme);
    setThemeRegistered(true);

    // Track cursor position changes to highlight canvas resource
    editor.onDidChangeCursorPosition((e: any) => {
      if (e?.position?.lineNumber) {
        handleCursorPositionChange(e.position.lineNumber, editor.getValue());
      }
    });

    // Custom keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile === 'main.tf') syncFromHcl?.(editor.getValue());
    });
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  }, [activeFile, syncFromHcl, handleCursorPositionChange, themeMode]);

  // Synchronize Monaco theme when global themeMode changes
  useEffect(() => {
    if (monacoRef.current && themeRegistered) {
      const activeTheme = themeMode === 'light' ? 'studio-light' : 'studio-dark';
      monacoRef.current.editor.setTheme(activeTheme);
    }
  }, [themeMode, themeRegistered]);

  // Re-check cursor on code or topology update
  useEffect(() => {
    if (editorRef.current) {
      const pos = editorRef.current.getPosition();
      if (pos?.lineNumber) {
        handleCursorPositionChange(pos.lineNumber, editorRef.current.getValue());
      }
    }
  }, [topology.resources, handleCursorPositionChange]);

  // Highlight code block corresponding to clicked / selected canvas resource
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    if (!selectedResourceId) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    const targetResource = topology.resources.find((r) => r.id === selectedResourceId);
    if (!targetResource) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    // Attempt to find range in current code file
    const range = findResourceCodeRange(currentCode, targetResource);

    // If not found in current file but we are on another tab (e.g. outputs.tf), and main.tf has code, switch to main.tf
    if (!range && activeFile !== 'main.tf' && generatedCode?.['main.tf']) {
      setActiveCodeFile?.('main.tf');
      return;
    }

    if (range) {
      // Smoothly scroll and center the highlighted block in the Monaco editor
      editor.revealLinesInCenter(range.startLine, range.endLine, monaco.editor.ScrollType.Smooth);

      const newDecorations = [
        {
          range: new monaco.Range(range.startLine, 1, range.endLine, 1),
          options: {
            isWholeLine: true,
            className: 'monaco-selected-block-highlight',
            linesDecorationsClassName: 'monaco-selected-line-decorator',
            glyphMarginClassName: 'monaco-selected-glyph-margin',
            overviewRuler: {
              color: '#714EFF',
              position: monaco.editor.OverviewRulerLane.Full,
            },
          },
        },
      ];

      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [selectedResourceId, currentCode, activeFile, topology.resources, generatedCode, setActiveCodeFile]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = () => {
    exportProjectZip(generatedCode, topology, topology?.metadata?.project_name || 'Untitled Project');
  };

  const handleApply = () => {
    if (activeFile === 'main.tf') {
      syncFromHcl?.(currentCode);
    }
  };

  const lineCount = currentCode.split('\n').length;

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: 'var(--color-bg)', borderLeft: '1px solid var(--color-border)' }}
    >
      {/* ── Top Bar Container (Tabs scroll horizontally, right buttons are pinned) ── */}
      <div
        className="flex items-center justify-between shrink-0 relative border-b border-[var(--color-border)] select-none"
        style={{ background: 'var(--color-surface)', height: 36 }}
      >
        {/* Left: Horizontally Scrollable File Tabs */}
        <div className="flex-1 flex items-center overflow-x-auto no-scrollbar min-w-0 h-full">
          {FILE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCodeFile?.(id)}
              className={`editor-tab shrink-0 ${activeFile === id ? 'active' : ''}`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span>{label}</span>
              {generatedCode?.[id] && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: activeFile === id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: Pinned Toolbar Actions (Format, Refresh, More, Apply) */}
        <div className="flex items-center gap-1 px-2 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] z-10 h-full">
          {isSyncing && (
            <div className="flex items-center gap-1 text-[10px] px-1 font-mono text-[var(--color-primary-light)]">
              <Loader2 className="w-3 h-3 animate-spin" />
            </div>
          )}

          {/* Format */}
          <button
            className="toolbar-btn"
            title="Format HCL (Alt+F)"
            onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          {/* Refresh */}
          <button
            className="toolbar-btn"
            title="Refresh from canvas state"
            onClick={() => refreshCodeAndAnalysis?.()}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* More Dropdown (Three Dots) placed after refresh */}
          <div ref={moreMenuRef} className="relative">
            <button
              onClick={() => setIsMoreOpen(p => !p)}
              className={`toolbar-btn ${isMoreOpen ? 'active' : ''}`}
              title="More Actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {isMoreOpen && (
              <div
                className="absolute top-full right-0 mt-1 w-48 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl z-50 py-1 animate-fade-in"
                onClick={() => setIsMoreOpen(false)}
              >
                {/* Copy to clipboard */}
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1F845A]" /> : <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>

                {/* Download main.tf (or current active file) */}
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Download {activeFile}</span>
                </button>

                {/* Download all files as .zip */}
                <button
                  onClick={handleDownloadZip}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <Package className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span>Download All Files (.zip)</span>
                </button>
              </div>
            )}
          </div>

          <div className="toolbar-divider" />

          {/* Blue Apply button pinned */}
          {activeFile === 'main.tf' && (
            <button
              onClick={handleApply}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 h-6 rounded-[3px] text-[11px] font-semibold text-white transition-colors disabled:opacity-50 shrink-0"
              style={{
                background: 'var(--color-primary)',
              }}
              title="Apply HCL changes to canvas (⌘S)"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Apply</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language="hcl"
          theme={themeRegistered ? (themeMode === 'light' ? 'studio-light' : 'studio-dark') : (themeMode === 'light' ? 'vs' : 'vs-dark')}
          value={currentCode}
          onChange={(val) => setCurrentCode(val || '')}
          onMount={handleEditorMount}
          options={{
            minimap:             { enabled: true, scale: 1, maxColumn: 80 },
            fontSize:            12,
            fontFamily:          "'SFMono-Medium', 'SF Mono', 'Segoe UI Mono', monospace",
            fontLigatures:       true,
            lineNumbers:         'on',
            scrollBeyondLastLine: false,
            automaticLayout:     true,
            tabSize:             2,
            insertSpaces:        true,
            padding:             { top: 10, bottom: 10 },
            renderLineHighlight: 'gutter',
            smoothScrolling:     true,
            cursorBlinking:      'phase',
            cursorSmoothCaretAnimation: 'on',
            roundedSelection:    true,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation:  true,
            },
          }}
        />
      </div>
    </div>
  );
};
