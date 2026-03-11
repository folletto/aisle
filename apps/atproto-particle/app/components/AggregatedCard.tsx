import { Heart, MessageCircle, Repeat2, Quote } from "lucide-react";
import type { AggregatedAuthor } from "~/types";
import styles from "./AggregatedCard.module.css";

interface AggregatedCardProps {
  author: AggregatedAuthor;
}

export default function AggregatedCard({ author }: AggregatedCardProps) {
  const { topPost, totalPostsInWindow } = author;
  const otherPosts = totalPostsInWindow - 1;
  const postTime = topPost.createdAt
    ? new Date(topPost.createdAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <article className={styles.card}>
      <div className={styles.top}>
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
        <div className={styles.authorInfo}>
          <span className={styles.displayName}>{author.displayName}</span>
          <span className={styles.handle}>@{author.handle}</span>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.text}>{topPost.text}</p>
        {postTime && <time className={styles.time}>{postTime}</time>}
      </div>

      <div className={styles.metrics}>
        <span className={styles.metric} title="Replies">
          <MessageCircle size={14} />
          {topPost.metrics.replies}
        </span>
        <span className={styles.metric} title="Reposts">
          <Repeat2 size={14} />
          {topPost.metrics.reposts}
        </span>
        <span className={styles.metric} title="Quotes">
          <Quote size={14} />
          {topPost.metrics.quotes}
        </span>
        <span className={styles.metric} title="Likes">
          <Heart size={14} />
          {topPost.metrics.likes}
        </span>
      </div>

      {(topPost.threadCount > 0 || otherPosts > 0) && (
        <>
          <div className={styles.separator} />
          <div className={styles.counters}>
            {topPost.threadCount > 0 && (
              <span className={styles.counter}>
                {topPost.threadCount} in thread
              </span>
            )}
            {otherPosts > 0 && (
              <span className={styles.counter}>
                +{otherPosts} other post{otherPosts > 1 ? "s" : ""} this session
              </span>
            )}
          </div>
        </>
      )}
    </article>
  );
}
