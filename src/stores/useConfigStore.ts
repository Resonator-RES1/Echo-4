import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FocusArea, FeedbackDepth, DraftingStance } from '../types';

interface ConfigState {
  // Engine Configuration
  model: string;
  refinementModelOverride: string | null;
  refinementThinkingLevel: 'minimal' | 'low' | 'default' | 'high';
  reportModel: string;
  healingModelOverride: string | null;
  reportThinkingLevel: 'minimal' | 'low' | 'default' | 'high';
  feedbackDepth: FeedbackDepth;
  refinementScope: 'scene' | 'chapter';
  isSurgicalMode: boolean;
  activePresetIds: string[];
  activeFragmentIds: string[];
  focusAreas: FocusArea[];
  creativeTension: number;
  reportTemperature: number;
  draftingStance: DraftingStance;

  // Setters
  setModel: (model: string) => void;
  setRefinementModelOverride: (model: string | null) => void;
  setRefinementThinkingLevel: (level: 'minimal' | 'low' | 'default' | 'high') => void;
  setReportModel: (model: string) => void;
  setHealingModelOverride: (model: string | null) => void;
  setReportThinkingLevel: (level: 'minimal' | 'low' | 'default' | 'high') => void;
  setFeedbackDepth: (depth: FeedbackDepth) => void;
  setRefinementScope: (scope: 'scene' | 'chapter') => void;
  setIsSurgicalMode: (isSurgical: boolean) => void;
  setActivePresetIds: (ids: string[]) => void;
  setActiveFragmentIds: (ids: string[]) => void;
  setFocusAreas: (focusAreas: FocusArea[]) => void;
  setCreativeTension: (tension: number) => void;
  setReportTemperature: (temp: number) => void;
  setDraftingStance: (stance: DraftingStance) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      // Engine Defaults
      model: 'gemini-3-flash-preview',
      refinementModelOverride: null,
      refinementThinkingLevel: 'default',
      reportModel: 'gemini-3-flash-preview',
      healingModelOverride: null,
      reportThinkingLevel: 'high',
      feedbackDepth: 'balanced',
      refinementScope: 'scene',
      isSurgicalMode: true,
      activePresetIds: [],
      activeFragmentIds: [],
      focusAreas: [],
      creativeTension: 0.7,
      reportTemperature: 1.0,
      draftingStance: 'Standard Prose',

      setModel: (model) => set({ model }),
      setRefinementModelOverride: (refinementModelOverride) => set({ refinementModelOverride }),
      setRefinementThinkingLevel: (refinementThinkingLevel) => set({ refinementThinkingLevel }),
      setReportModel: (reportModel) => set({ reportModel }),
      setHealingModelOverride: (healingModelOverride) => set({ healingModelOverride }),
      setReportThinkingLevel: (reportThinkingLevel) => set({ reportThinkingLevel }),
      setFeedbackDepth: (feedbackDepth) => set({ feedbackDepth }),
      setRefinementScope: (refinementScope) => set({ refinementScope }),
      setIsSurgicalMode: (isSurgicalMode) => set({ isSurgicalMode }),
      setActivePresetIds: (activePresetIds) => set({ activePresetIds }),
      setActiveFragmentIds: (activeFragmentIds) => set({ activeFragmentIds }),
      setFocusAreas: (focusAreas) => set({ focusAreas }),
      setCreativeTension: (creativeTension) => set({ creativeTension }),
      setReportTemperature: (reportTemperature) => set({ reportTemperature }),
      setDraftingStance: (draftingStance) => set({ draftingStance }),
    }),
    {
      name: 'echo-config-storage',
    }
  )
);
