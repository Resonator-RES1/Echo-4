import { useMemo, useEffect } from 'react';
import { useManuscriptStore } from '../stores/useManuscriptStore';
import { useLoreStore } from '../stores/useLoreStore';
import { useTimelineStore } from '../stores/useTimelineStore';
import { TimelineNode } from '../types';
import { calculateAbsoluteDay } from '../utils/calendar';

export const useTimelineData = () => {
    const { scenes } = useManuscriptStore();
    const { loreEntries, voiceProfiles, authorVoices, calendarConfig } = useLoreStore();
    const { events, arcs, fetchTimelineData } = useTimelineStore();

    // Ensure data is loaded
    useEffect(() => {
        fetchTimelineData();
    }, [fetchTimelineData]);

    const timelineNodes = useMemo(() => {
        const nodes: TimelineNode[] = [];

        // Process Scenes
        scenes.forEach(scene => {
            const absoluteDay = calendarConfig?.useCustomCalendar && scene.storyDate 
                ? calculateAbsoluteDay(scene.storyDate, calendarConfig)
                : (scene.storyDay ?? scene.absoluteDay);

            if (absoluteDay !== undefined && absoluteDay !== null) {
                nodes.push({
                    id: `scene-${scene.id}`,
                    type: 'scene',
                    title: scene.title,
                    description: `${scene.wordCount || 0} words`,
                    absoluteDay,
                    storyDate: scene.storyDate,
                    storyDay: scene.storyDay,
                    sceneId: scene.id,
                });
            }
        });

        // Process Manual Timeline Events
        events.forEach(event => {
            if (!event.isActive) return;
            nodes.push({
                id: `event-${event.id}`,
                type: 'event',
                title: event.title,
                description: event.description,
                absoluteDay: event.absoluteDay,
                storyDate: event.storyDate,
                storyDay: event.storyDay,
                eventId: event.id,
                color: event.color,
                icon: event.icon,
                tags: event.tags
            });
        });

        // Process Character Arcs (as Milestones)
        arcs.forEach(arc => {
            if (!arc.isActive) return;
            const characterName = voiceProfiles.find(v => v.id === arc.voiceId)?.name || 'Unknown Character';
            arc.milestones.forEach(m => {
                nodes.push({
                    id: `arc-${arc.id}-m-${m.id}`,
                    type: 'arcMilestone',
                    title: `${characterName}: ${m.title}`,
                    description: m.description,
                    absoluteDay: m.absoluteDay,
                    arcId: arc.id,
                    tags: [arc.voiceId, m.arcStatus]
                });
            });
        });

        // Process Lore
        loreEntries.forEach(lore => {
            const absoluteDay = calendarConfig?.useCustomCalendar && lore.storyDate 
                ? calculateAbsoluteDay(lore.storyDate, calendarConfig)
                : (lore.storyDay ?? lore.absoluteDay);

            if (absoluteDay !== undefined && absoluteDay !== null) {
                const desc = lore.description || '';
                nodes.push({
                    id: `lore-${lore.id}`,
                    type: 'lore',
                    title: lore.title,
                    description: desc.substring(0, 100) + (desc.length > 100 ? '...' : ''),
                    absoluteDay,
                    storyDate: lore.storyDate,
                    storyDay: lore.storyDay,
                    isForeshadowing: lore.isForeshadowing,
                    tags: lore.tags,
                    loreId: lore.id,
                });
            }
        });

        // Process Voices
        voiceProfiles.forEach(voice => {
            const absoluteDay = calendarConfig?.useCustomCalendar && voice.storyDate 
                ? calculateAbsoluteDay(voice.storyDate, calendarConfig)
                : (voice.storyDay ?? voice.absoluteDay);

            if (absoluteDay !== undefined && absoluteDay !== null) {
                nodes.push({
                    id: `voice-${voice.id}`,
                    type: 'voice',
                    title: voice.name,
                    description: voice.coreMotivation,
                    absoluteDay,
                    storyDate: voice.storyDate,
                    storyDay: voice.storyDay,
                    isForeshadowing: voice.isForeshadowing,
                    voiceId: voice.id,
                });
            }
        });

        // Process Author Voices
        authorVoices.forEach(voice => {
            const absoluteDay = calendarConfig?.useCustomCalendar && voice.storyDate 
                ? calculateAbsoluteDay(voice.storyDate, calendarConfig)
                : (voice.storyDay ?? voice.absoluteDay);

            if (absoluteDay !== undefined && absoluteDay !== null) {
                nodes.push({
                    id: `authorVoice-${voice.id}`,
                    type: 'authorVoice',
                    title: voice.name,
                    description: voice.category,
                    absoluteDay,
                    storyDate: voice.storyDate,
                    storyDay: voice.storyDay,
                    isForeshadowing: voice.isForeshadowing,
                    authorVoiceId: voice.id,
                });
            }
        });

        // Sort chronologically
        return nodes.sort((a, b) => a.absoluteDay - b.absoluteDay);
    }, [scenes, events, arcs, loreEntries, voiceProfiles, authorVoices, calendarConfig]);

    const timelessNodes = useMemo(() => {
        const nodes: TimelineNode[] = [];

        // Process Timeless Lore
        loreEntries.forEach(lore => {
            const absoluteDay = calendarConfig?.useCustomCalendar && lore.storyDate 
                ? calculateAbsoluteDay(lore.storyDate, calendarConfig)
                : (lore.storyDay ?? lore.absoluteDay);

            if (absoluteDay === undefined || absoluteDay === null) {
                const desc = lore.description || '';
                nodes.push({
                    id: `lore-${lore.id}`,
                    type: 'lore',
                    title: lore.title,
                    description: desc.substring(0, 100) + (desc.length > 100 ? '...' : ''),
                    absoluteDay: -1, // Placeholder
                    isForeshadowing: lore.isForeshadowing,
                    tags: lore.tags,
                    loreId: lore.id,
                });
            }
        });

        // Process Timeless Voices
        voiceProfiles.forEach(voice => {
            const absoluteDay = calendarConfig?.useCustomCalendar && voice.storyDate 
                ? calculateAbsoluteDay(voice.storyDate, calendarConfig)
                : (voice.storyDay ?? voice.absoluteDay);

            if (absoluteDay === undefined || absoluteDay === null) {
                nodes.push({
                    id: `voice-${voice.id}`,
                    type: 'voice',
                    title: voice.name,
                    description: voice.coreMotivation,
                    absoluteDay: -1,
                    isForeshadowing: voice.isForeshadowing,
                    voiceId: voice.id,
                });
            }
        });

        return nodes;
    }, [loreEntries, voiceProfiles, calendarConfig]);

    return {
        timelineNodes,
        timelessNodes,
        calendarConfig
    };
};
