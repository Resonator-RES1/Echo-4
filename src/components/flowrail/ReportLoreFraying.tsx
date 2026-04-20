import React, { useState } from 'react';
import { HelpCircle, Info, ChevronDown, ChevronUp, ChevronRight, Plus } from 'lucide-react';
import { RefinedVersion, LoreFraying } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkbenchStore } from '../../stores/useWorkbenchStore';

interface ReportLoreFrayingProps {
    loreFraying: RefinedVersion['loreFraying'];
}

export const ReportLoreFraying: React.FC<ReportLoreFrayingProps> = ({ loreFraying }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasFraying = loreFraying && loreFraying.length > 0;

    return (
        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 group hover:border-white/20">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left"
            >
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-all duration-500 ${hasFraying ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20' : 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'}`}>
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Narrative Fraying {hasFraying ? `(${loreFraying.length})` : ''}</h3>
                        <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Logic Gaps & Thematic Drift</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!hasFraying && (
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
                            {!hasFraying ? (
                                <div className="py-10 text-center">
                                    <p className="text-sm text-on-surface-variant/40 italic font-serif">No potential lore conflicts detected. Narrative logic is sound.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-8">
                                    {loreFraying.map((fraying, idx) => (
                                        <div key={idx} className="p-5 bg-white/[0.02] rounded-lg border border-white/10 group/item hover:bg-white/[0.04] transition-all duration-500">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-on-surface italic truncate">"{fraying.snippet}"</span>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex gap-3 bg-accent-amber/5 p-4 rounded-xl border border-accent-amber/10">
                                                        <Info className="w-4 h-4 text-accent-amber/60 shrink-0 mt-0.5" />
                                                        <div className="flex flex-col gap-1 min-w-0">
                                                            <p className="text-[9px] text-accent-amber font-black uppercase tracking-widest">Conflict</p>
                                                            <p className="text-[9px] text-on-surface-variant/80 leading-relaxed font-serif">{fraying.conflict}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                                                        <ChevronRight className="w-4 h-4 text-on-surface-variant/30 shrink-0 mt-0.5" />
                                                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-[9px] text-on-surface-variant/60 font-black uppercase tracking-widest">Suggestion</p>
                                                            </div>
                                                            <p className="text-[9px] text-on-surface-variant/80 leading-relaxed italic font-serif">{fraying.suggestion}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
