import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import Header from "~/components/Header";
import Layout from "~/components/Layout";
import TabBar, { type TabId } from "~/components/TabBar";
import MainList from "~/components/MainList";
import { resolveTimeWindow } from "~/engine/timeWindows";
import { UpdateEngine } from "~/engine/updateEngine";
import { settingsDb } from "~/db/settingsDb";
import { snapshotCache } from "~/db/snapshotCache";
import { debugStore } from "~/debug/debugStore";
import type {
  AggregatedAuthor,
  NotificationItem,
  ReshareItem,
  TimeWindow,
} from "~/types";

export default function IndexRoute() {
  const { agent, session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authors, setAuthors] = useState<AggregatedAuthor[]>([]);
  const [reshares, setReshares] = useState<ReshareItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("snapshot");

  const intervals = settingsDb.getIntervals();

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!agent) return;

      setIsLoading(true);
      setError(null);
      setProgress(null);

      try {
        debugStore.setIntervals(intervals);
        debugStore.setSessionHandle(session?.handle ?? null);

        const window = resolveTimeWindow(intervals);
        setTimeWindow(window);

        // Check cache first (unless forced refresh)
        if (!forceRefresh) {
          const cached = snapshotCache.get(window);
          if (cached) {
            setAuthors(cached.authors);
            setReshares(cached.reshares);
            setNotifications(cached.notifications);
            debugStore.setSnapshot(cached.authors);
            setIsLoading(false);
            return;
          }
        }

        const engine = new UpdateEngine(agent);

        // Fetch timeline + notifications in parallel
        setProgress("Fetching timeline...");
        const [snapshotResult, notifs] = await Promise.all([
          engine.getSnapshot(window, (pages) => {
            setProgress(`Loading timeline... page ${pages}`);
          }),
          engine.fetchNotifications(window, (pages) => {
            setProgress((prev) =>
              prev
                ? `${prev} | notifications page ${pages}`
                : `Loading notifications... page ${pages}`
            );
          }),
        ]);

        setAuthors(snapshotResult.authors);
        setReshares(snapshotResult.reshares);
        setNotifications(notifs);
        setProgress(null);

        // Cache the result
        snapshotCache.set(
          window,
          snapshotResult.authors,
          snapshotResult.reshares,
          notifs
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load timeline"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [agent, intervals]
  );

  const handleRefresh = useCallback(() => {
    snapshotCache.clear();
    fetchData(true);
  }, [fetchData]);

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

  const tabs = [
    { id: "snapshot" as TabId, label: "Snapshot", count: authors.length },
    { id: "reshares" as TabId, label: "Reshares", count: reshares.length },
    {
      id: "notifications" as TabId,
      label: "Notifications",
      count: notifications.length,
    },
  ];

  if (authLoading) {
    return (
      <Layout>
        <Header />
        <MainList
          activeTab="snapshot"
          authors={[]}
          reshares={[]}
          notifications={[]}
          isLoading={true}
        />
      </Layout>
    );
  }

  if (!session) return null;

  return (
    <Layout>
      <Header
        window={timeWindow}
        intervals={intervals}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      {error ? (
        <div
          style={{ padding: 20, color: "var(--color-danger)" }}
        >
          <p>{error}</p>
          <button
            onClick={() => fetchData(true)}
            style={{ marginTop: 8, textDecoration: "underline" }}
          >
            Retry
          </button>
        </div>
      ) : (
        <MainList
          activeTab={activeTab}
          authors={authors}
          reshares={reshares}
          notifications={notifications}
          isLoading={isLoading}
          progress={progress}
        />
      )}
    </Layout>
  );
}
