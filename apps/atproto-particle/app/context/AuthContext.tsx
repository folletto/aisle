import { AtpAgent } from "@atproto/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { settingsDb } from "~/db/settingsDb";
import type { StoredSession } from "~/db/settingsDb";

interface AuthContextValue {
  agent: AtpAgent | null;
  session: StoredSession | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [agent, setAgent] = useState<AtpAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = settingsDb.getSession();
    if (stored) {
      const restoredAgent = new AtpAgent({ service: stored.service });
      restoredAgent
        .resumeSession({
          did: stored.did,
          handle: stored.handle,
          accessJwt: stored.accessJwt,
          refreshJwt: stored.refreshJwt,
          active: true,
        })
        .then(() => {
          setAgent(restoredAgent);
          setSession(stored);
        })
        .catch(() => {
          settingsDb.clearSession();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const service = "https://bsky.social";
      const newAgent = new AtpAgent({ service });
      const res = await newAgent.login({ identifier, password });

      const newSession: StoredSession = {
        did: res.data.did,
        handle: res.data.handle,
        accessJwt: newAgent.session!.accessJwt,
        refreshJwt: newAgent.session!.refreshJwt,
        service,
      };

      settingsDb.saveSession(newSession);
      setAgent(newAgent);
      setSession(newSession);
    },
    []
  );

  const logout = useCallback(() => {
    settingsDb.clearSession();
    setAgent(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ agent, session, isLoading, login, logout }),
    [agent, session, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
