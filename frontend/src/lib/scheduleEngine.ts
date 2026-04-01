// ── Schedule Generation Engine v2 ──
// FIXED anchors: Lunch 1:00–2:00 PM, Dinner 9:00–10:00 PM (ABSOLUTE, never change)
// Study target depends on start time:
//   Before 12 PM → 9h, 12–2 PM → 7h, 2–4 PM → 5h, 4–6 PM → 4h, 6–8 PM → 3h, 8+ PM → 2h
// Blocks: Warmup(50m) → CA(120m) → Study Slots(90m) → Relax breaks

export type BlockType = 'warmup' | 'study' | 'break' | 'lunch' | 'dinner';

export interface TimeBlock {
  id: string;
  type: BlockType;
  label: string;
  description: string;
  emoji: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  isFocusBlock: boolean;
}

// ── Helpers ──

function roundUpTo10Min(date: Date): Date {
  const d = new Date(date);
  const mins = d.getMinutes();
  const rem = mins % 10;
  if (rem !== 0 || d.getSeconds() > 0 || d.getMilliseconds() > 0) {
    d.setMinutes(mins + (10 - rem), 0, 0);
  } else {
    d.setSeconds(0, 0);
  }
  return d;
}

function todayAt(hours: number, minutes: number, ref: Date): number {
  const d = new Date(ref);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

function minToMs(m: number): number { return m * 60000; }
function msToMin(ms: number): number { return Math.floor(ms / 60000); }

function getStudyTarget(startHour: number): number {
  if (startHour < 12) return 540;  // 9h
  if (startHour < 14) return 420;  // 7h
  if (startHour < 16) return 300;  // 5h
  if (startHour < 18) return 240;  // 4h
  if (startHour < 20) return 180;  // 3h
  return 120;                       // 2h
}

interface FocusTemplate {
  type: BlockType;
  label: string;
  desc: string;
  emoji: string;
  dur: number;
}

// ── Main Algorithm ──

export function generateSchedule(rawStartTime: Date): TimeBlock[] {
  const start = roundUpTo10Min(rawStartTime);
  const startHour = start.getHours() + start.getMinutes() / 60;
  const studyTarget = getStudyTarget(startHour);
  const breakDur = studyTarget >= 300 ? 20 : 10;

  // Fixed absolute anchor times
  const lunchStart = todayAt(13, 0, start);
  const lunchEnd   = todayAt(14, 0, start);
  const dinnerStart = todayAt(21, 0, start);
  const dinnerEnd   = todayAt(22, 0, start);

  // Build focus block templates
  const WARMUP = 50;
  const CA = 120;
  let remaining = studyTarget - WARMUP - CA;
  if (remaining < 0) remaining = 0;

  const focusBlocks: FocusTemplate[] = [
    { type: 'warmup', label: 'Calculation Warm-up', desc: 'Tables, Squares, Cubes, Percentages', emoji: '🧮', dur: WARMUP },
    { type: 'study', label: 'Current Affairs & GK', desc: 'Current Affairs, Banking Updates, Static GK', emoji: '📰', dur: CA },
  ];

  // Add 90m study slots for remaining focus time
  const slotEmojis = ['📚', '📖', '🎯', '💪', '🔥', '⚡'];
  if (remaining > 0) {
    const fullSlots = Math.floor(remaining / 90);
    const leftover = remaining - fullSlots * 90;

    if (fullSlots === 0 && leftover > 0) {
      focusBlocks.push({ type: 'study', label: 'Study Slot 1', desc: 'Deep focus session', emoji: slotEmojis[0], dur: leftover });
    } else if (leftover === 0) {
      for (let i = 0; i < fullSlots; i++) {
        focusBlocks.push({ type: 'study', label: `Study Slot ${i + 1}`, desc: 'Deep focus session', emoji: slotEmojis[i % slotEmojis.length], dur: 90 });
      }
    } else if (leftover >= 30) {
      for (let i = 0; i < fullSlots; i++) {
        focusBlocks.push({ type: 'study', label: `Study Slot ${i + 1}`, desc: 'Deep focus session', emoji: slotEmojis[i % slotEmojis.length], dur: 90 });
      }
      focusBlocks.push({ type: 'study', label: `Study Slot ${fullSlots + 1}`, desc: 'Deep focus session', emoji: slotEmojis[fullSlots % slotEmojis.length], dur: leftover });
    } else {
      // leftover < 30: merge into last slot
      for (let i = 0; i < fullSlots - 1; i++) {
        focusBlocks.push({ type: 'study', label: `Study Slot ${i + 1}`, desc: 'Deep focus session', emoji: slotEmojis[i % slotEmojis.length], dur: 90 });
      }
      focusBlocks.push({ type: 'study', label: `Study Slot ${fullSlots}`, desc: 'Deep focus session', emoji: slotEmojis[(fullSlots - 1) % slotEmojis.length], dur: 90 + leftover });
    }
  }

  // ── Place blocks sequentially with anchor insertion ──
  const results: TimeBlock[] = [];
  let cursor = start.getTime();
  let lunchDone = cursor >= lunchEnd;
  let dinnerDone = cursor >= dinnerEnd;
  let idCounter = 0;

  function pushBlock(type: BlockType, label: string, desc: string, emoji: string, startMs: number, durMin: number, focus: boolean) {
    results.push({
      id: `block_${idCounter++}`,
      type, label, description: desc, emoji,
      startTime: startMs,
      endTime: startMs + minToMs(durMin),
      durationMinutes: durMin,
      isFocusBlock: focus,
    });
  }

  function insertLunch() {
    if (lunchDone) return;
    pushBlock('lunch', 'Lunch Break', 'Hostel lunch — recharge & eat well', '🍽️', lunchStart, 60, false);
    cursor = lunchEnd;
    lunchDone = true;
  }

  function insertDinner() {
    if (dinnerDone) return;
    pushBlock('dinner', 'Dinner Break', 'Hostel dinner — enjoy your meal', '🍽️', dinnerStart, 60, false);
    cursor = dinnerEnd;
    dinnerDone = true;
  }

  // Handle starting during lunch/dinner
  if (!lunchDone && cursor >= lunchStart && cursor < lunchEnd) {
    insertLunch();
  }
  if (!dinnerDone && cursor >= dinnerStart && cursor < dinnerEnd) {
    insertDinner();
  }

  for (let i = 0; i < focusBlocks.length; i++) {
    const fb = focusBlocks[i];

    // ── Place Relax break before each focus block (except the first) ──
    if (i > 0) {
      const breakEnd = cursor + minToMs(breakDur);

      // Break crosses lunch?
      if (!lunchDone && cursor < lunchStart && breakEnd > lunchStart) {
        const gap = msToMin(lunchStart - cursor);
        if (gap >= 10) {
          pushBlock('break', 'Relax', 'Short break before lunch', '☕', cursor, gap, false);
        }
        cursor = lunchStart;
        insertLunch();
      }
      // Break crosses dinner?
      else if (!dinnerDone && cursor < dinnerStart && breakEnd > dinnerStart) {
        const gap = msToMin(dinnerStart - cursor);
        if (gap >= 10) {
          pushBlock('break', 'Relax', 'Short break before dinner', '☕', cursor, gap, false);
        }
        cursor = dinnerStart;
        insertDinner();
      }
      // Cursor is exactly at anchor?
      else if (!lunchDone && cursor === lunchStart) {
        insertLunch();
      } else if (!dinnerDone && cursor === dinnerStart) {
        insertDinner();
      }
      // Normal break
      else {
        pushBlock('break', 'Relax', 'Rest & recharge', '☕', cursor, breakDur, false);
        cursor = breakEnd;
      }
    }

    // ── Place focus block ──
    const blockEnd = cursor + minToMs(fb.dur);

    // Focus block crosses lunch?
    if (!lunchDone && cursor < lunchStart && blockEnd > lunchStart) {
      const part1 = msToMin(lunchStart - cursor);
      const part2 = fb.dur - part1;
      if (part1 > 0) {
        pushBlock(fb.type, fb.label + ' (Part 1)', fb.desc, fb.emoji, cursor, part1, true);
        cursor += minToMs(part1);
      }
      insertLunch();
      if (part2 > 0) {
        pushBlock(fb.type, fb.label + (part1 > 0 ? ' (Part 2)' : ''), fb.desc, fb.emoji, cursor, part2, true);
        cursor += minToMs(part2);
      }
      // Check if we now hit dinner
      if (!dinnerDone && cursor >= dinnerStart && cursor <= dinnerEnd) {
        insertDinner();
      }
      continue;
    }

    // Focus block crosses dinner?
    if (!dinnerDone && cursor < dinnerStart && blockEnd > dinnerStart) {
      const part1 = msToMin(dinnerStart - cursor);
      const part2 = fb.dur - part1;
      if (part1 > 0) {
        pushBlock(fb.type, fb.label + ' (Part 1)', fb.desc, fb.emoji, cursor, part1, true);
        cursor += minToMs(part1);
      }
      insertDinner();
      if (part2 > 0) {
        pushBlock(fb.type, fb.label + (part1 > 0 ? ' (Part 2)' : ''), fb.desc, fb.emoji, cursor, part2, true);
        cursor += minToMs(part2);
      }
      continue;
    }

    // Normal placement
    pushBlock(fb.type, fb.label, fb.desc, fb.emoji, cursor, fb.dur, true);
    cursor = blockEnd;

    // Check if we've landed on an anchor
    if (!lunchDone && cursor >= lunchStart && cursor <= lunchEnd) {
      insertLunch();
    }
    if (!dinnerDone && cursor >= dinnerStart && cursor <= dinnerEnd) {
      insertDinner();
    }
  }

  // Always show dinner if study started before 9 PM and dinner not yet inserted
  if (!dinnerDone && start.getTime() < dinnerStart) {
    insertDinner();
  }

  return results;
}

// ── Utility exports ──

export function formatTime(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function getActiveBlock(blocks: TimeBlock[], now: number = Date.now()): TimeBlock | null {
  return blocks.find(b => now >= b.startTime && now < b.endTime) || null;
}

export function getNextBlock(blocks: TimeBlock[], now: number = Date.now()): TimeBlock | null {
  return blocks.find(b => b.startTime > now) || null;
}

export function getTotalFocusCompleted(blocks: TimeBlock[], completedIds: string[]): number {
  return blocks
    .filter(b => b.isFocusBlock && completedIds.includes(b.id))
    .reduce((sum, b) => sum + b.durationMinutes, 0);
}

export function getTotalFocusMinutes(blocks: TimeBlock[]): number {
  return blocks.filter(b => b.isFocusBlock).reduce((sum, b) => sum + b.durationMinutes, 0);
}

export function getStudyTargetForDisplay(startHour: number): number {
  return getStudyTarget(startHour);
}
