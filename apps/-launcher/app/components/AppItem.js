import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { getAppIcon } from "~/utils/appIcons";
import styles from "./AppItem.module.css";
export default function AppItem({ app }) {
    const { Icon, iconColor } = getAppIcon(app);
    const hasUrl = Boolean(app.url);
    const content = (_jsxs(_Fragment, { children: [_jsx("div", { className: `pastel-button ${styles.iconWrap}`, children: _jsx(Icon, { size: 28, color: iconColor, strokeWidth: 1.75 }) }), _jsx("span", { className: styles.name, children: app.name })] }));
    if (!hasUrl) {
        return (_jsx("div", { className: `${styles.item} ${styles.disabled}`, children: content }));
    }
    return (_jsx("a", { href: app.url, className: styles.item, target: "_blank", rel: "noopener noreferrer", title: app.description, children: content }));
}
