// Overview screen.

function OverviewScreen({ currentUser, onNavigate }) {
  const { EVENTS, PROPOSALS, NOTIFICATIONS, APPLICATIONS, DIVISIONS, USERS } =
    window.DATA;
  const today = window.DATA.today;

  const openEvents = EVENTS.filter((e) => e.status === "open");
  const draftEvents = EVENTS.filter((e) => e.status === "draft");
  const pendingProps = PROPOSALS.filter(
    (p) => p.status === "pending" || p.status === "revision_requested"
  );
  const unread = NOTIFICATIONS.filter((n) => !n.read);

  const upcoming = EVENTS.filter(
    (e) => new Date(e.date) >= today && e.status !== "closed"
  )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const workQueue = PROPOSALS.filter(
    (p) => p.status === "pending" || p.status === "revision_requested"
  ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const pendingApps = APPLICATIONS.filter((a) => a.status === "pending").length;
  const totalDivisions = DIVISIONS.length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Welcome back, {currentUser.name.split(" ")[0]}</h1>
          <div className="sub">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            <span className="dim"> · </span>
            <span>
              {openEvents.length} open events · {pendingProps.length} proposals
              in flight
            </span>
          </div>
        </div>
        <div className="page-actions">
          <Button icon={Icons.Refresh} variant="subtle">
            Refresh
          </Button>
          <Button
            icon={Icons.Plus}
            onClick={() => onNavigate("events")}
            variant="primary"
          >
            New event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-stats">
        <StatTile
          hint={
            <>
              <span className="dot-ok" /> All services normal
            </>
          }
          label="System health"
          subText="api.committee-hub · last check 1m ago"
          value="OK"
        />
        <StatTile
          delta={`${draftEvents.length} draft`}
          label="Open events"
          onClick={() => onNavigate("events")}
          subText={`${EVENTS.length} total this semester`}
          value={openEvents.length}
        />
        <StatTile
          delta={`${PROPOSALS.filter((p) => p.status === "revision_requested").length} need revision`}
          deltaKind="warn"
          label="Pending proposals"
          onClick={() => onNavigate("proposals")}
          subText="Round 1–2 across 3 scopes"
          value={pendingProps.length}
        />
        <StatTile
          accent
          label="Unread notifications"
          onClick={() => onNavigate("notifications")}
          subText={`${pendingApps} committee applications waiting`}
          value={unread.length}
        />
      </div>

      {/* Workflow strip */}
      <Card
        action={
          <Button
            onClick={() => onNavigate("events")}
            size="sm"
            variant="subtle"
          >
            View all
          </Button>
        }
        bodyClass="tight"
        subtitle="Where active events sit in the pipeline"
        title="Event lifecycle"
      >
        <div className="workflow" style={{ border: 0, borderRadius: 0 }}>
          <WFStep
            label="Divisions"
            meta={`${pendingApps} apps to review`}
            n="1"
            progress={0.8}
            value={`${totalDivisions} created`}
          />
          <WFStep
            label="Proposal"
            meta={`${PROPOSALS.filter((p) => p.status === "approved").length} approved`}
            n="2"
            progress={0.55}
            value={`${pendingProps.length} in review`}
          />
          <WFStep
            label="Registration"
            meta={`${draftEvents.length} not yet opened`}
            n="3"
            progress={0.45}
            value={`${openEvents.length} open`}
          />
          <WFStep
            label="Notifications"
            meta={`${NOTIFICATIONS.length} this week`}
            n="4"
            progress={1 - unread.length / Math.max(NOTIFICATIONS.length, 1)}
            value={`${unread.length} unread`}
          />
        </div>
      </Card>

      <div className="grid-2" style={{ gridTemplateColumns: "1.35fr 1fr" }}>
        {/* Upcoming events */}
        <Card
          action={
            <Button
              onClick={() => onNavigate("events")}
              size="sm"
              variant="subtle"
            >
              Open Events
            </Button>
          }
          bodyClass="tight"
          subtitle="Next 5, sorted by date"
          title="Upcoming events"
        >
          <ul
            className="list"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {upcoming.map((ev) => (
              <li
                className="row-item"
                key={ev.id}
                style={{ gridTemplateColumns: "52px 1fr auto auto" }}
              >
                <DateChip date={ev.date} />
                <div style={{ minWidth: 0 }}>
                  <div className="title truncate">{ev.name}</div>
                  <div className="meta-row">
                    <span>
                      <Icons.Pin size={11} /> {ev.location}
                    </span>
                    <span>
                      <Icons.Users size={11} /> quota {ev.quota}
                    </span>
                    <span className="mono dim">{ev.id}</span>
                  </div>
                </div>
                <Badge kind={ev.type}>{STATUS_LABEL[ev.type]}</Badge>
                <StatusBadge status={ev.status} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Work queue */}
        <Card
          action={
            <Button
              onClick={() => onNavigate("proposals")}
              size="sm"
              variant="subtle"
            >
              Open Proposals
            </Button>
          }
          bodyClass="tight"
          subtitle="Pending and revision-requested"
          title="Proposal work queue"
        >
          <ul
            className="list"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {workQueue.map((p) => {
              const ev = EVENTS.find((e) => e.id === p.eventId);
              const submitter = USERS.find((u) => u.id === p.submittedById);
              return (
                <li
                  className="row-item"
                  key={p.id}
                  style={{
                    gridTemplateColumns: "1fr auto",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="title truncate" style={{ marginBottom: 4 }}>
                      {p.title}
                    </div>
                    <div className="meta-row">
                      <Avatar size="sm" user={submitter} />
                      <span>{submitter?.name}</span>
                      <span className="dim">·</span>
                      <span className="mono">{p.id}</span>
                      <span className="dim">·</span>
                      <span>round {p.submissionRound}</span>
                      <span className="dim">·</span>
                      <span>scope {p.scope}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 6,
                    }}
                  >
                    <StatusBadge status={p.status} />
                    <span className="meta dim" style={{ fontSize: 11.5 }}>
                      {fmtRel(p.submittedAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <style>{`
        .dot-ok { display: inline-block; width: 7px; height: 7px; border-radius: 999px; background: var(--st-open-fg); margin-right: 6px; vertical-align: middle; }
      `}</style>
    </div>
  );
}

function StatTile({
  label,
  value,
  delta,
  deltaKind,
  hint,
  subText,
  accent,
  onClick,
}) {
  return (
    <button
      className="card stat"
      onClick={onClick}
      style={{
        cursor: onClick ? "default" : "default",
        textAlign: "left",
        background: accent ? "var(--surface)" : "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="label">
        {label}
        {accent ? (
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--accent)",
            }}
          />
        ) : null}
      </div>
      <div className="value">
        <span>{value}</span>
        {delta ? (
          <span
            className={`delta ${deltaKind === "warn" ? "down" : deltaKind === "good" ? "up" : ""}`}
          >
            {delta}
          </span>
        ) : null}
        {hint ? <span className="delta">{hint}</span> : null}
      </div>
      {subText ? <div className="foot">{subText}</div> : null}
    </button>
  );
}

function WFStep({ n, label, value, meta, progress }) {
  return (
    <div className="step">
      <span className="num">0{n}</span>
      <span className="lbl">{label}</span>
      <span className="val">{value}</span>
      <span className="meta">{meta}</span>
      <div aria-hidden="true" className="progress">
        <span
          style={{ width: `${Math.max(6, Math.min(100, progress * 100))}%` }}
        />
      </div>
    </div>
  );
}

function DateChip({ date }) {
  const d = new Date(date);
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: "var(--surface-2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          color: "var(--text-muted)",
          letterSpacing: "0.05em",
          fontWeight: 500,
        }}
      >
        {month}
      </span>
      <span
        style={{
          fontSize: 16,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          marginTop: 2,
        }}
      >
        {d.getDate()}
      </span>
    </div>
  );
}

Object.assign(window, { OverviewScreen, StatTile, WFStep, DateChip });
