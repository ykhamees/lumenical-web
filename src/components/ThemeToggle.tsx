"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = (e: MediaQueryListEvent) => {
    if (window.localStorage.getItem("theme")) return;
    document.documentElement.classList.toggle("dark", e.matches);
    notify();
  };
  media.addEventListener("change", onMediaChange);

  return () => {
    listeners.delete(callback);
    media.removeEventListener("change", onMediaChange);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function setTheme(next: Theme) {
  document.documentElement.classList.toggle("dark", next === "dark");
  window.localStorage.setItem("theme", next);
  notify();
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-text-2 transition-colors hover:text-text-1 ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        {theme === "dark" ? (
          <>
            <circle cx="10" cy="10" r="3.5" />
            <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M4.5 15.5l1.4-1.4M14.1 5.9l1.4-1.4" />
          </>
        ) : (
          <path d="M16.5 12.3A6.5 6.5 0 0 1 7.7 3.5a6.5 6.5 0 1 0 8.8 8.8z" />
        )}
      </svg>
    </button>
  );
}
