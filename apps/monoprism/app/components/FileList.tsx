import {
  Folder,
  FileText,
  Image,
  FileVideo,
  FileSpreadsheet,
  FileCode,
  File,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { DriveFile, DriveFolder } from "~/providers/types";
import styles from "./FileList.module.css";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface FileListProps {
  folderName: string;
  files: DriveFile[];
  subFolders: DriveFolder[];
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
  onSubFolderClick(folder: DriveFolder): void;
  onBreadcrumbClick(index: number): void;
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <Image size={18} />;
  if (mimeType.startsWith("video/")) return <FileVideo size={18} />;
  if (
    mimeType === "application/vnd.google-apps.spreadsheet" ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel")
  )
    return <FileSpreadsheet size={18} />;
  if (
    mimeType.includes("text/") ||
    mimeType === "application/vnd.google-apps.document" ||
    mimeType.includes("word")
  )
    return <FileText size={18} />;
  if (mimeType.includes("code") || mimeType.includes("javascript") || mimeType.includes("json"))
    return <FileCode size={18} />;
  return <File size={18} />;
}

function formatBytes(bytes?: string): string {
  if (!bytes) return "";
  const n = parseInt(bytes, 10);
  if (isNaN(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function FileList({
  folderName,
  files,
  subFolders,
  breadcrumbs,
  isLoading,
  onSubFolderClick,
  onBreadcrumbClick,
}: FileListProps) {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={24} className={styles.spinner} />
        <span>Loading…</span>
      </div>
    );
  }

  const isEmpty = files.length === 0 && subFolders.length === 0;

  return (
    <div className={styles.container}>
      {breadcrumbs.length > 0 && (
        <nav className={styles.breadcrumbs}>
          <button className={styles.crumbHome} onClick={() => onBreadcrumbClick(-1)}>
            {folderName || "Home"}
          </button>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.id} className={styles.crumbGroup}>
              <ChevronRight size={14} className={styles.crumbSep} />
              {i < breadcrumbs.length - 1 ? (
                <button
                  className={styles.crumbLink}
                  onClick={() => onBreadcrumbClick(i)}
                >
                  {crumb.name}
                </button>
              ) : (
                <span className={styles.crumbCurrent}>{crumb.name}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {isEmpty ? (
        <p className={styles.empty}>This folder is empty.</p>
      ) : (
        <div className={styles.list}>
          {subFolders.map((folder) => (
            <button
              key={folder.id}
              className={styles.row}
              onClick={() => onSubFolderClick(folder)}
            >
              <span className={styles.fileIcon} style={{ color: "#4285f4" }}>
                <Folder size={18} />
              </span>
              <span className={styles.fileName}>{folder.name}</span>
              <span className={styles.fileMeta}>Folder</span>
              <span className={styles.fileSize} />
            </button>
          ))}

          {files.map((file) => (
            <a
              key={file.id}
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.row}
            >
              <span className={styles.fileIcon}>
                {fileIcon(file.mimeType)}
              </span>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileMeta}>{formatDate(file.modifiedTime)}</span>
              <span className={styles.fileSize}>{formatBytes(file.size)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
