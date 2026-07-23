import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
  setDarkMode: (value: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      darkMode: true,
      sidebarOpen: true,
      setDarkMode: (value) => set({ darkMode: value }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'expenseflow-ui' },
  ),
);
