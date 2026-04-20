import React from 'react';
import { 
    Brain, 
    ShieldAlert, 
    Zap, 
    History, 
    FileSearch, 
    MessageCircle, 
    Compass, 
    Crosshair,
    Shield,
    Target
} from 'lucide-react';
import { motion } from 'motion/react';
import { RefinedVersion } from '../../types';
import { ReportThinkingFlow } from './ReportThinkingFlow';

interface ReportArchitectLogProps {
    version: RefinedVersion;
}

export const ReportArchitectLog: React.FC<ReportArchitectLogProps> = ({ version }) => {
    const { 
        internalCritique, 
        thinking, 
        justification, 
        evidenceBasedClaims, 
        whyBehindChange, 
        loreLineage, 
        mirrorEditorCritique,
        blueprint,
        mandate
    } = version;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            {/* 1. Narrative Blueprint Section */}
            {blueprint && (
                <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl group hover:border-white/20 transition-all duration-500 overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner transition-all duration-500 group-hover:scale-110">
                            <Compass className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Narrative Blueprint</h3>
                            <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Architectural Intent & Tonal Mapping</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <BlueprintItem label="Chapter Arc" content={blueprint.chapterArc} />
                        <BlueprintItem label="Tonal Signature" content={blueprint.tonalSignature} />
                        <BlueprintItem label="Priority Focus" content={blueprint.priorityFocus} />
                        <BlueprintItem label="Foreshadowing Notes" content={blueprint.foreshadowingNotes} />
                    </div>
                </div>
            )}

            {/* 2. Mechanical Mandate Section */}
            {mandate && (
                <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl group hover:border-white/20 transition-all duration-500 overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-amber/5 rounded-full blur-3xl" />
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center shadow-inner transition-all duration-500 group-hover:scale-110">
                            <Crosshair className="w-6 h-6 text-accent-amber" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-accent-amber transition-colors">Mechanical Mandate</h3>
                            <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Strict Operational Constraints</p>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {mandate.axioms && mandate.axioms.length > 0 && (
                            <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-3.5 h-3.5 text-accent-amber/60" />
                                    <h4 className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/30">System Axioms</h4>
                                </div>
                                <ul className="space-y-2">
                                    {mandate.axioms.map((axiom, idx) => (
                                        <li key={idx} className="flex gap-3 text-xs text-on-surface-variant/80 italic font-serif leading-relaxed">
                                            <span className="text-accent-amber/40 font-black">•</span>
                                            {axiom}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {mandate.objectives && mandate.objectives.length > 0 && (
                            <div className="bg-white/[0.01] p-4 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="w-3.5 h-3.5 text-primary/60" />
                                    <h4 className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/30">Primary Objectives</h4>
                                </div>
                                <div className="space-y-3">
                                    {mandate.objectives.map((obj, idx) => (
                                        <div key={idx} className="p-3 bg-black/20 rounded border border-white/5">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest leading-none">{obj.t}</span>
                                                <span className="text-[8px] font-bold text-on-surface-variant/20 tracking-widest leading-none">PRIORITY {obj.p}</span>
                                            </div>
                                            <p className="text-[11px] text-on-surface-variant leading-relaxed italic font-serif">{obj.r}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {mandate.guardrails && mandate.guardrails.length > 0 && (
                            <div className="bg-error/5 p-4 rounded-lg border border-error/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldAlert className="w-3.5 h-3.5 text-error/60" />
                                    <h4 className="text-[9px] font-black uppercase tracking-wider text-error/40">Negative Guardrails</h4>
                                </div>
                                <ul className="space-y-2">
                                    {mandate.guardrails.map((rail, idx) => (
                                        <li key={idx} className="flex gap-3 text-xs text-on-surface-variant/80 italic font-serif leading-relaxed">
                                            <span className="text-error/40 font-black">×</span>
                                            {rail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Internal Thinking Section */}
            {(thinking || internalCritique) && (
                <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl overflow-hidden group hover:border-white/20 transition-all duration-500 relative">
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner transition-all duration-500 group-hover:scale-110">
                            <Brain className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Internal Reasoning Chain</h3>
                            <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">AI Decision Pathway & Critique</p>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {internalCritique && (
                            <div className="bg-white/[0.02] p-5 rounded-xl border border-white/10 relative overflow-hidden group/critique">
                                <div className="absolute top-0 left-0 w-1 h-full bg-error/20 group-hover/critique:bg-error transition-colors" />
                                <div className="flex items-center gap-3 mb-3">
                                    <ShieldAlert className="w-4 h-4 text-error/60" />
                                    <h4 className="text-[10px] font-black uppercase tracking-wider text-error/60">Self-Critique Phase</h4>
                                </div>
                                <p className="text-sm text-on-surface-variant leading-relaxed font-serif italic">
                                    {internalCritique}
                                </p>
                            </div>
                        )}

                        {thinking && (
                            <div className="pl-4 border-l border-white/5">
                                <h4 className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/30 mb-4">Thinking Nodes</h4>
                                <ReportThinkingFlow thinking={thinking} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. Evidence & Logic Section */}
            {(evidenceBasedClaims || whyBehindChange || loreLineage) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {whyBehindChange && (
                        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl group hover:border-white/20 transition-all duration-500">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="w-4 h-4 text-accent-cyan" />
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/40">The "Why" Behind Changes</h4>
                            </div>
                            <p className="text-sm text-on-surface-variant/80 leading-relaxed font-serif italic">
                                {whyBehindChange}
                            </p>
                        </div>
                    )}

                    {evidenceBasedClaims && (
                        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl group hover:border-white/20 transition-all duration-500">
                            <div className="flex items-center gap-3 mb-4">
                                <FileSearch className="w-4 h-4 text-accent-emerald" />
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/40">Evidence-Based Claims</h4>
                            </div>
                            <p className="text-sm text-on-surface-variant/80 leading-relaxed font-serif italic">
                                {evidenceBasedClaims}
                            </p>
                        </div>
                    )}

                    {loreLineage && (
                        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl group hover:border-white/20 transition-all duration-500 col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <History className="w-4 h-4 text-accent-amber" />
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/40">Lore Lineage Persistence</h4>
                            </div>
                            <p className="text-sm text-on-surface-variant/80 leading-relaxed font-serif italic">
                                {loreLineage}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* 5. Justification Footer */}
            {(justification || mirrorEditorCritique) && (
                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                    {justification && (
                        <div className="flex gap-4">
                            <MessageCircle className="w-4 h-4 text-primary shrink-0 opacity-40 mt-1" />
                            <div>
                                <h5 className="text-[8px] font-black uppercase tracking-widest text-primary/60 mb-1">Final Architectural Justification</h5>
                                <p className="text-xs text-on-surface-variant/60 leading-relaxed italic">
                                    {justification}
                                </p>
                            </div>
                        </div>
                    )}
                    {mirrorEditorCritique && (
                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <ShieldAlert className="w-4 h-4 text-error shrink-0 opacity-40 mt-1" />
                            <div>
                                <h5 className="text-[8px] font-black uppercase tracking-widest text-error/60 mb-1">Post-Refinement Auditor Critique</h5>
                                <p className="text-xs text-on-surface-variant/60 leading-relaxed italic">
                                    {mirrorEditorCritique}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const BlueprintItem: React.FC<{ label: string; content: string }> = ({ label, content }) => (
    <div className="group/item">
        <h4 className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/30 mb-2 transition-colors group-hover/item:text-primary/40">{label}</h4>
        <p className="text-xs text-on-surface leading-relaxed font-serif italic border-l border-white/10 pl-3 transition-colors group-hover/item:border-primary/40">
            {content}
        </p>
    </div>
);
