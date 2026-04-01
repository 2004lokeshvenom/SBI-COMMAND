import { create } from "zustand";
import { generateSchedule, type TimeBlock } from "@/lib/scheduleEngine";

interface TimetableState {
  dayStarted: boolean;
  startTimestamp: number | null;
  blocks: TimeBlock[];
  completedBlockIds: string[];

  startDay: () => void;
  startWithBlocks: (blocks: TimeBlock[]) => void;
  markBlockComplete: (id: string) => void;
  undoBlockComplete: (id: string) => void;
  resetDay: () => void;
}

const STORAGE_KEY = "timetable_state";

function loadFromStorage(): Partial<TimetableState> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const data = JSON.parse(stored);
    // Check if stored date is today
    if (data.startTimestamp) {
      const storedDate = new Date(data.startTimestamp).toDateString();
      const today = new Date().toDateString();
      if (storedDate !== today) {
        localStorage.removeItem(STORAGE_KEY);
        return {};
      }
    }
    return data;
  } catch {
    return {};
  }
}

function saveToStorage(state: Partial<TimetableState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      dayStarted: state.dayStarted,
      startTimestamp: state.startTimestamp,
      blocks: state.blocks,
      completedBlockIds: state.completedBlockIds,
    }));
  } catch { /* ignore */ }
}

export const useTimetableStore = create<TimetableState>((set, get) => {
  const saved = loadFromStorage();

  return {
    dayStarted: saved.dayStarted || false,
    startTimestamp: saved.startTimestamp || null,
    blocks: saved.blocks || [],
    completedBlockIds: saved.completedBlockIds || [],

    startDay: () => {
      const now = new Date();
      const blocks = generateSchedule(now);
      const newState = {
        dayStarted: true,
        startTimestamp: now.getTime(),
        blocks,
        completedBlockIds: [] as string[],
      };
      set(newState);
      saveToStorage(newState);
    },

    startWithBlocks: (blocks: TimeBlock[]) => {
      const newState = {
        dayStarted: true,
        startTimestamp: blocks.length > 0 ? blocks[0].startTime : Date.now(),
        blocks,
        completedBlockIds: [] as string[],
      };
      set(newState);
      saveToStorage(newState);
    },

    markBlockComplete: (id: string) => {
      const state = get();
      if (state.completedBlockIds.includes(id)) return;
      const next = {
        ...state,
        completedBlockIds: [...state.completedBlockIds, id],
      };
      set(next);
      saveToStorage(next);
    },

    undoBlockComplete: (id: string) => {
      const state = get();
      const next = {
        ...state,
        completedBlockIds: state.completedBlockIds.filter(x => x !== id),
      };
      set(next);
      saveToStorage(next);
    },

    resetDay: () => {
      const newState = {
        dayStarted: false,
        startTimestamp: null,
        blocks: [] as TimeBlock[],
        completedBlockIds: [] as string[],
      };
      set(newState);
      localStorage.removeItem(STORAGE_KEY);
    },
  };
});
