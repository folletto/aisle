import { useNavigate, useSearchParams } from "react-router";
import { LogOut } from "lucide-react";
import styles from "./logged-out.module.css";

export default function LoggedOutRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const folder = searchParams.get("folder");
  const provider = searchParams.get("provider") ?? "google-drive";

  function handleSignInAgain() {
    if (folder) {
      navigate(`/login?folder=${folder}&provider=${provider}`);
    } else {
      navigate("/setup");
    }
  }

  function handleNewFolder() {
    navigate("/setup");
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <LogOut size={32} />
        </div>
        <h1 className={styles.title}>You've been signed out</h1>
        <p className={styles.subtitle}>Your session has ended.</p>
        <div className={styles.actions}>
          {folder && (
            <button className={styles.primaryBtn} onClick={handleSignInAgain}>
              Sign in again
            </button>
          )}
          <button className={styles.secondaryBtn} onClick={handleNewFolder}>
            Open a different folder
          </button>
        </div>
      </div>
    </div>
  );
}
