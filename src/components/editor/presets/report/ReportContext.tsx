import React from 'react';
import { Target } from 'lucide-react';

interface ReportContextProps {
    usedProfiles: {
        authorVoice?: string;
        characterVoices?: string[];
        loreEntries?: string[];
        focusAreas?: string[];
    };
}

export const ReportContext: React.FC<ReportContextProps> = ({ usedProfiles }) => {
    if (!usedProfiles) return null;

    return (
        <div className="p-4 bg-surface-container-highest/10 rounded-lg border border-outline-variant/10 space-y-4">
            <div className="flex items-center gap-2 text-on-surface/60">
                <Target className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Active Context (Source of Truth)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-primary/60 tracking-tighter">Author Voice</span>
                    <p className="text-sm font-bold text-on-surface truncate">
                        {usedProfiles.authorVoice || "None (Respecting Draft)"}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-primary/60 tracking-tighter">Character Voices</span>
                    <p className="text-sm font-bold text-on-surface truncate">
                        {usedProfiles.characterVoices?.length ? usedProfiles.characterVoices.join(', ') : "None"}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-primary/60 tracking-tighter">Lore Profiles</span>
                    <p className="text-sm font-bold text-on-surface truncate">
                        {usedProfiles.loreEntries?.length ? usedProfiles.loreEntries.join(', ') : "None"}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-primary/60 tracking-tighter">Focus Areas</span>
                    <p className="text-sm font-bold text-on-surface truncate">
                        {usedProfiles.focusAreas?.length ? usedProfiles.focusAreas.join(', ') : "None"}
                    </p>
                </div>
            </div>
        </div>
    );
};
