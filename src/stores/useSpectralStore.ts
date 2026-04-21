import { create } from 'zustand';

export type FocusCategory = 'DIALOGUE' | 'SENSORY' | 'INTERNAL' | 'SLUDGE' | 'TENSILE' | 'NEUTRAL';

export interface SpectrumRange {
  from: number;
  to: number;
  category: FocusCategory;
  suggestion?: string;
  count?: number;
}

interface SpectralState {
  isSpectralHUDEnabled: boolean;
  spectra: SpectrumRange[];
  suggestions: string[];
  
  setHUDEnabled: (enabled: boolean) => void;
  setSpectra: (spectra: SpectrumRange[]) => void;
  setSuggestions: (suggestions: string[]) => void;
  clearSpectra: () => void;
}

export const useSpectralStore = create<SpectralState>((set) => ({
  isSpectralHUDEnabled: false,
  spectra: [],
  suggestions: [],
  
  setHUDEnabled: (enabled) => set({ isSpectralHUDEnabled: enabled }),
  setSpectra: (spectra) => set({ spectra }),
  setSuggestions: (suggestions) => set({ suggestions }),
  clearSpectra: () => set({ spectra: [], suggestions: [] }),
}));
