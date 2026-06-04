// Onboarding wizard — shown on first launch, saves profile to localStorage

const ONBOARDING_KEY = "nb-profile-v1";

const PRESET_COLORS = [
  "#c8694a", "#6b8e5a", "#5a7a99", "#b58a3b",
  "#7a4e6e", "#3f7d8a", "#b3543b", "#9a9082",
];

function makeSubjectId(name) {
  return "u-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 5);
}

function makeShort(name) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 6);
  if (words.length === 2) return words[0].slice(0, 4) + " " + words[1].slice(0, 4);
  // AP / Honors prefix
  if (["AP", "Honors", "IB", "CP"].includes(words[0])) return words[0] + " " + words[1].slice(0, 4);
  return words.map((w) => w[0]).join("").toUpperCase().slice(0, 5);
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

function Onboarding({ onComplete }) {
  const [step, setStep] = React.useState(0); // 0 = account check, 1-3 = setup

  const [signingIn, setSigningIn] = React.useState(false);
  const [signInError, setSignInError] = React.useState("");
  const [googleName, setGoogleName] = React.useState("");

  // After Google sign-in, wait for Firebase to finish loading cloud data,
  // then either restore the saved profile or continue to setup steps.
  React.useEffect(() => {
    if (!signingIn) return;
    const onLoaded = (e) => {
      if (e.detail.hasCloudProfile) {
        // Profile restored to localStorage — call onComplete (page reloads, picks it up)
        const restored = (() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } })();
        if (restored) { onComplete(restored); return; }
      }
      // No saved profile in cloud → go to setup steps with name pre-filled from Google
      setSigningIn(false);
      setStep(1);
    };
    window.addEventListener("nbFirebaseLoaded", onLoaded);

    // Fallback: if Firebase doesn't respond in 6 seconds, proceed to setup
    const timeout = setTimeout(() => {
      setSigningIn(false);
      setStep(1);
    }, 6000);

    return () => {
      window.removeEventListener("nbFirebaseLoaded", onLoaded);
      clearTimeout(timeout);
    };
  }, [signingIn]);

  const handleGoogleSignIn = () => {
    setSigningIn(true);
    setSignInError("");
    if (!window.__fbAuth || !window.__fbGoogleProvider) {
      setSignInError("Auth not ready — reload and try again.");
      setSigningIn(false);
      return;
    }
    const provider = new window.__fbGoogleProvider();
    window.__fbAuth.signInWithPopup(provider)
      .then((result) => {
        // Store Google name so step 1 can pre-fill it
        if (result.user?.displayName) setGoogleName(result.user.displayName);
      })
      .catch((e) => {
        setSignInError(e.message || "Sign-in failed");
        setSigningIn(false);
      });
  };

  // Step 1
  const [name, setName] = React.useState("");
  const [grade, setGrade] = React.useState("");

  // Pre-fill name when Google name arrives
  React.useEffect(() => {
    if (googleName && !name) setName(googleName.split(" ")[0]);
  }, [googleName]);

  // Step 2
  const [school, setSchool] = React.useState("");
  const [yearMonth, setYearMonth] = React.useState(8); // September = index 8
  const [yearYear, setYearYear] = React.useState(CURRENT_YEAR);

  // Step 3
  const [subjects, setSubjects] = React.useState([
    { tempId: 1, name: "", color: PRESET_COLORS[0] },
  ]);
  const [colorPicker, setColorPicker] = React.useState(null); // tempId of open picker

  const addSubject = () => {
    if (subjects.length >= 10) return;
    const nextColor = PRESET_COLORS[subjects.length % PRESET_COLORS.length];
    setSubjects((s) => [...s, { tempId: Date.now(), name: "", color: nextColor }]);
  };

  const removeSubject = (tempId) => setSubjects((s) => s.filter((x) => x.tempId !== tempId));

  const updateSubject = (tempId, patch) =>
    setSubjects((s) => s.map((x) => x.tempId === tempId ? { ...x, ...patch } : x));

  const validSubjects = subjects.filter((s) => s.name.trim().length > 0);

  const finish = () => {
    const builtSubjects = validSubjects.map((s) => ({
      id: makeSubjectId(s.name),
      name: s.name.trim(),
      short: makeShort(s.name),
      color: s.color,
      grade: "—",
      teacher: "",
      room: "",
      notes: 0,
      hw: 0,
      quizzes: 0,
    }));

    const profile = {
      name: name.trim(),
      grade,
      school: school.trim(),
      yearStart: { month: yearMonth, year: yearYear },
      subjects: builtSubjects,
      completedAt: Date.now(),
    };

    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(profile));
    onComplete(profile);
  };

  const canNext1 = name.trim().length > 1 && grade;
  const canNext2 = school.trim().length > 0;
  const canFinish = validSubjects.length > 0;

  const stepLabels = ["About you", "Your school", "Your classes"];

  // Roman numeral helper for preview card
  const toRoman = (n) => ["I","II","III","IV","V","VI","VII","VIII","IX","X"][n-1] || n;

  // Notebook preview card — reflects current input state
  const PreviewCard = () => (
    <div style={{
      width: 220, background: "#1c1b19", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 4, padding: "22px 20px 18px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      display: "flex", flexDirection: "column",
    }}>
      <div className="mono" style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>ACADEMIC NOTEBOOK</div>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 28, lineHeight: 1.15, color: "#e8e4dc", fontWeight: 400, fontStyle: "italic", marginBottom: 14 }}>
        {name.trim() ? name.trim() + "'s" : "Julian's"}<br />Notebook
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 14 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {[
          ["READER", name.trim() || "Julian " + "_ ".repeat(3)],
          ["YEAR",   grade ? grade.charAt(0).toUpperCase() + grade.slice(1) : "—"],
          ["SCHOOL", step > 1 && school.trim() ? school.trim() : (step > 1 ? "—" : "✓ next step")],
          ["SUBJECTS", step > 2 ? (validSubjects.length + " added") : "✓ step " + toRoman(3)],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span className="mono" style={{ fontSize: 7.5, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", width: 56, flexShrink: 0 }}>{k}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "var(--f-display)", fontStyle: "italic" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              width: s === step ? 18 : 5, height: 2, borderRadius: 1,
              background: s === step ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
              transition: "width 0.3s, background 0.3s",
            }} />
          ))}
        </div>
      </div>
      <div className="mono" style={{ textAlign: "center", fontSize: 7, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", marginTop: 10 }}>
        STEP {step} OF 3
      </div>
    </div>
  );

  // Shared nav row used in steps 1-3
  const NavRow = ({ canProceed, onBack, onNext, nextLabel = "Next →" }) => (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
      <button onClick={onBack} style={oGhostBtn}>← Back</button>
      <button onClick={onNext} disabled={!canProceed}
        style={{ ...oPrimaryBtn, opacity: canProceed ? 1 : 0.3 }}>{nextLabel}</button>
    </div>
  );

  // ── Step 0 layout (simple centered card, unchanged) ──
  if (step === 0) return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "var(--bg)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--f-ui, Geist, sans-serif)",
    }}>
      <div style={{ position: "absolute", top: 32, left: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--accent)" }}>¶</span>
        <span style={{ fontFamily: "var(--f-display)", fontSize: 18, color: "var(--ink)" }}>Julian's Notebook</span>
      </div>

      <div style={{
        width: "100%", maxWidth: 520,
        background: "var(--surface)", border: "1px solid var(--hairline)",
        borderRadius: 12, padding: "40px 44px",
        boxShadow: "0 24px 60px -16px rgba(20,16,11,0.14)",
      }}>
        <h2 style={{ fontFamily: "var(--f-display)", fontSize: 34, lineHeight: 1.1, margin: "0 0 10px", fontWeight: 400 }}>
          Welcome to <em style={{ color: "var(--accent)" }}>Julian's Notebook.</em>
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 32px", lineHeight: 1.6 }}>
          Do you already have an account? Sign in to sync your notes, homework, and grades instantly.
        </p>

        <button onClick={handleGoogleSignIn} disabled={signingIn} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "13px 20px", borderRadius: 8, marginBottom: 12, cursor: signingIn ? "default" : "pointer",
          border: "1.5px solid var(--hairline)", background: signingIn ? "var(--bg-2)" : "var(--surface)",
          fontFamily: "inherit", fontSize: 14.5, color: "var(--ink)",
          opacity: signingIn ? 0.6 : 1, transition: "opacity 0.15s",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {signingIn ? "Loading your account…" : "Sign in with Google"}
        </button>

        {signInError && (
          <div style={{ fontSize: 11.5, color: "var(--accent)", fontFamily: "var(--f-mono)", marginBottom: 12, padding: "8px 12px", background: "var(--accent-soft)", borderRadius: 6 }}>
            {signInError}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
        </div>

        <button onClick={() => setStep(1)} style={{
          width: "100%", padding: "13px 20px", borderRadius: 8,
          border: "1.5px solid var(--accent)", background: "var(--accent-soft)",
          fontFamily: "inherit", fontSize: 14.5, color: "var(--accent-ink)",
          cursor: "pointer", fontWeight: 500,
        }}>
          Set up a new notebook →
        </button>
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: "var(--ink-3)" }}>
        Sign in to sync across devices, or set up locally for free
      </p>
    </div>
  );

  // ── Steps 1–3: editorial 3-column layout ──
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "#141310",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--f-ui, Geist, sans-serif)",
    }}>
      {/* Top bar */}
      <div className="mono" style={{
        textAlign: "center", padding: "18px 0",
        fontSize: 10, letterSpacing: "0.22em", color: "rgba(255,255,255,0.25)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        — SETTING UP YOUR NOTEBOOK —
      </div>

      {/* Main 3-column area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left: Contents */}
        <div style={{
          width: 180, borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "36px 28px", display: "flex", flexDirection: "column",
        }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", marginBottom: 22 }}>CONTENTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
            {[
              { s: 1, title: "About you", sub: "Name & year" },
              { s: 2, title: "Your school", sub: "School & start date" },
              { s: 3, title: "Your classes", sub: "Add subjects" },
            ].map(({ s, title, sub }) => (
              <div key={s} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                  background: s === step ? "rgba(255,255,255,0.7)" : s < step ? "rgba(255,255,255,0.3)" : "transparent",
                  border: s === step ? "none" : "1px solid rgba(255,255,255,0.2)",
                }} />
                <div>
                  <div style={{ fontSize: 13, color: s === step ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)", fontWeight: s === step ? 500 : 400 }}>{title}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(0)} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontSize: 10.5, color: "rgba(255,255,255,0.25)", fontFamily: "inherit",
            textAlign: "left",
          }}>← back to cover</button>
        </div>

        {/* Center: Preview */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 16, borderRight: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.2)" }}>PREVIEW</div>
          <PreviewCard />
        </div>

        {/* Right: Form */}
        <div style={{
          width: 420, padding: "48px 52px",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
            STEP {step} OF 3 — {stepLabels[step - 1].toUpperCase()}
          </div>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "var(--f-display)", fontSize: 36, lineHeight: 1.1, margin: "0 0 30px", fontWeight: 400, color: "#e8e4dc" }}>
                Let's set up your <em>notebook.</em>
              </h2>

              <OField label="What's your name?" dark>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && canNext1) setStep(2); }}
                  placeholder="e.g. Julian"
                  style={oDarkInput}
                />
              </OField>

              <OField label="What year are you in?" style={{ marginTop: 22 }} dark>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["freshman","Freshman"],["sophomore","Sophomore"],["junior","Junior"],["senior","Senior"]].map(([k,l]) => (
                    <button key={k} onClick={() => setGrade(k)} style={{
                      flex: 1, padding: "10px 4px", borderRadius: 5, fontSize: 12,
                      border: "1px solid " + (grade === k ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"),
                      background: grade === k ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)",
                      color: grade === k ? "#e8e4dc" : "rgba(255,255,255,0.4)",
                      fontFamily: "inherit", cursor: "pointer", fontWeight: grade === k ? 600 : 400,
                      transition: "all 0.15s",
                    }}>{l}</button>
                  ))}
                </div>
              </OField>

              <NavRow canProceed={canNext1} onBack={() => setStep(0)} onNext={() => setStep(2)} />
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "var(--f-display)", fontSize: 36, lineHeight: 1.1, margin: "0 0 30px", fontWeight: 400, color: "#e8e4dc" }}>
                Tell us about your <em>school.</em>
              </h2>

              <OField label="School name" dark>
                <input
                  autoFocus
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Lincoln High School"
                  style={oDarkInput}
                />
              </OField>

              <OField label="When does your school year start?" style={{ marginTop: 22 }} dark>
                <div style={{ display: "flex", gap: 10 }}>
                  <select value={yearMonth} onChange={(e) => setYearMonth(Number(e.target.value))} style={{ ...oDarkInput, flex: 2 }}>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select value={yearYear} onChange={(e) => setYearYear(Number(e.target.value))} style={{ ...oDarkInput, flex: 1 }}>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </OField>

              <NavRow canProceed={canNext2} onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: "var(--f-display)", fontSize: 36, lineHeight: 1.1, margin: "0 0 6px", fontWeight: 400, color: "#e8e4dc" }}>
                What classes are you <em>taking?</em>
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 0 22px", lineHeight: 1.5 }}>
                Add up to 10. You can change these later.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 2 }}>
                {subjects.map((s, i) => (
                  <div key={s.tempId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div onClick={() => setColorPicker(colorPicker === s.tempId ? null : s.tempId)}
                        style={{ width: 28, height: 28, borderRadius: 6, background: s.color, cursor: "pointer", border: "2px solid rgba(0,0,0,0.2)" }} />
                      {colorPicker === s.tempId && (
                        <div style={{
                          position: "absolute", top: 34, left: 0, zIndex: 10,
                          background: "#1c1b19", border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6, padding: 8,
                          display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4,
                          boxShadow: "0 8px 24px -8px rgba(0,0,0,0.6)",
                        }}>
                          {PRESET_COLORS.map((c) => (
                            <div key={c} onClick={() => { updateSubject(s.tempId, { color: c }); setColorPicker(null); }}
                              style={{ width: 22, height: 22, borderRadius: 4, background: c, cursor: "pointer",
                                outline: s.color === c ? "2px solid #e8e4dc" : "none", outlineOffset: 1 }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      value={s.name}
                      onChange={(e) => updateSubject(s.tempId, { name: e.target.value })}
                      placeholder={`Class ${i + 1} (e.g. AP Biology)`}
                      style={{ ...oDarkInput, flex: 1, padding: "7px 10px" }}
                    />
                    {subjects.length > 1 && (
                      <button onClick={() => removeSubject(s.tempId)}
                        style={{ border: 0, background: "transparent", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                    )}
                  </div>
                ))}
              </div>

              {subjects.length < 10 && (
                <button onClick={addSubject} style={{ ...oGhostBtn, marginTop: 10, fontSize: 12, padding: "5px 12px" }}>+ Add another class</button>
              )}

              <NavRow canProceed={canFinish} onBack={() => setStep(2)} onNext={finish} nextLabel="Open my notebook →" />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mono" style={{
        textAlign: "center", padding: "14px 0",
        fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.15)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        ANNO MMXXVI · PRINTED FOR ONE READER
      </div>
    </div>
  );
}

function OField({ label, children, style, dark }) {
  return (
    <div style={style}>
      <div className="mono" style={{
        fontSize: 10, letterSpacing: "0.12em", marginBottom: 7,
        color: dark ? "rgba(255,255,255,0.3)" : "var(--ink-3)",
        textTransform: "uppercase",
      }}>{label}</div>
      {children}
    </div>
  );
}

const oInput = {
  width: "100%", padding: "9px 12px",
  border: "1px solid var(--hairline)", borderRadius: 5,
  fontFamily: "inherit", fontSize: 14, color: "var(--ink)",
  background: "var(--bg)", outline: "none",
  boxSizing: "border-box",
};

const oDarkInput = {
  width: "100%", padding: "10px 14px",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5,
  fontFamily: "inherit", fontSize: 14, color: "#e8e4dc",
  background: "rgba(255,255,255,0.05)", outline: "none",
  boxSizing: "border-box",
};

const oPrimaryBtn = {
  padding: "10px 22px", borderRadius: 6, border: "none",
  background: "rgba(255,255,255,0.9)", color: "#141310",
  fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer",
  transition: "opacity 0.15s",
};

const oGhostBtn = {
  padding: "10px 16px", borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.12)", background: "transparent",
  color: "rgba(255,255,255,0.45)", fontFamily: "inherit", fontSize: 14,
  cursor: "pointer",
};

function nbGetProfile() {
  try { return JSON.parse(localStorage.getItem(ONBOARDING_KEY) || "null"); } catch { return null; }
}

Object.assign(window, { Onboarding, nbGetProfile, ONBOARDING_KEY });
