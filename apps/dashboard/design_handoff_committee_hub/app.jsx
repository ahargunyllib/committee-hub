// Main app: state, reducer, routing, tweaks panel.

const { useReducer } = React;

// ───────────────────────── Initial state ─────────────────────────

function initialState() {
  return {
    events: [...window.DATA.EVENTS],
    proposals: [...window.DATA.PROPOSALS],
    approvals: [...window.DATA.APPROVALS],
    divisions: [...window.DATA.DIVISIONS],
    applications: [...window.DATA.APPLICATIONS],
    notifications: [...window.DATA.NOTIFICATIONS],
    users: [...window.DATA.USERS],
    configs: [...window.DATA.SYSTEM_CONFIG],
    activity: [...window.DATA.ACTIVITY],
    registered: {},
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "CREATE_EVENT":
      return { ...state, events: [action.event, ...state.events] };
    case "UPDATE_EVENT_STATUS":
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.id ? { ...e, status: action.status } : e
        ),
      };
    case "CREATE_PROPOSAL":
      return { ...state, proposals: [action.proposal, ...state.proposals] };
    case "RESUBMIT_PROPOSAL": {
      const proposals = state.proposals.map((p) =>
        p.id === action.id
          ? {
              ...p,
              status: "pending",
              submissionRound: p.submissionRound + 1,
              submittedAt: window.DATA.fmtDateTime(window.DATA.today),
            }
          : p
      );
      return { ...state, proposals };
    }
    case "REVIEW_PROPOSAL": {
      const p = state.proposals.find((x) => x.id === action.proposalId);
      if (!p) {
        return state;
      }
      const newApproval = {
        id: `a-${Math.floor(Math.random() * 9999)}`,
        proposalId: p.id,
        reviewerId: action.reviewerId,
        level: action.level,
        decision: action.decision,
        notes: action.notes || "",
        submissionRound: p.submissionRound,
        createdAt: window.DATA.fmtDateTime(window.DATA.today),
      };
      // Status transitions:
      // - rejected → proposal rejected
      // - revision_requested → proposal revision_requested
      // - approved → if last level approved, proposal approved; else stays pending
      const levels =
        p.scope === "ormawa"
          ? ["ormawa"]
          : p.scope === "fakultas"
            ? ["ormawa", "fakultas"]
            : ["ormawa", "fakultas", "universitas"];
      let nextStatus = p.status;
      if (action.decision === "rejected") {
        nextStatus = "rejected";
      } else if (action.decision === "revision_requested") {
        nextStatus = "revision_requested";
      } else if (action.decision === "approved") {
        // count approvals for this round including the new one
        const approvalsForRound = [...state.approvals, newApproval]
          .filter(
            (x) =>
              x.proposalId === p.id &&
              x.submissionRound === p.submissionRound &&
              x.decision === "approved"
          )
          .map((x) => x.level);
        if (levels.every((l) => approvalsForRound.includes(l))) {
          nextStatus = "approved";
        } else {
          nextStatus = "pending";
        }
      }
      return {
        ...state,
        approvals: [newApproval, ...state.approvals],
        proposals: state.proposals.map((x) =>
          x.id === p.id ? { ...x, status: nextStatus } : x
        ),
      };
    }
    case "CREATE_DIVISION":
      return { ...state, divisions: [action.division, ...state.divisions] };
    case "APPLY_DIVISION":
      return {
        ...state,
        applications: [action.application, ...state.applications],
      };
    case "REVIEW_APPLICATION":
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.id
            ? {
                ...a,
                status: action.status,
                reviewedById: action.reviewedById,
                reviewedAt: window.DATA.fmtDateTime(window.DATA.today),
              }
            : a
        ),
      };
    case "MARK_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id
            ? {
                ...n,
                read: true,
                readAt: window.DATA.fmtDateTime(window.DATA.today),
              }
            : n
        ),
      };
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
          readAt: n.readAt || window.DATA.fmtDateTime(window.DATA.today),
        })),
      };
    case "CHANGE_ROLE":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id ? { ...u, role: action.role } : u
        ),
      };
    case "UPSERT_CONFIG": {
      const exists = state.configs.some((c) => c.id === action.config.id);
      const configs = exists
        ? state.configs.map((c) =>
            c.id === action.config.id ? action.config : c
          )
        : [action.config, ...state.configs];
      return { ...state, configs };
    }
    case "RESET":
      return initialState();
    default:
      return state;
  }
}

// ───────────────────────── Tweaks defaults ─────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  activeUserId: "u-001",
  theme: "slate",
  density: "comfortable",
  showLogin: false,
} /*EDITMODE-END*/;

// ───────────────────────── App ─────────────────────────

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const currentUser =
    state.users.find((u) => u.id === tweaks.activeUserId) || state.users[0];
  const [route, setRoute] = useState("overview");
  const [authed, setAuthed] = useState(!tweaks.showLogin);

  // Apply theme + density to <html>
  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.density = tweaks.density;
  }, [tweaks.theme, tweaks.density]);

  // If role doesn't allow admin, force a valid route
  useEffect(() => {
    if (route === "admin" && currentUser.role !== "admin_sistem") {
      setRoute("overview");
    }
  }, [route, currentUser.role]);

  // Sync authed with tweak
  useEffect(() => {
    setAuthed(!tweaks.showLogin);
  }, [tweaks.showLogin]);

  if (!authed) {
    return (
      <>
        <LoginScreen
          onSignIn={() => {
            setAuthed(true);
            setTweak("showLogin", false);
          }}
        />
        <AppTweaks
          onReset={() => dispatch({ type: "RESET" })}
          setTweak={setTweak}
          tweaks={tweaks}
          users={state.users}
        />
      </>
    );
  }

  const screenProps = { currentUser, state, dispatch, onNavigate: setRoute };

  return (
    <>
      <AppShell
        active={route}
        currentUser={currentUser}
        onNavigate={setRoute}
        onSignOut={() => {
          setAuthed(false);
          setTweak("showLogin", true);
        }}
      >
        {route === "overview" && <OverviewScreen {...screenProps} />}
        {route === "events" && <EventsScreen {...screenProps} />}
        {route === "proposals" && <ProposalsScreen {...screenProps} />}
        {route === "committee" && <CommitteeScreen {...screenProps} />}
        {route === "notifications" && <NotificationsScreen {...screenProps} />}
        {route === "admin" && <AdminScreen {...screenProps} />}
      </AppShell>
      <AppTweaks
        onReset={() => dispatch({ type: "RESET" })}
        setTweak={setTweak}
        tweaks={tweaks}
        users={state.users}
      />
    </>
  );
}

function AppTweaks({ tweaks, setTweak, users, onReset }) {
  // Pick representative users per role to switch to
  const switchableUsers = [
    users.find((u) => u.role === "ketua_panitia"),
    users.find((u) => u.role === "mahasiswa"),
    users.find((u) => u.role === "pengurus_ormawa"),
    users.find((u) => u.role === "pihak_fakultas"),
    users.find((u) => u.role === "pihak_universitas"),
    users.find((u) => u.role === "admin_sistem"),
  ].filter(Boolean);

  return (
    <TweaksPanel>
      <TweakSection label="Identity" />
      <TweakSelect
        label="Active user"
        onChange={(v) => setTweak("activeUserId", v)}
        options={switchableUsers.map((u) => ({
          value: u.id,
          label: `${u.name} · ${window.DATA.ROLE_LABELS[u.role]}`,
        }))}
        value={tweaks.activeUserId}
      />
      <TweakToggle
        label="Sign-in screen"
        onChange={(v) => setTweak("showLogin", v)}
        value={tweaks.showLogin}
      />

      <TweakSection label="Appearance" />
      <TweakRadio
        label="Theme"
        onChange={(v) => setTweak("theme", v)}
        options={[
          { value: "slate", label: "Slate" },
          { value: "stripe", label: "Warm" },
          { value: "campus", label: "Campus" },
          { value: "graphite", label: "Dark" },
        ]}
        value={tweaks.theme}
      />
      <TweakRadio
        label="Density"
        onChange={(v) => setTweak("density", v)}
        options={[
          { value: "comfortable", label: "Comfy" },
          { value: "dense", label: "Dense" },
        ]}
        value={tweaks.density}
      />

      <TweakSection label="Demo data" />
      <TweakButton label="Reset prototype" onClick={onReset}>
        Reset
      </TweakButton>
    </TweaksPanel>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
