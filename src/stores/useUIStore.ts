import { create } from 'zustand';
import { RefineDraftResult, FocusArea, RefinedVersion } from '../types';
import { refineDraft } from '../engines/gemini/refine';
import { useConfigStore } from './useConfigStore';

interface UIState {
  playgroundInput: string;
  playgroundResult: RefineDraftResult | null;
  isRefining: boolean;
  streamingText: string;
  selectedPreset: { id: FocusArea; label: string; icon: any; description: string } | null;
  error: string | null;
  
  workbenchDraft: string;
  customDirectives: string;
  suggestionLedger: string[];
  surgicalTray: string[];
  latestRefinementResult: RefineDraftResult | null;
  refinementMode: 'regular' | 'post-audit';

  setPlaygroundInput: (input: string) => void;
  setWorkbenchDraft: (draft: string) => void;
  setCustomDirectives: (directives: string) => void;
  setIsRefining: (isRefining: boolean) => void;
  
  appendCustomDirective: (directive: string) => void;
  addSuggestion: (suggestion: string) => void;
  removeSuggestion: (index: number) => void;
  clearSuggestions: () => void;
  addToTray: (item: string) => void;
  removeFromTray: (index: number) => void;
  clearTray: () => void;
  toggleRefinementMode: () => void;
  setSelectedPreset: (preset: { id: FocusArea; label: string; icon: any; description: string } | null) => void;
  refinePlayground: (focusAreas: FocusArea[]) => Promise<void>;
  loadReportIntoWorkbench: (report: RefinedVersion) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  playgroundInput: '',
  playgroundResult: null,
  isRefining: false,
  streamingText: '',
  selectedPreset: null,
  error: null,
  workbenchDraft: '',
  customDirectives: '',
  suggestionLedger: [],
  surgicalTray: [],
  latestRefinementResult: null,
  refinementMode: 'regular',

  setPlaygroundInput: (input) => set({ playgroundInput: input }),
  setWorkbenchDraft: (draft) => set({ workbenchDraft: draft }),
  setCustomDirectives: (directives) => set({ customDirectives: directives }),
  setIsRefining: (isRefining) => set({ isRefining }),
  toggleRefinementMode: () => set((state) => ({ 
    refinementMode: state.refinementMode === 'regular' ? 'post-audit' : 'regular' 
  })),

  appendCustomDirective: (directive) => set((state) => ({ 
    customDirectives: state.customDirectives 
      ? `${state.customDirectives}\n${directive}` 
      : directive 
  })),
  addSuggestion: (suggestion) => set((state) => ({
    suggestionLedger: state.suggestionLedger.includes(suggestion) ? state.suggestionLedger : [...state.suggestionLedger, suggestion]
  })),
  removeSuggestion: (index) => set((state) => ({
    suggestionLedger: state.suggestionLedger.filter((_, i) => i !== index)
  })),
  clearSuggestions: () => set({ suggestionLedger: [] }),
  addToTray: (item) => set((state) => ({
    surgicalTray: state.surgicalTray.includes(item) ? state.surgicalTray : [...state.surgicalTray, item]
  })),
  removeFromTray: (index) => set((state) => ({
    surgicalTray: state.surgicalTray.filter((_, i) => i !== index)
  })),
  clearTray: () => set({ surgicalTray: [] }),
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),

  refinePlayground: async (focusAreas) => {
    const { playgroundInput } = get();
    const config = useConfigStore.getState();
    
    if (!playgroundInput.trim()) return;

    set({ isRefining: true, error: null, playgroundResult: null, streamingText: '' });

    try {
      const result = await refineDraft({
        draft: playgroundInput,
        focusAreas,
        generationConfig: {
          model: config.model,
          temperature: 0.7
        },
        reportGenerationConfig: {
          model: config.reportModel,
          temperature: 0.7
        },
        onStream: (chunk) => {
          if (chunk.text) {
            set((state) => ({ streamingText: state.streamingText + chunk.text }));
          }
        }
      });

      set({ playgroundResult: result, isRefining: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to refine draft', isRefining: false });
    }
  },

  loadReportIntoWorkbench: (report) => {
    set({ 
      workbenchDraft: report.text,
    });
  }
}));
