import { getEchoes } from "../../services/dbService";
import { RefinedVersion } from "../../types";

/**
 * ReportEngine: Manages historical refinement reports, logs,
 * and analysis metrics for the user interface.
 */
export const ReportEngine = {
    async getRefinementHistory(): Promise<RefinedVersion[]> {
        return await getEchoes();
    }
};
