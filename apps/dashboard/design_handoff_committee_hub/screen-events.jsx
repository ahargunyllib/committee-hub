// Events screen — filters, create form, list/cards, ticket verify.

function EventsScreen({ currentUser, state, dispatch }) {
  const { EVENTS } = window.DATA;
  const events = state.events || EVENTS;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [registered, setRegistered] = useState(state.registered || {});
  const [toast, setToast] = useState(null);

  const canCreate = ["ketua_panitia", "admin_sistem"].includes(
    currentUser.role
  );

  const filtered = events.filter((e) => {
    if (status !== "all" && e.status !== status) {
      return false;
    }
    if (type !== "all" && e.type !== type) {
      return false;
    }
    if (q) {
      const s = q.toLowerCase();
      if (
        !(
          e.name.toLowerCase().includes(s) ||
          e.location.toLowerCase().includes(s) ||
          e.id.includes(s)
        )
      ) {
        return false;
      }
    }
    return true;
  });

  const counts = useMemo(
    () => ({
      all: events.length,
      open: events.filter((e) => e.status === "open").length,
      draft: events.filter((e) => e.status === "draft").length,
      closed: events.filter((e) => e.status === "closed").length,
    }),
    [events]
  );

  function showToast(msg, kind = "success") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2400);
  }

  function handleCreate(payload) {
    const id = `e-${2050 + Math.floor(Math.random() * 50)}`;
    const ev = {
      id,
      ...payload,
      status: "draft",
      createdById: currentUser.id,
      createdAt: window.DATA.fmtDate(window.DATA.today),
    };
    dispatch({ type: "CREATE_EVENT", event: ev });
    setShowCreate(false);
    showToast(`Created “${ev.name}” as draft`);
  }

  function updateStatus(ev, next) {
    dispatch({ type: "UPDATE_EVENT_STATUS", id: ev.id, status: next });
    showToast(`${ev.name} → ${next}`);
  }

  function register(ev) {
    setRegistered((r) => ({ ...r, [ev.id]: true }));
    showToast(`Ticket issued · ${ev.name}`);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Events</h1>
          <div className="sub">
            {filtered.length} of {events.length} shown · {counts.open} currently
            open
          </div>
        </div>
        <div className="page-actions">
          {toast ? <Toast kind={toast.kind}>{toast.msg}</Toast> : null}
          <Button
            icon={Icons.Ticket}
            onClick={() => setShowVerify(true)}
            variant="subtle"
          >
            Verify ticket
          </Button>
          {canCreate && (
            <Button
              icon={Icons.Plus}
              onClick={() => setShowCreate(true)}
              variant="primary"
            >
              Create event
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <Input
            aria-label="Search events"
            icon={Icons.Search}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, location, or id…"
            style={{ width: 320 }}
            value={q}
          />
          <Segmented
            onChange={setStatus}
            options={[
              { value: "all", label: `All (${counts.all})` },
              { value: "open", label: `Open (${counts.open})` },
              { value: "draft", label: `Draft (${counts.draft})` },
              { value: "closed", label: `Closed (${counts.closed})` },
            ]}
            value={status}
          />
        </div>
        <div className="row tight">
          <span className="muted" style={{ fontSize: 12.5 }}>
            Type
          </span>
          <Segmented
            onChange={setType}
            options={[
              { value: "all", label: "All" },
              { value: "internal", label: "Internal" },
              { value: "external", label: "External" },
            ]}
            value={type}
          />
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            action={
              <Button
                onClick={() => {
                  setQ("");
                  setStatus("all");
                  setType("all");
                }}
                size="sm"
                variant="subtle"
              >
                Reset filters
              </Button>
            }
            desc="Try clearing filters or changing the search term."
            icon={Icons.Events}
            title="No events match"
          />
        </Card>
      ) : (
        <div className="events-grid">
          {filtered.map((ev) => (
            <EventCard
              canManage={
                ev.createdById === currentUser.id ||
                currentUser.role === "admin_sistem"
              }
              currentUser={currentUser}
              ev={ev}
              key={ev.id}
              onRegister={() => register(ev)}
              onStatus={(s) => updateStatus(ev, s)}
              registered={registered[ev.id]}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="Create event" wide>
          <CreateEventForm
            onCancel={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        </Modal>
      )}
      {showVerify && (
        <Modal onClose={() => setShowVerify(false)} title="Verify ticket">
          <VerifyTicketForm
            onClose={() => setShowVerify(false)}
            onResult={(msg, kind) => {
              setShowVerify(false);
              showToast(msg, kind);
            }}
          />
        </Modal>
      )}

      <style>{`
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--pad-section);
        }
        .event-card {
          display: flex; flex-direction: column; min-width: 0;
        }
        .event-card .head { padding: 14px 16px 10px; display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; }
        .event-card .body { padding: 0 16px 12px; }
        .event-card .meta-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          row-gap: 8px; column-gap: 14px;
          padding: 10px 16px;
          border-top: 1px solid var(--border-2);
          font-size: 12.5px;
          color: var(--text-muted);
        }
        .event-card .meta-grid > div { display: flex; align-items: center; gap: 6px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .event-card .meta-grid > div > b { overflow: hidden; text-overflow: ellipsis; }
        .event-card .meta-grid b { color: var(--text); font-weight: 500; }
        .event-card .actions {
          padding: 10px 12px;
          border-top: 1px solid var(--border-2);
          display: flex; gap: 6px; align-items: center; justify-content: space-between;
          background: var(--surface-2);
          border-radius: 0 0 8px 8px;
        }
        .event-card .actions .left { display: flex; gap: 6px; align-items: center; white-space: nowrap; }
        .event-card .ev-title { font-weight: 600; font-size: 14.5px; letter-spacing: -0.005em; margin-bottom: 4px; }
        .event-card .ev-desc { color: var(--text-muted); font-size: 12.5px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}

function EventCard({
  ev,
  currentUser,
  registered,
  onRegister,
  onStatus,
  canManage,
}) {
  const ratio = Math.min(1, Math.round(ev.quota * 0.68) / ev.quota); // pretend % filled
  return (
    <article aria-labelledby={`ev-${ev.id}-t`} className="card event-card">
      <div className="head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="ev-title truncate" id={`ev-${ev.id}-t`}>
            {ev.name}
          </div>
          <div className="ev-desc">{ev.description}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
            flex: "0 0 auto",
          }}
        >
          <StatusBadge status={ev.status} />
          <Badge kind={ev.type}>{STATUS_LABEL[ev.type]}</Badge>
        </div>
      </div>
      <div className="meta-grid">
        <div>
          <Icons.Events size={13} /> <b>{fmtNice(ev.date)}</b>
        </div>
        <div>
          <Icons.Clock size={13} /> {fmtRel(ev.date)}
        </div>
        <div className="truncate">
          <Icons.Pin size={13} /> <b className="truncate">{ev.location}</b>
        </div>
        <div>
          <Icons.Users size={13} /> quota <b>{ev.quota}</b>
        </div>
      </div>
      <div className="actions">
        <div className="left">
          <span className="mono dim" style={{ fontSize: 11.5 }}>
            {ev.id}
          </span>
        </div>
        <div className="row tight">
          {ev.status === "open" && (
            <Button
              disabled={registered}
              icon={registered ? Icons.Check : Icons.Ticket}
              onClick={onRegister}
              size="sm"
              variant={registered ? "subtle" : "default"}
            >
              {registered ? "Registered" : "Register"}
            </Button>
          )}
          {canManage && ev.status === "draft" && (
            <Button onClick={() => onStatus("open")} size="sm">
              Open
            </Button>
          )}
          {canManage && ev.status === "open" && (
            <Button
              onClick={() => onStatus("closed")}
              size="sm"
              variant="subtle"
            >
              Close
            </Button>
          )}
          {canManage && ev.status === "closed" && (
            <Button onClick={() => onStatus("open")} size="sm" variant="subtle">
              Reopen
            </Button>
          )}
          <Button
            aria-label="More actions"
            icon={Icons.More}
            iconOnly
            size="sm"
            variant="subtle"
          />
        </div>
      </div>
    </article>
  );
}

function CreateEventForm({ onCreate, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    date: window.DATA.fmtDate(window.DATA.d(14)),
    location: "",
    quota: 100,
    type: "external",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Event name is required.";
    }
    if (!form.location.trim()) {
      errs.location = "Location is required.";
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
      <Field error={errors.name} htmlFor="ev-name" label="Event name" required>
        <Input
          id="ev-name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Workshop Data Visualisasi 2026"
          value={form.name}
        />
      </Field>
      <div className="grid-2" style={{ gap: 12 }}>
        <Field htmlFor="ev-date" label="Date" required>
          <Input
            id="ev-date"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            type="date"
            value={form.date}
          />
        </Field>
        <Field error={errors.quota} htmlFor="ev-quota" label="Quota" required>
          <Input
            id="ev-quota"
            min="1"
            onChange={(e) => setForm({ ...form, quota: +e.target.value })}
            type="number"
            value={form.quota}
          />
        </Field>
      </div>
      <Field error={errors.location} htmlFor="ev-loc" label="Location" required>
        <Input
          id="ev-loc"
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="e.g. Aula Pasca, Lt. 7"
          value={form.location}
        />
      </Field>
      <Field
        hint="Internal events skip Fakultas/Universitas approval."
        htmlFor="ev-type"
        label="Type"
        required
      >
        <Select
          id="ev-type"
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          value={form.type}
        >
          <option value="internal">Internal (one ormawa)</option>
          <option value="external">External (multi-ormawa / public)</option>
        </Select>
      </Field>
      <Field htmlFor="ev-desc" label="Description">
        <Textarea
          id="ev-desc"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Short summary, audience, goals."
          rows="3"
          value={form.description}
        />
      </Field>
      <div className="row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
        <Button onClick={onCancel} variant="subtle">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create as draft
        </Button>
      </div>
    </form>
  );
}

function VerifyTicketForm({ onClose, onResult }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      if (code.toUpperCase().startsWith("CMTHB-")) {
        onResult(
          `Ticket ${code.toUpperCase()} verified · attendance recorded`,
          "success"
        );
      } else {
        onResult(`Code "${code}" not recognised`, "error");
      }
      setBusy(false);
    }, 600);
  };
  return (
    <form className="col" onSubmit={submit}>
      <Field
        hint="Codes look like CMTHB-XXXX-XXXX."
        htmlFor="tk"
        label="Ticket code"
      >
        <Input
          autoFocus
          id="tk"
          onChange={(e) => setCode(e.target.value)}
          placeholder="CMTHB-3A1F-9K2L"
          value={code}
        />
      </Field>
      <div className="row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
        <Button onClick={onClose} type="button" variant="subtle">
          Cancel
        </Button>
        <Button disabled={busy || !code} type="submit" variant="primary">
          {busy ? "Verifying…" : "Verify code"}
        </Button>
      </div>
    </form>
  );
}

// ───────────────────────── Modal (shared) ─────────────────────────

function Modal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        aria-labelledby="modal-title"
        aria-modal="true"
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        style={{ width: wide ? 560 : 440 }}
      >
        <header className="modal-head">
          <h3 id="modal-title">{title}</h3>
          <button
            aria-label="Close"
            className="btn icon sm subtle"
            onClick={onClose}
          >
            <Icons.Close size={14} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
      <style>{`
        .modal-scrim {
          position: fixed; inset: 0; z-index: 80;
          background: rgba(20,20,25,0.32);
          backdrop-filter: blur(2px);
          display: grid; place-items: center;
          padding: 20px;
        }
        .modal {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: var(--shadow-pop);
          max-height: 90vh;
          display: flex; flex-direction: column;
        }
        .modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px 12px;
          border-bottom: 1px solid var(--border);
        }
        .modal-head h3 { margin: 0; font-size: 15px; font-weight: 600; }
        .modal-body { padding: 18px; overflow: auto; }
      `}</style>
    </div>
  );
}

Object.assign(window, {
  EventsScreen,
  EventCard,
  CreateEventForm,
  VerifyTicketForm,
  Modal,
});
