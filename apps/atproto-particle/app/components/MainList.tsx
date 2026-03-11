import type { AggregatedAuthor } from "~/types";
import AggregatedCard from "./AggregatedCard";
import styles from "./MainList.module.css";

interface MainListProps {
  authors: AggregatedAuthor[];
  isLoading: boolean;
}

export default function MainList({ authors, isLoading }: MainListProps) {
  if (isLoading) {
    return (
      <div className={styles.status}>
        <p>Loading timeline...</p>
      </div>
    );
  }

  if (authors.length === 0) {
    return (
      <div className={styles.status}>
        <p>No posts in this time window.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {authors.map((author) => (
        <AggregatedCard key={author.did} author={author} />
      ))}
    </div>
  );
}
