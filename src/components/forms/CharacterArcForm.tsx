import React, { useState } from 'react';
import { CharacterArc, ArcMilestone, VoiceProfile } from '../../types';
import { X, Save, Target, Plus, Trash2, User } from 'lucide-react';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { motion, AnimatePresence } from 'motion/react';

interface CharacterArcFormProps {
    arc?: CharacterArc;
    onClose: () => void;
    showToast: (msg: string) => void;
}

export const CharacterArcForm: React.FC<CharacterArcFormProps> = ({ arc, onClose, showToast }) => {
    const { addArc, updateArc } = useTimelineStore();
    const { voiceProfiles } = useLoreStore();
    
    const [voiceId, setVoiceId] = useState(arc?.voiceId || '');
    const [title, setTitle] = useState(arc?.title || '');
    const [description, setDescription] = useState(arc?.description || '');
    const [currentGoal, setCurrentGoal] = useState(arc?.currentGoal || '');
    const [milestones, setMilestones] = useState<ArcMilestone[]>(arc?.milestones || []);

    const addMilestone = () => {
        const newMilestone: ArcMilestone = {
            id: crypto.randomUUID(),
            absoluteDay: 0,
            title: '',
            description: '',
            emotionalState: '',
            arcStatus: 'introduction'
        };
        setMilestones([...milestones, newMilestone]);
    };

    const updateMilestone = (id: string, updates: Partial<ArcMilestone>) => {
        setMilestones(milestones.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const removeMilestone = (id: string) => {
        setMilestones(milestones.filter(m => m.id !== id));
    };

    const handleSave = async () => {
        if (!voiceId) {
            showToast("Please select a character.");
            return;
        }
        if (!title.trim()) {
            showToast("Arc title is required.");
            return;
        }

        const data = {
            voiceId,
            title,
            description,
            currentGoal,
            milestones: [...milestones].sort((a,b) => a.absoluteDay - b.absoluteDay),
            isActive: true
        };

        if (arc) {
            await updateArc(arc.id, data);
            showToast("Character arc updated.");
        } else {
            await addArc(data);
            showToast("Narrative arc established.");
        }
        onClose();
    };

    return (
        <div className="space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-on-surface">{arc ? 'Refine Arc' : 'Define Narrative Arc'}</h2>
                    <p className="text-xs text-on-surface-variant/60 italic">Internal transformations and character progression markers.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Character</label>
                        <select 
                            value={voiceId}
                            onChange={(e) => setVoiceId(e.target.value)}
                            className="w-full bg-surface-container-highest/20 border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Select Character...</option>
                            {voiceProfiles.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Arc Theme</label>
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Descent into Paranoia"
                            className="w-full bg-surface-container-highest/20 border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Current Objective</label>
                    <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <input 
                            value={currentGoal}
                            onChange={(e) => setCurrentGoal(e.target.value)}
                            placeholder="What drives them right now?"
                            className="w-full bg-surface-container-highest/20 border border-outline-variant/20 rounded-xl p-3 pl-11 text-sm focus:border-primary/50 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Progression Milestones</label>
                        <button 
                            onClick={addMilestone}
                            className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:opacity-80 transition-all"
                        >
                            <Plus size={12} /> Add Milestone
                        </button>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {milestones.map((m, idx) => (
                                <motion.div 
                                    key={m.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-surface-container-low/40 border border-outline-variant/10 rounded-2xl p-4 space-y-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-16">
                                            <input 
                                                type="number"
                                                value={m.absoluteDay}
                                                onChange={(e) => updateMilestone(m.id, { absoluteDay: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-white/5 border border-outline-variant/20 rounded-lg p-1.5 text-xs text-center outline-none focus:border-primary/50"
                                            />
                                            <p className="text-[8px] mt-1 text-center uppercase tracking-widest font-bold opacity-40">Day</p>
                                        </div>
                                        <input 
                                            value={m.title}
                                            onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                                            placeholder="Milestone Event Name"
                                            className="flex-1 bg-transparent border-b border-outline-variant/20 pb-1 text-xs font-bold focus:border-primary outline-none"
                                        />
                                        <button 
                                            onClick={() => removeMilestone(m.id)}
                                            className="p-1.5 text-on-surface-variant/30 hover:text-error transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase tracking-widest opacity-40">Emotional State</label>
                                            <input 
                                                value={m.emotionalState}
                                                onChange={(e) => updateMilestone(m.id, { emotionalState: e.target.value })}
                                                placeholder="e.g. Terrified, Stoic"
                                                className="w-full bg-white/5 border border-outline-variant/10 rounded-lg p-2 text-[10px] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase tracking-widest opacity-40">Arc Stage</label>
                                            <select
                                                value={m.arcStatus}
                                                onChange={(e) => updateMilestone(m.id, { arcStatus: e.target.value as any })}
                                                className="w-full bg-white/5 border border-outline-variant/10 rounded-lg p-2 text-[10px] outline-none cursor-pointer"
                                            >
                                                <option value="introduction">Introduction</option>
                                                <option value="development">Development</option>
                                                <option value="climax">Climax</option>
                                                <option value="resolution">Resolution</option>
                                            </select>
                                        </div>
                                    </div>
                                    <textarea 
                                        value={m.description}
                                        onChange={(e) => updateMilestone(m.id, { description: e.target.value })}
                                        placeholder="Internal shift details..."
                                        rows={2}
                                        className="w-full bg-white/5 border border-outline-variant/10 rounded-lg p-2 text-[10px] outline-none resize-none"
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {milestones.length === 0 && (
                            <div className="py-8 text-center border-2 border-dashed border-outline-variant/10 rounded-2xl opacity-40">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No milestones defined.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/10 flex justify-end gap-3 sticky bottom-0 bg-surface-container-lowest/80 backdrop-blur-md pb-4">
                <button 
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl border border-outline-variant/20 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                    Discard
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-3 rounded-xl bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                    <Save size={14} />
                    {arc ? 'Save Refinement' : 'Establish Arc'}
                </button>
            </div>
        </div>
    );
};
