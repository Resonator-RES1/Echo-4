import React from 'react';
import { motion } from 'motion/react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { WorkspaceTab } from '../../types';

interface EditorFlowRailProps {
  isZenMode: boolean;
  setIsZenMode: (zen: boolean) => void;
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  saveStatus: 'saved' | 'saving';
  isIndexing: boolean;
  isScanning: boolean;
}

export const EditorFlowRail: React.FC<EditorFlowRailProps> = React.memo(({
  isZenMode,
  setIsZenMode,
  activeTab,
  setActiveTab,
  saveStatus,
  isIndexing,
  isScanning
}) => {
  if (isZenMode) return null;

  const stages = [
    { id: 'draft', label: 'Workspace' },
    { id: 'workbench', label: 'Workbench' },
    { id: 'context', label: 'Context' },
    { id: 'refine', label: 'Audit' },
    { id: 'report', label: 'Audit Log' },
    { id: 'archive', label: 'Ledger' },
  ];

  const activeIndex = stages.findIndex(s => s.id === activeTab);
  const isLastStage = activeIndex === stages.length - 1;

  return (
    <div className="flex-shrink-0 h-9 border-t border-white/5 bg-surface-container-lowest/50 flex items-center px-4 gap-4 overflow-x-auto scrollbar-none z-40 relative">
      <div className="flex items-center gap-2 shrink-0 min-w-[120px]">
        <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-accent-emerald' : 'bg-accent-amber animate-pulse'}`} />
        <span className="text-[9px] font-medium uppercase tracking-wider text-on-surface-variant hidden sm:inline">
          {saveStatus === 'saving' ? 'Syncing...' : 'Mirror Active'}
        </span>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className="flex items-center gap-8 min-w-max relative px-6">
          {/* Flow Rail Progress Bar - Background */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 rounded-full" />
          
          {/* Flow Rail Progress Bar - Active */}
          <motion.div 
            className={`absolute top-1/2 left-0 h-[2px] -translate-y-1/2 transition-all duration-700 ease-out rounded-full ${
              isLastStage 
                ? 'bg-gradient-to-r from-primary/40 via-primary to-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)]' 
                : 'bg-gradient-to-r from-primary/20 to-primary/60'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
          >
            {/* Tip Glow */}
            <motion.div 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary/20 rounded-full blur-md"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {stages.map((stage, idx) => (
            <button 
              key={stage.id}
              onClick={() => setActiveTab(stage.id as WorkspaceTab)}
              className={`text-[9px] font-medium tracking-wide transition-all whitespace-nowrap py-2 relative z-10 flex flex-col items-center gap-1.5 group ${stage.id === activeTab ? 'text-primary' : 'text-on-surface-variant/60 hover:text-on-surface'}`}
            >
              <div className={`w-2 h-2 rounded-full transition-all duration-500 border border-white/5 flex items-center justify-center ${
                idx <= activeIndex 
                  ? 'bg-surface border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]' 
                  : 'bg-surface-container-highest border-white/5'
              }`}>
                <div className={`w-1 h-1 rounded-full transition-all duration-500 ${
                  idx <= activeIndex ? 'bg-primary scale-110' : 'bg-white/10'
                }`} />
              </div>
              <span className={`transition-all duration-300 ${stage.id === activeTab ? 'font-bold scale-105' : 'font-medium opacity-70 group-hover:opacity-100'}`}>
                {stage.label}
              </span>
              {stage.id === activeTab && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-primary-glow"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 min-w-[120px] justify-end">
        {(isIndexing || isScanning) && (
          <div className="flex items-center gap-2 animate-in fade-in duration-500">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-medium uppercase tracking-wider text-primary hidden sm:inline">
              {isIndexing ? 'Indexing' : 'Auditing'}
            </span>
          </div>
        )}
        <button 
          onClick={() => setIsZenMode(!isZenMode)}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded hover:bg-surface-container-highest"
        >
          {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="text-[9px] font-medium uppercase tracking-wider hidden sm:inline">Zen</span>
        </button>
      </div>
    </div>
  );
});
