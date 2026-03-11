import { AtpAgent } from "@atproto/api";
import type {
  AggregatedAuthor,
  PostMetrics,
  ProcessedPost,
  TimeWindow,
} from "~/types";

interface FeedViewPost {
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
  reason?: unknown;
}

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
  async fetchTimelineWindow(window: TimeWindow): Promise<FeedViewPost[]> {
    const posts: FeedViewPost[] = [];
    let cursor: string | undefined;

    // Paginate backwards until we pass the start boundary
    for (let page = 0; page < 20; page++) {
      const res = await this.agent.getTimeline({
        limit: 50,
        cursor,
      });

      if (!res.data.feed || res.data.feed.length === 0) break;

      let passedStart = false;
      for (const item of res.data.feed) {
        const createdAt = new Date(
          (item.post.record as { createdAt?: string }).createdAt ?? ""
        );

        if (createdAt < window.start) {
          passedStart = true;
          break;
        }

        if (createdAt <= window.end) {
          posts.push(item as unknown as FeedViewPost);
        }
      }

      if (passedStart || !res.data.cursor) break;
      cursor = res.data.cursor;
    }

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
   * Process raw feed posts into aggregated author data.
   */
  static aggregate(feedPosts: FeedViewPost[]): AggregatedAuthor[] {
    // Group by author DID
    const byAuthor = new Map<string, FeedViewPost[]>();

    for (const item of feedPosts) {
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
   * Full pipeline: fetch + aggregate.
   */
  async getSnapshot(window: TimeWindow): Promise<AggregatedAuthor[]> {
    const posts = await this.fetchTimelineWindow(window);
    return UpdateEngine.aggregate(posts);
  }
}
