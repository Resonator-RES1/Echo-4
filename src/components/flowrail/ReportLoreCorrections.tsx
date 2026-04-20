import React, { useState } from 'react';
import { ShieldAlert, Info, ChevronDown, ChevronUp, ChevronRight, Plus } from 'lucide-react';
import { RefinedVersion, LoreCorrection } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkbenchStore } from '../../stores/useWorkbenchStore';

interface ReportLoreCorrectionsProps {
    loreCorrections: RefinedVersion['loreCorrections'];
    onRevertSpecificLore?: (correction: LoreCorrection) => void;
}

const LoreCorrectionItem = ({ 
    correction, 
    onRevertSpecificLore
}: { 
    correction: LoreCorrection, 
    onRevertSpecificLore?: (correction: LoreCorrection) => void
}) => {
    const [isReasonExpanded, setIsReasonExpanded] = useState(false);

    return (
        <div className="p-5 bg-white/[0.02] rounded-lg border border-white/10 group hover:bg-white/[0.04] transition-all duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-on-surface-variant/50 line-through truncate max-w-[150px]">{correction.original}</span>
                        <ChevronRight className="w-3 h-3 text-on-surface-variant/30 shrink-0" />
                        <span className="text-sm font-bold text-on-surface truncate">{correction.refined}</span>
                    </div>
                    <div 
                        className={`flex gap-3 bg-black/20 p-4 rounded-xl border border-white/5 cursor-pointer transition-all hover:border-white/20 ${isReasonExpanded ? 'ring-1 ring-accent-rose/30 bg-black/40' : ''}`}
                        onClick={() => setIsReasonExpanded(!isReasonExpanded)}
                    >
                        <Info className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isReasonExpanded ? 'text-accent-rose' : 'text-accent-rose/40'}`} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-[8px] text-on-surface-variant/40 font-black uppercase tracking-widest">Reasoning</p>
                            </div>
                            <p className={`text-[9px] text-on-surface-variant/80 leading-relaxed italic font-serif ${!isReasonExpanded ? 'line-clamp-1' : ''}`}>
                                {correction.reason}
                            </p>
                        </div>
                    </div>
                </div>
                {onRevertSpecificLore && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onRevertSpecificLore(correction);
                        }}
                        className="px-4 py-2 bg-accent-rose/10 text-accent-rose text-[9px] font-black uppercase tracking-widest rounded-xl border border-accent-rose/20 hover:bg-accent-rose hover:text-white transition-all active:scale-95 shrink-0"
                    >
                        Revert
                    </button>
                )}
            </div>
        </div>
    );
};

export const ReportLoreCorrections: React.FC<ReportLoreCorrectionsProps> = ({ loreCorrections, onRevertSpecificLore }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasCorrections = loreCorrections && loreCorrections.length > 0;

    return (
        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 group hover:border-white/20">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left"
            >
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-all duration-500 ${hasCorrections ? 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20' : 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'}`}>
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Lore Corrections {hasCorrections ? `(${loreCorrections.length})` : ''}</h3>
                        <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Hard Contradictions Fixed</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!hasCorrections && (
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
                            {!hasCorrections ? (
                                <div className="py-10 text-center">
                                    <p className="text-sm text-on-surface-variant/40 italic font-serif">No lore contradictions found. Continuity is intact.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-8">
                                    {loreCorrections.map((correction, idx) => (
                                        <LoreCorrectionItem 
                                            key={idx} 
                                            correction={correction} 
                                            onRevertSpecificLore={onRevertSpecificLore} 
                                        />
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
