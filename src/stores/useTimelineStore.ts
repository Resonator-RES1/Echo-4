import { create } from 'zustand';
import { TimelineEvent, CharacterArc, StoryDate } from '../types';
import * as db from '../services/dbService';

interface TimelineState {
    events: TimelineEvent[];
    arcs: CharacterArc[];
    isLoading: boolean;
    
    // Actions
    fetchTimelineData: () => Promise<void>;
    addEvent: (event: Omit<TimelineEvent, 'id' | 'lastModified'>) => Promise<string>;
    updateEvent: (id: string, updates: Partial<TimelineEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    
    addArc: (arc: Omit<CharacterArc, 'id' | 'lastModified'>) => Promise<string>;
    updateArc: (id: string, updates: Partial<CharacterArc>) => Promise<void>;
    deleteArc: (id: string) => Promise<void>;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
    events: [],
    arcs: [],
    isLoading: false,

    fetchTimelineData: async () => {
        set({ isLoading: true });
        try {
            const [events, arcs] = await Promise.all([
                db.getTimelineEvents(),
                db.getCharacterArcs()
            ]);
            set({ events, arcs });
        } catch (error) {
            console.error("Failed to fetch timeline data", error);
        } finally {
            set({ isLoading: false });
        }
    },

    addEvent: async (eventData) => {
        const id = crypto.randomUUID();
        const newEvent: TimelineEvent = {
            ...eventData,
            id,
            lastModified: new Date().toISOString()
        };
        await db.putTimelineEvent(newEvent);
        set(state => ({ events: [...state.events, newEvent].sort((a,b) => a.absoluteDay - b.absoluteDay) }));
        return id;
    },

    updateEvent: async (id, updates) => {
        const event = get().events.find(e => e.id === id);
        if (!event) return;

        const updatedEvent: TimelineEvent = {
            ...event,
            ...updates,
            lastModified: new Date().toISOString()
        };
        await db.putTimelineEvent(updatedEvent);
        set(state => ({
            events: state.events
                .map(e => e.id === id ? updatedEvent : e)
                .sort((a,b) => a.absoluteDay - b.absoluteDay)
        }));
    },

    deleteEvent: async (id) => {
        await db.deleteTimelineEvent(id);
        set(state => ({ events: state.events.filter(e => e.id !== id) }));
    },

    addArc: async (arcData) => {
        const id = crypto.randomUUID();
        const newArc: CharacterArc = {
            ...arcData,
            id,
            lastModified: new Date().toISOString()
        };
        await db.putCharacterArc(newArc);
        set(state => ({ arcs: [...state.arcs, newArc] }));
        return id;
    },

    updateArc: async (id, updates) => {
        const arc = get().arcs.find(a => a.id === id);
        if (!arc) return;

        const updatedArc: CharacterArc = {
            ...arc,
            ...updates,
            lastModified: new Date().toISOString()
        };
        await db.putCharacterArc(updatedArc);
        set(state => ({
            arcs: state.arcs.map(a => a.id === id ? updatedArc : a)
        }));
    },

    deleteArc: async (id) => {
        await db.deleteCharacterArc(id);
        set(state => ({ arcs: state.arcs.filter(a => a.id !== id) }));
    }
}));
