"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Whether non-essential motion may run (scroll-linked parallax, autoplay
 * carousels driven by timers, etc.).
 *
 * Always `false` during SSR and the first client render so any props derived
 * from this hook match the server HTML. `useReducedMotion()` seeds its state
 * from `matchMedia` only in the browser (`null` on the server), so branching
 * SSR markup on it causes hydration mismatches.
 *
 * After mount, returns false when the user prefers reduced motion.
 */
export function useCanAnimate(): boolean {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && prefersReduced !== true;
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
