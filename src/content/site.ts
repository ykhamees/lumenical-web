export const site = {
  name: "Lumenical",
  domain: "lumenical.com",
  tagline: "AI-powered solutions for growing businesses.",
  description:
    "Lumenical builds AI solutions, agentic AI platforms, and AI-powered workflows — plus the applications, cloud, and IT consulting behind them — for businesses of 5 to 100 people.",
  founded: 2026,
} as const;

export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "Services", href: "/services/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

export const footerLinks: NavLink[] = [];

export const differentiators = [
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
] as const;

export const stats = [
  { value: "5-100", label: "Employee sweet spot" },
  { value: "6", label: "Disciplines, one team" },
  { value: "100%", label: "Remote & online" },
] as const;
