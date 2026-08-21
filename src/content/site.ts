import { platforms } from "./platforms";
import { services } from "./services";

export const site = {
  name: "Lumenical",
  domain: "lumenical.com",
  tagline: "AI-powered solutions for growing businesses.",
  description:
    "Lumenical builds AI solutions and software for growing businesses, and agentic AI platforms for institutions that need to run on their own infrastructure.",
  founded: 2026,
} as const;

export type Audience = {
  key: "consulting" | "platforms";
  eyebrow: string;
  headline: string;
  description: string;
  stats: { value: string; label: string }[];
  differentiators: { title: string; body: string }[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export const audiences: Audience[] = [
  {
    key: "consulting",
    eyebrow: "For growing businesses",
    headline: "Consulting for 5 to 100 people.",
    description:
      "AI solutions, agentic AI platforms, and AI-powered workflows — plus the applications, cloud, and IT consulting behind them. One team, across the whole stack.",
    stats: [
      { value: "5-100", label: "Employee sweet spot" },
      { value: "100%", label: "Remote & online" },
    ],
    differentiators: [
      {
        title: "Built for the 5-to-100 gap",
        body: "Too small to hire an in-house AI or engineering team, too dependent on getting real systems built to make do with off-the-shelf software. We design our engagements around that exact range.",
      },
      {
        title: "One team across the stack",
        body: "The same team that designs the AI workflow builds the application and the cloud infrastructure it runs on — no handoffs between separate vendors.",
      },
      {
        title: "Practical AI, not hype",
        body: "We build AI systems that do specific, real work in your business — judged by what they get done, not by how impressive the demo looks.",
      },
    ],
    primaryCta: { label: "Get in touch", href: "/contact/" },
    secondaryCta: { label: "View services", href: "/services/" },
  },
  {
    key: "platforms",
    eyebrow: "For institutions",
    headline: "Platforms for institutions.",
    description:
      "Agentic AI, integration middleware, and project and portfolio management — built to run on your own infrastructure, not someone else's cloud.",
    stats: [
      { value: String(platforms.length), label: "Platform products" },
      { value: "100%", label: "Runs on your infrastructure" },
    ],
    differentiators: [
      {
        title: "Runs on your own infrastructure",
        body: "On-premises, self-hosted, or air-gapped — built for institutions that can't hand their data to someone else's cloud.",
      },
      {
        title: "Governed, not autonomous",
        body: "Every agent, integration, and plan runs through a console you control, with an audit trail — nothing acts unsupervised.",
      },
      {
        title: "Built by the team that runs it",
        body: "The same team that builds the platform stays with the deployment — not a license handed off for someone else to install.",
      },
    ],
    primaryCta: { label: "Get in touch", href: "/contact/" },
    secondaryCta: { label: "View platforms", href: "/platforms/" },
  },
];
