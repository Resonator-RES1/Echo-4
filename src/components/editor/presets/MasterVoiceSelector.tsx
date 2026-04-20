import React from 'react';
import { MasterVoice } from '../../../types';
import { Globe, PlusCircle, CheckCircle2 } from 'lucide-react';

interface MasterVoiceSelectorProps {
    masterVoices: MasterVoice[];
    onUpdateMasterVoice: (voice: MasterVoice) => void;
    onAddMasterVoice: (voice: MasterVoice) => void;
}

export const MasterVoiceSelector: React.FC<MasterVoiceSelectorProps> = ({ 
    masterVoices, onUpdateMasterVoice, onAddMasterVoice 
}) => {
    const activeVoice = masterVoices.find(v => v.isActive);

    const handleToggleActive = (id: string) => {
        const voice = masterVoices.find(v => v.id === id);
        if (voice) {
            onUpdateMasterVoice({ ...voice, isActive: !voice.isActive });
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5"/> Master Narrative Voice
                </label>
            </div>

            <div className="space-y-2">
                {masterVoices.length === 0 ? (
                    <div className="text-xs text-on-surface-variant italic p-3 bg-surface-container-highest/10 rounded-[0.75rem] border border-dashed border-outline-variant/30">
                        No master voices defined. Add one in the Voices panel.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {masterVoices.map(voice => (
                            <button
                                key={voice.id}
                                onClick={() => handleToggleActive(voice.id)}
                                className={`flex items-center justify-between p-3 rounded-[0.75rem] border transition-all text-left ${
                                    voice.isActive 
                                        ? 'bg-primary/10 border-primary shadow-sm' 
                                        : 'bg-surface-container-highest/30 border-outline-variant/20 hover:border-outline-variant/40'
                                }`}
                            >
                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                    <span className={`text-sm font-headline truncate ${voice.isActive ? 'text-primary font-bold' : 'text-on-surface'}`}>
                                        {voice.name}
                                    </span>
                                    <span className="text-[9px] text-on-surface-variant truncate uppercase tracking-tighter">
                                        {voice.narrativeStyle}
                                    </span>
                                </div>
                                {voice.isActive && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
