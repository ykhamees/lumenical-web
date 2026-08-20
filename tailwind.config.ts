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
          500: "#4A5C75",
          400: "#6B7C94",
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
