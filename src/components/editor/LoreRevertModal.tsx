import React from 'react';
import { X, RotateCcw, Info } from 'lucide-react';
import { LoreCorrection } from '../../types';

interface LoreRevertModalProps {
    isOpen: boolean;
    onClose: () => void;
    corrections: LoreCorrection[];
    onRevert: (correction: LoreCorrection) => void;
}

export const LoreRevertModal: React.FC<LoreRevertModalProps> = ({
    isOpen,
    onClose,
    corrections,
    onRevert
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-surface-container-high w-full max-w-lg rounded-[1rem] shadow-2xl border border-outline-variant/30 flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                <header className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-highest/50">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-amber-500" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface/90">Revert Lore Corrections</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-on-surface/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-on-surface/60" />
                    </button>
                </header>

                <div className="p-4 overflow-y-auto space-y-4">
                    {corrections.length === 0 ? (
                        <div className="text-center py-8 text-on-surface/40 italic text-sm">
                            No lore corrections detected in this version.
                        </div>
                    ) : (
                        corrections.map((correction, index) => (
                            <div 
                                key={index}
                                className="p-4 rounded-[0.75rem] bg-surface-container-low border border-outline-variant/10 hover:border-amber-500/30 transition-all group"
                            >
                                <div className="flex justify-between items-start gap-4 mb-3">
                                    <div className="space-y-1 flex-grow">
                                        <div className="text-[9px] uppercase tracking-wider font-bold text-amber-500/70">Correction</div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="line-through text-on-surface/40">{correction.original}</span>
                                            <span className="text-on-surface/40">→</span>
                                            <span className="font-bold text-amber-500">{correction.refined}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onRevert(correction)}
                                        className="px-3 py-1.5 bg-amber-500 text-on-primary text-[9px] font-bold uppercase tracking-wider rounded-[0.5rem] hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                                    >
                                        Revert
                                    </button>
                                </div>
                                <div className="flex items-start gap-2 p-2 rounded bg-on-surface/5 text-[9px] text-on-surface/70 italic">
                                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>{correction.reason}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <footer className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-highest/30 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-on-surface/60 hover:text-on-surface hover:bg-on-surface/5 rounded-[0.5rem] transition-colors"
                    >
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};
