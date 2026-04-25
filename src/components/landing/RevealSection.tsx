"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

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
  return (
    <motion.section
      initial={REVEAL_INITIAL}
      whileInView={REVEAL_TARGET}
      viewport={{ once: true, amount }}
      transition={REVEAL_TRANSITION}
      {...rest}
    />
  );
}
