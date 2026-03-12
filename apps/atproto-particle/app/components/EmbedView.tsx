import { linkifyText } from "~/utils/linkify";
import styles from "./EmbedView.module.css";

// AT Protocol embed view types
interface ImageView {
  $type: "app.bsky.embed.images#view";
  images: Array<{
    thumb: string;
    fullsize: string;
    alt: string;
  }>;
}

interface ExternalView {
  $type: "app.bsky.embed.external#view";
  external: {
    uri: string;
    title: string;
    description: string;
    thumb?: string;
  };
}

interface RecordView {
  $type: "app.bsky.embed.record#view";
  record: {
    $type?: string;
    uri?: string;
    author?: {
      handle: string;
      displayName?: string;
      avatar?: string;
    };
    value?: {
      text?: string;
      createdAt?: string;
    };
    embeds?: unknown[];
  };
}

interface VideoView {
  $type: "app.bsky.embed.video#view";
  thumbnail?: string;
  playlist?: string;
  aspectRatio?: { width: number; height: number };
}

interface RecordWithMediaView {
  $type: "app.bsky.embed.recordWithMedia#view";
  record: RecordView;
  media: ImageView | ExternalView | VideoView;
}

type EmbedType =
  | ImageView
  | ExternalView
  | RecordView
  | VideoView
  | RecordWithMediaView;

interface EmbedViewProps {
  embed: unknown;
}

export default function EmbedView({ embed }: EmbedViewProps) {
  if (!embed || typeof embed !== "object") return null;

  const typed = embed as EmbedType;
  const $type = (typed as { $type?: string }).$type;
  if (!$type) return null;

  switch ($type) {
    case "app.bsky.embed.images#view":
      return <ImagesEmbed embed={typed as ImageView} />;
    case "app.bsky.embed.external#view":
      return <ExternalEmbed embed={typed as ExternalView} />;
    case "app.bsky.embed.record#view":
      return <RecordEmbed embed={typed as RecordView} />;
    case "app.bsky.embed.video#view":
      return <VideoEmbed embed={typed as VideoView} />;
    case "app.bsky.embed.recordWithMedia#view":
      return <RecordWithMediaEmbed embed={typed as RecordWithMediaView} />;
    default:
      return null;
  }
}

function ImagesEmbed({ embed }: { embed: ImageView }) {
  const count = embed.images.length;
  return (
    <div
      className={styles.imageGrid}
      data-count={count > 4 ? 4 : count}
    >
      {embed.images.slice(0, 4).map((img, i) => (
        <a
          key={i}
          href={img.fullsize}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.imageLink}
        >
          <img
            src={img.thumb}
            alt={img.alt || ""}
            className={styles.image}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}

function ExternalEmbed({ embed }: { embed: ExternalView }) {
  const { external } = embed;
  return (
    <a
      href={external.uri}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.external}
    >
      {external.thumb && (
        <img
          src={external.thumb}
          alt=""
          className={styles.externalThumb}
          loading="lazy"
        />
      )}
      <div className={styles.externalBody}>
        <span className={styles.externalDomain}>
          {getDomain(external.uri)}
        </span>
        <span className={styles.externalTitle}>{external.title}</span>
        {external.description && (
          <span className={styles.externalDesc}>
            {external.description.slice(0, 100)}
            {external.description.length > 100 ? "..." : ""}
          </span>
        )}
      </div>
    </a>
  );
}

function RecordEmbed({ embed }: { embed: RecordView }) {
  const { record } = embed;
  if (!record?.author || !record?.value) return null;

  const name = record.author.displayName || record.author.handle;

  return (
    <div className={styles.quote}>
      <div className={styles.quoteAuthor}>
        {record.author.avatar && (
          <img
            src={record.author.avatar}
            alt=""
            className={styles.quoteAvatar}
            loading="lazy"
          />
        )}
        <span className={styles.quoteName}>{name}</span>
        <span className={styles.quoteHandle}>@{record.author.handle}</span>
      </div>
      {record.value.text && (
        <p className={styles.quoteText}>{linkifyText(record.value.text)}</p>
      )}
      {record.embeds?.map((nestedEmbed, i) => (
        <EmbedView key={i} embed={nestedEmbed} />
      ))}
    </div>
  );
}

function VideoEmbed({ embed }: { embed: VideoView }) {
  if (!embed.thumbnail) return null;

  return (
    <div className={styles.video}>
      <img
        src={embed.thumbnail}
        alt="Video thumbnail"
        className={styles.videoThumb}
        loading="lazy"
      />
      <div className={styles.videoPlayIcon}>&#9654;</div>
    </div>
  );
}

function RecordWithMediaEmbed({
  embed,
}: {
  embed: RecordWithMediaView;
}) {
  return (
    <div className={styles.recordWithMedia}>
      <EmbedView embed={embed.media} />
      <EmbedView embed={embed.record} />
    </div>
  );
}

function getDomain(uri: string): string {
  try {
    return new URL(uri).hostname.replace(/^www\./, "");
  } catch {
    return uri;
  }
}
