import * as db from '../services/dbService';
import { useManuscriptStore } from '../stores/useManuscriptStore';

export const reconcileManuscriptState = async () => {
    const { scenes, chapters, setScenes, setChapters } = useManuscriptStore.getState();
    
    const dbScenes = await db.getScenes();
    const dbChapters = await db.getChapters();
    
    let needsUpdate = false;
    
    // Simple reconciliation: if DB has more or different data, update the store.
    // In a more complex app, we might need a more sophisticated merge strategy.
    if (dbScenes.length !== scenes.length || dbChapters.length !== chapters.length) {
        needsUpdate = true;
    }
    
    if (needsUpdate) {
        console.warn("State mismatch detected, reconciling...");
        setScenes(dbScenes.map(s => ({ ...s, wordCount: s.content ? s.content.trim().split(/\s+/).length : 0 })));
        setChapters(dbChapters);
    }
};
