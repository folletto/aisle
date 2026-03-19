import { Home, Folder } from "lucide-react";
import type { DriveFolder } from "~/providers/types";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  rootFolders: DriveFolder[];
  selectedId: string | null;
  isHomeSelected: boolean;
  onSelect(folder: DriveFolder): void;
  onHomeSelect(): void;
}

export default function Sidebar({
  rootFolders,
  selectedId,
  isHomeSelected,
  onSelect,
  onHomeSelect,
}: SidebarProps) {
  return (
    <nav className={styles.sidebar}>
      <button
        className={`${styles.tab} ${isHomeSelected ? styles.active : ""}`}
        onClick={onHomeSelect}
      >
        <Home size={16} />
        <span>Home</span>
      </button>

      {rootFolders.length > 0 && (
        <div className={styles.divider} />
      )}

      {rootFolders.map((folder) => (
        <button
          key={folder.id}
          className={`${styles.tab} ${selectedId === folder.id ? styles.active : ""}`}
          onClick={() => onSelect(folder)}
          title={folder.name}
        >
          <Folder size={16} />
          <span>{folder.name}</span>
        </button>
      ))}
    </nav>
  );
}
