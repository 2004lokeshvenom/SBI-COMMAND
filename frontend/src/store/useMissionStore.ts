import { create } from "zustand";

interface MissionState {
  isSidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (val) => set({ isSidebarOpen: val }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));
