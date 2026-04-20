import React from 'react';
import { FileText, BookOpen, Wand2, History, BarChart3, ShieldCheck, PenTool, Scissors, Sun } from 'lucide-react';
import { WorkspaceTab, ContinuityIssue } from '../../types';

interface ProcessRailProps {
  isZenMode: boolean;
  setIsZenMode: (isZenMode: boolean) => void;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  showContinuityGuard: boolean;
  setShowContinuityGuard: (show: boolean) => void;
  continuityIssues: ContinuityIssue[];
  editorMode: 'polishing' | 'drafting';
  setEditorMode: (mode: 'polishing' | 'drafting') => void;
  setShowDiff: (show: boolean) => void;
  setShowRecentChanges: (show: boolean) => void;
  dispatchDraft: any;
  draftState: any;
  selection: { text: string; start: number; end: number } | null;
  surgicalSelection: { text: string; start: number; end: number } | null;
  setSurgicalSelection: (sel: { text: string; start: number; end: number } | null) => void;
}

const ProcessRailComponent: React.FC<ProcessRailProps> = ({
  isZenMode,
  setIsZenMode,
  activeTab,
  setActiveTab,
  showContinuityGuard,
  setShowContinuityGuard,
  continuityIssues,
  editorMode,
  setEditorMode,
  setShowDiff,
  setShowRecentChanges,
  dispatchDraft,
  draftState,
  selection,
  surgicalSelection,
  setSurgicalSelection
}) => {
  if (isZenMode) return null;

  return (
    <aside className="w-16 sm:w-20 flex flex-col items-center py-6 justify-between bg-surface-container-low/95 backdrop-blur-xl border-l border-outline-variant/10 z-30">
      <div className="flex flex-col gap-3">
        {[
          { id: 'draft', label: 'Draft', icon: FileText, step: '01' },
          { id: 'context', label: 'Context', icon: BookOpen, step: '02' },
          { id: 'refine', label: 'Audit', icon: Wand2, step: '03' },
          { id: 'report', label: 'Audit Log', icon: BarChart3, step: '04' },
          { id: 'workbench', label: 'Workbench', icon: Scissors, step: '05' },
          { id: 'archive', label: 'The Ledger', icon: History, step: '06' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkspaceTab)}
              className="relative flex flex-col items-center group transition-all duration-300"
              title={tab.label}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-500 border ${
                isActive 
                  ? 'bg-primary border-primary text-on-primary-fixed shadow-[0_0_20px_rgba(208,192,255,0.3)]' 
                  : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
              }`}>
                <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'animate-pulse' : ''}`} />
              </div>
              <span className={`mt-1.5 text-[8px] sm:text-[9px] font-label font-bold uppercase tracking-widest transition-all duration-300 ${
                isActive ? 'text-primary' : 'text-on-surface-variant/40 group-hover:text-primary/60'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full shadow-[0_0_10px_rgba(208,192,255,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 pb-4">
        {/* Continuity Guard */}
        <button 
          onClick={() => setShowContinuityGuard(!showContinuityGuard)}
          className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg transition-all relative ${
            showContinuityGuard 
              ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' 
              : continuityIssues.length > 0 
                  ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 ring-1 ring-amber-500/50' 
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'
          }`}
          title="Continuity Guard"
        >
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          {continuityIssues.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-on-amber text-[8px] font-black">
              {continuityIssues.length}
            </span>
          )}
        </button>

        <div className="h-px w-8 bg-outline-variant/20 mx-auto" />

        {/* Mode Buttons */}
        <button 
          onClick={() => {
            setActiveTab('draft');
            setEditorMode('drafting');
            setShowDiff(false);
          }}
          className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all ${editorMode === 'drafting' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
          title="Drafting Mode"
        >
          <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button 
          onClick={() => {
            dispatchDraft({ type: 'SET_ORIGINAL', payload: draftState.present });
            setEditorMode('polishing');
            setShowRecentChanges(false);
            setSurgicalSelection(selection);
            if (selection) {
              setShowDiff(true);
            }
          }}
          className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all ${editorMode === 'polishing' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
          title="Manual Revision"
        >
          <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button 
          onClick={() => setIsZenMode(!isZenMode)}
          className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary`}
          title="Zen Mode"
        >
          <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </aside>
  );
};

export const ProcessRail = React.memo(ProcessRailComponent);
