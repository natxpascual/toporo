import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Header } from '../header/Header';
import { ResourceCatalog } from '../sidebar/ResourceCatalog';
import { Canvas } from '../canvas/Canvas';
import { CanvasToolbar } from '../canvas/CanvasToolbar';
import { MonacoEditor } from '../editor/MonacoEditor';
import { PropertyInspector } from '../inspector/PropertyInspector';
import { CopilotModal } from '../copilot/CopilotModal';
import { ImportModal } from '../import/ImportModal';
import { SubscriptionModals } from '../modals/SubscriptionModals';
import { useTopologyStore } from '../../store/useTopologyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { GripVertical } from 'lucide-react';

export interface TopologyStudioProps {
  onNavigate?: (route: string) => void;
}

export const TopologyStudio: React.FC<TopologyStudioProps> = ({ onNavigate }) => {
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [codeDrawerWidth, setCodeDrawerWidth] = useState<number>(() => {
    const saved = localStorage.getItem('azure_code_drawer_width');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 260 && parsed <= 1400) return parsed;
    }
    return Math.max(340, Math.min(600, Math.round(window.innerWidth * 0.38)));
  });
  const [isDraggingDrawer, setIsDraggingDrawer] = useState(false);
  const [subscriptionModalMode, setSubscriptionModalMode] = useState<'trial-offer' | 'upgrade-nudge' | null>(null);
  const trialPromptedThisMountRef = useRef(false);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const isProUser = user?.effectivePlan === 'pro';

  const {
    refreshCodeAndAnalysis,
    toggleCopilot,
    toggleInspector,
    toggleMiniMap,
  } = useTopologyStore() as any;

  // Refresh live trial/subscription status when entering Studio
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Offer 7-day Pro Trial once per Studio launch if user is Free and hasn't availed trial yet
  useEffect(() => {
    if (!user) return;
    if (user.shouldPromptTrial && !trialPromptedThisMountRef.current) {
      trialPromptedThisMountRef.current = true;
      setSubscriptionModalMode('trial-offer');
    }
  }, [user]);

  // Recurring 30-minute upgrade prompt for Free-tier users who already used their 7-day trial
  useEffect(() => {
    if (!user || !user.shouldNudgeUpgrade30m) return;
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;
    const intervalId = setInterval(() => {
      setSubscriptionModalMode('upgrade-nudge');
    }, THIRTY_MINUTES_MS);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    refreshCodeAndAnalysis?.();
  }, [refreshCodeAndAnalysis]);

  useEffect(() => {
    localStorage.setItem('azure_code_drawer_width', String(codeDrawerWidth));
  }, [codeDrawerWidth]);

  const handleStartResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingDrawer(true);
    const startX = e.clientX;
    const startW = editorContainerRef.current
      ? editorContainerRef.current.getBoundingClientRect().width
      : codeDrawerWidth;

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const deltaX = startX - moveEvent.clientX;
      const minW = 280;
      const maxW = Math.max(minW, window.innerWidth - 320);
      const newW = Math.max(minW, Math.min(maxW, startW + deltaX));
      setCodeDrawerWidth(newW);
    };

    const onPointerUp = () => {
      setIsDraggingDrawer(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [codeDrawerWidth]);

  const handleResetDrawerWidth = useCallback(() => {
    const defaultW = Math.max(340, Math.min(600, Math.round(window.innerWidth * 0.38)));
    setCodeDrawerWidth(defaultW);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isInput =
      ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) ||
      (e.target as HTMLElement)?.isContentEditable;
    if (isInput) return;

    const ctrl = e.metaKey || e.ctrlKey;

    if (ctrl && e.key === '/') {
      e.preventDefault();
      if (isProUser) {
        toggleCopilot?.(true);
      }
    }
    if (ctrl && e.key === '\\') {
      e.preventDefault();
      setIsSplitView((p) => !p);
    }
    if ((e.key === 'i' || e.key === 'I') && !e.shiftKey && !e.altKey && !ctrl) {
      e.preventDefault();
      toggleInspector?.();
    }
    if ((e.key === 'm' || e.key === 'M') && !e.shiftKey && !e.altKey && !ctrl) {
      e.preventDefault();
      toggleMiniMap?.();
    }
  }, [toggleCopilot, toggleInspector, toggleMiniMap, isProUser]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Fix: Do NOT close the Properties Panel when enabling or toggling the Code Editor panel
  const handleToggleSplitView = useCallback(() => {
    setIsSplitView((p) => !p);
  }, []);

  return (
    <ReactFlowProvider>
      <div
        className={`flex flex-col h-screen w-screen overflow-hidden ${isDraggingDrawer ? 'select-none' : ''}`}
        style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
      >
        <Header
          isSplitView={isSplitView}
          toggleSplitView={handleToggleSplitView}
          onNavigate={onNavigate}
        />

        {/* Draw.io-inspired Toolbox docked directly below the Menu Header */}
        <CanvasToolbar />

        <div className="flex-1 flex overflow-hidden relative min-h-0">
          <ResourceCatalog />

          {/* Center Column: Canvas on top, Properties Panel on bottom (spans to the left edge of the Code Editor when visible) */}
          <div
            className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative"
            style={{ background: 'var(--color-bg)' }}
          >
            <main className="flex-1 min-h-0 w-full relative overflow-hidden">
              <Canvas />
            </main>

            <PropertyInspector />
          </div>

          {/* Right Column: Code Editor Window (spans full height of workspace area) */}
          {isSplitView && (
            <>
              <div
                className={`drawer-resizer ${isDraggingDrawer ? 'resizing' : ''}`}
                onPointerDown={handleStartResize}
                onDoubleClick={handleResetDrawerWidth}
                title="Drag to resize code drawer horizontally (Double-click to reset)"
              >
                <div className="drawer-resizer-handle">
                  <GripVertical className="w-2.5 h-2.5 text-[var(--color-text-muted)]" />
                </div>
              </div>

              <div
                ref={editorContainerRef}
                data-testid="code-editor-window"
                className="h-full shrink-0 relative"
                style={{ width: `${codeDrawerWidth}px`, minWidth: 280, maxWidth: 'calc(100vw - 320px)' }}
              >
                <MonacoEditor />
              </div>
            </>
          )}
        </div>

        <CopilotModal />
        <ImportModal />
        <SubscriptionModals
          mode={subscriptionModalMode}
          onClose={() => setSubscriptionModalMode(null)}
        />
      </div>
    </ReactFlowProvider>
  );
};
