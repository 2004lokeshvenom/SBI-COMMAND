import { TimeBlock } from "@/lib/scheduleEngine";

export interface TimetableResponse {
  success: boolean;
  blocks?: TimeBlock[];
  error?: string;
}
