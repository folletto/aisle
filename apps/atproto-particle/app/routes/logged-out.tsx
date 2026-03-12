import { Link } from "react-router";
import Layout from "~/components/Layout";
import styles from "./logged-out.module.css";

export default function LoggedOutRoute() {
  return (
    <Layout>
      <div className={styles.page}>
        <h1 className={styles.title}>Signed Out</h1>
        <p className={styles.message}>
          You have been signed out of Particle.
        </p>
        <Link to="/login" className={styles.link}>
          Sign in again
        </Link>
      </div>
    </Layout>
  );
}
