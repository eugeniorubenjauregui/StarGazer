import { create } from 'zustand';

interface PreferencesState {
  nightMode: boolean;
  toggleNightMode: () => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  nightMode: false,
  toggleNightMode: () => set((state) => ({ nightMode: !state.nightMode })),
}));
