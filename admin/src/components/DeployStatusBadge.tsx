"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getDeployStatus, type DeployStatus } from "@/lib/deploy-api";

const POLL_INTERVAL_MS = 20_000;

// Surfaces build-plan.md 4.7's accept criterion directly in the shell: a
// publish/unpublish action here should never silently mean "not live yet."
// Renders nothing until GitHub is configured (docs/infrastructure-admin.md)
// — same no-op-when-unset convention as Turnstile/Plausible on the
// marketing site.
export function DeployStatusBadge() {
  const [deploy, setDeploy] = useState<DeployStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const status = await getDeployStatus();
        if (!cancelled) setDeploy(status);
      } catch {
        // A transient status-check failure isn't worth alarming an admin
        // over — just skip this tick and try again next interval.
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!deploy?.configured || !deploy.status || deploy.status === "error") {
    return null;
  }

  if (deploy.status === "queued" || deploy.status === "in_progress") {
    return (
      <Pill className="border-signal-500/40 bg-signal-500/[0.06] text-text-1" href={deploy.htmlUrl}>
        Rebuilding…
      </Pill>
    );
  }

  if (deploy.conclusion === "success") {
    return (
      <Pill className="border-success-500/40 bg-success-500/[0.06] text-text-1" href={deploy.htmlUrl}>
        Live
      </Pill>
    );
  }

  return (
    <Pill className="border-red-600/40 bg-red-600/[0.06] text-text-1" href={deploy.htmlUrl}>
      Build failed
    </Pill>
  );
}

function Pill({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className: string;
  href: string | null;
}) {
  const content = (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${className}`}>{children}</span>
  );

  if (!href) return content;

  return (
    <a href={href} target="_blank" rel="noreferrer" className="hover:opacity-80">
      {content}
    </a>
  );
}
