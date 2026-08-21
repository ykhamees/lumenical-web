export type Platform = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  features: string[];
  deploymentModes: string[];
};

export const platforms: Platform[] = [
  {
    slug: "ai-platform",
    name: "AI Platform",
    summary:
      "A bilingual, agentic AI platform — chat and retrieval, a no-code agent builder, and workflow automation, run entirely on your own infrastructure.",
    description:
      "AI Platform gives an institution its own agentic AI layer: chat backed by retrieval over its own documents, a no-code builder for assembling agents, and workflow automation governed through an admin console rather than left to run unsupervised. It's built bilingual (English and Arabic) from the ground up, not translated after the fact, and is designed to run fully on-premises for institutions that can't hand their data to someone else's cloud. It's already live at a national financial regulator, serving roughly 2,000 users entirely on-premises.",
    features: [
      "Chat and retrieval over an institution's own documents, with cited answers",
      "A no-code builder for assembling agents, with versioning and a test preview before publishing",
      "Existing workflow automation exposed as governed, auditable agent tools",
      "An embeddable, governed chat widget for other internal surfaces",
      "An admin and governance console covering users, audit log, policy, and usage analytics",
      "Bilingual (English/Arabic) from the ground up, not translated after the fact",
    ],
    deploymentModes: [
      "Fully on-premises, single-institution",
      "Live at a national financial regulator — roughly 2,000 users",
    ],
  },
  {
    slug: "hub",
    name: "Hub",
    summary:
      "Self-hosted integration middleware for the backend systems you already run — REST and SOAP hosting, integration flows, and business rules in one deployable.",
    description:
      "Hub is one deployable that hosts REST APIs and SOAP web services, runs integration flows between backend systems, and evaluates business rules through a DMN engine — administered through a single console. Secrets are encrypted by default and never appear in logs. Published integrations are immutable and roll back with one click, and everything that runs is written to an audit log. It's already carried a real production pilot: a live cutover of two production integrations at a financial-services site, complete with a rehearsed rollback.",
    features: [
      "REST and SOAP endpoint hosting behind API-key or OIDC auth",
      "Integration flows connecting HTTP, SOAP, JDBC, SFTP, and messaging systems",
      "DMN business-rule evaluation with a visual editor",
      "Centrally managed, encrypted secrets — never exposed in logs",
      "Immutable published revisions with zero-downtime rollback",
      "Scheduled batch flows and a full, exportable audit log",
    ],
    deploymentModes: [
      "Self-hosted, on your own infrastructure",
      "Air-gap tolerant — no runtime internet dependency",
      "Multi-tenant runtime for running several workspaces on one deployment",
    ],
  },
  {
    slug: "taskmaster",
    name: "Taskmaster",
    summary:
      "AI-powered project and portfolio management — one codebase, deployable as multi-tenant SaaS, self-hosted, or air-gapped.",
    description:
      "Taskmaster is project and portfolio management — kanban boards, portfolio rollups, sprints, and reporting — with an AI layer on top: notes captured straight into structured work items, a Q&A assistant grounded in your own data, and a planning agent that proposes a plan for a person to review rather than applying it itself. The same codebase runs as multi-tenant SaaS, self-hosted on your own infrastructure, or fully air-gapped against a local model. In the air-gapped mode, the deterministic project-management features and reporting are available today; full AI-assistant parity in that mode is still in progress.",
    features: [
      "Kanban boards with WIP limits, and portfolios with cross-project rollups",
      "Sprint tracking with burndown, plus a catalog of standard reports and shareable dashboards",
      "AI note-capture into structured work items, with a guard against injected instructions",
      "A Q&A assistant grounded in your own data, filtered by what each user can see",
      "A goal-to-plan agent that proposes a plan for review — it never applies changes on its own",
      "OIDC single sign-on, per-workspace data retention, API tokens, and signed webhooks",
    ],
    deploymentModes: [
      "Multi-tenant SaaS",
      "Self-hosted, on your own infrastructure",
      "Air-gapped against a local model (deterministic features and reporting today; full AI-assistant parity in progress)",
    ],
  },
];
