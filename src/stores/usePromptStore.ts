import { create } from 'zustand';
import { PromptFragment } from '../types';
import * as db from '../services/dbService';

interface PromptState {
  fragments: PromptFragment[];
  isLoaded: boolean;
  
  loadFragments: () => Promise<void>;
  addFragment: (fragment: PromptFragment) => Promise<void>;
  updateFragment: (fragment: PromptFragment) => Promise<void>;
  deleteFragment: (id: string) => Promise<void>;
  toggleFragment: (id: string) => Promise<void>;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  fragments: [],
  isLoaded: false,

  loadFragments: async () => {
    const fragments = await db.getPromptFragments();
    set({ fragments, isLoaded: true });
  },

  addFragment: async (fragment) => {
    await db.putPromptFragment(fragment);
    set((state) => ({ fragments: [...state.fragments, fragment] }));
  },

  updateFragment: async (fragment) => {
    await db.putPromptFragment(fragment);
    set((state) => ({
      fragments: state.fragments.map((f) => (f.id === fragment.id ? fragment : f)),
    }));
  },

  deleteFragment: async (id) => {
    await db.deletePromptFragment(id);
    set((state) => ({
      fragments: state.fragments.filter((f) => f.id !== id),
    }));
  },

  toggleFragment: async (id) => {
    const fragment = get().fragments.find((f) => f.id === id);
    if (fragment) {
      const updated = { ...fragment, isActive: !fragment.isActive };
      await db.putPromptFragment(updated);
      set((state) => ({
        fragments: state.fragments.map((f) => (f.id === id ? updated : f)),
      }));
    }
  },
}));
