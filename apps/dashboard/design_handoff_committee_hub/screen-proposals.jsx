// Proposals screen.

function ProposalsScreen({ currentUser, state, dispatch }) {
  const { EVENTS, USERS } = window.DATA;
  const proposals = state.proposals;
  const approvals = state.approvals;

  const [scope, setScope] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(proposals[0]?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, kind = "success") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2400);
  }

  const isReviewer = [
    "pengurus_ormawa",
    "pihak_fakultas",
    "pihak_universitas",
  ].includes(currentUser.role);
  const reviewerLevel =
    currentUser.role === "pengurus_ormawa"
      ? "ormawa"
      : currentUser.role === "pihak_fakultas"
        ? "fakultas"
        : currentUser.role === "pihak_universitas"
          ? "universitas"
          : null;

  const filtered = proposals.filter((p) => {
    if (scope !== "all" && p.scope !== scope) {
      return false;
    }
    if (status !== "all" && p.status !== status) {
      return false;
    }
    if (q) {
      const s = q.toLowerCase();
      if (
        !(
          p.title.toLowerCase().includes(s) ||
          p.id.includes(s) ||
          p.eventId.includes(s)
        )
      ) {
        return false;
      }
    }
    return true;
  });

  const selected = proposals.find((p) => p.id === selectedId) || filtered[0];

  const counts = {
    all: proposals.length,
    pending: proposals.filter((p) => p.status === "pending").length,
    revision: proposals.filter((p) => p.status === "revision_requested").length,
    approved: proposals.filter((p) => p.status === "approved").length,
    rejected: proposals.filter((p) => p.status === "rejected").length,
  };

  function review(p, decision, notes) {
    dispatch({
      type: "REVIEW_PROPOSAL",
      proposalId: p.id,
      reviewerId: currentUser.id,
      level: reviewerLevel,
      decision,
      notes,
    });
    showToast(
      `Proposal ${p.id} · ${decision.replace("_", " ")}`,
      decision === "rejected" ? "error" : "success"
    );
  }

  function resubmit(p) {
    dispatch({ type: "RESUBMIT_PROPOSAL", id: p.id });
    showToast(`Resubmitted · round ${p.submissionRound + 1}`);
  }

  function createProposal(payload) {
    const id = `p-${510 + Math.floor(Math.random() * 100)}`;
    const prop = {
      id,
      ...payload,
      status: "pending",
      submittedById: currentUser.id,
      submissionRound: 1,
      submittedAt: window.DATA.fmtDateTime(window.DATA.today),
    };
    dispatch({ type: "CREATE_PROPOSAL", proposal: prop });
    setShowCreate(false);
    setSelectedId(id);
    showToast(`Proposal "${prop.title}" submitted`);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Proposals</h1>
          <div className="sub">
            {counts.pending} pending · {counts.revision} need revision ·{" "}
            {counts.approved} approved
          </div>
        </div>
        <div className="page-actions">
          {toast ? <Toast kind={toast.kind}>{toast.msg}</Toast> : null}
          <Button
            icon={Icons.Plus}
            onClick={() => setShowCreate(true)}
            variant="primary"
          >
            Submit proposal
          </Button>
        </div>
      </div>

      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <Input
            aria-label="Search proposals"
            icon={Icons.Search}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, event id, proposal id…"
            style={{ width: 320 }}
            value={q}
          />
          <Segmented
            onChange={setStatus}
            options={[
              { value: "all", label: `All (${counts.all})` },
              { value: "pending", label: `Pending (${counts.pending})` },
              {
                value: "revision_requested",
                label: `Revision (${counts.revision})`,
              },
              { value: "approved", label: `Approved (${counts.approved})` },
              { value: "rejected", label: `Rejected (${counts.rejected})` },
            ]}
            value={status}
          />
        </div>
        <div className="row tight">
          <span className="muted" style={{ fontSize: 12.5 }}>
            Scope
          </span>
          <Segmented
            onChange={setScope}
            options={[
              { value: "all", label: "All" },
              { value: "ormawa", label: "Ormawa" },
              { value: "fakultas", label: "Fakultas" },
              { value: "universitas", label: "Universitas" },
            ]}
            value={scope}
          />
        </div>
      </div>

      <div className="proposals-grid">
        {/* List */}
        <Card
          bodyClass="tight"
          subtitle="Newest first"
          title={`${filtered.length} proposals`}
        >
          <ul
            className="list"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {filtered.map((p) => {
              const ev = EVENTS.find((e) => e.id === p.eventId);
              return (
                <li
                  className={`row-item ${selected?.id === p.id ? "is-selected" : ""}`}
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  role="button"
                  style={{
                    gridTemplateColumns: "1fr auto",
                    alignItems: "flex-start",
                    cursor: "default",
                  }}
                  tabIndex="0"
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="title truncate">{p.title}</div>
                    <div className="meta-row" style={{ marginTop: 4 }}>
                      <span className="mono dim">{p.id}</span>
                      <span className="dim">·</span>
                      <span>{ev?.name || p.eventId}</span>
                    </div>
                    <div className="meta-row" style={{ marginTop: 2 }}>
                      <span>
                        scope <b style={{ color: "var(--text)" }}>{p.scope}</b>
                      </span>
                      <span className="dim">·</span>
                      <span>round {p.submissionRound}</span>
                      <span className="dim">·</span>
                      <span>{fmtRel(p.submittedAt)}</span>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              );
            })}
            {filtered.length === 0 && (
              <EmptyState
                desc="Adjust the filter or search."
                icon={Icons.Proposals}
                title="No proposals match"
              />
            )}
          </ul>
        </Card>

        {/* Detail */}
        {selected ? (
          <ProposalDetail
            allApprovals={approvals}
            approvals={approvals.filter((a) => a.proposalId === selected.id)}
            currentUser={currentUser}
            isReviewer={isReviewer}
            onResubmit={() => resubmit(selected)}
            onReview={(decision, notes) => review(selected, decision, notes)}
            p={selected}
            reviewerLevel={reviewerLevel}
          />
        ) : (
          <Card>
            <EmptyState icon={Icons.Proposals} title="No proposal selected" />
          </Card>
        )}
      </div>

      {showCreate && (
        <Modal
          onClose={() => setShowCreate(false)}
          title="Submit a proposal"
          wide
        >
          <CreateProposalForm
            myEvents={EVENTS.filter((e) => e.createdById === currentUser.id)}
            onCancel={() => setShowCreate(false)}
            onCreate={createProposal}
          />
        </Modal>
      )}

      <style>{`
        .proposals-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
          gap: var(--pad-section);
          align-items: start;
        }
        @media (max-width: 1100px) {
          .proposals-grid { grid-template-columns: 1fr; }
        }
        .approval-track { display: flex; flex-direction: column; gap: 10px; }
        .approval-step {
          display: grid;
          grid-template-columns: 28px 1fr auto;
          gap: 10px; align-items: center;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 7px;
          background: var(--surface-2);
        }
        .approval-step .num {
          width: 22px; height: 22px;
          border-radius: 999px;
          background: var(--bg-2);
          color: var(--text-muted);
          display: grid; place-items: center;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
        }
        .approval-step.is-done .num { background: var(--st-open-bg); color: var(--st-open-fg); }
        .approval-step.is-active .num { background: var(--accent); color: var(--accent-fg); }
        .approval-step .level { font-weight: 500; font-size: 13.5px; }
        .approval-step .notes { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
      `}</style>
    </div>
  );
}

function ProposalDetail({
  p,
  currentUser,
  isReviewer,
  reviewerLevel,
  approvals,
  onReview,
  onResubmit,
}) {
  const { EVENTS, USERS } = window.DATA;
  const ev = EVENTS.find((e) => e.id === p.eventId);
  const submitter = USERS.find((u) => u.id === p.submittedById);

  const levels =
    p.scope === "ormawa"
      ? ["ormawa"]
      : p.scope === "fakultas"
        ? ["ormawa", "fakultas"]
        : ["ormawa", "fakultas", "universitas"];

  // For the current round, what decision exists at each level?
  const round = p.submissionRound;
  const decisions = {};
  for (const l of levels) {
    const a = approvals.find(
      (x) => x.level === l && x.submissionRound === round
    );
    if (a) {
      decisions[l] = a;
    }
  }
  // First level w/o decision = active
  const activeLevel = levels.find((l) => !decisions[l]);
  const isMine = p.submittedById === currentUser.id;
  const canReview =
    isReviewer && reviewerLevel === activeLevel && p.status === "pending";
  const canResubmit =
    isMine && (p.status === "revision_requested" || p.status === "rejected");

  const [notes, setNotes] = useState("");

  return (
    <Card
      action={
        <>
          <StatusBadge status={p.status} />
          <Button icon={Icons.External} size="sm" variant="subtle">
            Open document
          </Button>
        </>
      }
      subtitle={
        <>
          <span className="mono">{p.id}</span> · {ev?.name} (
          <span className="mono">{p.eventId}</span>)
        </>
      }
      title={p.title}
    >
      {/* Meta line */}
      <div className="row" style={{ gap: 18, marginBottom: 14 }}>
        <div>
          <div className="muted" style={{ fontSize: 11 }}>
            Submitted by
          </div>
          <div className="row tight">
            <Avatar size="sm" user={submitter} />
            {submitter?.name}
          </div>
        </div>
        <div>
          <div className="muted" style={{ fontSize: 11 }}>
            Scope
          </div>
          <div style={{ fontWeight: 500 }}>{p.scope}</div>
        </div>
        <div>
          <div className="muted" style={{ fontSize: 11 }}>
            Round
          </div>
          <div style={{ fontWeight: 500 }}>{p.submissionRound}</div>
        </div>
        <div>
          <div className="muted" style={{ fontSize: 11 }}>
            Submitted
          </div>
          <div style={{ fontWeight: 500 }}>{fmtRel(p.submittedAt)}</div>
        </div>
      </div>

      {/* Approval track */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        Approval track
      </div>
      <div className="approval-track" style={{ marginBottom: 18 }}>
        {levels.map((l, i) => {
          const a = decisions[l];
          const isActive = !a && l === activeLevel;
          const klass = a ? "is-done" : isActive ? "is-active" : "";
          const reviewer = a ? USERS.find((u) => u.id === a.reviewerId) : null;
          return (
            <div className={`approval-step ${klass}`} key={l}>
              <span className="num">{i + 1}</span>
              <div style={{ minWidth: 0 }}>
                <div className="level" style={{ textTransform: "capitalize" }}>
                  {l}
                </div>
                {a ? (
                  <div className="notes">
                    {reviewer?.name} —{" "}
                    <span className="mono">{a.decision.replace("_", " ")}</span>
                    {a.notes ? <> · “{a.notes}”</> : null}
                  </div>
                ) : (
                  <div className="notes">
                    {isActive ? "Awaiting review" : "Queued"}
                  </div>
                )}
              </div>
              {a ? (
                <StatusBadge
                  status={
                    a.decision === "approved"
                      ? "approved"
                      : a.decision === "rejected"
                        ? "rejected"
                        : "revision_requested"
                  }
                />
              ) : isActive ? (
                <Badge dot kind="pending">
                  Awaiting
                </Badge>
              ) : (
                <Badge>Queued</Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Review controls */}
      {canReview && (
        <div
          className="card flat"
          style={{
            background: "var(--surface-2)",
            padding: 14,
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Review as{" "}
            <span style={{ textTransform: "capitalize" }}>{reviewerLevel}</span>
          </div>
          <Field htmlFor="rv-notes" label="Notes (optional)">
            <Textarea
              id="rv-notes"
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context for the submitter…"
              rows="2"
              value={notes}
            />
          </Field>
          <div
            className="row"
            style={{ justifyContent: "flex-end", marginTop: 10 }}
          >
            <Button
              icon={Icons.X}
              onClick={() => {
                onReview("rejected", notes);
                setNotes("");
              }}
              variant="danger"
            >
              Reject
            </Button>
            <Button
              onClick={() => {
                onReview("revision_requested", notes);
                setNotes("");
              }}
              variant="subtle"
            >
              Request revision
            </Button>
            <Button
              icon={Icons.Check}
              onClick={() => {
                onReview("approved", notes);
                setNotes("");
              }}
              variant="success"
            >
              Approve
            </Button>
          </div>
        </div>
      )}
      {!canReview && canResubmit && (
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <Button icon={Icons.Refresh} onClick={onResubmit} variant="primary">
            Resubmit (round {p.submissionRound + 1})
          </Button>
        </div>
      )}
      {!(canReview || canResubmit) && isMine && p.status === "pending" && (
        <div className="muted" style={{ fontSize: 12.5 }}>
          Submitted — waiting on{" "}
          <span style={{ textTransform: "capitalize", color: "var(--text)" }}>
            {activeLevel}
          </span>{" "}
          reviewer.
        </div>
      )}
    </Card>
  );
}

function CreateProposalForm({ onCreate, onCancel, myEvents }) {
  const evs = myEvents.length ? myEvents : window.DATA.EVENTS;
  const [form, setForm] = useState({
    eventId: evs[0]?.id || "",
    title: "",
    scope: "fakultas",
    documentUrl: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) {
      errs.title = "Title is required.";
    }
    if (!form.documentUrl.trim()) {
      errs.documentUrl = "Document URL is required.";
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onCreate(form);
    }
  };
  return (
    <form className="col" noValidate onSubmit={submit}>
      <Field htmlFor="pr-ev" label="Event" required>
        <Select
          id="pr-ev"
          onChange={(e) => setForm({ ...form, eventId: e.target.value })}
          value={form.eventId}
        >
          {evs.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.id} — {ev.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field error={errors.title} htmlFor="pr-title" label="Title" required>
        <Input
          id="pr-title"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Proposal title"
          value={form.title}
        />
      </Field>
      <div className="grid-2" style={{ gap: 12 }}>
        <Field
          hint="Determines approval chain."
          htmlFor="pr-scope"
          label="Scope"
          required
        >
          <Select
            id="pr-scope"
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            value={form.scope}
          >
            <option value="ormawa">Ormawa (1 level)</option>
            <option value="fakultas">Fakultas (Ormawa → Fakultas)</option>
            <option value="universitas">
              Universitas (Ormawa → Fakultas → Universitas)
            </option>
          </Select>
        </Field>
        <Field
          error={errors.documentUrl}
          htmlFor="pr-doc"
          label="Document URL"
          required
        >
          <Input
            id="pr-doc"
            onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
            placeholder="/docs/your-proposal.pdf"
            value={form.documentUrl}
          />
        </Field>
      </div>
      <Field htmlFor="pr-desc" label="Description">
        <Textarea
          id="pr-desc"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Short summary for reviewers."
          rows="3"
          value={form.description}
        />
      </Field>
      <div className="row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
        <Button onClick={onCancel} variant="subtle">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Submit for review
        </Button>
      </div>
    </form>
  );
}

Object.assign(window, { ProposalsScreen, ProposalDetail, CreateProposalForm });
