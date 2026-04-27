"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

type RevealSectionProps = Omit<HTMLMotionProps<"section">, "initial" | "whileInView" | "viewport" | "transition"> & {
  amount?: number;
};

const REVEAL_INITIAL = { opacity: 0, y: 24 } as const;
const REVEAL_TARGET = { opacity: 1, y: 0 } as const;
const REVEAL_TRANSITION = { duration: 0.7, ease: [0.16, 1, 0.3, 1] } as const;

export function RevealSection({
  amount = 0.15,
  ...rest
}: RevealSectionProps): React.JSX.Element {
  const shouldReduce = useReducedMotion();
  return (
    <motion.section
      initial={shouldReduce ? false : REVEAL_INITIAL}
      whileInView={shouldReduce ? undefined : REVEAL_TARGET}
      viewport={{ once: true, amount }}
      transition={REVEAL_TRANSITION}
      {...rest}
    />
  );
}
