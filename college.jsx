// College Prep page — SAT/ACT tracker, AP Exam countdown, target schools

// AP Exam dates (College Board publishes fixed windows — 2025 dates)
const AP_EXAM_DATES_2025 = {
  "ap-lit":     { name: "AP Lit & Comp",       date: "2025-05-07", code: "ENG" },
  "ap-bio":     { name: "AP Biology",           date: "2025-05-12", code: "BIO" },
  "ap-chem":    { name: "AP Chemistry",         date: "2025-05-08", code: "CHEM" },
  "ap-calc-ab": { name: "AP Calculus AB",       date: "2025-05-05", code: "CALC" },
  "ap-calc-bc": { name: "AP Calculus BC",       date: "2025-05-05", code: "CALC" },
  "ap-stats":   { name: "AP Statistics",        date: "2025-05-16", code: "STAT" },
  "ap-physics": { name: "AP Physics",           date: "2025-05-13", code: "PHYS" },
  "ap-us-hist": { name: "AP US History",        date: "2025-05-09", code: "HIST" },
  "ap-world":   { name: "AP World History",     date: "2025-05-15", code: "HIST" },
  "ap-gov":     { name: "AP Gov & Politics",    date: "2025-05-06", code: "GOV"  },
  "ap-econ":    { name: "AP Microeconomics",    date: "2025-05-14", code: "ECON" },
  "ap-spanish": { name: "AP Spanish Lang",      date: "2025-05-14", code: "ESP"  },
  "ap-french":  { name: "AP French Lang",       date: "2025-05-13", code: "FRA"  },
  "ap-cs-a":    { name: "AP Computer Science A",date: "2025-05-07", code: "CS"   },
  "ap-psych":   { name: "AP Psychology",        date: "2025-05-16", code: "PSYC" },
  "ap-envsci":  { name: "AP Env Science",       date: "2025-05-02", code: "ENV"  },
  "alg2":       { name: "SAT / ACT prep",       date: null, code: "MATH" }, // no AP for alg2
  "us-hist":    { name: "AP US History",        date: "2025-05-09", code: "HIST" },
  "spanish-3":  { name: "AP Spanish Lang",      date: "2025-05-14", code: "ESP"  },
  "chem":       { name: "AP Chemistry",         date: "2025-05-08", code: "CHEM" },
};

// SAT test dates 2024-2025
const SAT_TEST_DATES = [
  { date: "2025-03-08", reg: "2025-02-21", label: "Mar 8, 2025" },
  { date: "2025-05-03", reg: "2025-04-18", label: "May 3, 2025" },
  { date: "2025-06-07", reg: "2025-05-22", label: "Jun 7, 2025" },
  { date: "2025-08-23", reg: "2025-08-08", label: "Aug 23, 2025" },
  { date: "2025-10-04", reg: "2025-09-19", label: "Oct 4, 2025" },
  { date: "2025-11-01", reg: "2025-10-17", label: "Nov 1, 2025" },
];

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function getApSubjects() {
  // Match user's subjects against known AP exam dates
  return SUBJECTS
    .map(s => {
      // Try exact ID match first, then fuzzy match on name
      let exam = AP_EXAM_DATES_2025[s.id];
      if (!exam) {
        const lname = (s.name || "").toLowerCase();
        if (lname.includes("ap ") || lname.includes("ap-")) {
          Object.entries(AP_EXAM_DATES_2025).forEach(([k, v]) => {
            if (lname.includes(v.code.toLowerCase()) || lname.includes(k.replace("ap-",""))) exam = v;
          });
        }
      }
      return exam ? { subject: s, exam } : null;
    })
    .filter(Boolean)
    .filter(x => x.exam.date)
    .sort((a, b) => new Date(a.exam.date) - new Date(b.exam.date));
}

// ── AP Countdown widget ──────────────────────────────────────────────────────
function APExamCountdown() {
  const apSubjects = getApSubjects();

  if (apSubjects.length === 0) {
    return (
      <div className="sn-card" style={{ padding: 24 }}>
        <div className="sn-card-title">AP EXAM COUNTDOWN</div>
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--f-mono)", fontSize: 12 }}>
          No AP subjects detected. Add AP courses to your subjects to see countdown.
        </div>
      </div>
    );
  }

  return (
    <div className="sn-card">
      <div className="sn-card-title">AP EXAM COUNTDOWN <span className="num">{apSubjects.length}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
        {apSubjects.map(({ subject, exam }) => {
          const days = daysUntil(exam.date);
          const urgent = days <= 14;
          const soon = days <= 30;
          const color = urgent ? "var(--danger)" : soon ? "var(--accent)" : "var(--ink-2)";
          return (
            <div key={subject.id} style={{
              background: "var(--bg-2)", borderRadius: 6,
              padding: "12px 14px", border: `1px solid var(--hairline)`,
              borderLeft: `3px solid ${subject.color}`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                {exam.code}
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: days < 0 ? 14 : 32, lineHeight: 1, color, fontWeight: 400, marginBottom: 2 }}>
                {days < 0 ? "Done ✓" : days === 0 ? "Today!" : `${days}`}
              </div>
              {days >= 0 && <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>day{days !== 1 ? "s" : ""} away</div>}
              <div style={{ fontFamily: "var(--f-ui)", fontSize: 11.5, color: "var(--ink-2)", marginTop: 6, fontWeight: 500 }}>{subject.short}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>
                {new Date(exam.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SAT Score Tracker ────────────────────────────────────────────────────────
function SATTracker() {
  const [college, setCollege] = React.useState(() => nbGetCollegeData());
  const [editSAT, setEditSAT] = React.useState(false);
  const [editACT, setEditACT] = React.useState(false);
  const [satDraft, setSatDraft] = React.useState({ ebrw: "", math: "" });
  const [actDraft, setActDraft] = React.useState({ composite: "" });

  const refresh = () => setCollege(nbGetCollegeData());

  React.useEffect(() => {
    window.addEventListener("nbStoreChange", refresh);
    return () => window.removeEventListener("nbStoreChange", refresh);
  }, []);

  const sat = college.sat || {};
  const act = college.act || {};
  const satTotal = sat.ebrw && sat.math ? parseInt(sat.ebrw) + parseInt(sat.math) : null;

  const saveSAT = () => {
    const ebrw = Math.min(800, Math.max(200, parseInt(satDraft.ebrw) || 0));
    const math = Math.min(800, Math.max(200, parseInt(satDraft.math) || 0));
    const history = [...(sat.history || []), { ebrw, math, total: ebrw + math, date: new Date().toLocaleDateString() }];
    nbSetCollegeData({ sat: { ...sat, ebrw, math, history } });
    setEditSAT(false);
  };
  const saveACT = () => {
    const composite = Math.min(36, Math.max(1, parseInt(actDraft.composite) || 0));
    const history = [...(act.history || []), { composite, date: new Date().toLocaleDateString() }];
    nbSetCollegeData({ act: { ...act, composite, history } });
    setEditACT(false);
  };

  const nextSAT = SAT_TEST_DATES.find(d => daysUntil(d.date) > 0);

  return (
    <div className="sn-card">
      <div className="sn-card-title">SAT / ACT SCORES</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* SAT */}
        <div style={{ background: "var(--bg-2)", borderRadius: 6, padding: 16, border: "1px solid var(--hairline)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>SAT</span>
            <button className="sn-btn ghost" style={{ fontSize: 10, padding: "2px 7px" }} onClick={() => { setSatDraft({ ebrw: sat.ebrw || "", math: sat.math || "" }); setEditSAT(true); }}>
              {satTotal ? "Update" : "+ Add score"}
            </button>
          </div>
          {editSAT ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input className="sn-input" placeholder="EBRW (200–800)" value={satDraft.ebrw}
                onChange={e => setSatDraft(d => ({ ...d, ebrw: e.target.value }))}
                style={{ fontSize: 13, padding: "6px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "var(--f-mono)", background: "var(--surface)" }} />
              <input className="sn-input" placeholder="Math (200–800)" value={satDraft.math}
                onChange={e => setSatDraft(d => ({ ...d, math: e.target.value }))}
                style={{ fontSize: 13, padding: "6px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "var(--f-mono)", background: "var(--surface)" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button className="sn-btn primary" style={{ flex: 1, fontSize: 11 }} onClick={saveSAT}>Save</button>
                <button className="sn-btn ghost" style={{ fontSize: 11 }} onClick={() => setEditSAT(false)}>Cancel</button>
              </div>
            </div>
          ) : satTotal ? (
            <>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 42, lineHeight: 1, color: "var(--ink)" }}>{satTotal}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                EBRW {sat.ebrw} · Math {sat.math}
              </div>
              {sat.history && sat.history.length > 1 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginBottom: 4 }}>HISTORY</div>
                  {sat.history.slice(-4).map((h, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-2)", padding: "2px 0" }}>
                      <span>{h.date}</span><span style={{ color: "var(--ink)" }}>{h.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontFamily: "var(--f-display)", fontSize: 28, color: "var(--ink-3)", fontStyle: "italic" }}>—</div>
          )}
          {nextSAT && (
            <div style={{ marginTop: 10, padding: "6px 8px", background: "var(--accent-soft)", borderRadius: 4, fontFamily: "var(--f-mono)", fontSize: 10 }}>
              Next test: {nextSAT.label} · reg by {new Date(nextSAT.reg).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
            </div>
          )}
        </div>

        {/* ACT */}
        <div style={{ background: "var(--bg-2)", borderRadius: 6, padding: 16, border: "1px solid var(--hairline)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>ACT</span>
            <button className="sn-btn ghost" style={{ fontSize: 10, padding: "2px 7px" }} onClick={() => { setActDraft({ composite: act.composite || "" }); setEditACT(true); }}>
              {act.composite ? "Update" : "+ Add score"}
            </button>
          </div>
          {editACT ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input className="sn-input" placeholder="Composite (1–36)" value={actDraft.composite}
                onChange={e => setActDraft(d => ({ ...d, composite: e.target.value }))}
                style={{ fontSize: 13, padding: "6px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontFamily: "var(--f-mono)", background: "var(--surface)" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button className="sn-btn primary" style={{ flex: 1, fontSize: 11 }} onClick={saveACT}>Save</button>
                <button className="sn-btn ghost" style={{ fontSize: 11 }} onClick={() => setEditACT(false)}>Cancel</button>
              </div>
            </div>
          ) : act.composite ? (
            <>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 42, lineHeight: 1, color: "var(--ink)" }}>{act.composite}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>out of 36</div>
              {act.history && act.history.length > 1 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginBottom: 4 }}>HISTORY</div>
                  {act.history.slice(-4).map((h, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-2)", padding: "2px 0" }}>
                      <span>{h.date}</span><span style={{ color: "var(--ink)" }}>{h.composite}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontFamily: "var(--f-display)", fontSize: 28, color: "var(--ink-3)", fontStyle: "italic" }}>—</div>
          )}
          {/* Score range info */}
          <div style={{ marginTop: 10, padding: "6px 8px", background: "var(--bg-2)", borderRadius: 4, fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", border: "1px solid var(--hairline)" }}>
            Top schools avg: 1500+ SAT · 34+ ACT
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GPA Calculator ───────────────────────────────────────────────────────────
function GPACalculator() {
  const [mode, setMode] = React.useState("needed"); // "needed" | "semester"
  const [currentPct, setCurrentPct] = React.useState("");
  const [remainingWeight, setRemainingWeight] = React.useState("");
  const [targetGrade, setTargetGrade] = React.useState("90");
  const [semGrades, setSemGrades] = React.useState(
    SUBJECTS.slice(0, 6).map(s => ({ id: s.id, short: s.short, grade: s.grade, weight: "1", credits: "1" }))
  );

  // "What do I need?" calculator
  const needed = React.useMemo(() => {
    const cur = parseFloat(currentPct);
    const rem = parseFloat(remainingWeight);
    const target = parseFloat(targetGrade);
    if (isNaN(cur) || isNaN(rem) || isNaN(target) || rem <= 0 || rem > 100) return null;
    const earned = (cur / 100) * (100 - rem);
    const needed = ((target / 100 * 100) - earned) / (rem / 100);
    return Math.round(needed * 10) / 10;
  }, [currentPct, remainingWeight, targetGrade]);

  const gradeToGPA = (g) => {
    const m = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0, "P": 3.0, "—": null };
    if (m[g] !== undefined) return m[g];
    const n = parseFloat(g);
    if (!isNaN(n)) return n >= 93 ? 4.0 : n >= 90 ? 3.7 : n >= 87 ? 3.3 : n >= 83 ? 3.0 : n >= 80 ? 2.7 : n >= 77 ? 2.3 : n >= 73 ? 2.0 : n >= 70 ? 1.7 : n >= 60 ? 1.0 : 0;
    return null;
  };

  const semesterGPA = React.useMemo(() => {
    let totalPoints = 0, totalCredits = 0;
    semGrades.forEach(g => {
      const pts = gradeToGPA(g.grade);
      const credits = parseFloat(g.credits) || 1;
      const weight = parseFloat(g.weight) || 1;
      if (pts !== null) { totalPoints += pts * credits * weight; totalCredits += credits * weight; }
    });
    return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : null;
  }, [semGrades]);

  return (
    <div className="sn-card">
      <div className="sn-card-title">GPA CALCULATOR</div>
      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "var(--bg-2)", borderRadius: 5, padding: 3, width: "fit-content" }}>
        {[["needed", "What do I need?"], ["semester", "Semester GPA"]].map(([k, label]) => (
          <button key={k} onClick={() => setMode(k)} style={{
            fontSize: 11.5, padding: "5px 14px", borderRadius: 4, border: "none", cursor: "pointer",
            background: mode === k ? "var(--surface)" : "transparent",
            color: mode === k ? "var(--ink)" : "var(--ink-3)",
            fontFamily: "var(--f-ui)", boxShadow: mode === k ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.18s ease",
          }}>{label}</button>
        ))}
      </div>

      {mode === "needed" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>Current grade %</label>
            <input value={currentPct} onChange={e => setCurrentPct(e.target.value)} placeholder="e.g. 84"
              style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontSize: 14, fontFamily: "var(--f-mono)", background: "var(--surface)" }} />
          </div>
          <div>
            <label style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>Remaining weight %</label>
            <input value={remainingWeight} onChange={e => setRemainingWeight(e.target.value)} placeholder="e.g. 30"
              style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontSize: 14, fontFamily: "var(--f-mono)", background: "var(--surface)" }} />
          </div>
          <div>
            <label style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>Target grade %</label>
            <input value={targetGrade} onChange={e => setTargetGrade(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontSize: 14, fontFamily: "var(--f-mono)", background: "var(--surface)" }} />
          </div>
          <div style={{ paddingBottom: 1 }}>
            {needed !== null && (
              <div style={{
                padding: "8px 14px", borderRadius: 5, background: needed > 100 ? "rgba(179,84,59,0.12)" : needed > 90 ? "rgba(160,120,48,0.12)" : "rgba(107,142,90,0.12)",
                border: `1px solid ${needed > 100 ? "var(--danger)" : needed > 90 ? "var(--accent)" : "var(--done)"}`,
                textAlign: "center", minWidth: 80,
              }}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 28, lineHeight: 1, color: needed > 100 ? "var(--danger)" : needed > 90 ? "var(--accent)" : "var(--done)" }}>
                  {needed > 100 ? "×" : `${needed}%`}
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", marginTop: 2 }}>
                  {needed > 100 ? "Not possible" : "you need"}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 10 }}>
            {semGrades.map((g, i) => (
              <div key={g.id} style={{ display: "grid", gridTemplateColumns: "120px 70px 60px 60px", gap: 8, alignItems: "center", padding: "5px 0", borderBottom: "1px dashed var(--hairline)" }}>
                <div style={{ fontFamily: "var(--f-ui)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.short}</div>
                <input value={g.grade} onChange={e => setSemGrades(gs => gs.map((x,j) => j===i ? {...x, grade: e.target.value} : x))} placeholder="A, B+, 92…"
                  style={{ padding: "4px 7px", border: "1px solid var(--hairline)", borderRadius: 3, fontSize: 12, fontFamily: "var(--f-mono)", background: "var(--surface)", textAlign: "center" }} />
                <input value={g.credits} onChange={e => setSemGrades(gs => gs.map((x,j) => j===i ? {...x, credits: e.target.value} : x))} placeholder="credits"
                  style={{ padding: "4px 7px", border: "1px solid var(--hairline)", borderRadius: 3, fontSize: 12, fontFamily: "var(--f-mono)", background: "var(--surface)", textAlign: "center" }} />
                <input value={g.weight} onChange={e => setSemGrades(gs => gs.map((x,j) => j===i ? {...x, weight: e.target.value} : x))} placeholder="weight"
                  style={{ padding: "4px 7px", border: "1px solid var(--hairline)", borderRadius: 3, fontSize: 12, fontFamily: "var(--f-mono)", background: "var(--surface)", textAlign: "center" }} />
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "120px 70px 60px 60px", gap: 8, padding: "3px 0 0" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}></div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textAlign: "center" }}>GRADE</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textAlign: "center" }}>CREDITS</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textAlign: "center" }}>WEIGHT</div>
            </div>
          </div>
          {semesterGPA !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--accent-soft)", borderRadius: 6, border: "1px solid var(--hairline)" }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 44, lineHeight: 1, color: "var(--accent-ink)" }}>{semesterGPA}</div>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Weighted GPA</div>
                <div style={{ fontFamily: "var(--f-ui)", fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
                  {semesterGPA >= 3.7 ? "Dean's List territory 🎉" : semesterGPA >= 3.3 ? "Strong — keep it up" : semesterGPA >= 3.0 ? "Good standing" : "Room to grow"}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Target Schools ───────────────────────────────────────────────────────────
function TargetSchools() {
  const [college, setCollege] = React.useState(() => nbGetCollegeData());
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: "", tier: "target", notes: "" });

  const refresh = () => setCollege(nbGetCollegeData());
  React.useEffect(() => {
    window.addEventListener("nbStoreChange", refresh);
    return () => window.removeEventListener("nbStoreChange", refresh);
  }, []);

  const schools = college.schools || [];

  const addSchool = () => {
    if (!draft.name.trim()) return;
    const id = "school-" + Date.now().toString(36);
    nbSetCollegeData({ schools: [...schools, { ...draft, id }] });
    setDraft({ name: "", tier: "target", notes: "" });
    setAdding(false);
    nbAddXP(10, "Added a target school");
  };

  const removeSchool = (id) => nbSetCollegeData({ schools: schools.filter(s => s.id !== id) });

  const TIER_COLORS = { reach: "var(--danger)", target: "var(--accent)", safety: "var(--done)" };
  const TIER_LABELS = { reach: "Reach", target: "Target", safety: "Safety" };

  return (
    <div className="sn-card">
      <div className="sn-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>TARGET SCHOOLS <span className="num">{schools.length}</span></span>
        <button className="sn-btn ghost" style={{ fontSize: 10, padding: "2px 8px" }} onClick={() => setAdding(a => !a)}>
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>

      {adding && (
        <div style={{ background: "var(--bg-2)", borderRadius: 6, padding: 14, marginBottom: 14, border: "1px solid var(--hairline)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginBottom: 8 }}>
            <input autoFocus value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="School name" onKeyDown={e => e.key === "Enter" && addSchool()}
              style={{ padding: "7px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontSize: 13, fontFamily: "var(--f-ui)", background: "var(--surface)" }} />
            <select value={draft.tier} onChange={e => setDraft(d => ({ ...d, tier: e.target.value }))}
              style={{ padding: "7px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontSize: 12, fontFamily: "var(--f-mono)", background: "var(--surface)", cursor: "pointer" }}>
              <option value="reach">Reach</option>
              <option value="target">Target</option>
              <option value="safety">Safety</option>
            </select>
          </div>
          <input value={draft.notes} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} placeholder="Notes (optional)"
            style={{ width: "100%", padding: "6px 10px", border: "1px solid var(--hairline)", borderRadius: 4, fontSize: 12, fontFamily: "var(--f-ui)", background: "var(--surface)", marginBottom: 8 }} />
          <button className="sn-btn primary" style={{ fontSize: 12 }} onClick={addSchool}>Add school</button>
        </div>
      )}

      {schools.length === 0 ? (
        <div style={{ color: "var(--ink-3)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 15, padding: "8px 0" }}>
          Your college list is empty — add your reach, target, and safety schools.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["reach", "target", "safety"].map(tier => {
            const group = schools.filter(s => s.tier === tier);
            if (group.length === 0) return null;
            return (
              <div key={tier}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: TIER_COLORS[tier], textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                  {TIER_LABELS[tier]} ({group.length})
                </div>
                {group.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "var(--bg-2)", borderRadius: 5, marginBottom: 4, border: "1px solid var(--hairline)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: 50, background: TIER_COLORS[tier], flexShrink: 0 }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                      {s.notes && <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--f-ui)" }}>{s.notes}</div>}
                    </div>
                    <button onClick={() => removeSchool(s.id)} style={{ background: "transparent", border: "none", color: "var(--ink-3)", cursor: "pointer", fontSize: 14, padding: "0 2px", lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main College Page ────────────────────────────────────────────────────────
function CollegeContent() {
  const profile = React.useMemo(() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } }, []);
  const grade = profile ? profile.grade : "junior";
  const isJunior = grade === "junior" || grade === "11";

  return (
    <div>
      <div className="sn-pageheader">
        <div className="titleblock">
          <div className="eyebrow">College Prep</div>
          <h1>Your <em>College</em> Plan</h1>
          <div className="meta">
            {isJunior ? "Junior year — this is the year that counts most. Stay ahead of deadlines." : "Track your scores, schools, and AP exams."}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <APExamCountdown />
        <SATTracker />
        <GPACalculator />
        <TargetSchools />
      </div>
    </div>
  );
}

Object.assign(window, {
  CollegeContent, APExamCountdown, GPACalculator, SATTracker, TargetSchools,
  daysUntil, getApSubjects, AP_EXAM_DATES_2025,
});
