import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import styles from "./Footer.module.css";
function formatBuildTime(iso) {
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${year} ${month} ${day} at ${hh}:${mm}`;
}
export default function Footer() {
    return (_jsx("footer", { className: styles.footer, children: _jsxs("span", { className: styles.buildTime, children: ["Last build: ", formatBuildTime(__BUILD_TIME__)] }) }));
}
