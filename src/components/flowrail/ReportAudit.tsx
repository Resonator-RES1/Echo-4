import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, History, CheckCheck, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RefinedVersion } from '../../types';
import { getResonanceLabel } from '../../lib/utils';
import { useUIStore } from '../../stores/useUIStore';

import { ReportThinkingFlow } from './ReportThinkingFlow';

interface ReportAuditProps {
    audit: RefinedVersion['audit'];
    thinking?: string;
}

export const ReportAudit: React.FC<ReportAuditProps> = ({ audit, thinking }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showThinking, setShowThinking] = useState(!!thinking);
    const refinementMode = useUIStore(state => state.refinementMode);

    if (!audit && !thinking) return null;

    return (
        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 group hover:border-white/20">
            <div className="flex flex-col md:flex-row">
                <div className="flex-1">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner transition-all duration-500">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Fidelity Audit</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Integrity & Compliance Check</p>
                                    {refinementMode === 'post-audit' && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-accent-indigo/40" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-accent-indigo animate-pulse">Evolutionary Mode</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {thinking && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowThinking(!showThinking);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${
                                        showThinking 
                                        ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                                        : 'bg-white/5 text-primary border-primary/20 hover:bg-primary/10'
                                    }`}
                                >
                                    {showThinking ? 'Hide Reasoning' : 'View Internal Reasoning'}
                                </button>
                            )}
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant/30 group-hover:text-primary transition-colors">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </div>
                    </button>

                    <AnimatePresence>
                        {isExpanded && audit && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="px-8 pb-8 pt-0 border-t border-white/10">
                                    <div className="space-y-4 mt-8">
                                        <AuditItem 
                                            label="Voice Fidelity" 
                                            score={audit.voiceFidelityScore} 
                                            reasoning={audit.voiceFidelityReasoning} 
                                            primary
                                        />
                                        <div className="h-px bg-white/10 my-4" />
                                        <AuditItem 
                                            label="Lore Compliance" 
                                            score={audit.loreCompliance} 
                                            reasoning={audit.loreComplianceReasoning} 
                                        />
                                        <AuditItem 
                                            label="Voice Adherence" 
                                            score={audit.voiceAdherence} 
                                            reasoning={audit.voiceAdherenceReasoning} 
                                        />
                                        <AuditItem 
                                            label="Focus Alignment" 
                                            score={audit.focusAreaAlignment} 
                                            reasoning={audit.focusAreaAlignmentReasoning} 
                                        />

                                        {audit.evolution_audit && (
                                            <div className="mt-6 pt-6 border-t border-white/10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <History className="w-4 h-4 text-accent-indigo" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-accent-indigo">Evolution Check</h4>
                                                    <div className={`ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${
                                                        audit.evolution_audit.is_success 
                                                        ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' 
                                                        : 'bg-error/10 text-error border border-error/20'
                                                    }`}>
                                                        {audit.evolution_audit.is_success ? <CheckCheck className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {audit.evolution_audit.is_success ? 'Audit Passed' : 'Drift Observed'}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-accent-indigo/5 rounded-xl border border-accent-indigo/10 p-5 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-wider">Improvement Delta</span>
                                                        <span className="text-lg font-black text-accent-indigo">{audit.evolution_audit.improvement_delta.toFixed(1)}/10</span>
                                                    </div>
                                                    
                                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-accent-indigo shadow-[0_0_8px_rgba(var(--color-accent-indigo),0.5)] transition-all duration-1000"
                                                            style={{ width: `${audit.evolution_audit.improvement_delta * 10}%` }}
                                                        />
                                                    </div>

                                                    <p className="text-[12px] text-on-surface-variant/80 italic font-serif leading-relaxed pt-2">
                                                        {audit.evolution_audit.analysis}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Internal Reasoning Slide-out */}
                <AnimatePresence>
                    {showThinking && thinking && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '400px', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="border-l border-white/10 bg-black/20 backdrop-blur-xl overflow-hidden flex flex-col"
                        >
                            <div className="p-5 h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-wider text-primary">Cynical Mirror: Internal Reasoning</span>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                                    <ReportThinkingFlow thinking={thinking} />
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <p className="text-[8px] text-on-surface-variant/30 uppercase tracking-wider font-black">
                                        This log captures the raw analytical process used to derive the audit scores and refinement decisions.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const AuditItem: React.FC<{ label: string; score: number; reasoning: string; primary?: boolean }> = ({ label, score, reasoning, primary }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const normalizedScore = score > 10 ? score / 10 : score;
    const resonance = getResonanceLabel(normalizedScore);
    
    return (
        <div 
            className={`space-y-4 cursor-pointer group/audit p-4 rounded-lg bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all duration-500 ${isExpanded ? 'ring-1 ring-primary/30 shadow-2xl bg-white/[0.05]' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/60 group-hover/audit:text-primary transition-colors truncate">{label}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border whitespace-nowrap w-fit ${resonance.color} ${resonance.bg} ${resonance.border}`}>
                        {resonance.label}
                    </span>
                </div>
                <div className="flex items-baseline gap-1 shrink-0">
                    <span className={`text-2xl font-black tracking-tighter ${primary ? 'text-primary' : 'text-on-surface'}`}>{Number(normalizedScore).toFixed(1)}</span>
                    <span className="text-[9px] text-on-surface-variant/20 font-black">/10</span>
                </div>
            </div>
            
            {/* Bioluminescent Progress Bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${normalizedScore * 10}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full relative transition-colors duration-500`}
                    style={{ 
                        backgroundColor: resonance.rawColor,
                        boxShadow: `0 0 10px ${resonance.rawColor}80` 
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
            </div>

            <div className={`flex gap-4 bg-black/20 p-5 rounded-xl border border-white/10 transition-all group-hover/audit:border-white/20`}>
                <Info className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isExpanded ? 'text-primary' : 'text-primary/40'}`} />
                <div className="flex-1">
                    <p className={`text-[12px] text-on-surface-variant/80 leading-relaxed italic font-serif ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {reasoning}
                    </p>
                    {reasoning.length > 150 && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary mt-3 block opacity-60">
                            {isExpanded ? 'Show Less' : 'Read More'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
