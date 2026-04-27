import type { SanitizedConfig } from "payload";

let cachedConfig: Promise<SanitizedConfig> | null = null;

export function getPayloadConfig(): Promise<SanitizedConfig> {
  if (!cachedConfig) {
    cachedConfig = import("@payload-config").then(({ default: config }) => config);
  }

  return cachedConfig;
}
