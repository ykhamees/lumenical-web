import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { FooterGate } from "@/components/FooterGate";
import { Header } from "@/components/Header";
import { OrganizationSchema } from "@/components/OrganizationSchema";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { site } from "@/content/site";
import "./globals.css";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

// Cookieless, no consent banner required — see /privacy/. A no-op unless
// this repo variable is actually set (see .env.example).
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

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
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: `https://${site.domain}/` },
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: `https://${site.domain}`,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#07101d" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        {PLAUSIBLE_DOMAIN && (
          <Script
            src="https://plausible.io/js/script.js"
            data-domain={PLAUSIBLE_DOMAIN}
            strategy="afterInteractive"
          />
        )}
        <WebVitalsReporter />
        <OrganizationSchema />
        <Header />
        <main id="content" className="flex-1">
          {children}
        </main>
        <FooterGate>
          <Footer />
        </FooterGate>
      </body>
    </html>
  );
}
