import { describe, expect, it } from "vitest";

/**
 * Pure predicates mirrored from useCanAnimate / useMotionTransition — the
 * hooks need a DOM runtime; these lock the SSR-safe rules.
 */
function canAnimate(mounted: boolean, prefersReduced: boolean | null): boolean {
  return mounted && prefersReduced !== true;
}

function motionTransition(
  prefersReduced: boolean | null,
  full: Record<string, unknown>
): Record<string, unknown> {
  if (prefersReduced === true) {
    return { duration: 0 };
  }
  return full;
}

describe("useCanAnimate rules", () => {
  it("is false before mount so SSR and first client paint match", () => {
    expect(canAnimate(false, null)).toBe(false);
    expect(canAnimate(false, false)).toBe(false);
    expect(canAnimate(false, true)).toBe(false);
  });

  it("is true after mount when reduced motion is not preferred", () => {
    expect(canAnimate(true, false)).toBe(true);
    expect(canAnimate(true, null)).toBe(true);
  });

  it("is false after mount when reduced motion is preferred", () => {
    expect(canAnimate(true, true)).toBe(false);
  });
});

describe("useMotionTransition rules", () => {
  const full = { duration: 0.7, ease: [0.16, 1, 0.3, 1] };

  it("keeps full transition on server (null) so markup matches client default", () => {
    expect(motionTransition(null, full)).toEqual(full);
  });

  it("keeps full transition when reduced motion is off", () => {
    expect(motionTransition(false, full)).toEqual(full);
  });

  it("snaps to duration 0 when reduced motion is on", () => {
    expect(motionTransition(true, full)).toEqual({ duration: 0 });
  });
});
