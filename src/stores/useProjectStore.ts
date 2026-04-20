import { create } from 'zustand';
import * as db from '../services/dbService';
import { projectService } from '../services/projectService';
import { Theme } from '../types';

interface ProjectState {
  projectName: string;
  isImporting: boolean;
  importError: string | null;
  isZenMode: boolean;
  currentTheme: Theme;
  showTextures: boolean;
  
  setProjectName: (name: string) => Promise<void>;
  exportProject: () => Promise<void>;
  importProject: (file: File) => Promise<void>;
  resetProject: () => Promise<void>;
  setIsZenMode: (isZenMode: boolean) => void;
  setTheme: (theme: Theme) => void;
  setShowTextures: (show: boolean) => void;
  loadInitialData: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectName: 'Untitled Project',
  isImporting: false,
  importError: null,
  isZenMode: false,
  currentTheme: 'ethereal',
  showTextures: false,

  loadInitialData: async () => {
    const [savedName, savedTheme, savedTextures] = await Promise.all([
      db.getSetting('project_name'),
      db.getSetting('app_theme'),
      db.getSetting('show_textures')
    ]);
    
    if (savedName) set({ projectName: savedName });
    if (savedTheme) {
      const theme = savedTheme as Theme;
      set({ currentTheme: theme });
      document.documentElement.classList.remove('theme-ethereal', 'theme-midnight', 'theme-parchment', 'theme-obsidian', 'theme-forest', 'theme-crimson');
      document.documentElement.classList.add(`theme-${theme}`);
    } else {
      document.documentElement.classList.add('theme-ethereal');
    }
    if (savedTextures !== undefined) {
      const show = savedTextures === 'true';
      set({ showTextures: show });
      if (show) {
        document.documentElement.classList.add('show-textures');
      } else {
        document.documentElement.classList.remove('show-textures');
      }
    }
  },

  setProjectName: async (name: string) => {
    set({ projectName: name });
    await db.putSetting('project_name', name);
  },

  exportProject: async () => {
    try {
      await projectService.exportProject(get().projectName);
    } catch (error: any) {
      console.error('Export Error:', error);
    }
  },

  importProject: async (file: File) => {
    set({ isImporting: true, importError: null });
    try {
      const data = await projectService.importProject(file);
      set({ projectName: data.name });
      await db.putSetting('project_name', data.name);
      window.dispatchEvent(new CustomEvent('sync-complete'));
    } catch (error: any) {
      console.error('Import Error:', error);
      set({ importError: error.message });
    } finally {
      set({ isImporting: false });
    }
  },

  resetProject: async () => {
    try {
      await projectService.resetProject();
      set({ projectName: 'Untitled Project' });
      window.dispatchEvent(new CustomEvent('sync-complete'));
    } catch (error: any) {
      console.error('Reset Error:', error);
    }
  },

  setIsZenMode: (isZenMode: boolean) => set({ isZenMode }),

  setTheme: (theme: Theme) => {
    set({ currentTheme: theme });
    document.documentElement.classList.remove('theme-ethereal', 'theme-midnight', 'theme-parchment', 'theme-obsidian', 'theme-forest', 'theme-crimson');
    document.documentElement.classList.add(`theme-${theme}`);
    db.putSetting('app_theme', theme);
  },

  setShowTextures: (show: boolean) => {
    set({ showTextures: show });
    if (show) {
      document.documentElement.classList.add('show-textures');
    } else {
      document.documentElement.classList.remove('show-textures');
    }
    db.putSetting('show_textures', String(show));
  }
}));
