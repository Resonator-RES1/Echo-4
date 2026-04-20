import { LoreEntry, VoiceProfile } from "../../types";

/**
 * TriageEngine: Performs rapid, low-cost scanning to identify 
 * initially relevant context anchors.
 */
export const TriageEngine = {
    scanForAnchors(text: string, loreEntries: LoreEntry[], voiceProfiles: VoiceProfile[]): string[] {
        if (!text.trim()) return [];
        
        const detectedIds: string[] = [];

        // Strict regex matching to prevent partial word collisions
        loreEntries.forEach(entry => {
            const terms = [entry.title, ...(entry.aliases || [])];
            const found = terms.some(term => {
                const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
                return regex.test(text);
            });
            if (found) detectedIds.push(entry.id);
        });

        voiceProfiles.forEach(voice => {
            const terms = [voice.name, ...(voice.aliases || [])];
            const found = terms.some(term => {
                const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
                return regex.test(text);
            });
            if (found) detectedIds.push(voice.id);
        });

        return detectedIds;
    }
};
