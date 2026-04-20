import React, { useState } from 'react';
import { Mic2, Info, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { VoiceAudit } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkbenchStore } from '../../stores/useWorkbenchStore';

interface ReportVoiceResonanceProps {
  voiceAudits?: VoiceAudit[];
}

export const ReportVoiceResonance: React.FC<ReportVoiceResonanceProps> = ({ voiceAudits }) => {
  const [activeAuditIndex, setActiveAuditIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const hasAudits = voiceAudits && voiceAudits.length > 0;

  return (
    <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 group hover:border-white/20">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left"
      >
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-all duration-500 ${hasAudits ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'}`}>
            <Mic2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Voice Resonance Radar</h3>
            <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Consistency Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!hasAudits && (
            <span className="text-[9px] font-black uppercase tracking-wider text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-3 py-1 rounded-full">All Clear</span>
          )}
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant/30 group-hover:text-primary transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 pt-0 border-t border-white/10">
              {!hasAudits ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-on-surface-variant/40 italic font-serif">No voice dissonance detected. Character consistency remains high.</p>
                </div>
              ) : (
                <div className="space-y-4 mt-8">
                  {voiceAudits.map((audit, index) => {
                    const rawScore = audit.resonanceScore;
                    const score = rawScore > 10 ? rawScore / 10 : rawScore;
                    const isActive = activeAuditIndex === index;
                    let accentColor = 'primary';
                    let glowColor = 'rgba(var(--primary-rgb), 0.5)';

                    if (score < 4.0) {
                      accentColor = 'error';
                      glowColor = 'rgba(239, 68, 68, 0.5)';
                    } else if (score < 7.0) {
                      accentColor = 'accent-amber';
                      glowColor = 'rgba(245, 158, 11, 0.5)';
                    } else {
                        accentColor = 'accent-emerald';
                        glowColor = 'rgba(16, 185, 129, 0.5)';
                    }

                    return (
                      <div
                        key={index}
                        onClick={() => setActiveAuditIndex(isActive ? null : index)}
                        className={`group/chip relative flex flex-col gap-3 p-5 rounded-lg border transition-all duration-500 cursor-pointer bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20 ${isActive ? 'ring-2 ring-primary/30 border-primary/20 bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg text-on-surface tracking-tight truncate">{audit.characterName}</span>
                                <div className={`w-2 h-2 rounded-full bg-${accentColor} shadow-[0_0_8px_${glowColor}] shrink-0`} />
                            </div>
                            <div className="flex items-baseline gap-1 shrink-0">
                                <span className="font-black text-xl tracking-tighter text-on-surface">{score.toFixed(1)}</span>
                                <span className="text-[9px] text-on-surface-variant/20 font-black">/ 10 Resonance</span>
                            </div>
                        </div>
                        
                        {/* Bioluminescent Progress Bar */}
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${score * 10}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={`h-full rounded-full relative ${
                                    score >= 7.0 ? 'bg-accent-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                                    score >= 4.0 ? 'bg-accent-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                                    'bg-error shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </motion.div>
                        </div>
                        
                        <AnimatePresence>
                            {audit.dissonanceReason && (
                                <motion.div 
                                    initial={isActive ? { opacity: 0, height: 0 } : { opacity: 1, height: 'auto' }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-2 p-4 bg-black/40 text-on-surface rounded-xl border border-white/10 text-[9px] shadow-2xl"
                                >
                                    <div className="flex items-start gap-3">
                                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40">Dissonance Analysis</p>
                                                {audit.arc_intent && (
                                                    <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest shadow-sm ${
                                                        audit.arc_intent.type === 'alignment' ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' :
                                                        audit.arc_intent.type === 'intentional_evolution' ? 'bg-primary/10 text-primary border border-primary/20' :
                                                        'bg-error/10 text-error border border-error/20'
                                                    }`}>
                                                        {audit.arc_intent.type.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="leading-relaxed italic font-serif text-on-surface-variant/80">{audit.dissonanceReason}</p>
                                            {audit.arc_intent?.rationale && (
                                                <div className="mt-2 pt-2 border-t border-white/5">
                                                    <p className="text-[7px] font-bold text-primary/60 uppercase tracking-widest mb-1">Evolution Rationale</p>
                                                    <p className="text-[9px] leading-relaxed text-on-surface-variant/60">{audit.arc_intent.rationale}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
