import type { AggregatedAuthor, TimeInterval, TimeWindow } from "~/types";

interface RawPost {
  uri: string;
  authorHandle: string;
  authorDisplayName: string;
  text: string;
  createdAt: string;
  replies: number;
  reposts: number;
  quotes: number;
  likes: number;
  isRepost: boolean;
}

export interface DebugState {
  rawPosts: RawPost[];
  snapshot: AggregatedAuthor[];
  window: TimeWindow | null;
  intervals: TimeInterval[];
  sessionHandle: string | null;
  fetchedAt: string | null;
  pagesLoaded: number;
  totalRawFetched: number;
}

const state: DebugState = {
  rawPosts: [],
  snapshot: [],
  window: null,
  intervals: [],
  sessionHandle: null,
  fetchedAt: null,
  pagesLoaded: 0,
  totalRawFetched: 0,
};

export const debugStore = {
  get(): DebugState {
    return state;
  },

  setRawPosts(posts: RawPost[]) {
    state.rawPosts = posts;
    state.totalRawFetched = posts.length;
    state.fetchedAt = new Date().toISOString();
  },

  setSnapshot(authors: AggregatedAuthor[]) {
    state.snapshot = authors;
  },

  setWindow(w: TimeWindow | null) {
    state.window = w;
  },

  setIntervals(intervals: TimeInterval[]) {
    state.intervals = intervals;
  },

  setSessionHandle(handle: string | null) {
    state.sessionHandle = handle;
  },

  setPagesLoaded(n: number) {
    state.pagesLoaded = n;
  },

  toRawPost(item: {
    post: {
      uri: string;
      author: { handle: string; displayName?: string };
      record: { text?: string; createdAt?: string; [key: string]: unknown };
      replyCount?: number;
      repostCount?: number;
      quoteCount?: number;
      likeCount?: number;
    };
    reason?: unknown;
  }): RawPost {
    return {
      uri: item.post.uri,
      authorHandle: item.post.author.handle,
      authorDisplayName: item.post.author.displayName || item.post.author.handle,
      text: (item.post.record.text ?? "").slice(0, 200),
      createdAt: item.post.record.createdAt ?? "",
      replies: item.post.replyCount ?? 0,
      reposts: item.post.repostCount ?? 0,
      quotes: item.post.quoteCount ?? 0,
      likes: item.post.likeCount ?? 0,
      isRepost: !!item.reason,
    };
  },
};
