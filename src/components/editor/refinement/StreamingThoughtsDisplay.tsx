import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Activity, Fingerprint, Sparkles } from 'lucide-react';

interface StreamingThoughtsDisplayProps {
  isRefining: boolean;
  streamingThoughts?: string;
  streamingText?: string;
}

export const StreamingThoughtsDisplay: React.FC<StreamingThoughtsDisplayProps> = ({
  isRefining,
  streamingThoughts = '',
}) => {
  // Extract high-quality milestones from the thought stream
  const milestones = useMemo(() => {
    if (!streamingThoughts) return ['Initializing Sovereign Engine...'];
    
    const possibleMilestones = [
      { trigger: 'initialize', label: 'Contextualizing Draft Environment...' },
      { trigger: 'foundation', label: 'World & Narrative Alignment Pass...' },
      { trigger: 'resolution', label: 'Profile Identity Reconstruction...' },
      { trigger: 'cpi', label: 'Resolving Interaction Physics...' },
      { trigger: 'intent', label: 'Establishing Authorial Hierarchy...' },
      { trigger: 'nit', label: 'Calculating Narrative Instability...' },
      { trigger: 'express', label: 'Allocating Imperfection Budget...' },
      { trigger: 'render', label: 'Rendering Final Sovereignty...' },
      { trigger: 'audit', label: 'Performing Deterministic Audit...' },
      { trigger: 'healing', label: 'Repairing Linguistic Drift...' },
      { trigger: 'voice', label: 'Synchronizing Voice DNA...' },
      { trigger: 'lore', label: 'Consulting Lore Anchors...' }
    ];

    const found = possibleMilestones
      .filter(m => streamingThoughts.toLowerCase().includes(m.trigger))
      .map(m => m.label);

    // Always show at least the current specific progress or the default
    return found.length > 0 ? found.slice(-2) : ['Projecting Linguistic Mirror...'];
  }, [streamingThoughts]);

  return (
    <AnimatePresence>
      {isRefining && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="mt-4 p-5 bg-surface-container-high/60 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Animated Background Pulse */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 animate-pulse" />
          
          <div className="relative flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary animate-spin-slow" />
                </div>
                <motion.div 
                  className="absolute -inset-1 rounded-full border border-primary/40"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <Activity className="w-3 h-3 text-secondary animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Refinement in Progress</span>
                </div>
                <div className="h-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={milestones[milestones.length - 1]}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="text-[11px] font-bold text-on-surface-variant italic"
                    >
                      {milestones[milestones.length - 1]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 pr-2">
              <div className="flex flex-col items-center">
                <Fingerprint className="w-4 h-4 text-primary/40" />
                <span className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant/30 mt-1">Identity</span>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="w-4 h-4 text-secondary/40" />
                <span className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant/30 mt-1">Tension</span>
              </div>
            </div>
          </div>

          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 15, ease: "linear" }}
             />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
