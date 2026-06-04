// Subject Overview — per-class dashboard

function SubjectTodayWidget({ subject: s, onOpenNotes, onOpenQuiz }) {
  const sched = nbGetSchedule();
  const now = new Date();
  const todayMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()];

  // Find this subject in today's schedule
  const todayPeriod = sched.find((p) => p.subject === s.id);
  const subjectQuiz = QUIZZES_UPCOMING.find((q) => q.subject === s.id);
  const todayHW = [...HOMEWORK, ...nbGetHomework()].filter((h) => h.subject === s.id && !h.done && (h.due === "Tonight" || h.due === "Tomorrow"));

  // Is this class in session, past, or upcoming?
  let sessionStatus = null;
  if (todayPeriod) {
    const start = schedToMinutes(todayPeriod.time);
    const end = todayPeriod.end ? schedToMinutes(todayPeriod.end) : start + 50;
    if (todayMinutes >= start && todayMinutes < end) sessionStatus = "now";
    else if (todayMinutes < start) sessionStatus = "upcoming";
    else sessionStatus = "done";
  }

  const isEmpty = !todayPeriod && todayHW.length === 0 && !subjectQuiz;
  if (isEmpty) return null;

  return (
    <div className="sn-card" style={{ marginBottom: 22, borderLeft: `4px solid ${s.color}`, display: "flex", gap: 20, alignItems: "stretch", background: sessionStatus === "now" ? s.color + "0d" : undefined }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--ink-3)", marginBottom: 8 }}>
          {todayDayName} · Today's {s.short} snapshot
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {todayPeriod && (
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 2 }}>Class</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 18, lineHeight: 1 }}>
                {todayPeriod.time}
                {sessionStatus === "now" && <span style={{ marginLeft: 8, fontFamily: "var(--f-mono)", fontSize: 10, color: s.color, textTransform: "uppercase" }}>· IN SESSION</span>}
                {sessionStatus === "upcoming" && <span style={{ marginLeft: 8, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase" }}>· upcoming</span>}
                {sessionStatus === "done" && <span style={{ marginLeft: 8, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase" }}>· done for today</span>}
              </div>
              {todayPeriod.note && <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>{todayPeriod.note}</div>}
            </div>
          )}
          {todayHW.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 2 }}>Due</div>
              {todayHW.slice(0, 2).map((h) => (
                <div key={h.id} style={{ fontFamily: "var(--f-display)", fontSize: 15, lineHeight: 1.3 }}>
                  {h.title} <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: h.urgent ? "var(--accent)" : "var(--ink-3)" }}>{h.due}</span>
                </div>
              ))}
            </div>
          )}
          {subjectQuiz && (
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 2 }}>Quiz</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 15 }}>{subjectQuiz.when} · {subjectQuiz.title.slice(0, 30)}</div>
              <ConfidenceMeter value={subjectQuiz.confidence} />
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
        <button className="sn-btn ghost" onClick={() => onOpenNotes(s.id)} style={{ fontSize: 12 }}>Open notes</button>
        {subjectQuiz && <button className="sn-btn ghost" onClick={() => onOpenQuiz("mcq")} style={{ fontSize: 12 }}>Practice →</button>}
      </div>
    </div>
  );
}

function SubjectOverviewContent({ subjectId, onOpenNotes, onOpenQuiz, onOpenHomework }) {
  const s = subjectBy(subjectId);
  if (!s) return null;
  const subjectHW = HOMEWORK.filter((h) => h.subject === subjectId);
  const openHW = subjectHW.filter((h) => !h.done);
  const subjectQuiz = QUIZZES_UPCOMING.find((q) => q.subject === subjectId);
  const subjectNotes = notesForSubject(subjectId).slice(0, 4);

  return (
    <>
      <SubjectTodayWidget subject={s} onOpenNotes={onOpenNotes} onOpenQuiz={onOpenQuiz} />
      <div style={{ display: "flex", gap: 18, marginBottom: 24, alignItems: "flex-start" }}>
        <div style={{ width: 8, alignSelf: "stretch", background: s.color, borderRadius: 2, minHeight: 90 }}></div>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {s.short} · Period {(SUBJECTS.indexOf(s) % 7) + 1} · Room {s.room} · {s.teacher}
          </div>
          <h1 className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 44, lineHeight: 1.05, margin: "6px 0 6px", letterSpacing: "-0.015em" }}>
            {s.name}
          </h1>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
            Unit 3 · Cellular Energetics · {s.notes} notes · {subjectHW.length} homework items · {s.quizzes} quizzes this term
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sn-btn ghost" onClick={() => window.dispatchEvent(new CustomEvent("toast", { detail: `${s.name} · Period ${(SUBJECTS.indexOf(s) % 7) + 1} · Room ${s.room} · ${s.teacher}` }))}>Class info</button>
          <button className="sn-btn" onClick={() => onOpenNotes(subjectId)}>Open notes →</button>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div className="sn-card">
          <div className="sn-card-title"><span>Grade · this term</span></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 52, lineHeight: 1, color: "var(--ink)" }}>{s.grade}</div>
            <SubjectSparkline color={s.color} />
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
            <span style={{ color: "var(--done)" }}>↑ 2.4 pts</span> · since last report
          </div>
        </div>
        <div className="sn-card">
          <div className="sn-card-title"><span>Open work</span></div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 38, lineHeight: 1, color: openHW.length > 0 ? "var(--ink)" : "var(--ink-3)" }}>{openHW.length}</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>{openHW.filter(h => h.urgent).length} URGENT</div>
        </div>
        <div className="sn-card">
          <div className="sn-card-title"><span>Next class</span></div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 28, lineHeight: 1.05 }}>Wed</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>10:10 AM · ROOM {s.room.toUpperCase()}</div>
        </div>
        <div className="sn-card">
          <div className="sn-card-title"><span>Quiz confidence</span></div>
          {subjectQuiz ? (
            <>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 28 }}>{Math.round(subjectQuiz.confidence * 100)}%</div>
              <ConfidenceMeter value={subjectQuiz.confidence} />
            </>
          ) : (
            <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--ink-3)" }}>no quiz scheduled</div>
          )}
        </div>
      </div>

      {/* 2-col body */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        {/* Left: notes + homework */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="sn-card">
            <h3 className="sn-card-title">
              <span>Recent notes</span>
              <a className="mono" onClick={() => onOpenNotes(subjectId)} style={{ color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none", cursor: "pointer" }}>ALL NOTES →</a>
            </h3>
            {subjectNotes.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {subjectNotes.map((n) => (
                  <div key={n.id} onClick={() => onOpenNotes(subjectId, n.id)} style={{ paddingBottom: 10, borderBottom: "1px dashed var(--hairline)", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontFamily: "var(--f-display)", fontSize: 17 }}>{n.title}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{n.when}</div>
                    </div>
                    {n.blocks && n.blocks[0] && (
                      <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {(n.blocks.find((b) => b.type === "p") || n.blocks[0]).text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 15, padding: "8px 0" }}>
                No notes yet for {s.short}. Click "Open notes" to create one.
              </div>
            )}
          </div>

          <div className="sn-card">
            <h3 className="sn-card-title">
              <span>Homework</span>
              <a className="mono" onClick={() => onOpenHomework()} style={{ color: "var(--ink-2)", fontSize: 10.5, textDecoration: "none", cursor: "pointer" }}>ALL →</a>
            </h3>
            {subjectHW.length > 0 ? (
              <HomeworkList items={subjectHW} compact />
            ) : (
              <div style={{ padding: "12px 0", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 15 }}>No open homework for {s.short}. ✓</div>
            )}
          </div>
        </div>

        {/* Right: quiz + flashcards + people */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {subjectQuiz && (
            <div className="sn-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <h3 className="sn-card-title"><span>Upcoming quiz</span></h3>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.2 }}>{subjectQuiz.title}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{subjectQuiz.when.toUpperCase()} · {subjectQuiz.length}</div>
              <div style={{ marginTop: 12 }}>
                <ConfidenceMeter value={subjectQuiz.confidence} />
              </div>
              <button className="sn-btn primary" onClick={() => onOpenQuiz("mcq")} style={{ width: "100%", marginTop: 14, justifyContent: "center" }}>Practice now →</button>
            </div>
          )}

          <div className="sn-card">
            <h3 className="sn-card-title"><span>Flashcard decks</span></h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(() => {
                const subjectDecks = Object.entries(DECKS).filter(([_, d]) => d.subject === s.id);
                if (subjectDecks.length === 0) {
                  return (
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14, padding: "8px 0" }}>
                      No decks yet for {s.short}. Click + to create one.
                    </div>
                  );
                }
                // Synthesize a "due" count per deck (consistent per-deck so it doesn't shuffle)
                const dueFor = (id) => Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 9;
                return subjectDecks.map(([deckId, d], i) => (
                  <div key={deckId} onClick={() => onOpenQuiz("flashcard", deckId)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < subjectDecks.length - 1 ? "1px dashed var(--hairline)" : "none", cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: 13.5 }}>{d.title}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{d.cards.length} CARDS · {dueFor(deckId)} DUE</div>
                    </div>
                    <span style={{ color: "var(--ink-3)" }}>→</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="sn-card paper">
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Margin note · pinned</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-2)", fontSize: 15, lineHeight: 1.4, borderLeft: "2px solid var(--accent)", paddingLeft: 12 }}>
              {s.id === "ap-bio" && "Lab report needs three graphs (not two) + outliers discussion."}
              {s.id === "ap-lit" && "Sethe's milk: nourishment AND theft. Use for the body paragraph on motherhood."}
              {s.id === "alg2" && "When in doubt on double-angle, substitute cos²θ = 1 − sin²θ and see what cancels."}
              {!["ap-bio", "ap-lit", "alg2"].includes(s.id) && "Tap any note to pin a margin annotation here for next class."}
            </div>
            <div style={{ marginTop: 10, fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>— Tue 10:24 · class</div>
          </div>
        </div>
      </div>
    </>
  );
}

function SubjectSparkline({ color }) {
  const pts = [78, 82, 80, 85, 84, 87, 90, 89];
  const w = 120, h = 36;
  const max = 100, min = 70;
  const path = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * w;
    const y = h - ((p - min) / (max - min)) * h;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
  const lastY = h - ((pts[pts.length - 1] - min) / (max - min)) * h;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
      <circle cx={w} cy={lastY} r="3.5" fill={color} />
    </svg>
  );
}

function NoteSamplesForSubject({ subjectId, onOpen }) {
  const placeholders = {
    "ap-lit": ["Beloved — motifs of memory", "The Great Gatsby — green light", "Toni Morrison — voice & rhythm"],
    "alg2": ["Double-angle identities", "Law of sines", "Inverse trig functions"],
    "us-hist": ["Federalist No. 10 — factions", "Causes of the Civil War", "Reconstruction amendments"],
    "spanish-3": ["Pretérito vs Imperfecto", "Subjuntivo — when to use", "Vocabulario Unidad 6"],
    "chem": ["Molarity & dilutions", "Periodic trends", "Stoichiometry"],
    "studio-art": ["Charcoal techniques", "Composition rules", "Color theory basics"],
    "phys-ed": ["Workout log — May", "Mile time tracking"],
  };
  const list = placeholders[subjectId] || ["Notes will appear here"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.map((t, i) => (
        <div key={i} onClick={onOpen} style={{ paddingBottom: 10, borderBottom: i < list.length - 1 ? "1px dashed var(--hairline)" : "none", cursor: "pointer" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 17 }}>{t}</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>{["yesterday", "Mon", "last week", "Apr 30", "Apr 28"][i % 5]}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { SubjectOverviewContent });
