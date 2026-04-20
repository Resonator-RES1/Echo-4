import * as db from './dbService';
import { LoreEntry, VoiceProfile, RefinedVersion, AuthorVoice, Scene, Chapter } from '../types';

export interface ProjectData {
  name: string;
  version: number;
  timestamp: string;
  lore: LoreEntry[];
  voices: VoiceProfile[];
  authorVoices: AuthorVoice[];
  echoes: RefinedVersion[];
  scenes: Scene[];
  chapters: Chapter[];
  settings: Record<string, any>;
}

export const projectService = {
  exportProject: async (projectName: string): Promise<void> => {
    const [lore, voices, authorVoices, echoes, scenes, settings, chapters] = await Promise.all([
      db.getLoreEntries(),
      db.getVoiceProfiles(),
      db.getAuthorVoices(),
      db.getEchoes(),
      db.getScenes(),
      db.getAllSettings(),
      db.getChapters()
    ]);

    const projectData: ProjectData = {
      name: projectName,
      version: 1,
      timestamp: new Date().toISOString(),
      lore,
      voices,
      authorVoices,
      echoes,
      scenes,
      chapters,
      settings
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.echo`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importProject: async (file: File): Promise<ProjectData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as ProjectData;
          
          // Basic validation
          if (!data.lore || !data.voices || !data.echoes) {
            throw new Error('Invalid project file format');
          }

          // Clear existing data and set new data
          await db.clearProjectData();
          await Promise.all([
            db.setAllLoreEntries(data.lore),
            db.setAllVoiceProfiles(data.voices),
            db.setAllAuthorVoices(data.authorVoices || []),
            db.setAllEchoes(data.echoes),
            db.setAllScenes(data.scenes || []),
            db.setAllChapters(data.chapters || []),
            db.setAllSettings(data.settings || {})
          ]);

          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  resetProject: async (): Promise<void> => {
    await db.clearProjectData();
    await db.putSetting('project_name', 'Untitled Project');
  }
};
