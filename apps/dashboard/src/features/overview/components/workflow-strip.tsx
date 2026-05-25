import type { OverviewData } from "../hooks/use-overview-data";

export function WorkflowStrip({ data }: { data: OverviewData }) {
  const steps = [
    {
      label: "Divisions",
      meta: "across active events",
      number: "01",
      value: data.openEventsCount,
    },
    {
      label: "Proposal",
      meta: "in flight",
      number: "02",
      value: data.pendingProposalsCount,
    },
    {
      label: "Registration",
      meta: "open for registration",
      number: "03",
      value: data.openEventsCount,
    },
    {
      label: "Notifications",
      meta: "unread",
      number: "04",
      value: data.unreadCount,
    },
  ];

  return (
    <div className="grid gap-4 rounded-lg border bg-card p-6 md:grid-cols-4">
      {steps.map((step) => (
        <div key={step.number}>
          <div className="flex items-start justify-between">
            <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
              {step.label}
            </span>
            <span className="font-mono text-muted-foreground text-xs">
              {step.number}
            </span>
          </div>
          <div className="mt-2 font-semibold text-2xl tabular-nums">
            {step.value}
          </div>
          <p className="text-muted-foreground text-xs">{step.meta}</p>
          <div className="mt-3 h-1 rounded bg-muted">
            <div className="h-full w-2/3 rounded bg-primary" />
          </div>
        </div>
      ))}
    </div>
  );
}
