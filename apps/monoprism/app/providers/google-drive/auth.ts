import "~/types/gis.d.ts";
import type { UserInfo } from "../types";
import { GOOGLE_CLIENT_ID } from "~/config";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly openid profile email";
const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";

let scriptLoaded = false;

/** Dynamically injects the GIS script tag (idempotent). */
export function loadGisScript(): Promise<void> {
  if (scriptLoaded || typeof window === "undefined") return Promise.resolve();
  if (document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`)) {
    scriptLoaded = true;
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

/** Fetches the authenticated user's profile from the Google UserInfo endpoint. */
async function fetchUserInfo(token: string): Promise<UserInfo> {
  const res = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch user info");
  const data = await res.json() as {
    name?: string;
    email?: string;
    picture?: string;
  };
  return {
    name: data.name ?? data.email ?? "Unknown",
    email: data.email ?? "",
    avatarUrl: data.picture,
  };
}

/** Triggers the GIS token popup and resolves with a token + user info. */
export function requestToken(): Promise<{ token: string; user: UserInfo }> {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        try {
          const user = await fetchUserInfo(response.access_token);
          resolve({ token: response.access_token, user });
        } catch (err) {
          reject(err);
        }
      },
      error_callback: (err) => reject(new Error(err.type)),
    });
    client.requestAccessToken({ prompt: "select_account" });
  });
}

/**
 * Attempts a silent (no-UI) token refresh using the last-used Google account.
 * Resolves with just the access token; rejects if user interaction is required.
 */
export function requestTokenSilent(): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (err) => reject(new Error(err.type)),
    });
    client.requestAccessToken({ prompt: "" });
  });
}

/** Revokes a GIS access token. */
export function revokeToken(token: string): void {
  if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token);
  }
}
