import { getScenes, getChapters, putScene, putChapter } from "../../services/dbService";
import { Scene, Chapter } from "../../types";

/**
 * ManuscriptEngine: Manages structural hierarchies, scene ordering,
 * and chapter organization for the narrative.
 */
export const ManuscriptEngine = {
    async getManuscriptStructure(): Promise<{ scenes: Scene[], chapters: Chapter[] }> {
        const [scenes, chapters] = await Promise.all([
            getScenes(),
            getChapters()
        ]);
        return { scenes, chapters };
    },

    async updateScene(scene: Scene): Promise<void> {
        await putScene(scene);
    },

    async updateChapter(chapter: Chapter): Promise<void> {
        await putChapter(chapter);
    }
};
