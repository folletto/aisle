import { GoogleDriveProvider } from "./google-drive";
import type { DetectResult, StorageProvider } from "./types";

export const providers: StorageProvider[] = [new GoogleDriveProvider()];

// Maps short URL slugs (used in /browse/:providerSlug/...) to internal provider names
const PROVIDER_SLUGS: Record<string, string> = {
  gdrive: "google-drive",
};

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

/** Resolve a URL slug (e.g. "gdrive") to a provider instance. */
export function getProviderBySlug(slug: string): StorageProvider | undefined {
  const name = PROVIDER_SLUGS[slug] ?? slug;
  return getProvider(name);
}

/** Convert an internal provider name (e.g. "google-drive") to its URL slug (e.g. "gdrive"). */
export function getProviderSlug(providerName: string): string {
  for (const [slug, name] of Object.entries(PROVIDER_SLUGS)) {
    if (name === providerName) return slug;
  }
  return providerName;
}
