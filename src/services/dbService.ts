import Dexie, { Table } from 'dexie';
import { LoreEntry, VoiceProfile, RefinedVersion, AuthorVoice, Scene, Chapter, SurgicalSnapshot, UserPreset, LoreCategory, VoiceCollection, VoiceDNA, AuthorVoiceSuite, PromptFragment, MemoryAxiom, TimelineEvent, CharacterArc } from '../types';

export class EchoDatabase extends Dexie {
  lore!: Table<LoreEntry, string>;
  loreCategories!: Table<LoreCategory, string>;
  voices!: Table<VoiceProfile, string>;
  voiceCollections!: Table<VoiceCollection, string>;
  authorVoices!: Table<AuthorVoice, string>;
  voiceDNAs!: Table<VoiceDNA, string>;
  voiceSuites!: Table<AuthorVoiceSuite, string>;
  echoes!: Table<RefinedVersion, string>;
  scenes!: Table<Scene, string>;
  chapters!: Table<Chapter, string>;
  settings!: Table<any, string>;
  search_index!: Table<any, string>;
  snapshots!: Table<SurgicalSnapshot, string>;
  userPresets!: Table<UserPreset, string>;
  promptFragments!: Table<PromptFragment, string>;
  checkpoints!: Table<any, string>;
  checkpointWrites!: Table<any, string>;
  memoryAxioms!: Table<MemoryAxiom, string>;
  timelineEvents!: Table<TimelineEvent, string>;
  characterArcs!: Table<CharacterArc, string>;

  constructor() {
    super('echo-cloud-db');
    
    this.version(18).stores({
      lore: 'id, categoryId, isActive, parentId',
      loreCategories: 'id',
      voices: 'id, collectionId, isActive, parentId',
      voiceCollections: 'id',
      authorVoices: 'id, isActive',
      voiceDNAs: 'id',
      voiceSuites: 'id',
      echoes: 'id, sceneId, timestamp',
      scenes: 'id, chapterId, order',
      chapters: 'id, order',
      settings: '',
      search_index: '',
      snapshots: 'id, sceneId, timestamp',
      userPresets: 'id',
      promptFragments: 'id, category, isActive',
      checkpoints: 'key, threadId',
      checkpointWrites: 'key, outerKey, threadId',
      memoryAxioms: 'id, type, scope, *entityIds',
      timelineEvents: 'id, absoluteDay, isActive',
      characterArcs: 'id, voiceId, isActive'
    });
  }
}

export const db = new EchoDatabase();

// --- LORE ---
export const getLoreEntries = async (): Promise<LoreEntry[]> => {
  return db.lore.toArray();
};

export const getLoreEntriesPaged = async (offset: number, limit: number): Promise<LoreEntry[]> => {
  return db.lore.orderBy('id').offset(offset).limit(limit).toArray();
};

export const getActiveLoreEntries = async (): Promise<LoreEntry[]> => {
  return db.lore.where('isActive').equals(1).toArray(); // Dexie boolean index uses 1/0
};

export const putLoreEntry = async (entry: LoreEntry): Promise<void> => {
  await db.lore.put(entry);
};

export const deleteLoreEntry = async (id: string): Promise<void> => {
  await db.lore.delete(id);
};

export const setAllLoreEntries = async (entries: LoreEntry[]): Promise<void> => {
  await db.transaction('rw', db.lore, async () => {
    await db.lore.clear();
    await db.lore.bulkPut(entries);
  });
};

// --- LORE CATEGORIES ---
export const getLoreCategories = async (): Promise<LoreCategory[]> => {
  return db.loreCategories.toArray();
};

export const putLoreCategory = async (category: LoreCategory): Promise<void> => {
  await db.loreCategories.put(category);
};

export const deleteLoreCategory = async (id: string): Promise<void> => {
  await db.loreCategories.delete(id);
};

export const setAllLoreCategories = async (categories: LoreCategory[]): Promise<void> => {
  await db.transaction('rw', db.loreCategories, async () => {
    await db.loreCategories.clear();
    await db.loreCategories.bulkPut(categories);
  });
};

// --- VOICE COLLECTIONS ---
export const getVoiceCollections = async (): Promise<VoiceCollection[]> => {
  return db.voiceCollections.toArray();
};

export const putVoiceCollection = async (collection: VoiceCollection): Promise<void> => {
  await db.voiceCollections.put(collection);
};

export const deleteVoiceCollection = async (id: string): Promise<void> => {
  await db.voiceCollections.delete(id);
};

export const setAllVoiceCollections = async (collections: VoiceCollection[]): Promise<void> => {
  await db.transaction('rw', db.voiceCollections, async () => {
    await db.voiceCollections.clear();
    await db.voiceCollections.bulkPut(collections);
  });
};

// --- VOICES ---
export const getVoiceProfiles = async (): Promise<VoiceProfile[]> => {
  return db.voices.toArray();
};

export const getVoiceProfilesPaged = async (offset: number, limit: number): Promise<VoiceProfile[]> => {
  return db.voices.orderBy('id').offset(offset).limit(limit).toArray();
};

export const getVoicesByCollection = async (collectionId: string): Promise<VoiceProfile[]> => {
  return db.voices.where('collectionId').equals(collectionId).toArray();
};

export const putVoiceProfile = async (profile: VoiceProfile): Promise<void> => {
  await db.voices.put(profile);
};

export const deleteVoiceProfile = async (id: string): Promise<void> => {
  await db.voices.delete(id);
};

export const setAllVoiceProfiles = async (profiles: VoiceProfile[]): Promise<void> => {
  await db.transaction('rw', db.voices, async () => {
    await db.voices.clear();
    await db.voices.bulkPut(profiles);
  });
};

// --- AUTHOR VOICES ---
export const getAuthorVoices = async (): Promise<AuthorVoice[]> => {
  return db.authorVoices.toArray();
};

export const getActiveAuthorVoices = async (): Promise<AuthorVoice[]> => {
  return db.authorVoices.where('isActive').equals(1).toArray();
};

export const putAuthorVoice = async (voice: AuthorVoice): Promise<void> => {
  await db.authorVoices.put(voice);
};

export const deleteAuthorVoice = async (id: string): Promise<void> => {
  await db.authorVoices.delete(id);
};

export const setAllAuthorVoices = async (voices: AuthorVoice[]): Promise<void> => {
  await db.transaction('rw', db.authorVoices, async () => {
    await db.authorVoices.clear();
    await db.authorVoices.bulkPut(voices);
  });
};

// --- VOICE DNA ---
export const getVoiceDNAs = async (): Promise<VoiceDNA[]> => {
  return db.voiceDNAs.toArray();
};

export const putVoiceDNA = async (dna: VoiceDNA): Promise<void> => {
  await db.voiceDNAs.put(dna);
};

export const deleteVoiceDNA = async (id: string): Promise<void> => {
  await db.voiceDNAs.delete(id);
};

export const setAllVoiceDNAs = async (dnas: VoiceDNA[]): Promise<void> => {
  await db.transaction('rw', db.voiceDNAs, async () => {
    await db.voiceDNAs.clear();
    await db.voiceDNAs.bulkPut(dnas);
  });
};

// --- VOICE SUITES ---
export const getVoiceSuites = async (): Promise<AuthorVoiceSuite[]> => {
  return db.voiceSuites.toArray();
};

export const putVoiceSuite = async (suite: AuthorVoiceSuite): Promise<void> => {
  await db.voiceSuites.put(suite);
};

export const deleteVoiceSuite = async (id: string): Promise<void> => {
  await db.voiceSuites.delete(id);
};

export const setAllVoiceSuites = async (suites: AuthorVoiceSuite[]): Promise<void> => {
  await db.transaction('rw', db.voiceSuites, async () => {
    await db.voiceSuites.clear();
    await db.voiceSuites.bulkPut(suites);
  });
};

// --- ECHOES ---
export const getEchoes = async (): Promise<RefinedVersion[]> => {
  try {
    return await db.echoes.orderBy('timestamp').reverse().toArray();
  } catch (e) {
    console.warn("orderBy('timestamp') failed for echoes, falling back to toArray()", e);
    const echoes = await db.echoes.toArray();
    return echoes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};

export const getEchoesByScene = async (sceneId: string): Promise<RefinedVersion[]> => {
  return db.echoes.where('sceneId').equals(sceneId).sortBy('timestamp');
};

export const putEcho = async (echo: RefinedVersion): Promise<void> => {
  await db.echoes.put(echo);

  // --- ARCHIVE AUTO-PRUNER ---
  const sceneId = echo.sceneId;
  if (sceneId) {
    const sceneEchoes = await db.echoes.where('sceneId').equals(sceneId).toArray();
    
    if (sceneEchoes.length > 5) {
      sceneEchoes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const echoesToDelete = sceneEchoes.slice(0, sceneEchoes.length - 5);
      
      await db.transaction('rw', db.echoes, async () => {
        for (const echoToDelete of echoesToDelete) {
          await db.echoes.delete(echoToDelete.id);
        }
      });
    }
  }
};

export const deleteEcho = async (id: string): Promise<void> => {
  await db.echoes.delete(id);
};

export const setAllEchoes = async (echoes: RefinedVersion[]): Promise<void> => {
  await db.transaction('rw', db.echoes, async () => {
    await db.echoes.clear();
    await db.echoes.bulkPut(echoes);
  });
};

// --- SCENES ---
export const getScenes = async (): Promise<Scene[]> => {
  try {
    return await db.scenes.orderBy('order').toArray();
  } catch (e) {
    console.warn("orderBy('order') failed, falling back to toArray()", e);
    const scenes = await db.scenes.toArray();
    return scenes.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
};

export const getScenesMetadata = async (): Promise<SceneMetadata[]> => {
  try {
    const scenes = await db.scenes.orderBy('order').toArray();
    return scenes.map(({ content, ...metadata }) => ({
      ...metadata,
      wordCount: content ? content.trim().split(/\s+/).length : 0
    }));
  } catch (e) {
    console.warn("orderBy('order') failed for metadata, falling back to toArray()", e);
    const scenes = await db.scenes.toArray();
    return scenes
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(({ content, ...metadata }) => ({
        ...metadata,
        wordCount: content ? content.trim().split(/\s+/).length : 0
      }));
  }
};

export const getScene = async (id: string): Promise<Scene | undefined> => {
  return db.scenes.get(id);
};

export const getScenesByChapter = async (chapterId: string): Promise<Scene[]> => {
  return db.scenes.where('chapterId').equals(chapterId).sortBy('order');
};

export const putScene = async (scene: Scene): Promise<void> => {
  await db.scenes.put(scene);
};

export const bulkPutScenes = async (scenes: Scene[]): Promise<void> => {
  await db.scenes.bulkPut(scenes);
};

export const deleteScene = async (id: string): Promise<void> => {
  await db.scenes.delete(id);
};

export const setAllScenes = async (scenes: Scene[]): Promise<void> => {
  await db.transaction('rw', db.scenes, async () => {
    await db.scenes.clear();
    await db.scenes.bulkPut(scenes);
  });
};

// --- CHAPTERS ---
export const getChapters = async (): Promise<Chapter[]> => {
  try {
    return await db.chapters.orderBy('order').toArray();
  } catch (e) {
    console.warn("orderBy('order') failed for chapters, falling back to toArray()", e);
    const chapters = await db.chapters.toArray();
    return chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
};

export const putChapter = async (chapter: Chapter): Promise<void> => {
  await db.chapters.put(chapter);
};

export const bulkPutChapters = async (chapters: Chapter[]): Promise<void> => {
  await db.chapters.bulkPut(chapters);
};

export const deleteChapter = async (id: string): Promise<void> => {
  await db.chapters.delete(id);
};

export const setAllChapters = async (chapters: Chapter[]): Promise<void> => {
  await db.transaction('rw', db.chapters, async () => {
    await db.chapters.clear();
    await db.chapters.bulkPut(chapters);
  });
};

// --- SETTINGS ---
export const getSetting = async (key: string): Promise<any> => {
  return await db.settings.get(key);
};

export const putSetting = async (key: string, value: any): Promise<void> => {
  await db.settings.put(value, key);
};

export const deleteSetting = async (key: string): Promise<void> => {
  await db.settings.delete(key);
};

export const getAllSettings = async (): Promise<Record<string, any>> => {
  const keys = await db.settings.toCollection().keys();
  const values = await db.settings.toArray();
  const settings: Record<string, any> = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as string;
    if (key !== 'google_access_token' && key !== 'current_project') {
      settings[key] = values[i];
    }
  }
  return settings;
};

export const setAllSettings = async (settings: Record<string, any>): Promise<void> => {
  await db.transaction('rw', db.settings, async () => {
    for (const [key, value] of Object.entries(settings)) {
      if (key !== 'google_access_token' && key !== 'current_project') {
        await db.settings.put(value, key);
      }
    }
  });
};

// --- SEARCH INDEX ---
export const getStoredSearchIndex = async (projectId: string): Promise<any> => {
  return await db.search_index.get(projectId);
};

export const putStoredSearchIndex = async (projectId: string, serializedIndex: string): Promise<void> => {
  await db.search_index.put(serializedIndex, projectId);
};

// --- SNAPSHOTS ---
export const getSnapshots = async (sceneId: string): Promise<SurgicalSnapshot[]> => {
  if (!sceneId) return [];
  return db.snapshots.where('sceneId').equals(sceneId).sortBy('timestamp');
};

export const putSnapshot = async (snapshot: SurgicalSnapshot): Promise<void> => {
  await db.snapshots.put(snapshot);
};

export const deleteSnapshot = async (id: string): Promise<void> => {
  await db.snapshots.delete(id);
};

export const clearProjectData = async (): Promise<void> => {
  await db.transaction('rw', [db.lore, db.voices, db.authorVoices, db.echoes, db.scenes, db.chapters, db.settings], async () => {
    await db.lore.clear();
    await db.voices.clear();
    await db.authorVoices.clear();
    await db.echoes.clear();
    await db.scenes.clear();
    await db.chapters.clear();
    
    const keys = await db.settings.toCollection().keys();
    for (const key of keys) {
      if (key !== 'google_access_token' && key !== 'current_project') {
        await db.settings.delete(key as string);
      }
    }
  });
};

// --- USER PRESETS ---
export const getUserPresets = async (): Promise<UserPreset[]> => {
  return db.userPresets.toArray();
};

export const putUserPreset = async (preset: UserPreset): Promise<void> => {
  await db.userPresets.put(preset);
};

export const deleteUserPreset = async (id: string): Promise<void> => {
  await db.userPresets.delete(id);
};

// --- PROMPT FRAGMENTS ---
export const getPromptFragments = async (): Promise<PromptFragment[]> => {
  return db.promptFragments.toArray();
};

export const getActivePromptFragments = async (): Promise<PromptFragment[]> => {
  return db.promptFragments.where('isActive').equals(1).toArray();
};

export const putPromptFragment = async (fragment: PromptFragment): Promise<void> => {
  await db.promptFragments.put(fragment);
};

export const deletePromptFragment = async (id: string): Promise<void> => {
  await db.promptFragments.delete(id);
};

export const setAllPromptFragments = async (fragments: PromptFragment[]): Promise<void> => {
  await db.transaction('rw', db.promptFragments, async () => {
    await db.promptFragments.clear();
    await db.promptFragments.bulkPut(fragments);
  });
};

// --- MEMORY AXIOMS ---
export const getMemoryAxioms = async (): Promise<MemoryAxiom[]> => {
  return db.memoryAxioms.toArray();
};

export const getAxiomsByEntityId = async (entityId: string): Promise<MemoryAxiom[]> => {
  return db.memoryAxioms.where('entityIds').equals(entityId).toArray();
};

export const putMemoryAxiom = async (axiom: MemoryAxiom): Promise<void> => {
  await db.memoryAxioms.put(axiom);
};

export const deleteMemoryAxiom = async (id: string): Promise<void> => {
  await db.memoryAxioms.delete(id);
};

export const setAllMemoryAxioms = async (axioms: MemoryAxiom[]): Promise<void> => {
  await db.transaction('rw', db.memoryAxioms, async () => {
    await db.memoryAxioms.clear();
    await db.memoryAxioms.bulkPut(axioms);
  });
};

export const clearMemoryAxioms = async (): Promise<void> => {
  await db.memoryAxioms.clear();
};

// --- TIMELINE EVENTS ---
export const getTimelineEvents = async (): Promise<TimelineEvent[]> => {
  return db.timelineEvents.orderBy('absoluteDay').toArray();
};

export const getActiveTimelineEvents = async (): Promise<TimelineEvent[]> => {
  return db.timelineEvents.where('isActive').equals(1).sortBy('absoluteDay');
};

export const putTimelineEvent = async (event: TimelineEvent): Promise<void> => {
  await db.timelineEvents.put(event);
};

export const deleteTimelineEvent = async (id: string): Promise<void> => {
  await db.timelineEvents.delete(id);
};

export const setAllTimelineEvents = async (events: TimelineEvent[]): Promise<void> => {
  await db.transaction('rw', db.timelineEvents, async () => {
    await db.timelineEvents.clear();
    await db.timelineEvents.bulkPut(events);
  });
};

// --- CHARACTER ARCS ---
export const getCharacterArcs = async (): Promise<CharacterArc[]> => {
  return db.characterArcs.toArray();
};

export const getCharacterArcsByVoice = async (voiceId: string): Promise<CharacterArc[]> => {
  return db.characterArcs.where('voiceId').equals(voiceId).toArray();
};

export const putCharacterArc = async (arc: CharacterArc): Promise<void> => {
  await db.characterArcs.put(arc);
};

export const deleteCharacterArc = async (id: string): Promise<void> => {
  await db.characterArcs.delete(id);
};

export const setAllCharacterArcs = async (arcs: CharacterArc[]): Promise<void> => {
  await db.transaction('rw', db.characterArcs, async () => {
    await db.characterArcs.clear();
    await db.characterArcs.bulkPut(arcs);
  });
};

