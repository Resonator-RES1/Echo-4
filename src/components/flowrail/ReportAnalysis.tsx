import React, { useState } from 'react';
import { Activity, Info, Network, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { RefinedVersion } from '../../types';

// Sub-component to safely handle state for each card
const ExpressionCard: React.FC<{ profile: any }> = ({ profile }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const normalizedScore = profile.score > 10 ? profile.score / 10 : profile.score;
    return (
        <div 
            className={`bg-white/[0.02] p-5 rounded-lg border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 cursor-pointer group/metric ${isExpanded ? 'ring-1 ring-primary/30 shadow-2xl bg-white/[0.05]' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex justify-between items-center mb-3 gap-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 group-hover/metric:text-primary transition-colors truncate">{profile.vibe}</span>
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest whitespace-nowrap ${profile.qualifier === 'By Design' ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' : 'bg-accent-sky/10 text-accent-sky border-accent-sky/20'}`}>
                    {profile.qualifier}
                </span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-on-surface tracking-tighter">{Number(normalizedScore).toFixed(1)}</span>
                <span className="text-[9px] text-on-surface-variant/20 font-black">/10</span>
            </div>
            <p className={`text-[9px] text-on-surface-variant/70 mt-3 leading-relaxed font-serif italic ${!isExpanded ? 'line-clamp-2' : ''}`}>
                {profile.note}
            </p>
        </div>
    );
};

export const ReportAnalysis: React.FC<{ version: RefinedVersion }> = ({ version }) => {
    const { analysis, expressionProfile, justification, mirrorEditorCritique, collisionAnalysis, syncAudit } = version;
    if (!analysis && (!expressionProfile || expressionProfile.length === 0) && !justification && !mirrorEditorCritique && !collisionAnalysis && !syncAudit) return null;

    return (
        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl flex flex-col group transition-all hover:border-white/20">
            <div className="flex items-center gap-5 mb-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner transition-all duration-500">
                    <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Mirror Editor Analysis</h3>
                    <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Neutral Observation & Critique</p>
                </div>
            </div>

            <div className="space-y-8">
                {justification && (
                    <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 relative overflow-hidden group/section">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover/section:bg-primary transition-colors" />
                        <h4 className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 mb-3">Surgical Justification</h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed font-serif italic">“{justification}”</p>
                    </div>
                )}

                {collisionAnalysis && (
                    <div className="bg-white/[0.02] p-5 rounded-xl border border-white/10 relative overflow-hidden shadow-inner">
                        <div className="flex gap-5">
                            <Network className="w-5 h-5 text-accent-sky/40 shrink-0 mt-1" />
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-wider text-accent-sky/60 mb-3">Collision Analysis (Social Dynamics)</h4>
                                <div className="prose prose-sm prose-invert max-w-none prose-p:text-sm prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:italic prose-p:font-serif">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                        {collisionAnalysis}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {syncAudit && (
                    <div className="bg-white/[0.02] p-5 rounded-xl border border-white/10 relative overflow-hidden shadow-inner">
                        <div className="flex gap-5">
                            <Zap className="w-5 h-5 text-accent-amber/40 shrink-0 mt-1" />
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-wider text-accent-amber/60 mb-3">Physical-Cognitive Sync</h4>
                                <div className="prose prose-sm prose-invert max-w-none prose-p:text-sm prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:italic prose-p:font-serif">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                        {syncAudit}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {version.thematic_resonance && (
                    <div className="bg-white/[0.02] p-5 rounded-xl border border-white/10 relative overflow-hidden shadow-inner">
                        <div className="flex gap-5">
                            <div className="w-10 h-10 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center shrink-0">
                                <span className="text-sm font-black text-accent-emerald">{version.thematic_resonance.score.toFixed(1)}</span>
                            </div>
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-wider text-accent-emerald/60 mb-2 font-mono">Thematic Resonance Index</h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed font-serif italic mb-3">{version.thematic_resonance.alignment_analysis}</p>
                                <div className="p-3 bg-accent-emerald/5 rounded border border-accent-emerald/10 grayscale-[0.5]">
                                    <p className="text-[10px] text-accent-emerald font-bold uppercase tracking-widest mb-1 font-mono">Verdict</p>
                                    <p className="text-[11px] text-on-surface-variant font-serif italic">{version.thematic_resonance.impact_verdict}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {version.narrative_entropy && (
                    <div className="bg-white/[0.02] p-5 rounded-xl border border-white/10 relative overflow-hidden shadow-inner">
                        <div className="flex gap-5">
                            <div className="w-10 h-10 rounded-lg bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center shrink-0">
                                <span className="text-sm font-black text-accent-amber">{version.narrative_entropy.drift_score.toFixed(1)}</span>
                            </div>
                            <div>
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <h4 className="text-[9px] font-black uppercase tracking-wider text-accent-amber/60 font-mono">Narrative Entropy (Drift Tracking)</h4>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                                        version.narrative_entropy.stability_verdict === 'Stable' ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' :
                                        version.narrative_entropy.stability_verdict === 'Intentional Drift' ? 'bg-primary/10 text-primary border-primary/20' :
                                        'bg-error/10 text-error border-error/20'
                                    }`}>
                                        {version.narrative_entropy.stability_verdict}
                                    </span>
                                </div>
                                <p className="text-sm text-on-surface-variant leading-relaxed font-serif italic">{version.narrative_entropy.analysis}</p>
                            </div>
                        </div>
                    </div>
                )}

                {version.entropy_metrics && (
                    <div className="bg-white/[0.02] p-5 rounded-xl border border-white/10 relative overflow-hidden shadow-inner">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Network className="w-4 h-4 text-primary/40" />
                                    <h4 className="text-[9px] font-black uppercase tracking-wider text-primary/60 font-mono">Entropy Audit</h4>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] text-on-surface-variant/40 uppercase font-black tracking-tighter">TTR</span>
                                        <span className={`text-xs font-bold ${version.entropy_metrics.type_token_ratio < 0.6 ? 'text-error' : 'text-on-surface'}`}>{version.entropy_metrics.type_token_ratio.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] text-on-surface-variant/40 uppercase font-black tracking-tighter">Sigma</span>
                                        <span className={`text-xs font-bold ${version.entropy_metrics.sentence_variance < 10 ? 'text-error' : 'text-on-surface'}`}>{version.entropy_metrics.sentence_variance.toFixed(1)}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] text-on-surface-variant/40 uppercase font-black tracking-tighter">Grit</span>
                                        <span className={`text-xs font-bold ${version.entropy_metrics.polarity_score < 0.7 ? 'text-error' : 'text-on-surface'}`}>{(version.entropy_metrics.polarity_score * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <h5 className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/20">The Grit Map (Surgical Veto Pass)</h5>
                                <div className="flex flex-wrap gap-1.5">
                                    {version.entropy_metrics.entropy_map.map((segment) => (
                                        <div 
                                            key={segment.id}
                                            className={`px-2 py-1 rounded text-[10px] font-serif border transition-all cursor-help
                                                ${segment.entropy_score < 0.5 
                                                    ? 'bg-error/10 border-error/30 text-error shadow-[0_0_10px_rgba(var(--color-error),0.05)]' 
                                                    : segment.entropy_score < 0.8 
                                                        ? 'bg-accent-amber/10 border-accent-amber/30 text-accent-amber' 
                                                        : 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald'}`}
                                            title={`${segment.violation ? `VIOLATION: ${segment.violation}` : 'Grit Verified'}${segment.fix_suggestion ? ` | FIX: ${segment.fix_suggestion}` : ''}`}
                                        >
                                            {segment.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {analysis && (
                    <div className="bg-white/[0.02] p-5 rounded-xl border border-white/10 relative overflow-hidden shadow-inner">
                        <div className="flex gap-5">
                            <Info className="w-5 h-5 text-primary/40 shrink-0 mt-1" />
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-wider text-primary/60 mb-3">Narrative Pattern Audit</h4>
                                <div className="prose prose-sm prose-invert max-w-none prose-p:text-sm prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:italic prose-p:font-serif">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                        {analysis}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {mirrorEditorCritique && (
                    <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 relative overflow-hidden group/section">
                        <div className="absolute top-0 left-0 w-1 h-full bg-error/20 group-hover/section:bg-error transition-colors" />
                        <h4 className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 mb-3">Mirror Editor Critique</h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed font-serif italic">“{mirrorEditorCritique}”</p>
                    </div>
                )}

                {expressionProfile && expressionProfile.length > 0 && (
                    <div className="space-y-4 mt-6">
                        {expressionProfile.map((profile, idx) => (
                            <ExpressionCard key={idx} profile={profile} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
