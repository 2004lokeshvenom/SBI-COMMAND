"use client";

import { MorningBriefModal } from "./MorningBriefModal";
import { NightDebriefModal } from "./NightDebriefModal";

export function ModalProvider() {
  return (
    <>
      <MorningBriefModal />
      <NightDebriefModal />
    </>
  );
}
