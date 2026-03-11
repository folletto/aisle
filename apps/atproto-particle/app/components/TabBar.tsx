import styles from "./TabBar.module.css";

export type TabId = "snapshot" | "reshares" | "notifications";

interface Tab {
  id: TabId;
  label: string;
  count: number;
}

interface TabBarProps {
  tabs: Tab[];
  active: TabId;
  onChange: (id: TabId) => void;
}

export default function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className={styles.bar}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${active === tab.id ? styles.active : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          <span className={styles.count}>{tab.count}</span>
        </button>
      ))}
    </div>
  );
}
