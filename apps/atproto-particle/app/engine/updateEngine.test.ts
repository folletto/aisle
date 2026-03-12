import { describe, it, expect } from "vitest";
import { UpdateEngine } from "./updateEngine";

function makePost(
  did: string,
  handle: string,
  displayName: string,
  text: string,
  metrics: {
    replies?: number;
    reposts?: number;
    likes?: number;
    quotes?: number;
  } = {},
  createdAt?: string
) {
  return {
    post: {
      uri: `at://${did}/app.bsky.feed.post/${Math.random().toString(36).slice(2)}`,
      cid: `cid-${Math.random().toString(36).slice(2)}`,
      author: {
        did,
        handle,
        displayName,
        avatar: `https://avatar.example/${did}`,
      },
      record: {
        text,
        createdAt: createdAt ?? new Date().toISOString(),
      },
      replyCount: metrics.replies ?? 0,
      repostCount: metrics.reposts ?? 0,
      likeCount: metrics.likes ?? 0,
      quoteCount: metrics.quotes ?? 0,
    },
  };
}

describe("UpdateEngine.aggregate", () => {
  it("groups posts by author", () => {
    const posts = [
      makePost("did:1", "alice.bsky.social", "Alice", "Hello"),
      makePost("did:2", "bob.bsky.social", "Bob", "Hi there"),
      makePost("did:1", "alice.bsky.social", "Alice", "Another post"),
    ];

    const result = UpdateEngine.aggregate(posts);
    expect(result).toHaveLength(2);
  });

  it("sorts authors alphabetically by display name", () => {
    const posts = [
      makePost("did:3", "charlie.bsky.social", "Charlie", "Hi"),
      makePost("did:1", "alice.bsky.social", "Alice", "Hello"),
      makePost("did:2", "bob.bsky.social", "Bob", "Hey"),
    ];

    const result = UpdateEngine.aggregate(posts);
    expect(result.map((a) => a.displayName)).toEqual([
      "Alice",
      "Bob",
      "Charlie",
    ]);
  });

  it("selects top post by highest quotes+reposts", () => {
    const posts = [
      makePost("did:1", "alice.bsky.social", "Alice", "Low engagement", {
        reposts: 1,
        quotes: 0,
      }),
      makePost("did:1", "alice.bsky.social", "Alice", "High engagement", {
        reposts: 10,
        quotes: 5,
      }),
    ];

    const result = UpdateEngine.aggregate(posts);
    expect(result[0].topPost.text).toBe("High engagement");
  });

  it("breaks tie on quotes+reposts by replies", () => {
    const posts = [
      makePost("did:1", "alice.bsky.social", "Alice", "Few replies", {
        reposts: 5,
        quotes: 5,
        replies: 1,
      }),
      makePost("did:1", "alice.bsky.social", "Alice", "Many replies", {
        reposts: 5,
        quotes: 5,
        replies: 20,
      }),
    ];

    const result = UpdateEngine.aggregate(posts);
    expect(result[0].topPost.text).toBe("Many replies");
  });

  it("breaks tie on replies by likes", () => {
    const posts = [
      makePost("did:1", "alice.bsky.social", "Alice", "Few likes", {
        reposts: 5,
        quotes: 5,
        replies: 10,
        likes: 1,
      }),
      makePost("did:1", "alice.bsky.social", "Alice", "Many likes", {
        reposts: 5,
        quotes: 5,
        replies: 10,
        likes: 100,
      }),
    ];

    const result = UpdateEngine.aggregate(posts);
    expect(result[0].topPost.text).toBe("Many likes");
  });

  it("counts total posts per author in window", () => {
    const posts = [
      makePost("did:1", "alice.bsky.social", "Alice", "Post 1"),
      makePost("did:1", "alice.bsky.social", "Alice", "Post 2"),
      makePost("did:1", "alice.bsky.social", "Alice", "Post 3"),
    ];

    const result = UpdateEngine.aggregate(posts);
    expect(result[0].totalPostsInWindow).toBe(3);
  });

  it("uses handle as displayName fallback", () => {
    const posts = [
      makePost("did:1", "alice.bsky.social", "", "Hello"),
    ];
    // Manually clear displayName
    posts[0].post.author.displayName = undefined;

    const result = UpdateEngine.aggregate(posts);
    expect(result[0].displayName).toBe("alice.bsky.social");
  });

  it("returns empty array for no posts", () => {
    const result = UpdateEngine.aggregate([]);
    expect(result).toEqual([]);
  });
});

describe("UpdateEngine.extractMetrics", () => {
  it("extracts all metric fields", () => {
    const post = makePost("did:1", "a", "A", "text", {
      replies: 3,
      reposts: 5,
      likes: 10,
      quotes: 2,
    });
    const metrics = UpdateEngine.extractMetrics(post.post);
    expect(metrics).toEqual({
      replies: 3,
      reposts: 5,
      likes: 10,
      quotes: 2,
    });
  });

  it("defaults missing metrics to 0", () => {
    const post = {
      uri: "at://test",
      cid: "cid",
      author: { did: "did:1", handle: "a" },
      record: { text: "t", createdAt: "" },
    };
    const metrics = UpdateEngine.extractMetrics(post as any);
    expect(metrics).toEqual({
      replies: 0,
      reposts: 0,
      likes: 0,
      quotes: 0,
    });
  });
});

describe("UpdateEngine.fetchTimelineWindow", () => {
  it("does not stop early when a repost has an old createdAt", async () => {
    // Simulate a feed page where a repost (old createdAt) appears between
    // two posts that are within the window. The engine should collect both
    // in-window posts and not bail on the old one.
    const windowStart = new Date("2025-03-15T12:00:00Z");
    const windowEnd = new Date("2025-03-15T20:00:00Z");

    const feedPage = [
      makePost("did:1", "alice", "Alice", "In window 1", {}, "2025-03-15T18:00:00Z"),
      // Repost of an old post — createdAt is well before window.start
      makePost("did:2", "bob", "Bob", "Old repost", {}, "2025-03-10T08:00:00Z"),
      makePost("did:3", "charlie", "Charlie", "In window 2", {}, "2025-03-15T14:00:00Z"),
    ];

    const mockAgent = {
      getTimeline: async () => ({
        data: { feed: feedPage, cursor: undefined },
      }),
    } as any;

    const engine = new UpdateEngine(mockAgent);
    const posts = await engine.fetchTimelineWindow({
      start: windowStart,
      end: windowEnd,
    });

    // Should include both in-window posts, skipping the old repost
    expect(posts).toHaveLength(2);
    expect(posts.map((p) => p.post.record.text)).toContain("In window 1");
    expect(posts.map((p) => p.post.record.text)).toContain("In window 2");
  });

  it("stops paginating when entire page is older than window", async () => {
    const windowStart = new Date("2025-03-15T12:00:00Z");
    const windowEnd = new Date("2025-03-15T20:00:00Z");

    let callCount = 0;
    const mockAgent = {
      getTimeline: async ({ cursor }: { cursor?: string }) => {
        callCount++;
        if (!cursor) {
          return {
            data: {
              feed: [
                makePost("did:1", "alice", "Alice", "In window", {}, "2025-03-15T15:00:00Z"),
              ],
              cursor: "page2",
            },
          };
        }
        // Second page: all posts older than window
        return {
          data: {
            feed: [
              makePost("did:2", "bob", "Bob", "Old 1", {}, "2025-03-14T10:00:00Z"),
              makePost("did:3", "charlie", "Charlie", "Old 2", {}, "2025-03-14T08:00:00Z"),
            ],
            cursor: "page3",
          },
        };
      },
    } as any;

    const engine = new UpdateEngine(mockAgent);
    const posts = await engine.fetchTimelineWindow({
      start: windowStart,
      end: windowEnd,
    });

    expect(posts).toHaveLength(1);
    // Should have stopped after page 2, not fetched page 3
    expect(callCount).toBe(2);
  });
});

describe("UpdateEngine.comparePostRank", () => {
  it("ranks higher engagement first", () => {
    const a = { replies: 0, reposts: 10, likes: 0, quotes: 5 };
    const b = { replies: 0, reposts: 1, likes: 0, quotes: 0 };
    expect(UpdateEngine.comparePostRank(a, b)).toBeLessThan(0);
  });

  it("falls back to replies when engagement tied", () => {
    const a = { replies: 20, reposts: 5, likes: 0, quotes: 5 };
    const b = { replies: 1, reposts: 5, likes: 0, quotes: 5 };
    expect(UpdateEngine.comparePostRank(a, b)).toBeLessThan(0);
  });

  it("falls back to likes when replies also tied", () => {
    const a = { replies: 10, reposts: 5, likes: 100, quotes: 5 };
    const b = { replies: 10, reposts: 5, likes: 1, quotes: 5 };
    expect(UpdateEngine.comparePostRank(a, b)).toBeLessThan(0);
  });
});
