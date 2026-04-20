import { getActiveTimelineEvents, getCharacterArcs } from "../../services/dbService";
import { TimelineEvent, CharacterArc } from "../../types";

/**
 * TimelineEngine: Manages chronological events, timeline dependencies, 
 * and character arc progression.
 */
export const TimelineEngine = {
    async getTimelineContext(currentAbsoluteDay: number): Promise<{
        activeEvents: TimelineEvent[],
        characterArcs: CharacterArc[]
    }> {
        const [events, arcs] = await Promise.all([
            getActiveTimelineEvents(),
            getCharacterArcs()
        ]);

        return {
            activeEvents: events.filter(e => e.absoluteDay <= currentAbsoluteDay || e.importance === 'catastrophic'),
            characterArcs: arcs.filter(arc => arc.isActive)
        };
    }
};
