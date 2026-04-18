import { NavLink } from "react-router";
import styles from "./Nav.module.css";

export function Nav() {
  return (
    <nav className={styles.nav}>
      <span className={styles.title}>AI Displacement Sim</span>
      <div className={styles.links}>
        <NavLink
          to="/simulation"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
        >
          Simulation
        </NavLink>
        <NavLink
          to="/methodology"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
        >
          Methodology
        </NavLink>
        <NavLink
          to="/sources"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
        >
          Sources
        </NavLink>
      </div>
    </nav>
  );
}
