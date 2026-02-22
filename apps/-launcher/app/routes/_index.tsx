import { useState } from "react";
import { useLoaderData } from "react-router";
import Card from "~/components/Card";
import Footer from "~/components/Footer";
import GlobalNav from "~/components/GlobalNav";
import { getAppIcon } from "~/utils/appIcons";
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
  return data.apps;
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
            {filtered.map((app) => {
              const { Icon, iconBg } = getAppIcon(app);
              return (
                <Card key={app.folder} app={app} Icon={Icon} iconBg={iconBg} />
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
