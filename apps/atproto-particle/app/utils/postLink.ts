/**
 * Convert an AT URI + handle to a Bluesky web link.
 * at://did:plc:xxx/app.bsky.feed.post/rkey → https://bsky.app/profile/handle/post/rkey
 */
export function postLink(uri: string, handle: string): string {
  const parts = uri.split("/");
  const rkey = parts[parts.length - 1];
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}
