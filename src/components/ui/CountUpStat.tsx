"use client";

import { useEffect, useRef, useState } from "react";

type CountUpStatProps = {
  value: string;
  suffix?: string;
  label: string;
  duration?: number;
};

// Parse "160M" → { num: 160, letterSuffix: "M" }
// Parse "2,000,000" → { num: 2000000, letterSuffix: "" }
function parseValue(raw: string): { num: number; letterSuffix: string } {
  const stripped = raw.replace(/,/g, "");
  const match = stripped.match(/^([\d.]+)([A-Za-z]*)$/);
  if (!match) return { num: 0, letterSuffix: raw };
  return {
    num: parseFloat(match[1]),
    letterSuffix: match[2] ?? "",
  };
}

// Re-add thousand commas matching the original format
function formatNumber(value: number, isDecimal: boolean): string {
  if (isDecimal) {
    return value.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Ease-out cubic — fast start, decelerates to the final value
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CountUpStat({
  value,
  suffix = "",
  label,
  duration = 1800,
}: CountUpStatProps): React.JSX.Element {
  const { num: target, letterSuffix } = parseValue(value);
  const isDecimal = value.includes(".");
  const isLongMetric =
    value.replace(/[,\s.]/g, "").length + letterSuffix.length + suffix.trim().length >= 8;
  const valueClassName = isLongMetric
    ? "text-[clamp(1.48rem,2.9vw,2.2rem)]"
    : "text-[clamp(1.65rem,3.4vw,2.55rem)]";
  const [displayed, setDisplayed] = useState("0");
  const [triggered, setTriggered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Trigger once on viewport entry
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animate once triggered
  useEffect(() => {
    if (!triggered) return;

    const startTime = performance.now();

    function tick(now: number): void {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = eased * target;

      setDisplayed(formatNumber(current, isDecimal));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Land exactly on the original formatted value
        setDisplayed(formatNumber(target, isDecimal));
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [triggered, target, duration, isDecimal]);

  return (
    <div ref={wrapperRef} className="flex flex-col items-center">
      <div
        className={[
          "mb-2 inline-flex max-w-full items-baseline justify-center whitespace-nowrap font-semibold leading-none text-[#0f2858]",
          valueClassName,
        ].join(" ")}
      >
        {displayed}
        {letterSuffix}
        <span className="ml-1 shrink-0 text-[0.5em]">{suffix}</span>
      </div>
      <div className="text-sm text-[#555555]">{label}</div>
    </div>
  );
}
