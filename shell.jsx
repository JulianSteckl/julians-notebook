// Shared shell components — sidebar, topbar, icons

const Ico = {
  home:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 7l6-4 6 4v6a1 1 0 0 1-1 1h-3v-4H6v4H3a1 1 0 0 1-1-1V7z"/></svg>,
  book:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h7a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V2zM3 12a2 2 0 0 1 2-2h7"/></svg>,
  note:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h7l3 3v9H3V2zM10 2v3h3"/></svg>,
  quiz:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2h6l2 2v10H3V4l2-2z"/><path d="M6 6h4M6 9h4M6 12h2"/></svg>,
  hw:      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="10" height="11" rx="1"/><path d="M5 7l1.5 1.5L9 6M5 11l1.5 1.5L9 10"/></svg>,
  cal:     <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M2 6h12M5 2v3M11 2v3"/></svg>,
  cards:   <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="9" height="10" rx="1"/><path d="M5 2h9v10"/></svg>,
  grade:   <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2l1.8 4 4.2.5-3 2.9.8 4.1L8 11.7 4.2 13.5 5 9.4 2 6.5 6.2 6 8 2z"/></svg>,
  file:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h6l4 4v8H3V2zM9 2v4h4"/></svg>,
  college: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2l6 3-6 3-6-3 6-3z"/><path d="M2 8v3c0 1.1 2.7 2 6 2s6-.9 6-2V8"/><path d="M14 5v5"/></svg>,
  search:  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>,
  plus:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>,
  flame:   <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5c.7 1.7-.4 3-1 4-.7 1.2.3 2 .8 1.4.4-.5.5-1.2.8-1.7.5 1 2 2.5 2 4.4 0 2.4-2 4.4-2.6 4.4-.7 0-.8-1-1.7-1.5-1.2-.7-1.5-2.2-.4-3-.5 2 1 2.5 1.5 1.5.7-1.3-1-2-1.4-3.6-.3-1.4 1-3 2-5.9z"/></svg>,
  drag:    <svg width="10" height="14" viewBox="0 0 8 12" fill="currentColor"><circle cx="2" cy="2" r="1"/><circle cx="6" cy="2" r="1"/><circle cx="2" cy="6" r="1"/><circle cx="6" cy="6" r="1"/><circle cx="2" cy="10" r="1"/><circle cx="6" cy="10" r="1"/></svg>,
  arrow:   <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path className="tick" d="M3 8l3.5 3.5L13 5"/></svg>,
  clock:   <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/></svg>,
  dots:    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="13" cy="8" r="1.3"/></svg>,
  bold:    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3h4a2.5 2.5 0 0 1 0 5H5V3zM5 8h5a2.5 2.5 0 0 1 0 5H5V8z"/></svg>,
  italic:  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h6M4 13h6M9 3l-2 10"/></svg>,
  list:    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h8M5 8h8M5 12h8M2.5 4h.1M2.5 8h.1M2.5 12h.1"/></svg>,
};

function useFbUser() {
  const [user, setUser] = React.useState(window.__fbCurrentUser || null);
  React.useEffect(() => {
    const handler = (e) => setUser(e.detail);
    window.addEventListener("fbUserChanged", handler);
    return () => window.removeEventListener("fbUserChanged", handler);
  }, []);
  return user;
}

function UserAvatar({ fbUser, letter, size = 28, onClick }) {
  const style = { width: size, height: size, borderRadius: "50%", flexShrink: 0, cursor: onClick ? "pointer" : "default" };
  if (fbUser && fbUser.photoURL) {
    return <img src={fbUser.photoURL} alt="" style={{ ...style, border: "1.5px solid var(--hairline)", objectFit: "cover" }} onClick={onClick} />;
  }
  return <div className="sn-avatar" style={onClick ? { cursor: "pointer" } : undefined} onClick={onClick}>{letter}</div>;
}

function Sidebar({ active = "dashboard", subjects = SUBJECTS, brandSub = "v1", onNav }) {
  const go = (key) => (e) => { if (onNav) { e.preventDefault(); onNav(key); } };
  const fbUser = useFbUser();
  const profile = React.useMemo(() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } }, []);
  const displayName = fbUser ? fbUser.displayName : (profile ? profile.name : "Maya R.");
  const displayGrade = profile ? (profile.grade.charAt(0).toUpperCase() + profile.grade.slice(1)) : "Junior · 11ᵗʰ";
  const avatarLetter = (fbUser ? fbUser.displayName : displayName).charAt(0).toUpperCase();

  // Subscribe to store changes so badge counts update live
  const store = useNbStore();
  const hwOpen = [...HOMEWORK, ...store.homework].filter(h => !h.done).length;
  const quizCount = QUIZZES_UPCOMING.length;

  // ─── Sliding pill indicator
  const asideRef = React.useRef(null);
  const [pill, setPill] = React.useState(null);
  const [firstMeasure, setFirstMeasure] = React.useState(true);
  React.useLayoutEffect(() => {
    const root = asideRef.current;
    if (!root) return;
    const el = root.querySelector(".sn-nav-item.active");
    if (!el) { setPill(null); return; }
    setPill({
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight,
      bg: el.dataset.pillBg || "var(--accent)",
    });
    // Snap into place on first render without animating from 0,0
    const t = setTimeout(() => setFirstMeasure(false), 60);
    return () => clearTimeout(t);
  }, [active, subjects.length]);

  return (
    <aside className="sn-sidebar" ref={asideRef}>
      {pill && (
        <div
          className={`sn-nav-pill ${firstMeasure ? "entering" : ""}`}
          style={{
            top: pill.top,
            left: pill.left,
            width: pill.width,
            height: pill.height,
            background: pill.bg,
          }}
        ></div>
      )}
      <div className="sn-brand" style={{ cursor: onNav ? "pointer" : "default" }} onClick={onNav ? go("dashboard") : undefined}>
        <span className="mark">¶</span>
        <span className="name">Julian's Notebook</span>
        <span className="sub">{brandSub}</span>
      </div>

      <div className="sn-nav-group">
        <h4>Workspace</h4>
        <div className={`sn-nav-item ${active === "dashboard" ? "active" : ""}`} data-pill-bg="var(--accent)" onClick={go("dashboard")}><span className="ico">{Ico.home}</span>Today</div>
        <div className={`sn-nav-item ${active === "homework" ? "active" : ""}`} data-pill-bg="var(--accent)" onClick={go("homework")}><span className="ico">{Ico.hw}</span>Homework {hwOpen > 0 && <span className="badge">{hwOpen}</span>}</div>
        <div className={`sn-nav-item ${active === "quizzes" ? "active" : ""}`} data-pill-bg="var(--accent)" onClick={go("quizzes")}><span className="ico">{Ico.quiz}</span>Quizzes {quizCount > 0 && <span className="badge">{quizCount}</span>}</div>
        <div className={`sn-nav-item ${active === "notes" ? "active" : ""}`} data-pill-bg="var(--accent)" onClick={go("notes")}><span className="ico">{Ico.note}</span>Notes</div>
        <div className={`sn-nav-item ${active === "cards" ? "active" : ""}`} data-pill-bg="var(--accent)" onClick={go("flashcards")}><span className="ico">{Ico.cards}</span>Flashcards</div>
        <div className={`sn-nav-item ${active === "schedule" ? "active" : ""}`} data-pill-bg="var(--accent)" onClick={go("schedule")}><span className="ico">{Ico.cal}</span>Schedule</div>
        <div className={`sn-nav-item ${active === "grades" ? "active" : ""}`} data-pill-bg="var(--accent)" onClick={go("grades")}><span className="ico">{Ico.grade}</span>Grades</div>
        <div className={`sn-nav-item ${active === "college" ? "active" : ""}`} data-pill-bg="var(--plum)" onClick={go("college")} style={active === "college" ? { color: "white" } : {}}><span className="ico">{Ico.college}</span>College Prep</div>
      </div>

      <div className="sn-nav-group">
        <h4 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Subjects</span>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("openManageSubjects"))}
            title="Add a subject"
            style={{ background: "transparent", border: "1px solid var(--hairline)", borderRadius: 3, color: "var(--ink-3)", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "1px 5px", fontFamily: "var(--f-mono)" }}
          >+</button>
        </h4>
        {subjects.map((s) => {
          const isActive = active === s.id;
          const Glyph = window.SubjectGlyph;
          return (
            <div key={s.id}
              className={`sn-nav-item ${isActive ? "active" : ""}`}
              data-pill-bg={s.color}
              onClick={go("subject:" + s.id)}
              style={isActive ? { color: "white" } : undefined}
            >
              <span className="sn-glyph" style={{ "--c": s.color, color: isActive ? "rgba(255,255,255,0.9)" : s.color }}>
                {Glyph ? <Glyph subject={s} size={15} color="currentColor" /> : <span className="sn-subject-dot" style={{ background: s.color }}></span>}
              </span>
              <span title={s.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.short}</span>
              <span className="badge" style={isActive ? { color: "rgba(255,255,255,0.75)" } : undefined}>{s.hw || ""}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--hairline)" }}>
        <XPBar />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <UserAvatar fbUser={fbUser} letter={avatarLetter} />
          <div style={{ lineHeight: 1.2, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{displayGrade}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── XP Bar component ──────────────────────────────────────────────────────
function XPBar() {
  const [xp, setXp] = React.useState(() => typeof nbGetXP === "function" ? nbGetXP() : null);
  React.useEffect(() => {
    const refresh = () => setXp(nbGetXP());
    window.addEventListener("nbStoreChange", refresh);
    return () => window.removeEventListener("nbStoreChange", refresh);
  }, []);
  if (!xp) return null;
  return (
    <div style={{ padding: "8px 0 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {xp.badge} Lv.{xp.level} {xp.title}
        </span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>{xp.total} XP</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--hairline)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2,
          background: "var(--accent)",
          width: `${Math.round(xp.progress * 100)}%`,
          transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}></div>
      </div>
      {xp.next && (
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", marginTop: 3 }}>
          {xp.next.xp - xp.total} XP to {xp.next.title}
        </div>
      )}
    </div>
  );
}

function Topbar({ streak = nbGetStreak(), placeholder = "Search notes, homework, quizzes…", onSearchClick, onPlusClick, extras, onSignOut }) {
  const fbUser = useFbUser();
  const avatarLetter = (() => { try { const p = JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); return p ? p.name.charAt(0).toUpperCase() : "M"; } catch { return "M"; } })();
  return (
    <div className="sn-topbar">
      <div className="sn-search" onClick={onSearchClick} style={{ cursor: onSearchClick ? "pointer" : "text" }}>
        {Ico.search}
        <input placeholder={placeholder} onFocus={(e) => { if (onSearchClick) { e.target.blur(); onSearchClick(); } }} readOnly={!!onSearchClick} style={{ cursor: onSearchClick ? "pointer" : "text" }} />
        <span className="kbd">⌘K</span>
      </div>
      <div className="spacer"></div>
      {extras}
      <div className="sn-streak">
        <span className="flame">{Ico.flame}</span>
        <span><b style={{ color: "var(--ink)" }}>{streak}</b>-day streak</span>
      </div>
      <button className="sn-btn icon ghost" title="Quick add" onClick={onPlusClick}>{Ico.plus}</button>
      <UserAvatar fbUser={fbUser} letter={avatarLetter} onClick={fbUser ? onSignOut : undefined} />
    </div>
  );
}

function PageHeader({ eyebrow, title, italic, meta, actions }) {
  return (
    <div className="sn-pageheader">
      <div className="titleblock">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>
          {title}
          {italic && <> <em>{italic}</em></>}
        </h1>
        {meta && <div className="meta">{meta}</div>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

function SubjectDot({ id, size = 8, asGlyph = false }) {
  const s = subjectBy(id);
  if (!s) return null;
  if (asGlyph && window.SubjectGlyph) {
    return <window.SubjectGlyph subject={s} size={size * 1.6} color={s.color} />;
  }
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: 2, background: s.color }}></span>;
}

function ConfidenceMeter({ value }) {
  // value 0..1
  const pct = Math.round(value * 100);
  const color = value >= 0.7 ? "var(--done)" : value >= 0.5 ? "var(--ochre)" : "var(--accent)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 60, height: 4, background: "var(--hairline)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }}></div>
      </div>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)" }}>{pct}%</span>
    </div>
  );
}

Object.assign(window, { Ico, Sidebar, Topbar, PageHeader, SubjectDot, ConfidenceMeter });
