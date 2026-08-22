import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
          500: "#4A5C75",
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
        // Semantic surface/text roles — duplicated from the marketing app's
        // tailwind.config.ts (deliberately not shared, see CLAUDE.md).
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
