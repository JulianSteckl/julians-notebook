// Canvas LMS integration UI
// — CanvasSetupModal: enter school domain + access token
// — CanvasSyncBar: shows last-sync time + manual refresh button
// — CanvasHomeworkSection: renders Canvas assignments inside the homework view
// — useCanvasData: hook that subscribes to canvas store changes

function useCanvasData() {
  const [data, setData] = React.useState(() => nbGetCanvasData());
  const [cfg, setCfg] = React.useState(() => nbGetCanvasConfig());

  React.useEffect(() => {
    const refresh = () => {
      setData(nbGetCanvasData());
      setCfg(nbGetCanvasConfig());
    };
    window.addEventListener("nbStoreChange", refresh);
    window.addEventListener("canvasConfigChanged", refresh);
    return () => {
      window.removeEventListener("nbStoreChange", refresh);
      window.removeEventListener("canvasConfigChanged", refresh);
    };
  }, []);

  return { data, cfg };
}

// ── Setup modal ────────────────────────────────────────────────────────────

function CanvasSetupModal({ onClose }) {
  const existing = nbGetCanvasConfig() || {};
  const [domain, setDomain] = React.useState(existing.domain || "");
  const [token, setToken] = React.useState(existing.token || "");
  const [status, setStatus] = React.useState(null); // null | "loading" | "ok" | "error"
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSave() {
    const d = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const t = token.trim();
    if (!d || !t) { setErrorMsg("Both fields are required."); setStatus("error"); return; }

    setStatus("loading");
    nbSetCanvasConfig({ domain: d, token: t });

    try {
      const result = await nbSyncCanvas();
      setStatus("ok");
      setTimeout(onClose, 900);
      window.dispatchEvent(new CustomEvent("toast", {
        detail: `Canvas synced — ${result.courses} courses, ${result.assignments} assignments`
      }));
    } catch (err) {
      nbSetCanvasConfig(null);
      setStatus("error");
      setErrorMsg(
        err.message === "canvas-auth"
          ? "Token rejected by Canvas. Check that it's valid and not expired."
          : err.message === "no-config"
          ? "Please enter your domain and token."
          : "Couldn't reach Canvas. Check the domain."
      );
    }
  }

  function handleDisconnect() {
    nbSetCanvasConfig(null);
    window.dispatchEvent(new Event("nbStoreChange"));
    onClose();
  }

  const isConnected = !!existing.domain;

  return (
    <div className="sn-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sn-modal-spring-bottom" style={{ maxWidth: 480, margin: "auto", padding: 28, background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--hairline)", boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 4 }}>
              Integration
            </div>
            <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 400, fontSize: 22, margin: 0, letterSpacing: "-0.01em" }}>
              Connect <em style={{ fontStyle: "italic", color: "var(--accent)" }}>Canvas</em>
            </h2>
          </div>
          <button className="sn-btn ghost icon" onClick={onClose} style={{ flexShrink: 0 }}>✕</button>
        </div>

        {/* Intro blurb */}
        <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 20px" }}>
          Your school's Canvas assignments will appear directly in your homework view,
          synced with real due dates and course names.
        </p>

        {/* Domain field */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontFamily: "var(--f-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 6 }}>
            Canvas Domain
          </label>
          <input
            className="sn-input"
            style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--hairline)", fontFamily: "var(--f-mono)", fontSize: 13, background: "var(--bg)", color: "var(--ink)" }}
            placeholder="school.instructure.com"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            autoFocus
          />
        </div>

        {/* Token field */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontFamily: "var(--f-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 6 }}>
            Access Token
          </label>
          <input
            className="sn-input"
            type="password"
            style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--hairline)", fontFamily: "var(--f-mono)", fontSize: 13, background: "var(--bg)", color: "var(--ink)" }}
            placeholder="Paste your Canvas access token"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
          />
        </div>

        {/* Token help link */}
        <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "0 0 20px", lineHeight: 1.5 }}>
          Get your token in Canvas → Account → Settings → scroll to{" "}
          <em>Approved Integrations</em> → New Access Token.
        </p>

        {/* Error message */}
        {status === "error" && (
          <div style={{ background: "rgba(179,84,59,0.08)", border: "1px solid rgba(179,84,59,0.2)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 16 }}>
            {errorMsg}
          </div>
        )}

        {/* Success */}
        {status === "ok" && (
          <div style={{ background: "var(--done-soft)", border: "1px solid rgba(107,142,90,0.3)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13, color: "var(--done)", marginBottom: 16 }}>
            Connected! Syncing your assignments…
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          {isConnected && (
            <button className="sn-btn ghost" style={{ color: "var(--danger)", fontSize: 13 }} onClick={handleDisconnect}>
              Disconnect
            </button>
          )}
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button className="sn-btn" onClick={onClose}>Cancel</button>
            <button
              className="sn-btn accent"
              onClick={handleSave}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Connecting…" : isConnected ? "Reconnect & Sync" : "Connect"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sync bar (shown at top of homework view when Canvas is connected) ──────

function CanvasSyncBar({ onOpenSetup }) {
  const { data, cfg } = useCanvasData();
  const [syncing, setSyncing] = React.useState(false);

  if (!cfg) return null;

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await nbSyncCanvas();
      window.dispatchEvent(new CustomEvent("toast", {
        detail: `Synced — ${result.assignments} upcoming Canvas assignments`
      }));
    } catch {
      window.dispatchEvent(new CustomEvent("toast", { detail: "Canvas sync failed — check your connection" }));
    } finally {
      setSyncing(false);
    }
  }

  const lastSync = data?.lastSync
    ? new Date(data.lastSync).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--accent-soft)", border: "1px solid rgba(160,120,48,0.2)", borderRadius: "var(--radius)", marginBottom: 16, fontSize: 12.5 }}>
      {/* Canvas logo placeholder */}
      <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--accent)", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>Canvas</span>
      <span style={{ color: "var(--ink-2)", flex: 1 }}>
        {data
          ? `${data.assignments.filter(a => !a.done).length} upcoming assignment${data.assignments.filter(a=>!a.done).length !== 1 ? "s" : ""}${lastSync ? ` · synced ${lastSync}` : ""}`
          : `Connected to ${cfg.domain}`}
      </span>
      <button className="sn-btn ghost icon" title="Settings" onClick={onOpenSetup} style={{ padding: "4px 8px", fontSize: 12 }}>⚙</button>
      <button className="sn-btn ghost" onClick={handleSync} disabled={syncing} style={{ padding: "4px 10px", fontSize: 12 }}>
        {syncing ? "Syncing…" : "Sync"}
      </button>
    </div>
  );
}

// ── Canvas assignments section (rendered inside HomeworkContent) ────────────

function CanvasHomeworkSection({ onOpenSetup }) {
  const { data, cfg } = useCanvasData();

  if (!cfg && !data) {
    // Not connected — show a quiet invite card
    return (
      <div
        onClick={onOpenSetup}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", border: "1.5px dashed var(--hairline)", borderRadius: "var(--radius)", cursor: "pointer", color: "var(--ink-3)", marginBottom: 20, transition: "border-color 0.2s, color 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--hairline)"; e.currentTarget.style.color = "var(--ink-3)"; }}
      >
        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 600, fontSize: 15 }}>Canvas</span>
        <span style={{ fontSize: 13 }}>Connect Canvas to import your real assignments →</span>
      </div>
    );
  }

  if (!data || !data.assignments.length) return null;

  const undone = data.assignments.filter(a => !a.done);
  const done = data.assignments.filter(a => a.done);

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="sn-card-title" style={{ marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--accent)", marginRight: 6 }}>Canvas</span>
        Assignments
        <span className="num" style={{ marginLeft: "auto" }}>{undone.length}</span>
      </div>

      {undone.map(a => (
        <CanvasAssignmentRow key={a.id} assignment={a} />
      ))}

      {done.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", userSelect: "none" }}>
            {done.length} done
          </summary>
          {done.map(a => (
            <CanvasAssignmentRow key={a.id} assignment={a} />
          ))}
        </details>
      )}
    </div>
  );
}

// ── Topbar button ──────────────────────────────────────────────────────────

function CanvasTopbarButton({ onOpen }) {
  const { cfg, data } = useCanvasData();
  const isConnected = !!cfg;
  const pendingCount = data ? data.assignments.filter(a => !a.done).length : 0;

  return (
    <button
      className="sn-btn ghost"
      onClick={onOpen}
      title={isConnected ? `Canvas connected — ${pendingCount} upcoming` : "Connect Canvas LMS"}
      style={{
        fontSize: 12, padding: "5px 10px",
        borderColor: isConnected ? "var(--accent)" : "var(--hairline)",
        color: isConnected ? "var(--accent)" : "var(--ink-3)",
        display: "flex", alignItems: "center", gap: 5,
      }}
    >
      <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13 }}>C</span>
      {isConnected ? "Canvas" : "Canvas"}
      {isConnected && <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--accent)", flexShrink: 0 }} />}
    </button>
  );
}

function CanvasAssignmentRow({ assignment: a }) {
  const [justDone, setJustDone] = React.useState(false);

  function toggle() {
    setJustDone(!a.done);
    nbToggleCanvasAssignment(a.id);
  }

  return (
    <div
      className={`hw-row${a.done ? " done" : ""}${justDone ? " just-completed" : ""}`}
      style={{ gridTemplateColumns: "22px 8px 1fr auto auto", cursor: "default" }}
    >
      {/* Checkbox */}
      <div
        className={`hw-check${a.done ? " done" : ""}`}
        onClick={toggle}
        style={{ cursor: "pointer" }}
      >
        {a.done && (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path className="tick" d="M3 8l3.5 3.5L13 5" />
          </svg>
        )}
      </div>

      {/* Subject color dot */}
      <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent)", opacity: 0.7 }} />

      {/* Title */}
      <div className="hw-title" style={{ minWidth: 0 }}>
        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {a.title}
        </span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 1, display: "block" }}>
          {a.subject}
          {a.points != null && <span style={{ marginLeft: 8 }}>{a.points} pts</span>}
        </span>
      </div>

      {/* Due */}
      <div className={`hw-meta${a.urgent && !a.done ? " urgent" : ""}`}>{a.due}</div>

      {/* Canvas link */}
      {a.canvasUrl && (
        <a
          href={a.canvasUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sn-btn ghost icon"
          style={{ padding: "4px 6px", fontSize: 11, color: "var(--ink-3)", textDecoration: "none" }}
          title="Open in Canvas"
          onClick={e => e.stopPropagation()}
        >
          ↗
        </a>
      )}
    </div>
  );
}
