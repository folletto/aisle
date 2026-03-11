import { Heart, MessageCircle, Repeat2, Quote } from "lucide-react";
import type { ReshareItem } from "~/types";
import { linkifyText } from "~/utils/linkify";
import { postLink } from "~/utils/postLink";
import styles from "./AggregatedCard.module.css";

interface ReshareCardProps {
  item: ReshareItem;
}

export default function ReshareCard({ item }: ReshareCardProps) {
  const { post, author, resharedBy } = item;
  const postTime = post.createdAt
    ? new Date(post.createdAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <article className={styles.card}>
      <div className={styles.resharedByLine}>
        <Repeat2 size={13} />
        <span>Reshared by {resharedBy.displayName}</span>
      </div>

      <div className={styles.cardLayout}>
        <div className={styles.avatarCol}>
          {author.avatar ? (
            <img
              src={author.avatar}
              alt=""
              className={styles.avatar}
              loading="lazy"
            />
          ) : (
            <div className={styles.avatarPlaceholder} />
          )}
        </div>

        <div className={styles.contentCol}>
          <div className={styles.authorInfo}>
            <span className={styles.displayName}>{author.displayName}</span>
            <span className={styles.handle}>@{author.handle}</span>
          </div>

          <div className={styles.body}>
            <p className={styles.text}>{linkifyText(post.text)}</p>
            {postTime && (
              <a
                href={postLink(post.uri, author.handle)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.timeLink}
              >
                {postTime}
              </a>
            )}
          </div>

          <div className={styles.metrics}>
            <span className={styles.metric} title="Replies">
              <MessageCircle size={14} />
              {post.metrics.replies}
            </span>
            <span className={styles.metric} title="Reposts">
              <Repeat2 size={14} />
              {post.metrics.reposts}
            </span>
            <span className={styles.metric} title="Quotes">
              <Quote size={14} />
              {post.metrics.quotes}
            </span>
            <span className={styles.metric} title="Likes">
              <Heart size={14} />
              {post.metrics.likes}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
