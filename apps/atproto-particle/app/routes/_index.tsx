import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import Header from "~/components/Header";
import Layout from "~/components/Layout";
import MainList from "~/components/MainList";
import { resolveTimeWindow } from "~/engine/timeWindows";
import { UpdateEngine } from "~/engine/updateEngine";
import { settingsDb } from "~/db/settingsDb";
import { debugStore } from "~/debug/debugStore";
import type { AggregatedAuthor, TimeWindow } from "~/types";

export default function IndexRoute() {
  const { agent, session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authors, setAuthors] = useState<AggregatedAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow | null>(null);

  const intervals = settingsDb.getIntervals();

  const fetchData = useCallback(async () => {
    if (!agent) return;

    setIsLoading(true);
    setError(null);

    try {
      debugStore.setIntervals(intervals);
      debugStore.setSessionHandle(session?.handle ?? null);

      const window = resolveTimeWindow(intervals);
      setTimeWindow(window);

      const engine = new UpdateEngine(agent);
      const result = await engine.getSnapshot(window);
      setAuthors(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timeline");
    } finally {
      setIsLoading(false);
    }
  }, [agent, intervals]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, session, navigate]);

  // Fetch timeline data
  useEffect(() => {
    if (agent && session) {
      fetchData();
    }
  }, [agent, session, fetchData]);

  if (authLoading) {
    return (
      <Layout>
        <Header />
        <MainList authors={[]} isLoading={true} />
      </Layout>
    );
  }

  if (!session) return null;

  return (
    <Layout>
      <Header window={timeWindow} intervals={intervals} />
      {error ? (
        <div style={{ padding: 20, color: "var(--color-danger)" }}>
          <p>{error}</p>
          <button onClick={fetchData} style={{ marginTop: 8, textDecoration: "underline" }}>
            Retry
          </button>
        </div>
      ) : (
        <MainList authors={authors} isLoading={isLoading} />
      )}
    </Layout>
  );
}
