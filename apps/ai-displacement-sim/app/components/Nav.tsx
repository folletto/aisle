import { useState } from "react";
import { NavLink } from "react-router";
import { Menu, X } from "lucide-react";
import styles from "./Nav.module.css";

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  const close = () => setMenuOpen(false);

  return (
    <nav className={styles.nav}>
      <span className={styles.title}>AI Displacement Sim</span>

      {/* Desktop links */}
      <div className={styles.links}>
        <NavLink to="/simulation" className={linkClass}>Simulation</NavLink>
        <NavLink to="/methodology" className={linkClass}>Methodology</NavLink>
        <NavLink to="/sources" className={linkClass}>Sources</NavLink>
      </div>

      {/* Mobile hamburger */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <NavLink to="/simulation" className={linkClass} onClick={close}>Simulation</NavLink>
          <NavLink to="/methodology" className={linkClass} onClick={close}>Methodology</NavLink>
          <NavLink to="/sources" className={linkClass} onClick={close}>Sources</NavLink>
        </div>
      )}
    </nav>
  );
}
