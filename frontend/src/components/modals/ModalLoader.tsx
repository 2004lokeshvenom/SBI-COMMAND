"use client";

import dynamic from "next/dynamic";

/** Split out so first paint loads less JS (modal + audio deferred). */
export const ModalLoader = dynamic(
  () => import("./ModalProvider").then((m) => m.ModalProvider),
  { ssr: false, loading: () => null }
);
