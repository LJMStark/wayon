"use client";

import { useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

// Hydration is a one-way environment transition, not an event source. React
// compares these stable snapshots after hydration, so no subscription is needed.
function subscribeToHydrationSnapshot(): () => void {
  return () => {};
}

function getHydratedClientSnapshot(): boolean {
  return true;
}

function getHydratedServerSnapshot(): boolean {
  return false;
}

function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToHydrationSnapshot,
    getHydratedClientSnapshot,
    getHydratedServerSnapshot
  );
}

/**
 * Whether non-essential motion may run (scroll-linked parallax, autoplay
 * carousels driven by timers, etc.).
 *
 * Always `false` during SSR and the first client render so any props derived
 * from this hook match the server HTML. `useReducedMotion()` seeds its state
 * from `matchMedia` only in the browser (`null` on the server), so branching
 * SSR markup on it causes hydration mismatches.
 *
 * After hydration, returns true only when reduced motion is explicitly off.
 */
export function useCanAnimate(): boolean {
  const isHydrated = useIsHydrated();
  const prefersReduced = useReducedMotion();

  return isHydrated && prefersReduced === false;
}

/**
 * Transition helper: keep `initial` styles identical on server and client,
 * only snap reduced-motion users to the end state (duration 0).
 */
export function useMotionTransition<T extends object>(full: T): T | { duration: number } {
  const prefersReduced = useReducedMotion();
  // During SSR prefersReduced is null — use full transition so both sides match.
  // After client init, reduced-motion users get an instant snap.
  if (prefersReduced === true) {
    return { duration: 0 };
  }
  return full;
}
