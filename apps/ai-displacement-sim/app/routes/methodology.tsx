import { Nav } from "~/components/Nav";
import styles from "./methodology.module.css";

const formulas = [
  {
    title: "AI Capability Growth",
    file: "aiCapabilityGrowth.ts",
    equation: "capability(t) = ceiling / (1 + exp(-growthRate × (t − inflectionYear)))",
    body: "Models AI capability over time as an S-curve rather than a linear or exponential function. S-curves match historical technology adoption patterns — rapid growth through a central period, then a plateau as limits are reached.",
    rationale: "The OpenAI preset uses a near-term inflection (year 3) and a ceiling of 1.0 (full superintelligence). The realistic preset uses a later inflection (year 12) and a ceiling of 0.65 — significant capability but not general superintelligence.",
  },
  {
    title: "Digital Job Exposure",
    file: "digitalJobExposure.ts",
    equation: "exposure(c) = min(1, c × digitalExposureMultiplier × (1 − humanPremium))",
    body: "Computes what fraction of digital-cognitive jobs are actually displaceable at a given capability level. The human premium captures the fraction of digital work that remains human-preferred due to trust, relational, and creative direction factors.",
    rationale: "Even high AI capability does not automatically translate to displacement. Regulatory, trust, and preference friction persists. When humanPremium = 1, exposure is zero regardless of capability.",
  },
  {
    title: "Physical Job Exposure",
    file: "physicalJobExposure.ts",
    equation: "exposure(t) = sigmoid(t, roboticsInflection, roboticsGrowthRate) × physicalTaskCoverage",
    body: "Physical jobs are gated by robotics deployment progress, not AI capability. The sigmoid function means exposure stays near zero until robotics reaches its inflection year, then grows rapidly.",
    rationale: "This is the single most important formula for challenging the document's universal displacement narrative. Realistic defaults show this curve barely moving for 15+ years — consistent with IFR data on actual robotics deployment rates.",
  },
  {
    title: "Task vs. Job Displacement",
    file: "taskVsJobDisplacement.ts",
    equation: "jobLoss = taskAutomationRate × (1 − taskBundleResistance)",
    body: "Converts task-level automation rates into actual job loss. Most roles bundle automatable tasks with non-automatable ones — so automating 60% of tasks in a role does not create 60% job loss.",
    rationale: "The document conflates task and job displacement. Acemoglu & Restrepo's research shows task bundling significantly dampens job loss relative to task automation rates.",
  },
  {
    title: "Displacement Rate",
    file: "displacementRate.ts",
    equation: "yearlyDisplaced = Σ(categoryFraction × categoryExposure × jobLossFromTasks)",
    body: "Aggregates yearly displacement across all four job categories: digital-cognitive, partial-digital, physical-routine, and physical-skilled. Partial-digital roles are additionally dampened.",
    rationale: "Separating categories makes visible that the groups most affected by AI (digital-cognitive) are a smaller fraction of the total workforce than the document implies.",
  },
  {
    title: "Reabsorption Rate",
    file: "reabsorptionRate.ts",
    equation: "reabsorbed(t) = displacedPool × reabsorptionSpeed × (1 − skillMismatchPenalty)",
    body: "Models how quickly displaced workers find new roles. The skill mismatch penalty captures age, geographic, and credential barriers that slow reabsorption.",
    rationale: "Classical economics assumes near-full reabsorption over time. This formula lets users see what happens when friction is high — as it was during the US manufacturing displacement of the 1990s–2000s.",
  },
  {
    title: "Productivity Distribution",
    file: "productivityDistribution.ts",
    equation: "shareholderShare = baseShare × (1 + concentration); workerShare = baseShare × (1 − concentration) × bargainingPower",
    body: "Splits AI productivity gains across shareholders, workers, consumers, and public revenue. Higher market concentration shifts gains toward shareholders; lower labour bargaining power reduces worker share.",
    rationale: "The document assumes good policy can redirect gains. This formula makes visible how sensitive that redirection is to market concentration (which rises naturally with AI adoption) and bargaining power (which falls as displacement rises).",
  },
  {
    title: "Inequality Trajectory",
    file: "inequalityTrajectory.ts",
    equation: "newGini = currentGini + (shareholderShare − workerShare) × sensitivityFactor",
    body: "Updates the Gini coefficient each year based on how productivity gains are distributed. Rising shareholder share relative to worker share increases inequality.",
    rationale: "Uses outputs from productivity distribution directly. The sensitivity factor is calibrated to historical Gini movements following previous technology transitions.",
  },
  {
    title: "Policy Effectiveness",
    file: "policyEffectiveness.ts",
    equation: "effectiveness(t) = ramp(t) × politicalWill × (1 − regulatoryCaptureRate)",
    body: "Models the lag between disruption onset and policy becoming effective. Even with strong legislation on paper, effectiveness ramps slowly through policyStartYear and policyRampUpYears before reaching its ceiling.",
    rationale: "This is the democratic speed problem made visible. Regulatory capture — where regulated industries gain disproportionate influence over their regulators — is historically 20–40% in fast-moving technology sectors (Stigler, 1971; Carpenter, 2004).",
  },
  {
    title: "Safety Net Coverage",
    file: "safetyNetCoverage.ts",
    equation: "coverage = min(1, baseSafetyNet + policyStrength × policyEffectiveness) × supportAdequacy",
    body: "Computes the fraction of displaced workers effectively supported by the safety net, adjusted by the adequacy of that support.",
    rationale: "Distinguishes between coverage (who is reached) and adequacy (how much support they receive). Both dimensions matter for real-world impact.",
  },
  {
    title: "Geographic Impact",
    file: "geographicImpact.ts",
    equation: "northImpact = pool × northIntensity; southImpact = pool × southIntensity × (1 − infrastructureGap)",
    body: "Separates displacement effects across Global North and Global South. The infrastructure gap captures that lower digital-infrastructure penetration reduces displacement but also limits access to AI productivity benefits.",
    rationale: "The document is US-centric. In most Global South economies, digital-cognitive work is 8–12% of the workforce (vs. ~22% in high-income economies), dramatically reducing the magnitude of displacement claims.",
  },
  {
    title: "Robot Adoption Cost",
    file: "robotAdoptionCost.ts",
    equation: "adoptionCost(t) = initialCost × exp(−costDeclineRate × t) × maintenanceOverhead",
    body: "Models the declining cost of deploying physical robotics over time. Even when robots can technically perform a job, the economic case depends on this cost relative to human labour.",
    rationale: "Low-wage sectors — where physical displacement would be most socially impactful — are often the last to see robot adoption precisely because the cost-benefit calculation only flips once wages exceed robot operating costs.",
  },
];

export default function Methodology() {
  return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.content}>
        <h1 className={styles.heading}>Methodology</h1>
        <p className={styles.intro}>
          The simulation runs a 20-year discrete model (2025–2044). Each year, it
          computes displacement, wealth distribution, and policy effectiveness
          based on the current parameters. Every formula lives in an isolated file
          to make the model auditable and individually testable. Below is a plain-
          language explanation of each formula and the rationale for its structure.
        </p>
        {formulas.map((f) => (
          <div key={f.file} className={styles.section}>
            <div className={styles.formulaTitle}>
              {f.title}
              <span className={styles.formulaLabel}>{f.file}</span>
            </div>
            <div className={styles.code}>{f.equation}</div>
            <p className={styles.body}>{f.body}</p>
            <p className={styles.rationale}>{f.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
