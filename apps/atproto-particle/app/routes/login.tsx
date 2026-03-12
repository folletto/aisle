import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import Button from "~/components/Button";
import Layout from "~/components/Layout";
import styles from "./login.module.css";

export default function LoginRoute() {
  const { login, session } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect
  if (session) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(identifier, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Particle</h1>
          <p className={styles.subtitle}>
            Sign in with your Bluesky account
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label}>
              Handle or email
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you.bsky.social"
                className={styles.input}
                required
                autoComplete="username"
              />
            </label>

            <label className={styles.label}>
              App Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="xxxx-xxxx-xxxx-xxxx"
                className={styles.input}
                required
                autoComplete="current-password"
              />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className={styles.hint}>
            Use an{" "}
            <a
              href="https://bsky.app/settings/app-passwords"
              target="_blank"
              rel="noopener noreferrer"
            >
              App Password
            </a>{" "}
            for security.
          </p>
        </div>
      </div>
    </Layout>
  );
}
