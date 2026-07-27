// @vitest-environment happy-dom

import { act, createElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const motionPreference = vi.hoisted(() => ({
  value: false as boolean | null,
}));

vi.mock("framer-motion", () => ({
  useReducedMotion: () => motionPreference.value,
}));

import { useCanAnimate, useMotionTransition } from "./useCanAnimate";

const reactTestEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

let hydratedRoot: Root | undefined;

beforeAll(() => {
  reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  if (hydratedRoot) {
    await act(async () => hydratedRoot?.unmount());
    hydratedRoot = undefined;
  }
  document.body.replaceChildren();
  motionPreference.value = false;
  vi.restoreAllMocks();
});

async function renderAndHydrateCanAnimate(
  prefersReduced: boolean | null
): Promise<{ clientValue: string | null; renderValues: boolean[] }> {
  motionPreference.value = prefersReduced;
  const renderValues: boolean[] = [];

  function Probe(): React.ReactElement {
    const canAnimate = useCanAnimate();
    renderValues.push(canAnimate);
    return createElement("output", null, String(canAnimate));
  }

  const container = document.createElement("div");
  container.innerHTML = renderToString(createElement(Probe));
  document.body.append(container);

  expect(container.textContent).toBe("false");

  hydratedRoot = hydrateRoot(container, createElement(Probe));
  await act(async () => {});

  return {
    clientValue: container.textContent,
    renderValues,
  };
}

describe("useCanAnimate", () => {
  it("keeps server and hydration output aligned, then enables allowed motion", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await renderAndHydrateCanAnimate(false);

    expect(result.renderValues[0]).toBe(false);
    expect(result.renderValues).toContain(false);
    expect(result.clientValue).toBe("true");
    expect(consoleError).not.toHaveBeenCalled();
  });

  it.each([
    { label: "reduced motion is preferred", preference: true },
    { label: "the preference is still unknown", preference: null },
  ])("stays disabled when $label", async ({ preference }) => {
    const result = await renderAndHydrateCanAnimate(preference);

    expect(result.clientValue).toBe("false");
    expect(result.renderValues.every((value) => value === false)).toBe(true);
  });
});

describe("useMotionTransition", () => {
  const full = { duration: 0.7, ease: [0.16, 1, 0.3, 1] };

  function renderTransition(
    prefersReduced: boolean | null
  ): Record<string, unknown> {
    motionPreference.value = prefersReduced;

    function Probe(): React.ReactElement {
      const transition = useMotionTransition(full);
      return createElement("output", null, JSON.stringify(transition));
    }

    const container = document.createElement("div");
    container.innerHTML = renderToString(createElement(Probe));
    const serializedTransition = container.textContent;
    if (!serializedTransition) {
      throw new Error("Transition probe did not render");
    }
    return JSON.parse(serializedTransition) as Record<string, unknown>;
  }

  it("keeps the full transition during SSR", () => {
    expect(renderTransition(null)).toEqual(full);
  });

  it("keeps the full transition when reduced motion is off", () => {
    expect(renderTransition(false)).toEqual(full);
  });

  it("snaps to duration 0 when reduced motion is preferred", () => {
    expect(renderTransition(true)).toEqual({ duration: 0 });
  });
});
