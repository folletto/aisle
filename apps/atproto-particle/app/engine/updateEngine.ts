import { AtpAgent } from "@atproto/api";
import type {
  AggregatedAuthor,
  NotificationItem,
  PostMetrics,
  ProcessedPost,
  ReshareItem,
  SnapshotResult,
  TimeWindow,
} from "~/types";
import { debugStore } from "~/debug/debugStore";

export interface FeedViewPost {
  post: {
    uri: string;
    cid: string;
    author: {
      did: string;
      handle: string;
      displayName?: string;
      avatar?: string;
    };
    record: { text?: string; createdAt?: string; [key: string]: unknown };
    embed?: unknown;
    replyCount?: number;
    repostCount?: number;
    likeCount?: number;
    quoteCount?: number;
  };
  reply?: unknown;
  reason?: {
    $type?: string;
    by?: {
      did: string;
      handle: string;
      displayName?: string;
      avatar?: string;
    };
    indexedAt?: string;
  };
}

export type ProgressCallback = (pagesLoaded: number) => void;

/**
 * Standalone UpdateEngine decoupled from React.
 * Can be moved to a Node.js cron job in the future.
 */
export class UpdateEngine {
  private agent: AtpAgent;

  constructor(agent: AtpAgent) {
    this.agent = agent;
  }

  /**
   * Fetch timeline posts within the given time window.
   */
  async fetchTimelineWindow(
    window: TimeWindow,
    onProgress?: ProgressCallback
  ): Promise<FeedViewPost[]> {
    const posts: FeedViewPost[] = [];
    const allRaw: FeedViewPost[] = [];
    let cursor: string | undefined;
    let pagesLoaded = 0;

    // Paginate through the timeline, collecting posts within the window.
    // The feed is ordered by indexing time, NOT by createdAt. Reposts carry
    // the *original* post's createdAt which can be much older, so a single
    // old createdAt must not stop pagination. We only stop when an entire
    // page falls before the window start.
    for (let page = 0; page < 20; page++) {
      const res = await this.agent.getTimeline({
        limit: 50,
        cursor,
      });

      if (!res.data.feed || res.data.feed.length === 0) break;
      pagesLoaded++;
      onProgress?.(pagesLoaded);

      let olderCount = 0;
      for (const item of res.data.feed) {
        const feedPost = item as unknown as FeedViewPost;
        allRaw.push(feedPost);

        const createdAt = new Date(
          (item.post.record as { createdAt?: string }).createdAt ?? ""
        );

        if (createdAt >= window.start && createdAt <= window.end) {
          posts.push(feedPost);
        }

        if (createdAt < window.start) {
          olderCount++;
        }
      }

      // Stop only when every item on the page is older than the window start
      if (olderCount === res.data.feed.length || !res.data.cursor) break;
      cursor = res.data.cursor;
    }

    // Store debug data
    debugStore.setPagesLoaded(pagesLoaded);
    debugStore.setRawPosts(allRaw.map((p) => debugStore.toRawPost(p)));

    return posts;
  }

  /**
   * Extract metrics from a feed post.
   */
  static extractMetrics(post: FeedViewPost["post"]): PostMetrics {
    return {
      replies: post.replyCount ?? 0,
      reposts: post.repostCount ?? 0,
      likes: post.likeCount ?? 0,
      quotes: post.quoteCount ?? 0,
    };
  }

  /**
   * Compare two posts for "top post" selection.
   * Returns negative if a should rank higher than b.
   */
  static comparePostRank(a: PostMetrics, b: PostMetrics): number {
    const aEngagement = a.quotes + a.reposts;
    const bEngagement = b.quotes + b.reposts;
    if (aEngagement !== bEngagement) return bEngagement - aEngagement;
    if (a.replies !== b.replies) return b.replies - a.replies;
    return b.likes - a.likes;
  }

  /**
   * Sort items by their top post's rank (most engaging first).
   */
  static sortByRank<T extends { metrics: PostMetrics }>(items: T[]): T[] {
    return [...items].sort((a, b) =>
      UpdateEngine.comparePostRank(a.metrics, b.metrics)
    );
  }

  /**
   * Process raw feed posts into aggregated author data.
   * Filters out replies and reshares — only original posts.
   */
  static aggregate(feedPosts: FeedViewPost[]): AggregatedAuthor[] {
    // Filter to original posts only (no replies, no reshares)
    const originals = feedPosts.filter(
      (item) => !item.reply && !item.reason
    );

    // Group by author DID
    const byAuthor = new Map<string, FeedViewPost[]>();

    for (const item of originals) {
      const did = item.post.author.did;
      const existing = byAuthor.get(did);
      if (existing) {
        existing.push(item);
      } else {
        byAuthor.set(did, [item]);
      }
    }

    // Process each author's posts
    const authors: AggregatedAuthor[] = [];

    for (const [did, authorPosts] of byAuthor) {
      const author = authorPosts[0].post.author;

      // Find the top post
      let topIdx = 0;
      for (let i = 1; i < authorPosts.length; i++) {
        const currentMetrics = UpdateEngine.extractMetrics(
          authorPosts[topIdx].post
        );
        const candidateMetrics = UpdateEngine.extractMetrics(
          authorPosts[i].post
        );
        if (UpdateEngine.comparePostRank(candidateMetrics, currentMetrics) < 0) {
          topIdx = i;
        }
      }

      const topFeedPost = authorPosts[topIdx];
      const topMetrics = UpdateEngine.extractMetrics(topFeedPost.post);
      const record = topFeedPost.post.record as {
        text?: string;
        createdAt?: string;
      };

      const topPost: ProcessedPost = {
        uri: topFeedPost.post.uri,
        cid: topFeedPost.post.cid,
        text: record.text ?? "",
        createdAt: record.createdAt ?? "",
        metrics: topMetrics,
        threadCount: 0,
        embed: topFeedPost.post.embed,
      };

      authors.push({
        did,
        handle: author.handle,
        displayName: author.displayName || author.handle,
        avatar: author.avatar,
        topPost,
        totalPostsInWindow: authorPosts.length,
      });
    }

    // Sort alphabetically by display name
    authors.sort((a, b) =>
      a.displayName.localeCompare(b.displayName, undefined, {
        sensitivity: "base",
      })
    );

    return authors;
  }

  /**
   * Extract reshares from feed posts, sorted by engagement rank.
   */
  static processReshares(feedPosts: FeedViewPost[]): ReshareItem[] {
    const reshares: ReshareItem[] = [];

    for (const item of feedPosts) {
      if (!item.reason?.by) continue;

      const metrics = UpdateEngine.extractMetrics(item.post);
      const record = item.post.record as {
        text?: string;
        createdAt?: string;
      };

      reshares.push({
        post: {
          uri: item.post.uri,
          cid: item.post.cid,
          text: record.text ?? "",
          createdAt: record.createdAt ?? "",
          metrics,
          threadCount: 0,
          embed: item.post.embed,
        },
        author: {
          did: item.post.author.did,
          handle: item.post.author.handle,
          displayName: item.post.author.displayName || item.post.author.handle,
          avatar: item.post.author.avatar,
        },
        resharedBy: {
          did: item.reason.by.did,
          handle: item.reason.by.handle,
          displayName:
            item.reason.by.displayName || item.reason.by.handle,
          avatar: item.reason.by.avatar,
        },
      });
    }

    // Sort by engagement rank (most popular first)
    return UpdateEngine.sortByRank(
      reshares.map((r) => ({ ...r, metrics: r.post.metrics }))
    ).map(({ metrics: _m, ...rest }) => rest as ReshareItem);
  }

  /**
   * Fetch notifications within a time window.
   */
  async fetchNotifications(
    window: TimeWindow,
    onProgress?: ProgressCallback
  ): Promise<NotificationItem[]> {
    const items: NotificationItem[] = [];
    let cursor: string | undefined;

    for (let page = 0; page < 10; page++) {
      const res = await this.agent.listNotifications({
        limit: 50,
        cursor,
      });

      if (!res.data.notifications || res.data.notifications.length === 0)
        break;
      onProgress?.(page + 1);

      let allOlder = true;
      for (const n of res.data.notifications) {
        const indexed = new Date(n.indexedAt);
        if (indexed < window.start) continue;
        if (indexed > window.end) {
          allOlder = false;
          continue;
        }
        allOlder = false;

        const record = n.record as { text?: string } | undefined;
        items.push({
          uri: n.uri,
          cid: n.cid,
          reason: n.reason,
          author: {
            did: n.author.did,
            handle: n.author.handle,
            displayName:
              (n.author.displayName as string) || n.author.handle,
            avatar: n.author.avatar as string | undefined,
          },
          indexedAt: n.indexedAt,
          text: record?.text ?? "",
          subjectUri: (n as { reasonSubject?: string }).reasonSubject,
        });
      }

      if (allOlder || !res.data.cursor) break;
      cursor = res.data.cursor;
    }

    // Sort newest first
    items.sort(
      (a, b) =>
        new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime()
    );

    return items;
  }

  /**
   * Full pipeline: fetch + aggregate + reshares.
   */
  async getSnapshot(
    window: TimeWindow,
    onProgress?: ProgressCallback
  ): Promise<SnapshotResult> {
    debugStore.setWindow(window);
    const posts = await this.fetchTimelineWindow(window, onProgress);
    const authors = UpdateEngine.aggregate(posts);
    const reshares = UpdateEngine.processReshares(posts);
    debugStore.setSnapshot(authors);
    return { authors, reshares };
  }
}
