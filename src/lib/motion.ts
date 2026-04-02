import type { Transition } from "framer-motion";

export const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const easeFast: [number, number, number, number] = [0.25, 1, 0.5, 1];

export function fadeUp(delay = 0): {
  initial: { opacity: number; y: number };
  whileInView: { opacity: number; y: number };
  viewport: { once: boolean; margin: string };
  transition: Transition;
} {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-30px" },
    transition: { duration: 0.8, ease: easeOut, delay },
  };
}
