import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import styles from "./Card.module.css";

interface App {
  name: string;
  description: string;
  url: string;
  folder: string;
  tags: string[];
}

interface CardProps {
  app: App;
  Icon: ComponentType<LucideProps>;
  iconBg: string;
}

export default function Card({ app, Icon, iconBg }: CardProps) {
  const hasUrl = Boolean(app.url);

  const content = (
    <>
      <div className={styles.iconWrap} style={{ background: iconBg }}>
        <Icon size={28} color="#fff" strokeWidth={1.75} />
      </div>
      <span className={styles.name}>{app.name}</span>
    </>
  );

  if (!hasUrl) {
    return <div className={`${styles.card} ${styles.disabled}`}>{content}</div>;
  }

  return (
    <a
      href={app.url}
      className={styles.card}
      target="_blank"
      rel="noopener noreferrer"
      title={app.description}
    >
      {content}
    </a>
  );
}
