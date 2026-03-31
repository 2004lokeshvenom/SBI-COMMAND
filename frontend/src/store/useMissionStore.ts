import { create } from "zustand";

interface MissionStore {
  isMorningBriefOpen: boolean;
  isNightDebriefOpen: boolean;
  isSidebarOpen: boolean;
  openMorningBrief: () => void;
  closeMorningBrief: () => void;
  openNightDebrief: () => void;
  closeNightDebrief: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useMissionStore = create<MissionStore>((set) => ({
  isMorningBriefOpen: false,
  isNightDebriefOpen: false,
  isSidebarOpen: false,
  openMorningBrief: () => set({ isMorningBriefOpen: true }),
  closeMorningBrief: () => set({ isMorningBriefOpen: false }),
  openNightDebrief: () => set({ isNightDebriefOpen: true }),
  closeNightDebrief: () => set({ isNightDebriefOpen: false }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));
