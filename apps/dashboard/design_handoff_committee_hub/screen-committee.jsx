// Committee screen — event selector, divisions, application review.

function CommitteeScreen({ currentUser, state, dispatch }) {
  const { EVENTS, USERS } = window.DATA;
  const divisions = state.divisions;
  const applications = state.applications;

  // Events that have or can have divisions (any event that's not closed)
  const eventOptions = EVENTS.filter((e) => e.status !== "closed");
  const [eventId, setEventId] = useState(eventOptions[0]?.id);
  const eventDivisions = divisions.filter((d) => d.eventId === eventId);
  const [selectedDivId, setSelectedDivId] = useState(eventDivisions[0]?.id);

  // Reset selection when event changes
  useEffect(() => {
    const first = divisions.find((d) => d.eventId === eventId);
    setSelectedDivId(first?.id);
  }, [eventId]);

  const ev = EVENTS.find((e) => e.id === eventId);
  const selectedDiv = divisions.find((d) => d.id === selectedDivId);
  const isLead = ev && ev.createdById === currentUser.id;
  const isStudent = currentUser.role === "mahasiswa";

  const [showCreateDiv, setShowCreateDiv] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [toast, setToast] = useState(null);
  function showToast(msg, kind = "success") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2400);
  }

  const divApps = applications.filter((a) => a.divisionId === selectedDivId);
  const acceptedCount = divApps.filter((a) => a.status === "accepted").length;
  const pendingCount = divApps.filter((a) => a.status === "pending").length;

  function decide(app, status) {
    dispatch({
      type: "REVIEW_APPLICATION",
      id: app.id,
      status,
      reviewedById: currentUser.id,
    });
    const user = USERS.find((u) => u.id === app.userId);
    showToast(
      `${status === "accepted" ? "Accepted" : "Rejected"} · ${user?.name}`,
      status === "accepted" ? "success" : "error"
    );
  }

  function createDivision(payload) {
    const id = `d-${100 + Math.floor(Math.random() * 100)}`;
    dispatch({
      type: "CREATE_DIVISION",
      division: {
        id,
        ...payload,
        eventId,
        createdAt: window.DATA.fmtDate(window.DATA.today),
      },
    });
    setShowCreateDiv(false);
    setSelectedDivId(id);
    showToast(`Created division "${payload.name}"`);
  }

  function apply(payload) {
    const id = `app-${100 + Math.floor(Math.random() * 100)}`;
    dispatch({
      type: "APPLY_DIVISION",
      application: {
        id,
        divisionId: selectedDivId,
        userId: currentUser.id,
        status: "pending",
        motivation: payload.motivation,
        createdAt: window.DATA.fmtDateTime(window.DATA.today),
      },
    });
    setShowApply(false);
    showToast("Application sent");
  }

  const myApp =
    isStudent && selectedDivId
      ? applications.find(
          (a) => a.divisionId === selectedDivId && a.userId === currentUser.id
        )
      : null;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Committee</h1>
          <div className="sub">
            Manage divisions and review committee applications
          </div>
        </div>
        <div className="page-actions">
          {toast ? <Toast kind={toast.kind}>{toast.msg}</Toast> : null}
          {isLead && (
            <Button
              icon={Icons.Plus}
              onClick={() => setShowCreateDiv(true)}
              variant="primary"
            >
              Create division
            </Button>
          )}
        </div>
      </div>

      {/* Event selector + summary */}
      <div
        className="row"
        style={{ justifyContent: "space-between", alignItems: "flex-end" }}
      >
        <div className="row" style={{ alignItems: "flex-end" }}>
          <Field htmlFor="cmte-ev" label="Event">
            <Select
              id="cmte-ev"
              onChange={(e) => setEventId(e.target.value)}
              style={{ width: 340 }}
              value={eventId}
            >
              {eventOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} — {e.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="row tight">
          <Badge>{eventDivisions.length} divisions</Badge>
          <Badge>
            {
              applications.filter((a) =>
                eventDivisions.some((d) => d.id === a.divisionId)
              ).length
            }{" "}
            applications
          </Badge>
          {ev && <StatusBadge status={ev.status} />}
        </div>
      </div>

      <div className="cmte-grid">
        {/* Divisions list */}
        <Card
          bodyClass="tight"
          subtitle={`${eventDivisions.length} for this event`}
          title="Divisions"
        >
          {eventDivisions.length === 0 ? (
            <EmptyState
              action={
                isLead && (
                  <Button
                    onClick={() => setShowCreateDiv(true)}
                    size="sm"
                    variant="primary"
                  >
                    Create division
                  </Button>
                )
              }
              desc={
                isLead
                  ? "Create divisions like Acara, Konsumsi, Publikasi to start recruiting."
                  : "The event lead hasn't published divisions yet."
              }
              icon={Icons.Layers}
              title="No divisions yet"
            />
          ) : (
            <ul
              className="list"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {eventDivisions.map((d) => {
                const apps = applications.filter((a) => a.divisionId === d.id);
                const accepted = apps.filter(
                  (a) => a.status === "accepted"
                ).length;
                return (
                  <li
                    className={`row-item ${selectedDivId === d.id ? "is-selected" : ""}`}
                    key={d.id}
                    onClick={() => setSelectedDivId(d.id)}
                    role="button"
                    style={{ gridTemplateColumns: "1fr auto" }}
                    tabIndex="0"
                  >
                    <div style={{ minWidth: 0 }}>
                      <div className="title">{d.name}</div>
                      <div className="meta-row" style={{ marginTop: 3 }}>
                        <span className="truncate" style={{ maxWidth: 340 }}>
                          {d.description}
                        </span>
                      </div>
                      <div className="meta-row" style={{ marginTop: 3 }}>
                        <span>
                          <Icons.Users size={11} /> {accepted}/{d.quota} filled
                        </span>
                        <span className="dim">·</span>
                        <span>created {fmtRel(d.createdAt)}</span>
                        <span className="dim">·</span>
                        <span className="mono dim">{d.id}</span>
                      </div>
                    </div>
                    <FillMeter denom={d.quota} num={accepted} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Selected division panel */}
        {selectedDiv ? (
          <Card
            action={
              <>
                <Badge>
                  {acceptedCount}/{selectedDiv.quota}
                </Badge>
                {pendingCount > 0 && (
                  <Badge dot kind="pending">
                    {pendingCount} pending
                  </Badge>
                )}
              </>
            }
            subtitle={selectedDiv.description}
            title={selectedDiv.name}
          >
            {/* Student apply CTA */}
            {isStudent && !myApp && (
              <div
                style={{
                  padding: 12,
                  marginBottom: 14,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>
                    Apply to {selectedDiv.name}
                  </div>
                  <div className="muted" style={{ fontSize: 12.5 }}>
                    Add a short motivation. Lead reviews and decides.
                  </div>
                </div>
                <Button onClick={() => setShowApply(true)} variant="primary">
                  Apply
                </Button>
              </div>
            )}
            {isStudent && myApp && (
              <div
                style={{
                  padding: 12,
                  marginBottom: 14,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 7,
                }}
              >
                <div
                  className="row tight"
                  style={{ justifyContent: "space-between" }}
                >
                  <div>
                    <b>Your application</b> · sent {fmtRel(myApp.createdAt)}
                  </div>
                  <StatusBadge status={myApp.status} />
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  “{myApp.motivation}”
                </div>
              </div>
            )}

            {/* Apps list */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-muted)",
                marginBottom: 6,
              }}
            >
              Applications ({divApps.length})
            </div>
            {divApps.length === 0 ? (
              <EmptyState
                desc="Open this division for recruitment."
                icon={Icons.Users}
                title="No applications yet"
              />
            ) : (
              <ul
                className="list"
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  border: "1px solid var(--border)",
                  borderRadius: 7,
                }}
              >
                {divApps.map((a) => {
                  const user = USERS.find((u) => u.id === a.userId);
                  return (
                    <li
                      className="row-item"
                      key={a.id}
                      style={{
                        gridTemplateColumns: "36px 1fr auto",
                        alignItems: "flex-start",
                      }}
                    >
                      <Avatar user={user} />
                      <div style={{ minWidth: 0 }}>
                        <div className="row tight">
                          <span className="title">{user?.name}</span>
                          <span className="mono dim" style={{ fontSize: 11 }}>
                            {user?.id}
                          </span>
                          <span className="muted" style={{ fontSize: 12 }}>
                            · {user?.dept}
                          </span>
                        </div>
                        <div
                          className="muted"
                          style={{
                            fontSize: 12.5,
                            marginTop: 3,
                            lineHeight: 1.5,
                          }}
                        >
                          “{a.motivation}”
                        </div>
                        <div className="meta-row" style={{ marginTop: 4 }}>
                          <span>applied {fmtRel(a.createdAt)}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          alignItems: "flex-end",
                        }}
                      >
                        <StatusBadge status={a.status} />
                        {isLead && a.status === "pending" && (
                          <div className="row tight">
                            <Button
                              icon={Icons.Check}
                              onClick={() => decide(a, "accepted")}
                              size="sm"
                              variant="success"
                            >
                              Accept
                            </Button>
                            <Button
                              icon={Icons.X}
                              onClick={() => decide(a, "rejected")}
                              size="sm"
                              variant="danger"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        ) : (
          <Card>
            <EmptyState
              desc="Pick a division from the list to view its applications."
              icon={Icons.Layers}
              title="Select a division"
            />
          </Card>
        )}
      </div>

      {showCreateDiv && (
        <Modal
          onClose={() => setShowCreateDiv(false)}
          title={`New division — ${ev?.name}`}
          wide
        >
          <CreateDivisionForm
            onCancel={() => setShowCreateDiv(false)}
            onCreate={createDivision}
          />
        </Modal>
      )}
      {showApply && selectedDiv && (
        <Modal
          onClose={() => setShowApply(false)}
          title={`Apply to ${selectedDiv.name}`}
        >
          <ApplyForm
            division={selectedDiv}
            onCancel={() => setShowApply(false)}
            onSubmit={apply}
          />
        </Modal>
      )}

      <style>{`
        .cmte-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
          gap: var(--pad-section);
          align-items: start;
        }
        @media (max-width: 1100px) {
          .cmte-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function FillMeter({ num, denom }) {
  const pct = Math.min(1, num / denom);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
        minWidth: 84,
      }}
    >
      <span className="mono tab-nums" style={{ fontSize: 12 }}>
        {num}
        <span className="dim">/{denom}</span>
      </span>
      <div
        style={{
          width: 64,
          height: 4,
          background: "var(--bg-2)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            background: "var(--accent)",
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

function CreateDivisionForm({ onCreate, onCancel }) {
  const [form, setForm] = useState({ name: "", quota: 6, description: "" });
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Division name is required.";
    }
    if (!form.quota || form.quota < 1) {
      errs.quota = "Quota must be at least 1.";
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onCreate(form);
    }
  };
  return (
    <form className="col" noValidate onSubmit={submit}>
      <div className="grid-2" style={{ gap: 12 }}>
        <Field
          error={errors.name}
          htmlFor="d-name"
          label="Division name"
          required
        >
          <Input
            id="d-name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Acara"
            value={form.name}
          />
        </Field>
        <Field error={errors.quota} htmlFor="d-q" label="Quota" required>
          <Input
            id="d-q"
            min="1"
            onChange={(e) => setForm({ ...form, quota: +e.target.value })}
            type="number"
            value={form.quota}
          />
        </Field>
      </div>
      <Field htmlFor="d-desc" label="Description">
        <Textarea
          id="d-desc"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What does this division do?"
          rows="3"
          value={form.description}
        />
      </Field>
      <div className="row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
        <Button onClick={onCancel} variant="subtle">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create division
        </Button>
      </div>
    </form>
  );
}

function ApplyForm({ division, onSubmit, onCancel }) {
  const [motivation, setMotivation] = useState("");
  const [err, setErr] = useState(null);
  const handle = (e) => {
    e.preventDefault();
    if (motivation.trim().length < 8) {
      setErr("Tell us a bit more (8+ characters).");
      return;
    }
    onSubmit({ motivation });
  };
  return (
    <form className="col" onSubmit={handle}>
      <div className="muted" style={{ fontSize: 12.5 }}>
        Applying to <b style={{ color: "var(--text)" }}>{division.name}</b> ·
        quota {division.quota}.
      </div>
      <Field
        error={err}
        hint="A few sentences is enough."
        htmlFor="m-text"
        label="Motivation"
        required
      >
        <Textarea
          autoFocus
          id="m-text"
          onChange={(e) => {
            setMotivation(e.target.value);
            setErr(null);
          }}
          placeholder="Why are you a fit for this division?"
          rows="4"
          value={motivation}
        />
      </Field>
      <div className="row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
        <Button onClick={onCancel} type="button" variant="subtle">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Send application
        </Button>
      </div>
    </form>
  );
}

Object.assign(window, {
  CommitteeScreen,
  FillMeter,
  CreateDivisionForm,
  ApplyForm,
});
