import { SEED_DATA } from '../constants/seedData';
import { useLoreStore } from '../stores/useLoreStore';
import { useManuscriptStore } from '../stores/useManuscriptStore';
import * as db from '../services/dbService';

export const useSeedingEngine = () => {
    const importLoreEntries = useLoreStore(state => state.importLoreEntries);
    const importVoiceProfiles = useLoreStore(state => state.importVoiceProfiles);
    const importAuthorVoices = useLoreStore(state => state.importAuthorVoices);
    const setScenes = useManuscriptStore(state => state.setScenes);
    const setChapters = useManuscriptStore(state => state.setChapters);
    
    const seed = async () => {
        console.log('Seeding Application with Crucible Data...');
        
        try {
            // 1. Lore & Voices
            await importLoreEntries(SEED_DATA.lore);
            await importVoiceProfiles(SEED_DATA.voices);
            if (SEED_DATA.authorVoices) {
                await importAuthorVoices(SEED_DATA.authorVoices);
            }
            
            // 2. Manuscript
            await db.setAllChapters(SEED_DATA.manuscript.chapters);
            await db.setAllScenes(SEED_DATA.manuscript.scenes);
            
            // Update store state for immediate UI feedback
            setChapters(SEED_DATA.manuscript.chapters);
            const sceneMetadata = SEED_DATA.manuscript.scenes.map(({ content, ...metadata }) => ({
                ...metadata,
                wordCount: content ? content.trim().split(/\s+/).length : 0
            }));
            setScenes(sceneMetadata);
            
            localStorage.setItem('crucible_seeded', 'true');
            return { success: true };
        } catch (error) {
            console.error('Seeding failed:', error);
            return { success: false, error };
        }
    };

    const scrub = async () => {
        console.log('Scrubbing Application Data...');
        try {
            await db.clearProjectData();
            localStorage.removeItem('crucible_seeded');
            window.location.reload(); // Force reload to ensure all stores are pristine
            return { success: true };
        } catch (error) {
            console.error('Scrubbing failed:', error);
            return { success: false, error };
        }
    };

    return { seed, scrub };
};
