import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { AdminShell } from "@/components/AdminShell";
import { AdminAuthProvider } from "@/lib/auth";
import { BASE_PATH } from "@/lib/base-path";
import "./globals.css";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Lumenical — Admin",
    template: "%s — Lumenical Admin",
  },
  // Every route in this app is admin-only — noindex applies at the root
  // rather than per page, unlike the marketing site's routes.ts registry.
  robots: { index: false, follow: false },
  // metadata.icons isn't basePath-aware (same as next/image's src) — must
  // be prefixed manually.
  icons: { icon: `${BASE_PATH}/favicon.svg` },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#07101d" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <AdminAuthProvider>
          <AdminShell>{children}</AdminShell>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
