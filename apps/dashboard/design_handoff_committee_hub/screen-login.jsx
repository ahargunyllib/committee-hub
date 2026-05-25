// Login screen — minimal centered auth panel.

function LoginScreen({ onSignIn }) {
  const [loading, setLoading] = useState(false);
  const handle = () => {
    setLoading(true);
    setTimeout(() => onSignIn(), 700);
  };
  return (
    <div className="auth-shell" data-screen-label="00 Login">
      <div aria-labelledby="login-title" className="auth-card" role="dialog">
        <div className="brand-row">
          <span className="mark">ch</span>
          <div>
            <h1 id="login-title">committee-hub</h1>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Campus event &amp; committee operations
            </div>
          </div>
        </div>
        <div className="sub">
          Sign in with your campus Google account to continue.
        </div>
        <button
          aria-label="Continue with Google"
          className="gbtn"
          disabled={loading}
          onClick={handle}
        >
          {loading ? (
            <>
              <span
                className="spinner"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid var(--border)",
                  borderTopColor: "var(--accent)",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Signing you in…
            </>
          ) : (
            <>
              <Icons.Google />
              Continue with Google
            </>
          )}
        </button>
        <div className="foot">
          New accounts join as{" "}
          <span className="mono" style={{ color: "var(--text)" }}>
            mahasiswa
          </span>
          .
        </div>
      </div>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

window.LoginScreen = LoginScreen;
