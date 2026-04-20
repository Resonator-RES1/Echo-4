import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DisplayPrefs } from '../types';

interface DisplayState {
  displayPrefs: DisplayPrefs;
  setDisplayPrefs: (prefs: DisplayPrefs) => void;
}

const DEFAULT_DISPLAY_PREFS: DisplayPrefs = {
  fontSize: 18,
  lineHeight: 1.8,
  paragraphSpacing: 1.5,
  maxWidth: 'max-w-3xl',
  fontFamily: 'serif',
  dynamicFontScaling: false
};

export const useDisplayStore = create<DisplayState>()(
  persist(
    (set) => ({
      displayPrefs: DEFAULT_DISPLAY_PREFS,
      setDisplayPrefs: (displayPrefs) => set({ displayPrefs }),
    }),
    {
      name: 'echo-display-storage',
    }
  )
);
