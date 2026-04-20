import React from 'react';
import { motion } from 'motion/react';
import { Target, Settings, Info, Check } from 'lucide-react';
import { WritingGoal } from '../../types';

interface BlueprintViewProps {
  goal: WritingGoal;
  setGoal: React.Dispatch<React.SetStateAction<WritingGoal>>;
  totalWordCount: number;
  progress: number;
  handleSaveGoal: (newGoal: WritingGoal) => void;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({
  goal,
  setGoal,
  totalWordCount,
  progress,
  handleSaveGoal
}) => {
  return (
    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.15)]">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-on-surface tracking-tighter uppercase italic">Architect's Blueprint</h2>
          </div>
          <p className="text-xs text-on-surface-variant/40 uppercase tracking-widest font-black font-sans max-w-md leading-relaxed">
            Define the structural parameters of your narrative. Track the density of your construct against the sovereign goal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-10">
            {/* Progress Card */}
            <div className="p-4 bg-surface-container-low/40 backdrop-blur-xl border border-white/5 rounded-lg shadow-2xl relative overflow-hidden group/progress">
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px] group-hover/progress:bg-primary/10 transition-colors duration-1000" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Construct Density</span>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-6xl font-black text-on-surface tracking-tighter">{Math.round(progress)}%</h3>
                    <span className="text-sm font-black uppercase tracking-widest text-on-surface-variant/40">Complete</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Remaining Effort</span>
                  <p className="text-2xl font-black text-on-surface tracking-tight">{(goal.targetWords - totalWordCount).toLocaleString()} words</p>
                </div>
              </div>

              <div className="relative h-6 bg-black/40 rounded-full overflow-hidden border border-white/5 p-1 mb-8 relative z-10 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary relative shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-5 relative z-10">
                <div className="p-5 bg-white/[0.03] rounded-xl border border-white/5 shadow-inner group/stat transition-all hover:bg-white/[0.05]">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-3 group-hover/stat:text-primary transition-colors">Current Count</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-on-surface tracking-tighter">{totalWordCount.toLocaleString()}</span>
                    <span className="text-xs text-on-surface-variant/40 font-black uppercase tracking-widest">words</span>
                  </div>
                </div>
                <div className="p-5 bg-white/[0.03] rounded-xl border border-white/5 shadow-inner group/stat transition-all hover:bg-white/[0.05]">
                  <span className="block text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-3 group-hover/stat:text-primary transition-colors">Target Goal</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-on-surface tracking-tighter">{goal.targetWords.toLocaleString()}</span>
                    <span className="text-xs text-on-surface-variant/40 font-black uppercase tracking-widest">words</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Configuration Card */}
            <div className="p-4 bg-surface-container-low/40 backdrop-blur-xl border border-white/5 rounded-lg shadow-2xl space-y-10 relative overflow-hidden group/config">
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover/config:bg-primary/10 transition-colors duration-1000" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-on-surface">Parameters</h4>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 ml-2">Word Count Objective</label>
                    <div className="relative group/input">
                      <input 
                        type="text"
                        value={goal.targetWords === 0 ? '' : goal.targetWords}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) {
                            setGoal(prev => ({ ...prev, targetWords: val === '' ? 0 : parseInt(val, 10) }));
                          }
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-6 py-4 text-lg font-black text-on-surface outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/20 group-focus-within/input:text-primary transition-colors">Words</div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">Architect's Note</span>
                    </div>
                    <p className="text-xs text-on-surface-variant/60 leading-relaxed italic font-serif">
                      “The density of a narrative is not measured in words alone, but in the weight of the silence between them. Set your goal with intent.”
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleSaveGoal(goal)}
                className="w-full flex items-center justify-center gap-4 px-8 py-5 rounded-xl bg-primary text-surface font-black uppercase tracking-widest text-[9px] hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 relative z-10 overflow-hidden group/save"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/save:translate-x-full transition-transform duration-1000" />
                <Check className="w-5 h-5 group-hover/save:scale-110 transition-transform" />
                Commit Parameters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
