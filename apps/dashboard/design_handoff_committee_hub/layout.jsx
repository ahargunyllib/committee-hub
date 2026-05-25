// AppShell: Sidebar + Topbar + Main scroll area.

const { Icons } = window;

const NAV = [
  { id: "overview", label: "Overview", icon: Icons.Overview },
  {
    id: "events",
    label: "Events",
    icon: Icons.Events,
    count: () => window.DATA.EVENTS.filter((e) => e.status === "open").length,
  },
  {
    id: "proposals",
    label: "Proposals",
    icon: Icons.Proposals,
    count: () =>
      window.DATA.PROPOSALS.filter(
        (p) => p.status === "pending" || p.status === "revision_requested"
      ).length,
  },
  {
    id: "committee",
    label: "Committee",
    icon: Icons.Committee,
    count: () =>
      window.DATA.APPLICATIONS.filter((a) => a.status === "pending").length,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Icons.Notifications,
    count: () => window.DATA.NOTIFICATIONS.filter((n) => !n.read).length,
    accent: true,
  },
  { id: "admin", label: "Admin", icon: Icons.Admin, adminOnly: true },
];

const SCREEN_LABEL = {
  overview: "01 Overview",
  events: "02 Events",
  proposals: "03 Proposals",
  committee: "04 Committee",
  notifications: "05 Notifications",
  admin: "06 Admin",
};

function Sidebar({ active, onNavigate, currentUser }) {
  const isAdmin = currentUser?.role === "admin_sistem";
  return (
    <aside aria-label="Primary navigation" className="sidebar">
      <a
        className="brand"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("overview");
        }}
      >
        <span className="mark">ch</span>
        <span className="name">committee-hub</span>
      </a>
      <nav aria-label="Main" className="nav">
        <div className="nav-group">Workspace</div>
        {NAV.filter((n) => !n.adminOnly).map((item) => {
          const Icon = item.icon;
          const c = item.count ? item.count() : null;
          return (
            <a
              aria-current={active === item.id ? "page" : undefined}
              className="nav-item"
              href={`#${item.id}`}
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {c ? (
                <span
                  className={`count ${item.accent && c > 0 ? "is-accent" : ""}`}
                >
                  {c}
                </span>
              ) : null}
            </a>
          );
        })}
        {isAdmin && (
          <>
            <div className="nav-group">Platform</div>
            {NAV.filter((n) => n.adminOnly).map((item) => {
              const Icon = item.icon;
              return (
                <a
                  aria-current={active === item.id ? "page" : undefined}
                  className="nav-item"
                  href={`#${item.id}`}
                  key={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </>
        )}
      </nav>
      <div className="foot">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 8px",
          }}
        >
          <Avatar size="sm" user={currentUser} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              className="truncate"
              style={{ fontSize: 12.5, fontWeight: 500 }}
            >
              {currentUser?.name}
            </div>
            <div
              className="truncate"
              style={{ fontSize: 11, color: "var(--text-dim)" }}
            >
              {currentUser?.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ active, currentUser, onSignOut, onMobileMenu }) {
  return (
    <header className="topbar">
      <button
        aria-label="Open menu"
        className="btn icon subtle"
        onClick={onMobileMenu}
        style={{ marginLeft: -8 }}
      >
        <Icons.Menu size={16} />
      </button>
      <nav aria-label="Breadcrumb" className="crumbs">
        <span>committee-hub</span>
        <Icons.Chevron className="sep" size={12} />
        <span className="cur">
          {(SCREEN_LABEL[active] || "").replace(/^\d+\s/, "")}
        </span>
      </nav>
      <div className="spacer" />
      <div aria-label="Search" className="glob-search" role="search">
        <Icons.Search size={14} />
        <span>Search events, proposals…</span>
        <kbd>⌘K</kbd>
      </div>
      <div className="user-pill" title={currentUser?.email}>
        <Avatar size="sm" user={currentUser} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.15,
            marginRight: 2,
            gap: 2,
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>
            {currentUser?.name?.split(" ")[0]}
          </span>
          <RoleBadge role={currentUser?.role} />
        </div>
        <button
          aria-label="Sign out"
          className="btn icon sm subtle"
          onClick={onSignOut}
          title="Sign out"
        >
          <Icons.SignOut size={14} />
        </button>
      </div>
    </header>
  );
}

function AppShell({ active, onNavigate, currentUser, onSignOut, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="app" data-mobile-open={mobileOpen ? "true" : "false"}>
      <Sidebar
        active={active}
        currentUser={currentUser}
        onNavigate={(id) => {
          setMobileOpen(false);
          onNavigate(id);
        }}
      />
      <Topbar
        active={active}
        currentUser={currentUser}
        onMobileMenu={() => setMobileOpen((v) => !v)}
        onSignOut={onSignOut}
      />
      <main className="main" data-screen-label={SCREEN_LABEL[active] || active}>
        {children}
      </main>
    </div>
  );
}

Object.assign(window, { AppShell, Sidebar, Topbar, NAV, SCREEN_LABEL });
