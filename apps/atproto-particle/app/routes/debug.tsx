import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useAuth } from "~/context/AuthContext";
import Layout from "~/components/Layout";
import { generateDebugReport } from "~/debug/generateReport";
import styles from "./debug.module.css";

export default function DebugRoute() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
    setReport(generateDebugReport());
  }, [session, navigate]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      textareaRef.current?.select();
    }
  }

  if (!session) return null;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.topBar}>
          <Link to="/settings" className={styles.backLink}>
            <ArrowLeft size={18} />
            Settings
          </Link>
          <button onClick={handleCopy} className={styles.copyBtn}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <h1 className={styles.heading}>Debug Report</h1>
        <p className={styles.desc}>
          Copy this markdown and paste it to share debug information.
        </p>

        <textarea
          ref={textareaRef}
          className={styles.output}
          value={report}
          readOnly
          spellCheck={false}
        />
      </div>
    </Layout>
  );
}
