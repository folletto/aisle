import { createContext, useContext, useState } from "react";
import type { StorageProvider, UserInfo } from "~/providers/types";

interface AppContextValue {
  provider: StorageProvider | null;
  token: string | null;
  user: UserInfo | null;
  setProvider(p: StorageProvider): void;
  setAuth(token: string, user: UserInfo): void;
  logout(): void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProviderState] = useState<StorageProvider | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  function setProvider(p: StorageProvider) {
    setProviderState(p);
  }

  function setAuth(newToken: string, newUser: UserInfo) {
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    // Revoke token if the provider supports it
    if (token && provider && "revokeToken" in provider) {
      (provider as StorageProvider & { revokeToken(t: string): void }).revokeToken(token);
    }
    setToken(null);
    setUser(null);
  }

  return (
    <AppContext.Provider value={{ provider, token, user, setProvider, setAuth, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
}
