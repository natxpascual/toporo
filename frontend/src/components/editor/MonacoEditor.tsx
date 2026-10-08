import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  FileCode, RefreshCw, Copy, Download, Play, FileJson,
  Package, CheckCircle2, Loader2, Wand2, AlignLeft,
} from 'lucide-react';
import { useTopologyStore } from '../../store/useTopologyStore';

// ─── File tab config ───────────────────────────────────────────────────────

const FILE_TABS = [
  { id: 'main.tf',           label: 'main.tf',           icon: FileCode },
  { id: 'variables.tf',      label: 'variables.tf',      icon: FileCode },
  { id: 'outputs.tf',        label: 'outputs.tf',        icon: FileCode },
  { id: 'terraform.tfvars',  label: 'terraform.tfvars',  icon: FileJson },
] as const;

type FileTab = typeof FILE_TABS[number]['id'];

// ─── Monaco custom themes ───────────────────────────────────────────────────

const BRAINBOARD_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: '',           foreground: 'DEE4EA', background: '1D2125' },
    { token: 'comment',    foreground: '738496', fontStyle: 'italic' },
    { token: 'keyword',    foreground: '579DFF', fontStyle: 'bold' },
    { token: 'string',     foreground: '4BCE97' },
    { token: 'number',     foreground: 'F5CD47' },
    { token: 'type',       foreground: '6CC3E0' },
    { token: 'variable',   foreground: 'DEE4EA' },
    { token: 'identifier', foreground: '9F8FEF' },
    { token: 'delimiter',  foreground: '333C43' },
    { token: 'operator',   foreground: '9FADBC' },
  ],
  colors: {
    'editor.background':          '#1D2125',
    'editor.foreground':          '#DEE4EA',
    'editor.lineHighlightBackground': '#282E3355',
    'editor.selectionBackground': '#0C66E433',
    'editor.findMatchBackground': '#0C66E444',
    'editorCursor.foreground':    '#579DFF',
    'editorLineNumber.foreground':'#738496',
    'editorLineNumber.activeForeground': '#9FADBC',
    'editorGutter.background':    '#1D2125',
    'editorIndentGuide.background':'#333C43',
    'editorIndentGuide.activeBackground': '#454F59',
    'scrollbar.shadow':           '#00000000',
    'scrollbarSlider.background': '#333C4388',
    'scrollbarSlider.hoverBackground': '#454F5988',
    'scrollbarSlider.activeBackground':'#0C66E455',
    'minimap.background':         '#161A1D',
    'editorWidget.background':    '#22272B',
    'editorWidget.border':        '#333C43',
    'dropdown.background':        '#22272B',
    'dropdown.border':            '#333C43',
  },
};

const BRAINBOARD_LIGHT_THEME = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: '',           foreground: '172B4D', background: 'FFFFFF' },
    { token: 'comment',    foreground: '626F86', fontStyle: 'italic' },
    { token: 'keyword',    foreground: '0052CC', fontStyle: 'bold' },
    { token: 'string',     foreground: '1F845A' },
    { token: 'number',     foreground: '9E6C00' },
    { token: 'type',       foreground: '008DA6' },
    { token: 'variable',   foreground: '172B4D' },
    { token: 'identifier', foreground: '6E5DC6' },
    { token: 'delimiter',  foreground: 'DFE1E6' },
    { token: 'operator',   foreground: '44546F' },
  ],
  colors: {
    'editor.background':          '#FFFFFF',
    'editor.foreground':          '#172B4D',
    'editor.lineHighlightBackground': '#F1F2F4',
    'editor.selectionBackground': '#0C66E425',
    'editor.findMatchBackground': '#0C66E435',
    'editorCursor.foreground':    '#0C66E4',
    'editorLineNumber.foreground':'#8C9BAB',
    'editorLineNumber.activeForeground': '#44546F',
    'editorGutter.background':    '#F7F8F9',
    'editorIndentGuide.background':'#DFE1E6',
    'editorIndentGuide.activeBackground': '#C1C7D0',
    'scrollbar.shadow':           '#00000000',
    'scrollbarSlider.background': '#DFE1E688',
    'scrollbarSlider.hoverBackground': '#C1C7D088',
    'scrollbarSlider.activeBackground':'#0C66E444',
    'minimap.background':         '#F7F8F9',
    'editorWidget.background':    '#FFFFFF',
    'editorWidget.border':        '#DFE1E6',
    'dropdown.background':        '#FFFFFF',
    'dropdown.border':            '#DFE1E6',
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
  const [themeRegistered, setThemeRegistered] = useState(false);
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);
  const decorationsRef = React.useRef<string[]>([]);

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

    // Register Brainboard custom dark & light themes
    monaco.editor.defineTheme('brainboard-dark', BRAINBOARD_THEME);
    monaco.editor.defineTheme('brainboard-light', BRAINBOARD_LIGHT_THEME);
    const activeTheme = themeMode === 'light' ? 'brainboard-light' : 'brainboard-dark';
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
      const activeTheme = themeMode === 'light' ? 'brainboard-light' : 'brainboard-dark';
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
    // zip download will be dispatched to backend
    const allFiles = Object.entries(generatedCode ?? {});
    if (allFiles.length === 0) return;
    // For now, download main.tf only — backend zip endpoint can be hooked later
    handleDownload();
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
      {/* ── File tabs ── */}
      <div
        className="flex items-center overflow-x-auto shrink-0"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', height: 36 }}
      >
        {FILE_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCodeFile?.(id)}
            className={`editor-tab shrink-0 ${activeFile === id ? 'active' : ''}`}
          >
            <Icon className="w-3 h-3 shrink-0" />
            {label}
            {generatedCode?.[id] && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: activeFile === id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              />
            )}
          </button>
        ))}

        {/* Toolbar actions — right-aligned */}
        <div className="ml-auto flex items-center gap-0.5 px-2 shrink-0">
          {isSyncing && (
            <div className="flex items-center gap-1.5 text-[10px] px-2 font-mono" style={{ color: 'var(--color-primary-light)' }}>
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing…
            </div>
          )}

          {/* Format */}
          <button
            className="toolbar-btn"
            title="Format HCL (Alt+F)"
            onClick={() => {}}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          {/* Refresh from canvas */}
          <button
            className="toolbar-btn"
            title="Refresh from canvas state"
            onClick={() => refreshCodeAndAnalysis?.()}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Copy */}
          <button
            className={`toolbar-btn ${copied ? 'active' : ''}`}
            title="Copy to clipboard"
            onClick={handleCopy}
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download file */}
          <button
            className="toolbar-btn"
            title={`Download ${activeFile}`}
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Download zip */}
          <button
            className="toolbar-btn"
            title="Download all files as .zip"
            onClick={handleDownloadZip}
          >
            <Package className="w-3.5 h-3.5" />
          </button>

          {/* Divider */}
          <div className="toolbar-divider" />

          {/* Apply code changes to canvas */}
          {activeFile === 'main.tf' && (
            <button
              onClick={handleApply}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 h-6 rounded-[3px] text-[11px] font-semibold text-white transition-colors disabled:opacity-50"
              style={{
                background: 'var(--color-primary)',
              }}
              title="Apply HCL changes to canvas (⌘S)"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              Apply
            </button>
          )}
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language="hcl"
          theme={themeRegistered ? (themeMode === 'light' ? 'brainboard-light' : 'brainboard-dark') : (themeMode === 'light' ? 'vs' : 'vs-dark')}
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

      {/* ── Status bar ── */}
      <div
        className="flex items-center justify-between px-3 h-[22px] shrink-0 text-[10.5px] font-mono select-none"
        style={{
          background:   'var(--color-surface)',
          borderTop:    '1px solid var(--color-border)',
          color:        'var(--color-text-muted)',
        }}
      >
        <div className="flex items-center gap-3">
          <span>Terraform HCL</span>
          <span>{lineCount} lines</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};
