import { create } from "zustand";

interface UIState {
  inspectorOpen: boolean;
  inspectorWidth: number;
  sidebarCollapsed: boolean;
  isSearchOpen: boolean;

  setInspectorOpen: (open: boolean) => void;
  setInspectorWidth: (width: number) => void;
  toggleSidebar: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  inspectorOpen: true,
  inspectorWidth: 400,
  sidebarCollapsed: false,
  isSearchOpen: false,

  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  setInspectorWidth: (width) => set({ inspectorWidth: width }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}));
