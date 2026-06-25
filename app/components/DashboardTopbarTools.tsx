"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { buildSearchIndex, notifications } from "../data/content";
import { showToast } from "./Toast";

type DashboardTopbarToolsProps = {
  displayName: string;
  roleLabel: string;
  initials: string;
  searchPlaceholder: string;
  settingsHref?: string;
};

export function DashboardTopbarTools({
  displayName,
  roleLabel,
  initials,
  searchPlaceholder,
  settingsHref = "/dashboard/settings",
}: DashboardTopbarToolsProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchIndex = useMemo(() => buildSearchIndex(), []);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return searchIndex.filter(
      (item) => item.label.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query, searchIndex]);

  async function signOut() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <div className="dashboard-topbar-tools-wrap">
      <div className="dashboard-search" ref={searchRef}>
        <span aria-hidden="true">⌕</span>
        <input
          placeholder={searchPlaceholder}
          aria-label="Search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSearch(e.target.value.length >= 2);
          }}
          onFocus={() => query.length >= 2 && setShowSearch(true)}
          onBlur={() => window.setTimeout(() => setShowSearch(false), 150)}
        />
        {showSearch && results.length > 0 ? (
          <div className="topbar-dropdown topbar-search-results">
            {results.map((item) => (
              <button
                key={`${item.href}-${item.label}`}
                type="button"
                className="topbar-dropdown-item"
                onMouseDown={() => {
                  router.push(item.href);
                  setQuery("");
                  setShowSearch(false);
                }}
              >
                <strong>{item.label}</strong>
                <span>{item.sub}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="dashboard-user-tools">
        <div className="topbar-menu-wrap">
          <button
            type="button"
            className="topbar-icon-btn"
            aria-label="Notifications"
            onClick={() => {
              setShowNotify((v) => !v);
              setShowUser(false);
            }}
          >
            <span className="community-notify-dot" aria-hidden="true" />
            ⌘
          </button>
          {showNotify ? (
            <div className="topbar-dropdown topbar-notify-panel">
              {notifications.map((n) => (
                <Link key={n.id} href={n.href} className="topbar-dropdown-item" onClick={() => setShowNotify(false)}>
                  <strong>{n.text}</strong>
                  <span>{n.time}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="topbar-menu-wrap">
          <button
            type="button"
            className="topbar-avatar-btn"
            aria-label="User menu"
            onClick={() => {
              setShowUser((v) => !v);
              setShowNotify(false);
            }}
          >
            <div className="dashboard-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="dashboard-user-copy">
              <strong>{displayName}</strong>
              <span>{roleLabel}</span>
            </div>
          </button>
          {showUser ? (
            <div className="topbar-dropdown topbar-user-panel">
              <Link href={settingsHref} className="topbar-dropdown-item" onClick={() => setShowUser(false)}>
                Profile & Settings
              </Link>
              <Link href={settingsHref} className="topbar-dropdown-item" onClick={() => setShowUser(false)}>
                Settings
              </Link>
              <button type="button" className="topbar-dropdown-item" onClick={signOut}>
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
