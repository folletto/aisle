import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Github, Search, X } from "lucide-react";
import styles from "./GlobalNav.module.css";
export default function GlobalNav({ onSearch }) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);
    useEffect(() => {
        if (searchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [searchOpen]);
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && searchOpen)
                closeSearch();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [searchOpen]);
    function openSearch() {
        setSearchOpen(true);
    }
    function closeSearch() {
        setSearchOpen(false);
        setQuery("");
        onSearch("");
    }
    function handleChange(e) {
        const val = e.target.value;
        setQuery(val);
        onSearch(val);
    }
    return (_jsx("header", { className: styles.header, children: _jsxs("nav", { className: styles.nav, children: [_jsxs("span", { className: styles.brand, children: [_jsx("span", { className: styles.brandPrefix, children: "Folletto" }), " Aisle"] }), _jsx("div", { className: styles.actions, children: searchOpen ? (_jsxs("div", { className: styles.searchBar, children: [_jsx(Search, { size: 18, className: styles.searchBarIcon }), _jsx("input", { ref: inputRef, className: styles.searchInput, type: "text", value: query, onChange: handleChange, placeholder: "Search apps\u2026", "aria-label": "Search apps", autoComplete: "off" }), _jsx("button", { className: styles.iconBtn, onClick: closeSearch, "aria-label": "Close search", children: _jsx(X, { size: 20 }) })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { className: styles.iconBtn, onClick: openSearch, "aria-label": "Search", children: _jsx(Search, { size: 20 }) }), _jsx("a", { href: "https://github.com/folletto/aisle", target: "_blank", rel: "noopener noreferrer", className: styles.iconBtn, "aria-label": "View on GitHub", children: _jsx(Github, { size: 20 }) })] })) })] }) }));
}
