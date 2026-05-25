// Admin screen — user table, system config CRUD-lite, activity feed.

function AdminScreen({ currentUser, state, dispatch }) {
  const { USERS, SYSTEM_CONFIG, ACTIVITY, ROLE_LABELS } = window.DATA;
  const users = state.users || USERS;
  const configs = state.configs || SYSTEM_CONFIG;
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingConfig, setEditingConfig] = useState(null);
  const [showCreateConfig, setShowCreateConfig] = useState(false);
  const [toast, setToast] = useState(null);
  function showToast(msg, kind = "success") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2400);
  }

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) {
      return false;
    }
    if (q) {
      const s = q.toLowerCase();
      if (
        !(u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))
      ) {
        return false;
      }
    }
    return true;
  });

  function changeRole(u, next) {
    dispatch({ type: "CHANGE_ROLE", id: u.id, role: next });
    showToast(`${u.name} → ${ROLE_LABELS[next]}`);
  }

  function saveConfig(cfg) {
    dispatch({
      type: "UPSERT_CONFIG",
      config: {
        ...cfg,
        updatedById: currentUser.id,
        updatedAt: window.DATA.fmtDateTime(window.DATA.today),
      },
    });
    setEditingConfig(null);
    setShowCreateConfig(false);
    showToast(`Saved ${cfg.key}`);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Admin</h1>
          <div className="sub">Users, configuration, and platform activity</div>
        </div>
        <div className="page-actions">
          {toast ? <Toast kind={toast.kind}>{toast.msg}</Toast> : null}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid-stats">
        <StatTile
          label="Users"
          subText={`${users.filter((u) => u.role === "mahasiswa").length} mahasiswa · ${users.filter((u) => u.role !== "mahasiswa" && u.role !== "admin_sistem").length} staff`}
          value={users.length}
        />
        <StatTile
          label="Config keys"
          subText="Live runtime configuration"
          value={configs.length}
        />
        <StatTile
          label="Activity (24h)"
          subText="From audit log"
          value={state.activity.slice(0, 5).length}
        />
        <StatTile
          delta="↑ 6"
          deltaKind="good"
          label="Sessions"
          subText="Active in last 15m"
          value={42}
        />
      </div>

      <div className="admin-grid">
        {/* Users */}
        <Card
          action={
            <>
              <Input
                aria-label="Search users"
                icon={Icons.Search}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                style={{ width: 200 }}
                value={q}
              />
              <Select
                aria-label="Filter by role"
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: 160 }}
                value={roleFilter}
              >
                <option value="all">All roles</option>
                {Object.keys(ROLE_LABELS).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </>
          }
          bodyClass="tight"
          subtitle={`${filteredUsers.length} of ${users.length}`}
          title="User management"
        >
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: "36%" }}>User</th>
                  <th>Email</th>
                  <th style={{ width: "22%" }}>Role</th>
                  <th style={{ width: 60 }} />
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          minWidth: 0,
                        }}
                      >
                        <Avatar size="sm" user={u} />
                        <div style={{ minWidth: 0 }}>
                          <div className="truncate" style={{ fontWeight: 500 }}>
                            {u.name}
                          </div>
                          <div
                            className="muted truncate"
                            style={{ fontSize: 11.5 }}
                          >
                            {u.dept}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{u.email}</td>
                    <td>
                      <Select
                        aria-label={`Role for ${u.name}`}
                        disabled={u.id === currentUser.id}
                        onChange={(e) => changeRole(u, e.target.value)}
                        style={{ height: 30, fontSize: 12.5 }}
                        value={u.role}
                      >
                        {Object.keys(ROLE_LABELS).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td>
                      <Button
                        aria-label={`Actions for ${u.name}`}
                        icon={Icons.More}
                        iconOnly
                        size="sm"
                        variant="subtle"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Activity */}
        <Card bodyClass="tight" subtitle="Last 8 events" title="Activity feed">
          <ul
            className="list"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {state.activity.slice(0, 8).map((a) => {
              const u = users.find((x) => x.id === a.who);
              return (
                <li
                  className="row-item"
                  key={a.id}
                  style={{
                    gridTemplateColumns: "28px 1fr auto",
                    alignItems: "flex-start",
                  }}
                >
                  <Avatar size="sm" user={u} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13 }}>
                      <b>{u?.name}</b> <span className="muted">{a.verb}</span>
                    </div>
                    <div className="muted truncate" style={{ fontSize: 12 }}>
                      {a.target}
                    </div>
                  </div>
                  <span className="dim mono" style={{ fontSize: 11.5 }}>
                    {a.at.slice(5)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* System config */}
      <Card
        action={
          <Button
            icon={Icons.Plus}
            onClick={() => setShowCreateConfig(true)}
            size="sm"
          >
            Add key
          </Button>
        }
        bodyClass="tight"
        subtitle="Runtime keys read by the platform"
        title="System configuration"
      >
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "24%" }}>Key</th>
                <th style={{ width: "20%" }}>Value</th>
                <th style={{ width: "12%" }}>Type</th>
                <th>Description</th>
                <th style={{ width: "12%" }}>Updated</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => (
                <tr key={c.id}>
                  <td className="mono" style={{ fontSize: 12.5 }}>
                    {c.key}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {c.value}
                    </span>
                  </td>
                  <td className="muted mono" style={{ fontSize: 12 }}>
                    {c.valueType}
                  </td>
                  <td className="muted">{c.description}</td>
                  <td className="muted mono" style={{ fontSize: 11.5 }}>
                    {c.updatedAt?.slice(0, 10)}
                  </td>
                  <td>
                    <Button
                      onClick={() => setEditingConfig(c)}
                      size="sm"
                      variant="subtle"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {(editingConfig || showCreateConfig) && (
        <Modal
          onClose={() => {
            setEditingConfig(null);
            setShowCreateConfig(false);
          }}
          title={
            editingConfig
              ? `Edit ${editingConfig.key}`
              : "New configuration key"
          }
          wide
        >
          <ConfigForm
            initial={
              editingConfig || {
                id: `cfg-${Math.floor(Math.random() * 1000)}`,
                key: "",
                value: "",
                valueType: "string",
                description: "",
              }
            }
            isNew={!editingConfig}
            onCancel={() => {
              setEditingConfig(null);
              setShowCreateConfig(false);
            }}
            onSave={saveConfig}
          />
        </Modal>
      )}

      <style>{`
        .admin-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
          gap: var(--pad-section);
          align-items: start;
        }
        @media (max-width: 1100px) {
          .admin-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function ConfigForm({ initial, onSave, onCancel, isNew }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.key.trim()) {
      errs.key = "Key is required.";
    }
    if (!form.value.toString().trim()) {
      errs.value = "Value is required.";
    }
    if (form.valueType === "number" && isNaN(Number(form.value))) {
      errs.value = "Must be a number.";
    }
    if (
      form.valueType === "boolean" &&
      !["true", "false"].includes(form.value.toString())
    ) {
      errs.value = "true or false.";
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSave(form);
    }
  };
  return (
    <form className="col" noValidate onSubmit={submit}>
      <div className="grid-2" style={{ gap: 12 }}>
        <Field error={errors.key} htmlFor="c-key" label="Key" required>
          <Input
            className="mono"
            disabled={!isNew}
            id="c-key"
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            placeholder="namespace.key_name"
            value={form.key}
          />
        </Field>
        <Field htmlFor="c-type" label="Type" required>
          <Select
            id="c-type"
            onChange={(e) => setForm({ ...form, valueType: e.target.value })}
            value={form.valueType}
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
          </Select>
        </Field>
      </div>
      <Field error={errors.value} htmlFor="c-val" label="Value" required>
        <Input
          className="mono"
          id="c-val"
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          value={form.value}
        />
      </Field>
      <Field htmlFor="c-desc" label="Description">
        <Textarea
          id="c-desc"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What does this control?"
          rows="2"
          value={form.description}
        />
      </Field>
      <div className="row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
        <Button onClick={onCancel} type="button" variant="subtle">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isNew ? "Create key" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

Object.assign(window, { AdminScreen, ConfigForm });
