import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A1421",
          900: "#0E1A2B",
          800: "#142436",
          700: "#1F3047",
          600: "#324562",
          // Ink-500 is the metadata contrast floor per the Lumenical Design
          // System (design-guide.md) — never use it for body copy.
          500: "#4A5C75",
          // Ink-450 / Ink-350 (DS "--text-3") — the AA-safe tier-3 rung.
          // Ink-400 below is a NON-TEXT ink (its only DS use is the
          // wordmark's "ical", which is WCAG-exempt); it must never carry
          // UI text.
          450: "#566780",
          400: "#6B7C94",
          350: "#8694A9",
          300: "#94A1B5",
          200: "#BFC8D5",
          100: "#DFE4EC",
        },
        paper: {
          50: "#FAF7F2",
          100: "#F4EFE6",
          200: "#ECE6D9",
          300: "#DDD3BF",
        },
        signal: {
          100: "#DCE7F3",
          500: "#3A78BC",
        },
        lumen: {
          100: "#F1E5C8",
          500: "#C9A658",
        },
        success: {
          500: "#2E8056",
        },
        // Semantic surface/text roles. Values are CSS custom properties
        // (defined in globals.css) so no component ever hardcodes a
        // surface colour; see design-guide.md for the ramp these draw from.
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        "border-2": "var(--border-2)",
        "text-1": "var(--text-1)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
        "text-label": "var(--text-label)",
        "text-hover": "var(--text-hover)",
        cta: "var(--cta-bg)",
        "cta-hover": "var(--cta-bg-hover)",
        "on-cta": "var(--cta-text)",
        // Signal-500 is the button/focus-ring accent, not guaranteed AA for
        // text (fails on surface-2 in both themes) — text links use this
        // darker/lighter link-specific shade instead.
        link: "var(--link)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
