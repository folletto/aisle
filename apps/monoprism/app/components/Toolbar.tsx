import { useEffect, useRef, useState } from "react";
import { Globe, Lock, Users, LogOut, LogIn, X, ExternalLink } from "lucide-react";
import type { UserInfo } from "~/providers/types";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  folderName: string;
  permissionsCount: number | null;
  isPublic: boolean;
  user: UserInfo | null;
  onLogout(): void;
  onLogin?(): void;
  onClose(): void;
}

export default function Toolbar({
  folderName,
  permissionsCount,
  isPublic,
  user,
  onLogout,
  onLogin,
  onClose,
}: ToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  function handleLogout() {
    setDropdownOpen(false);
    onLogout();
  }

  return (
    <header className={styles.toolbar}>
      <span className={styles.folderName}>{folderName}</span>
      <div className={styles.meta}>
        {permissionsCount !== null && permissionsCount > 1 && (
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
          <span className={styles.metaLabel}>{isPublic ? "Public" : "Private"}</span>
        </span>

        {user ? (
          <div className={styles.userWrap} ref={dropdownRef}>
            <button
              className={styles.userBtn}
              onClick={() => setDropdownOpen((o) => !o)}
              title="Account"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className={styles.avatar} />
              ) : (
                <span className={styles.avatarInitial}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className={styles.userName}>{user.name}</span>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownInfo}>
                  <span className={styles.dropdownName}>{user.name}</span>
                  <span className={styles.dropdownEmail}>{user.email}</span>
                </div>
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  <ExternalLink size={14} />
                  Google Drive
                </a>
                <div className={styles.dropdownSep} />
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.userBtn} onClick={onLogin} title="Sign in">
            <LogIn size={14} />
            <span>Login</span>
          </button>
        )}

        <button className={styles.closeBtn} onClick={onClose} title="Close folder">
          <X size={16} />
        </button>
      </div>
    </header>
  );
}
