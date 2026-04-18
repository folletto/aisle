import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./SliderGroup.module.css";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SliderGroup({ title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.group}>
      <button
        className={`${styles.header} ${open ? styles.headerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.title}>{title}</span>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />
      </button>
      {open && <div className={styles.body}>{children}</div>}
    </div>
  );
}
