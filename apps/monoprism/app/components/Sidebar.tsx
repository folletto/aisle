import { useEffect, useState } from "react";
import { CircleDot, Dot, ChevronsUpDown, ChevronsDownUp } from "lucide-react";
import type { DriveFolder } from "~/providers/types";
import styles from "./Sidebar.module.css";

type Item = { type: "home" } | { type: "folder"; folder: DriveFolder };

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
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    setMobileExpanded(false);
  }, [selectedId, isHomeSelected]);

  const allItems: Item[] = [
    { type: "home" },
    ...rootFolders.map((f): Item => ({ type: "folder", folder: f })),
  ];

  const selectedIndex = isHomeSelected
    ? 0
    : Math.max(0, allItems.findIndex((i) => i.type === "folder" && i.folder.id === selectedId));

  const selectedName =
    isHomeSelected ? "Home" : rootFolders.find((f) => f.id === selectedId)?.name ?? "Home";

  const beforeItems = allItems.slice(0, selectedIndex);
  const afterItems = allItems.slice(selectedIndex + 1);

  function handleSelect(item: Item) {
    if (item.type === "home") {
      onHomeSelect();
    } else {
      onSelect(item.folder);
    }
    setMobileExpanded(false);
  }

  function renderItem(item: Item, isActive: boolean) {
    const id = item.type === "home" ? "home" : item.folder.id;
    const name = item.type === "home" ? "Home" : item.folder.name;
    return (
      <button
        key={id}
        className={`${styles.tab} ${isActive ? styles.active : ""}`}
        onClick={() => handleSelect(item)}
        title={name}
      >
        {isActive ? <CircleDot size={16} /> : <Dot size={16} />}
        <span>{name}</span>
      </button>
    );
  }

  return (
    <nav className={styles.sidebar}>
      {/* Desktop: single flat list in natural order */}
      <div className={styles.desktopList}>
        {allItems.map((item, i) => renderItem(item, i === selectedIndex))}
      </div>

      {/* Mobile: split structure so items animate above and below the selected item */}
      <div className={styles.mobileLayout}>
        <div className={`${styles.itemsOuter} ${mobileExpanded ? styles.itemsExpanded : ""}`}>
          <div className={styles.items}>
            {beforeItems.map((item) => renderItem(item, false))}
          </div>
        </div>

        <button
          className={`${styles.tab} ${styles.active} ${styles.mobileToggle}`}
          onClick={() => setMobileExpanded((e) => !e)}
        >
          <CircleDot size={16} />
          <span>{selectedName}</span>
          {mobileExpanded
            ? <ChevronsDownUp size={16} className={styles.toggleChevron} />
            : <ChevronsUpDown size={16} className={styles.toggleChevron} />
          }
        </button>

        <div className={`${styles.itemsOuter} ${mobileExpanded ? styles.itemsExpanded : ""}`}>
          <div className={styles.items}>
            {afterItems.map((item) => renderItem(item, false))}
          </div>
        </div>
      </div>
    </nav>
  );
}
