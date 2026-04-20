import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { SelfCorrection } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReportSelfCorrectionsProps {
    selfCorrections: SelfCorrection[];
    onRevertSelfCorrection?: (correction: SelfCorrection) => void;
}

const CorrectionItem = ({ 
    correction,
    onRevertSelfCorrection
}: { 
    correction: SelfCorrection,
    onRevertSelfCorrection?: (correction: SelfCorrection) => void
}) => {
    const canRevert = !!(correction.originalSnippet && correction.correctedSnippet);

    return (
        <div className="group/item p-5 bg-white/[0.02] rounded-lg border border-white/10 hover:bg-white/[0.04] hover:border-accent-emerald/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Wrench className="w-3 h-3 text-accent-emerald" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 group-hover/item:text-accent-emerald transition-colors">Self-Correction</span>
                </div>
                <div className="flex items-center gap-3">
                    {canRevert && onRevertSelfCorrection && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onRevertSelfCorrection(correction);
                            }}
                            className="px-3 py-1 bg-accent-emerald/10 text-accent-emerald text-[8px] font-black uppercase tracking-widest rounded-lg border border-accent-emerald/20 hover:bg-accent-emerald hover:text-white transition-all active:scale-95"
                        >
                            Revert
                        </button>
                    )}
                    <div className="w-2 h-2 rounded-full bg-accent-emerald/20 group-hover/item:bg-accent-emerald transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                </div>
            </div>
            <div className="space-y-3">
                <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-error/60 block mb-1">Issue Detected</span>
                    <p className="text-[9px] text-on-surface-variant/80 leading-relaxed italic font-serif">
                        {correction.issueDetected}
                    </p>
                </div>
                <div className="pt-3 border-t border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-accent-emerald/60 block mb-1">Diagnostic Rationale</span>
                    <p className="text-[9px] text-on-surface-variant/80 leading-relaxed italic mb-3">
                        {correction.diagnosticRationale}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-accent-emerald/60 block mb-1">Correction Applied</span>
                    <p className="text-[9px] text-on-surface/90 leading-relaxed">
                        {correction.correctionApplied}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ReportSelfCorrections: React.FC<ReportSelfCorrectionsProps> = ({ selfCorrections, onRevertSelfCorrection }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasCorrections = selfCorrections && selfCorrections.length > 0;

    return (
        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 group hover:border-white/20">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left"
            >
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-all duration-500 ${hasCorrections ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-on-surface-variant/10 text-on-surface-variant border border-white/5'}`}>
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Self-Correction Loop {hasCorrections ? `(${selfCorrections.length})` : ''}</h3>
                        <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Pre-Flight Fixes</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!hasCorrections && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 bg-white/5 border border-white/10 px-3 py-1 rounded-full">None Needed</span>
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
                                    <p className="text-sm text-on-surface-variant/40 italic font-serif">The engine did not detect any flaws during its self-audit phase.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-8">
                                    {selfCorrections.map((correction, idx) => (
                                        <CorrectionItem 
                                            key={idx} 
                                            correction={correction} 
                                            onRevertSelfCorrection={onRevertSelfCorrection}
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
