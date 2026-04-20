import { getAllSettings, putSetting } from "../../services/dbService";

/**
 * ConfigEngine: Manages user presets, generation parameters,
 * and refinement focus area configurations.
 */
export const ConfigEngine = {
    async getRefinementParameters(): Promise<Record<string, any>> {
        return await getAllSettings();
    },

    async updateParameter(key: string, value: any): Promise<void> {
        await putSetting(key, value);
    }
};
