export interface TimeInterval {
  hour: number;
  minute: number;
}

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface PostMetrics {
  replies: number;
  reposts: number;
  likes: number;
  quotes: number;
}

export interface ProcessedPost {
  uri: string;
  cid: string;
  text: string;
  createdAt: string;
  metrics: PostMetrics;
  threadCount: number;
  embed?: unknown;
}

export interface AggregatedAuthor {
  did: string;
  handle: string;
  displayName: string;
  avatar?: string;
  topPost: ProcessedPost;
  totalPostsInWindow: number;
}

export interface ReshareItem {
  post: ProcessedPost;
  author: {
    did: string;
    handle: string;
    displayName: string;
    avatar?: string;
  };
  resharedBy: {
    did: string;
    handle: string;
    displayName: string;
    avatar?: string;
  };
}

export interface NotificationItem {
  uri: string;
  cid: string;
  reason: string;
  author: {
    did: string;
    handle: string;
    displayName: string;
    avatar?: string;
  };
  indexedAt: string;
  text: string;
  subjectUri?: string;
}

export interface SnapshotResult {
  authors: AggregatedAuthor[];
  reshares: ReshareItem[];
}

export interface UserSettings {
  intervals: TimeInterval[];
}

export const DEFAULT_INTERVALS: TimeInterval[] = [
  { hour: 9, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 20, minute: 0 },
];
