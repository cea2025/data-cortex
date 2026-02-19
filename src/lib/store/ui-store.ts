import { create } from "zustand";

interface UIState {
  inspectorOpen: boolean;
  inspectorWidth: number;
  sidebarCollapsed: boolean;
  omnibarOpen: boolean;

  setInspectorOpen: (open: boolean) => void;
  setInspectorWidth: (width: number) => void;
  toggleSidebar: () => void;
  setOmnibarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  inspectorOpen: true,
  inspectorWidth: 400,
  sidebarCollapsed: false,
  omnibarOpen: false,

  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  setInspectorWidth: (width) => set({ inspectorWidth: width }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setOmnibarOpen: (open) => set({ omnibarOpen: open }),
}));
