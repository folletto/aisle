import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AggregatedCard from "./AggregatedCard";
import type { AggregatedAuthor } from "~/types";

const mockAuthor: AggregatedAuthor = {
  did: "did:plc:test123",
  handle: "alice.bsky.social",
  displayName: "Alice",
  avatar: "https://example.com/avatar.jpg",
  topPost: {
    uri: "at://did:plc:test123/app.bsky.feed.post/abc",
    cid: "cid-abc",
    text: "Hello world, this is a test post!",
    createdAt: "2025-03-15T10:30:00.000Z",
    metrics: {
      replies: 5,
      reposts: 12,
      likes: 42,
      quotes: 3,
    },
    threadCount: 2,
    embed: undefined,
  },
  totalPostsInWindow: 4,
};

describe("AggregatedCard", () => {
  it("renders author display name and handle", () => {
    render(<AggregatedCard author={mockAuthor} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("@alice.bsky.social")).toBeInTheDocument();
  });

  it("renders post text", () => {
    render(<AggregatedCard author={mockAuthor} />);
    expect(
      screen.getByText("Hello world, this is a test post!")
    ).toBeInTheDocument();
  });

  it("renders metrics", () => {
    render(<AggregatedCard author={mockAuthor} />);
    expect(screen.getByText("5")).toBeInTheDocument(); // replies
    expect(screen.getByText("12")).toBeInTheDocument(); // reposts
    expect(screen.getByText("42")).toBeInTheDocument(); // likes
    expect(screen.getByText("3")).toBeInTheDocument(); // quotes
  });

  it("renders thread counter", () => {
    render(<AggregatedCard author={mockAuthor} />);
    expect(screen.getByText("2 in thread")).toBeInTheDocument();
  });

  it("renders session counter for other posts", () => {
    render(<AggregatedCard author={mockAuthor} />);
    // 4 total - 1 top post = 3 other posts
    expect(
      screen.getByText("+3 other posts this session")
    ).toBeInTheDocument();
  });

  it("renders avatar image", () => {
    render(<AggregatedCard author={mockAuthor} />);
    const img = screen.getByRole("presentation");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("does not show counters when single post and no thread", () => {
    const singlePost: AggregatedAuthor = {
      ...mockAuthor,
      topPost: { ...mockAuthor.topPost, threadCount: 0 },
      totalPostsInWindow: 1,
    };
    render(<AggregatedCard author={singlePost} />);
    expect(screen.queryByText(/in thread/)).not.toBeInTheDocument();
    expect(screen.queryByText(/other post/)).not.toBeInTheDocument();
  });
});
