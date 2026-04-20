import React from 'react';
import { Target, Database, Mic2, History, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Scene, WritingGoal, CalendarConfig } from '../../types';
import { formatStoryDate } from '../../utils/calendar';

interface ProjectStatsProps {
  wordCount: number;
  goal: WritingGoal;
  writingProgress: number;
  loreCount: number;
  loreEvolutionCount?: number;
  voiceCount: number;
  voiceEvolutionCount?: number;
  recentScenes: Scene[];
  calendarConfig: CalendarConfig;
  onJumpToScene: (id: string) => void;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({
  wordCount,
  goal,
  writingProgress,
  loreCount,
  loreEvolutionCount = 0,
  voiceCount,
  voiceEvolutionCount = 0,
  recentScenes,
  calendarConfig,
  onJumpToScene
}) => {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 text-primary" /> {/* Placeholder for icon if needed */}
          <span className="text-[9px] font-black uppercase tracking-wider text-primary/60">Project Pulse</span>
        </div>
        
        {/* Word Count Card */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 shadow-xl space-y-6 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Manuscript Volume</span>
              <h3 className="font-mono text-3xl font-bold text-on-surface tracking-tighter">{wordCount.toLocaleString()}</h3>
            </div>
            
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 -m-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none flex items-center justify-center">
                <Target className="w-32 h-32" />
              </div>
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-lg animate-pulse" />
              
              <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary/10" />
                <motion.circle 
                  cx="50" cy="50" r="42" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray="263.9"
                  initial={{ strokeDashoffset: 263.9 }}
                  animate={{ strokeDashoffset: 263.9 * (1 - writingProgress / 100) }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="text-primary" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-[9px] font-black text-primary leading-none">{writingProgress}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">
              <span>Progress to Goal</span>
              <span>{goal.targetWords.toLocaleString()} Words</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden p-[1px] border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${writingProgress}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full bg-primary rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 blur-[1px]" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 shadow-lg space-y-2 group transition-all hover:bg-surface-container-highest/20">
            <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40">Lore Axioms</span>
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-2">
                <Database className="w-3.5 h-3.5 text-secondary mb-1" />
                <span className="font-mono text-xl font-bold leading-none">{loreCount}</span>
              </div>
              {loreEvolutionCount > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-secondary/60 uppercase tracking-tighter">+{loreEvolutionCount}</span>
                  <span className="text-[6px] font-bold text-on-surface-variant/20 uppercase tracking-[0.2em] -mt-0.5">Evolutions</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 shadow-lg space-y-2 group transition-all hover:bg-surface-container-highest/20">
            <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40">Voice DNA</span>
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-2">
                <Mic2 className="w-3.5 h-3.5 text-primary mb-1" />
                <span className="font-mono text-xl font-bold leading-none">{voiceCount}</span>
              </div>
              {voiceEvolutionCount > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-primary/60 uppercase tracking-tighter">+{voiceEvolutionCount}</span>
                  <span className="text-[6px] font-bold text-on-surface-variant/20 uppercase tracking-[0.2em] -mt-0.5">Evolutions</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Scenes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-wider text-primary/60">Recent Grafts</span>
          </div>
          <div className="space-y-3">
            {recentScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => onJumpToScene(scene.id)}
                className="w-full p-4 rounded-lg bg-surface-container-low/40 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate flex-1">{scene.title}</span>
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/20 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-2 text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest">
                  <Clock size={10} />
                  <span>{scene.storyDate ? formatStoryDate(scene.storyDate, calendarConfig) : `Day ${scene.storyDay}`}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
