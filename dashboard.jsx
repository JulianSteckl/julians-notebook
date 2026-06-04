// Dashboard variations

// Pull editorial visual components from window (loaded in visuals.jsx)
const { SubjectGlyph, Ornament, HatchBar, TallyMarks, TimeOfDayArc, DropFolio, WatermarkGlyph, StreakMatrix, Stamp } = window;

function greetingFor(d = new Date()) {
  const h = d.getHours();
  if (h < 5)  return "Up late,";
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  if (h < 21) return "Good evening,";
  return "Late night,";
}

// ── Dashboard customizer ──
const BUILT_IN_WIDGETS = [
  { id: "week-strip",       label: "Week strip",          desc: "7-day overview with class events" },
  { id: "up-next",          label: "Up next / In session",desc: "Current or next class with countdown" },
  { id: "ai-plan",          label: "AI game plan",        desc: "AI-generated daily priorities" },
  { id: "homework",         label: "Due today",           desc: "Open homework items" },
  { id: "quizzes",          label: "Quizzes ahead",       desc: "Upcoming quiz cards with confidence" },
  { id: "schedule",         label: "Today's schedule",    desc: "Bell-by-bell class list" },
  { id: "recent-notes",     label: "Recent notes",        desc: "Last 3 notes you edited" },
  { id: "streak",           label: "Study streak",        desc: "Daily study streak tracker" },
  { id: "subject-progress", label: "Subject progress",    desc: "Homework completion per class" },
  { id: "margin-note",      label: "Margin note",         desc: "Pinned class reminder" },
];

function useDashPrefs() {
  const [hidden, setHiddenRaw] = React.useState(() => nbGetPref("hiddenWidgets", []));
  const [custom, setCustomRaw] = React.useState(() => nbGetPref("customWidgets", []));

  const setHidden = (v) => { nbSetPref("hiddenWidgets", v); setHiddenRaw(v); };
  const setCustom = (v) => { nbSetPref("customWidgets", v); setCustomRaw(v); };

  const isVisible = (id) => !hidden.includes(id);
  const toggle = (id) => setHidden(hidden.includes(id) ? hidden.filter(x => x !== id) : [...hidden, id]);
  const addCustom = (w) => setCustom([...custom, w]);
  const removeCustom = (id) => setCustom(custom.filter(w => w.id !== id));

  return { hidden, custom, isVisible, toggle, addCustom, removeCustom };
}

function DashboardCustomizer({ prefs, onClose }) {
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState("");

  const generateWidget = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiError("");
    const prompt = `A student wants a custom dashboard widget for their school notebook app. They described it as: "${aiPrompt.trim()}"

Generate a JSON widget config (no markdown, no fences, just raw JSON):
{
  "id": "ai-<short-unique-slug>",
  "title": "Widget title (under 30 chars)",
  "type": "stat|list|text|quote",
  "stat": "big number or value to display prominently (if type=stat)",
  "unit": "label under the stat (if type=stat)",
  "items": ["bullet 1", "bullet 2", "bullet 3"] (if type=list, max 5 items),
  "content": "paragraph or quote text (if type=text or quote)",
  "emoji": "one relevant emoji"
}

Use real, helpful content based on their description. Make it genuinely useful for a high school student.`;

    try {
      let result;
      if (typeof window.claude !== "undefined" && window.claude.complete) {
        const text = await window.claude.complete(prompt);
        result = JSON.parse(text.replace(/```json?/g,"").replace(/```/g,"").trim());
      } else {
        // Demo fallback
        const slug = aiPrompt.toLowerCase().replace(/\s+/g,"-").slice(0,15);
        result = {
          id: "ai-" + slug + "-" + Date.now().toString(36).slice(-3),
          title: aiPrompt.slice(0, 30),
          type: "list",
          emoji: "✦",
          items: ["AI is not connected — open app in Claude to enable", "This widget was generated from: \"" + aiPrompt.slice(0,40) + "\"", "Connect Claude API to get real AI-generated content"],
        };
      }
      if (!result.id) result.id = "ai-" + Date.now().toString(36);
      prefs.addCustom(result);
      setAiPrompt("");
      window.dispatchEvent(new CustomEvent("toast", { detail: `Widget "${result.title}" added to dashboard` }));
    } catch(e) {
      setAiError("Couldn't generate widget — try rephrasing.");
    } finally { setAiLoading(false); }
  };

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 360, zIndex: 90,
      background: "var(--surface)", borderLeft: "1px solid var(--hairline)",
      boxShadow: "-12px 0 28px -16px rgba(20,16,11,0.18)",
      display: "flex", flexDirection: "column",
      animation: "slide-in 0.22s ease",
    }}>
      <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Dashboard</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 2 }}>Customize <em style={{ color: "var(--accent)" }}>widgets</em></div>
        </div>
        <button className="sn-btn ghost icon" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 22px" }}>
        {/* AI widget creator */}
        <div style={{ marginBottom: 20, padding: 14, background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--hairline)" }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 15, marginBottom: 8 }}>
            <span style={{ color: "var(--accent)", marginRight: 6 }}>✦</span>Create a widget with AI
          </div>
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") generateWidget(); }}
            placeholder='e.g. "motivational quote", "time until weekend", "GPA tracker"'
            style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--hairline)", borderRadius: 5, fontFamily: "inherit", fontSize: 12.5, background: "var(--surface)", color: "var(--ink)", outline: "none", boxSizing: "border-box", marginBottom: 8 }}
          />
          {aiError && <div style={{ fontSize: 11.5, color: "var(--accent)", marginBottom: 6 }}>{aiError}</div>}
          <button className="sn-btn primary" onClick={generateWidget} disabled={!aiPrompt.trim() || aiLoading}
            style={{ width: "100%", justifyContent: "center", opacity: aiPrompt.trim() && !aiLoading ? 1 : 0.4 }}>
            {aiLoading ? "Generating…" : "✦ Generate widget"}
          </button>
        </div>

        {/* Custom widgets */}
        {prefs.custom.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Your AI widgets</div>
            {prefs.custom.map(w => (
              <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", marginBottom: 6, background: "var(--bg-2)", borderRadius: 6 }}>
                <div style={{ fontSize: 13 }}>{w.emoji || "✦"} {w.title}</div>
                <button onClick={() => prefs.removeCustom(w.id)} style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Built-in widget toggles */}
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Built-in widgets</div>
        {BUILT_IN_WIDGETS.map(w => (
          <div key={w.id} onClick={() => prefs.toggle(w.id)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", marginBottom: 6,
            borderRadius: 6, border: "1px solid var(--hairline)", cursor: "pointer",
            background: prefs.isVisible(w.id) ? "var(--surface)" : "var(--bg-2)",
            opacity: prefs.isVisible(w.id) ? 1 : 0.55,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4, flexShrink: 0,
              border: "1.5px solid " + (prefs.isVisible(w.id) ? "var(--accent)" : "var(--hairline)"),
              background: prefs.isVisible(w.id) ? "var(--accent)" : "transparent",
              display: "grid", placeItems: "center",
            }}>
              {prefs.isVisible(w.id) && <span style={{ color: "white", fontSize: 11, lineHeight: 1 }}>✓</span>}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{w.label}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>{w.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 22px", borderTop: "1px solid var(--hairline)" }}>
        <button className="sn-btn ghost" onClick={() => { nbSetPref("hiddenWidgets", []); nbSetPref("customWidgets", []); onClose(); window.location.reload(); }}
          style={{ fontSize: 11, color: "var(--ink-3)" }}>Reset to default</button>
      </div>
    </div>
  );
}

function CustomWidgetCard({ w, onRemove }) {
  return (
    <div className="sn-card" style={{ position: "relative", borderLeft: "3px solid var(--accent)" }}>
      <button onClick={onRemove} title="Remove widget" style={{ position: "absolute", top: 10, right: 10, border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 14 }}>×</button>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{w.emoji || "✦"} {w.title}</div>
      {w.type === "stat" && (
        <>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 44, lineHeight: 1 }}>{w.stat}</div>
          {w.unit && <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{w.unit}</div>}
        </>
      )}
      {w.type === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {(w.items || []).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
              <span style={{ color: "var(--accent)" }}>•</span>{item}
            </div>
          ))}
        </div>
      )}
      {(w.type === "text" || w.type === "quote") && (
        <div style={{ fontFamily: w.type === "quote" ? "var(--f-display)" : "inherit", fontStyle: w.type === "quote" ? "italic" : "normal", fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)", borderLeft: w.type === "quote" ? "2px solid var(--accent)" : "none", paddingLeft: w.type === "quote" ? 10 : 0 }}>
          {w.content}
        </div>
      )}
    </div>
  );
}

// ── AI Day Plan widget ──
function AIDayPlan() {
  const [status, setStatus] = React.useState("idle"); // idle | loading | done | error
  const [lines, setLines] = React.useState([]);
  const profile = React.useMemo(() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1")||"null"); } catch { return null; } }, []);

  const generate = async () => {
    setStatus("loading");
    const now = new Date();
    const timeStr = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const dayStr  = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const userName = profile ? profile.name : "there";

    const openHW = [...HOMEWORK, ...nbGetHomework()].filter(h => !h.done);
    const hwText = openHW.map(h => `- ${subjectBy(h.subject).short}: "${h.title}" due ${h.due} (${h.est})${h.urgent?" [URGENT]":""}`).join("\n") || "None";
    const quizText = QUIZZES_UPCOMING.map(q => `- ${subjectBy(q.subject).short}: ${q.title} on ${q.when}`).join("\n") || "None";
    const schedText = nbGetSchedule().filter(p => p.subject).map(p => `- ${subjectBy(p.subject).short} at ${p.time}`).join("\n") || "No schedule set";

    const prompt = `You are a study coach. It is ${timeStr} on ${dayStr}. You're helping ${userName}, a high school ${profile?.grade||"student"}.

Today's schedule:
${schedText}

Open homework:
${hwText}

Upcoming quizzes:
${quizText}

Give ${userName} a sharp, specific game plan for TODAY — what to do right now and in what order. Be direct and actionable. Maximum 5 bullet points, one line each. Start each with an action verb. Format as plain bullet lines starting with "- ". End with one short motivating sentence on its own line (no bullet).`;

    try {
      let text = "";
      if (typeof window.claude !== "undefined" && window.claude.complete) {
        text = await window.claude.complete(prompt);
      } else {
        // Smart fallback
        const urgent = openHW.filter(h => h.urgent);
        const rest = openHW.filter(h => !h.urgent).slice(0, 2);
        const quiz = QUIZZES_UPCOMING[0];
        const items = [
          ...urgent.map(h => `- Start with ${subjectBy(h.subject).short}: "${h.title}" — it's due ${h.due}`),
          ...rest.map(h => `- Then tackle ${subjectBy(h.subject).short}: "${h.title}" (${h.est})`),
          quiz ? `- Spend 15 min reviewing for ${subjectBy(quiz.subject).short} quiz on ${quiz.when}` : null,
        ].filter(Boolean).slice(0, 5);
        text = items.length ? items.join("\n") : "- Review your notes and plan out your evening";
      }
      const parsed = text.split("\n").filter(l => l.trim());
      setLines(parsed);
      setStatus("done");
    } catch(e) {
      setStatus("error");
    }
  };

  // Auto-generate on mount
  React.useEffect(() => { generate(); }, []);

  return (
    <div className="sn-card" style={{ marginBottom: 20, borderLeft: "3px solid var(--accent)", position: "relative", background: "linear-gradient(135deg, var(--accent-soft) 0%, var(--surface) 60%)", backgroundBlendMode: "normal" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, color: "var(--accent)" }}>✦</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Game plan for today</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 1 }}>AI · updates with your homework & schedule</div>
          </div>
        </div>
        <button className="sn-btn ghost" onClick={generate} style={{ fontSize: 11, padding: "4px 10px" }}>↻ Refresh</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {status === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-3)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13 }}>
            <div className="ai-dots"><span></span><span></span><span></span></div>
            <style>{`.ai-dots{display:flex;gap:5px}.ai-dots span{width:5px;height:5px;border-radius:50%;background:var(--accent);animation:dot-pulse .9s ease infinite}.ai-dots span:nth-child(2){animation-delay:.15s}.ai-dots span:nth-child(3){animation-delay:.3s}@keyframes dot-pulse{0%,80%,100%{opacity:.25;transform:scale(.85)}40%{opacity:1;transform:scale(1.1)}}`}</style>
            Thinking about your day…
          </div>
        )}
        {status === "error" && <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Couldn't load — <button className="sn-btn ghost" onClick={generate} style={{fontSize:11}}>try again</button></div>}
        {status === "done" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {lines.filter(line => line.startsWith("- ")).map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, lineHeight: 1.5 }}>
                <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                <span>{line.slice(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dynamic week strip builder ──
// Maps a homework due string to a JS Date (or null if can't resolve to a specific day).
function dueStringToDate(due, now) {
  if (!due) return null;
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const lc = due.toLowerCase().trim();
  if (lc === "tonight" || lc === "today") return d;
  if (lc === "tomorrow") { const t = new Date(d); t.setDate(d.getDate() + 1); return t; }
  // Short day names: Mon Tue Wed Thu Fri Sat Sun
  const dayNames = ["sun","mon","tue","wed","thu","fri","sat"];
  const shortIdx = dayNames.indexOf(lc.slice(0,3));
  if (shortIdx !== -1) {
    // Find that weekday in the current Mon–Sun window
    const mondayOffset = d.getDay() === 0 ? -6 : 1 - d.getDay();
    const monday = new Date(d); monday.setDate(d.getDate() + mondayOffset);
    const target = new Date(monday); target.setDate(monday.getDate() + ((shortIdx + 6) % 7));
    return target;
  }
  // Full day names: Monday, Tuesday, etc.
  const fullNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const fullIdx = fullNames.indexOf(lc);
  if (fullIdx !== -1) {
    const mondayOffset = d.getDay() === 0 ? -6 : 1 - d.getDay();
    const monday = new Date(d); monday.setDate(d.getDate() + mondayOffset);
    const target = new Date(monday); target.setDate(monday.getDate() + ((fullIdx + 6) % 7));
    return target;
  }
  // ISO date: 2026-05-22
  if (/^\d{4}-\d{2}-\d{2}$/.test(due)) {
    const parsed = new Date(due + "T00:00:00");
    if (!isNaN(parsed)) return parsed;
  }
  // "May 22" or "May 22, 2026"
  const shortMonth = new Date(due + (due.includes(",") ? "" : ", " + now.getFullYear()));
  if (!isNaN(shortMonth)) return shortMonth;
  return null;
}

function buildLiveWeek(allHW, allQuizzes) {
  const now = new Date();
  const todayDow = now.getDay(); // 0=Sun
  const mondayOffset = todayDow === 0 ? -6 : 1 - todayDow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const dayLabels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return dayLabels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday = d.toDateString() === now.toDateString();
    const items = [];

    // Open homework due on this day
    allHW.filter(h => !h.done).forEach(h => {
      const hd = dueStringToDate(h.due, now);
      if (hd && hd.toDateString() === d.toDateString()) {
        items.push({ subject: h.subject, note: h.title.length > 22 ? h.title.slice(0, 20) + "…" : h.title, type: "hw" });
      }
    });

    // Quizzes on this day
    allQuizzes.forEach(q => {
      const qd = dueStringToDate(q.when || q.dateStr || "", now);
      if (qd && qd.toDateString() === d.toDateString()) {
        items.push({ subject: q.subject, note: (q.title || "Quiz").slice(0, 20), type: "quiz" });
      }
    });

    return { day: label, date: d.getDate(), month: d.getMonth(), today: isToday, items };
  });
}

// ── Real date helpers ──
function getTermInfo() {
  const now = new Date();
  const profile = (() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } })();
  const userName = profile ? profile.name : "there";

  // Determine term label from current month
  const month = now.getMonth(); // 0=Jan
  const termLabel = (month >= 7 && month <= 11) ? "Fall term" : "Spring term";

  // Compute week number since school year start
  let weekNum = "—";
  let weekTotal = "—";
  if (profile && profile.yearStart) {
    const start = new Date(profile.yearStart.year, profile.yearStart.month, 1);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const elapsed = now - start;
    if (elapsed > 0) {
      weekNum = Math.min(Math.ceil(elapsed / msPerWeek), 36);
      weekTotal = 36;
    }
  }

  const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()];
  const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const shortDate = now.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const weekOfStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return { termLabel, weekNum, weekTotal, dayName, dateStr, shortDate, weekOfStr, userName, now };
}

function Dashboard({ variant = "combined", density = "default", view = "cards" }) {
  return (
    <div className={`sn-root density-${density}`} style={{ height: "100%" }}>
      <div className="sn-app">
        <Sidebar active="dashboard" />
        <main className="sn-main">
          <Topbar />
          <div className="sn-content">
            {variant === "combined" && <DashCombined view={view} />}
            {variant === "focus" && <DashFocus view={view} />}
            {variant === "timeline" && <DashTimeline view={view} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─────────────── Variant C: "Combined" — everything on one screen

function DashCombined({ view }) {
  const store = useNbStore(); // re-renders on every store change
  const allHW = React.useMemo(() => [...HOMEWORK, ...store.homework], [store.homework]);
  const allQuizzes = React.useMemo(() => [...QUIZZES_UPCOMING, ...nbGetQuizzes()], [store.homework]);
  const todayHW = allHW.filter((h) => !h.done).slice(0, 4);
  const openCount = allHW.filter((h) => !h.done).length;
  const quizCount = allQuizzes.length;

  const sched = useScheduleStatus();
  const prefs = useDashPrefs();
  const [customizerOpen, setCustomizerOpen] = React.useState(false);
  const W = (id) => prefs.isVisible(id);
  const schedule = sched.schedule;
  // Class to feature: the one in session if any, else the next one, else last class earlier
  const featureIdx = sched.nowIdx >= 0 ? sched.nowIdx
                  : sched.nextIdx >= 0 ? sched.nextIdx
                  : schedule.length - 1;
  const featured = schedule[featureIdx] || schedule[0] || { subject: null, time: "—", end: "—", room: "—", note: "" };
  const featuredSubject = featured.subject ? subjectBy(featured.subject) : null;
  const featuredColor = featuredSubject ? featuredSubject.color : "var(--ink-3)";
  const featuredLabel = featuredSubject ? featuredSubject.name : "Lunch";

  // Eyebrow text + countdown content
  const inSession = sched.nowIdx >= 0;
  const eyebrow = inSession
    ? `In session · ${featured.time}–${featured.end} · Room ${featured.room}`
    : sched.nextIdx >= 0
    ? `Up next · ${featured.time} · Room ${featured.room}`
    : (featured.time && featured.time !== "—")
      ? `All done for today · last class ended ${featured.end}`
      : "All done for today · enjoy your evening";
  const minsToEndOfNow = inSession ? (schedToMinutes(featured.end) - (new Date().getHours() * 60 + new Date().getMinutes())) : null;
  const countdownNum = inSession ? minsToEndOfNow : sched.minsToNext;
  const countdownLbl = inSession ? "until bell" : sched.minsToNext != null ? "until bell" : "tomorrow";

  const quizSuffix = quizCount === 0 ? "no quizzes scheduled"
                   : quizCount === 1 ? "1 quiz coming up"
                   : `${quizCount} quizzes coming up`;
  const headerMeta = sched.status === "after-school"
    ? `${openCount} thing${openCount !== 1 ? "s" : ""} to finish tonight · ${quizSuffix}`
    : sched.nowIdx >= 0
    ? `${openCount} thing${openCount !== 1 ? "s" : ""} due today · ${featuredSubject?.short || "class"} in session`
    : sched.minsToNext != null
    ? `${openCount} thing${openCount !== 1 ? "s" : ""} due today · next class in ${fmtDuration(sched.minsToNext)}`
    : `${openCount} thing${openCount !== 1 ? "s" : ""} due today · ${quizSuffix}`;

  return (
    <>
      <PageHeader
        eyebrow={(() => { const t = getTermInfo(); const wk = t.weekNum !== "—" ? ` · Week ${t.weekNum} of ${t.weekTotal}` : ""; return `${t.dayName} · ${t.shortDate} · ${t.termLabel}${wk}`; })()}
        title={greetingFor(new Date())}
        italic={`${getTermInfo().userName}.`}
        meta={headerMeta}
        actions={
          <>
            <button className="sn-btn ghost" onClick={() => setCustomizerOpen(true)}>✎ Customize</button>
            <button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } }))}>+ Add</button>
          </>
        }
      />

      {/* Customizer panel */}
      {customizerOpen && <DashboardCustomizer prefs={prefs} onClose={() => setCustomizerOpen(false)} />}

      {/* AI custom widgets */}
      {prefs.custom.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 20 }}>
          {prefs.custom.map(w => <CustomWidgetCard key={w.id} w={w} onRemove={() => prefs.removeCustom(w.id)} />)}
        </div>
      )}

      {/* Week strip — live, computed from real homework & quiz data */}
      {W("week-strip") && (() => {
        const liveWeek = buildLiveWeek(allHW, allQuizzes);
        return (
          <div className="sched-strip" style={{ marginBottom: 22 }}>
            {liveWeek.map((d) => (
              <div key={d.day} className={`sched-day ${d.today ? "today" : ""}`} style={{ minHeight: 92 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="dn">{d.day}{d.today && " · today"}</span>
                  <span className="dd">{d.date}</span>
                </div>
                {d.items.slice(0, 3).map((it, i) => {
                  const sb = subjectBy(it.subject);
                  return (
                    <div key={i} className="pill" style={{
                      "--c": sb.color, "--c-bg": sb.color + "22",
                      borderStyle: it.type === "quiz" ? "dashed" : "solid",
                    }}>
                      {sb.short} · {it.note}
                    </div>
                  );
                })}
                {d.items.length === 0 && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: "auto" }}>— free —</div>}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Up-next hero — full width */}
      {W("up-next") && (() => {
        // Build live chips from real data for the featured subject
        const subjId = featured.subject;
        const subjHW = subjId ? allHW.filter(h => h.subject === subjId && !h.done) : [];
        const subjQuiz = subjId ? allQuizzes.filter(q => q.subject === subjId) : [];
        const subjNotes = subjId ? [...(store.notesFor(subjId) || []), ...notesForSubject(subjId)] : [];

        const chips = [];
        // Urgent homework first
        subjHW.filter(h => h.urgent).forEach(h => chips.push({ label: h.title.length > 28 ? h.title.slice(0,26)+"…" : h.title, warn: true }));
        // Non-urgent homework
        subjHW.filter(h => !h.urgent).slice(0, 2).forEach(h => chips.push({ label: `${h.title.length > 24 ? h.title.slice(0,22)+"…" : h.title} · ${h.due}`, warn: false }));
        // Upcoming quizzes
        subjQuiz.slice(0, 1).forEach(q => chips.push({ label: `Quiz: ${q.title.length > 20 ? q.title.slice(0,18)+"…" : q.title} · ${q.when || q.dateStr || "TBD"}`, warn: false }));
        // Notes count hint
        if (subjNotes.length > 0 && chips.length < 3) {
          chips.push({ label: `${subjNotes.length} note${subjNotes.length !== 1 ? "s" : ""} in ${featuredSubject?.short || "class"}`, warn: false });
        }
        // Fallback if nothing
        if (chips.length === 0 && !subjId) chips.push({ label: "No class in session", warn: false });

        // Right-side content: countdown or next-day summary
        const nextDayHW = allHW.filter(h => !h.done).slice(0, 2);
        return (
          <div className="sn-card hero-watermark-card" style={{ display: "flex", gap: 22, alignItems: "stretch", marginBottom: 20, padding: "22px 24px", "--c": featuredColor }}>
            {/* Watermark glyph */}
            {subjId && <div className="watermark"><SubjectGlyph subject={featured.subject} size={260} color="currentColor" /></div>}
            <div style={{ width: 6, borderRadius: 3, background: featuredColor }}></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {subjId && <SubjectGlyph subject={featured.subject} size={16} color={featuredColor} />}
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>{eyebrow}</div>
              </div>
              <h2 className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 32, margin: "6px 0 4px", letterSpacing: "-0.015em" }}>
                {featuredLabel}{featured.note ? <span style={{ fontStyle: "italic", color: "var(--ink-3)" }}> — {featured.note}</span> : ""}
              </h2>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {chips.length > 0
                  ? chips.slice(0, 4).map((c, i) => <span key={i} className={`chip${c.warn ? " warn" : ""}`}>{c.label}</span>)
                  : <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>No homework or quizzes for this class</span>
                }
              </div>
            </div>
            <div style={{ alignSelf: "center", textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 14 }}>
              {countdownNum != null ? (
                <>
                  <TimeOfDayArc size={72} color={featuredColor} />
                  <div>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 60, color: "var(--ink)", lineHeight: 0.85, fontStyle: "italic", letterSpacing: "-0.03em" }}>
                      {countdownNum}<span style={{ fontSize: 18, color: "var(--ink-3)", fontStyle: "normal", fontFamily: "var(--f-mono)" }}>m</span>
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{countdownLbl}</div>
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Tomorrow</div>
                  {nextDayHW.length > 0
                    ? nextDayHW.map((h, i) => {
                        const sb = subjectBy(h.subject);
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginBottom: 4 }}>
                            <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</span>
                            <SubjectGlyph subject={sb} size={12} color={sb.color} />
                          </div>
                        );
                      })
                    : <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14 }}>Clear ahead</div>
                  }
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* AI Game Plan */}
      {W("ai-plan") && <AIDayPlan />}

      {/* Three-column body */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.9fr", gap: 20, alignItems: "start" }}>
        {/* Col 1 — Homework + Quizzes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {W("homework") && <div className="sn-card">
            <h3 className="sn-card-title">
              <span>Due today · <span className="num">{todayHW.length}</span></span>
              <a className="mono" style={{ color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none", cursor: "pointer" }} onClick={() => window.location.hash = "#/homework"}>ALL HOMEWORK →</a>
            </h3>
            {todayHW.length === 0
              ? <div style={{ textAlign: "center", padding: "14px 0 8px" }}>
                  <div style={{ fontSize: 22, marginBottom: 5 }}>🎉</div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-2)", fontSize: 15 }}>All clear today</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>Nothing due — enjoy your time.</div>
                </div>
              : <HomeworkList items={todayHW} compact />}
          </div>}

          {W("quizzes") && <div className="sn-card">
            <h3 className="sn-card-title"><span>Quizzes ahead</span><span className="num mono" style={{ fontSize: 10.5 }}>{allQuizzes.length}</span></h3>
            {allQuizzes.length === 0
              ? <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14, padding: "8px 0" }}>No quizzes scheduled yet</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {allQuizzes.map((q) => {
                const sb = subjectBy(q.subject);
                return (
                  <div key={q.id} style={{ display: "grid", gridTemplateColumns: "6px 1fr auto", gap: 14, alignItems: "center", paddingBottom: 10, borderBottom: "1px dashed var(--hairline)" }}>
                    <div style={{ width: 6, height: 36, borderRadius: 2, background: sb.color }}></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{q.title}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)", marginTop: 2 }}>
                        {sb.short.toUpperCase()} · {q.when || q.dateStr || "TBD"}{q.length ? ` · ${q.length}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      {q.confidence != null && <ConfidenceMeter value={q.confidence} />}
                      <button className="sn-btn" onClick={() => window.location.hash = "#/quiz/mcq"} style={{ fontSize: 11.5, padding: "4px 9px" }}>Study →</button>
                    </div>
                  </div>
                );
              })}
            </div>}
          </div>}
        </div>

        {/* Col 2 — Today schedule + Recent notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {W("schedule") && <div className="sn-card">
            <h3 className="sn-card-title">
              <span>Today's schedule</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <a className="mono" onClick={() => window.dispatchEvent(new CustomEvent("openScheduleEditor"))} style={{ cursor: "pointer", color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none" }}>EDIT →</a>
                <span className="mono">{["SUN","MON","TUE","WED","THU","FRI","SAT"][new Date().getDay()]} {(new Date().getMonth()+1)}/{new Date().getDate()}</span>
              </span>
            </h3>
            <div>
              {schedule.length === 0
                ? <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 0", color: "var(--ink-3)" }}>
                    <span style={{ fontSize: 18 }}>🗓️</span>
                    <span style={{ fontSize: 13 }}>No events today · <a onClick={() => window.dispatchEvent(new CustomEvent("openScheduleEditor"))} style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "none" }}>Edit your schedule →</a></span>
                  </div>
                : schedule.map((row, i) => {
                    const sb = row.subject ? subjectBy(row.subject) : null;
                    const isNow = i === sched.nowIdx;
                    const isPast = sched.nowIdx >= 0 ? i < sched.nowIdx : (sched.nextIdx >= 0 ? i < sched.nextIdx : false);
                    return (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "40px 4px 1fr", gap: 10,
                        padding: "6px 0", borderBottom: "1px dashed var(--hairline)",
                        opacity: isPast ? 0.45 : 1,
                      }}>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)", paddingTop: 2 }}>{row.time}</div>
                        <div style={{ background: sb ? sb.color : "var(--hairline)", borderRadius: 2 }}></div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: isNow ? 600 : 400 }}>
                            {sb ? sb.short : "Lunch"}
                            {isNow && <span style={{ marginLeft: 6, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>· now</span>}
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{row.note}</div>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>}

          {W("recent-notes") && <div className="sn-card">
            <h3 className="sn-card-title"><span>Recent notes</span><a className="mono" onClick={() => window.location.hash = "#/notes"} style={{ color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none", cursor: "pointer" }}>OPEN →</a></h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {RECENT_NOTES.length === 0 && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 0", color: "var(--ink-3)" }}>
                <span style={{ fontSize: 18 }}>📝</span>
                <span style={{ fontSize: 13 }}>No recent notes · <a onClick={() => onNav && onNav("notes")} style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "none" }}>Open a subject to start writing →</a></span>
              </div>}
              {RECENT_NOTES.slice(0, 3).map((n) => {
                const sb = subjectBy(n.subject);
                return (
                  <div key={n.id} style={{ paddingBottom: 8, borderBottom: "1px dashed var(--hairline)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <SubjectDot id={n.subject} />
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{sb.short} · {n.when}</span>
                    </div>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 15, lineHeight: 1.2 }}>{n.title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.excerpt}</div>
                  </div>
                );
              })}
            </div>
          </div>}
        </div>

        {/* Col 3 — Streak + Subjects mini-grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {W("streak") && (() => {
            const streak = nbGetStreak();
            return (
            <div className="sn-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "var(--accent)" }}>{Ico.flame}</span>
                <span className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>Study streak</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <DropFolio number={streak} size={52} color="var(--ink)" />
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 16, color: "var(--ink-3)" }}>
                  day{streak !== 1 ? "s" : ""} running
                </div>
              </div>
              <div className="streak-matrix-frame" style={{ marginTop: 14 }}>
                <StreakMatrix streak={streak} weeks={12} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: 9.5, marginTop: 8, color: "var(--ink-3)" }}>
                <span>12 weeks ago</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--accent)" }} />
                  studied
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, border: "1.5px solid var(--ink)", marginLeft: 6 }} />
                  today
                </span>
              </div>
            </div>
            );
          })()}

          {W("subject-progress") && <div className="sn-card">
            <h3 className="sn-card-title"><span>This week, by subject</span></h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {SUBJECTS.slice(0, 6).map((sb) => {
                const open = allHW.filter((h) => h.subject === sb.id && !h.done).length;
                const total = allHW.filter((h) => h.subject === sb.id).length;
                const pct = total ? (1 - open / total) * 100 : 100;
                return (
                  <div key={sb.id} style={{ display: "grid", gridTemplateColumns: "18px 1fr auto", gap: 10, alignItems: "center" }}>
                    <SubjectGlyph subject={sb} size={16} color={sb.color} />
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span>{sb.name}</span>
                        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{total - open}/{total || "—"}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <HatchBar pct={pct} color={sb.color} height={7} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>}

          {W("margin-note") && <div className="sn-card paper">
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Margin note · pinned</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-2)", fontSize: 15, lineHeight: 1.4, borderLeft: "2px solid var(--accent)", paddingLeft: 12 }}>
              Enzyme lab needs <b style={{ color: "var(--ink)" }}>three</b> graphs (not two) + outliers discussion.
            </div>
            <div style={{ marginTop: 10, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>— Tue 10:24 · AP Bio</div>
          </div>}
        </div>
      </div>
    </>
  );
}

// ─────────────── Variant A: "Focus" — Today-first, calm, single column priority

function DashFocus({ view }) {
  const todayHW = HOMEWORK.filter((h) => !h.done).slice(0, 4);
  const sched = useScheduleStatus();
  const prefs = useDashPrefs();
  const [customizerOpen, setCustomizerOpen] = React.useState(false);
  const featureIdx = sched.nowIdx >= 0 ? sched.nowIdx
                  : sched.nextIdx >= 0 ? sched.nextIdx
                  : sched.schedule.length - 1;
  const featured = sched.schedule[featureIdx] || sched.schedule[0] || { subject: null, time: "—", end: "—", room: "—", note: "" };
  const featuredSubject = featured.subject ? subjectBy(featured.subject) : null;
  const inSession = sched.nowIdx >= 0;
  const eyebrowText = inSession ? `In session · ${featured.time}` : `Up next · ${featured.time}`;
  const minsToEndOfNow = inSession ? (schedToMinutes(featured.end) - (new Date().getHours() * 60 + new Date().getMinutes())) : null;
  const countdownNum = inSession ? minsToEndOfNow : sched.minsToNext;

  return (
    <>
      <PageHeader
        eyebrow={(() => { const t = getTermInfo(); const wk = t.weekNum !== "—" ? ` · Week ${t.weekNum}` : ""; return `${t.dayName} · ${t.shortDate} · ${t.termLabel}${wk}`; })()}
        title={greetingFor(new Date())}
        italic={`${getTermInfo().userName}.`}
        meta={`${todayHW.length} things due today${sched.minsToNext != null ? ` · next class in ${fmtDuration(sched.minsToNext)}` : ""}`}
        actions={
          <>
            <button className="sn-btn ghost" onClick={() => setCustomizerOpen(true)}>✎ Customize</button>
            <button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } }))}>+ Add</button>
          </>
        }
      />
      {customizerOpen && <DashboardCustomizer prefs={prefs} onClose={() => setCustomizerOpen(false)} />}

      <div className="sn-grid">
        {/* Left main column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Now / Next */}
          <div className="sn-card" style={{ display: "flex", gap: 18, alignItems: "stretch" }}>
            <div style={{ width: 6, borderRadius: 3, background: featuredSubject ? featuredSubject.color : "var(--hairline)" }}></div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>{eyebrowText}</div>
              <h2 className="serif" style={{ fontSize: 28, margin: "6px 0 4px" }}>{featuredSubject ? featuredSubject.name : "Lunch"}</h2>
              <div style={{ color: "var(--ink-2)" }}>{featured.note} · Room {featured.room} · {featured.time}–{featured.end}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <span className="chip">Bring lab notebook</span>
                <span className="chip warn">Pre-lab due</span>
              </div>
            </div>
            <div style={{ alignSelf: "center", fontFamily: "var(--f-display)", fontSize: 52, color: "var(--ink-3)", lineHeight: 1 }}>
              {countdownNum != null ? <>{countdownNum}<span style={{ fontSize: 16 }}>m</span></> : <span style={{ fontSize: 22, fontStyle: "italic" }}>—</span>}
            </div>
          </div>

          {/* Today's homework */}
          <div className="sn-card">
            <h3 className="sn-card-title">
              <span>Due today · <span className="num">3</span></span>
              <a className="mono" style={{ color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none", cursor: "pointer" }} onClick={() => window.location.hash = "#/homework"}>SEE ALL →</a>
            </h3>
            <HomeworkList items={todayHW} compact />
          </div>

          {/* Upcoming quizzes */}
          <div className="sn-card">
            <h3 className="sn-card-title">
              <span>Quizzes this week</span>
              <span className="num mono" style={{ fontSize: 10.5 }}>{QUIZZES_UPCOMING.length}</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {QUIZZES_UPCOMING.map((q) => {
                const s = subjectBy(q.subject);
                return (
                  <div key={q.id} style={{ display: "grid", gridTemplateColumns: "6px 1fr auto", gap: 14, alignItems: "center", paddingBottom: 12, borderBottom: "1px dashed var(--hairline)" }}>
                    <div style={{ width: 6, height: 36, borderRadius: 2, background: s.color }}></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{q.title}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)", marginTop: 2 }}>
                        {s.short.toUpperCase()} · {q.when} · {q.length}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <ConfidenceMeter value={q.confidence} />
                      <button className="sn-btn" onClick={() => window.location.hash = "#/quiz/mcq"} style={{ fontSize: 11.5, padding: "4px 9px" }}>Study →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Schedule today */}
          <div className="sn-card">
            <h3 className="sn-card-title">
              <span>Today's schedule</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <a className="mono" onClick={() => window.dispatchEvent(new CustomEvent("openScheduleEditor"))} style={{ cursor: "pointer", color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none" }}>EDIT →</a>
                <span className="mono">{["SUN","MON","TUE","WED","THU","FRI","SAT"][new Date().getDay()]} {(new Date().getMonth()+1)}/{new Date().getDate()}</span>
              </span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {sched.schedule.map((row, i) => {
                const s = row.subject ? subjectBy(row.subject) : null;
                const isNow = i === sched.nowIdx;
                const isPast = sched.nowIdx >= 0 ? i < sched.nowIdx : (sched.nextIdx >= 0 ? i < sched.nextIdx : false);
                return (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "44px 4px 1fr", gap: 10,
                    padding: "8px 0", borderBottom: "1px dashed var(--hairline)",
                    opacity: isPast ? 0.45 : 1,
                  }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)", paddingTop: 2 }}>{row.time}</div>
                    <div style={{ background: s ? s.color : "var(--hairline)", borderRadius: 2 }}></div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: isNow ? 600 : 400 }}>
                        {s ? s.short : "Lunch"}
                        {isNow && <span style={{ marginLeft: 6, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>· now</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{row.note}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak / progress */}
          {(() => {
            const streak = nbGetStreak();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 27);
            const startStr = startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
            return (
            <div className="sn-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ color: "var(--accent)" }}>{Ico.flame}</span>
                <span className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>Study streak</span>
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 56, lineHeight: 1, color: "var(--ink)" }}>{streak}<span style={{ fontSize: 18, color: "var(--ink-3)" }}> day{streak !== 1 ? "s" : ""}</span></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 14 }}>
                {Array.from({ length: 28 }).map((_, i) => {
                  const studied = i < streak;
                  const isToday = i === streak;
                  return (
                    <div key={i} style={{
                      width: isToday ? 16 : 13, height: isToday ? 16 : 13,
                      borderRadius: "50%", flexShrink: 0,
                      background: studied ? "var(--accent)" : isToday ? "var(--ochre)" : "var(--hairline)",
                    }} />
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 12, fontFamily: "var(--f-mono)", fontSize: 9.5, marginTop: 8, color: "var(--ink-3)", alignItems: "center" }}>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", marginRight: 4, verticalAlign: "middle" }} />Studied</span>
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--ochre)", marginRight: 4, verticalAlign: "middle" }} />Today</span>
              </div>
            </div>
            );
          })()}

          {/* Recent notes */}
          <div className="sn-card">
            <h3 className="sn-card-title"><span>Recent notes</span><a className="mono" onClick={() => window.location.hash = "#/notes"} style={{ color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none", cursor: "pointer" }}>OPEN →</a></h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {RECENT_NOTES.slice(0, 3).map((n) => {
                const s = subjectBy(n.subject);
                return (
                  <div key={n.id} style={{ paddingBottom: 10, borderBottom: "1px dashed var(--hairline)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <SubjectDot id={n.subject} />
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.short} · {n.when}</span>
                    </div>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 16, lineHeight: 1.2 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.4 }}>{n.excerpt}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────── Variant B: "Timeline" — calendar week as anchor

function DashTimeline({ view }) {
  const prefs = useDashPrefs();
  const [customizerOpen, setCustomizerOpen] = React.useState(false);
  return (
    <>
      <PageHeader
        eyebrow={(() => { const t = getTermInfo(); const wkPart = t.weekNum !== "—" ? `, week ${t.weekNum} of ${t.weekTotal}` : ""; return `Week of ${t.weekOfStr} · ${t.termLabel}${wkPart}`; })()}
        title="This week, you have"
        italic="11 things to finish."
        meta="2 quizzes · 6 assignments · 3 readings"
        actions={
          <>
            <button className="sn-btn ghost" onClick={() => setCustomizerOpen(true)}>✎ Customize</button>
            <button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } }))}>+ Add</button>
          </>
        }
      />
      {customizerOpen && <DashboardCustomizer prefs={prefs} onClose={() => setCustomizerOpen(false)} />}

      {/* Week strip */}
      <div className="sched-strip" style={{ marginBottom: 24 }}>
        {WEEK.map((d) => (
          <div key={d.day} className={`sched-day ${d.today ? "today" : ""}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="dn">{d.day}{d.today && " · today"}</span>
              <span className="dd">{d.date}</span>
            </div>
            {d.items.map((it, i) => {
              const s = subjectBy(it.subject);
              return (
                <div key={i} className="pill" style={{ "--c": s.color, "--c-bg": s.color + "22" }}>
                  {s.short} · {it.note}
                </div>
              );
            })}
            {d.items.length === 0 && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: "auto" }}>— free —</div>}
          </div>
        ))}
      </div>

      <div className="sn-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="sn-card">
            <h3 className="sn-card-title"><span>Open homework · <span className="num">5</span></span><span className="mono" style={{ fontSize: 10.5 }}>SORTED BY DUE</span></h3>
            <HomeworkList items={HOMEWORK.filter((h) => !h.done)} />
          </div>

          <div className="sn-card paper">
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Margin note · pinned</div>
            <div className="note-line">
              Don't forget — Mr. Okafor said the enzyme lab report needs <b style={{ color: "var(--ink)" }}>three graphs</b>, not two, and a discussion section on outliers.
            </div>
            <div style={{ marginTop: 14, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>— Tue · 10:24 AM · AP Bio class</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="sn-card">
            <h3 className="sn-card-title"><span>Quizzes ahead</span></h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {QUIZZES_UPCOMING.map((q) => {
                const s = subjectBy(q.subject);
                return (
                  <div key={q.id} style={{ borderLeft: `3px solid ${s.color}`, paddingLeft: 12 }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.short} · {q.when}</div>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 19, marginTop: 2 }}>{q.title}</div>
                    <div style={{ marginTop: 6 }}><ConfidenceMeter value={q.confidence} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sn-card">
            <h3 className="sn-card-title"><span>By subject this week</span></h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SUBJECTS.slice(0, 6).map((s) => {
                const open = HOMEWORK.filter((h) => h.subject === s.id && !h.done).length;
                const total = HOMEWORK.filter((h) => h.subject === s.id).length;
                const pct = total ? (1 - open / total) * 100 : 100;
                return (
                  <div key={s.id} style={{ display: "grid", gridTemplateColumns: "10px 1fr auto", gap: 10, alignItems: "center" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}></span>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span>{s.short}</span>
                        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{total - open}/{total}</span>
                      </div>
                      <div style={{ height: 3, background: "var(--hairline)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: s.color }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { Dashboard, DashCombined, DashFocus, DashTimeline, dueStringToDate });
