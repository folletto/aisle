import { GoogleDriveProvider } from "./google-drive";
import type { DetectResult, StorageProvider } from "./types";

export const providers: StorageProvider[] = [new GoogleDriveProvider()];

export function detectProvider(url: string): DetectResult {
  for (const p of providers) {
    const result = p.detectUrl(url);
    if (result.valid) return result;
  }
  return { valid: false };
}

export function getProvider(name: string): StorageProvider | undefined {
  return providers.find((p) => p.name === name);
}
