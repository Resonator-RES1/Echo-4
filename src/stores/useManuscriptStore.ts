import { create } from 'zustand';
import { Scene, SceneMetadata, Chapter, RefinedVersion, WritingGoal } from '../types';
import * as db from '../services/dbService';

interface ManuscriptState {
  scenes: SceneMetadata[];
  chapters: Chapter[];
  currentSceneId: string | null;
  draft: string;
  versionHistory: RefinedVersion[];
  writingGoal: WritingGoal;
  isAppLoaded: boolean;

  setScenes: (scenes: SceneMetadata[] | ((prev: SceneMetadata[]) => SceneMetadata[])) => void;
  setChapters: (chapters: Chapter[] | ((prev: Chapter[]) => Chapter[])) => void;
  setCurrentSceneId: (id: string | null) => void;
  setDraft: (draft: string) => void;
  setVersionHistory: (history: RefinedVersion[] | ((prev: RefinedVersion[]) => RefinedVersion[])) => void;
  setWritingGoal: (goal: WritingGoal | ((prev: WritingGoal) => WritingGoal)) => void;
  setIsAppLoaded: (isLoaded: boolean) => void;

  updateScene: (scene: Scene) => Promise<void>;
  updateSceneMetadata: (metadata: SceneMetadata) => Promise<void>;
  addVersion: (version: RefinedVersion) => Promise<void>;
  updateVersion: (version: RefinedVersion) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  acceptVersion: (version: RefinedVersion) => Promise<void>;
  clearVersionHistory: (currentSceneId: string | null) => Promise<void>;
  clearAcceptedVersions: () => Promise<void>;
  handleVersionHistoryChange: (newFilteredHistory: RefinedVersion[], currentSceneId: string | null) => Promise<void>;
}

export const useManuscriptStore = create<ManuscriptState>((set, get) => ({
  scenes: [],
  chapters: [],
  currentSceneId: null,
  draft: '',
  versionHistory: [],
  writingGoal: { targetWords: 50000 },
  isAppLoaded: false,

  setScenes: (scenes) => set((state) => ({ scenes: typeof scenes === 'function' ? scenes(state.scenes) : scenes })),
  setChapters: (chapters) => set((state) => ({ chapters: typeof chapters === 'function' ? chapters(state.chapters) : chapters })),
  setCurrentSceneId: (id: string | null) => {
    set({ currentSceneId: id });
    if (id) {
      db.putSetting('current_scene_id', id);
    } else {
      db.deleteSetting('current_scene_id');
    }
  },
  setDraft: (draft) => {
    set({ draft });
    db.putSetting('current_draft', draft);
  },
  setVersionHistory: (history) => set((state) => ({ versionHistory: typeof history === 'function' ? history(state.versionHistory) : history })),
  setWritingGoal: (goal) => {
    set((state) => {
      const nextGoal = typeof goal === 'function' ? goal(state.writingGoal) : goal;
      localStorage.setItem('echo-writing-goal', JSON.stringify(nextGoal));
      return { writingGoal: nextGoal };
    });
  },
  setIsAppLoaded: (isLoaded) => set({ isAppLoaded: isLoaded }),

  updateScene: async (scene: Scene) => {
    const { content, ...metadata } = scene;
    const wordCount = content ? content.trim().split(/\s+/).length : 0;
    const updatedMetadata = { ...metadata, wordCount };
    
    set((state) => ({ 
      scenes: state.scenes.map(s => s.id === scene.id ? updatedMetadata : s) 
    }));
    await db.putScene(scene);
  },

  updateSceneMetadata: async (metadata: SceneMetadata) => {
    set((state) => ({ 
      scenes: state.scenes.map(s => s.id === metadata.id ? metadata : s) 
    }));
    // We need to fetch the full scene to update it in DB if we don't want to lose content
    const fullScene = await db.getScene(metadata.id);
    if (fullScene) {
      await db.putScene({ ...fullScene, ...metadata });
    }
  },

  addVersion: async (version: RefinedVersion) => {
    let oldestUnacceptedId: string | null = null;
    
    set((state) => {
      const prev = state.versionHistory;
      const unacceptedForScene = prev.filter(v => !v.isAccepted && v.sceneId === version.sceneId);
      if (unacceptedForScene.length >= 5) {
        const oldestUnaccepted = unacceptedForScene[unacceptedForScene.length - 1];
        oldestUnacceptedId = oldestUnaccepted.id;
        return { versionHistory: [version, ...prev.filter(v => v.id !== oldestUnaccepted.id)] };
      }
      return { versionHistory: [version, ...prev] };
    });

    if (oldestUnacceptedId) {
      await db.deleteEcho(oldestUnacceptedId).catch(err => console.error("Failed to auto-delete old echo:", err));
    }
    await db.putEcho(version);
  },

  updateVersion: async (updatedVersion: RefinedVersion) => {
    set((state) => {
      const updated = state.versionHistory.map(v => v.id === updatedVersion.id ? updatedVersion : v);
      db.setAllEchoes(updated);
      return { versionHistory: updated };
    });
    await db.putEcho(updatedVersion);
  },

  deleteVersion: async (id: string) => {
    set((state) => ({ versionHistory: state.versionHistory.filter(v => v.id !== id) }));
    await db.deleteEcho(id);
  },

  acceptVersion: async (version: RefinedVersion) => {
    const { currentSceneId } = get();
    set({ draft: version.text });
    
    set((state) => {
      const updatedHistory = state.versionHistory.map(v => v.id === version.id ? { ...v, isAccepted: true } : v);
      db.setAllEchoes(updatedHistory);
      
      let updatedScenes = state.scenes;
      if (currentSceneId) {
        const wordCount = version.text.trim().split(/\s+/).length;
        updatedScenes = state.scenes.map(s => s.id === currentSceneId ? { ...s, wordCount, hasEcho: true, lastModified: new Date().toISOString() } : s);
        const activeSceneMeta = updatedScenes.find(s => s.id === currentSceneId);
        if (activeSceneMeta) {
          // We need the full scene to update content
          db.getScene(currentSceneId).then(full => {
            if (full) {
              db.putScene({ ...full, ...activeSceneMeta, content: version.text });
            }
          });
        }
      }
      
      return { versionHistory: updatedHistory, scenes: updatedScenes };
    });
  },

  clearVersionHistory: async (currentSceneId: string | null) => {
    set((state) => {
      const otherVersions = state.versionHistory.filter(v => v.sceneId && v.sceneId !== currentSceneId);
      db.setAllEchoes(otherVersions);
      return { versionHistory: otherVersions };
    });
  },

  clearAcceptedVersions: async () => {
    set((state) => {
      const updated = state.versionHistory.filter(v => !v.isAccepted);
      db.setAllEchoes(updated);
      return { versionHistory: updated };
    });
  },

  handleVersionHistoryChange: async (newFilteredHistory: RefinedVersion[], currentSceneId: string | null) => {
    set((state) => {
      const otherVersions = state.versionHistory.filter(v => v.sceneId && v.sceneId !== currentSceneId);
      const merged = [...newFilteredHistory, ...otherVersions];
      db.setAllEchoes(merged);
      return { versionHistory: merged };
    });
  }
}));
