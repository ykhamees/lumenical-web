export type Service = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  features: string[];
};

export const services: Service[] = [
  {
    slug: "ai-solutions",
    name: "AI Solutions",
    summary:
      "Custom AI systems built around a specific problem in your business, not a bolt-on chatbot.",
    description:
      "We start from the actual bottleneck — the report nobody has time to write, the data nobody has time to review — and build the model, pipeline, or tool that removes it. Every engagement ends in something running in production, not a proof of concept that sits on a shelf.",
    features: [
      "AI feasibility assessment and scoping",
      "Custom model integration and fine-tuning",
      "Retrieval and knowledge-base systems",
      "Production deployment and monitoring",
    ],
  },
  {
    slug: "agentic-ai-platforms",
    name: "Agentic AI Platforms",
    summary:
      "Autonomous agents that complete multi-step work end to end, not just answer a question.",
    description:
      "Agentic systems plan, use tools, and carry a task through to completion — triaging a queue, reconciling records, drafting and routing documents — with a human checkpoint where it actually matters. We design the guardrails and the escalation path alongside the agent itself, not as an afterthought.",
    features: [
      "Multi-step agent design and orchestration",
      "Tool and API integration for agents",
      "Human-in-the-loop review and escalation paths",
      "Ongoing evaluation and guardrail tuning",
    ],
  },
  {
    slug: "ai-powered-business-workflows",
    name: "AI-Powered Business Workflows",
    summary:
      "Automating the repetitive parts of how your business runs, with AI handling the judgment calls.",
    description:
      "Most businesses this size have a handful of processes — intake, approvals, reporting, follow-up — held together by spreadsheets and someone's memory. We rebuild them as workflows where AI handles classification, drafting, and routing, and your team handles the exceptions.",
    features: [
      "Process mapping and automation design",
      "Integration with the tools you already use",
      "Document and data workflow automation",
      "Exception handling built in, not bolted on",
    ],
  },
  {
    slug: "applications-web-development",
    name: "Applications & Web Development",
    summary:
      "Custom applications and websites, built and maintained by the same team end to end.",
    description:
      "Whether it's a customer-facing site, an internal tool, or the application layer in front of an AI system, we design, build, and keep maintaining it — no handoff to a separate agency once launch day passes.",
    features: [
      "Web application design and development",
      "Marketing and product websites",
      "Internal tools and admin dashboards",
      "Ongoing maintenance and iteration",
    ],
  },
  {
    slug: "cloud-consulting",
    name: "Cloud Consulting",
    summary:
      "Cloud architecture and migration, including the infrastructure AI workloads actually need.",
    description:
      "We design and migrate cloud infrastructure that's sized correctly from the start — for everyday business systems and for the compute, storage, and data pipelines that AI and agentic workloads depend on.",
    features: [
      "Cloud architecture and migration planning",
      "Infrastructure for AI and data workloads",
      "Cost and capacity planning",
      "Ongoing cloud operations support",
    ],
  },
  {
    slug: "it-consulting",
    name: "IT Consulting",
    summary:
      "Technology strategy and planning from a team that isn't selling you hardware.",
    description:
      "As you grow past 20, 50, then 100 people, your technology needs change shape. We help you plan budgets, evaluate new tools before you commit to them, and build a roadmap so infrastructure and software decisions support the business instead of trailing behind it.",
    features: [
      "Technology roadmaps tied to headcount growth",
      "Vendor and tooling evaluation",
      "Budgeting and planning support",
      "Technical due diligence for fundraising or M&A",
    ],
  },
];
