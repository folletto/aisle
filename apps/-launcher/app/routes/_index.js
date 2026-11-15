import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useLoaderData } from "react-router";
import appsData from "../../../../apps.json";
import AppItem from "~/components/AppItem";
import Footer from "~/components/Footer";
import GlobalNav from "~/components/GlobalNav";
import styles from "./_index.module.css";
export function clientLoader() {
    // Import apps.json at build time so icon/color data is always bundled correctly
    return appsData.apps.filter((app) => app.folder !== "-launcher");
}
export default function Index() {
    const apps = useLoaderData();
    const [query, setQuery] = useState("");
    const filtered = query.trim() === ""
        ? apps
        : apps.filter((app) => {
            const q = query.toLowerCase();
            return (app.name.toLowerCase().includes(q) ||
                app.description.toLowerCase().includes(q) ||
                app.tags.some((t) => t.toLowerCase().includes(q)));
        });
    return (_jsxs("div", { className: styles.page, children: [_jsx(GlobalNav, { onSearch: setQuery }), _jsx("main", { className: styles.main, children: filtered.length === 0 ? (_jsxs("p", { className: styles.empty, children: ["No apps for \u201C", query, "\u201D"] })) : (_jsx("div", { className: styles.grid, children: filtered.map((app) => (_jsx(AppItem, { app: app }, app.folder))) })) }), _jsx(Footer, {})] }));
}
