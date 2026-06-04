// Mobile app — full iPhone layout with real data

// ── Top-level mobile router ──
function MobileApp() {
  const [tab, setTab] = React.useState("today");
  const [stack, setStack] = React.useState([]);
  const store = useNbStore();

  const push = (screen) => setStack((s) => [...s, screen]);
  const pop  = () => setStack((s) => s.slice(0, -1));
  const switchTab = (t) => { setTab(t); setStack([]); };
  const current = stack[stack.length - 1] || null;

  const renderCurrent = () => {
    if (!current) return null;
    switch (current.type) {
      case "hw-detail":    return <MobileHWDetail hw={current.hw} onBack={pop} />;
      case "subject-notes":return <MobileSubjectNotes subjectId={current.id} onBack={pop} />;
      case "note-detail":  return <MobileNoteDetail subjectId={current.subjectId} noteId={current.noteId} onBack={pop} />;
      case "quiz-take":    return <MobileQuizTake quiz={current.quiz} onBack={pop} />;
      case "grades":       return <MobileGrades onBack={pop} />;
      case "schedule":     return <MobileSchedule onBack={pop} />;
      default: return null;
    }
  };

  return (
    <div className="sn-root" style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {current ? renderCurrent() : (
          <>
            {tab === "today"    && <MobileToday    push={push} />}
            {tab === "homework" && <MobileHomework  push={push} />}
            {tab === "notes"    && <MobileNotes     push={push} />}
            {tab === "study"    && <MobileStudy     push={push} />}
            {tab === "more"     && <MobileMore      push={push} />}
          </>
        )}
      </div>
      {!current && <MobileTabBar active={tab} onTab={switchTab} />}
    </div>
  );
}

// ── Bottom tab bar ──
function MobileTabBar({ active, onTab }) {
  const tabs = [
    { id: "today",    label: "Today",    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg> },
    { id: "homework", label: "Homework", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 10l2 2 4-4M8 16l2 2 4-4"/></svg> },
    { id: "notes",    label: "Notes",    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h10l5 5v11H4V4zM14 4v5h5"/></svg> },
    { id: "study",    label: "Study",    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="6" width="14" height="15" rx="2"/><path d="M7 3h14v15"/></svg> },
    { id: "more",     label: "More",     icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg> },
  ];
  return (
    <div style={{
      display: "flex", background: "var(--bg)", borderTop: "1px solid var(--hairline)",
      paddingBottom: "env(safe-area-inset-bottom)", flexShrink: 0,
    }}>
      {tabs.map(({ id, label, icon }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onTab(id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 3, padding: "10px 0 8px", border: 0, background: "transparent",
            color: isActive ? "var(--accent)" : "var(--ink-3)", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {icon}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Shared mobile header ──
function MobileHeader({ title, subtitle, onBack, right }) {
  return (
    <div style={{
      padding: "14px 20px 10px",
      paddingTop: "calc(14px + env(safe-area-inset-top))",
      borderBottom: "1px solid var(--hairline)", background: "var(--bg)",
      display: "flex", alignItems: "center", gap: 10,
      position: "sticky", top: 0, zIndex: 10,
    }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: 0, padding: "4px 4px 4px 0", cursor: "pointer", color: "var(--accent)", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--f-mono)", fontSize: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// ── TODAY ──
function MobileToday({ push }) {
  const store = useNbStore();
  const profile = React.useMemo(() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } }, []);
  const fbUser = useFbUser();
  const name = fbUser ? fbUser.displayName?.split(" ")[0] : (profile?.name || "there");

  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning," : hour < 17 ? "Good afternoon," : "Good evening,";

  const allHw = [...HOMEWORK, ...store.homework];
  const dueToday = allHw.filter((h) => !h.done && (h.due === "Tonight" || h.due === "Tomorrow" || h.urgent));
  const streak = nbGetStreak();

  const sched = nbGetSchedule();
  const todayClasses = sched ? sched.periods?.filter((p) => p.name && p.name !== "Free") : [];

  return (
    <div style={{ padding: "0 0 24px" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 16px", paddingTop: "calc(20px + env(safe-area-inset-top))" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
          {dayName} · {dateStr}
        </div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          {greeting} <em style={{ color: "var(--accent)" }}>{name}.</em>
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--ink-2)", marginTop: 5 }}>
          {dueToday.length > 0 ? `${dueToday.length} thing${dueToday.length !== 1 ? "s" : ""} due` : "All caught up ✓"}
          {todayClasses.length > 0 ? ` · ${todayClasses.length} classes today` : ""}
        </div>
      </div>

      {/* Streak card */}
      <div style={{ margin: "0 16px 16px" }}>
        <div style={{ background: "var(--ink)", color: "var(--bg)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Study streak</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 42, lineHeight: 1 }}>{streak}</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, opacity: 0.55 }}>days</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{ width: i < (streak % 7 || 7) ? 28 : 10, height: 5, background: i < (streak % 7 || 7) ? "var(--accent)" : "rgba(255,255,255,0.15)", borderRadius: 3, transition: "width 0.3s" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Due today */}
      {dueToday.length > 0 && (
        <div style={{ margin: "0 16px 20px" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Due today</div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 14, overflow: "hidden" }}>
            {dueToday.slice(0, 5).map((h, i) => {
              const s = subjectBy(h.subject);
              return (
                <div key={h.id} onClick={() => push({ type: "hw-detail", hw: h })} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < dueToday.length - 1 ? "1px solid var(--hairline)" : "none", cursor: "pointer" }}>
                  <div style={{ width: 3, height: 36, borderRadius: 2, background: s?.color || "var(--ink-3)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{s?.short || h.subject} · {h.est || "—"}</div>
                  </div>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: h.urgent ? "var(--accent)" : "var(--ink-3)", whiteSpace: "nowrap" }}>{h.due}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quizzes ahead */}
      {QUIZZES_UPCOMING.length > 0 && (
        <div style={{ margin: "0 16px 20px" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Quizzes ahead</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {QUIZZES_UPCOMING.slice(0, 3).map((q) => {
              const s = subjectBy(q.subject);
              return (
                <div key={q.id} style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderLeft: `3px solid ${s?.color || "var(--accent)"}`, borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s?.short} · {q.when}</div>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 17, marginTop: 3 }}>{q.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subjects quick access */}
      {SUBJECTS.length > 0 && (
        <div style={{ margin: "0 16px" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Subjects</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SUBJECTS.map((s) => (
              <div key={s.id} onClick={() => push({ type: "subject-notes", id: s.id })} style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12, padding: "14px 16px", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: s.color }} />
                <div style={{ fontFamily: "var(--f-display)", fontSize: 17, lineHeight: 1.15, paddingLeft: 4 }}>{s.name}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 4, paddingLeft: 4 }}>{s.short}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── HOMEWORK ──
function MobileHomework({ push }) {
  const store = useNbStore();
  const [filter, setFilter] = React.useState("all"); // all | pending | done
  const allHw = [...HOMEWORK, ...store.homework];
  const filtered = filter === "all" ? allHw : filter === "pending" ? allHw.filter(h => !h.done) : allHw.filter(h => h.done);

  return (
    <div>
      <MobileHeader title="Homework" subtitle={`${allHw.filter(h => !h.done).length} open`}
        right={
          <button onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } }))}
            style={{ background: "var(--ink)", color: "var(--bg)", border: 0, borderRadius: 8, padding: "6px 12px", fontFamily: "var(--f-mono)", fontSize: 12, cursor: "pointer" }}>
            + Add
          </button>
        }
      />
      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--hairline)" }}>
        {[["all","All"],["pending","Pending"],["done","Done"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ fontFamily: "var(--f-mono)", fontSize: 11, padding: "5px 12px", borderRadius: 20, border: "1px solid var(--hairline)", background: filter === k ? "var(--ink)" : "transparent", color: filter === k ? "var(--bg)" : "var(--ink-2)", cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 18 }}>
            {filter === "done" ? "Nothing completed yet." : "All caught up ✓"}
          </div>
        )}
        {filtered.map((h) => {
          const s = subjectBy(h.subject);
          return (
            <div key={h.id} style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                <div onClick={(e) => { e.stopPropagation(); nbToggleHomework(h.id); }}
                  style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${h.done ? "var(--ink)" : "var(--ink-3)"}`, background: h.done ? "var(--ink)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0, cursor: "pointer" }}>
                  {h.done && <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--bg)" strokeWidth="2.2"><path d="M3 8l3.5 3.5L13 5"/></svg>}
                </div>
                <div style={{ width: 3, height: 36, borderRadius: 2, background: s?.color || "var(--ink-3)", flexShrink: 0 }} />
                <div onClick={() => push({ type: "hw-detail", hw: h })} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                  <div style={{ fontSize: 15, textDecoration: h.done ? "line-through" : "none", color: h.done ? "var(--ink-3)" : "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{s?.short || h.subject} · {h.est || "—"}</div>
                </div>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: h.urgent ? "var(--accent)" : "var(--ink-3)", whiteSpace: "nowrap" }}>{h.due}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── HW DETAIL ──
function MobileHWDetail({ hw, onBack }) {
  const store = useNbStore();
  const s = subjectBy(hw.subject);
  const attachments = store.attachmentsFor("hw", hw.id);
  return (
    <div>
      <MobileHeader title={hw.title} subtitle={`${s?.name || hw.subject} · ${hw.due}`} onBack={onBack} />
      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Meta */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12, padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 16 }}>
          {[["Subject", s?.name || hw.subject], ["Due", hw.due], ["Est.", hw.est || "—"], ["Type", hw.tag || "—"]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 14 }}>{val}</div>
            </div>
          ))}
        </div>
        {/* Notes */}
        {hw.dueNote && (
          <div style={{ background: "var(--highlight)", borderRadius: 12, padding: "12px 16px", fontFamily: "var(--f-display)", fontSize: 15, lineHeight: 1.5 }}>{hw.dueNote}</div>
        )}
        {/* Attachments */}
        {attachments.length > 0 && (
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Attachments</div>
            {attachments.map((a) => (
              <a key={a.id} href={a.url} download={a.name} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "10px 14px", marginBottom: 6, textDecoration: "none", color: "var(--ink)" }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, background: "var(--bg-2)", padding: "3px 6px", borderRadius: 4 }}>{fileIconFor(a.type, a.name)}</span>
                <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{fmtFileSize(a.size)}</span>
              </a>
            ))}
          </div>
        )}
        {/* Toggle done */}
        <button onClick={() => { nbToggleHomework(hw.id); onBack(); }}
          style={{ background: hw.done ? "var(--bg-2)" : "var(--ink)", color: hw.done ? "var(--ink)" : "var(--bg)", border: `1px solid ${hw.done ? "var(--hairline)" : "var(--ink)"}`, borderRadius: 12, padding: "14px", fontFamily: "var(--f-mono)", fontSize: 13, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {hw.done ? "Mark as incomplete" : "Mark as complete ✓"}
        </button>
      </div>
    </div>
  );
}

// ── NOTES ──
function MobileNotes({ push }) {
  const store = useNbStore();
  return (
    <div>
      <MobileHeader title="Notes" subtitle={`${SUBJECTS.length} subjects`} />
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {SUBJECTS.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 18 }}>No subjects yet.</div>
        )}
        {SUBJECTS.map((s) => {
          const notes = [...(notesForSubject(s.id) || []), ...(store.notesFor(s.id) || [])];
          return (
            <div key={s.id} onClick={() => push({ type: "subject-notes", id: s.id })}
              style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 14, padding: "16px", cursor: "pointer", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: s.color }} />
              <div style={{ flex: 1, paddingLeft: 4 }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 19 }}>{s.name}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>{s.teacher ? `${s.short} · ${s.teacher}` : s.short} · {notes.length} note{notes.length !== 1 ? "s" : ""}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SUBJECT NOTES ──
function MobileSubjectNotes({ subjectId, onBack }) {
  const store = useNbStore();
  const s = subjectBy(subjectId);
  const builtIn = notesForSubject(subjectId) || [];
  const userNotes = store.notesFor(subjectId) || [];
  const allNotes = [...userNotes, ...builtIn];
  const [push2, setPush2] = React.useState(null);

  if (push2) {
    return <MobileNoteDetail subjectId={subjectId} noteId={push2} onBack={() => setPush2(null)} />;
  }

  return (
    <div>
      <MobileHeader title={s?.name || "Notes"} subtitle={`${allNotes.length} note${allNotes.length !== 1 ? "s" : ""}`} onBack={onBack}
        right={
          <button onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "note", subjectId } }))}
            style={{ background: "var(--ink)", color: "var(--bg)", border: 0, borderRadius: 8, padding: "6px 12px", fontFamily: "var(--f-mono)", fontSize: 12, cursor: "pointer" }}>
            + Note
          </button>
        }
      />
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {allNotes.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 18 }}>No notes yet.</div>
        )}
        {allNotes.map((n) => (
          <div key={n.id} onClick={() => setPush2(n.id)}
            style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12, padding: "14px 16px", cursor: "pointer" }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 17, lineHeight: 1.2 }}>{n.title}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span>{n.when}</span>
              {n.tags?.map(t => <span key={t} style={{ background: "var(--bg-2)", padding: "1px 6px", borderRadius: 3 }}>{t}</span>)}
            </div>
            {n.blocks?.[0]?.text && (
              <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.75 }}>{n.blocks[0].text}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NOTE DETAIL ──
function MobileNoteDetail({ subjectId, noteId, onBack }) {
  const s = subjectBy(subjectId);
  const builtIn = notesForSubject(subjectId) || [];
  const store = useNbStore();
  const userNotes = store.notesFor(subjectId) || [];
  const note = [...userNotes, ...builtIn].find(n => n.id === noteId);
  if (!note) return <div style={{ padding: 32, textAlign: "center", color: "var(--ink-3)" }}>Note not found.</div>;
  const override = nbGetNoteOverride(noteId);
  const blocks = (override?.blocks || note.blocks || []);

  return (
    <div>
      <MobileHeader title={note.title} subtitle={`${s?.name || ""} · ${note.when}`} onBack={onBack} />
      <div style={{ padding: "16px 20px 32px" }}>
        {note.tags?.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {note.tags.map(t => <span key={t} style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 3, padding: "2px 8px", color: "var(--ink-3)" }}>{t}</span>)}
          </div>
        )}
        {blocks.map((b, i) => {
          if (b.type === "h1") return <h2 key={i} style={{ fontFamily: "var(--f-display)", fontSize: 24, fontWeight: 400, margin: "20px 0 8px", letterSpacing: "-0.01em" }}>{b.text}</h2>;
          if (b.type === "h2") return <h3 key={i} style={{ fontFamily: "var(--f-display)", fontSize: 19, fontWeight: 400, margin: "16px 0 6px" }}>{b.text}</h3>;
          if (b.type === "ul") return <li key={i} style={{ fontSize: 15, lineHeight: 1.7, marginLeft: 16, marginBottom: 4 }}>{b.text}</li>;
          if (b.type === "ol") return <li key={i} style={{ fontSize: 15, lineHeight: 1.7, marginLeft: 16, marginBottom: 4 }}>{b.text}</li>;
          if (b.type === "blockquote") return <blockquote key={i} style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 14, margin: "12px 0", color: "var(--ink-2)", fontSize: 15, lineHeight: 1.7 }}>{b.text}</blockquote>;
          if (b.type === "code") return <pre key={i} style={{ background: "var(--bg-2)", borderRadius: 8, padding: "10px 14px", fontFamily: "var(--f-mono)", fontSize: 12.5, overflow: "auto", margin: "10px 0" }}>{b.text}</pre>;
          return <p key={i} style={{ fontSize: 15.5, lineHeight: 1.75, margin: "0 0 10px", color: b.text ? "var(--ink)" : undefined }}>{b.text || " "}</p>;
        })}
      </div>
    </div>
  );
}

// ── STUDY ──
function MobileStudy({ push }) {
  const store = useNbStore();
  const quizzes = [...QUIZZES_UPCOMING, ...store.notesFor ? [] : []];
  const customDecks = nbGetCustomDecks();
  const userQuizzes = nbGetQuizzes();

  return (
    <div>
      <MobileHeader title="Study" subtitle="Quizzes & flashcards" />
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Upcoming quizzes */}
        {QUIZZES_UPCOMING.length > 0 && (
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Upcoming quizzes</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {QUIZZES_UPCOMING.map((q) => {
                const s = subjectBy(q.subject);
                return (
                  <div key={q.id} onClick={() => push({ type: "quiz-take", quiz: q })}
                    style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderLeft: `3px solid ${s?.color || "var(--accent)"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{s?.short} · {q.when}</div>
                      <div style={{ fontFamily: "var(--f-display)", fontSize: 17 }}>{q.title}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>{q.cards?.length || 0} cards</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom decks */}
        {customDecks.length > 0 && (
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Flashcard decks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {customDecks.map((d) => (
                <div key={d.id} onClick={() => push({ type: "quiz-take", quiz: { title: d.title, cards: d.cards } })}
                  style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 17 }}>{d.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>{d.cards?.length || 0} cards</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {QUIZZES_UPCOMING.length === 0 && customDecks.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 18 }}>No quizzes or decks yet.</div>
        )}
      </div>
    </div>
  );
}

// ── QUIZ TAKE (mobile flashcard) ──
function MobileQuizTake({ quiz, onBack }) {
  const cards = quiz.cards || [];
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [results, setResults] = React.useState([]); // "got" | "missed"
  const done = idx >= cards.length;
  const card = cards[idx];

  const answer = (r) => {
    setResults((prev) => [...prev, r]);
    setFlipped(false);
    setIdx((i) => i + 1);
  };

  if (cards.length === 0) return (
    <div>
      <MobileHeader title={quiz.title} onBack={onBack} />
      <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 18 }}>No cards in this deck.</div>
    </div>
  );

  if (done) {
    const got = results.filter(r => r === "got").length;
    return (
      <div>
        <MobileHeader title="Results" onBack={onBack} />
        <div style={{ padding: "32px 20px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 72, lineHeight: 1 }}>{Math.round(got / cards.length * 100)}%</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 13, color: "var(--ink-3)", marginTop: 8 }}>{got} of {cards.length} correct</div>
          <button onClick={() => { setIdx(0); setFlipped(false); setResults([]); }}
            style={{ marginTop: 32, background: "var(--ink)", color: "var(--bg)", border: 0, borderRadius: 12, padding: "14px 28px", fontFamily: "var(--f-mono)", fontSize: 13, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MobileHeader title={quiz.title} subtitle={`${idx + 1} of ${cards.length}`} onBack={onBack} />
      {/* Progress bar */}
      <div style={{ height: 3, background: "var(--hairline)" }}>
        <div style={{ height: "100%", background: "var(--accent)", width: `${(idx / cards.length) * 100}%`, transition: "width 0.3s" }} />
      </div>
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Card */}
        <div onClick={() => setFlipped(f => !f)}
          style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 20, padding: "40px 24px", minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            {flipped ? "Answer" : "Question"}
          </div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.4 }}>
            {flipped ? card.back : card.front}
          </div>
          {!flipped && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 24 }}>Tap to reveal</div>}
        </div>
        {/* Answer buttons */}
        {flipped && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button onClick={() => answer("missed")}
              style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", border: "1px solid var(--accent)", borderRadius: 14, padding: "16px", fontFamily: "var(--f-mono)", fontSize: 13, cursor: "pointer" }}>
              ✕ Missed
            </button>
            <button onClick={() => answer("got")}
              style={{ background: "var(--done-soft)", color: "var(--done)", border: "1px solid var(--done)", borderRadius: 14, padding: "16px", fontFamily: "var(--f-mono)", fontSize: 13, cursor: "pointer" }}>
              ✓ Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MORE ──
function MobileMore({ push }) {
  const fbUser = useFbUser();
  const profile = React.useMemo(() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } }, []);
  const displayName = fbUser ? fbUser.displayName : (profile?.name || "Student");

  const handleSignIn = () => {
    if (!window.__fbAuth || !window.__fbGoogleProvider) return;
    const provider = new window.__fbGoogleProvider();
    window.__fbAuth.signInWithPopup(provider).catch(console.error);
  };
  const handleSignOut = () => window.__fbAuth?.signOut();

  const rows = [
    { label: "Grades", icon: "★", onPress: () => push({ type: "grades" }) },
    { label: "Schedule", icon: "📅", onPress: () => push({ type: "schedule" }) },
  ];

  return (
    <div>
      <MobileHeader title="More" />
      <div style={{ padding: "16px" }}>
        {/* Profile card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 16, padding: "18px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
          {fbUser?.photoURL
            ? <img src={fbUser.photoURL} alt="" style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid var(--hairline)" }} />
            : <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-soft)", display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontSize: 22, color: "var(--accent-ink)" }}>{displayName.charAt(0).toUpperCase()}</div>
          }
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>{displayName}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
              {profile?.grade ? (profile.grade.charAt(0).toUpperCase() + profile.grade.slice(1)) : ""}
              {fbUser ? " · Synced" : " · Local only"}
            </div>
          </div>
        </div>

        {/* Nav rows */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
          {rows.map(({ label, icon, onPress }, i) => (
            <div key={label} onClick={onPress} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", borderBottom: i < rows.length - 1 ? "1px solid var(--hairline)" : "none", cursor: "pointer" }}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</span>
              <span style={{ flex: 1, fontSize: 15 }}>{label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
            </div>
          ))}
        </div>

        {/* Auth */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 16, overflow: "hidden" }}>
          {fbUser ? (
            <div onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", cursor: "pointer", color: "var(--accent)" }}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>↩</span>
              <span style={{ flex: 1, fontSize: 15 }}>Sign out</span>
            </div>
          ) : (
            <div onClick={handleSignIn} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", cursor: "pointer" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span style={{ flex: 1, fontSize: 15 }}>Sign in with Google</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── GRADES (mobile) ──
function MobileGrades({ onBack }) {
  const grades = nbGetPref("grades", {});
  const entriesFor = (sid) => grades[sid] || [];
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
    return p >= 0.60 ? "D" : "F";
  };
  const gradeColor = (p) => p >= 0.90 ? "var(--done)" : p >= 0.80 ? "var(--info)" : p >= 0.70 ? "var(--ochre)" : "var(--accent)";

  return (
    <div>
      <MobileHeader title="Grades" subtitle="This term" onBack={onBack} />
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {SUBJECTS.map((s) => {
          const avg = avgFor(s.id);
          const entries = entriesFor(s.id);
          return (
            <div key={s.id} style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 12 }}>
                <div style={{ width: 4, height: 44, background: s.color, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 18 }}>{s.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                    {entries.length > 0 ? `${entries.length} score${entries.length !== 1 ? "s" : ""}` : "No scores yet"}
                  </div>
                  {avg !== null && (
                    <div style={{ height: 4, background: "var(--hairline)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${avg * 100}%`, background: gradeColor(avg), borderRadius: 2, transition: "width 0.5s" }} />
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  {avg !== null ? (
                    <>
                      <div style={{ fontFamily: "var(--f-display)", fontSize: 32, color: gradeColor(avg), lineHeight: 1 }}>{toLetterGrade(avg)}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{Math.round(avg * 100)}%</div>
                    </>
                  ) : <div style={{ fontFamily: "var(--f-display)", fontSize: 28, color: "var(--hairline)", fontStyle: "italic" }}>—</div>}
                </div>
              </div>
              {entries.length > 0 && (
                <div style={{ borderTop: "1px solid var(--hairline)", padding: "10px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {entries.map((e) => {
                    const ep = e.score / e.total;
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{e.score}/{e.total}</div>
                        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: gradeColor(ep), minWidth: 36, textAlign: "right" }}>{Math.round(ep * 100)}%</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SCHEDULE (mobile) ──
function MobileSchedule({ onBack }) {
  const sched = nbGetSchedule();
  const periods = sched?.periods || [];
  const now = new Date();
  const timeStr = (t) => t || "";

  return (
    <div>
      <MobileHeader title="Schedule" subtitle={now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} onBack={onBack} />
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {periods.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 18 }}>No schedule set.</div>
        )}
        {periods.map((p, i) => {
          const s = p.subject ? subjectBy(p.subject) : null;
          const isEmpty = !p.name || p.name === "Free";
          return (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderLeft: s ? `3px solid ${s.color}` : "3px solid var(--hairline)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, opacity: isEmpty ? 0.5 : 1 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", minWidth: 60 }}>{p.start || `P${i + 1}`}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: isEmpty ? "var(--ink-3)" : "var(--ink)" }}>{p.name || "Free"}</div>
                {p.room && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>Room {p.room}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { MobileApp });
