import { getEchoes, getSnapshots } from "../../services/dbService";
import { RefinedVersion, SurgicalSnapshot } from "../../types";

/**
 * LedgerEngine: Central manager for the immutable audit journal.
 * Normalizes refinement logs, internal critique, and surgical manifests.
 */
export const LedgerEngine = {
    async getFullNarrativeJournal(sceneId?: string): Promise<{ 
        refinementLogs: RefinedVersion[], 
        surgicalHistory: SurgicalSnapshot[] 
    }> {
        const [refinementLogs, surgicalHistory] = await Promise.all([
            getEchoes(),
            sceneId ? getSnapshots(sceneId) : Promise.resolve([])
        ]);

        return {
            refinementLogs: sceneId 
                ? refinementLogs.filter(e => e.sceneId === sceneId)
                : refinementLogs,
            surgicalHistory
        };
    },

    /**
     * Retrieves the singular history for a scene.
     */
    async getSceneHistory(sceneId: string): Promise<{
        refinementLogs: RefinedVersion[],
        surgicalHistory: SurgicalSnapshot[]
    }> {
        if (!sceneId) {
            return { refinementLogs: [], surgicalHistory: [] };
        }
        const logs = await getEchoes();
        const snapshots = await getSnapshots(sceneId);
        
        return {
            refinementLogs: logs.filter(l => l.sceneId === sceneId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            surgicalHistory: snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        };
    }
};
