/**
 * SuperMemo 2 (SM-2) Algorithm implementation for Spaced Repetition.
 * Pure utility — NOT a server action.
 * Confidence rating: 1 (Brutal/Again) to 4 (Easy).
 */
export function calculateNextReview(
  confidence: number,
  prevInterval: number,
  prevEase: number,
  prevReps: number
) {
  let ease = prevEase;
  let interval = prevInterval;
  let repetitions = prevReps;

  // Grade mapping for our 4-button scale into SM-2's 0-5 range:
  // 1 (Brutal) -> 0, 2 (Hard) -> 3, 3 (Normal) -> 4, 4 (Easy) -> 5
  let grade = 0;
  if (confidence === 1) grade = 0;
  if (confidence === 2) grade = 3;
  if (confidence === 3) grade = 4;
  if (confidence === 4) grade = 5;

  if (grade >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor (EF)
  ease = ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (ease < 1.3) ease = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return { interval, ease, repetitions, nextReviewDate };
}
