import type { WeddingTrialWorkspace } from "./schema";

export const BODA_START_SEED = "sodi:boda-start:v1";

export type WeddingStartSeed = {
  at: number;
  workspace: WeddingTrialWorkspace;
  photos: string[];
  acquisitionSource: "direct" | "guest_attribution";
};
