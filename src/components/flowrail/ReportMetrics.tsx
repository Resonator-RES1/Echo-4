import React, { useState } from 'react';
import { TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RefinedVersion, ProseMetrics } from '../../types';
import { getResonanceLabel } from '../../lib/utils';

interface ReportMetricsProps {
    metrics: RefinedVersion['metrics'];
}

export const ReportMetrics: React.FC<ReportMetricsProps> = ({ metrics }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const hasMetrics = metrics && Object.keys(metrics).length > 0;

    return (
        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 group hover:border-white/20">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left"
            >
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-all duration-500 ${hasMetrics ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'}`}>
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Prose Metrics</h3>
                        <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Technical Performance Analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!hasMetrics && (
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
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 pt-0 border-t border-white/10">
                            {!hasMetrics ? (
                                <div className="py-10 text-center">
                                    <p className="text-sm text-on-surface-variant/40 italic font-serif">No metrics available for this version.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-8">
                                    {Object.entries(metrics as ProseMetrics).map(([key, metric]) => {
                                        const normalizedScore = metric.score > 10 ? metric.score / 10 : metric.score;
                                        const resonance = getResonanceLabel(normalizedScore);
                                        return (
                                            <div key={key} className="space-y-3 p-5 rounded-lg bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all duration-500 group/metric">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/60 group-hover/metric:text-primary transition-colors truncate">{key.replace(/_/g, ' ')}</span>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border whitespace-nowrap w-fit ${resonance.color} ${resonance.bg} ${resonance.border}`}>
                                                            {resonance.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1 shrink-0">
                                                        <span className="text-xl font-black text-on-surface tracking-tighter">{Number(normalizedScore).toFixed(1)}</span>
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

                                                <div className="flex gap-3 bg-black/20 p-4 rounded-xl border border-white/10 group-hover/metric:border-white/20 transition-all">
                                                    <Info className="w-4 h-4 text-primary/40 shrink-0 mt-0.5" />
                                                    <p className="text-[9px] text-on-surface-variant/80 leading-relaxed italic font-serif">{metric.note}</p>
                                                </div>
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
