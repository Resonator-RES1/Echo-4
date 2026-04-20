import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CheckCircle2, 
  Info,
  PenTool,
  History,
  Trash2,
  Clock,
  Camera,
  Layers
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { RefinedVersion, SurgicalSnapshot } from '../../types';
import { SideBySideDiff } from '../editor/SideBySideDiff';
import { db, putSnapshot, deleteSnapshot } from '../../services/dbService';
import { RichTextEditor } from '../editor/RichTextEditor';
import { ShatterLens } from '../editor/ShatterLens';
import { useSwipe } from '../../hooks/useSwipe';
import { useDisplayStore } from '../../stores/useDisplayStore';
import { useManuscriptStore } from '../../stores/useManuscriptStore';
import { useUIStore } from '../../stores/useUIStore';
import { useEditorUIStore } from '../../stores/useEditorUIStore';

interface WorkbenchViewProps {
  currentDraft: string;
  activeReviewVersion: RefinedVersion | null;
  setActiveReviewVersion: (version: RefinedVersion | null) => void;
  dispatchDraft: any;
  draft: string;
  showToast: (message: string) => void;
  continuityIssues?: any[];
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = React.memo(({
  currentDraft,
  activeReviewVersion,
  setActiveReviewVersion,
  dispatchDraft,
  showToast
}) => {
  const { displayPrefs } = useDisplayStore();
  const { scenes, chapters, currentSceneId } = useManuscriptStore();
  const { workbenchDraft, setWorkbenchDraft } = useUIStore();

  const currentScene = useMemo(() => scenes.find(s => s.id === currentSceneId), [scenes, currentSceneId]);
  const currentChapter = useMemo(() => chapters.find(c => c.id === currentScene?.chapterId), [chapters, currentScene]);
  const currentChapterTitle = currentChapter?.title || 'Untitled Chapter';

  const [localDraft, setLocalDraft] = useState(currentDraft);
  const [isHighlightMode, setIsHighlightMode] = useState(true);
  const [lensMode, setLensMode] = useState<'base' | 'shatter'>('base');
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveFontSize = displayPrefs.dynamicFontScaling 
    ? Math.max(14, Math.min(24, Math.round(windowWidth / 60))) 
    : displayPrefs.fontSize;

  const isGraftingMode = !!activeReviewVersion;

  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      if (showSnapshots) setShowSnapshots(false);
    },
    onSwipedRight: () => {
      if (!showSnapshots) setShowSnapshots(true);
    }
  });

  // Live query for snapshots
  const snapshots = useLiveQuery(
    () => currentScene ? db.snapshots.where('sceneId').equals(currentScene.id).sortBy('timestamp') : [],
    [currentScene?.id]
  );

  useEffect(() => {
    setLocalDraft(currentDraft);
  }, [currentDraft]);

  // Auto-snapshot on enter Audit Mode
  useEffect(() => {
    if (!isGraftingMode && currentScene && localDraft && snapshots !== undefined) {
      const hasInitial = snapshots.some(s => s.label === 'Pre-Surgery');
      if (!hasInitial) {
        const snapshot: SurgicalSnapshot = {
          id: crypto.randomUUID(),
          sceneId: currentScene.id,
          text: localDraft,
          timestamp: new Date().toISOString(),
          label: 'Pre-Surgery'
        };
        putSnapshot(snapshot);
      }
    }
  }, [isGraftingMode, currentScene, localDraft, snapshots]);

  const handleTakeSnapshot = useCallback(async (label?: string) => {
    if (!currentScene) return;
    
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 1000);

    const snapshot: SurgicalSnapshot = {
      id: crypto.randomUUID(),
      sceneId: currentScene.id,
      text: localDraft,
      timestamp: new Date().toISOString(),
      label: label || `Manual Snapshot ${new Date().toLocaleTimeString()}`
    };

    await putSnapshot(snapshot);
    showToast('Snapshot captured');
  }, [currentScene, localDraft, showToast]);

  const handleRestoreSnapshot = useCallback((snapshot: SurgicalSnapshot) => {
    setLocalDraft(snapshot.text);
    dispatchDraft({ type: 'SET', payload: snapshot.text });
    showToast(`Restored to ${snapshot.label || 'snapshot'}`);
  }, [dispatchDraft, showToast]);

  const handleDeleteSnapshot = useCallback(async (id: string) => {
    await deleteSnapshot(id);
    showToast('Snapshot deleted');
  }, [showToast]);

  const handleCommitSurgery = () => {
    if (activeReviewVersion) {
      dispatchDraft({ type: 'SET', payload: localDraft });
      setActiveReviewVersion(null);
      if (setWorkbenchDraft) setWorkbenchDraft('');
    } else {
      dispatchDraft({ type: 'SET', payload: localDraft });
      if (setWorkbenchDraft) setWorkbenchDraft('');
      showToast('Manual surgery committed to Master');
    }
  };

  const critique = activeReviewVersion?.mirrorEditorCritique || activeReviewVersion?.analysis || "No critique provided.";

  return (
    <div 
      data-testid="workbench-view"
      className={`flex flex-col h-full w-full bg-surface-container-lowest overflow-hidden animate-in fade-in duration-500 ${isPulsing ? 'ring-4 ring-primary/20 ring-inset transition-all duration-1000' : ''}`}
      {...swipeHandlers}
    >
      
      {/* Top Navigation (The Instrument Cluster) */}
      <header className="flex-shrink-0 h-auto md:h-14 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-2 md:py-0 bg-surface-container-low/40 backdrop-blur-xl z-50 gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5 w-full md:w-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
               <h3 className="font-headline text-base md:text-lg font-bold tracking-tight">Master Manuscript</h3>
               <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${isGraftingMode ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                 {isGraftingMode ? 'Grafting Mode' : 'Manual Surgery'}
               </span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[9px] font-medium uppercase tracking-wider text-on-surface-variant/60">{currentChapterTitle}</p>
              {!isGraftingMode && (
                <button 
                  onClick={() => {
                    const { setActiveTab } = useEditorUIStore.getState();
                    if (setActiveTab) setActiveTab('archive');
                  }}
                  className="text-[9px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  <Layers className="w-3 h-3" />
                  Select Audit to Graft
                </button>
              )}
            </div>
          </div>
          
          {isGraftingMode && (
            <div className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-500">
              <div className="hidden md:block w-px h-6 bg-outline-variant/10" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline text-base md:text-lg font-bold tracking-tight text-primary">AI Refinement</h3>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-primary/40 cursor-help" />
                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-full mt-2 w-72 md:w-80 p-3 bg-surface-container-highest rounded-lg shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[100] backdrop-blur-xl">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-primary mb-1.5">Echo Strategy</p>
                      <p className="text-xs text-on-surface italic leading-relaxed">"{critique}"</p>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] font-medium uppercase tracking-wider text-primary/40">Donor Material</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-none pb-2 md:pb-0">
          <div className="flex items-center bg-transparent rounded-lg p-0.5 border border-white/5 min-w-max">
            
            <button 
              onClick={() => setShowSnapshots(!showSnapshots)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${showSnapshots ? 'bg-white/10 text-primary shadow-none' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Toggle Surgical Snapshots"
            >
              <History className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Snapshots</span>
            </button>

            {!isGraftingMode && (
              <>
                <button 
                  onClick={() => setLensMode(prev => prev === 'base' ? 'shatter' : 'base')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${lensMode === 'shatter' ? 'bg-primary/10 text-primary shadow-none' : 'text-on-surface-variant hover:text-on-surface'}`}
                  title="Toggle Shatter Lens"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Shatter</span>
                </button>
                <button 
                  onClick={() => handleTakeSnapshot()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-on-surface-variant hover:text-primary transition-all"
                  title="Take Manual Snapshot"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Capture</span>
                </button>
              </>
            )}

            {isGraftingMode && (
              <button 
                onClick={() => setIsHighlightMode(!isHighlightMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${isHighlightMode ? 'bg-accent-amber/10 text-accent-amber shadow-none' : 'text-on-surface-variant hover:text-on-surface'}`}
                title="Toggle Intelligence Highlights (The Pen)"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">The Pen</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Dual Panes (Grid Foundation) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col md:flex-row">
        {showSnapshots && (
          <div className="w-full md:w-60 h-48 md:h-auto border-b md:border-b-0 md:border-r border-white/5 bg-surface-container-low/40 backdrop-blur-xl flex flex-col animate-in slide-in-from-left duration-500 shrink-0">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h4 className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Timeline</h4>
              <History className="w-3 h-3 text-primary/40" />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {snapshots?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider">No Snapshots</p>
                </div>
              ) : (
                snapshots?.slice().reverse().map((snapshot) => (
                  <div 
                    key={snapshot.id}
                    className="group relative bg-surface-container-high/50 hover:bg-surface-container-highest rounded-lg p-3 border border-white/5 transition-all cursor-pointer"
                    onClick={() => handleRestoreSnapshot(snapshot)}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-medium text-on-surface-variant">{new Date(snapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSnapshot(snapshot.id);
                        }}
                        className="p-1 text-on-surface-variant hover:text-error transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-on-surface line-clamp-1 mb-0.5">{snapshot.label || 'Untitled Snapshot'}</p>
                    <p className="text-[9px] text-on-surface-variant/60 line-clamp-2 italic">"{snapshot.text.substring(0, 60)}..."</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden flex relative">
            {isGraftingMode ? (
              <SideBySideDiff 
                  original={localDraft}
                  polished={activeReviewVersion.text}
                  report={isHighlightMode ? activeReviewVersion : undefined}
                  onOriginalChange={setLocalDraft}
                  onPolishedChange={(newPolished) => {
                    setActiveReviewVersion({
                      ...activeReviewVersion,
                      text: newPolished
                    });
                  }}
              />
            ) : (
              <div className="h-full w-full p-5 lg:p-5 overflow-y-auto custom-scrollbar bg-transparent">
                <div className={`w-full mx-auto ${displayPrefs.maxWidth}`}>
                  {lensMode === 'shatter' ? (
                    <ShatterLens 
                      content={localDraft}
                      onChange={(newMarkdown) => {
                        setLocalDraft(newMarkdown);
                        if (setWorkbenchDraft) setWorkbenchDraft(newMarkdown);
                      }}
                      fontSize={effectiveFontSize}
                    />
                  ) : (
                    <RichTextEditor
                      content={localDraft}
                      onChange={(newMarkdown) => {
                        setLocalDraft(newMarkdown);
                        if (setWorkbenchDraft) setWorkbenchDraft(newMarkdown);
                      }}
                      fontSize={effectiveFontSize}
                      lineHeight={displayPrefs.lineHeight}
                      paragraphSpacing={displayPrefs.paragraphSpacing}
                      className="p-5 bg-surface-container-lowest rounded-xl border border-white/5 shadow-2xl"
                      placeholder="Begin your manual surgery here..."
                    />
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Final Commitment */}
      <footer className="flex-shrink-0 h-16 border-t border-white/5 flex items-center justify-center bg-surface-container-low/40 backdrop-blur-xl z-50 gap-4">
          {isGraftingMode && (
            <button
              onClick={() => {
                dispatchDraft({ type: 'SET', payload: activeReviewVersion.text });
                setActiveReviewVersion(null);
                if (setWorkbenchDraft) setWorkbenchDraft('');
                showToast('Polished surgery committed to Master');
              }}
              className="group relative flex items-center gap-3 px-6 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg font-bold uppercase tracking-wider text-[9px] hover:bg-primary/20 transition-all hover:border-primary/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Commit Polished</span>
            </button>
          )}
          <button
            onClick={handleCommitSurgery}
            className="group relative flex items-center gap-3 px-6 py-2 bg-transparent border border-white/10 text-on-surface rounded-lg font-bold uppercase tracking-wider text-[9px] hover:bg-white/5 transition-all hover:border-white/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>{isGraftingMode ? 'Commit Original' : 'Commit Surgery'}</span>
          </button>
      </footer>
    </div>
  );
});
