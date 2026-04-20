import React, { useState } from 'react';
import { AuthorVoiceSuite, AuthorVoice, VoiceDNA } from '../../../types';
import { Library, CheckCircle2, Sparkles, Layout, Mic2, Eye, Zap, Clock, PenTool, Sparkle, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthorialContextManagerProps {
    voiceSuites: AuthorVoiceSuite[];
    authorVoices: AuthorVoice[];
    voiceDNAs: VoiceDNA[];
    onSetActiveContext: (type: 'suite' | 'voice', id: string) => void;
    onDeleteVoiceSuite: (id: string) => void;
    onDeleteAuthorVoice: (id: string) => void;
}

export const AuthorialContextManager: React.FC<AuthorialContextManagerProps> = React.memo(({ 
    voiceSuites, authorVoices, voiceDNAs, onSetActiveContext, onDeleteVoiceSuite, onDeleteAuthorVoice
}) => {
    const [selectedContextId, setSelectedContextId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'suite' | 'voice'>('suite');
    const activeSuite = voiceSuites.find(s => s.isActive);
    const activeVoice = authorVoices.find(v => v.isActive);
    
    const hasActiveContext = activeSuite || activeVoice;

    const handleSetActive = (id: string) => {
        if (id) {
            // Determine if it's a suite or voice
            const isSuite = voiceSuites.some(s => s.id === id);
            onSetActiveContext(isSuite ? 'suite' : 'voice', id);
            setSelectedContextId('');
        }
    };

    const handleDeactivate = () => {
        onSetActiveContext('suite', ''); // Deactivates current context
    };

    const handleDelete = (id: string) => {
        if (!id) return;
        const isSuite = voiceSuites.some(s => s.id === id);
        if (isSuite) {
            onDeleteVoiceSuite(id);
        } else {
            onDeleteAuthorVoice(id);
        }
        setSelectedContextId('');
    };

    const getVoiceName = (id?: string) => {
        if (!id) return 'Default';
        return voiceDNAs.find(v => v.id === id)?.name || authorVoices.find(v => v.id === id)?.name || 'Unknown Voice';
    };

    const showActiveSuite = viewMode === 'suite' && activeSuite;
    const showActiveVoice = viewMode === 'voice' && activeVoice;

    return (
        <div className="pt-6 border-t border-white/10 space-y-6 relative z-10">
            <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-wider text-on-surface/40">
                    <Layout className="w-3.5 h-3.5 text-primary"/> Authorial Context
                </label>
                {hasActiveContext && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 shadow-primary-glow">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        <span className="text-primary text-[8px] font-bold tracking-widest uppercase">ACTIVE CONTEXT</span>
                    </div>
                )}
            </div>
            
            {showActiveSuite ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <div className="p-4 bg-white/5 border border-primary/30 rounded-xl flex items-center justify-between shadow-2xl relative overflow-hidden group/active">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <div className="flex items-center gap-3 overflow-hidden relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-inner group-hover/active:scale-105 transition-transform">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-on-surface truncate tracking-tight group-hover/active:text-primary transition-colors">
                                    {activeSuite.name}
                                </span>
                                <span className="text-[8px] text-on-surface-variant/40 uppercase font-bold tracking-wider">
                                    Orchestrated Persona Suite
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={handleDeactivate}
                            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/40 hover:text-accent-rose hover:bg-accent-rose/10 hover:border-accent-rose/20 transition-all active:scale-90 relative z-10"
                            title="Deactivate Suite"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Modality HUD */}
                    <div className="grid grid-cols-2 gap-2">
                        <ModalityBadge icon={Mic2} label="Narrator" value={getVoiceName(activeSuite.modalities.narrator)} />
                        <ModalityBadge icon={Eye} label="Lens" value={getVoiceName(activeSuite.modalities.lens)} />
                        <ModalityBadge icon={Zap} label="Rhythm" value={getVoiceName(activeSuite.modalities.rhythm)} />
                        <ModalityBadge icon={Clock} label="Temporal" value={getVoiceName(activeSuite.modalities.temporal)} />
                        <ModalityBadge icon={PenTool} label="Lexicon" value={getVoiceName(activeSuite.modalities.lexicon)} />
                        <ModalityBadge icon={Sparkle} label="Atmosphere" value={getVoiceName(activeSuite.modalities.atmosphere)} />
                    </div>
                </motion.div>
            ) : showActiveVoice ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <div className="p-4 bg-white/5 border border-primary/30 rounded-xl flex items-center justify-between shadow-2xl relative overflow-hidden group/active">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <div className="flex items-center gap-3 overflow-hidden relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-inner group-hover/active:scale-105 transition-transform">
                                <PenTool className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-on-surface truncate tracking-tight group-hover/active:text-primary transition-colors">
                                    {activeVoice.name}
                                </span>
                                <span className="text-[8px] text-on-surface-variant/40 uppercase font-bold tracking-wider">
                                    Standalone Stylistic Persona
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={handleDeactivate}
                            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/40 hover:text-accent-rose hover:bg-accent-rose/10 hover:border-accent-rose/20 transition-all active:scale-90 relative z-10"
                            title="Deactivate Voice"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-center space-y-2 group/empty hover:border-primary/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto group-hover/empty:scale-110 group-hover/empty:bg-primary/5 transition-all">
                        <Sparkles className="w-5 h-5 text-on-surface-variant/20 group-hover/empty:text-primary/40 transition-colors" />
                    </div>
                    <p className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-wider leading-relaxed">
                        {viewMode === 'suite' ? 'No active persona suite.' : 'No active standalone voice.'}
                        <br/>Select one below to unify authorial intent.
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-3 w-full">
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => {
                            setViewMode('suite');
                            setSelectedContextId('');
                        }}
                        className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${viewMode === 'suite' ? 'bg-primary text-surface shadow-lg' : 'text-on-surface-variant/40 hover:text-on-surface'}`}
                    >
                        Persona Suites
                    </button>
                    <button
                        onClick={() => {
                            setViewMode('voice');
                            setSelectedContextId('');
                        }}
                        className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${viewMode === 'voice' ? 'bg-primary text-surface shadow-lg' : 'text-on-surface-variant/40 hover:text-on-surface'}`}
                    >
                        Standalone Voices
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group/select flex-1">
                        <select 
                            value={selectedContextId}
                            onChange={(e) => setSelectedContextId(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-on-surface focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all font-bold appearance-none pr-10 shadow-inner"
                        >
                            <option value="" className="bg-surface-container-highest text-on-surface">
                                -- {viewMode === 'suite' ? 'Select Persona Suite' : 'Select Standalone Voice'} --
                            </option>
                            {viewMode === 'suite' ? (
                                voiceSuites.map(s => (
                                    <option key={s.id} value={s.id} className="bg-surface-container-highest text-on-surface">{s.name} {s.isActive ? '(Active)' : ''}</option>
                                ))
                            ) : (
                                authorVoices.map(v => (
                                    <option key={v.id} value={v.id} className="bg-surface-container-highest text-on-surface">{v.name} {v.isActive ? '(Active)' : ''}</option>
                                ))
                            )}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/20 group-focus-within/select:text-primary transition-colors">
                            <Layout className="w-4 h-4" />
                        </div>
                    </div>
                    {selectedContextId && (
                        <button 
                            onClick={() => handleDelete(selectedContextId)}
                            className="p-3 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all"
                            title="Delete Selected"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button 
                    onClick={() => handleSetActive(selectedContextId)}
                    disabled={!selectedContextId || (viewMode === 'suite' ? voiceSuites.find(s => s.id === selectedContextId)?.isActive : authorVoices.find(v => v.id === selectedContextId)?.isActive)}
                    className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-surface font-bold uppercase tracking-wider text-[9px] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span>Activate {viewMode === 'suite' ? 'Suite' : 'Voice'}</span>
                </button>
            </div>
        </div>
    );
});

const ModalityBadge = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/5 rounded-xl">
        <Icon className="w-3 h-3 text-primary/40" />
        <div className="flex flex-col min-w-0">
            <span className="text-[7px] uppercase tracking-widest text-on-surface-variant/40 font-black leading-none mb-0.5">{label}</span>
            <span className="text-[9px] font-bold text-on-surface truncate leading-none">{value}</span>
        </div>
    </div>
);
