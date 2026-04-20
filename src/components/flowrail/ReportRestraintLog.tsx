import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, CheckCircle2, Sparkles } from 'lucide-react';
import { RefinedVersion } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReportRestraintLogProps {
    restraintLog: RefinedVersion['restraintLog'];
}

const RestraintLogItem = ({ log, getIconForCategory }: { log: any, getIconForCategory: (cat: string) => React.ReactElement }) => {
    const [isJustificationExpanded, setIsJustificationExpanded] = useState(false);
    return (
        <div className="group/item p-5 bg-white/[0.02] rounded-lg border border-white/10 hover:bg-white/[0.04] hover:border-accent-sky/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {getIconForCategory(log.category)}
                    <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 group-hover/item:text-accent-sky transition-colors">{log.category}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-accent-sky/20 group-hover/item:bg-accent-sky transition-all duration-500 shadow-[0_0_8px_rgba(var(--accent-sky-rgb),0.3)]"></div>
            </div>
            <h4 className="text-sm font-bold mb-3 text-on-surface/90 tracking-tight">"{log.target}"</h4>
            <div 
                className={`flex gap-3 bg-black/20 p-4 rounded-xl border border-white/5 cursor-pointer transition-all hover:border-white/20 ${isJustificationExpanded ? 'ring-1 ring-accent-sky/30 bg-black/40' : ''}`}
                onClick={() => setIsJustificationExpanded(!isJustificationExpanded)}
            >
                <Info className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isJustificationExpanded ? 'text-accent-sky' : 'text-accent-sky/40'}`} />
                <div className="flex-1 min-w-0">
                    <p className={`text-[9px] text-on-surface-variant/80 leading-relaxed italic font-serif ${!isJustificationExpanded ? 'line-clamp-1' : ''}`}>
                        {log.justification}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ReportRestraintLog: React.FC<ReportRestraintLogProps> = ({ restraintLog }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasRestraint = restraintLog && restraintLog.length > 0;

    const getIconForCategory = (category: string) => {
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes('lore') || lowerCat.includes('detail') || lowerCat.includes('fact')) {
            return <ShieldCheck className="w-3 h-3 text-blue-500" />;
        }
        if (lowerCat.includes('rhythm') || lowerCat.includes('sensory') || lowerCat.includes('flow') || lowerCat.includes('enhance')) {
            return <Sparkles className="w-3 h-3 text-purple-500" />;
        }
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
    };

    return (
        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 group hover:border-white/20">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left"
            >
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-all duration-500 ${hasRestraint ? 'bg-accent-sky/10 text-accent-sky border border-accent-sky/20' : 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'}`}>
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Preservation Log {hasRestraint ? `(${restraintLog.length})` : ''}</h3>
                        <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Respect & Fidelity</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!hasRestraint && (
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
                            {!hasRestraint ? (
                                <div className="py-10 text-center">
                                    <p className="text-sm text-on-surface-variant/40 italic font-serif">No restraint overrides needed. Every element of the draft was preserved.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-8">
                                    {restraintLog.map((log, idx) => (
                                        <RestraintLogItem 
                                            key={idx} 
                                            log={log} 
                                            getIconForCategory={getIconForCategory} 
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
