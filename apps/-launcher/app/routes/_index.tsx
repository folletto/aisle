import { useState } from "react";
import { useLoaderData } from "react-router";
import appsData from "../../../../apps.json";
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
  launcher?: {
    icon?: string;
    colors?: [string, string];
  };
}

export function clientLoader() {
  // Import apps.json at build time so icon/color data is always bundled correctly
  return (appsData.apps as App[]).filter((app) => app.folder !== "-launcher");
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
          <p className={styles.empty}>No apps for &ldquo;{query}&rdquo;</p>
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
