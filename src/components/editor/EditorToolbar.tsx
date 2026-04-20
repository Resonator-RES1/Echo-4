import React from 'react';
import { FileText, Database, Mic2, User, Settings, Home, Layout, Clock } from 'lucide-react';
import { WorkspaceTab, Chapter, Scene, WritingGoal } from '../../types';
import { motion } from 'motion/react';

interface EditorToolbarProps {
  isZenMode: boolean;
  activeTab: WorkspaceTab;
  activeHUD: 'sceneManager' | null;
  projectName: string;
  currentChapter: Chapter | undefined;
  scenes: Scene[];
  wordCount: number;
  progress: number;
  goal: WritingGoal;
  setActiveTab: (tab: WorkspaceTab) => void;
  setActiveHUD: (hud: 'sceneManager' | null) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = React.memo(({
  isZenMode,
  activeTab,
  activeHUD,
  projectName,
  currentChapter,
  scenes,
  wordCount,
  progress,
  goal,
  setActiveTab,
  setActiveHUD
}) => {
  if (isZenMode) return null;

  return (
    <>
      <header className="h-10 flex-shrink-0 bg-surface-container-low border-b border-white/5 flex items-center px-4 z-[100] relative overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-4 min-w-max flex-1 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded flex items-center justify-center shadow-primary-glow shrink-0">
              <span className="text-surface font-black text-[9px]">E</span>
            </div>
            <span className="font-headline text-xs font-bold tracking-tight text-on-surface text-glow hidden xl:inline">Echo Studio</span>
          </div>
          <div className="h-4 w-px bg-outline-variant/20 mx-2 hidden sm:block" />
        </div>

        <nav className="flex items-center justify-center gap-1 min-w-max flex-[2] pointer-events-auto relative z-20">
          {[
            { id: 'workspace', label: 'Workspace', icon: FileText, action: () => setActiveTab('draft'), active: activeTab === 'draft' },
            { id: 'manuscript', label: 'Construct', icon: Layout, action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'manuscript' })), active: false },
            { id: 'timeline', label: 'Timeline', icon: Clock, action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'timeline' })), active: false },
            { id: 'axioms', label: 'Axioms', icon: Database, action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'lore' })), active: false },
            { id: 'voices', label: 'Voice DNA', icon: Mic2, action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'voices' })), active: false },
            { id: 'suite', label: 'Persona', icon: User, action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'suite' })), active: false },
          ].map(item => (
            <button
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                item.action();
              }}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all relative cursor-pointer active:scale-95 ${item.active ? 'bg-primary/10 text-primary shadow-[inset_0_1px_10px_rgba(var(--primary-rgb),0.1)]' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[9px] font-medium tracking-wide hidden lg:inline">{item.label}</span>
              {item.active && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-t-full shadow-primary-glow"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 flex-1 shrink-0">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }))}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-container-highest"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'welcome' }))}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-container-highest"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="h-8 flex-shrink-0 bg-surface-container-lowest border-b border-white/5 hidden md:flex flex-nowrap whitespace-nowrap overflow-hidden items-center px-4 gap-4 z-40">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[9px] font-medium uppercase tracking-wider text-on-surface-variant/60">Project</span>
          <span className="text-[9px] font-semibold text-on-surface tracking-tight">{projectName}</span>
        </div>
        <div className="h-3 w-px bg-outline-variant/10" />
        <button onClick={() => setActiveHUD(activeHUD === 'sceneManager' ? null : 'sceneManager')} className="flex items-center gap-2 whitespace-nowrap hover:bg-surface-container-highest/50 px-2 py-1 rounded transition-colors">
          <span className="text-[9px] font-medium uppercase tracking-wider text-on-surface-variant/60">Chapter</span>
          <span className="text-[9px] font-semibold text-primary tracking-tight">{currentChapter?.title || 'Untitled'}</span>
        </button>
        <div className="h-3 w-px bg-outline-variant/10" />
        <button onClick={() => setActiveHUD(activeHUD === 'sceneManager' ? null : 'sceneManager')} className="flex items-center gap-2 whitespace-nowrap hover:bg-surface-container-highest/50 px-2 py-1 rounded transition-colors">
          <span className="text-[9px] font-medium uppercase tracking-wider text-on-surface-variant/60">Scenes</span>
          <span className="text-[9px] font-semibold text-on-surface tracking-tight">{scenes.length} <span className="text-on-surface-variant/40 font-normal">({scenes.filter(s => !s.chapterId).length} unassigned)</span></span>
        </button>
        <div className="h-3 w-px bg-outline-variant/10" />
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[9px] font-medium uppercase tracking-wider text-on-surface-variant/60">Metrics</span>
          <span className="text-[9px] font-semibold text-on-surface tracking-tight">{wordCount.toLocaleString()} <span className="text-on-surface-variant/40 font-normal">words</span></span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-0">
            <span className="text-[9px] font-medium uppercase tracking-wider text-on-surface-variant/60">Goal</span>
            <span className="text-[9px] font-semibold text-on-surface-variant">{progress}% of {goal.dailyTarget || 2000}</span>
          </div>
          <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full rounded-full ${progress >= 100 ? 'bg-accent-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-primary shadow-primary-glow'}`}
            />
          </div>
        </div>
      </div>
    </>
  );
});
