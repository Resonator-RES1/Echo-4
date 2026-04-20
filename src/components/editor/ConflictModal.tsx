import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { LoreConflict } from '../../types';

interface ConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    conflicts: LoreConflict[];
}

export const ConflictModal: React.FC<ConflictModalProps> = ({ isOpen, onClose, conflicts }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-surface-container-highest rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-outline-variant/20" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
                    <h3 className="font-headline text-lg text-primary font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Lore Conflicts ({conflicts.length})
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-surface-container-highest rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto space-y-4">
                    {conflicts.map((conflict, i) => (
                        <div key={i} className="p-4 bg-surface-container-low rounded-xl border border-amber-500/20">
                            <p className="font-bold text-amber-500 mb-2 uppercase tracking-wider text-xs">Conflict {i + 1}</p>
                            <p className="text-on-surface italic mb-2">"{conflict.sentence}"</p>
                            <p className="text-on-surface-variant text-sm">{conflict.reason}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
