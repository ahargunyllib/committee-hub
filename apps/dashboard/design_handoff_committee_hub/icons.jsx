// SVG icon set for committee-hub. Stroke-based, 1.5 weight, 20px viewbox.
// All icons exported on window.Icons.

const I = (paths) =>
  function Icon({
    size = 18,
    stroke = 1.6,
    className = "",
    style = {},
    ...rest
  }) {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={stroke}
        style={style}
        viewBox="0 0 24 24"
        width={size}
        {...rest}
      >
        {paths}
      </svg>
    );
  };

const Icons = {
  Overview: I(
    <>
      <rect height="9" rx="1.5" width="7" x="3" y="3" />
      <rect height="5" rx="1.5" width="7" x="14" y="3" />
      <rect height="9" rx="1.5" width="7" x="14" y="12" />
      <rect height="5" rx="1.5" width="7" x="3" y="16" />
    </>
  ),
  Events: I(
    <>
      <rect height="16" rx="2" width="18" x="3" y="5" />
      <path d="M3 9h18" />
      <path d="M8 3v4M16 3v4" />
    </>
  ),
  Proposals: I(
    <>
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  Committee: I(
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.4" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M15 19c.2-2 1.7-3.4 4-3.4 1.5 0 2.6.6 3 1.5" />
    </>
  ),
  Notifications: I(
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  Admin: I(
    <>
      <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  Search: I(
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  Plus: I(
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  Filter: I(
    <>
      <path d="M4 5h16l-6 8v6l-4-2v-4L4 5z" />
    </>
  ),
  Chevron: I(
    <>
      <path d="M9 6l6 6-6 6" />
    </>
  ),
  ChevronDown: I(
    <>
      <path d="M6 9l6 6 6-6" />
    </>
  ),
  Close: I(
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  Check: I(
    <>
      <path d="M5 12l5 5 9-11" />
    </>
  ),
  X: I(
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  Dot: I(
    <>
      <circle cx="12" cy="12" fill="currentColor" r="3" stroke="none" />
    </>
  ),
  More: I(
    <>
      <circle cx="5" cy="12" fill="currentColor" r="1.4" stroke="none" />
      <circle cx="12" cy="12" fill="currentColor" r="1.4" stroke="none" />
      <circle cx="19" cy="12" fill="currentColor" r="1.4" stroke="none" />
    </>
  ),
  Doc: I(
    <>
      <path d="M7 3h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
    </>
  ),
  Ticket: I(
    <>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
      <path d="M14 6v12" strokeDasharray="2 2" />
    </>
  ),
  Pin: I(
    <>
      <path d="M12 21v-7" />
      <path d="M8 14h8l-1.5-2.5V5.5L16 4H8l1.5 1.5v6L8 14z" />
    </>
  ),
  Clock: I(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  Users: I(
    <>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <circle cx="17" cy="10" r="2.4" />
      <path d="M21 18c-.3-1.6-1.8-2.8-4-2.8" />
    </>
  ),
  User: I(
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  SignOut: I(
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 16l-4-4 4-4" />
      <path d="M6 12h12" />
    </>
  ),
  Google: () => (
    <svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M21.6 12.227c0-.703-.063-1.378-.181-2.027H12v3.834h5.378a4.6 4.6 0 0 1-1.996 3.018v2.51h3.23c1.892-1.742 2.988-4.31 2.988-7.335z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.962-.895 6.612-2.438l-3.23-2.51c-.895.6-2.04.955-3.382.955-2.6 0-4.804-1.755-5.594-4.117H3.067v2.59A9.998 9.998 0 0 0 12 22z"
        fill="#34A853"
      />
      <path
        d="M6.406 13.89A6.005 6.005 0 0 1 6.09 12c0-.658.114-1.296.317-1.89V7.52H3.067A9.998 9.998 0 0 0 2 12c0 1.614.387 3.14 1.067 4.48l3.34-2.59z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.5c1.468 0 2.786.504 3.823 1.495l2.867-2.867C16.957 3.51 14.695 2.5 12 2.5A9.998 9.998 0 0 0 3.067 7.52l3.34 2.59C7.196 7.755 9.4 6.5 12 6.5z"
        fill="#EA4335"
      />
    </svg>
  ),
  Settings: I(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  Activity: I(
    <>
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </>
  ),
  External: I(
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </>
  ),
  Refresh: I(
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </>
  ),
  Menu: I(
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  Mail: I(
    <>
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  Layers: I(
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
};

window.Icons = Icons;
