import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, X, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { useWorkbenchStore } from '../../stores/useWorkbenchStore';

interface SurgicalTrayProps {
    onCommit: (destination: 'workbench' | 'directives') => void;
}

export const SurgicalTray: React.FC<SurgicalTrayProps> = ({ onCommit }) => {
    const { surgicalTray, removeFromTray, clearTray } = useWorkbenchStore();

    if (surgicalTray.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[100] px-4"
            >
                <div className="bg-surface-container-highest/90 backdrop-blur-2xl rounded-xl border border-primary/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10">
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-primary/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Scissors className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-wider text-primary">Surgical Tray</h4>
                                <p className="text-[8px] text-on-surface-variant/40 uppercase tracking-widest font-bold">
                                    {surgicalTray.length} Suggestions Staged
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={clearTray}
                            className="p-2 hover:bg-error/10 text-on-surface-variant/40 hover:text-error transition-colors rounded-lg"
                            title="Clear Tray"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto custom-scrollbar p-4 space-y-2">
                        {surgicalTray.map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="group flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 group-hover:bg-primary transition-colors" />
                                <p className="flex-1 text-[9px] text-on-surface-variant/80 leading-relaxed italic font-serif">
                                    {item}
                                </p>
                                <button 
                                    onClick={() => removeFromTray(idx)}
                                    className="p-1 hover:bg-white/10 text-on-surface-variant/20 hover:text-on-surface transition-colors rounded-md"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-4 bg-primary/5 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={() => onCommit('directives')}
                            className="flex-1 flex items-center justify-center gap-3 py-4 bg-white/5 text-on-surface border border-white/10 font-black uppercase tracking-wider text-[9px] rounded-lg hover:bg-white/10 hover:border-white/20 transition-all shadow-xl group"
                        >
                            <ChevronRight className="w-4 h-4 text-accent-indigo group-hover:translate-x-1 transition-transform" />
                            <span>Import to Directives</span>
                        </button>
                        <button 
                            onClick={() => onCommit('workbench')}
                            className="flex-[1.5] flex items-center justify-center gap-3 py-4 bg-primary text-surface font-black uppercase tracking-wider text-[9px] rounded-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Commit to Workbench</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
