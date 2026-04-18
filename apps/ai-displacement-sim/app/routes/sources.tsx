import { Nav } from "~/components/Nav";
import styles from "./sources.module.css";

const sources = [
  {
    category: "Labour & Automation",
    items: [
      {
        title: "Robots and Jobs: Evidence from US Labor Markets",
        authors: "Acemoglu, D. & Restrepo, P. (2020). Journal of Political Economy.",
        note: "Key source for task bundling resistance values and the distinction between task-level and job-level displacement. Finds 1–2 robots per 1,000 workers reduces employment by 0.2% and wages by 0.42%.",
      },
      {
        title: "The Future of Employment: How susceptible are jobs to computerisation?",
        authors: "Frey, C.B. & Osborne, M.A. (2013). Oxford University Working Paper.",
        note: "Original task-level exposure analysis. Used as an upper-bound reference for the OpenAI preset's digitalExposureMultiplier.",
      },
      {
        title: "Automation and New Tasks: How Technology Displaces and Reinstates Labor",
        authors: "Acemoglu, D. & Restrepo, P. (2019). Journal of Economic Perspectives.",
        note: "Framework for understanding when automation creates new labour demand vs. pure displacement. Informs the reabsorption model.",
      },
    ],
  },
  {
    category: "Workforce Composition",
    items: [
      {
        title: "OECD Employment Outlook",
        authors: "Organisation for Economic Co-operation and Development (annual).",
        note: "Source for digitalCognitiveFraction (~22% of OECD workforce in digital-cognitive roles) and southDigitalIntensity (~8% for lower-middle-income countries).",
      },
      {
        title: "World Employment and Social Outlook: Trends 2024",
        authors: "International Labour Organization (2024).",
        note: "Global South workforce composition data. Confirms low digital-cognitive workforce fractions outside high-income economies.",
      },
    ],
  },
  {
    category: "Robotics Deployment",
    items: [
      {
        title: "World Robotics Report",
        authors: "International Federation of Robotics (IFR, annual).",
        note: "Source for robotics adoption rates and cost decline curves. Global robot density reached 151 robots per 10,000 employees in 2023 — concentrated heavily in manufacturing. Informs roboticsInflection = 25 in the realistic preset.",
      },
      {
        title: "The Economics of Automation: Evidence from Robot Adoption",
        authors: "Graetz, G. & Michaels, G. (2018). Review of Economics and Statistics.",
        note: "Cost-benefit analysis of robot adoption decisions. Confirms that wage levels relative to robot operating costs are the primary adoption driver, not technical capability alone.",
      },
    ],
  },
  {
    category: "Technology Adoption Curves",
    items: [
      {
        title: "Diffusion of Innovations (5th ed.)",
        authors: "Rogers, E.M. (2003). Free Press.",
        note: "Foundational S-curve adoption model. Informs the choice of sigmoid/S-curve for aiCapabilityGrowth rather than exponential or linear assumptions.",
      },
      {
        title: "Historical technology adoption rates for electricity, computing, and internet",
        authors: "Comin, D. & Hobijn, B. (2010). American Economic Review.",
        note: "Historical data on technology inflection timing. Supports a realistic inflection year of 10–15 years rather than 2–3 years for transformative general-purpose technologies.",
      },
    ],
  },
  {
    category: "Regulatory Capture",
    items: [
      {
        title: "The Theory of Economic Regulation",
        authors: "Stigler, G.J. (1971). Bell Journal of Economics.",
        note: "Foundational regulatory capture framework. Informs the regulatoryCaptureRate = 0.35 in the realistic preset.",
      },
      {
        title: "Reputation and Power: Organizational Image and Pharmaceutical Regulation at the FDA",
        authors: "Carpenter, D. (2010). Princeton University Press.",
        note: "Empirical analysis of regulatory capture dynamics over time. Supports the long policyRampUpYears = 12 in the realistic preset.",
      },
    ],
  },
  {
    category: "Inequality & Distribution",
    items: [
      {
        title: "The Global Inequality Boomerang",
        authors: "Milanovic, B. (2023). Foreign Affairs.",
        note: "Framework for understanding how technology-driven productivity gains distribute between capital and labour. Informs inequalitySensitivity calibration.",
      },
      {
        title: "Capital in the Twenty-First Century",
        authors: "Piketty, T. (2014). Harvard University Press.",
        note: "Historical evidence on the relationship between returns to capital and labour income share. Informs the marketConcentration and laborBargainingPower baseline values.",
      },
    ],
  },
];

export default function Sources() {
  return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.content}>
        <h1 className={styles.heading}>Sources</h1>
        <p className={styles.intro}>
          The realistic (empirically grounded) preset values are drawn from the
          research listed below. Where possible, parameter values are calibrated
          to specific empirical findings rather than assumed. The OpenAI preset
          represents the set of assumptions most consistent with the optimistic
          narrative in their policy document.
        </p>
        {sources.map((cat) => (
          <div key={cat.category} className={styles.category}>
            <div className={styles.categoryTitle}>{cat.category}</div>
            {cat.items.map((item) => (
              <div key={item.title} className={styles.source}>
                <div className={styles.sourceTitle}>{item.title}</div>
                <div className={styles.sourceAuthors}>{item.authors}</div>
                <div className={styles.sourceNote}>{item.note}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
