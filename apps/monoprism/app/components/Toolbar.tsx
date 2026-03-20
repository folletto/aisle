import { Globe, Lock, Users, LogOut } from "lucide-react";
import type { UserInfo } from "~/providers/types";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  folderName: string;
  permissionsCount: number | null;
  isPublic: boolean;
  user: UserInfo | null;
  onLogout(): void;
}

export default function Toolbar({
  folderName,
  permissionsCount,
  isPublic,
  user,
  onLogout,
}: ToolbarProps) {
  return (
    <header className={styles.toolbar}>
      <span className={styles.folderName}>{folderName}</span>
      <div className={styles.meta}>
        {permissionsCount !== null && (
          <span className={styles.metaItem} title={`${permissionsCount} people have access`}>
            <Users size={14} />
            {permissionsCount}
          </span>
        )}
        <span
          className={`${styles.metaItem} ${isPublic ? styles.public : styles.private}`}
          title={isPublic ? "Publicly accessible" : "Private"}
        >
          {isPublic ? <Globe size={14} /> : <Lock size={14} />}
          {isPublic ? "Public" : "Private"}
        </span>
        {user && (
          <button className={styles.userBtn} onClick={onLogout} title="Sign out">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className={styles.avatar}
              />
            ) : (
              <span className={styles.avatarInitial}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className={styles.userName}>{user.name}</span>
            <LogOut size={14} className={styles.logoutIcon} />
          </button>
        )}
      </div>
    </header>
  );
}
