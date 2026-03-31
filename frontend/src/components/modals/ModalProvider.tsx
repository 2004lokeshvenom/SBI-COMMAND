"use client";
import { useMissionStore } from "@/store/useMissionStore";
import { MorningBriefModal } from "./MorningBriefModal";
import { NightDebriefModal } from "./NightDebriefModal";
import { MotivationModal } from "../MotivationModal";

export function ModalProvider() {
  const { isMorningBriefOpen, closeMorningBrief, isNightDebriefOpen, closeNightDebrief } = useMissionStore();
  return (
    <>
      <MotivationModal />
      {isMorningBriefOpen && <MorningBriefModal onClose={closeMorningBrief} />}
      {isNightDebriefOpen && <NightDebriefModal onClose={closeNightDebrief} />}
    </>
  );
}
