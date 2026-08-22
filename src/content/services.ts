export type Service = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  features: string[];
  /** Detail-page-only content: what an engagement looks like, and what you get. */
  engagementLooksLike: string[];
  whatYouGet: string[];
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
    engagementLooksLike: [
      "A short discovery conversation about the specific bottleneck, not a generic AI audit.",
      "A scoped build against real data and real cases, not a synthetic demo.",
      "Testing against how the work actually happens before anything reaches production.",
    ],
    whatYouGet: [
      "A system running in your infrastructure, not a slide deck or a prototype.",
      "Documentation your team can use without us in the room.",
      "Monitoring so a failure gets noticed before a person does.",
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
    engagementLooksLike: [
      "Mapping the multi-step task end to end before deciding what the agent should own versus escalate.",
      "Building the guardrails and escalation path alongside the agent, not after something goes wrong.",
      "Running the agent alongside the existing process until it's earned full trust.",
    ],
    whatYouGet: [
      "An agent that hands off cleanly when it's uncertain, instead of guessing.",
      "A visible trail of what it did and why, for anything that matters.",
      "A team that can extend it, not a black box tied to one vendor's console.",
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
    engagementLooksLike: [
      "Mapping how the process actually runs today, including the workarounds nobody wrote down.",
      "Rebuilding it as a workflow with AI handling the repetitive judgment calls.",
      "Rolling it out alongside the old process until the team trusts the new one.",
    ],
    whatYouGet: [
      "A workflow that handles the routine cases and routes the rest to a person.",
      "Fewer steps that only exist because a spreadsheet couldn't do more.",
      "A system your team can adjust as the process changes, not a rigid script.",
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
    engagementLooksLike: [
      "Starting from what the application needs to do for the people using it, not a template.",
      "Building and shipping in increments you can see and react to, not one long build in the dark.",
      "Staying on to maintain it after launch, since that's when most of the real feedback arrives.",
    ],
    whatYouGet: [
      "An application built on a stack your team, or the next vendor, can actually work in.",
      "Ongoing maintenance from the people who built it, not a cold handoff.",
      "A site or tool that's actually used, not just launched.",
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
    engagementLooksLike: [
      "An honest assessment of what your current setup actually costs and where it's fragile.",
      "A migration or build sized for the business you have, not the one a vendor wants to sell to.",
      "Handover with runbooks, not infrastructure only we understand.",
    ],
    whatYouGet: [
      "Infrastructure sized for real usage, not worst-case guesses.",
      "A cost and capacity picture you can actually plan against.",
      "Support that continues past go-live, when most infrastructure problems actually show up.",
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
    engagementLooksLike: [
      "A review of what you're running today and what it's actually costing you, in money and in time.",
      "A roadmap tied to where the business is headed, not a generic best-practices checklist.",
      "Vendor and tooling evaluations before you sign anything, not after.",
    ],
    whatYouGet: [
      "A technology plan tied to your actual growth, not a template built for a different company.",
      "An independent read on new tools, from a team that isn't selling you the tool.",
      "A roadmap your team can act on without needing us in every meeting.",
    ],
  },
];
