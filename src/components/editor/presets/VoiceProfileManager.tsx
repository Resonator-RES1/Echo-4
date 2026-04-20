import React, { useState } from 'react';
import { VoiceProfile } from '../../../types';
import { Users, PlusCircle, X, Sparkles, Plus, Trash2 } from 'lucide-react';
import { GenderIcon } from '../../GenderIcon';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceProfileForm } from '../../forms/VoiceProfileForm';

interface VoiceProfileManagerProps {
    voiceProfiles: VoiceProfile[];
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    onDeleteVoiceProfile: (id: string) => void;
}

export const VoiceProfileManager: React.FC<VoiceProfileManagerProps> = React.memo(({ 
    voiceProfiles, onAddVoiceProfile, onDeleteVoiceProfile
}) => {
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const activeProfiles = voiceProfiles.filter(p => p.isActive);

    const handleToggleActive = (id: string) => {
        const profile = voiceProfiles.find(p => p.id === id);
        if (profile) {
            onAddVoiceProfile({ ...profile, isActive: !profile.isActive });
            setSelectedProfileId('');
        }
    };

    return (
        <div className="pt-6 border-t border-white/10 space-y-6 relative z-10">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-wider text-on-surface/40">
                    <Users className="w-3.5 h-3.5 text-accent-indigo"/> Character Voices
                </label>
                {activeProfiles.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-indigo/10 border border-accent-indigo/20 shadow-accent-indigo-glow">
                        <div className="w-1 h-1 rounded-full bg-accent-indigo animate-pulse" />
                        <span className="text-accent-indigo text-[8px] font-bold tracking-widest uppercase">{activeProfiles.length} ACTIVE</span>
                    </div>
                )}
            </div>
            
            <div className="min-h-[120px]">
                <AnimatePresence mode="popLayout">
                    {activeProfiles.length > 0 ? (
                        <div className="space-y-3">
                            {activeProfiles.map(profile => (
                                <motion.div 
                                    key={profile.id} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-3 bg-white/5 border border-accent-indigo/30 rounded-lg flex items-center justify-between shadow-xl group/profile relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-accent-indigo/5 to-transparent pointer-events-none" />
                                    <div className="flex items-center gap-3 overflow-hidden relative z-10">
                                        <div className="w-8 h-8 rounded-md bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center flex-shrink-0 group-hover/profile:scale-110 transition-transform">
                                            <GenderIcon gender={profile.gender} size="sm" />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs font-bold text-on-surface truncate tracking-tight group-hover/profile:text-accent-indigo transition-colors">
                                                {profile.name}
                                            </span>
                                            <span className="text-[8px] text-on-surface-variant/40 uppercase font-bold tracking-wider">
                                                {profile.archetype || 'Active Resonance'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 relative z-10">
                                        <button 
                                            onClick={() => handleToggleActive(profile.id)}
                                            className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/40 hover:text-accent-rose hover:bg-accent-rose/10 hover:border-accent-rose/20 transition-all active:scale-90"
                                            title="Deactivate voice"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteVoiceProfile(profile.id)}
                                            className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/40 hover:text-error hover:bg-error/10 hover:border-error/20 transition-all active:scale-90"
                                            title="Delete profile from library"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-center space-y-2 group/empty hover:border-accent-indigo/20 transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto group-hover/empty:scale-110 group-hover/empty:bg-accent-indigo/5 transition-all">
                                <Sparkles className="w-5 h-5 text-on-surface-variant/20 group-hover/empty:text-accent-indigo/40 transition-colors" />
                            </div>
                            <p className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-wider leading-relaxed">No active character voices.<br/>Select a profile below to ground dialogue.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2">
                    <div className="relative group/select flex-1">
                        <select 
                            value={selectedProfileId}
                            onChange={(e) => setSelectedProfileId(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-on-surface focus:ring-4 focus:ring-accent-indigo/10 focus:border-accent-indigo/50 transition-all font-bold appearance-none pr-10 shadow-inner"
                        >
                            <option value="" className="bg-surface-container-highest text-on-surface">-- Add character voice --</option>
                            {voiceProfiles.map(p => (
                                <option key={p.id} value={p.id} disabled={p.isActive} className="bg-surface-container-highest text-on-surface">{p.name} {p.isActive ? '(Active)' : ''}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/20 group-focus-within/select:text-accent-indigo transition-colors">
                            <PlusCircle className="w-4 h-4" />
                        </div>
                    </div>
                    {selectedProfileId && (
                        <button 
                            onClick={() => {
                                onDeleteVoiceProfile(selectedProfileId);
                                setSelectedProfileId('');
                            }}
                            className="p-3 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all"
                            title="Delete Profile"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button 
                    onClick={() => handleToggleActive(selectedProfileId)}
                    disabled={!selectedProfileId}
                    className="w-full py-3 bg-accent-indigo hover:bg-accent-indigo/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-surface font-bold uppercase tracking-wider text-[9px] shadow-2xl shadow-accent-indigo/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <PlusCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span>Activate Resonance</span>
                </button>
            </div>
            <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                <p className="text-[8px] text-on-surface-variant/40 italic font-bold uppercase tracking-wider leading-relaxed">
                    Active character voices ensure dialogue and behavior remain consistent with their established profiles.
                </p>
            </div>

            <button 
                onClick={() => setIsFormOpen(true)}
                className="w-full py-3 border border-dashed border-white/10 rounded-lg text-[9px] font-bold text-on-surface/40 hover:text-accent-indigo hover:bg-accent-indigo/5 hover:border-accent-indigo/20 transition-all uppercase tracking-wider group/create"
            >
                <span className="group-hover:scale-110 transition-transform inline-block">+ Create New Character Profile</span>
            </button>

            {isFormOpen && (
                <VoiceProfileForm 
                    onClose={() => setIsFormOpen(false)}
                    onSave={(profile) => {
                        onAddVoiceProfile(profile);
                        setIsFormOpen(false);
                    }}
                />
            )}
        </div>
    );
});
