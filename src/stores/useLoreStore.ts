import { create } from 'zustand';
import { LoreEntry, VoiceProfile, AuthorVoice, LoreCategory, VoiceCollection, VoiceDNA, AuthorVoiceSuite, CalendarConfig, StoryDate } from '../types';
import * as db from '../services/dbService';

import { calculateAbsoluteDay } from '../utils/calendar';

const DEFAULT_CALENDAR: CalendarConfig = {
  months: [
    { name: 'January', days: 31 },
    { name: 'February', days: 28 },
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 }
  ],
  useCustomCalendar: true,
  daysPerWeek: 7,
  eraName: 'A.D.',
  epochAnchor: 'The start of the Gregorian era.'
};

const DEFAULT_CATEGORIES: LoreCategory[] = [
  { id: 'cat-mythos', name: 'Mythos & Arcana', color: 'bg-indigo-500', icon: 'zap' },
  { id: 'cat-world', name: 'Cosmology & Geography', color: 'bg-emerald-500', icon: 'globe' },
  { id: 'cat-factions', name: 'Societies & Factions', color: 'bg-rose-500', icon: 'users' },
  { id: 'cat-history', name: 'Chronology & Legacies', color: 'bg-amber-500', icon: 'history' },
  { id: 'cat-relics', name: 'Relics & Artifacts', color: 'bg-cyan-500', icon: 'gem' },
  { id: 'cat-nature', name: 'Flora & Fauna', color: 'bg-lime-500', icon: 'leaf' },
  { id: 'cat-characters', name: 'Prime Personas', color: 'bg-purple-500', icon: 'user' },
  { id: 'cat-other', name: 'Untethered Lore', color: 'bg-slate-500', icon: 'more-horizontal' }
];

const DEFAULT_COLLECTIONS: VoiceCollection[] = [
  { id: 'col-1', name: 'Main Cast', type: 'character' },
  { id: 'col-2', name: 'Secondary', type: 'character' },
  { id: 'col-other', name: 'Other', type: 'character' },
  { id: 'col-3', name: 'Narrators', type: 'author' }
];

interface LoreState {
  loreEntries: LoreEntry[];
  loreCategories: LoreCategory[];
  voiceProfiles: VoiceProfile[];
  voiceCollections: VoiceCollection[];
  authorVoices: AuthorVoice[];
  voiceDNAs: VoiceDNA[];
  voiceSuites: AuthorVoiceSuite[];
  calendarConfig: CalendarConfig;
  isLoaded: boolean;
  
  loadData: () => Promise<void>;
  
  // Calendar
  setCalendarConfig: (config: CalendarConfig) => Promise<void>;

  // Lore
  addLoreEntry: (entry: LoreEntry) => Promise<void>;
  deleteLoreEntry: (id: string) => Promise<void>;
  addLoreCategory: (category: LoreCategory) => Promise<void>;
  deleteLoreCategory: (id: string) => Promise<void>;
  
  // Voices
  addVoiceProfile: (profile: VoiceProfile) => Promise<void>;
  deleteVoiceProfile: (id: string) => Promise<void>;
  addAuthorVoice: (voice: AuthorVoice) => Promise<void>;
  deleteAuthorVoice: (id: string) => Promise<void>;
  addVoiceCollection: (collection: VoiceCollection) => Promise<void>;
  deleteVoiceCollection: (id: string) => Promise<void>;
  
  // Voice DNA & Suites
  addVoiceDNA: (dna: VoiceDNA) => Promise<void>;
  deleteVoiceDNA: (id: string) => Promise<void>;
  addVoiceSuite: (suite: AuthorVoiceSuite) => Promise<void>;
  deleteVoiceSuite: (id: string) => Promise<void>;
  setActiveSuite: (id: string) => Promise<void>;
  setActiveAuthorContext: (type: 'suite' | 'voice', id: string) => Promise<void>;

  // Imports
  importLoreEntries: (entries: LoreEntry[]) => Promise<void>;
  importVoiceProfiles: (profiles: VoiceProfile[]) => Promise<void>;
  importAuthorVoices: (voices: AuthorVoice[]) => Promise<void>;
  importVoiceDNAs: (dnas: VoiceDNA[]) => Promise<void>;
  importVoiceSuites: (suites: AuthorVoiceSuite[]) => Promise<void>;
  
  // Paginated Loading
  loadLoreEntriesPaged: (offset: number, limit: number) => Promise<{ entries: LoreEntry[], hasMore: boolean }>;
  loadVoiceProfilesPaged: (offset: number, limit: number) => Promise<{ profiles: VoiceProfile[], hasMore: boolean }>;
}

export const useLoreStore = create<LoreState>((set, get) => ({
  loreEntries: [],
  loreCategories: [],
  voiceProfiles: [],
  voiceCollections: [],
  authorVoices: [],
  voiceDNAs: [],
  voiceSuites: [],
  calendarConfig: DEFAULT_CALENDAR,
  isLoaded: false,

  loadLoreEntriesPaged: async (offset, limit) => {
    const result = await db.getLoreEntriesPaged(offset, limit);
    return result;
  },

  loadVoiceProfilesPaged: async (offset, limit) => {
    const result = await db.getVoiceProfilesPaged(offset, limit);
    return result;
  },

  loadData: async () => {
    try {
      const [
        loadedLore, 
        loadedCategories,
        loadedVoices, 
        loadedCollections,
        loadedAuthorVoices,
        loadedVoiceDNAs,
        loadedVoiceSuites,
        loadedCalendar
      ] = await Promise.all([
        db.getLoreEntries(),
        db.getLoreCategories(),
        db.getVoiceProfiles(),
        db.getVoiceCollections(),
        db.getAuthorVoices(),
        db.getVoiceDNAs(),
        db.getVoiceSuites(),
        db.getSetting('calendar_config')
      ]);


      // Initialize defaults or force override legacy categories
      let finalCategories = loadedCategories;
      // We check if the existing categories match the new domain architecture
      // If we don't have exactly 8 categories, or if the first one is "Characters" (legacy),
      // we force a hard override. This ensures the DB updates to the new domains.
      const hasLegacyCategories = loadedCategories.length === 0 || loadedCategories.some(c => c.name === 'Characters');
      if (hasLegacyCategories || loadedCategories.length !== DEFAULT_CATEGORIES.length) {
        finalCategories = DEFAULT_CATEGORIES;
        await db.setAllLoreCategories(DEFAULT_CATEGORIES);
      }

      let finalCollections = loadedCollections;
      if (loadedCollections.length === 0) {
        finalCollections = DEFAULT_COLLECTIONS;
        await db.setAllVoiceCollections(DEFAULT_COLLECTIONS);
      }

      set({
        loreEntries: loadedLore,
        loreCategories: finalCategories,
        voiceProfiles: loadedVoices.map(v => ({ ...v, collectionId: v.collectionId || 'col-1' })),
        voiceCollections: finalCollections,
        authorVoices: loadedAuthorVoices.map(v => ({ 
          ...v, 
          category: v.category || 'Narrator',
          modality: v.modality || 'narrator'
        })),
        voiceDNAs: loadedVoiceDNAs,
        voiceSuites: loadedVoiceSuites,
        calendarConfig: loadedCalendar || DEFAULT_CALENDAR,
        isLoaded: true
      });
    } catch (e) {
      console.error("Failed to load lore data from DB", e);
      set({ isLoaded: true });
    }
  },

  setCalendarConfig: async (config: CalendarConfig) => {
    set({ calendarConfig: config });
    await db.putSetting('calendar_config', config);
    
    // Trigger a re-calculation of all absolute days if the calendar structure changed
    const state = get();
    const updateAbsoluteDays = <T extends { storyDate?: StoryDate, absoluteDay?: number }>(items: T[]): T[] => {
      return items.map(item => ({
        ...item,
        absoluteDay: calculateAbsoluteDay(item.storyDate, config)
      }));
    };

    const updatedLore = updateAbsoluteDays(state.loreEntries);
    const updatedVoices = updateAbsoluteDays(state.voiceProfiles);
    const updatedAuthorVoices = updateAbsoluteDays(state.authorVoices);
    const updatedDNAs = updateAbsoluteDays(state.voiceDNAs);

    set({
      loreEntries: updatedLore,
      voiceProfiles: updatedVoices,
      authorVoices: updatedAuthorVoices,
      voiceDNAs: updatedDNAs
    });

    // Persist changes
    await Promise.all([
      db.setAllLoreEntries(updatedLore),
      db.setAllVoiceProfiles(updatedVoices),
      db.setAllAuthorVoices(updatedAuthorVoices),
      db.setAllVoiceDNAs(updatedDNAs)
    ]);
  },

  addLoreEntry: async (entry: LoreEntry) => {
    const config = get().calendarConfig;
    const enrichedEntry = {
      ...entry,
      absoluteDay: entry.absoluteDay ?? calculateAbsoluteDay(entry.storyDate, config)
    };
    set(state => ({
      loreEntries: [...state.loreEntries.filter(e => e.id !== enrichedEntry.id), enrichedEntry]
    }));
    await db.putLoreEntry(enrichedEntry);
  },

  deleteLoreEntry: async (id: string) => {
    set(state => ({
      loreEntries: state.loreEntries.filter(e => e.id !== id)
    }));
    await db.deleteLoreEntry(id);
  },

  addLoreCategory: async (category: LoreCategory) => {
    set(state => ({
      loreCategories: [...state.loreCategories.filter(c => c.id !== category.id), category]
    }));
    await db.putLoreCategory(category);
  },

  deleteLoreCategory: async (id: string) => {
    set(state => ({
      loreCategories: state.loreCategories.filter(c => c.id !== id)
    }));
    await db.deleteLoreCategory(id);
  },

  addVoiceProfile: async (profile: VoiceProfile) => {
    const config = get().calendarConfig;
    const enrichedProfile = {
      ...profile,
      absoluteDay: profile.absoluteDay ?? calculateAbsoluteDay(profile.storyDate, config)
    };
    set(state => ({
      voiceProfiles: [...state.voiceProfiles.filter(p => p.id !== enrichedProfile.id), enrichedProfile]
    }));
    await db.putVoiceProfile(enrichedProfile);
  },

  deleteVoiceProfile: async (id: string) => {
    set(state => ({
      voiceProfiles: state.voiceProfiles.filter(p => p.id !== id)
    }));
    await db.deleteVoiceProfile(id);
  },

  addVoiceCollection: async (collection: VoiceCollection) => {
    set(state => ({
      voiceCollections: [...state.voiceCollections.filter(c => c.id !== collection.id), collection]
    }));
    await db.putVoiceCollection(collection);
  },

  deleteVoiceCollection: async (id: string) => {
    set(state => ({
      voiceCollections: state.voiceCollections.filter(c => c.id !== id)
    }));
    await db.deleteVoiceCollection(id);
  },

  addAuthorVoice: async (voice: AuthorVoice) => {
    console.log("DEBUG: LORESTORE: addAuthorVoice triggered for:", voice.name, voice.id);
    set(state => {
      let base = state.authorVoices;
      if (voice.isActive) {
        base = state.authorVoices.map(v => 
          v.id !== voice.id && v.modality === voice.modality ? { ...v, isActive: false } : v
        );
      }
      
      const exists = base.find(v => v.id === voice.id);
      let updatedVoices: AuthorVoice[];
      if (exists) {
        updatedVoices = base.map(v => v.id === voice.id ? voice : v);
      } else {
        updatedVoices = [voice, ...base];
      }
      return { authorVoices: updatedVoices };
    });

    // Persist changes
    try {
      if (voice.isActive) {
        // Need to update the previously active voice too
        const state = get();
        await db.putAuthorVoice(voice); // Save the newly activated voice
        
        // Find and update the previously active one to be inactive in the DB
        const previouslyActive = state.authorVoices.find(v => v.id !== voice.id && v.modality === voice.modality && v.isActive);
        if (previouslyActive) {
          await db.putAuthorVoice({ ...previouslyActive, isActive: false });
        }
      } else {
        await db.putAuthorVoice(voice);
      }
    } catch (error) {
      console.error("Error persisting AuthorVoice to DB:", error);
    }
  },

  deleteAuthorVoice: async (id: string) => {
    set(state => ({
      authorVoices: state.authorVoices.filter(v => v.id !== id)
    }));
    await db.deleteAuthorVoice(id);
  },

  addVoiceDNA: async (dna: VoiceDNA) => {
    set(state => ({
      voiceDNAs: [...state.voiceDNAs.filter(d => d.id !== dna.id), dna]
    }));
    await db.putVoiceDNA(dna);
  },

  deleteVoiceDNA: async (id: string) => {
    set(state => ({
      voiceDNAs: state.voiceDNAs.filter(d => d.id !== id)
    }));
    await db.deleteVoiceDNA(id);
  },

  addVoiceSuite: async (suite: AuthorVoiceSuite) => {
    set(state => {
      let base = state.voiceSuites;
      if (suite.isActive) {
        base = state.voiceSuites.map(s => s.id !== suite.id ? { ...s, isActive: false } : s);
      }
      return {
        voiceSuites: [...base.filter(s => s.id !== suite.id), suite]
      };
    });
    await db.putVoiceSuite(suite);
    if (suite.isActive) {
      const all = get().voiceSuites;
      await db.setAllVoiceSuites(all);
    }
  },

  deleteVoiceSuite: async (id: string) => {
    set(state => ({
      voiceSuites: state.voiceSuites.filter(s => s.id !== id)
    }));
    await db.deleteVoiceSuite(id);
  },

  setActiveAuthorContext: async (type: 'suite' | 'voice', id: string) => {
    set(state => ({
      voiceSuites: state.voiceSuites.map(s => ({
        ...s,
        isActive: type === 'suite' ? s.id === id : false
      })),
      authorVoices: state.authorVoices.map(v => ({
        ...v,
        isActive: type === 'voice' ? v.id === id : false
      }))
    }));
    await db.setAllVoiceSuites(get().voiceSuites);
    await db.setAllAuthorVoices(get().authorVoices);
  },

  setActiveSuite: async (id: string) => {
    set(state => ({
      voiceSuites: state.voiceSuites.map(s => ({
        ...s,
        isActive: s.id === id
      }))
    }));
    await db.setAllVoiceSuites(get().voiceSuites);
  },

  importLoreEntries: async (entries: LoreEntry[]) => {
    set({ loreEntries: entries });
    await db.setAllLoreEntries(entries);
  },

  importVoiceProfiles: async (profiles: VoiceProfile[]) => {
    set({ voiceProfiles: profiles });
    await db.setAllVoiceProfiles(profiles);
  },

  importAuthorVoices: async (voices: AuthorVoice[]) => {
    set({ authorVoices: voices });
    await db.setAllAuthorVoices(voices);
  },

  importVoiceDNAs: async (dnas: VoiceDNA[]) => {
    set({ voiceDNAs: dnas });
    await db.setAllVoiceDNAs(dnas);
  },

  importVoiceSuites: async (suites: AuthorVoiceSuite[]) => {
    set({ voiceSuites: suites });
    await db.setAllVoiceSuites(suites);
  }
}));
