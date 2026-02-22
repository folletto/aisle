import { useState } from "react";
import { useLoaderData } from "react-router";
import AppItem from "~/components/AppItem";
import Footer from "~/components/Footer";
import GlobalNav from "~/components/GlobalNav";
import styles from "./_index.module.css";

interface App {
  name: string;
  description: string;
  url: string;
  folder: string;
  tags: string[];
}

export async function clientLoader() {
  const response = await fetch("/apps.json");
  if (!response.ok) throw new Error("Failed to load apps");
  const data = (await response.json()) as { apps: App[] };
  // Exclude the launcher itself from the list
  return data.apps.filter((app) => app.folder !== "-launcher");
}

export default function Index() {
  const apps = useLoaderData<typeof clientLoader>();
  const [query, setQuery] = useState("");

  const filtered =
    query.trim() === ""
      ? apps
      : apps.filter((app) => {
          const q = query.toLowerCase();
          return (
            app.name.toLowerCase().includes(q) ||
            app.description.toLowerCase().includes(q) ||
            app.tags.some((t) => t.toLowerCase().includes(q))
          );
        });

  return (
    <div className={styles.page}>
      <GlobalNav onSearch={setQuery} />

      <main className={styles.main}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No apps match &ldquo;{query}&rdquo;</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((app) => (
              <AppItem key={app.folder} app={app} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
