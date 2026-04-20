import React, { useState } from 'react';
import { AuthorVoice } from '../../../types';
import { Library, PlusCircle, CheckCircle2, Sparkles, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthorVoiceForm } from '../../forms/AuthorVoiceForm';

interface AuthorVoiceManagerProps {
    authorVoices: AuthorVoice[];
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    onDeleteAuthorVoice: (id: string) => void;
}

export const AuthorVoiceManager: React.FC<AuthorVoiceManagerProps> = React.memo(({ 
    authorVoices, onAddAuthorVoice, onDeleteAuthorVoice
}) => {
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingVoice, setEditingVoice] = useState<AuthorVoice | undefined>(undefined);
    
    const activeVoice = authorVoices.find(v => v.isActive);

    const handleSetActive = (id: string) => {
        const voice = authorVoices.find(v => v.id === id);
        if (voice) {
            onAddAuthorVoice({ ...voice, isActive: true });
            setSelectedLibraryId('');
        }
    };

    const handleSaveVoice = (voice: AuthorVoice) => {
        onAddAuthorVoice(voice);
        setIsCreating(false);
        setEditingVoice(undefined);
    };

    return (
        <div className="pt-6 border-t border-white/10 space-y-6 relative z-10">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-black text-[9px] uppercase tracking-wider text-on-surface/40">
                    <Library className="w-4 h-4 text-primary"/> Author Voice
                </label>
                <div className="flex items-center gap-2">
                    {activeVoice && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-primary-glow">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-primary text-[9px] font-black tracking-widest uppercase">ACTIVE</span>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                        title="New Author Voice"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            
            {activeVoice ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-white/5 border border-primary/30 rounded-xl flex items-center justify-between shadow-2xl relative overflow-hidden group/active"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-4 overflow-hidden relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-inner group-hover/active:scale-105 transition-transform">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-base font-black text-on-surface truncate tracking-tight group-hover/active:text-primary transition-colors">
                                {activeVoice.name}
                            </span>
                            <span className="text-[9px] text-on-surface-variant/40 uppercase font-black tracking-wider">
                                Primary Narrative Style
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        <button 
                            onClick={() => setEditingVoice(activeVoice)}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all active:scale-90"
                            title="Edit Voice"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onAddAuthorVoice({ ...activeVoice, isActive: false })}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/40 hover:text-error hover:bg-error/10 hover:border-error/20 transition-all active:scale-90"
                            title="Deactivate"
                        >
                            <PlusCircle className="w-5 h-5 rotate-45" />
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="p-5 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-center space-y-3 group/empty hover:border-primary/20 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mx-auto group-hover/empty:scale-110 group-hover/empty:bg-primary/5 transition-all">
                        <Sparkles className="w-6 h-6 text-on-surface-variant/20 group-hover/empty:text-primary/40 transition-colors" />
                    </div>
                    <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest leading-relaxed">No active author voice.<br/>Select a library entry to ground prose style.</p>
                </div>
            )}

            <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-2">
                    <div className="relative group/select flex-1">
                        <select 
                            value={selectedLibraryId}
                            onChange={(e) => setSelectedLibraryId(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-sm text-on-surface focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all font-bold appearance-none pr-12 shadow-inner"
                        >
                            <option value="" className="bg-surface-container-highest text-on-surface">-- Switch author voice --</option>
                            {authorVoices.map(v => (
                                <option key={v.id} value={v.id} className="bg-surface-container-highest text-on-surface">{v.name} {v.isActive ? '(Active)' : ''}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/20 group-focus-within/select:text-primary transition-colors">
                            <PlusCircle className="w-5 h-5" />
                        </div>
                    </div>
                    {selectedLibraryId && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setEditingVoice(authorVoices.find(v => v.id === selectedLibraryId))}
                                className="p-4 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 transition-all"
                                title="Edit Selected Voice"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => onDeleteAuthorVoice(selectedLibraryId)}
                                className="p-4 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all"
                                title="Delete Selected Voice"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => handleSetActive(selectedLibraryId)}
                    disabled={!selectedLibraryId || authorVoices.find(v => v.id === selectedLibraryId)?.isActive}
                    className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-surface font-black uppercase tracking-wider text-[9px] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <PlusCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    <span>Set Active Voice</span>
                </button>
            </div>
            <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5">
                <p className="text-[9px] text-on-surface-variant/40 italic font-black uppercase tracking-widest leading-relaxed">
                    The active author voice guides Echo's narrative style and prose structure.
                </p>
            </div>

            <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-4 border border-dashed border-white/10 rounded-lg text-[9px] font-black text-on-surface/40 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all uppercase tracking-wider group/create"
            >
                <span className="group-hover:scale-110 transition-transform inline-block">+ Create New Author Voice</span>
            </button>

            <AnimatePresence>
                {(isCreating || editingVoice) && (
                    <AuthorVoiceForm 
                        onClose={() => {
                            setIsCreating(false);
                            setEditingVoice(undefined);
                        }}
                        onSave={handleSaveVoice}
                        initialData={editingVoice}
                        isModal={true}
                    />
                )}
            </AnimatePresence>
        </div>
    );
});
