import { create } from 'zustand';

interface MissionState {
  hasCompletedOnboarding: boolean;
  isMorningBriefOpen: boolean;
  isNightDebriefOpen: boolean;
  isTimerExpanded: boolean;
  isQuickNoteOpen: boolean;
  
  completeOnboarding: () => void;
  openMorningBrief: () => void;
  closeMorningBrief: () => void;
  
  openNightDebrief: () => void;
  closeNightDebrief: () => void;
  
  toggleTimer: () => void;
  toggleQuickNote: () => void;
}

export const useMissionStore = create<MissionState>()((set) => ({
  hasCompletedOnboarding: false,
  isMorningBriefOpen: false,
  isNightDebriefOpen: false,
  isTimerExpanded: false,
  isQuickNoteOpen: false,

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  openMorningBrief: () => set({ isMorningBriefOpen: true }),
  closeMorningBrief: () => set({ isMorningBriefOpen: false }),

  openNightDebrief: () => set({ isNightDebriefOpen: true }),
  closeNightDebrief: () => set({ isNightDebriefOpen: false }),

  toggleTimer: () => set((state) => ({ isTimerExpanded: !state.isTimerExpanded })),
  toggleQuickNote: () => set((state) => ({ isQuickNoteOpen: !state.isQuickNoteOpen })),
}));
