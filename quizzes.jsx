// Quiz interaction variants — Flashcard, Multiple choice, Type-to-answer

function QuizFrame({ subject, title, eyebrow, progress, current, total, children, footer }) {
  const s = subjectBy(subject);
  return (
    <div className="sn-root" style={{ height: "100%", background: "var(--bg)" }}>
      <div className="quiz-stage">
        <div className="quiz-meta">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}></span>
            <span>{s.short.toUpperCase()} · {eyebrow}</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span>{current} / {total}</span>
            <span>· {Ico.clock} 4:12</span>
          </div>
        </div>
        <div className="quiz-progress">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`pip ${i < current - 1 ? "done" : i === current - 1 ? "current" : ""}`}></div>
          ))}
        </div>
        <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.2, color: "var(--ink-2)" }}>{title}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}

// ─────────────── Flashcard flip

function FlashcardQuiz({ deckId = "bio-respiration" }) {
  // Look in built-in decks first, then custom decks (AI-generated or Quizlet imports)
  let deck = deckBy(deckId);
  if (!deck) {
    const customDeck = nbGetCustomDecks().find((d) => d.id === deckId);
    if (customDeck) {
      deck = {
        ...customDeck,
        // normalize q/a format (Quizlet imports) alongside front/back (built-ins & AI)
        cards: customDeck.cards.map((c) => ({ front: c.front || c.q || "?", back: c.back || c.a || "?" })),
      };
    } else {
      deck = deckBy("bio-respiration");
    }
  }
  const cards = deck.cards;
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const card = cards[idx];

  const next = (rating) => {
    setFlipped(false);
    setTimeout(() => setIdx((i) => (i + 1) % cards.length), 200);
  };

  return (
    <QuizFrame
      subject={deck.subject}
      eyebrow={`Flashcards · ${deck.title}`}
      title={deck.title}
      current={idx + 1}
      total={cards.length}
      footer={
        flipped ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <button className="sn-btn" onClick={() => next("again")} style={{ background: "var(--accent-soft)", borderColor: "var(--accent-soft)", color: "var(--accent-ink)", padding: "10px 0", justifyContent: "center" }}>Again</button>
            <button className="sn-btn" onClick={() => next("hard")} style={{ padding: "10px 0", justifyContent: "center" }}>Hard</button>
            <button className="sn-btn" onClick={() => next("good")} style={{ padding: "10px 0", justifyContent: "center" }}>Good</button>
            <button className="sn-btn primary" onClick={() => next("easy")} style={{ padding: "10px 0", justifyContent: "center" }}>Easy</button>
          </div>
        ) : (
          <button className="sn-btn primary" style={{ width: "100%", justifyContent: "center", padding: "12px 0" }} onClick={() => setFlipped(true)}>
            Flip card · <span className="mono" style={{ opacity: 0.6, fontSize: 11 }}>SPACE</span>
          </button>
        )
      }
    >
      <div
        onClick={() => setFlipped((f) => !f)}
        style={{
          perspective: 1400, cursor: "pointer", height: 260,
        }}
      >
        <div style={{
          position: "relative", width: "100%", height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(.7,.1,.3,1)",
          transform: flipped ? "rotateY(180deg)" : "none",
        }}>
          {/* Front */}
          <div style={{
            position: "absolute", inset: 0,
            background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8,
            backfaceVisibility: "hidden",
            display: "grid", placeItems: "center", padding: 24, textAlign: "center",
          }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Term</div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 44, lineHeight: 1.1 }}>{card.front}</div>
            </div>
          </div>
          {/* Back */}
          <div style={{
            position: "absolute", inset: 0,
            background: "var(--ink)", color: "var(--bg)", borderRadius: 8,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "grid", placeItems: "center", padding: 32, textAlign: "center",
          }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--accent-soft)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Definition</div>
              <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.35 }}>{card.back}</div>
            </div>
          </div>
        </div>
      </div>
    </QuizFrame>
  );
}

// ─────────────── Multiple choice

function MCQQuiz() {
  const [idx, setIdx] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const q = MCQ_ALG2[idx];
  const submitted = picked !== null;

  const next = () => {
    setPicked(null);
    setIdx((i) => (i + 1) % MCQ_ALG2.length);
  };

  return (
    <QuizFrame
      subject="alg2"
      eyebrow="Multiple choice · Trig identities"
      title={q.q}
      current={idx + 1}
      total={MCQ_ALG2.length}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <button className="sn-btn ghost" style={{ fontFamily: "var(--f-mono)", fontSize: 11 }}>SKIP</button>
          {submitted ? (
            <button className="sn-btn primary" onClick={next} style={{ padding: "10px 22px" }}>
              Next →
            </button>
          ) : (
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>Press A · B · C · D to pick</span>
          )}
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {q.choices.map((c, i) => {
          const isCorrect = submitted && i === q.correct;
          const isWrong = submitted && i === picked && i !== q.correct;
          return (
            <button key={i}
              onClick={() => !submitted && setPicked(i)}
              disabled={submitted}
              style={{
                display: "grid", gridTemplateColumns: "28px 1fr 20px", alignItems: "center",
                textAlign: "left", padding: "14px 16px", borderRadius: 6,
                border: "1px solid " + (isCorrect ? "var(--done)" : isWrong ? "var(--accent)" : "var(--hairline)"),
                background: isCorrect ? "var(--done-soft)" : isWrong ? "var(--accent-soft)" : (picked === i ? "var(--bg-2)" : "var(--surface)"),
                cursor: submitted ? "default" : "pointer",
                fontFamily: "var(--f-ui)", fontSize: 14, color: "var(--ink)",
                transition: "all 0.15s ease",
              }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{["A", "B", "C", "D"][i]}</span>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 17, fontStyle: "italic" }}>{c}</span>
              <span style={{ color: isCorrect ? "var(--done)" : isWrong ? "var(--accent)" : "transparent", fontSize: 13 }}>
                {isCorrect ? "✓" : isWrong ? "✕" : ""}
              </span>
            </button>
          );
        })}
      </div>
      {submitted && (
        <div style={{
          padding: 14, background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 6,
          animation: "fade-up 0.3s ease",
        }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            {picked === q.correct ? "✓ Correct" : "✕ Not quite"} · why
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{q.explain}</div>
        </div>
      )}
    </QuizFrame>
  );
}

// ─────────────── Type-to-answer

function TypeAnswerQuiz() {
  const [idx, setIdx] = React.useState(1);
  const [value, setValue] = React.useState("");
  const [state, setState] = React.useState("idle"); // idle | correct | wrong
  const q = TYPE_VOCAB[idx];

  const submit = () => {
    if (value.trim().toLowerCase() === q.en.toLowerCase()) {
      setState("correct");
    } else {
      setState("wrong");
    }
  };
  const next = () => {
    setIdx((i) => (i + 1) % TYPE_VOCAB.length);
    setValue("");
    setState("idle");
  };

  return (
    <QuizFrame
      subject="spanish-3"
      eyebrow="Type the translation · Vocabulario U6"
      title="Translate to English"
      current={idx + 1}
      total={TYPE_VOCAB.length}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="sn-btn ghost" style={{ fontFamily: "var(--f-mono)", fontSize: 11 }}>HINT</button>
          {state === "idle" ? (
            <button className="sn-btn primary" onClick={submit} disabled={!value.trim()} style={{ padding: "10px 22px", opacity: value.trim() ? 1 : 0.4 }}>
              Check ↵
            </button>
          ) : (
            <button className="sn-btn primary" onClick={next} style={{ padding: "10px 22px" }}>Next →</button>
          )}
        </div>
      }
    >
      <div style={{ textAlign: "center", padding: "10px 0 30px" }}>
        <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 72, fontStyle: "italic", color: "var(--ink)" }}>
          {q.es}
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>
          {q.es.startsWith("el ") ? "MASCULINE NOUN" : "VERB · INFINITIVE"}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <input
          autoFocus
          value={value}
          onChange={(e) => { setValue(e.target.value); if (state !== "idle") setState("idle"); }}
          onKeyDown={(e) => { if (e.key === "Enter") (state === "idle" ? submit() : next()); }}
          placeholder="type here…"
          style={{
            width: "100%", border: 0, borderBottom: "2px solid " + (
              state === "correct" ? "var(--done)" :
              state === "wrong"   ? "var(--accent)" : "var(--ink)"
            ),
            background: "transparent", outline: "none", padding: "12px 4px",
            fontFamily: "var(--f-display)", fontSize: 36, color: "var(--ink)",
            textAlign: "center",
          }}
        />
        {state === "correct" && (
          <div style={{ position: "absolute", right: 0, top: 12, color: "var(--done)", fontFamily: "var(--f-mono)", fontSize: 12, animation: "fade-up 0.25s ease" }}>✓ correct</div>
        )}
        {state === "wrong" && (
          <div style={{ marginTop: 14, padding: 12, background: "var(--accent-soft)", borderRadius: 4, textAlign: "center", animation: "fade-up 0.25s ease" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--accent-ink)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Answer</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--accent-ink)", marginTop: 2 }}>{q.en}</div>
          </div>
        )}
      </div>
    </QuizFrame>
  );
}

// ─────────────── Quiz finished screen — for the "full quiz" variant

function QuizResult() {
  return (
    <div className="sn-root" style={{ height: "100%", background: "var(--bg)" }}>
      <div style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column" }}>
        <div className="quiz-meta">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SubjectDot id="alg2" /><span>ALG II · TRIG IDENTITIES · QUIZ COMPLETE</span>
          </div>
          <span>3:47</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>You scored</div>
          <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 160, lineHeight: 1, color: "var(--ink)", margin: "8px 0" }}>
            8<span style={{ color: "var(--ink-3)" }}>/10</span>
          </div>
          <div className="serif" style={{ fontFamily: "var(--f-display)", fontSize: 22, fontStyle: "italic", color: "var(--ink-2)" }}>
            Up from 6/10 last week.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 36, textAlign: "left" }}>
            <div className="sn-card" style={{ padding: 14 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Strongest</div>
              <div className="serif" style={{ fontSize: 17, marginTop: 4 }}>Sum & difference</div>
              <div style={{ color: "var(--done)", fontFamily: "var(--f-mono)", fontSize: 12, marginTop: 4 }}>4 / 4</div>
            </div>
            <div className="sn-card" style={{ padding: 14 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Weakest</div>
              <div className="serif" style={{ fontSize: 17, marginTop: 4 }}>Double-angle</div>
              <div style={{ color: "var(--accent)", fontFamily: "var(--f-mono)", fontSize: 12, marginTop: 4 }}>1 / 3 · review</div>
            </div>
            <div className="sn-card" style={{ padding: 14 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Streak</div>
              <div className="serif" style={{ fontSize: 17, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--accent)" }}>{Ico.flame}</span> 14 days
              </div>
              <div style={{ color: "var(--ink-3)", fontFamily: "var(--f-mono)", fontSize: 12, marginTop: 4 }}>+1 today</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="sn-btn">Review wrong answers (2)</button>
          <button className="sn-btn primary">Make flashcards for missed</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FlashcardQuiz, MCQQuiz, TypeAnswerQuiz, QuizResult });
