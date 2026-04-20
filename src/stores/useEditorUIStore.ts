import { create } from 'zustand';
import { WorkspaceTab } from '../types';

interface EditorUIState {
  isZenMode: boolean;
  isUIVisible: boolean;
  activeTab: WorkspaceTab;
  activeHUD: 'sceneManager' | null;
  
  setIsZenMode: (isZenMode: boolean) => void;
  setIsUIVisible: (isUIVisible: boolean) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  setActiveHUD: (hud: 'sceneManager' | null) => void;
}

export const useEditorUIStore = create<EditorUIState>((set) => ({
  isZenMode: false,
  isUIVisible: true,
  activeTab: 'draft',
  activeHUD: null,
  
  setIsZenMode: (isZenMode) => set({ isZenMode }),
  setIsUIVisible: (isUIVisible) => set({ isUIVisible }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveHUD: (activeHUD) => set({ activeHUD }),
}));
