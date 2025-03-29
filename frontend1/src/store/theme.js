import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  isDarkMode: false,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
})); 