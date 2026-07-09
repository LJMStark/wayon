"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image, { type ImageProps } from "next/image";
import { useRef } from "react";

import { useCanAnimate } from "@/components/landing/useCanAnimate";

type ParallaxImageProps = Omit<ImageProps, "ref" | "fill" | "placeholder"> & {
  /**
   * Total Y travel in px across the time the section is visible.
   * Positive number → image starts shifted up by `intensity`px and ends shifted down by `intensity`px.
   */
  intensity?: number;
  containerClassName?: string;
};

export function ParallaxImage({
  intensity = 80,
  containerClassName = "",
  className = "",
  alt,
  ...imageProps
}: ParallaxImageProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  // Scroll-linked y only after mount so SSR/client static styles match.
  const canAnimate = useCanAnimate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-intensity, intensity]);

  // Static layout box is always the same; only `y` / willChange attach post-mount.
  return (
    <div
      ref={containerRef}
      className={`inset-0 overflow-hidden ${containerClassName}`}
      style={{ position: "absolute" }}
    >
      <motion.div
        className="inset-x-0"
        style={
          canAnimate
            ? {
                position: "absolute",
                top: -intensity,
                bottom: -intensity,
                y,
                willChange: "transform",
              }
            : {
                position: "absolute",
                top: 0,
                bottom: 0,
              }
        }
      >
        <Image {...imageProps} alt={alt} fill className={className} />
      </motion.div>
    </div>
  );
}
