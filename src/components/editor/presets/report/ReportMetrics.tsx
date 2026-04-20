import React from 'react';
import { BarChart3, Sparkles, ChevronRight } from 'lucide-react';
import { ProseMetrics, FocusArea } from '../../../../types';
import { MetricBar } from './MetricBar';
import { getRecommendations } from './utils';

interface ReportMetricsProps {
    metrics: ProseMetrics;
    setFocusAreas: (areas: FocusArea[]) => void;
}

export const ReportMetrics: React.FC<ReportMetricsProps> = ({ metrics, setFocusAreas }) => {
    const recommendations = getRecommendations(metrics);
    const recommendedAreas = recommendations.map(r => r.area);

    return (
        <div className="space-y-6 pt-6 border-t border-outline-variant/20">
            <div className="flex items-center gap-3 text-on-surface/80">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest">Expression Profile (Prose Analytics)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricBar label="Sensory Vividness" metric={metrics.sensory_vividness} isRecommended={recommendedAreas.includes('sensory')} />
                <MetricBar label="Pacing Rhythm" metric={metrics.pacing_rhythm} isRecommended={recommendedAreas.includes('rhythm')} />
                <MetricBar label="Dialogue Authenticity" metric={metrics.dialogue_authenticity} isRecommended={recommendedAreas.includes('dialogue')} />
                <MetricBar label="Voice Consistency" metric={metrics.voice_consistency} isRecommended={recommendedAreas.includes('voiceIntegrity')} />
            </div>
            <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-500">
                    <Sparkles className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Smart Suggestions</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendations.map((rec, idx) => (
                        <button
                            key={idx}
                            onClick={() => setFocusAreas([rec.area])}
                            className="group relative flex flex-col items-start gap-1 p-4 rounded-lg border border-outline-variant hover:border-primary/50 hover:bg-primary/5 transition-all text-left bg-surface-container-highest/10"
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                                    {rec.text}
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-primary" />
                            </div>
                            <p className="text-xs text-on-surface/60 leading-relaxed">
                                {rec.why}
                            </p>
                            <div className="mt-2 text-[9px] font-black uppercase tracking-tighter text-primary/40 group-hover:text-primary/60 transition-colors">
                                Auto-set {rec.area}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
