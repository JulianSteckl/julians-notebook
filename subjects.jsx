// Subjects grid + Note editor

function SubjectsPage({ density = "default", view = "cards" }) {
  return (
    <div className={`sn-root density-${density}`} style={{ height: "100%" }}>
      <div className="sn-app">
        <Sidebar active="subjects" />
        <main className="sn-main">
          <Topbar placeholder="Search subjects, notes, terms…" />
          <div className="sn-content">
            <SubjectsContent view={view} />
          </div>
        </main>
      </div>
    </div>
  );
}

function SubjectsContent({ view = "cards", onOpenSubject, onChangeView }) {
  return (
    <>
      <PageHeader
        eyebrow="Spring term · 8 subjects"
        title="Your"
        italic="subjects."
        meta="Tap a card to open notes, homework, and quizzes for that class."
        actions={
          <>
            <div style={{ display: "inline-flex", border: "1px solid var(--hairline)", borderRadius: 4, overflow: "hidden" }}>
              <button className="sn-btn ghost" onClick={() => onChangeView && onChangeView("cards")} style={{ borderRadius: 0, background: view === "cards" ? "var(--bg-2)" : "transparent", padding: "5px 10px" }}>Cards</button>
              <button className="sn-btn ghost" onClick={() => onChangeView && onChangeView("list")} style={{ borderRadius: 0, background: view === "list" ? "var(--bg-2)" : "transparent", padding: "5px 10px", borderLeft: "1px solid var(--hairline)" }}>List</button>
            </div>
            <button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "note" } }))}>+ Subject</button>
          </>
        }
      />

      <div className={view === "list" ? "subj-list" : ""} style={{
        display: view === "list" ? "flex" : "grid",
        flexDirection: view === "list" ? "column" : undefined,
        gap: view === "list" ? 10 : 18,
        gridTemplateColumns: view === "cards" ? "repeat(auto-fill, minmax(240px, 1fr))" : undefined,
      }}>
        {SUBJECTS.map((s) => (
          <div key={s.id} className="subj-card" style={{ "--c": s.color }} onClick={() => onOpenSubject && onOpenSubject(s.id)}>
            <div className="label">{s.short} · Period {(SUBJECTS.indexOf(s) % 7) + 1} · Rm {s.room}</div>
            <div className="title">{s.name}</div>
            <div className="grade">{s.grade}{s.grade !== "P" && <small> · {s.teacher.split(" ").pop()}</small>}</div>
            {view === "cards" && (
              <div style={{ height: 1, background: "var(--hairline)", margin: "4px 0" }}></div>
            )}
            <div className="stats">
              <span><b>{s.notes}</b> notes</span>
              <span><b>{s.hw}</b> hw</span>
              <span><b>{s.quizzes}</b> quizzes</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────── Note editor — inline editing

function NotePage({ density = "default" }) {
  return (
    <div className={`sn-root density-${density}`} style={{ height: "100%" }}>
      <div className="sn-app">
        <Sidebar active="ap-bio" />
        <main className="sn-main">
          <Topbar placeholder="Search in AP Biology…" />
          <div className="sn-content" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 0, padding: 0 }}>
            <NoteContent subjectId="ap-bio" />
          </div>
        </main>
      </div>
    </div>
  );
}

function NoteUnitList({ subjectId, userNotes, activeId, onSelect }) {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const on = () => forceUpdate();
    window.addEventListener("nbStoreChange", on);
    return () => window.removeEventListener("nbStoreChange", on);
  }, []);

  const units = nbGetUnits(subjectId);
  const unassigned = userNotes.filter(n => !n.unitId);

  const NoteItem = ({ n }) => {
    const active = n.id === activeId;
    const allUnits = nbGetUnits(subjectId);
    const [hovered, setHovered] = React.useState(false);
    return (
      <div key={n.id}
        style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div onClick={() => onSelect(n.id)} style={{
          flex: 1, padding: "7px 10px", borderRadius: 4, cursor: "pointer",
          background: active ? "var(--bg-2)" : "transparent",
          borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
        }}>
          <div style={{ fontSize: 13, fontWeight: active ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title || "Untitled"}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>{n.when}</div>
        </div>
        {allUnits.length > 0 && (
          <select
            title="Move to unit"
            value={n.unitId || ""}
            onChange={(e) => nbSetNoteUnit(subjectId, n.id, e.target.value || null)}
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 10, border: "1px solid var(--hairline)", borderRadius: 3, background: "var(--surface)", color: "var(--ink-3)", padding: "2px 3px", maxWidth: 70 }}
          >
            <option value="">— none —</option>
            {allUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
        <button
          title="Delete note"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete "${n.title || "Untitled"}"? This cannot be undone.`)) {
              nbDeleteNote(subjectId, n.id);
              window.dispatchEvent(new CustomEvent("toast", { detail: "Note deleted" }));
            }
          }}
          style={{
            border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer",
            fontSize: 15, padding: "0 3px", lineHeight: 1, opacity: hovered ? 0.6 : 0,
            transition: "opacity 0.15s ease", flexShrink: 0,
          }}
        >×</button>
      </div>
    );
  };

  return (
    <div>
      {/* Unassigned user notes */}
      {unassigned.length > 0 && (
        <div>
          {units.length > 0 && (
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "10px 4px 6px" }}>Unsorted</div>
          )}
          {unassigned.map(n => <NoteItem key={n.id} n={n} />)}
        </div>
      )}

      {/* User-created units */}
      {units.map((unit) => {
        const unitNotes = userNotes.filter(n => n.unitId === unit.id);
        return (
          <div key={unit.id} style={{ marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 4px 6px" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent-ink)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
                {unit.name}
              </div>
              <button onClick={() => { if (window.confirm(`Delete unit "${unit.name}"? Notes stay, just lose the category.`)) nbDeleteUnit(subjectId, unit.id); }}
                style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 12, padding: "0 2px" }} title="Delete unit">×</button>
            </div>
            {unitNotes.length === 0 && (
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 12, color: "var(--ink-3)", paddingLeft: 10, paddingBottom: 4 }}>Empty — assign notes here</div>
            )}
            {unitNotes.map(n => <NoteItem key={n.id} n={n} />)}
          </div>
        );
      })}
    </div>
  );
}

// Right-side context panel shown alongside the note editor
function NoteCompanionPanel({ subjectId }) {
  const store = useNbStore();
  const s = subjectBy(subjectId) || {};
  const subjectHW = [...HOMEWORK, ...store.homework].filter(h => h.subject === subjectId && !h.done);
  const subjectQuiz = QUIZZES_UPCOMING.find(q => q.subject === subjectId);
  const hasContent = subjectHW.length > 0 || subjectQuiz;

  return (
    <aside style={{ borderLeft: "1px solid var(--hairline)", padding: "24px 16px", overflow: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {s.short || "Subject"} · Context
      </div>

      {subjectHW.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Homework</div>
          {subjectHW.slice(0, 5).map(h => (
            <div key={h.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7, padding: "7px 9px", background: "var(--bg-2)", borderRadius: 4, borderLeft: h.urgent ? "2px solid var(--accent)" : "2px solid transparent" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, lineHeight: 1.35, fontWeight: 500 }}>{h.title}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>{h.due} · {h.est}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subjectQuiz && (
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Upcoming quiz</div>
          <div style={{ padding: "9px 11px", background: "var(--bg-2)", borderRadius: 4, borderLeft: `3px solid ${s.color || "var(--accent)"}` }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 14, lineHeight: 1.2, marginBottom: 4 }}>{subjectQuiz.title}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 6 }}>{subjectQuiz.when} · {subjectQuiz.length}</div>
            <ConfidenceMeter value={subjectQuiz.confidence} />
          </div>
        </div>
      )}

      {!hasContent && (
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 13, lineHeight: 1.5 }}>
          Nothing linked yet — add homework or quiz dates with the + button up top.
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px dashed var(--hairline)" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quick add</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button className="sn-btn ghost" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } }))} style={{ fontSize: 11.5, justifyContent: "flex-start" }}>+ Homework</button>
          <button className="sn-btn ghost" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "quiz" } }))} style={{ fontSize: 11.5, justifyContent: "flex-start" }}>+ Quiz date</button>
        </div>
      </div>
    </aside>
  );
}

function NoteContent({ subjectId = "ap-bio", noteId }) {
  const subj = subjectBy(subjectId) || subjectBy("ap-bio");
  const store = useNbStore();
  // Apply saved title overrides so the sidebar reflects edits immediately
  const applyTitleOverride = (n) => {
    const ov = nbGetNoteOverride(n.id);
    return ov && ov.title !== undefined ? { ...n, title: ov.title } : n;
  };
  const userNotes = store.notesFor(subj.id).map(applyTitleOverride);
  const builtinNotes = notesForSubject(subj.id).map(applyTitleOverride);
  const notes = [...userNotes, ...builtinNotes];
  const subjData = NOTES_BY_SUBJECT[subj.id] || { units: ["Notes"], notes: [] };

  const initialActive = noteId && notes.find((n) => n.id === noteId) ? noteId : (notes[0] ? notes[0].id : null);
  const [activeNoteId, setActiveNoteId] = React.useState(initialActive);
  React.useEffect(() => { setActiveNoteId(initialActive); }, [subjectId, noteId, userNotes.length]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Group: "Your notes" (user-added) + units
  const groups = [];
  if (userNotes.length > 0) groups.push({ unit: "Your notes", items: userNotes });
  subjData.units.forEach((u, i) => {
    const items = builtinNotes.filter((n) => (n.unit ?? 0) === i);
    if (items.length > 0) groups.push({ unit: u, items });
  });

  const [fullWidth, setFullWidth] = React.useState(false);

  return (
    <div style={{ display: "grid", gridTemplateColumns: fullWidth ? "0 1fr" : "220px 1fr 220px", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Note list */}
      <aside style={{ borderRight: "1px solid var(--hairline)", padding: fullWidth ? 0 : "24px 18px", overflow: fullWidth ? "hidden" : "auto", width: fullWidth ? 0 : undefined, transition: "all 0.18s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <SubjectDot id={subj.id} />
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{subj.short} · Notes</div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button className="sn-btn" onClick={() => {
            const rec = nbAddNote(subj.id, { title: "Untitled note" });
            setActiveNoteId(rec.id);
          }} style={{ flex: 1, justifyContent: "center" }}>{Ico.plus} New note</button>
          <button className="sn-btn ghost" title="New unit" onClick={() => {
            const name = window.prompt("Unit name (e.g. Unit 1 · Intro, Chapter 3)");
            if (name && name.trim()) { nbAddUnit(subj.id, name); }
          }} style={{ padding: "6px 10px", fontFamily: "var(--f-mono)", fontSize: 11 }}>+ Unit</button>
        </div>

        {/* User units */}
        <NoteUnitList subjectId={subj.id} userNotes={userNotes} activeId={activeNote?.id} onSelect={setActiveNoteId} />

        {/* Built-in units */}
        {groups.map((group, gi) => (
          <div key={gi}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", margin: gi === 0 ? "10px 4px 6px" : "16px 4px 6px" }}>{group.unit}</div>
            {group.items.map((n) => {
              const active = n.id === activeNote?.id;
              return (
                <div key={n.id} onClick={() => setActiveNoteId(n.id)} style={{
                  padding: "8px 10px", borderRadius: 4, marginBottom: 2, cursor: "pointer",
                  background: active ? "var(--bg-2)" : "transparent",
                  borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 500 : 400 }}>{n.title}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>{n.when}</div>
                </div>
              );
            })}
          </div>
        ))}

        {groups.length === 0 && userNotes.length === 0 && (
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", padding: "12px 4px", fontSize: 14 }}>
            No notes yet. Click "New note" to start, or "+ Unit" to create a category.
          </div>
        )}
      </aside>

      {/* Editor */}
      {activeNote ? <NoteEditor key={subj.id + ":" + activeNote.id} subject={subj} note={activeNote} fullWidth={fullWidth} onToggleFullWidth={() => setFullWidth(v => !v)} /> : (
        <div style={{ padding: "60px 56px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontStyle: "italic", color: "var(--ink-3)" }}>No notes for {subj.short} yet.</div>
          <button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "note" } }))} style={{ marginTop: 18 }}>+ New note</button>
        </div>
      )}

      {/* Companion panel — hidden in full-width mode */}
      {!fullWidth && <NoteCompanionPanel subjectId={subjectId} />}
    </div>
  );
}

function NoteEditor({ subject, note, fullWidth, onToggleFullWidth }) {
  // Load previously-saved edits (title, blocks, tags) from the override store
  const saved = nbGetNoteOverride(note.id) || {};
  const [title, setTitle] = React.useState(saved.title !== undefined ? saved.title : note.title);
  const [blocks, setBlocks] = React.useState(() => {
    const raw = saved.blocks || note.blocks || [];
    return raw.map((b, i) => ({ id: b.id ?? (i + 1), ...b }));
  });
  const [tags, setTags] = React.useState(saved.tags || note.tags || []);

  // Keep a ref to current blocks so we can flush on unmount
  const blocksRef = React.useRef(blocks);
  blocksRef.current = blocks;

  // Debounced block save while editing; flush immediately on unmount
  React.useEffect(() => {
    const t = setTimeout(() => nbUpdateNoteContent(note.id, { blocks }), 600);
    return () => clearTimeout(t);
  }, [blocks]);
  React.useEffect(() => {
    return () => nbUpdateNoteContent(note.id, { blocks: blocksRef.current });
  }, []);
  const [activeId, setActiveId] = React.useState(blocks[0]?.id || null);
  const [aiDraftOpen, setAiDraftOpen] = React.useState(false);

  const updateBlock = (id, text) => setBlocks((bs) => bs.map((b) => b.id === id ? { ...b, text } : b));
  const changeBlockType = (id, newType) => setBlocks((bs) => bs.map((b) => b.id === id ? { ...b, type: newType, text: b.text === "/" ? "" : b.text } : b));
  const toggleCheckbox = (id) => setBlocks((bs) => bs.map((b) => b.id === id ? { ...b, checked: !b.checked } : b));
  const addBlockAfter = (id, type = "p") => {
    const newBlock = { id: Date.now(), type, text: "" };
    setBlocks((bs) => {
      const idx = bs.findIndex((b) => b.id === id);
      const next = [...bs];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    setActiveId(newBlock.id);
  };

  const addTag = () => {
    const v = window.prompt("Tag name (without #)");
    if (!v) return;
    const t = "#" + v.trim().replace(/^#/, "").replace(/\s+/g, "-").toLowerCase();
    if (t === "#" || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    nbUpdateNoteContent(note.id, { tags: next });
  };
  const removeTag = (t) => {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    nbUpdateNoteContent(note.id, { tags: next });
  };

  const applyDraft = (draft) => {
    if (draft.title) { setTitle(draft.title); nbUpdateNoteContent(note.id, { title: draft.title }); }
    const newBlocks = draft.blocks.map((b, i) => ({ id: i + 1, ...b }));
    setBlocks(newBlocks);
    nbUpdateNoteContent(note.id, { blocks: newBlocks });
    window.dispatchEvent(new CustomEvent("toast", { detail: "Draft applied — edit anything you like" }));
  };

  // Selection toolbar state
  const [selToolbar, setSelToolbar] = React.useState(null); // { text, x, y }
  const [selResult, setSelResult] = React.useState(null); // { action, text }

  // Called directly from EditableBlock's onMouseUp — much more reliable than checking
  // document.activeElement on the parent div's mouseup event.
  const handleTextSelect = React.useCallback((info) => {
    setSelToolbar(info);
  }, []);
  const dismissToolbar = React.useCallback(() => {
    setSelToolbar(null);
  }, []);

  // Track focused element for bold/italic formatting
  const activeElRef = React.useRef(null);

  // Apply markdown-style formatting (** for bold, * for italic) to the selected text
  const applyFormat = (prefix, suffix = prefix) => {
    const el = activeElRef.current || document.activeElement;
    // ContentEditable paragraph blocks — use execCommand for real bold/italic
    if (el && el.isContentEditable) {
      if (prefix === "**") { document.execCommand("bold", false, null); return; }
      if (prefix === "*")  { document.execCommand("italic", false, null); return; }
      if (prefix === "`")  {
        const sel = window.getSelection();
        const selected = sel ? sel.toString() : "";
        if (selected) document.execCommand("insertText", false, "`" + selected + "`");
        else window.dispatchEvent(new CustomEvent("toast", { detail: "Select text first, then click code" }));
        return;
      }
      return;
    }
    // Fallback for textarea/input block types (h2, li, quote, checkbox)
    if (!el || (el.tagName !== "TEXTAREA" && el.tagName !== "INPUT")) {
      window.dispatchEvent(new CustomEvent("toast", { detail: "Click inside a paragraph block first" }));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (typeof start !== "number" || start === end) {
      window.dispatchEvent(new CustomEvent("toast", { detail: "Select some text first, then click the format button" }));
      return;
    }
    const val = el.value;
    const newVal = val.slice(0, start) + prefix + val.slice(start, end) + suffix + val.slice(end);
    const Ctor = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement : window.HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(Ctor.prototype, "value")?.set;
    if (setter) {
      setter.call(el, newVal);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      setTimeout(() => {
        if (el.isConnected) { el.focus(); el.setSelectionRange(start + prefix.length, end + prefix.length); }
      }, 20);
    }
  };

  const runSelAI = async (action, text) => {
    setSelResult({ action, text: "Thinking…" });
    const prompts = {
      explain: `Explain the following in 2–3 sentences for a high school student:\n\n"${text}"`,
      flashcard: `Turn this into ONE flashcard. Return ONLY:\nQ: <question>\nA: <answer>\n\nText: "${text}"`,
      question: `Write ONE multiple-choice question testing understanding of:\n\n"${text}"\n\nFormat:\nQ. question\n  A) ...\n  B) ...\n  C) ...\n  D) ...\n  Correct: letter`,
    };
    try {
      let result = "";
      if (typeof window.claude !== "undefined" && window.claude.complete) {
        result = await window.claude.complete(prompts[action]);
      } else {
        // Useful local template fallbacks when AI is not connected
        const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 4);
        const firstSentence = sentences[0] || text;
        const topic = text.trim().split(/\s+/).slice(0, 5).join(" ");
        if (action === "explain") {
          result = `📖 Key passage:\n"${text}"\n\nTo master this:\n• Restate it in your own words\n• Ask yourself: what, why, and how?\n• Connect it to a concept you already understand`;
        } else if (action === "flashcard") {
          const ans = firstSentence.length > 120 ? firstSentence.slice(0, 120) + "…" : firstSentence;
          result = `Q: What is the significance of "${topic}…"?\nA: ${ans}`;
        } else {
          const snippet = text.length > 80 ? text.slice(0, 80) + "…" : text;
          result = `Q. What does the following passage best describe?\n"${snippet}"\n  A) A key definition or term\n  B) A process or mechanism\n  C) An example or application\n  D) A conclusion or comparison\n  Correct: Choose based on context`;
        }
      }
      setSelResult({ action, text: result });
    } catch (e) {
      setSelResult({ action, text: "Couldn't generate — try again." });
    }
  };

  const isEmpty = blocks.length === 1 && !blocks[0].text;
  const unitLabel = NOTES_BY_SUBJECT[subject.id]?.units[note.unit ?? 0] || "Notes";

  return (
    <div style={{ padding: "32px 56px", maxWidth: "none", overflow: "auto", position: "relative" }}>
      <style>{`[contenteditable][data-placeholder]:empty::before { content: attr(data-placeholder); color: var(--ink-3); pointer-events: none; display: block; font-style: italic; }`}</style>
      {/* AI selection toolbar — fixed to viewport near selection */}
      {selToolbar && (
        <div style={{ position: "fixed", left: selToolbar.x, top: selToolbar.y, transform: "translateX(-50%)", zIndex: 80, display: "flex", gap: 4, padding: "6px 8px", background: "var(--ink)", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.22)", whiteSpace: "nowrap" }}>
          {[["explain","✦ Explain"],["flashcard","+ Flashcard"],["question","? Question"]].map(([k, l]) => (
            <button key={k} onMouseDown={(e) => { e.preventDefault(); runSelAI(k, selToolbar.text); setSelToolbar(null); }}
              style={{ background: "transparent", border: 0, color: "white", cursor: "pointer", fontSize: 12, padding: "3px 8px", borderRadius: 5, fontFamily: "inherit" }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.18)"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
            >{l}</button>
          ))}
          <button onMouseDown={(e) => { e.preventDefault(); setSelToolbar(null); }} style={{ background: "transparent", border: 0, color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, padding: "3px 4px", fontFamily: "inherit" }}>×</button>
        </div>
      )}
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{subject.short.toUpperCase()} · {unitLabel}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Edited {note.when} · auto-saved</span>
          <button onClick={onToggleFullWidth} title={fullWidth ? "Exit full width" : "Full width"} style={{ background: "transparent", border: "1px solid var(--hairline)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)", padding: "2px 6px" }}>
            {fullWidth ? "⤡" : "⤢"}
          </button>
        </span>
      </div>
      <input
        value={title}
        onChange={(e) => { setTitle(e.target.value); nbUpdateNoteContent(note.id, { title: e.target.value }); }}
        className="serif"
        placeholder="Untitled note"
        style={{
          fontSize: 38, fontFamily: "var(--f-display)", border: 0, outline: 0,
          width: "100%", background: "transparent", color: "var(--ink)",
          margin: "0 0 6px", letterSpacing: "-0.015em",
        }}
      />
      <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
        {tags.map((t) => (
          <span key={t} className="chip" style={{ cursor: "pointer" }} onClick={() => removeTag(t)} title="Click to remove">{t} <span style={{ opacity: 0.5, marginLeft: 2 }}>×</span></span>
        ))}
        <span className="chip" style={{ borderStyle: "dashed", color: "var(--ink-3)", cursor: "pointer" }} onClick={addTag}>+ tag</span>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 18 }}>
        <div style={{ display: "inline-flex", gap: 2, padding: 3, background: "var(--bg-2)", border: "1px solid var(--hairline)", borderRadius: 4 }}>
          <button className="sn-btn ghost" onClick={() => applyFormat("**")} title="Bold — select text first" style={{ padding: 4 }}>{Ico.bold}</button>
          <button className="sn-btn ghost" onClick={() => applyFormat("*")} title="Italic — select text first" style={{ padding: 4 }}>{Ico.italic}</button>
          <button className="sn-btn ghost" onClick={() => applyFormat("`")} title="Code — select text first" style={{ padding: 4 }}>{Ico.list}</button>
          <div style={{ width: 1, background: "var(--hairline)", margin: "0 3px" }}></div>
          <button className="sn-btn ghost" onClick={() => { const id = activeId || blocks[0]?.id; if (id) changeBlockType(id, "h2"); }} style={{ padding: "4px 8px", fontFamily: "var(--f-mono)", fontSize: 11 }} title="Make heading">H2</button>
          <button className="sn-btn ghost" onClick={() => { const id = activeId || blocks[0]?.id; if (id) changeBlockType(id, "quote"); }} style={{ padding: "4px 8px", fontFamily: "var(--f-mono)", fontSize: 11 }} title="Make block quote">"</button>
          <button className="sn-btn ghost" onClick={() => { const id = activeId || blocks[0]?.id; if (id) changeBlockType(id, "checkbox"); }} style={{ padding: "4px 8px", fontFamily: "var(--f-mono)", fontSize: 11 }} title="Make checkbox">☐</button>
        </div>
        <button className="sn-btn ghost" onClick={() => setAiDraftOpen((v) => !v)}
          style={{ fontSize: 12.5, color: aiDraftOpen ? "white" : "var(--accent)", background: aiDraftOpen ? "var(--accent)" : undefined, borderColor: "var(--accent)" }}>
          ✦ AI helper
        </button>
      </div>

      {/* AI selection result panel */}
      {selResult && (
        <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--hairline)", borderLeft: "3px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              ✦ {selResult.action === "explain" ? "AI Explanation" : selResult.action === "flashcard" ? "AI Flashcard" : "AI Question"}
            </div>
            <button onClick={() => setSelResult(null)} style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", fontSize: 14 }}>×</button>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink)", whiteSpace: "pre-wrap" }}>{selResult.text}</div>
        </div>
      )}

      <div>
        {blocks.map((b, i) => (
          <EditableBlock
            key={b.id}
            block={b}
            active={activeId === b.id}
            onFocus={() => setActiveId(b.id)}
            onFocusEl={(el) => { activeElRef.current = el; }}
            onChange={(t) => updateBlock(b.id, t)}
            onChangeType={(type) => changeBlockType(b.id, type)}
            onToggleCheck={() => toggleCheckbox(b.id)}
            onAddAfter={(type) => addBlockAfter(b.id, type)}
            onTextSelect={handleTextSelect}
            onDismissToolbar={dismissToolbar}
            autoFocus={isEmpty && i === 0}
          />
        ))}
      </div>

      {/* Attachments */}
      <NoteAttachments subjectId={subject.id} noteId={note.id} />

      {/* AI helper — inline panel below attachments */}
      {aiDraftOpen && (
        <div style={{ marginTop: 28, borderTop: "1px solid var(--hairline)", paddingTop: 24 }}>
          <AINoteDraft
            subjectId={subject.id}
            onApply={(draft) => { applyDraft(draft); setAiDraftOpen(false); }}
            onClose={() => setAiDraftOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

function linkedItemsFor(subjectId) {
  const map = {
    "ap-lit":   [{ icon: Ico.quiz,  label: "Beloved themes quiz" },     { icon: Ico.hw, label: "Body paragraph draft" }, { icon: Ico.cards, label: "12 character cards" }],
    "ap-bio":   [{ icon: Ico.quiz,  label: "Cellular Resp. Quiz · Thu" }, { icon: Ico.hw, label: "Enzyme lab report" },     { icon: Ico.cards, label: "18 flashcards" }, { icon: Ico.file, label: "mitochondria-diagram.pdf" }],
    "alg2":     [{ icon: Ico.quiz,  label: "Trig identities quiz" },    { icon: Ico.hw, label: "Problem set 7.3" },        { icon: Ico.cards, label: "22 flashcards" }],
    "us-hist":  [{ icon: Ico.quiz,  label: "Founding-era quiz" },       { icon: Ico.hw, label: "Federalist No. 10 response" }, { icon: Ico.cards, label: "14 flashcards" }],
    "spanish-3":[{ icon: Ico.quiz,  label: "Pretérito quiz · Fri" },    { icon: Ico.hw, label: "Vocabulario U6" },         { icon: Ico.cards, label: "30 flashcards" }],
    "chem":     [{ icon: Ico.quiz,  label: "Solutions quiz" },          { icon: Ico.hw, label: "Molarity worksheet" },     { icon: Ico.cards, label: "26 flashcards" }],
    "studio-art":[{ icon: Ico.file, label: "Reference photos" },        { icon: Ico.hw, label: "Final piece — critique" }],
    "phys-ed":  [{ icon: Ico.file, label: "May log" }],
  };
  return map[subjectId] || [];
}

const SLASH_COMMANDS = [
  { key: "p",        icon: "¶",  label: "Text",      desc: "Plain paragraph" },
  { key: "h2",       icon: "H",  label: "Heading",   desc: "Large section title" },
  { key: "li",       icon: "•",  label: "List",      desc: "Bullet list item" },
  { key: "quote",    icon: '"',  label: "Quote",     desc: "Block quote" },
  { key: "checkbox", icon: "☐",  label: "Checkbox",  desc: "To-do item" },
  { key: "divider",  icon: "—",  label: "Divider",   desc: "Horizontal rule" },
];

function SlashMenu({ onSelect, onClose }) {
  const [sel, setSel] = React.useState(0);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); setSel((s) => Math.min(s + 1, SLASH_COMMANDS.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); e.stopPropagation(); setSel((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter")     { e.preventDefault(); e.stopPropagation(); onSelect(SLASH_COMMANDS[sel].key); }
      if (e.key === "Escape")    { e.preventDefault(); e.stopPropagation(); onClose(); }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [sel, onSelect, onClose]);

  return (
    <div ref={ref} style={{
      position: "absolute", left: 0, top: "100%", zIndex: 50,
      background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8,
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: "6px 0",
      minWidth: 200, marginTop: 4,
    }}>
      <div style={{ padding: "4px 12px 8px", fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
        Block type
      </div>
      {SLASH_COMMANDS.map((cmd, i) => (
        <div key={cmd.key} onMouseDown={(e) => { e.preventDefault(); onSelect(cmd.key); }}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "7px 14px",
            cursor: "pointer",
            background: i === sel ? "var(--bg-2)" : "transparent",
          }}
          onMouseEnter={() => setSel(i)}
        >
          <span style={{ fontFamily: "var(--f-display)", fontSize: 15, color: "var(--accent)", width: 18, textAlign: "center" }}>{cmd.icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{cmd.label}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>{cmd.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EditableBlock({ block, active, onFocus, onFocusEl, onChange, onChangeType, onToggleCheck, onAddAfter, onTextSelect, onDismissToolbar, autoFocus = false }) {
  const ref = React.useRef(null);
  const ceInitialized = React.useRef(false);
  const [showSlash, setShowSlash] = React.useState(false);
  const baseStyle = { outline: "none", width: "100%", border: 0, background: "transparent", color: "var(--ink)", fontFamily: "inherit", resize: "none" };

  React.useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  // Direct per-element mouseup handler — fires on the actual input/textarea, so
  // selectionStart/selectionEnd are always correct and document.activeElement isn't needed.
  const handleInputMouseUp = (e) => {
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (typeof start === "number" && end > start + 2) {
      const text = el.value.slice(start, end).trim();
      if (text.length >= 3 && onTextSelect) {
        const rect = el.getBoundingClientRect();
        onTextSelect({
          text,
          x: Math.round((rect.left + rect.right) / 2),
          y: Math.max(Math.round(rect.top) - 56, 70),
        });
        return;
      }
    }
    onDismissToolbar && onDismissToolbar();
  };

  const handleFocus = (e) => {
    onFocus();
    if (onFocusEl) onFocusEl(e.currentTarget);
  };

  const grow = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = (el.scrollHeight + 2) + "px";
  };

  const handleChange = (val) => {
    if (val === "/") {
      setShowSlash(true);
    } else if (showSlash && !val.startsWith("/")) {
      setShowSlash(false);
    }
    onChange(val);
  };

  const handleSlashSelect = (typeKey) => {
    setShowSlash(false);
    if (typeKey === "divider") {
      onChangeType("divider");
      onChange("—");
    } else {
      onChangeType(typeKey);
      onChange("");
      // ContentEditable paragraph stays as-is; manually clear the div's content
      if (typeKey === "p" && ref.current && ref.current.isContentEditable) {
        ref.current.innerHTML = "";
      }
    }
    setTimeout(() => ref.current && ref.current.focus(), 30);
  };

  const handleKey = (e) => {
    if (e.key === "Escape" && showSlash) { setShowSlash(false); e.stopPropagation(); }
    if (e.key === "Enter" && !showSlash && !e.shiftKey && block.type !== "p") { e.preventDefault(); onAddAfter && onAddAfter("p"); }
  };

  if (block.type === "divider") {
    return <div style={{ margin: "16px 0", borderTop: "1.5px solid var(--hairline)", position: "relative" }}>
      <BlockMargin active={active} />
    </div>;
  }

  if (block.type === "checkbox") {
    return (
      <div style={{ position: "relative", display: "flex", gap: 10, alignItems: "flex-start", padding: "4px 0" }}>
        <BlockMargin active={active} />
        <div onClick={onToggleCheck} style={{ marginTop: 3, width: 16, height: 16, borderRadius: 4, border: "1.5px solid " + (block.checked ? "var(--accent)" : "var(--ink-3)"), background: block.checked ? "var(--accent)" : "transparent", cursor: "pointer", flexShrink: 0, display: "grid", placeItems: "center" }}>
          {block.checked && <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>}
        </div>
        <input ref={ref} value={block.text} onChange={(e) => handleChange(e.target.value)} onFocus={handleFocus} onMouseUp={handleInputMouseUp} onKeyDown={handleKey} placeholder="To-do item"
          style={{ ...baseStyle, fontSize: 14.5, lineHeight: 1.55, textDecoration: block.checked ? "line-through" : "none", color: block.checked ? "var(--ink-3)" : "var(--ink)" }} />
      </div>
    );
  }

  if (block.type === "h2") {
    return (
      <div style={{ position: "relative", marginTop: 22, marginBottom: 6 }}>
        <BlockMargin active={active} />
        {showSlash && <SlashMenu onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
        <input ref={ref} value={block.text} onChange={(e) => handleChange(e.target.value)} onFocus={handleFocus} onMouseUp={handleInputMouseUp} onKeyDown={handleKey} placeholder="Heading"
          className="serif"
          style={{ ...baseStyle, fontFamily: "var(--f-display)", fontSize: 22 }} />
      </div>
    );
  }
  if (block.type === "li") {
    return (
      <div style={{ position: "relative", display: "flex", gap: 10, padding: "3px 0" }}>
        <BlockMargin active={active} />
        {showSlash && <SlashMenu onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
        <span style={{ color: "var(--accent)", marginTop: 2 }}>•</span>
        <input ref={ref} value={block.text} onChange={(e) => handleChange(e.target.value)} onFocus={handleFocus} onMouseUp={handleInputMouseUp} onKeyDown={handleKey} placeholder="List item"
          style={{ ...baseStyle, fontSize: 14.5, lineHeight: 1.55 }} />
      </div>
    );
  }
  if (block.type === "quote") {
    return (
      <div style={{ position: "relative", margin: "16px 0" }}>
        <BlockMargin active={active} />
        {showSlash && <SlashMenu onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
        <div style={{ borderLeft: "2px solid var(--accent)", padding: "4px 16px" }}>
          <input ref={ref} value={block.text} onChange={(e) => handleChange(e.target.value)} onFocus={handleFocus} onMouseUp={handleInputMouseUp} onKeyDown={handleKey} placeholder="Quote"
            className="serif"
            style={{ ...baseStyle, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, color: "var(--ink-2)" }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "relative", marginBottom: 8 }}>
      <BlockMargin active={active} />
      {showSlash && <SlashMenu onSelect={handleSlashSelect} onClose={() => setShowSlash(false)} />}
      <div
        ref={(el) => {
          ref.current = el;
          if (el && !ceInitialized.current) {
            el.innerHTML = block.text || "";
            ceInitialized.current = true;
          }
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const html = e.currentTarget.innerHTML;
          const text = e.currentTarget.textContent;
          if (text === "/") { setShowSlash(true); }
          else if (showSlash && !text.startsWith("/")) { setShowSlash(false); }
          onChange(html);
        }}
        onFocus={(e) => { onFocus(); if (onFocusEl) onFocusEl(e.currentTarget); }}
        onMouseUp={(e) => {
          const sel = window.getSelection();
          if (sel && sel.toString().trim().length >= 3) {
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (onTextSelect) {
              onTextSelect({
                text: sel.toString().trim(),
                x: Math.round((rect.left + rect.right) / 2),
                y: Math.max(Math.round(rect.top) - 56, 70),
              });
              return;
            }
          }
          onDismissToolbar && onDismissToolbar();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && showSlash) { setShowSlash(false); e.stopPropagation(); }
          if (e.key === "Enter" && !showSlash && !e.shiftKey) { e.preventDefault(); onAddAfter && onAddAfter("p"); }
        }}
        data-placeholder="Start writing — or type / for commands"
        style={{ ...baseStyle, fontSize: 14.5, lineHeight: 1.6, minHeight: 26, cursor: "text", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      />
    </div>
  );
}

function BlockMargin({ active }) {
  if (!active) return null;
  return <div style={{
    position: "absolute", left: -32, top: 4, display: "flex", gap: 4, opacity: 0.65,
  }}>
    <span style={{ width: 14, height: 14, display: "grid", placeItems: "center", color: "var(--ink-3)", cursor: "grab" }}>{Ico.drag}</span>
    <span style={{ width: 14, height: 14, display: "grid", placeItems: "center", color: "var(--ink-3)", cursor: "pointer" }}>{Ico.plus}</span>
  </div>;
}

function NoteAttachments({ subjectId, noteId }) {
  const store = useNbStore();
  const files = store.attachmentsFor(subjectId, noteId);
  const inputRef = React.useRef(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    for (const f of Array.from(fileList)) {
      if (f.size > 20 * 1024 * 1024) {
        window.dispatchEvent(new CustomEvent("toast", { detail: `${f.name} is too large (max 20 MB)` }));
        continue;
      }
      await nbAddAttachment(subjectId, noteId, f);
    }
    setUploading(false);
    window.dispatchEvent(new CustomEvent("toast", { detail: "Attached" }));
  };

  return (
    <div style={{ marginTop: 36, paddingTop: 18, borderTop: "1px dashed var(--hairline)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Attachments · <span style={{ color: "var(--ink)" }}>{files.length}</span></div>
        <button className="sn-btn ghost" onClick={() => inputRef.current && inputRef.current.click()} style={{ fontSize: 11.5 }}>{Ico.plus} Add file</button>
      </div>
      <input ref={inputRef} type="file" multiple
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        style={{ display: "none" }}
      />

      {files.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 12 }}>
          {files.map((f) => <AttachmentTile key={f.id} file={f} onRemove={() => nbRemoveAttachment(subjectId, noteId, f.id)} />)}
        </div>
      )}

      <div
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: "1.5px dashed " + (dragOver ? "var(--accent)" : "var(--hairline)"),
          borderRadius: 6, padding: "18px 14px",
          background: dragOver ? "var(--accent-soft)" : (uploading ? "var(--bg-2)" : "transparent"),
          textAlign: "center", cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ fontFamily: "var(--f-display)", fontSize: 17, color: "var(--ink-2)", fontStyle: "italic" }}>
          {uploading ? "Uploading…" : dragOver ? "Drop to attach" : "Drag a file here, or click to browse"}
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>
          PDF · DOC · IMG · TXT · up to 20 MB
        </div>
      </div>
    </div>
  );
}

function AttachmentTile({ file, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const icon = fileIconFor(file.type, file.name);
  const open = () => {
    const w = window.open();
    if (!w) return;
    if (isImage) {
      w.document.write(`<title>${file.name}</title><body style="margin:0;background:#1a1611;display:grid;place-items:center;min-height:100vh"><img src="${file.url}" style="max-width:100vw;max-height:100vh"/></body>`);
    } else {
      w.location.href = file.url;
    }
  };
  return (
    <div style={{
      border: "1px solid var(--hairline)", borderRadius: 5, overflow: "hidden",
      background: "var(--surface)", display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <div onClick={open} style={{ cursor: "pointer", height: 64, background: "var(--bg-2)", display: "grid", placeItems: "center", borderBottom: "1px solid var(--hairline)", overflow: "hidden" }}>
        {isImage ? (
          <img src={file.url} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 13, fontWeight: 500, color: "var(--ink-2)", letterSpacing: "0.05em" }}>{icon}</div>
        )}
      </div>
      <div onClick={open} style={{ padding: "6px 8px", cursor: "pointer" }}>
        <div style={{ fontSize: 11, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", marginTop: 1 }}>{fmtFileSize(file.size)}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          position: "absolute", top: 3, right: 3,
          width: 18, height: 18, borderRadius: 9,
          border: "1px solid var(--hairline)", background: "var(--surface)",
          color: "var(--ink-3)", cursor: "pointer", fontSize: 12, lineHeight: 1,
          display: "grid", placeItems: "center",
        }}
        title="Remove"
      >×</button>
    </div>
  );
}

Object.assign(window, { SubjectsPage, SubjectsContent, NotePage, NoteContent });
