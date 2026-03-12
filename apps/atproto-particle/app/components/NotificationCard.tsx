import {
  Heart,
  MessageCircle,
  Repeat2,
  Quote,
  UserPlus,
  AtSign,
} from "lucide-react";
import type { NotificationItem } from "~/types";
import { linkifyText } from "~/utils/linkify";
import styles from "./NotificationCard.module.css";

const REASON_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string }
> = {
  like: { icon: <Heart size={14} />, label: "liked your post" },
  repost: { icon: <Repeat2 size={14} />, label: "reposted your post" },
  follow: { icon: <UserPlus size={14} />, label: "followed you" },
  mention: { icon: <AtSign size={14} />, label: "mentioned you" },
  reply: { icon: <MessageCircle size={14} />, label: "replied to you" },
  quote: { icon: <Quote size={14} />, label: "quoted your post" },
};

interface NotificationCardProps {
  item: NotificationItem;
}

export default function NotificationCard({ item }: NotificationCardProps) {
  const config = REASON_CONFIG[item.reason] ?? {
    icon: null,
    label: item.reason,
  };

  const time = new Date(item.indexedAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        {item.author.avatar ? (
          <img
            src={item.author.avatar}
            alt=""
            className={styles.avatar}
            loading="lazy"
          />
        ) : (
          <div className={styles.avatarPlaceholder} />
        )}
        <div className={styles.content}>
          <div className={styles.headline}>
            <span className={styles.displayName}>
              {item.author.displayName}
            </span>
            <span className={styles.reason}>
              {config.icon} {config.label}
            </span>
          </div>
          <span className={styles.handle}>@{item.author.handle}</span>
          {item.text && <p className={styles.text}>{linkifyText(item.text)}</p>}
        </div>
        <time className={styles.time}>{time}</time>
      </div>
    </article>
  );
}
