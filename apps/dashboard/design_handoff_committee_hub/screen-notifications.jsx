// Notifications screen.

const NOTIF_META = {
  proposal_approved: {
    kind: "approved",
    icon: "Check",
    label: "Proposal approved",
  },
  proposal_rejected: {
    kind: "rejected",
    icon: "X",
    label: "Proposal rejected",
  },
  proposal_revision_requested: {
    kind: "revision",
    icon: "Refresh",
    label: "Revision requested",
  },
  application_accepted: {
    kind: "accepted",
    icon: "Users",
    label: "Application accepted",
  },
  application_rejected: {
    kind: "rejected",
    icon: "Users",
    label: "Application rejected",
  },
  registration_success: {
    kind: "open",
    icon: "Ticket",
    label: "Registration success",
  },
};

function NotificationsScreen({ currentUser, state, dispatch }) {
  const all = state.notifications.filter((n) => true); // demo: show all to current user
  const [tab, setTab] = useState("all");

  const filtered =
    tab === "all"
      ? all
      : tab === "unread"
        ? all.filter((n) => !n.read)
        : all.filter((n) => n.read);

  const unread = all.filter((n) => !n.read).length;

  function markRead(id) {
    dispatch({ type: "MARK_READ", id });
  }
  function markAll() {
    dispatch({ type: "MARK_ALL_READ" });
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <div className="sub">
            {unread} unread of {all.length} total
          </div>
        </div>
        <div className="page-actions">
          <Button disabled={unread === 0} onClick={markAll} variant="subtle">
            Mark all read
          </Button>
        </div>
      </div>

      <div className="row" style={{ justifyContent: "space-between" }}>
        <Segmented
          onChange={setTab}
          options={[
            { value: "all", label: `All (${all.length})` },
            { value: "unread", label: `Unread (${unread})` },
            { value: "read", label: `Read (${all.length - unread})` },
          ]}
          value={tab}
        />
        <div className="muted" style={{ fontSize: 12.5 }}>
          Showing {filtered.length}
        </div>
      </div>

      <Card bodyClass="tight">
        {filtered.length === 0 ? (
          <EmptyState
            desc={
              tab === "unread"
                ? "No unread notifications. Nice work."
                : "Nothing to show in this view."
            }
            icon={Icons.Notifications}
            title={tab === "unread" ? "Inbox zero" : "No notifications"}
          />
        ) : (
          <ul
            className="list"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {filtered.map((n) => {
              const meta = NOTIF_META[n.type] || {
                kind: "",
                icon: "Dot",
                label: n.type,
              };
              const IconComp = Icons[meta.icon] || Icons.Dot;
              return (
                <li
                  className="row-item"
                  key={n.id}
                  style={{
                    gridTemplateColumns: "32px 1fr auto auto",
                    background: n.read
                      ? undefined
                      : "color-mix(in oklch, var(--accent) 4%, var(--surface))",
                  }}
                >
                  <span
                    className="icon-pill"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      background: `var(--st-${meta.kind}-bg, var(--bg-2))`,
                      color: `var(--st-${meta.kind}-fg, var(--text-muted))`,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <IconComp size={15} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {!n.read && (
                        <span
                          aria-hidden="true"
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 999,
                            background: "var(--accent)",
                            display: "inline-block",
                            flex: "0 0 auto",
                          }}
                        />
                      )}
                      <span style={{ fontWeight: n.read ? 500 : 600 }}>
                        {meta.label}
                      </span>
                    </div>
                    <div
                      className="muted"
                      style={{ fontSize: 12.8, marginTop: 2 }}
                    >
                      {n.message}
                    </div>
                  </div>
                  <span className="muted tab-nums" style={{ fontSize: 12 }}>
                    {fmtRel(n.createdAt)}
                  </span>
                  {n.read ? (
                    <span className="dim" style={{ fontSize: 12 }}>
                      Read
                    </span>
                  ) : (
                    <Button
                      onClick={() => markRead(n.id)}
                      size="sm"
                      variant="subtle"
                    >
                      Mark read
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

window.NotificationsScreen = NotificationsScreen;
