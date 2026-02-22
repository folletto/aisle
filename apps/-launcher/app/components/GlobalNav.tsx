import { useEffect, useRef, useState } from "react";
import { Github, Search, X } from "lucide-react";
import styles from "./GlobalNav.module.css";

interface GlobalNavProps {
  onSearch: (query: string) => void;
}

export default function GlobalNav({ onSearch }: GlobalNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  function openSearch() {
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
    onSearch("");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <span className={styles.brand}>Aisle</span>

        <div className={styles.actions}>
          {searchOpen ? (
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchBarIcon} />
              <input
                ref={inputRef}
                className={styles.searchInput}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search apps…"
                aria-label="Search apps"
                autoComplete="off"
              />
              <button
                className={styles.iconBtn}
                onClick={closeSearch}
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <>
              <button
                className={styles.iconBtn}
                onClick={openSearch}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <a
                href="https://github.com/folletto/aisle"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconBtn}
                aria-label="View on GitHub"
              >
                <Github size={20} />
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
