import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Nav } from "~/components/Nav";
import styles from "./_index.module.css";

export default function Index() {
  return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Interactive Simulation</div>
        <h1 className={styles.heading}>
          Making the hidden assumptions of AI labour displacement visible
        </h1>
        <p className={styles.lead}>
          OpenAI's "Industrial Policy for the Intelligence Age" makes strong
          claims about AI-driven labour disruption — but those conclusions depend
          on multiple optimistic assumptions holding simultaneously. This
          simulation exposes each assumption as an adjustable variable.
        </p>
        <p className={styles.lead}>
          Compare the <strong>OpenAI scenario</strong> against an{" "}
          <strong>empirically grounded baseline</strong> drawn from historical
          data on technology adoption, robotics deployment costs, regulatory
          capture, and labour market reabsorption. Observe how sensitive the
          outcomes are to assumptions the document treats as settled.
        </p>
        <p className={styles.lead}>
          This is not anti-AI. It is pro-honest-modelling.
        </p>
        <Link to="/simulation" className={styles.cta}>
          Open simulation <ArrowRight size={16} />
        </Link>
      </div>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Two presets</div>
          <div className={styles.cardBody}>
            Switch between the OpenAI scenario and the empirically grounded
            baseline. See the compound probability problem made visible.
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>35+ parameters</div>
          <div className={styles.cardBody}>
            Every assumption is a slider: AI growth rate, task bundle
            resistance, robotics cost curves, policy lag, regulatory capture,
            and more.
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>5 output charts</div>
          <div className={styles.cardBody}>
            Displacement curves, Gini trajectories, the policy gap, geographic
            splits, and who actually captures AI productivity gains.
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Auditable model</div>
          <div className={styles.cardBody}>
            Each formula lives in its own file. The methodology page explains
            every equation in plain language with research citations.
          </div>
        </div>
      </div>
    </div>
  );
}
