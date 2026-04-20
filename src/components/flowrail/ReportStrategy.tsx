import React from 'react';
import { Target, Lightbulb, Zap, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { RefinementAudit, FocusArea } from '../../types';
import { SOVEREIGN_PRESETS } from '../../constants/sovereignPresets';
import { focusAreaOptions } from '../../constants/focusAreas';
import { useConfigStore } from '../../stores/useConfigStore';
import { useUIStore } from '../../stores/useUIStore';
import { useEditorUIStore } from '../../stores/useEditorUIStore';

interface ReportStrategyProps {
    audit?: RefinementAudit;
    showToast: (message: string) => void;
}

export const ReportStrategy: React.FC<ReportStrategyProps> = ({ audit, showToast }) => {
    const setFocusAreas = useConfigStore(state => state.setFocusAreas);
    const setActivePresetIds = useConfigStore(state => state.setActivePresetIds);
    const setModel = useConfigStore(state => state.setModel);
    const setFeedbackDepth = useConfigStore(state => state.setFeedbackDepth);
    const setCustomDirectives = useUIStore(state => state.setCustomDirectives);
    const clearSuggestions = useUIStore(state => state.clearSuggestions);
    const clearTray = useUIStore(state => state.clearTray);
    const setActiveTab = useEditorUIStore(state => state.setActiveTab);

    if (!audit?.strategy) {
        return (
            <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl flex flex-col items-center justify-center text-center">
                <Target className="w-12 h-12 text-on-surface-variant/20 mb-4" />
                <h3 className="text-lg font-bold text-on-surface-variant/60">No Strategy Recommended</h3>
                <p className="text-sm text-on-surface-variant/40 max-w-md mt-2">
                    The audit did not generate a specific next-step strategy for this version.
                </p>
            </div>
        );
    }

    const { strategy } = audit;

    const handleApplyStrategy = () => {
        // Clear audit tab parameters
        clearSuggestions();
        clearTray();
        setCustomDirectives('');

        // Apply new configuration
        // 1. Set Focus Areas
        const validFocusAreas = strategy.recommendedFocusAreas.map(area => {
            const match = focusAreaOptions.find(opt => opt.id === area || opt.label === area);
            return match ? match.id : null;
        }).filter(Boolean) as FocusArea[];
        if (validFocusAreas.length > 0) {
            setFocusAreas(validFocusAreas);
        }

        // 2. Set Custom Directives
        if (strategy.customDirectives.length > 0) {
            setCustomDirectives(strategy.customDirectives.join('\n'));
        }

        // 3. Try to match and set Preset
        if (strategy.recommendedPresets.length > 0) {
            const presetName = strategy.recommendedPresets[0];
            const matchedPreset = SOVEREIGN_PRESETS.find(p => 
                p.name.toLowerCase().includes(presetName.toLowerCase()) || 
                presetName.toLowerCase().includes(p.name.toLowerCase())
            );
            if (matchedPreset) {
                setActivePresetIds([matchedPreset.id]);
                setModel(matchedPreset.model as any);
                setFeedbackDepth(matchedPreset.depth);
            }
        }

        showToast("Next-Step Strategy applied. Audit cleared for next pass.");
        
        // Ensure we switch to Refine tab
        setActiveTab('refine');
    };

    return (
        <div className="space-y-8">
            <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl relative overflow-hidden group/strategy">
                {/* Decorative background */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 relative z-10">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                                <Target className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-on-surface tracking-tight">Next-Step Strategy</h3>
                                <p className="text-[9px] text-primary/60 font-black uppercase tracking-wider">Echo's Tactical Recommendation</p>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-accent-amber" />
                                    <div className="w-px h-full bg-gradient-to-b from-accent-amber/20 to-transparent" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-accent-amber/60 mb-2">The Reasoning</h4>
                                    <p className="text-on-surface text-lg leading-relaxed font-serif italic">
                                        {strategy.reasoning}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Focus Areas */}
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Zap className="w-4 h-4 text-primary" />
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-on-surface/60">Recommended Lenses</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {strategy.recommendedFocusAreas.map((area, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-bold text-primary uppercase tracking-tighter">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Presets */}
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="w-4 h-4 text-accent-indigo" />
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-on-surface/60">Recommended Presets</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {strategy.recommendedPresets.map((preset, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-accent-indigo/10 border border-accent-indigo/20 rounded-full text-[9px] font-bold text-accent-indigo uppercase tracking-tighter">
                                            {preset}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Custom Directives */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <ArrowRight className="w-4 h-4 text-accent-emerald" />
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-on-surface/60">Tactical Directives</h4>
                            </div>
                            <ul className="space-y-3">
                                {strategy.customDirectives.map((directive, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-on-surface-variant leading-relaxed">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald mt-1.5 shrink-0" />
                                        {directive}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="md:w-64 space-y-6">
                        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto shadow-primary-glow">
                                <CheckCircle2 className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-on-surface">Apply Strategy</h4>
                                <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-widest leading-tight">
                                    Auto-configure the Refinement Engine for the next pass.
                                </p>
                            </div>
                            <button 
                                onClick={handleApplyStrategy}
                                className="w-full py-3 bg-primary text-surface rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                            >
                                Apply & Refine
                            </button>
                        </div>

                        <div className="p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                            <p className="text-[9px] text-on-surface-variant/40 italic leading-relaxed">
                                "The strategy is not a command, but a path. Echo identifies the friction in your prose and suggests the tools to dissolve it."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
