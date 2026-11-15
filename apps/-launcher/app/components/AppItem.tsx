import { getAppIcon } from "~/utils/appIcons";
import styles from "./AppItem.module.css";

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

interface AppItemProps {
  app: App;
}

export default function AppItem({ app }: AppItemProps) {
  const { Icon } = getAppIcon(app);
  const hasUrl = Boolean(app.url);

  const content = (
    <>
      <div className={`pastel-button ${styles.iconWrap}`}>
        <Icon size={28} color="currentColor" strokeWidth={1.75} />
      </div>
      <span className={styles.name}>{app.name}</span>
    </>
  );

  if (!hasUrl) {
    return (
      <div className={`${styles.item} ${styles.disabled}`}>{content}</div>
    );
  }

  return (
    <a
      href={app.url}
      className={styles.item}
      target="_blank"
      rel="noopener noreferrer"
      title={app.description}
    >
      {content}
    </a>
  );
}
