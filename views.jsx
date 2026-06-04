// Additional views for the real app — quizzes index, take-quiz, schedule, grades, flashcards

// ─────────────── Shared utility

function Field({ label, children }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

// ─────────────── Quizzes index — list of upcoming, past, practice decks

function QuizzesContent({ onTakeQuiz }) {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const on = () => forceUpdate();
    window.addEventListener("nbStoreChange", on);
    return () => window.removeEventListener("nbStoreChange", on);
  }, []);

  const userQuizzes = nbGetQuizzes();

  // Only show past results when using sample data (built-in quizzes present)
  const hasSampleData = QUIZZES_UPCOMING.length > 0;
  const past = hasSampleData ? [
    { id: "p1", subject: "alg2",      title: "Trig Identities",            score: 8,  total: 10, when: "Last week" },
    { id: "p2", subject: "ap-bio",    title: "Photosynthesis",              score: 17, total: 20, when: "2 weeks ago" },
    { id: "p3", subject: "us-hist",   title: "Constitutional Convention",   score: 14, total: 20, when: "Apr 28" },
    { id: "p4", subject: "spanish-3", title: "Vocab U5",                    score: 13, total: 15, when: "Apr 22" },
  ] : [];

  const totalUpcoming = QUIZZES_UPCOMING.length + userQuizzes.length;
  const eyebrow = totalUpcoming > 0
    ? `${totalUpcoming} upcoming · ${past.length} taken this term`
    : "Practice anytime · all subjects";

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title="Quizzes &"
        italic="self-checks."
        meta="Practice anytime · cards adapt to what you keep missing"
        actions={<><button className="sn-btn ghost" onClick={() => onTakeQuiz("mcq")}>Mistakes deck</button><button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "quiz" } }))}>+ Add quiz day</button></>}
      />

      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>Upcoming</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14, marginBottom: 32 }}>
        {QUIZZES_UPCOMING.map((q) => {
          const s = subjectBy(q.subject);
          return (
            <div key={q.id} className="sn-card" style={{ borderLeft: `3px solid ${s.color}`, cursor: "pointer" }}
              onClick={() => window.location.hash = "#/quiz-detail/" + q.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.short} · {q.when}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>{q.length}</div>
              </div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.2 }}>{q.title}</div>
              <div style={{ marginTop: 12, marginBottom: 14 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Confidence</div>
                <ConfidenceMeter value={q.confidence} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="sn-btn primary" onClick={(e) => { e.stopPropagation(); window.location.hash = "#/quiz-detail/" + q.id; }} style={{ flex: 1, justifyContent: "center" }}>Open quiz tab →</button>
                <button className="sn-btn" onClick={(e) => { e.stopPropagation(); onTakeQuiz("flashcard"); }} style={{ padding: "7px 10px" }}>{Ico.cards}</button>
              </div>
            </div>
          );
        })}
        {userQuizzes.map((q) => {
          const s = subjectBy(q.subject) || SUBJECTS[0] || { color: "var(--accent)", short: "??" };
          return (
            <div key={q.id} className="sn-card" style={{ borderLeft: `3px solid ${s.color}`, position: "relative", cursor: "pointer" }}
              onClick={() => window.location.hash = "#/quiz-detail/" + q.id}>
              <button
                title="Delete quiz day"
                onClick={(e) => { e.stopPropagation(); nbDeleteQuiz(q.id); window.dispatchEvent(new CustomEvent("toast", { detail: "Quiz day removed" })); }}
                style={{ position: "absolute", top: 10, right: 10, border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0, opacity: 0.5 }}
              >×</button>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, paddingRight: 20 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.short} · {q.when || q.dateStr || "TBD"}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 4 }}>your quiz · open tab →</div>
              </div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.2 }}>{q.title}</div>
              <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
                <button className="sn-btn primary" onClick={(e) => { e.stopPropagation(); window.location.hash = "#/quiz-detail/" + q.id; }} style={{ flex: 1, justifyContent: "center" }}>Open quiz tab →</button>
                <button className="sn-btn" onClick={(e) => { e.stopPropagation(); onTakeQuiz("flashcard"); }} style={{ padding: "7px 10px" }}>{Ico.cards}</button>
              </div>
            </div>
          );
        })}
        {totalUpcoming === 0 && (
          <div style={{ padding: "28px 20px", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 16 }}>
            No upcoming quizzes — tap <b style={{ fontStyle: "normal" }}>+ Add quiz day</b> to schedule one, or practice below.
          </div>
        )}
      </div>

      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>Practice anything</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        <PracticeCard
          icon={Ico.cards}
          title="Flashcards"
          subtitle="Spaced repetition · study by recall"
          accent="var(--accent)"
          onClick={() => onTakeQuiz("flashcard")}
        />
        <PracticeCard
          icon={Ico.quiz}
          title="Multiple choice"
          subtitle="Mixed from all subjects"
          accent="var(--info)"
          onClick={() => onTakeQuiz("mcq")}
        />
        <PracticeCard
          icon={"abc"}
          title="Type-the-answer"
          subtitle="Vocab & definitions"
          accent="var(--plum)"
          onClick={() => onTakeQuiz("type")}
        />
      </div>

      {past.length > 0 && (
        <>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>Past results</div>
          <div className="sn-card" style={{ padding: 0 }}>
            {past.map((p, i) => {
              const s = subjectBy(p.subject);
              const pct = p.score / p.total;
              return (
                <div key={p.id} onClick={() => onTakeQuiz("mcq")} style={{
                  display: "grid", gridTemplateColumns: "8px 1fr auto auto auto",
                  alignItems: "center", gap: 14, padding: "14px 20px",
                  borderBottom: i < past.length - 1 ? "1px dashed var(--hairline)" : "none",
                  cursor: "pointer",
                }}>
                  <div style={{ width: 8, height: 28, borderRadius: 2, background: s.color }}></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{p.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{s.short.toUpperCase()} · {p.when}</div>
                  </div>
                  <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, color: pct >= 0.8 ? "var(--done)" : pct >= 0.65 ? "var(--ochre)" : "var(--accent)" }}>
                    {p.score}<span style={{ color: "var(--ink-3)" }}>/{p.total}</span>
                  </div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)" }}>{Math.round(pct * 100)}%</div>
                  <span style={{ color: "var(--ink-3)" }}>{Ico.arrow}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

function PracticeCard({ icon, title, subtitle, accent, onClick }) {
  return (
    <div onClick={onClick} className="sn-card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 8, background: accent, color: "white", display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18 }}>
        {typeof icon === "string" ? icon : icon}
      </div>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 12 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{subtitle}</div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}>
        START <span>{Ico.arrow}</span>
      </div>
    </div>
  );
}

// ─────────────── Take-a-quiz wrapper with "back" affordance

function TakeQuiz({ type, deckId, onExit }) {
  const Component = type === "flashcard" ? FlashcardQuiz
                  : type === "type" ? TypeAnswerQuiz
                  : type === "result" ? QuizResult
                  : MCQQuiz;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
        <button className="sn-btn ghost" onClick={onExit} style={{ fontFamily: "var(--f-mono)", fontSize: 11, padding: "5px 10px" }}>← Exit</button>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <Component deckId={deckId} />
      </div>
    </div>
  );
}

// ─────────────── AI Study Plan panel

function AIStudyPlan() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState("");
  const [error, setError] = React.useState("");

  const generate = async () => {
    setLoading(true); setError(""); setPlan("");
    const openHW = [...HOMEWORK, ...nbGetHomework()].filter((h) => !h.done);
    const now = new Date();
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = dayNames[now.getDay()];
    const dateStr = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

    const hwList = openHW.map((h) => {
      const s = subjectBy(h.subject);
      return `- ${s.short}: "${h.title}" — due ${h.due}, est. ${h.est}${h.urgent ? " [URGENT]" : ""}`;
    }).join("\n") || "No open homework.";

    const quizList = QUIZZES_UPCOMING.map((q) => {
      const s = subjectBy(q.subject);
      return `- ${s.short}: "${q.title}" on ${q.when} (confidence ${Math.round(q.confidence * 100)}%)`;
    }).join("\n") || "No upcoming quizzes.";

    const prompt = `You are a study coach for a high school student. Today is ${dateStr}.

Open homework:
${hwList}

Upcoming quizzes:
${quizList}

Create a realistic day-by-day study plan for the rest of this week. For each day (starting with today, ${today}), suggest what to work on and when (afternoon/evening). Be specific about which assignments to tackle each day and in what order. Keep it concise — one line per task. Format as:

**Today (${today})**
- Task · time estimate

**Tomorrow**
- Task · time estimate

...and so on. Max 5 days. End with one motivating sentence.`;

    try {
      const text = await aiComplete(prompt);
      setPlan(text || "(no response)");
    } catch(e) {
      if (e.message === "no-key") {
        setError("__no-key__");
      } else if (e.message === "invalid-key") {
        setError("Invalid API key — update it via the ✦ Connect AI button.");
      } else {
        setError("Couldn't generate plan right now. Try again in a moment.");
      }
    } finally { setLoading(false); }
  };

  React.useEffect(() => { if (open && !plan && !loading) generate(); }, [open]);

  return (
    <div className="sn-card" style={{ marginBottom: 20, borderLeft: "3px solid var(--accent)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="sn-card-title" style={{ marginBottom: 2 }}>
            <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", marginRight: 6 }}>✦</span>
            <span>AI Study Plan</span>
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>
            Adapts to your homework, quizzes, and due dates
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {open && <button className="sn-btn ghost" onClick={generate} style={{ fontSize: 11 }}>↻ Regenerate</button>}
          <button className="sn-btn" style={{ background: open ? "var(--bg-2)" : "var(--accent)", color: open ? "var(--ink)" : "white", borderColor: "var(--accent)" }}
            onClick={() => setOpen(v => !v)}>
            {open ? "Hide plan" : "Generate my plan →"}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--hairline)", paddingTop: 14 }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ink-3)", fontFamily: "var(--f-display)", fontStyle: "italic" }}>
              <div className="ai-dots"><span></span><span></span><span></span></div>
              <style>{`.ai-dots{display:flex;gap:5px}.ai-dots span{width:5px;height:5px;border-radius:50%;background:var(--accent);animation:dot-pulse .9s ease infinite}.ai-dots span:nth-child(2){animation-delay:.15s}.ai-dots span:nth-child(3){animation-delay:.3s}@keyframes dot-pulse{0%,80%,100%{opacity:.25;transform:scale(.85)}40%{opacity:1;transform:scale(1.1)}}`}</style>
              Building your plan…
            </div>
          )}
          {error && error !== "__no-key__" && <div style={{ color: "var(--accent)", fontSize: 13 }}>{error}</div>}
          {error === "__no-key__" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>Connect your API key to generate a real study plan.</div>
              <button className="sn-btn primary" style={{ flexShrink: 0, fontSize: 12 }}
                onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>
            </div>
          )}
          {plan && (
            <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)" }}>
              {plan.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**"))
                  return <div key={i} style={{ fontFamily: "var(--f-display)", fontSize: 16, fontWeight: 600, marginTop: i > 0 ? 14 : 0, marginBottom: 4 }}>{line.replace(/\*\*/g, "")}</div>;
                if (line.startsWith("- "))
                  return <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 4 }}><span style={{ color: "var(--accent)" }}>•</span>{line.slice(2)}</div>;
                if (line.trim() === "") return <div key={i} style={{ height: 4 }} />;
                return <div key={i} style={{ fontStyle: "italic", color: "var(--ink-2)", marginTop: 10 }}>{line}</div>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────── Pomodoro Focus Timer

function PomodoroTimer() {
  const WORK_MINS = 25;
  const BREAK_MINS = 5;
  const [phase, setPhase] = React.useState("work");
  const [secondsLeft, setSecondsLeft] = React.useState(WORK_MINS * 60);
  const [running, setRunning] = React.useState(false);
  const [sessions, setSessions] = React.useState(0);
  const intervalRef = React.useRef(null);

  const totalSecs = phase === "work" ? WORK_MINS * 60 : BREAK_MINS * 60;
  const pct = secondsLeft / totalSecs;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (phase === "work") {
              setSessions((n) => n + 1);
              setPhase("break");
              setSecondsLeft(BREAK_MINS * 60);
              window.dispatchEvent(new CustomEvent("toast", { detail: "Pomodoro done — take a 5-minute break! 🎉" }));
            } else {
              setPhase("work");
              setSecondsLeft(WORK_MINS * 60);
              window.dispatchEvent(new CustomEvent("toast", { detail: "Break over — back to it! 💪" }));
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, phase]);

  const reset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSecondsLeft(phase === "work" ? WORK_MINS * 60 : BREAK_MINS * 60);
  };

  const skipPhase = () => {
    const next = phase === "work" ? "break" : "work";
    setPhase(next);
    setSecondsLeft(next === "work" ? WORK_MINS * 60 : BREAK_MINS * 60);
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const r = 36; const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const accentColor = phase === "work" ? "var(--accent)" : "#27ae60";

  return (
    <div className="sn-card" style={{ display: "flex", gap: 24, alignItems: "center", padding: "18px 24px", marginTop: 20 }}>
      {/* Ring progress */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={44} cy={44} r={r} fill="none" stroke="var(--hairline)" strokeWidth={5} />
          <circle cx={44} cy={44} r={r} fill="none"
            stroke={accentColor}
            strokeWidth={5}
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: running ? "stroke-dashoffset 0.95s linear" : "none" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          fontFamily: "var(--f-mono)", fontSize: 16, fontWeight: 600, letterSpacing: "0.03em",
          color: running ? accentColor : "var(--ink)",
        }}>
          {display}
        </div>
      </div>

      {/* Label + controls */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 18, marginBottom: 2 }}>
          {phase === "work" ? "Focus session" : "Short break"}
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          {phase === "work" ? "25-minute Pomodoro" : "5-minute break"} · {sessions} session{sessions !== 1 ? "s" : ""} completed
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="sn-btn" onClick={() => setRunning((v) => !v)}
            style={{ background: running ? "var(--bg-2)" : accentColor, color: running ? "var(--ink)" : "white", borderColor: accentColor, minWidth: 86, fontSize: 12.5 }}>
            {running ? "⏸ Pause" : (secondsLeft === totalSecs ? "▶ Start" : "▶ Resume")}
          </button>
          <button className="sn-btn ghost" onClick={reset} style={{ fontSize: 12 }}>↺ Reset</button>
          <button className="sn-btn ghost" onClick={skipPhase} style={{ fontSize: 12 }}>
            {phase === "work" ? "→ Break" : "→ Work"}
          </button>
        </div>
      </div>

      {/* Session dots */}
      {sessions > 0 && (
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Sessions</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 72, justifyContent: "center" }}>
            {Array.from({ length: Math.min(sessions, 12) }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: accentColor, opacity: 0.85 }} />
            ))}
          </div>
          {sessions > 12 && <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 4 }}>+{sessions-12} more</div>}
        </div>
      )}
    </div>
  );
}

// ─────────────── Schedule view (full week)

function ScheduleContent() {
  const store = useNbStore();
  const [weekOffset, setWeekOffset] = React.useState(0);

  const now = new Date();
  const isCurrentWeek = weekOffset === 0;

  // Compute Mon of the viewed week
  const viewMonday = new Date(now);
  viewMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
  viewMonday.setHours(0, 0, 0, 0);

  // Column dates Mon–Fri
  const colDates = [0, 1, 2, 3, 4].map((off) => {
    const d = new Date(viewMonday);
    d.setDate(viewMonday.getDate() + off);
    return d;
  });

  const todayDayIndex = isCurrentWeek ? ((now.getDay() + 6) % 7) : -1;
  const weekRange = colDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })
    + " – " + colDates[4].toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const termInfo = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("nb-profile-v1") || "null");
      const month = viewMonday.getMonth();
      const term = month >= 7 ? "Fall" : "Spring";
      const wk = p && p.yearStart ? Math.min(Math.ceil((viewMonday - new Date(p.yearStart.year, p.yearStart.month, 1)) / 604800000), 36) : "—";
      const weekLabel = weekOffset === 0 ? "this week" : weekOffset < 0 ? `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? "s" : ""} ago` : `${weekOffset} week${weekOffset > 1 ? "s" : ""} ahead`;
      return `${term} · week ${wk} · ${weekLabel}`;
    } catch { return weekOffset === 0 ? "This week" : weekOffset < 0 ? "Previous week" : "Next week"; }
  })();

  // Pull live homework + quizzes
  const allHW = React.useMemo(() => [...HOMEWORK, ...store.homework], [store.homework]);
  const allQuizzes = React.useMemo(() => [...QUIZZES_UPCOMING, ...nbGetQuizzes()], [store.homework]);

  // Map each day to its homework + quiz items
  const dayItems = colDates.map((colDate) => {
    const hw = allHW.filter((h) => {
      if (h.done) return false;
      const d = dueStringToDate(h.due, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    const quizzes = allQuizzes.filter((q) => {
      const d = dueStringToDate(q.when || q.dateStr, now);
      return d && d.toDateString() === colDate.toDateString();
    });
    return { hw, quizzes };
  });

  const totalItems = dayItems.reduce((s, d) => s + d.hw.length + d.quizzes.length, 0);
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <>
      <PageHeader eyebrow={termInfo} title="Your" italic="schedule." meta={weekRange} actions={<>
        <button className="sn-btn ghost" onClick={() => setWeekOffset((w) => w - 1)}>← Week</button>
        <button className="sn-btn ghost" onClick={() => setWeekOffset((w) => w + 1)}>Week →</button>
        <button className="sn-btn" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0} style={{ opacity: weekOffset === 0 ? 0.4 : 1 }}>Today</button>
      </>} />

      <AIStudyPlan />

      {/* ── Week at a glance stats ── */}
      {(() => {
        const parseEst = (est) => {
          if (!est) return 0;
          const h = est.match(/(\d+)h/); const m = est.match(/(\d+)m/);
          return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
        };
        const weekHW = dayItems.flatMap((d) => d.hw);
        const weekQuizzes = dayItems.flatMap((d) => d.quizzes);
        const urgentCount = weekHW.filter((h) => h.urgent).length;
        const totalMins = weekHW.reduce((s, h) => s + parseEst(h.est), 0);
        const timeStr = totalMins === 0 ? "—" : totalMins >= 60
          ? `${Math.floor(totalMins / 60)}h${totalMins % 60 > 0 ? ` ${totalMins % 60}m` : ""}`
          : `${totalMins}m`;
        const busiestIdx = dayItems.reduce((best, d, i) =>
          (d.hw.length + d.quizzes.length) > (dayItems[best].hw.length + dayItems[best].quizzes.length) ? i : best, 0);
        const dayNames2 = ["Mon","Tue","Wed","Thu","Fri"];
        const busiestCount = dayItems[busiestIdx].hw.length + dayItems[busiestIdx].quizzes.length;
        const stats = [
          { label: "Tasks due", value: weekHW.length || "—", accent: false },
          { label: "Quizzes", value: weekQuizzes.length || "—", accent: false },
          { label: "Est. workload", value: timeStr, accent: false },
          { label: "Urgent", value: urgentCount || "—", accent: urgentCount > 0 },
          { label: "Busiest day", value: busiestCount > 0 ? dayNames2[busiestIdx] : "—", accent: false },
        ];
        return (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {stats.map((st) => (
              <div key={st.label} className="sn-card" style={{ flex: 1, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 22, fontStyle: "italic", color: st.accent ? "var(--accent)" : "var(--ink)" }}>
                  {st.value}
                </div>
                <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Week at a glance — dynamic homework + quiz deadlines */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 32 }}>
        {colDates.map((colDate, i) => {
          const isToday = i === todayDayIndex;
          const isPast = !isToday && colDate < now && isCurrentWeek;
          const { hw, quizzes } = dayItems[i];
          const hasItems = hw.length > 0 || quizzes.length > 0;
          return (
            <div key={i} className="sn-card" style={{
              padding: "14px 16px",
              borderTop: `3px solid ${isToday ? "var(--accent)" : "var(--hairline)"}`,
              opacity: isPast ? 0.55 : 1,
              minHeight: 120,
            }}>
              {/* Day header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>
                  {dayNames[i]} <span style={{ fontSize: 14, color: "var(--ink-3)" }}>{colDate.getDate()}</span>
                </div>
                {isToday && <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>today</span>}
                {!isToday && isCurrentWeek && colDate > now && hw.length + quizzes.length > 0 && (
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {Math.round((colDate - now) / 86400000)}d away
                  </span>
                )}
              </div>

              {/* Items */}
              {!hasItems && (
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 12.5 }}>
                  Nothing due
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {hw.map((h) => {
                  const s = subjectBy(h.subject);
                  return (
                    <div key={h.id} onClick={() => window.location.hash = "#/homework/" + h.id}
                      style={{ display: "flex", gap: 7, alignItems: "flex-start", cursor: "pointer" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0, marginTop: 4 }}></span>
                      <div>
                        <div style={{ fontSize: 12.5, lineHeight: 1.3, fontWeight: 500 }}>{h.title}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 1 }}>{s.short}{h.urgent ? " · urgent" : ""}</div>
                      </div>
                    </div>
                  );
                })}
                {quizzes.map((q) => {
                  const s = subjectBy(q.subject);
                  return (
                    <div key={q.id} onClick={() => window.location.hash = "#/quiz-detail/" + q.id}
                      style={{ display: "flex", gap: 7, alignItems: "flex-start", cursor: "pointer" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0, marginTop: 4, outline: "1px dashed " + s.color, outlineOffset: 2 }}></span>
                      <div>
                        <div style={{ fontSize: 12.5, lineHeight: 1.3, fontWeight: 500 }}>{q.title}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", marginTop: 1 }}>{s.short} · quiz</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {totalItems === 0 && (
        <div style={{ textAlign: "center", padding: "16px 0 32px", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 16 }}>
          Nothing due this week — add homework or quizzes and they'll appear here.
        </div>
      )}

      {/* ── Pomodoro Focus Timer ── */}
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>
          Focus timer
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginBottom: 4 }}>
          25-minute Pomodoro to stay on track
        </div>
      </div>
      <PomodoroTimer />
    </>
  );
}

// ─────────────── Grades view

function GradesContent() {
  useNbStore();
  const [expanded, setExpanded] = React.useState(null);
  const [addingFor, setAddingFor] = React.useState(null);
  const [form, setForm] = React.useState({ title: "", score: "", total: "100", type: "quiz" });

  const grades = nbGetPref("grades", {});
  const entriesFor = (sid) => grades[sid] || [];

  const addEntry = (sid) => {
    const score = parseFloat(form.score);
    const total = parseFloat(form.total);
    if (!form.title.trim() || isNaN(score) || isNaN(total) || total <= 0) return;
    const entry = {
      id: Date.now().toString(36), title: form.title.trim(), score, total, type: form.type,
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    };
    nbSetPref("grades", { ...grades, [sid]: [...entriesFor(sid), entry] });
    setForm({ title: "", score: "", total: "100", type: "quiz" });
    setAddingFor(null);
  };

  const deleteEntry = (sid, id) => {
    nbSetPref("grades", { ...grades, [sid]: entriesFor(sid).filter((e) => e.id !== id) });
  };

  const avgFor = (sid) => {
    const es = entriesFor(sid);
    if (!es.length) return null;
    const pts = es.reduce((s, e) => s + e.score, 0);
    const max = es.reduce((s, e) => s + e.total, 0);
    return max > 0 ? pts / max : null;
  };

  const toLetterGrade = (p) => {
    if (p >= 0.97) return "A+"; if (p >= 0.93) return "A"; if (p >= 0.90) return "A−";
    if (p >= 0.87) return "B+"; if (p >= 0.83) return "B"; if (p >= 0.80) return "B−";
    if (p >= 0.77) return "C+"; if (p >= 0.73) return "C"; if (p >= 0.70) return "C−";
    if (p >= 0.67) return "D+"; if (p >= 0.63) return "D"; if (p >= 0.60) return "D−";
    return "F";
  };
  const toGPA = (p) => {
    if (p >= 0.93) return 4.0; if (p >= 0.90) return 3.7;
    if (p >= 0.87) return 3.3; if (p >= 0.83) return 3.0; if (p >= 0.80) return 2.7;
    if (p >= 0.77) return 2.3; if (p >= 0.73) return 2.0; if (p >= 0.70) return 1.7;
    if (p >= 0.67) return 1.3; if (p >= 0.63) return 1.0; if (p >= 0.60) return 0.7;
    return 0.0;
  };
  // Returns { color, bg } based on percentage
  const gradeInfo = (p) => {
    if (p >= 0.90) return { color: "var(--done)",   bg: "var(--done-soft)" };
    if (p >= 0.80) return { color: "var(--info)",   bg: "#dce8f0" };
    if (p >= 0.70) return { color: "var(--ochre)",  bg: "#f5ecd6" };
    return               { color: "var(--accent)",  bg: "var(--accent-soft)" };
  };

  const subjectsWithAvg = SUBJECTS.map((s) => ({ ...s, avg: avgFor(s.id) }));
  const graded = subjectsWithAvg.filter((s) => s.avg !== null);
  const gpa = graded.length ? graded.reduce((s, sb) => s + toGPA(sb.avg), 0) / graded.length : null;
  const best  = graded.length     ? graded.reduce((a, b) => (a.avg >= b.avg ? a : b)) : null;
  const worst = graded.length > 1 ? graded.reduce((a, b) => (a.avg <= b.avg ? a : b)) : null;

  const termEyebrow = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("nb-profile-v1") || "null");
      const now = new Date();
      const term = now.getMonth() >= 7 ? "Fall term" : "Spring term";
      const wk = p && p.yearStart ? Math.min(Math.ceil((now - new Date(p.yearStart.year, p.yearStart.month, 1)) / 604800000), 36) : null;
      return wk && wk > 0 ? `${term} · Week ${wk} of 36` : term;
    } catch { return "This term"; }
  })();

  // GPA arc gauge math (270° sweep)
  const arcR = 54;
  const arcC = 2 * Math.PI * arcR;          // full circumference ≈ 339.3
  const arcSweep = arcC * 0.75;             // 270° portion ≈ 254.5
  const gpaFrac = gpa !== null ? gpa / 4.0 : 0;
  const gpaColor = gpa === null ? "var(--hairline)" : gpa >= 3.5 ? "var(--done)" : gpa >= 3.0 ? "var(--info)" : gpa >= 2.0 ? "var(--ochre)" : "var(--accent)";

  const inp = {
    padding: "6px 10px", border: "1px solid var(--hairline)", borderRadius: 4,
    fontFamily: "inherit", fontSize: 13, background: "var(--surface)", color: "var(--ink)", outline: "none",
  };

  return (
    <>
      <PageHeader
        eyebrow={termEyebrow}
        title="Grades, "
        italic="this term."
        meta={gpa !== null
          ? `GPA ${gpa.toFixed(2)} unweighted · ${graded.length} subject${graded.length !== 1 ? "s" : ""} tracked`
          : SUBJECTS.length > 0 ? "Log your first score below to start tracking." : "Add subjects first, then log scores here."}
        actions={
          <button className="sn-btn ghost" onClick={() => {
            if (!graded.length) { window.dispatchEvent(new CustomEvent("toast", { detail: "No grades to export yet" })); return; }
            const rows = [["Subject","Assignment","Type","Score","Total","Pct"]];
            SUBJECTS.forEach((s) => entriesFor(s.id).forEach((e) =>
              rows.push([s.name, e.title, e.type, e.score, e.total, Math.round(e.score / e.total * 100) + "%"])
            ));
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
            a.download = "grades.csv"; a.click();
          }}>Export CSV</button>
        }
      />

      {/* ── Hero summary ── */}
      {graded.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, marginBottom: 28, alignItems: "start" }}>

          {/* GPA arc gauge card */}
          <div className="sn-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 26px 18px", gap: 4, minWidth: 168 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>GPA so far</div>
            <div style={{ position: "relative", width: 130, height: 130 }}>
              <svg width="130" height="130" style={{ transform: "rotate(135deg)" }}>
                <circle cx="65" cy="65" r={arcR} fill="none" stroke="var(--hairline)" strokeWidth="8"
                  strokeDasharray={`${arcSweep} ${arcC - arcSweep}`} strokeLinecap="round" />
                <circle cx="65" cy="65" r={arcR} fill="none" stroke={gpaColor} strokeWidth="8"
                  strokeDasharray={`${arcSweep * gpaFrac} ${arcC - arcSweep * gpaFrac}`}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 38, lineHeight: 1, letterSpacing: "-0.02em" }}>{gpa.toFixed(2)}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>/ 4.00</div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
              {graded.length} subject{graded.length !== 1 ? "s" : ""} · unweighted
            </div>
          </div>

          {/* Right column: best/worst + subject bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="sn-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--done-soft)", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 19 }}>🏆</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 2 }}>Best class</div>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 16, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{best.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--done)", marginTop: 3 }}>{Math.round(best.avg * 100)}% · {toLetterGrade(best.avg)}</div>
                </div>
              </div>
              {worst ? (
                <div className="sn-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: worst.avg < 0.70 ? "var(--accent-soft)" : "var(--bg-2)", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 19 }}>📚</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 2 }}>Needs attention</div>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 16, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{worst.name}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: worst.avg < 0.70 ? "var(--accent)" : "var(--ink-3)", marginTop: 3 }}>{Math.round(worst.avg * 100)}% · {toLetterGrade(worst.avg)}</div>
                  </div>
                </div>
              ) : <div />}
            </div>

            {/* All-subject bar chart */}
            <div className="sn-card" style={{ padding: "16px 20px" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 12 }}>All subjects</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {SUBJECTS.map((s) => {
                  const avg = avgFor(s.id);
                  const pct = avg !== null ? avg * 100 : null;
                  const gi = avg !== null ? gradeInfo(avg) : null;
                  return (
                    <div key={s.id} style={{ display: "grid", gridTemplateColumns: "130px 1fr 42px 30px", alignItems: "center", gap: 12 }}>
                      <div style={{ fontFamily: "var(--f-display)", fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink)" }}>{s.name}</div>
                      <div style={{ height: 6, background: "var(--hairline)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, width: pct !== null ? `${pct}%` : "0%", background: gi ? gi.color : "var(--hairline)", transition: "width 0.55s cubic-bezier(.4,0,.2,1)" }} />
                      </div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: gi ? gi.color : "var(--ink-3)", textAlign: "right" }}>
                        {pct !== null ? Math.round(pct) + "%" : "—"}
                      </div>
                      <div style={{ fontFamily: "var(--f-display)", fontSize: 15, fontStyle: "italic", color: gi ? gi.color : "var(--ink-3)", textAlign: "right" }}>
                        {avg !== null ? toLetterGrade(avg) : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : SUBJECTS.length > 0 && (
        /* ── Empty state: no grades logged yet ── */
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, marginBottom: 28, alignItems: "stretch" }}>
          {/* Ghost GPA gauge */}
          <div className="sn-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 26px 18px", gap: 4, minWidth: 168, background: "var(--bg-2)", border: "1px dashed var(--rule)" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>GPA so far</div>
            <div style={{ position: "relative", width: 130, height: 130 }}>
              <svg width="130" height="130" style={{ transform: "rotate(135deg)" }}>
                <circle cx="65" cy="65" r={arcR} fill="none" stroke="var(--hairline)" strokeWidth="8"
                  strokeDasharray={`${arcSweep} ${arcC - arcSweep}`} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 44, lineHeight: 1, color: "var(--hairline)", letterSpacing: "-0.02em" }}>—</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 2, opacity: 0.5 }}>/ 4.00</div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2, opacity: 0.5 }}>unweighted</div>
          </div>

          {/* Onboarding prompt */}
          <div className="sn-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 32px", background: "var(--bg-2)", border: "1px dashed var(--rule)", gap: 14 }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 24, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
              Start tracking your grades.
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.7 }}>
              Click the <span style={{ fontFamily: "var(--f-mono)", fontSize: 13, fontWeight: 600, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 3, padding: "0 6px", display: "inline-block", lineHeight: "1.6" }}>+</span> next to any subject below to log a score.<br />
              Your running GPA, best class, and a subject breakdown will appear here automatically.
            </div>
            {/* Step hints */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
              {["1. Pick a subject →", "2. Click +", "3. Enter score + type", "4. Watch your GPA build"].map((step, i) => (
                <span key={i} style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: i === 0 ? "var(--accent)" : "var(--ink-3)", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 3, padding: "3px 9px" }}>
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Per-subject expandable cards ── */}
      {SUBJECTS.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SUBJECTS.map((s) => {
            const entries = entriesFor(s.id);
            const avg = avgFor(s.id);
            const isOpen = expanded === s.id;
            const isAdding = addingFor === s.id;
            const gi = avg !== null ? gradeInfo(avg) : null;
            const pct = avg !== null ? avg * 100 : null;
            // Type breakdown summary e.g. "3 quiz · 1 test"
            const byType = {};
            entries.forEach((e) => { byType[e.type] = (byType[e.type] || 0) + 1; });
            const typeChips = Object.entries(byType).map(([t, n]) => `${n} ${t}`).join(" · ");

            return (
              <div key={s.id} className="sn-card" style={{ padding: 0, overflow: "hidden" }}>
                {/* ── Card header row ── */}
                <div
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  style={{ display: "grid", gridTemplateColumns: "4px 1fr auto auto auto 48px", alignItems: "stretch", cursor: "pointer", background: isOpen ? "var(--bg-2)" : "transparent", transition: "background 0.15s" }}
                >
                  {/* Subject color bar */}
                  <div style={{ background: s.color, minHeight: 70, width: 4, flexShrink: 0 }} />

                  {/* Name + meta + mini bar */}
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 17, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{s.name}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>
                      {s.short}{s.teacher ? ` · ${s.teacher}` : ""}
                      {typeChips && <span style={{ marginLeft: 10, opacity: 0.75 }}>{typeChips}</span>}
                    </div>
                    {pct !== null && (
                      <div style={{ marginTop: 9, height: 3, width: 180, background: "var(--hairline)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: gi.color, borderRadius: 2, transition: "width 0.5s ease" }} />
                      </div>
                    )}
                  </div>

                  {/* Score count */}
                  <div style={{ display: "flex", alignItems: "center", fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-3)", paddingRight: 18 }}>
                    {entries.length > 0
                      ? `${entries.length} score${entries.length !== 1 ? "s" : ""}`
                      : <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, fontStyle: "italic", color: "var(--ink-3)", opacity: 0.55 }}>no scores yet</span>}
                  </div>

                  {/* Percentage */}
                  <div style={{ display: "flex", alignItems: "center", fontFamily: "var(--f-mono)", fontSize: 13, color: gi ? gi.color : "var(--ink-3)", paddingRight: 14, minWidth: 48, justifyContent: "flex-end", opacity: pct === null ? 0.3 : 1 }}>
                    {pct !== null ? Math.round(pct) + "%" : "—"}
                  </div>

                  {/* Letter grade */}
                  <div style={{ display: "flex", alignItems: "center", fontFamily: "var(--f-display)", fontSize: 36, lineHeight: 1, color: gi ? gi.color : "var(--ink-3)", paddingRight: 14, minWidth: 52, justifyContent: "flex-end", opacity: avg === null ? 0.2 : 1 }}>
                    {avg !== null ? toLetterGrade(avg) : "—"}
                  </div>

                  {/* Add + chevron */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, paddingRight: 8, borderLeft: "1px solid var(--hairline)" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddingFor(s.id); setExpanded(s.id); setForm({ title: "", score: "", total: "100", type: "quiz" }); }}
                      className="sn-btn ghost" style={{ padding: "4px 8px", fontSize: 17, lineHeight: 1, color: "var(--ink-3)" }} title="Add score"
                    >+</button>
                    <span style={{ color: "var(--ink-3)", fontSize: 10, display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.18s ease" }}>▶</span>
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--hairline)", background: "var(--bg-2)", padding: "14px 20px 18px 20px" }}>
                    {entries.length === 0 && !isAdding && (
                      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 13.5, padding: "4px 0" }}>
                        No scores yet — click <b style={{ fontStyle: "normal" }}>+</b> to add your first score.
                      </div>
                    )}

                    {entries.length > 0 && (
                      <div style={{ marginBottom: isAdding ? 18 : 0 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px 64px 22px", gap: 10, marginBottom: 6, fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", paddingBottom: 5, borderBottom: "1px solid var(--hairline)" }}>
                          <div>Assignment</div><div>Score</div><div>Pct</div><div>Type</div><div></div>
                        </div>
                        {entries.map((e) => {
                          const ep = e.score / e.total;
                          const egi = gradeInfo(ep);
                          return (
                            <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px 64px 22px", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px dashed var(--hairline)" }}>
                              <div style={{ fontSize: 13.5 }}>
                                {e.title}
                                <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginLeft: 8 }}>{e.date}</span>
                              </div>
                              <div style={{ fontFamily: "var(--f-mono)", fontSize: 12 }}>{e.score}/{e.total}</div>
                              <div>
                                <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, background: egi.bg, color: egi.color, padding: "2px 8px", borderRadius: 3 }}>
                                  {Math.round(ep * 100)}%
                                </span>
                              </div>
                              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase" }}>{e.type}</div>
                              <button onClick={() => deleteEntry(s.id, e.id)} style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", fontSize: 15, padding: 0, opacity: 0.45, lineHeight: 1 }} title="Remove">×</button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add form */}
                    {isAdding && (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", paddingTop: entries.length ? 14 : 0, borderTop: entries.length ? "1px solid var(--rule)" : "none", marginTop: entries.length ? 6 : 0 }}>
                        <div>
                          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 3 }}>Assignment</div>
                          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 4 Quiz" style={{ ...inp, width: 196 }} autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") addEntry(s.id); if (e.key === "Escape") setAddingFor(null); }} />
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 3 }}>Score</div>
                          <input value={form.score} onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))} placeholder="92" type="number" min="0" style={{ ...inp, width: 68 }} />
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 3 }}>Out of</div>
                          <input value={form.total} onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))} placeholder="100" type="number" min="1" style={{ ...inp, width: 68 }} />
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 3 }}>Type</div>
                          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={inp}>
                            <option value="quiz">Quiz</option>
                            <option value="test">Test</option>
                            <option value="hw">Homework</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <button className="sn-btn primary" onClick={() => addEntry(s.id)} style={{ fontSize: 12.5 }}>Save</button>
                        <button className="sn-btn ghost" onClick={() => setAddingFor(null)} style={{ fontSize: 12.5 }}>Cancel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sn-card" style={{ padding: "52px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, color: "var(--ink-2)", marginBottom: 8 }}>No subjects set up yet.</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>Add your subjects first, then track grades here.</div>
        </div>
      )}
    </>
  );
}

// ─────────────── Create deck modal (manual or AI)

function CreateDeckModal({ onClose }) {
  const [mode, setMode] = React.useState("manual"); // "manual" | "ai"
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState(SUBJECTS[0]?.id || "");
  const [saved, setSaved] = React.useState(false);

  // Manual mode state
  const [rows, setRows] = React.useState([{ front: "", back: "" }, { front: "", back: "" }, { front: "", back: "" }]);
  const addRow = () => setRows((r) => [...r, { front: "", back: "" }]);
  const updateRow = (i, field, val) => setRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  // AI mode state
  const [topic, setTopic] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState("");
  const [aiCards, setAiCards] = React.useState([]);

  const generateAI = async () => {
    if (!topic.trim()) return;
    setGenerating(true); setGenError(""); setAiCards([]);
    const prompt = `Generate 8–12 flashcard Q&A pairs for a high school student studying: "${topic.trim()}".

Format EXACTLY like this:
Q: [term or question]
A: [definition or answer]

Return only the pairs, nothing else.`;
    try {
      const text = await aiComplete(prompt);
      const cards = [];
      let front = null;
      for (const line of text.split("\n")) {
        const l = line.trim();
        if (/^Q:/i.test(l)) { front = l.slice(2).trim(); }
        else if (/^A:/i.test(l) && front) { cards.push({ front, back: l.slice(2).trim() }); front = null; }
      }
      if (!cards.length) throw new Error("No cards parsed");
      setAiCards(cards);
      if (!title.trim()) setTitle(topic.trim());
    } catch (e) {
      if (e.message === "no-key") setGenError("__no-key__");
      else setGenError("Couldn't generate cards. Try again or switch to manual.");
    } finally { setGenerating(false); }
  };

  const save = () => {
    const cards = mode === "manual"
      ? rows.filter(r => r.front.trim() || r.back.trim()).map((r, i) => ({ id: "c" + i, front: r.front.trim(), back: r.back.trim() }))
      : aiCards.map((c, i) => ({ id: "c" + i, ...c }));
    if (!cards.length || !title.trim()) return;
    nbAddCustomDeck({ title: title.trim(), subject, cards, source: mode });
    setSaved(true);
    setTimeout(() => {
      onClose();
      window.dispatchEvent(new CustomEvent("toast", { detail: `"${title.trim()}" — ${cards.length} cards created` }));
    }, 600);
  };

  const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "inherit", fontSize: 13.5, background: "var(--surface)", color: "var(--ink)", outline: "none", boxSizing: "border-box" };
  const canSave = title.trim() && (mode === "manual" ? rows.some(r => r.front.trim()) : aiCards.length > 0);

  return (
    <Modal onClose={onClose} width={620}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>New flashcard deck</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>Create a <em style={{ color: "var(--accent)" }}>deck</em></div>
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {[["manual", "✏ Manual"], ["ai", "✦ AI Generate"]].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)} style={{
              padding: "6px 14px", borderRadius: 4, border: "1px solid " + (mode === k ? "var(--ink)" : "var(--hairline)"),
              background: mode === k ? "var(--ink)" : "var(--surface)", color: mode === k ? "var(--bg)" : "var(--ink-2)",
              cursor: "pointer", fontFamily: "inherit", fontSize: 13,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {saved ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 44, color: "var(--done)", marginBottom: 8 }}>✓</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-2)", fontStyle: "italic" }}>Deck created!</div>
        </div>
      ) : (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, maxHeight: "60vh", overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 2 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Deck title</div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Unit 3 — Cell Division" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Subject</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {SUBJECTS.map((s) => (
                  <button key={s.id} onClick={() => setSubject(s.id)} style={{
                    padding: "4px 8px", borderRadius: 3, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit",
                    border: "1px solid " + (subject === s.id ? "var(--ink)" : "var(--hairline)"),
                    background: subject === s.id ? "var(--ink)" : "var(--surface)",
                    color: subject === s.id ? "var(--bg)" : "var(--ink)",
                  }}><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 2, background: s.color, marginRight: 4, verticalAlign: "middle" }}></span>{s.short}</button>
                ))}
              </div>
            </div>
          </div>

          {mode === "manual" && (
            <>
              <div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Cards ({rows.filter(r => r.front.trim()).length} filled)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: "4px 8px", marginBottom: 8 }}>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 2px" }}>Term / Front</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 2px" }}>Definition / Back</div>
                  <div></div>
                  {rows.map((row, i) => (
                    <React.Fragment key={i}>
                      <input value={row.front} onChange={(e) => updateRow(i, "front", e.target.value)} placeholder={`Term ${i + 1}`} style={inputStyle} />
                      <input value={row.back} onChange={(e) => updateRow(i, "back", e.target.value)} placeholder={`Definition ${i + 1}`} style={inputStyle} />
                      <button onClick={() => removeRow(i)} style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", fontSize: 16, padding: 0 }} title="Remove">×</button>
                    </React.Fragment>
                  ))}
                </div>
                <button className="sn-btn ghost" onClick={addRow} style={{ fontSize: 12.5 }}>+ Add card</button>
              </div>
            </>
          )}

          {mode === "ai" && (
            <>
              <div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Topic or description</div>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
                  placeholder="e.g. AP Biology — cellular respiration, ATP synthesis, and the electron transport chain"
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="sn-btn primary" onClick={generateAI} disabled={generating || !topic.trim()} style={{ opacity: generating || !topic.trim() ? 0.6 : 1 }}>
                  {generating ? "Generating…" : "✦ Generate cards"}
                </button>
                {aiCards.length > 0 && <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--done)" }}>✓ {aiCards.length} cards ready</span>}
                {genError && genError !== "__no-key__" && <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--accent)" }}>{genError}</span>}
                {genError === "__no-key__" && <button className="sn-btn primary" style={{ fontSize: 11 }} onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>}
              </div>
              {aiCards.length > 0 && (
                <div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Preview</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {aiCards.map((c, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "7px 0", borderBottom: "1px dashed var(--hairline)" }}>
                        <div style={{ fontSize: 13 }}>{c.front}</div>
                        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{c.back}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
            <button className="sn-btn primary" onClick={save} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.4 }}>
              Save deck {canSave ? `(${mode === "manual" ? rows.filter(r => r.front.trim()).length : aiCards.length} cards)` : ""}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─────────────── Quizlet import modal

function QuizletImportModal({ onClose }) {
  const [raw, setRaw] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState(SUBJECTS[0]?.id || "");
  const [sep, setSep] = React.useState("tab"); // tab | comma | dash
  const [preview, setPreview] = React.useState([]);
  const [saved, setSaved] = React.useState(false);

  const parse = (text, separator) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const sepChar = separator === "tab" ? "\t" : separator === "comma" ? "," : " — ";
    return lines.map((line) => {
      const idx = line.indexOf(sepChar);
      if (idx === -1) return null;
      return { front: line.slice(0, idx).trim(), back: line.slice(idx + sepChar.length).trim() };
    }).filter(Boolean);
  };

  React.useEffect(() => {
    setPreview(parse(raw, sep).slice(0, 5));
  }, [raw, sep]);

  const cards = parse(raw, sep);

  const save = () => {
    if (!cards.length || !title.trim()) return;
    nbAddCustomDeck({
      title: title.trim(),
      subject,
      cards: cards.map((c, i) => ({ id: "q" + i, q: c.front, a: c.back })),
      source: "quizlet",
    });
    setSaved(true);
    setTimeout(() => { onClose(); window.dispatchEvent(new CustomEvent("toast", { detail: `Imported "${title.trim()}" — ${cards.length} cards` })); }, 700);
  };

  return (
    <Modal onClose={onClose} width={600}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Import flashcards</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>
          From <em style={{ color: "var(--accent)" }}>Quizlet</em> or any set
        </div>
      </div>
      {saved ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 44, color: "var(--done)", marginBottom: 8 }}>✓</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-2)", fontStyle: "italic" }}>Imported!</div>
        </div>
      ) : (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: "12px 14px", background: "var(--bg-2)", borderRadius: 8, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            <b>How to export from Quizlet:</b> Open your set → ··· menu → <em>Export</em> → copy the text → paste below.
            <br/>Or type/paste any list with terms and definitions.
          </div>
          <Field label="Deck title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AP Bio Unit 4 — Cell Division"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "inherit", fontSize: 14, background: "var(--surface)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }} />
          </Field>
          <Field label="Subject">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUBJECTS.map((s) => (
                <button key={s.id} onClick={() => setSubject(s.id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  border: "1px solid " + (subject === s.id ? "var(--ink)" : "var(--hairline)"),
                  background: subject === s.id ? "var(--ink)" : "var(--surface)",
                  color: subject === s.id ? "var(--bg)" : "var(--ink)",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color }}></span>{s.short}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Separator">
            <div style={{ display: "flex", gap: 6 }}>
              {[["tab","Tab (Quizlet default)"],["comma","Comma"],["dash","Dash (—)"]].map(([k, l]) => (
                <button key={k} onClick={() => setSep(k)} style={{
                  padding: "4px 10px", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  border: "1px solid " + (sep === k ? "var(--ink)" : "var(--hairline)"),
                  background: sep === k ? "var(--ink)" : "var(--surface)", color: sep === k ? "var(--bg)" : "var(--ink)",
                }}>{l}</button>
              ))}
            </div>
          </Field>
          <Field label={`Paste your terms (${cards.length} cards detected)`}>
            <textarea value={raw} onChange={(e) => setRaw(e.target.value)}
              placeholder={"Term\tDefinition\nAnother term\tAnother definition\n…"}
              rows={7}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "var(--f-mono)", fontSize: 12, background: "var(--surface)", color: "var(--ink)", outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
          </Field>
          {preview.length > 0 && (
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Preview (first {preview.length})</div>
              {preview.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "6px 0", borderBottom: i < preview.length - 1 ? "1px dashed var(--hairline)" : "none" }}>
                  <div style={{ fontSize: 12.5 }}>{c.front}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{c.back}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
            <button className="sn-btn primary" onClick={save} disabled={!cards.length || !title.trim()} style={{ opacity: cards.length && title.trim() ? 1 : 0.4 }}>
              Import {cards.length ? cards.length + " cards" : ""}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─────────────── Flashcards (uses FlashcardQuiz which already has a deck)

function FlashcardsContent({ onTakeQuiz }) {
  const [importOpen, setImportOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Listen for store changes (custom decks)
  React.useEffect(() => {
    const on = () => forceUpdate();
    window.addEventListener("nbStoreChange", on);
    return () => window.removeEventListener("nbStoreChange", on);
  }, []);

  // Only show built-in decks when using sample data (not when user has own subjects)
  const showBuiltinDecks = HOMEWORK.length > 0 || QUIZZES_UPCOMING.length > 0;

  const builtinDecks = showBuiltinDecks ? [
    { id: "bio-respiration", due: 6, last: "yesterday" },
    { id: "esp-u6",          due: 12, last: "today" },
    { id: "lit-beloved",     due: 0,  last: "3d ago" },
    { id: "alg2-trig",       due: 5,  last: "2d ago" },
    { id: "us-fed",          due: 3,  last: "Mon" },
    { id: "chem-periodic",   due: 8,  last: "today" },
  ].map((d) => ({ ...d, ...DECKS[d.id] })) : [];

  const customDecks = nbGetCustomDecks();
  const allDecks = [...builtinDecks, ...customDecks];
  const totalCards = allDecks.reduce((s, d) => s + (d.cards ? d.cards.length : 0), 0);
  const totalDue = builtinDecks.reduce((s, d) => s + (d.due || 0), 0);

  const eyebrowText = allDecks.length === 0
    ? "No decks yet · import or create one below"
    : `${allDecks.length} deck${allDecks.length !== 1 ? "s" : ""} · ${totalCards} cards total${totalDue > 0 ? ` · ${totalDue} due today` : ""}`;

  return (
    <>
      {importOpen && <QuizletImportModal onClose={() => { setImportOpen(false); forceUpdate(); }} />}
      {createOpen && <CreateDeckModal onClose={() => { setCreateOpen(false); forceUpdate(); }} />}
      <PageHeader eyebrow={eyebrowText} title="Flashcard" italic="decks." meta="Create manually, generate with AI, or import from Quizlet." actions={<>
        <button className="sn-btn ghost" onClick={() => setImportOpen(true)}>Import Quizlet</button>
        <button className="sn-btn primary" onClick={() => setCreateOpen(true)}>+ New deck</button>
      </>} />

      {allDecks.length === 0 && (
        <div className="sn-card" style={{ padding: "48px 32px", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, color: "var(--ink-2)", marginBottom: 10 }}>No flashcard decks yet.</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--ink-3)", marginBottom: 20, lineHeight: 1.6 }}>
            Create cards manually, generate them with AI, or import from Quizlet.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="sn-btn primary" onClick={() => setCreateOpen(true)}>+ New deck</button>
            <button className="sn-btn ghost" onClick={() => setImportOpen(true)}>Import Quizlet</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {builtinDecks.map((d) => {
          const s = subjectBy(d.subject);
          return (
            <div key={d.id} className="sn-card" onClick={() => onTakeQuiz("flashcard", d.id)} style={{ cursor: "pointer", position: "relative", overflow: "hidden", paddingTop: 22 }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: s.color }}></div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.short}</div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 21, lineHeight: 1.15, marginTop: 4 }}>{d.title}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 14, fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)" }}>
                <span><b style={{ color: "var(--ink)" }}>{d.cards.length}</b> cards</span>
                <span style={{ color: d.due > 0 ? "var(--accent)" : "var(--ink-3)" }}><b>{d.due}</b> due</span>
                <span style={{ marginLeft: "auto", color: "var(--ink-3)" }}>{d.last}</span>
              </div>
            </div>
          );
        })}
        {customDecks.map((d) => {
          const s = subjectBy(d.subject) || SUBJECTS[0] || { color: "var(--accent)", short: "??" };
          const sourceLabel = d.source === "ai" ? "AI generated" : d.source === "manual" ? "Manual" : "Quizlet import";
          return (
            <div key={d.id} className="sn-card" style={{ cursor: "pointer", position: "relative", overflow: "hidden", paddingTop: 22 }}
              onClick={() => onTakeQuiz("flashcard", d.id)}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: s.color }}></div>
              <div style={{ position: "absolute", top: 8, right: 8 }}>
                <button onClick={(e) => { e.stopPropagation(); nbDeleteCustomDeck(d.id); forceUpdate(); }} style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", fontSize: 14 }} title="Remove deck">×</button>
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.short}</div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 21, lineHeight: 1.15, marginTop: 4 }}>{d.title}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 14, fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-2)" }}>
                <span><b style={{ color: "var(--ink)" }}>{d.cards ? d.cards.length : 0}</b> cards</span>
                <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 11, color: "var(--accent)" }}>{sourceLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─────────────── Notes index (all subjects' notes)

function NotesIndexContent({ onOpenSubject, onOpenNote }) {
  const [tagView, setTagView] = React.useState(false);
  const [selectedTag, setSelectedTag] = React.useState(null);
  const store = useNbStore();

  // Collect all notes from all subjects (built-in + user)
  const allNotes = React.useMemo(() => {
    const out = [];
    SUBJECTS.forEach((s) => {
      const builtin = notesForSubject(s.id);
      const user = store.notesFor(s.id);
      [...user, ...builtin].forEach((n) => out.push({ ...n, subjectId: s.id }));
    });
    return out;
  }, [store]);

  // Build tag → notes map
  const tagMap = React.useMemo(() => {
    const map = {};
    allNotes.forEach((n) => {
      (n.tags || []).forEach((t) => {
        const tag = t.startsWith("#") ? t : "#" + t;
        if (!map[tag]) map[tag] = [];
        map[tag].push(n);
      });
    });
    return map;
  }, [allNotes]);

  const allTags = Object.keys(tagMap).sort();
  const filteredNotes = selectedTag ? (tagMap[selectedTag] || []) : allNotes;
  const totalNotes = allNotes.length;

  return (
    <>
      <PageHeader
        eyebrow={`${totalNotes} notes · ${SUBJECTS.length} subjects`}
        title="All your" italic="notes."
        meta="Filter by subject or tag · search any text"
        actions={<>
          <button className="sn-btn ghost" onClick={() => { setTagView((v) => !v); setSelectedTag(null); }}
            style={{ background: tagView ? "var(--ink)" : undefined, color: tagView ? "var(--bg)" : undefined }}>
            By tag
          </button>
          <button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "note" } }))}>+ New note</button>
        </>}
      />

      {tagView ? (
        <>
          {/* Tag cloud */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <button onClick={() => setSelectedTag(null)} style={{
              padding: "5px 12px", borderRadius: 20, border: "1px solid var(--hairline)", fontSize: 12.5,
              background: !selectedTag ? "var(--ink)" : "var(--surface)", color: !selectedTag ? "var(--bg)" : "var(--ink-2)",
              cursor: "pointer", fontFamily: "inherit",
            }}>All ({allNotes.length})</button>
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} style={{
                padding: "5px 12px", borderRadius: 20, border: "1px solid var(--hairline)", fontSize: 12.5,
                background: selectedTag === tag ? "var(--accent)" : "var(--surface)",
                color: selectedTag === tag ? "white" : "var(--ink-2)",
                cursor: "pointer", fontFamily: "var(--f-mono)", letterSpacing: "0.04em",
              }}>{tag} <span style={{ opacity: 0.65, fontSize: 11 }}>{tagMap[tag].length}</span></button>
            ))}
            {allTags.length === 0 && (
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14 }}>
                No tags yet — add tags when creating notes or edit notes to add #tags.
              </div>
            )}
          </div>

          {/* Notes filtered by tag */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredNotes.map((n) => {
              const sb = subjectBy(n.subjectId);
              return (
                <div key={n.subjectId + ":" + n.id} onClick={() => onOpenNote(n.subjectId, n.id)}
                  className="sn-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", cursor: "pointer" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: sb.color, flexShrink: 0 }}></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                      {sb.short} · {n.when}
                      {(n.tags || []).map((t) => <span key={t} style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 10, background: "var(--bg-2)", color: "var(--accent)", fontSize: 10 }}>{t.startsWith("#") ? t : "#" + t}</span>)}
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>OPEN →</span>
                </div>
              );
            })}
            {filteredNotes.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 18 }}>
                No notes with tag {selectedTag}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {SUBJECTS.filter((s) => s.notes > 0 || store.notesFor(s.id).length > 0).map((s) => {
            const subjectNotes = [...store.notesFor(s.id), ...notesForSubject(s.id)].slice(0, 3);
            return (
              <div key={s.id} className="sn-card" style={{ borderLeft: `3px solid ${s.color}` }}>
                <div onClick={() => onOpenSubject(s.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", cursor: "pointer" }}>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>{s.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{subjectNotes.length} NOTES →</div>
                </div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 0 }}>
                  {subjectNotes.length === 0 && (
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14, color: "var(--ink-3)", padding: "6px 0" }}>
                      No notes yet for {s.short}
                    </div>
                  )}
                  {subjectNotes.map((n) => (
                    <div key={n.id}
                      onClick={(e) => { e.stopPropagation(); onOpenNote(s.id, n.id); }}
                      style={{ fontSize: 12.5, color: "var(--ink)", display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--hairline)", cursor: "pointer" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
                      <span style={{ color: "var(--ink-3)", fontFamily: "var(--f-mono)", fontSize: 10, whiteSpace: "nowrap", marginLeft: 8 }}>{n.when}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

const SAMPLE_NOTES = {
  "spanish-3": [{ id: "es-pret", title: "Pretérito vs Imperfecto", when: "Mon" }, { id: "es-sub", title: "Subjuntivo intro", when: "last week" }],
  "chem": [{ id: "ch-mol", title: "Molarity & dilutions", when: "today" }, { id: "ch-trends", title: "Periodic trends", when: "Mon" }],
  "studio-art": [{ id: "art-char", title: "Charcoal still life — process", when: "today" }, { id: "art-comp", title: "Composition rules", when: "Apr 30" }],
  "phys-ed": [{ id: "pe-log", title: "May workout log", when: "yesterday" }],
};
function sampleNotesFor(subjectId) {
  return SAMPLE_NOTES[subjectId] || [{ id: "p", title: "Recent notes will appear here", when: "—" }];
}

// ─────────────── Quiz Detail Page — full notes/study tab per quiz

function QuizDetailPage({ quizId }) {
  useNbStore(); // subscribe to store so re-renders on quiz deletions
  const allQuizzes = [...QUIZZES_UPCOMING, ...nbGetQuizzes()];
  const quiz = allQuizzes.find((q) => q.id === quizId);

  const saved = nbGetNoteOverride("quiz-" + quizId) || {};
  const ceRef = React.useRef(null);
  const ceInitialized = React.useRef(false);

  // AI flashcard generation
  const existingDeck = React.useMemo(() => nbGetCustomDecks().find((d) => d.quizId === quizId), [quizId]);
  const [genDeckId, setGenDeckId] = React.useState(existingDeck ? existingDeck.id : null);
  const [generating, setGenerating] = React.useState(false);
  const [genError, setGenError] = React.useState("");

  React.useEffect(() => {
    if (ceRef.current && !ceInitialized.current) {
      ceRef.current.innerHTML = saved.content || "";
      ceInitialized.current = true;
    }
  }, []);

  const generateFlashcards = async () => {
    const content = ceRef.current ? ceRef.current.textContent.trim() : (saved.content || "").replace(/<[^>]*>/g, " ").trim();
    if (!content) {
      window.dispatchEvent(new CustomEvent("toast", { detail: "Add notes to your quiz tab first, then generate flashcards." }));
      return;
    }
    setGenerating(true);
    setGenError("");
    const prompt = `Generate 6–10 flashcard Q&A pairs from the following study notes.

Format EXACTLY like this (one pair per two lines, nothing else):
Q: [question or term]
A: [answer or definition]

Study notes:
${content.slice(0, 2000)}`;

    try {
      const text = await aiComplete(prompt);
      // Parse Q / A pairs
      const cards = [];
      let front = null;
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (/^Q:/i.test(trimmed)) { front = trimmed.slice(2).trim(); }
        else if (/^A:/i.test(trimmed) && front) {
          cards.push({ id: "c" + cards.length, front, back: trimmed.slice(2).trim() });
          front = null;
        }
      }
      if (!cards.length) throw new Error("No cards parsed");
      // Remove any old AI deck for this quiz then save fresh one
      const old = nbGetCustomDecks().find((d) => d.quizId === quizId);
      if (old) nbDeleteCustomDeck(old.id);
      const deck = nbAddCustomDeck({ title: quiz.title, subject: quiz.subject, cards, source: "ai", quizId });
      setGenDeckId(deck.id);
      window.dispatchEvent(new CustomEvent("toast", { detail: `Generated ${cards.length} flashcards from your quiz tab ✓` }));
    } catch (e) {
      if (e.message === "no-key") {
        setGenError("__no-key__");
      } else {
        setGenError("Couldn't generate flashcards. Try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  if (!quiz) {
    return (
      <div style={{ padding: "60px 56px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontStyle: "italic", color: "var(--ink-3)" }}>Quiz not found.</div>
        <button className="sn-btn primary" onClick={() => window.location.hash = "#/quizzes"} style={{ marginTop: 18 }}>← Back to Quizzes</button>
      </div>
    );
  }

  const s = subjectBy(quiz.subject) || SUBJECTS[0] || { color: "var(--accent)", short: "??" };
  const isUserQuiz = nbGetQuizzes().some((q) => q.id === quizId);

  const deleteQuiz = () => {
    if (!window.confirm(`Delete "${quiz.title}"?`)) return;
    nbDeleteQuiz(quizId);
    window.dispatchEvent(new CustomEvent("toast", { detail: "Quiz removed" }));
    window.location.hash = "#/quizzes";
  };

  return (
    <div style={{ padding: "32px 56px", maxWidth: 780, overflow: "auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => window.location.hash = "#/quizzes"}
          style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 11, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
          ← Quizzes
        </button>
        <span style={{ color: "var(--hairline)" }}>/</span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{s.short}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 8 }}>
        <div style={{ width: 5, borderRadius: 3, background: s.color, alignSelf: "stretch", minHeight: 40, flexShrink: 0 }}></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}></span>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {s.short} · {quiz.when || quiz.dateStr || "Upcoming"}{quiz.length ? ` · ${quiz.length}` : ""}
            </span>
            {isUserQuiz && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid var(--accent)", borderRadius: 3, padding: "1px 6px" }}>Your Quiz</span>
            )}
          </div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 36, lineHeight: 1.15, letterSpacing: "-0.01em", color: "var(--ink)" }}>
            {quiz.title}
          </div>
        </div>
      </div>

      {/* Confidence meter */}
      {quiz.confidence !== undefined && (
        <div style={{ marginTop: 12, marginBottom: 4, maxWidth: 280 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Confidence</div>
          <ConfidenceMeter value={quiz.confidence} />
        </div>
      )}

      {/* Action row */}
      <div style={{ display: "flex", gap: 8, marginBottom: genError ? 8 : 28, marginTop: 18, flexWrap: "wrap" }}>
        {/* Primary: study the quiz-specific deck, or generate one */}
        {genDeckId ? (
          <button className="sn-btn primary" onClick={() => window.location.hash = "#/quiz/flashcard/" + genDeckId} style={{ fontSize: 12.5 }}>
            {Ico.cards} Practice flashcards →
          </button>
        ) : (
          <button className="sn-btn primary" onClick={generateFlashcards} disabled={generating} style={{ fontSize: 12.5, opacity: generating ? 0.7 : 1 }}>
            {generating ? "Generating…" : "✦ Generate &amp; practice"}
          </button>
        )}
        {genDeckId && (
          <button className="sn-btn ghost" onClick={generateFlashcards} disabled={generating} style={{ fontSize: 12.5 }}>
            {generating ? "Generating…" : "↻ Regenerate cards"}
          </button>
        )}
        <button className="sn-btn ghost" onClick={() => window.location.hash = "#/subject/" + quiz.subject + "/notes"} style={{ fontSize: 12.5 }}>
          Open {s.short} notes →
        </button>
        {isUserQuiz && (
          <button className="sn-btn ghost" onClick={deleteQuiz} style={{ fontSize: 12.5, color: "var(--accent)", marginLeft: "auto" }}>Delete</button>
        )}
      </div>
      {genError && genError !== "__no-key__" && <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--accent)", marginBottom: 20 }}>{genError}</div>}
      {genError === "__no-key__" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "10px 14px", background: "var(--bg-2)", borderRadius: 6, border: "1px solid var(--hairline)" }}>
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Connect your API key to generate flashcards from your notes.</span>
          <button className="sn-btn primary" style={{ fontSize: 12, flexShrink: 0 }} onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>
        </div>
      )}

      {/* Quiz tab content area */}
      <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 24 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
          Quiz tab — study notes &amp; content
        </div>
        <style>{`[contenteditable][data-placeholder]:empty::before { content: attr(data-placeholder); color: var(--ink-3); pointer-events: none; display: block; font-style: italic; }`}</style>
        <div
          ref={ceRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Add key concepts, formulas, vocab, practice problems — anything to study for this quiz…"
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            nbUpdateNoteContent("quiz-" + quizId, { content: html });
          }}
          style={{
            outline: "none", minHeight: 280, fontSize: 14.5, lineHeight: 1.7,
            color: "var(--ink)", fontFamily: "inherit", whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        />
      </div>
    </div>
  );
}

Object.assign(window, { QuizzesContent, TakeQuiz, ScheduleContent, GradesContent, FlashcardsContent, NotesIndexContent, PracticeCard, QuizDetailPage });
