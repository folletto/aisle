import { createContext, useContext, useState } from "react";
import type { StorageProvider, UserInfo } from "~/providers/types";
import { getProvider } from "~/providers/registry";

const USER_STORAGE_KEY = "monoprism:user";
const TOKEN_STORAGE_KEY = "monoprism:token";
const TOKEN_EXPIRY_KEY = "monoprism:token_expiry";
const PROVIDER_STORAGE_KEY = "monoprism:provider";

// GIS access tokens last 1 hour; store with a small safety margin
const TOKEN_TTL_MS = 3500 * 1000;

function loadStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch { return null; }
}

function loadStoredToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!token || !expiry) return null;
    if (Date.now() > Number(expiry)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      return null;
    }
    return token;
  } catch { return null; }
}

function loadStoredProvider(): StorageProvider | null {
  try {
    const name = localStorage.getItem(PROVIDER_STORAGE_KEY);
    return name ? (getProvider(name) ?? null) : null;
  } catch { return null; }
}

interface AppContextValue {
  provider: StorageProvider | null;
  token: string | null;
  user: UserInfo | null;
  setProvider(p: StorageProvider): void;
  setAuth(token: string, user: UserInfo): void;
  /** Clears only the token (e.g. on 401). Leaves user intact so silent re-auth can retry. */
  clearToken(): void;
  logout(): void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProviderState] = useState<StorageProvider | null>(() => loadStoredProvider());
  const [token, setToken] = useState<string | null>(() => loadStoredToken());
  const [user, setUser] = useState<UserInfo | null>(() => loadStoredUser());

  function setProvider(p: StorageProvider) {
    setProviderState(p);
    try { localStorage.setItem(PROVIDER_STORAGE_KEY, p.name); } catch { /* ignore */ }
  }

  function setAuth(newToken: string, newUser: UserInfo) {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + TOKEN_TTL_MS));
    } catch { /* ignore */ }
  }

  function clearToken() {
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch { /* ignore */ }
  }

  function logout() {
    if (token && provider && "revokeToken" in provider) {
      (provider as StorageProvider & { revokeToken(t: string): void }).revokeToken(token);
    }
    setToken(null);
    setUser(null);
    setProviderState(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(PROVIDER_STORAGE_KEY);
    } catch { /* ignore */ }
  }

  return (
    <AppContext.Provider value={{ provider, token, user, setProvider, setAuth, clearToken, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
}
