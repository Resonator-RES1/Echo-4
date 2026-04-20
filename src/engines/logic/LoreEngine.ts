import { 
    getLoreEntries, 
    getVoiceProfiles, 
    getAuthorVoices, 
    getVoiceDNAs, 
    getVoiceSuites, 
    getVoiceCollections,
    getMemoryAxioms
} from "../../services/dbService";
import { LoreEntry, VoiceProfile, AuthorVoice, VoiceDNA, AuthorVoiceSuite, VoiceCollection, MemoryAxiom } from "../../types";

/**
 * LoreEngine: Domain-level manager for narrative context,
 * character voices, and persona profiles.
 */
export const LoreEngine = {
    async getActiveContext(): Promise<{
        lore: LoreEntry[],
        voices: VoiceProfile[],
        authorVoices: AuthorVoice[],
        dnas: VoiceDNA[],
        suites: AuthorVoiceSuite[],
        collections: VoiceCollection[],
        memoryAxioms: MemoryAxiom[]
    }> {
        const [lore, voices, authorVoices, dnas, suites, collections, memoryAxioms] = await Promise.all([
            getLoreEntries(),
            getVoiceProfiles(),
            getAuthorVoices(),
            getVoiceDNAs(),
            getVoiceSuites(),
            getVoiceCollections(),
            getMemoryAxioms()
        ]);

        return {
            lore: lore.filter(l => l.isActive),
            voices: voices.filter(v => v.isActive),
            authorVoices: authorVoices.filter(v => v.isActive),
            dnas,
            suites,
            collections,
            memoryAxioms
        };
    }
};
