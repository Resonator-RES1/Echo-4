import React, { useState } from 'react';
import { TimelineEvent, StoryDate } from '../../types';
import { X, Save, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StoryDateSelector } from './StoryDateSelector';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useLoreStore } from '../../stores/useLoreStore';

interface TimelineEventFormProps {
    event?: TimelineEvent;
    onClose: () => void;
    showToast: (msg: string) => void;
}

export const TimelineEventForm: React.FC<TimelineEventFormProps> = ({ event, onClose, showToast }) => {
    const { addEvent, updateEvent } = useTimelineStore();
    const { calendarConfig } = useLoreStore();
    
    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [absoluteDay, setAbsoluteDay] = useState(event?.absoluteDay || 0);
    const [importance, setImportance] = useState<TimelineEvent['importance']>(event?.importance || 'background');
    const [storyDate, setStoryDate] = useState<StoryDate | undefined>(event?.storyDate);

    const handleSave = async () => {
        if (!title.trim()) {
            showToast("Event title is required.");
            return;
        }

        const data = {
            title,
            description,
            absoluteDay,
            importance,
            storyDate,
            isActive: true
        };

        if (event) {
            await updateEvent(event.id, data);
            showToast("Event updated.");
        } else {
            await addEvent(data);
            showToast("New event recorded to the spine.");
        }
        onClose();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-on-surface">{event ? 'Edit Event' : 'New Timeline Event'}</h2>
                    <p className="text-xs text-on-surface-variant/60 italic">Immutable markers in the linear flow of history.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Event Title</label>
                    <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. The Siege of Al-Qahir"
                        className="w-full bg-surface-container-highest/20 border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Temporal Anchor</label>
                        <StoryDateSelector 
                            value={storyDate}
                            onChange={(date) => setStoryDate(date)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Importance</label>
                        <div className="flex bg-surface-container-highest/20 p-1 rounded-xl border border-outline-variant/20">
                            {(['background', 'major', 'catastrophic'] as const).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setImportance(level)}
                                    className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                        importance === level ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant/40 hover:text-on-surface'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60">Description / Outcome</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the historical impact..."
                        rows={4}
                        className="w-full bg-surface-container-highest/20 border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary/50 outline-none transition-all resize-none"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/10 flex justify-end gap-3">
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
                    {event ? 'Update Marker' : 'Commit to Spine'}
                </button>
            </div>
        </div>
    );
};
