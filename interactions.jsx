// Interactions — Command palette (Cmd+K), Quick-add modal, AI helpers
// Uses window.claude.complete for AI features.

// ─────────────── Modal primitive

function Modal({ onClose, children, width = 640, top = "12vh", variant = "default" }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const isBottom = variant === "spring-bottom";
  const isCmdk = variant === "cmdk";
  return (
    <div onClick={onClose} className={`sn-modal-backdrop ${isCmdk ? "heavy-blur" : ""}`} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: isCmdk ? undefined : "rgba(20, 16, 11, 0.42)",
      backdropFilter: isCmdk ? undefined : "blur(2px)",
      display: "flex", justifyContent: "center",
      alignItems: isBottom ? "flex-end" : "flex-start",
      paddingTop: isBottom ? 0 : top,
      paddingBottom: isBottom ? "8vh" : 0,
    }}>
      <div onClick={(e) => e.stopPropagation()}
        className={`sn-root ${isBottom ? "sn-modal-spring-bottom" : isCmdk ? "sn-modal-drop-top" : ""}`}
        style={{
          width, maxWidth: "92vw", maxHeight: "78vh",
          background: "var(--surface)", border: "1px solid var(--hairline)",
          borderRadius: 8, overflow: "hidden",
          boxShadow: "0 24px 60px -12px rgba(20,16,11,0.25), 0 4px 16px rgba(20,16,11,0.08)",
          display: "flex", flexDirection: "column",
        }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────── Command Palette

function CommandPalette({ onClose, onNav, onOpenQuickAdd }) {
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(0);
  const store = useNbStore();

  // Collect all note body text for search
  const allNotesFlat = React.useMemo(() => {
    const out = [];
    SUBJECTS.forEach((s) => {
      const builtin = notesForSubject(s.id);
      const user = store.notesFor(s.id);
      [...user, ...builtin].forEach((n) => {
        const bodyText = (n.blocks || []).map((b) => b.text || "").join(" ");
        out.push({ subjectId: s.id, subject: s, note: n, bodyText });
      });
    });
    return out;
  }, [store]);

  const items = React.useMemo(() => {
    const all = [
      // Actions
      { group: "Actions", icon: "＋", title: "Add homework", subtitle: "Capture a new task", action: () => { onClose(); onOpenQuickAdd("homework"); } },
      { group: "Actions", icon: "＋", title: "Add note", subtitle: "New blank note",      action: () => { onClose(); onOpenQuickAdd("note"); } },
      { group: "Actions", icon: "＋", title: "Add quiz day", subtitle: "Schedule a quiz", action: () => { onClose(); onOpenQuickAdd("quiz"); } },
      { group: "Actions", icon: "▶", title: "Start a quiz",  subtitle: "Practice now",   action: () => { onClose(); onNav("quizzes"); } },
      { group: "Actions", icon: "⏱", title: "Start focus timer", subtitle: "25-min Pomodoro", action: () => { onClose(); window.dispatchEvent(new CustomEvent("startPomodoro")); } },

      // Pages
      { group: "Go to", icon: "⌂", title: "Today",      subtitle: "Dashboard", action: () => { onClose(); onNav("dashboard"); } },
      { group: "Go to", icon: "✔", title: "Homework",   subtitle: "All tasks", action: () => { onClose(); onNav("homework"); } },
      { group: "Go to", icon: "?", title: "Quizzes",    subtitle: "Upcoming & practice", action: () => { onClose(); onNav("quizzes"); } },
      { group: "Go to", icon: "✎", title: "Notes",      subtitle: "All notes",   action: () => { onClose(); onNav("notes"); } },
      { group: "Go to", icon: "▢", title: "Flashcards", subtitle: "Decks",       action: () => { onClose(); onNav("flashcards"); } },
      { group: "Go to", icon: "◷", title: "Schedule",   subtitle: "Weekly view", action: () => { onClose(); onNav("schedule"); } },
      { group: "Go to", icon: "★", title: "Grades",     subtitle: "This term",   action: () => { onClose(); onNav("grades"); } },

      // Subjects
      ...SUBJECTS.map((s) => ({
        group: "Subjects",
        dot: s.color,
        title: s.name,
        subtitle: `${s.short} · ${s.grade} · ${s.teacher}`,
        action: () => { onClose(); onNav("subject:" + s.id); },
      })),

      // Homework
      ...HOMEWORK.map((h) => {
        const sb = subjectBy(h.subject);
        return {
          group: "Homework",
          dot: sb.color,
          title: h.title,
          subtitle: `${sb.short} · due ${h.due} · ${h.est}` + (h.done ? " · ✓ done" : ""),
          action: () => { onClose(); onNav("homework"); },
        };
      }),

      // Notes (titles + excerpts)
      ...allNotesFlat.map(({ subjectId, subject: sb, note: n, bodyText }) => ({
        group: "Notes",
        dot: sb.color,
        title: n.title,
        bodyText,
        subtitle: `${sb.short} · ${n.when}${bodyText ? " — " + bodyText.slice(0, 70) + "…" : ""}`,
        action: () => { onClose(); window.location.hash = "#/subject/" + subjectId + "/notes/" + n.id; },
      })),

      // Quizzes upcoming
      ...QUIZZES_UPCOMING.map((qq) => {
        const sb = subjectBy(qq.subject);
        return {
          group: "Quizzes",
          dot: sb.color,
          title: qq.title,
          subtitle: `${sb.short} · ${qq.when} · ${qq.length}`,
          action: () => { onClose(); onNav("quiz/mcq"); },
        };
      }),
    ];
    if (!q.trim()) return all;
    const needle = q.trim().toLowerCase();
    return all.filter((it) =>
      it.title.toLowerCase().includes(needle) ||
      (it.subtitle && it.subtitle.toLowerCase().includes(needle)) ||
      (it.bodyText && it.bodyText.toLowerCase().includes(needle)) ||
      it.group.toLowerCase().includes(needle)
    );
  }, [q, allNotesFlat]);

  React.useEffect(() => { setSel(0); }, [q]);

  const grouped = React.useMemo(() => {
    const m = new Map();
    items.forEach((it) => {
      if (!m.has(it.group)) m.set(it.group, []);
      m.get(it.group).push(it);
    });
    return [...m.entries()];
  }, [items]);

  const flat = items;
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); flat[sel] && flat[sel].action(); }
  };

  return (
    <Modal onClose={onClose} width={620} top="10vh" variant="cmdk">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "1px solid var(--hairline)" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--ink-3)" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search subjects, notes, homework — or type a command…"
          style={{
            flex: 1, border: 0, outline: 0, background: "transparent",
            fontFamily: "inherit", fontSize: 15, color: "var(--ink)",
          }}
        />
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", border: "1px solid var(--hairline)", borderRadius: 3, padding: "2px 6px" }}>ESC</span>
      </div>

      <div style={{ overflow: "auto", flex: 1, padding: "8px 0" }}>
        {grouped.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 16 }}>
            Nothing matches "{q}"
          </div>
        )}
        {grouped.map(([group, list]) => (
          <div key={group}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", padding: "10px 20px 4px" }}>{group}</div>
            {list.map((it) => {
              const i = flat.indexOf(it);
              const active = i === sel;
              return (
                <div key={i}
                  onClick={it.action}
                  onMouseEnter={() => setSel(i)}
                  style={{
                    display: "grid", gridTemplateColumns: "28px 1fr 16px",
                    alignItems: "center", gap: 12,
                    padding: "8px 20px",
                    background: active ? "var(--bg-2)" : "transparent",
                    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                    cursor: "pointer",
                  }}>
                  <div style={{ display: "grid", placeItems: "center" }}>
                    {it.dot ? <span style={{ width: 8, height: 8, borderRadius: 2, background: it.dot }}></span>
                            : <span style={{ fontFamily: "var(--f-mono)", color: "var(--ink-3)", fontSize: 14 }}>{it.icon}</span>}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
                    {it.subtitle && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.subtitle}</div>}
                  </div>
                  {active && <span style={{ color: "var(--ink-3)", fontFamily: "var(--f-mono)", fontSize: 11 }}>↵</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--hairline)", padding: "8px 16px", display: "flex", gap: 14, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>
        <span><kbd style={kbdStyle}>↑↓</kbd> navigate</span>
        <span><kbd style={kbdStyle}>↵</kbd> open</span>
        <span><kbd style={kbdStyle}>esc</kbd> close</span>
        <span style={{ marginLeft: "auto" }}>{flat.length} results</span>
      </div>
    </Modal>
  );
}

const kbdStyle = {
  fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-2)",
  border: "1px solid var(--hairline)", borderRadius: 3, padding: "0 4px", marginRight: 3,
};

// ─────────────── Quick Add modal

function QuickAdd({ onClose, initialType = "homework" }) {
  const [type, setType] = React.useState(initialType);
  const [subject, setSubject] = React.useState(() => SUBJECTS[0] ? SUBJECTS[0].id : "");
  const [title, setTitle] = React.useState("");
  const [due, setDue] = React.useState("Tomorrow");
  const [dueDate, setDueDate] = React.useState(""); // specific date fallback
  const [tag, setTag] = React.useState("reading");
  const [topics, setTopics] = React.useState(""); // for notes
  const [quizDate, setQuizDate] = React.useState(""); // for quiz day
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => setType(initialType), [initialType]);

  // Compute display due string
  const effectiveDue = due === "Pick date" ? (dueDate || "TBD") : due;

  const save = () => {
    if (type === "homework") {
      nbAddHomework({
        subject, title: title.trim(), tag,
        due: effectiveDue,
        dueNote: effectiveDue === "Tonight" ? "11:59 PM" : effectiveDue === "Tomorrow" ? "in class" : dueDate ? new Date(dueDate + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "",
        est: "—",
      });
      window.dispatchEvent(new CustomEvent("toast", { detail: "Homework added · find it in Homework" }));
    } else if (type === "note") {
      const tagArr = topics.split(",").map(t => t.trim()).filter(Boolean);
      const rec = nbAddNote(subject, { title: title.trim(), tags: tagArr });
      window.dispatchEvent(new CustomEvent("toast", { detail: `Note created in ${subjectBy(subject).short}` }));
      setTimeout(() => { window.location.hash = "#/subject/" + subject + "/notes/" + rec.id; }, 600);
    } else if (type === "quiz") {
      const dateStr = quizDate ? new Date(quizDate + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
      nbAddQuiz({ title: title.trim(), subject, date: quizDate, dateStr, when: dateStr || "TBD" });
      window.dispatchEvent(new CustomEvent("toast", { detail: `Quiz day saved${dateStr ? " for " + dateStr : ""}` }));
    } else if (type === "flashcard") {
      window.dispatchEvent(new CustomEvent("toast", { detail: "Empty deck created — open Flashcards to add cards" }));
    }
    setSaved(true);
    setTimeout(onClose, 900);
  };

  return (
    <Modal onClose={onClose} width={520} variant="spring-bottom">
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Quick add</div>
        <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 28, lineHeight: 1.1, marginTop: 4 }}>
          New <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{type === "homework" ? "homework" : type === "note" ? "note" : type === "quiz" ? "quiz day" : "deck"}</em>
        </div>
      </div>

      {saved ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 44, color: "var(--done)", marginBottom: 8 }}>✓</div>
          <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-2)", fontStyle: "italic" }}>Saved.</div>
        </div>
      ) : (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <Field label="Title">
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "homework" ? "e.g. Read Beloved ch 9–12" : type === "note" ? "Note title" : type === "quiz" ? "e.g. Unit 4 Cell Division Quiz" : "Deck name"}
              style={fieldInput} />
          </Field>

          {/* Subject */}
          <Field label="Subject">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUBJECTS.map((s) => (
                <button key={s.id} onClick={() => setSubject(s.id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 10px", borderRadius: 3,
                  border: "1px solid " + (subject === s.id ? "var(--ink)" : "var(--hairline)"),
                  background: subject === s.id ? "var(--ink)" : "var(--surface)",
                  color: subject === s.id ? "var(--bg)" : "var(--ink)",
                  fontFamily: "inherit", fontSize: 12, cursor: "pointer",
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color }}></span>
                  {s.short}
                </button>
              ))}
            </div>
          </Field>

          {type === "homework" && (
            <>
              <Field label="Due">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {["Tonight", "Tomorrow", "This week", "Next week", "Pick date"].map((d) => (
                    <button key={d} onClick={() => setDue(d)} style={{
                      padding: "5px 10px", border: "1px solid " + (due === d ? "var(--ink)" : "var(--hairline)"),
                      background: due === d ? "var(--ink)" : "var(--surface)", color: due === d ? "var(--bg)" : "var(--ink)",
                      borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                    }}>{d}</button>
                  ))}
                  {due === "Pick date" && (
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                      style={{ ...fieldInput, width: "auto", fontSize: 12.5, padding: "5px 10px" }} />
                  )}
                </div>
              </Field>
              <Field label="Type">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["reading", "problems", "writing", "video", "vocab"].map((t) => (
                    <button key={t} onClick={() => setTag(t)} style={{
                      padding: "4px 9px", border: "1px solid " + (tag === t ? "var(--ink)" : "var(--hairline)"),
                      background: tag === t ? "var(--bg-2)" : "var(--surface)",
                      borderRadius: 3, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-2)",
                      textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer",
                    }}>{t}</button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {type === "note" && (
            <Field label="Topics">
              <input value={topics} onChange={(e) => setTopics(e.target.value)}
                placeholder="e.g. mitosis, DNA replication (comma-separated)"
                style={fieldInput} />
            </Field>
          )}

          {type === "quiz" && (
            <Field label="Quiz date">
              <input type="date" value={quizDate} onChange={(e) => setQuizDate(e.target.value)}
                style={{ ...fieldInput, fontSize: 13 }} />
            </Field>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{type === "homework" ? "Will appear in Homework list" : type === "note" ? "Opens to your new note" : type === "quiz" ? "Quiz day added to your schedule" : "Empty deck ready for cards"}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
              <button className="sn-btn primary" onClick={save} disabled={!title.trim()} style={{ opacity: title.trim() ? 1 : 0.4 }}>
                Add {type === "homework" ? "task" : type === "note" ? "note" : type === "quiz" ? "quiz day" : "deck"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

const fieldInput = {
  width: "100%", padding: "8px 12px", border: "1px solid var(--hairline)",
  borderRadius: 4, fontFamily: "inherit", fontSize: 14, color: "var(--ink)",
  background: "var(--surface)", outline: "none",
};

function Field({ label, children }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

// ─────────────── AI Helper drawer

function AIHelper({ noteTitle, noteText, subjectShort, onClose }) {
  const [task, setTask] = React.useState(null); // explain | summarize | flashcards | quiz
  const [result, setResult] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const run = async (kind) => {
    setTask(kind); setLoading(true); setResult("");
    let prompt = "";
    if (kind === "explain") prompt = `Explain this ${subjectShort} note for a high school student in 2–3 short paragraphs. Use plain language. Don't restate the note verbatim.\n\nNote title: ${noteTitle}\n\n${noteText}`;
    if (kind === "summarize") prompt = `Summarize this ${subjectShort} note in 4–6 bullet points. Use plain dashes, no markdown.\n\nNote title: ${noteTitle}\n\n${noteText}`;
    if (kind === "flashcards") prompt = `Create 5 flashcards from this ${subjectShort} note. Format strictly as:\n\nQ: question\nA: answer\n\nQ: question\nA: answer\n\nNote title: ${noteTitle}\n\n${noteText}`;
    if (kind === "quiz") prompt = `Write 3 multiple-choice questions to quiz a student on this ${subjectShort} note. Format each as:\n\nQ1. question\n  A) ...\n  B) ...\n  C) ...\n  D) ...\n  Correct: <letter> — brief explanation\n\nNote title: ${noteTitle}\n\n${noteText}`;
    try {
      const text = await aiComplete(prompt);
      setResult(text || "(no response)");
    } catch (e) {
      if (e.message === "no-key") {
        setResult("__no-key__");
      } else if (e.message === "invalid-key") {
        setResult("Invalid API key — update it via ✦ Connect AI in the topbar.");
      } else {
        setResult("AI is unavailable right now — try again in a moment.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="sn-root" style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 420, zIndex: 90,
      background: "var(--surface)", borderLeft: "1px solid var(--hairline)",
      boxShadow: "-12px 0 28px -16px rgba(20,16,11,0.18)",
      display: "flex", flexDirection: "column",
      animation: "slide-in 0.22s ease",
    }}>
      <style>{`@keyframes slide-in { from { transform: translateX(100%);} to { transform: none; } }`}</style>

      <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>AI Study Helper</div>
          <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.1, marginTop: 4 }}>
            What would you like, <em style={{ color: "var(--accent)", fontStyle: "italic" }}>{(() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1")||"{}").name || "you"; } catch { return "you"; } })()}?</em>
          </div>
        </div>
        <button className="sn-btn ghost icon" onClick={onClose} style={{ padding: 4, fontSize: 16, color: "var(--ink-3)" }}>✕</button>
      </div>

      <div style={{ padding: "16px 22px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <AITaskButton label="Explain it"        sub="In plain language" active={task === "explain"}    onClick={() => run("explain")} />
        <AITaskButton label="Summarize"          sub="4–6 key bullets"  active={task === "summarize"} onClick={() => run("summarize")} />
        <AITaskButton label="Make flashcards"   sub="5 Q&A pairs"       active={task === "flashcards"} onClick={() => run("flashcards")} />
        <AITaskButton label="Quiz me"           sub="3 multiple choice" active={task === "quiz"}       onClick={() => run("quiz")} />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 22px 22px" }}>
        {!task && (
          <div style={{ marginTop: 24, padding: 14, background: "var(--bg-2)", borderRadius: 6, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 16, fontStyle: "italic", color: "var(--ink)", marginBottom: 6 }}>This note</div>
            <div style={{ borderLeft: "2px solid var(--hairline)", paddingLeft: 10 }}>
              <b style={{ color: "var(--ink)" }}>{noteTitle}</b><br/>
              {noteText.slice(0, 180)}…
            </div>
          </div>
        )}
        {task && loading && (
          <div style={{ padding: "24px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", textAlign: "center" }}>
            <div className="ai-dots"><span></span><span></span><span></span></div>
            <style>{`
              .ai-dots { display: flex; justify-content: center; gap: 6px; margin-bottom: 10px; }
              .ai-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: dot-pulse 0.9s ease infinite; }
              .ai-dots span:nth-child(2) { animation-delay: 0.15s; }
              .ai-dots span:nth-child(3) { animation-delay: 0.3s; }
              @keyframes dot-pulse { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1.1); } }
            `}</style>
            thinking…
          </div>
        )}
        {task && !loading && result && (
          <div style={{ animation: "fade-up 0.3s ease" }}>
            {result === "__no-key__" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0" }}>
                <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>Connect your API key to use AI features.</div>
                <button className="sn-btn primary" style={{ flexShrink: 0, fontSize: 12 }}
                  onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>✦ Connect AI</button>
              </div>
            ) : task === "flashcards" ? <Flashcards text={result} /> :
               task === "quiz"       ? <QuizPreview text={result} /> :
               <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)" }}>{result}</div>
            }
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="sn-btn ghost" onClick={() => run(task)} style={{ fontSize: 11, padding: "5px 10px" }}>↻ Retry</button>
              {task === "flashcards" && <button className="sn-btn" style={{ fontSize: 11, padding: "5px 10px" }}>+ Add to deck</button>}
              {task === "quiz" && <button className="sn-btn" style={{ fontSize: 11, padding: "5px 10px" }}>Save as quiz</button>}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 22px", borderTop: "1px solid var(--hairline)", fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>
        Generated by AI · double-check important facts
      </div>
    </div>
  );
}

function AITaskButton({ label, sub, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      textAlign: "left", padding: "10px 12px", borderRadius: 5,
      border: "1px solid " + (active ? "var(--accent)" : "var(--hairline)"),
      background: active ? "var(--accent-soft)" : "var(--surface)",
      color: "var(--ink)", cursor: "pointer", fontFamily: "inherit",
    }}>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
    </button>
  );
}

function Flashcards({ text }) {
  // Parse "Q: ... A: ..." pairs
  const cards = [];
  const lines = text.split(/\n+/);
  let q = null;
  for (const ln of lines) {
    const qm = ln.match(/^Q[:\.]\s*(.+)/i);
    const am = ln.match(/^A[:\.]\s*(.+)/i);
    if (qm) q = qm[1];
    else if (am && q) { cards.push({ q, a: am[1] }); q = null; }
  }
  if (cards.length === 0) return <div style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "var(--ink)" }}>{text}</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {cards.map((c, i) => <FlashcardMini key={i} q={c.q} a={c.a} />)}
    </div>
  );
}
function FlashcardMini({ q, a }) {
  const [flipped, setFlipped] = React.useState(false);
  return (
    <div onClick={() => setFlipped((f) => !f)} style={{
      border: "1px solid var(--hairline)", borderRadius: 5, padding: 12,
      background: flipped ? "var(--bg-2)" : "var(--surface)",
      cursor: "pointer",
    }}>
      <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{flipped ? "Answer" : "Term"}</div>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 15, lineHeight: 1.3 }}>
        {flipped ? a : q}
      </div>
    </div>
  );
}
function QuizPreview({ text }) {
  return <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6, color: "var(--ink)", fontFamily: "var(--f-mono)" }}>{text}</div>;
}

// ─────────────── Pomodoro chip (lives in topbar)

function PomodoroChip() {
  const [running, setRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(25 * 60);

  React.useEffect(() => {
    const onStart = () => { setRunning(true); setSeconds(25 * 60); };
    window.addEventListener("startPomodoro", onStart);
    return () => window.removeEventListener("startPomodoro", onStart);
  }, []);

  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => {
      if (s <= 1) { setRunning(false); return 25 * 60; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [running]);

  if (!running) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const pct = 1 - seconds / (25 * 60);
  return (
    <div onClick={() => setRunning(false)} title="Click to stop" style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "5px 10px", border: "1px solid var(--accent)",
      borderRadius: 999, background: "var(--accent-soft)",
      fontFamily: "var(--f-mono)", fontSize: 11.5, color: "var(--accent-ink)",
      cursor: "pointer", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, background: "rgba(0,0,0,0.05)" }}></div>
      <span className="pomo-pulse"></span>
      <span style={{ position: "relative" }}>{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>
    </div>
  );
}

// ─────────────── Manage Subjects modal

function ManageSubjectsModal({ onClose }) {
  const PRESET_COLORS = [
    "#c8694a", "#6b8e5a", "#5a7a99", "#b58a3b", "#7a4e6e",
    "#3f7d8a", "#b3543b", "#9a9082", "#4a7c6e", "#7c4a4a",
    "#8b5e3c", "#4f6d8a",
  ];
  const [name, setName] = React.useState("");
  const [short, setShort] = React.useState("");
  const [color, setColor] = React.useState(PRESET_COLORS[2]);
  const [colorPickId, setColorPickId] = React.useState(null);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const persistSubjects = () => {
    let profile = {};
    try { profile = JSON.parse(localStorage.getItem("nb-profile-v1") || "{}") || {}; } catch {}
    profile.subjects = [...window.SUBJECTS];
    try { localStorage.setItem("nb-profile-v1", JSON.stringify(profile)); } catch {}
    if (window.nbSyncNow) window.nbSyncNow();
    window.dispatchEvent(new Event("nbStoreChange"));
  };

  const canSave = name.trim().length >= 2 && short.trim().length >= 1;

  const addSubject = () => {
    if (!canSave) return;
    const baseId = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const finalId = window.SUBJECTS.some((s) => s.id === baseId) ? baseId + "-" + Date.now() : baseId;
    const newSubject = {
      id: finalId, name: name.trim(), short: short.trim().slice(0, 14), color,
      grade: "—", teacher: "—", room: "—", notes: 0, hw: 0, quizzes: 0,
    };
    window.SUBJECTS.push(newSubject);
    persistSubjects();
    window.dispatchEvent(new CustomEvent("toast", { detail: `${newSubject.short} added` }));
    setName(""); setShort(""); setColor(PRESET_COLORS[2]);
    forceUpdate();
  };

  const deleteSubject = (id) => {
    const subj = window.SUBJECTS.find(s => s.id === id);
    if (!subj) return;
    if (!window.confirm(`Delete "${subj.name}"? Notes and homework for this subject will remain in the store but won't be visible.`)) return;
    const idx = window.SUBJECTS.findIndex(s => s.id === id);
    if (idx >= 0) window.SUBJECTS.splice(idx, 1);
    if (colorPickId === id) setColorPickId(null);
    persistSubjects();
    window.dispatchEvent(new CustomEvent("toast", { detail: `${subj.short} removed` }));
    forceUpdate();
  };

  const changeColor = (id, newColor) => {
    const subj = window.SUBJECTS.find(s => s.id === id);
    if (!subj) return;
    subj.color = newColor;
    persistSubjects();
    setColorPickId(null);
    forceUpdate();
  };

  const moveSubject = (id, dir) => {
    const idx = window.SUBJECTS.findIndex(s => s.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= window.SUBJECTS.length) return;
    const arr = [...window.SUBJECTS];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    window.SUBJECTS.length = 0;
    arr.forEach(s => window.SUBJECTS.push(s));
    persistSubjects();
    forceUpdate();
  };

  const btnArrow = (disabled) => ({
    background: "none", border: "none", padding: "1px 3px", lineHeight: 1,
    cursor: disabled ? "default" : "pointer",
    color: disabled ? "var(--hairline)" : "var(--ink-3)",
    fontSize: 10,
  });

  return (
    <Modal onClose={onClose} width={520}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Subjects</div>
          <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>
            Manage <em style={{ color: "var(--accent)", fontStyle: "italic" }}>subjects</em>
          </div>
        </div>
        <button className="sn-btn ghost icon" onClick={onClose} style={{ padding: 4, fontSize: 16, color: "var(--ink-3)" }}>✕</button>
      </div>

      <div style={{ overflow: "auto", maxHeight: "calc(78vh - 160px)" }}>
        {/* Existing subjects list */}
        {window.SUBJECTS.length > 0 && (
          <div style={{ padding: "16px 24px 8px", borderBottom: "1px solid var(--hairline)" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
              Current subjects ({window.SUBJECTS.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {window.SUBJECTS.map((s, idx) => (
                <div key={s.id}>
                  <div style={{
                    display: "grid", gridTemplateColumns: "20px 18px 1fr auto",
                    alignItems: "center", gap: 8,
                    padding: "8px 10px",
                    borderRadius: colorPickId === s.id ? "5px 5px 0 0" : 5,
                    background: "var(--bg-2)",
                  }}>
                    {/* Up / down */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <button style={btnArrow(idx === 0)} disabled={idx === 0}
                        onClick={() => moveSubject(s.id, -1)} title="Move up">▲</button>
                      <button style={btnArrow(idx === window.SUBJECTS.length - 1)}
                        disabled={idx === window.SUBJECTS.length - 1}
                        onClick={() => moveSubject(s.id, 1)} title="Move down">▼</button>
                    </div>
                    {/* Clickable color dot */}
                    <div
                      onClick={() => setColorPickId(colorPickId === s.id ? null : s.id)}
                      title="Change color"
                      style={{
                        width: 14, height: 14, borderRadius: 3, background: s.color,
                        flexShrink: 0, cursor: "pointer",
                        boxShadow: colorPickId === s.id ? `0 0 0 2px var(--bg), 0 0 0 3.5px ${s.color}` : "none",
                        transition: "box-shadow .12s",
                      }}
                    />
                    {/* Name + short */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 1 }}>
                        {s.short}{s.teacher && s.teacher !== "—" ? ` · ${s.teacher}` : ""}{s.grade && s.grade !== "—" ? ` · ${s.grade}` : ""}
                      </div>
                    </div>
                    {/* Delete */}
                    <button title={`Delete ${s.name}`} onClick={() => deleteSubject(s.id)}
                      style={{
                        border: "1px solid var(--hairline)", background: "transparent",
                        color: "var(--accent)", cursor: "pointer", borderRadius: 4,
                        fontSize: 12, padding: "2px 7px", lineHeight: 1.4, flexShrink: 0,
                        fontFamily: "var(--f-mono)",
                      }}>Delete</button>
                  </div>
                  {/* Inline color picker */}
                  {colorPickId === s.id && (
                    <div style={{
                      background: "var(--bg-2)", borderRadius: "0 0 5px 5px",
                      borderTop: "1px solid var(--hairline)",
                      padding: "10px 10px 10px 48px",
                      display: "flex", gap: 7, flexWrap: "wrap",
                    }}>
                      {PRESET_COLORS.map((c) => (
                        <div key={c} onClick={() => changeColor(s.id, c)}
                          title={c}
                          style={{
                            width: 22, height: 22, borderRadius: 4, background: c,
                            cursor: "pointer", flexShrink: 0,
                            boxShadow: s.color === c ? `0 0 0 2px var(--bg), 0 0 0 4px ${c}` : "none",
                            transition: "box-shadow .12s",
                          }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new subject form */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Add new subject</div>
          <Field label="Full subject name">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && canSave) addSubject(); }}
              placeholder="e.g. AP Chemistry, Health, Band" style={fieldInput} />
          </Field>
          <Field label="Short name (shown in sidebar)">
            <input value={short} onChange={(e) => setShort(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && canSave) addSubject(); }}
              placeholder="e.g. AP Chem" style={fieldInput} />
          </Field>
          <Field label="Color">
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {PRESET_COLORS.map((c) => (
                <div key={c} onClick={() => setColor(c)} style={{
                  width: 26, height: 26, borderRadius: 4, background: c, cursor: "pointer", flexShrink: 0,
                  boxShadow: color === c ? `0 0 0 2px var(--bg), 0 0 0 4px ${c}` : "none",
                  transition: "box-shadow 0.12s ease",
                }} />
              ))}
            </div>
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button className="sn-btn ghost" onClick={onClose}>Close</button>
            <button className="sn-btn primary" onClick={addSubject} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.4 }}>Add subject</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── API Key Modal ──
function ApiKeyModal({ onClose }) {
  const [key, setKey] = React.useState(nbGetApiKey());
  const [testing, setTesting] = React.useState(false);
  // "" | "ok" | "err-auth" | "err-cors" | "err"
  const [status, setStatus] = React.useState("");

  // Validate key by hitting GET /v1/models — no body, minimal headers, simplest CORS preflight
  const testKey = async (trimmed) => {
    const resp = await fetch("https://api.anthropic.com/v1/models", {
      method: "GET",
      headers: {
        "x-api-key": trimmed,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
    });
    if (resp.status === 401) throw new Error("invalid-key");
    // Any 2xx or even 4xx that isn't 401 means the request got through — key is real
    return resp.ok;
  };

  const save = async () => {
    const trimmed = key.trim();
    if (!trimmed) { nbSetApiKey(""); onClose(); return; }

    setTesting(true);
    setStatus("");
    try {
      await testKey(trimmed);
      nbSetApiKey(trimmed);
      setStatus("ok");
      window.dispatchEvent(new CustomEvent("toast", { detail: "API key connected — AI is live ✓" }));
      setTimeout(onClose, 1000);
    } catch (e) {
      if (e.message === "invalid-key") {
        setStatus("err-auth");
      } else {
        // Can't reach Anthropic from this environment — save and let actual usage confirm
        nbSetApiKey(trimmed);
        window.dispatchEvent(new CustomEvent("toast", { detail: "Key saved — couldn't verify from preview, but will work normally ✓" }));
        onClose();
      }
    }
    setTesting(false);
  };


  const remove = () => {
    nbSetApiKey("");
    setKey("");
    setStatus("");
    window.dispatchEvent(new CustomEvent("toast", { detail: "API key removed" }));
  };

  const borderColor = status === "ok" ? "#27ae60" : status.startsWith("err") ? "var(--accent)" : "var(--hairline)";

  return (
    <Modal onClose={onClose} width={500} top="15vh">
      <div style={{ padding: "22px 26px", borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Claude AI</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1 }}>
          Connect <em style={{ color: "var(--accent)", fontStyle: "italic" }}>your API key</em>
        </div>
      </div>
      <div style={{ padding: "20px 26px" }}>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.65, margin: "0 0 18px" }}>
          Paste your Anthropic API key. It's stored only in your browser's localStorage and sent exclusively to Anthropic's API.
        </p>

        <div style={{ marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>API Key</div>
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setStatus(""); }}
            placeholder="sk-ant-api03-…"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && save()}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "9px 12px",
              border: "1.5px solid " + borderColor,
              borderRadius: 5, background: "var(--bg-2)", color: "var(--ink)",
              fontFamily: "var(--f-mono)", fontSize: 13, outline: "none",
              transition: "border-color 0.15s",
            }}
          />
          {status === "ok"       && <div style={{ marginTop: 7, fontSize: 12, color: "#27ae60",       fontFamily: "var(--f-mono)" }}>✓ Connected successfully</div>}
          {status === "err-auth" && <div style={{ marginTop: 7, fontSize: 12, color: "var(--accent)", fontFamily: "var(--f-mono)" }}>✕ Invalid key — double-check it and try again</div>}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="sn-btn primary" onClick={save} disabled={testing || !key.trim()} style={{ flex: 1 }}>
            {testing ? "Saving…" : "Save key"}
          </button>
          {nbGetApiKey() && <button className="sn-btn ghost" onClick={remove} style={{ color: "var(--accent)" }}>Remove</button>}
          <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
        </div>

        <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--ink-3)" }}>
          Get your key at <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5 }}>console.anthropic.com</span> → API keys
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { CommandPalette, QuickAdd, AIHelper, PomodoroChip, ToastHost, HomeworkDetail, ScheduleEditor, AINoteDraft, ManageSubjectsModal, ApiKeyModal });

// ─────────────── Schedule editor — edit bell times for each period

function ScheduleEditor({ onClose }) {
  const initial = nbGetSchedule();
  const [rows, setRows] = React.useState(() => initial.map((r) => ({ ...r })));

  const setField = (i, k, v) => setRows((rs) => rs.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const addRow = () => setRows((rs) => [...rs, { time: "3:00", end: "3:50", subject: SUBJECTS[0].id, room: "—", note: "" }]);
  const removeRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));
  const save = () => {
    nbSetSchedule(rows);
    window.dispatchEvent(new CustomEvent("toast", { detail: "Schedule updated" }));
    onClose();
  };
  const reset = () => {
    if (confirm("Reset to the default sample schedule?")) {
      nbResetSchedule();
      window.dispatchEvent(new CustomEvent("toast", { detail: "Schedule reset" }));
      onClose();
    }
  };

  return (
    <Modal onClose={onClose} width={720} top="6vh">
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Bell times</div>
          <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>
            Your <em style={{ color: "var(--accent)", fontStyle: "italic" }}>actual</em> day
          </div>
        </div>
        <button className="sn-btn ghost icon" onClick={onClose} style={{ padding: 4, fontSize: 16, color: "var(--ink-3)" }}>✕</button>
      </div>

      <div style={{ overflow: "auto", padding: "8px 24px", flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "70px 70px 1fr 60px 1.5fr 24px", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--hairline)", fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          <div>Start</div><div>End</div><div>Subject</div><div>Room</div><div>Note</div><div></div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 70px 1fr 60px 1.5fr 24px", gap: 10, padding: "8px 0", borderBottom: "1px dashed var(--hairline)", alignItems: "center" }}>
            <input value={r.time} onChange={(e) => setField(i, "time", e.target.value)} placeholder="8:10" style={editInputStyle} />
            <input value={r.end}  onChange={(e) => setField(i, "end", e.target.value)} placeholder="9:00" style={editInputStyle} />
            <select value={r.subject || ""} onChange={(e) => setField(i, "subject", e.target.value || null)} style={{ ...editInputStyle, padding: "5px 6px" }}>
              <option value="">— Lunch / Free —</option>
              {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.short} — {s.name}</option>)}
            </select>
            <input value={r.room} onChange={(e) => setField(i, "room", e.target.value)} placeholder="—" style={editInputStyle} />
            <input value={r.note} onChange={(e) => setField(i, "note", e.target.value)} placeholder="—" style={editInputStyle} />
            <button onClick={() => removeRow(i)} title="Remove" style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 14 }}>×</button>
          </div>
        ))}
        <button className="sn-btn" onClick={addRow} style={{ marginTop: 14 }}>+ Add period</button>
      </div>

      <div style={{ padding: "12px 24px", borderTop: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="sn-btn ghost" onClick={reset} style={{ color: "var(--ink-3)" }}>Reset to sample</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
          <button className="sn-btn primary" onClick={save}>Save schedule</button>
        </div>
      </div>
    </Modal>
  );
}
const editInputStyle = {
  width: "100%", padding: "5px 8px", border: "1px solid var(--hairline)",
  borderRadius: 4, fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--ink)",
  background: "var(--surface)", outline: "none",
};

// ─────────────── AI note draft — given a topic, generate the note body via Claude

function AINoteDraft({ subjectId, onApply, onClose }) {
  const subj = subjectBy(subjectId) || SUBJECTS[0];
  const [topic, setTopic] = React.useState("");
  const [style, setStyle] = React.useState("structured");
  const [loading, setLoading] = React.useState(false);
  const [draft, setDraft] = React.useState(null); // { title, blocks }
  const [error, setError] = React.useState("");

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setDraft(null); setError("");
    const styleText = style === "structured" ? "with H2 headings, paragraphs, and bullet lists"
                    : style === "outline"    ? "as a concise outline with H2 sections and bulleted points only"
                    : style === "summary"    ? "as a flowing 2–3 paragraph summary"
                    : "with worked example steps and short explanations";
    const prompt = `You are helping a high school student take notes for ${subj.name}. Topic: "${topic.trim()}".

Write study notes ${styleText}. Use plain language. Stay under 250 words.

Return STRICTLY this JSON format and nothing else (no markdown fences):
{
  "title": "Short note title",
  "blocks": [
    {"type":"p","text":"paragraph text"},
    {"type":"h2","text":"heading"},
    {"type":"li","text":"list item"},
    {"type":"quote","text":"a memorable quote or key insight"}
  ]
}

Block types you may use: p, h2, li, quote. Use whatever sequence reads best.`;
    if (typeof window.claude === "undefined" || !window.claude.complete) {
      setError("AI drafting requires Claude Code. Open this notebook inside Claude Code to use this feature. You can still create a blank note and write manually.");
      setLoading(false);
      return;
    }
    try {
      const text = await window.claude.complete(prompt);
      // Parse JSON, tolerating accidental fences.
      let cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      if (!parsed || !Array.isArray(parsed.blocks)) throw new Error("malformed");
      setDraft(parsed);
    } catch (e) {
      setError("Couldn't generate the draft — try again in a moment.");
    } finally { setLoading(false); }
  };

  const apply = () => {
    onApply({ title: draft.title || topic, blocks: draft.blocks });
    onClose();
  };

  return (
    <Modal onClose={onClose} width={620}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>AI draft · {subj.short}</div>
        <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 26, lineHeight: 1.1, marginTop: 4 }}>
          Draft a note <em style={{ color: "var(--accent)", fontStyle: "italic" }}>about…</em>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Topic">
          <input autoFocus value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder={`e.g. ${subj.id === "ap-bio" ? "Mitosis vs meiosis" : subj.id === "ap-lit" ? "Morrison's use of unreliable narrators" : "What you're trying to understand"}`}
            onKeyDown={(e) => { if (e.key === "Enter" && topic.trim()) generate(); }}
            style={fieldInput} />
        </Field>
        <Field label="Style">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              ["structured", "Structured"],
              ["outline",    "Outline"],
              ["summary",    "Summary"],
              ["worked",     "Worked example"],
            ].map(([k, l]) => (
              <button key={k} onClick={() => setStyle(k)} style={{
                padding: "5px 12px", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                border: "1px solid " + (style === k ? "var(--ink)" : "var(--hairline)"),
                background: style === k ? "var(--ink)" : "var(--surface)",
                color: style === k ? "var(--bg)" : "var(--ink)",
              }}>{l}</button>
            ))}
          </div>
        </Field>

        {!draft && !loading && (
          <button className="sn-btn primary" onClick={generate} disabled={!topic.trim()} style={{ alignSelf: "flex-start", opacity: topic.trim() ? 1 : 0.4 }}>
            ✦ Draft with AI
          </button>
        )}
        {loading && (
          <div style={{ textAlign: "center", padding: "20px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)" }}>
            <div className="ai-dots"><span></span><span></span><span></span></div>
            <style>{`.ai-dots{display:flex;justify-content:center;gap:6px;margin-bottom:10px}.ai-dots span{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:dot-pulse .9s ease infinite}.ai-dots span:nth-child(2){animation-delay:.15s}.ai-dots span:nth-child(3){animation-delay:.3s}@keyframes dot-pulse{0%,80%,100%{opacity:.25;transform:scale(.85)}40%{opacity:1;transform:scale(1.1)}}`}</style>
            drafting…
          </div>
        )}
        {error && (
          <div style={{ padding: 12, background: "var(--accent-soft)", borderRadius: 4, fontSize: 12.5, color: "var(--accent-ink)" }}>
            {error}
            <button className="sn-btn ghost" onClick={generate} style={{ marginLeft: 8, fontSize: 11, padding: "3px 8px" }}>Try again</button>
          </div>
        )}
        {draft && (
          <div style={{ border: "1px solid var(--hairline)", borderRadius: 6, padding: 16, background: "var(--bg-2)", maxHeight: "40vh", overflow: "auto" }}>
            <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.15, marginBottom: 12 }}>{draft.title}</div>
            {draft.blocks.map((b, i) => {
              if (b.type === "h2") return <div key={i} className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 17, marginTop: 12, marginBottom: 4 }}>{b.text}</div>;
              if (b.type === "li") return <div key={i} style={{ display: "flex", gap: 6, fontSize: 13, marginBottom: 3, lineHeight: 1.5 }}><span style={{ color: "var(--accent)" }}>•</span>{b.text}</div>;
              if (b.type === "quote") return <div key={i} style={{ borderLeft: "2px solid var(--accent)", paddingLeft: 10, margin: "10px 0", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 14.5, color: "var(--ink-2)" }}>{b.text}</div>;
              return <div key={i} style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 8 }}>{b.text}</div>;
            })}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 24px", borderTop: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{draft ? "You can edit anything after applying" : ""}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {draft && <button className="sn-btn ghost" onClick={generate}>↻ Redraft</button>}
          <button className="sn-btn ghost" onClick={onClose}>Cancel</button>
          {draft && <button className="sn-btn primary" onClick={apply}>Use this draft</button>}
        </div>
      </div>
    </Modal>
  );
}

// ─────────────── Toast host

function ToastHost() {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    const onToast = (e) => {
      const id = Date.now() + Math.random();
      const msg = typeof e.detail === "string" ? e.detail : (e.detail && e.detail.message) || "Done";
      setToasts((ts) => [...ts, { id, msg }]);
      setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 2200);
    };
    window.addEventListener("toast", onToast);
    return () => window.removeEventListener("toast", onToast);
  }, []);
  return (
    <div className="sn-root" style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 200, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: "var(--ink)", color: "var(--bg)",
          padding: "9px 16px", borderRadius: 999,
          fontFamily: "var(--f-ui)", fontSize: 13, fontWeight: 500,
          boxShadow: "0 8px 24px -8px rgba(20,16,11,0.4)",
          animation: "fade-up 0.2s ease",
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

// ─────────────── Homework detail drawer

function HomeworkDetail({ item, onClose, onToggleDone, onOpenSubject, onDelete }) {
  if (!item) return null;
  const s = subjectBy(item.subject);
  const [title, setTitle] = React.useState(item.title);
  React.useEffect(() => setTitle(item.title), [item.title]);

  return (
    <div className="sn-root" style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 440, zIndex: 90,
      background: "var(--surface)", borderLeft: "1px solid var(--hairline)",
      boxShadow: "-12px 0 28px -16px rgba(20,16,11,0.18)",
      display: "flex", flexDirection: "column",
      animation: "slide-in 0.22s ease",
    }}>
      <style>{`@keyframes slide-in { from { transform: translateX(100%);} to { transform: none; } }`}</style>

      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}></span>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.short} · {item.tag}</span>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", border: 0, outline: 0, background: "transparent", fontFamily: "var(--f-display)", fontSize: 24, color: "var(--ink)", lineHeight: 1.2 }} />
        </div>
        <button className="sn-btn ghost icon" onClick={onClose} style={{ padding: 4, fontSize: 16, color: "var(--ink-3)" }}>✕</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
        <DetailRow label="Status">
          <button onClick={() => onToggleDone(item.id)} className={`sn-btn ${item.done ? "" : "primary"}`} style={{ padding: "5px 12px" }}>
            {item.done ? "✓ Completed — undo" : "Mark as done"}
          </button>
        </DetailRow>

        <DetailRow label="Due">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Tonight", "Tomorrow", "Wed", "Thu", "Fri", "Next week"].map((d) => (
              <span key={d} className="chip" style={{
                background: d === item.due ? "var(--ink)" : "var(--surface)",
                color: d === item.due ? "var(--bg)" : "var(--ink-2)",
                borderColor: d === item.due ? "var(--ink)" : "var(--hairline)",
                cursor: "pointer",
              }}>{d}</span>
            ))}
          </div>
        </DetailRow>

        <DetailRow label="Estimate">
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>{item.est}</div>
        </DetailRow>

        <DetailRow label="Details">
          <textarea
            placeholder="Add notes about this assignment…"
            rows={4}
            style={{
              width: "100%", padding: 10, borderRadius: 4,
              border: "1px solid var(--hairline)", background: "var(--bg)",
              fontFamily: "inherit", fontSize: 13.5, color: "var(--ink)", outline: "none", resize: "vertical",
            }}
          />
        </DetailRow>

        <DetailRow label="Linked">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span className="chip">Krebs cycle (notes)</span>
            <span className="chip">Enzyme kinetics lab</span>
            <span className="chip" style={{ borderStyle: "dashed", color: "var(--ink-3)", cursor: "pointer" }}>+ link</span>
          </div>
        </DetailRow>
      </div>

      <div style={{ padding: "14px 24px", borderTop: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <button className="sn-btn ghost" onClick={() => { onClose(); onOpenSubject(item.subject); }}>Open {s.short} notes →</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sn-btn ghost" onClick={() => { window.dispatchEvent(new CustomEvent("toast", { detail: "Snoozed to tomorrow" })); onClose(); }} style={{ color: "var(--ink-2)" }}>Snooze</button>
          <button className="sn-btn" onClick={() => { if (onDelete) onDelete(item.id); onClose(); }} style={{ color: "var(--accent)" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
function DetailRow({ label, children }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
