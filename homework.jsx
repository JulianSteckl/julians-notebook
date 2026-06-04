// Homework list — drag-to-reorder, completion animation, filtering

function HomeworkList({ items: initial, compact = false, onOpen, onDelete }) {
  const [items, setItems] = React.useState(initial);
  const [draggingId, setDraggingId] = React.useState(null);
  const [overId, setOverId] = React.useState(null);

  React.useEffect(() => setItems(initial), [initial]);

  const toggle = (id, e) => {
    if (e) e.stopPropagation();
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: !it.done } : it));
  };

  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragOver = (e, id) => {
    e.preventDefault();
    if (id !== overId) setOverId(id);
  };
  const onDrop = (e, id) => {
    e.preventDefault();
    if (!draggingId || draggingId === id) { setDraggingId(null); setOverId(null); return; }
    setItems((prev) => {
      const from = prev.findIndex((x) => x.id === draggingId);
      const to = prev.findIndex((x) => x.id === id);
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggingId(null); setOverId(null);
  };
  const onDragEnd = () => { setDraggingId(null); setOverId(null); };

  return (
    <div>
      {items.map((h) => {
        const s = subjectBy(h.subject);
        return (
          <div key={h.id}
            className={`hw-row ${h.done ? "done" : ""} ${draggingId === h.id ? "dragging" : ""} ${overId === h.id ? "over" : ""}`}
            draggable
            onClick={(e) => { if (onOpen) onOpen(h); }}
            onDragStart={(e) => onDragStart(e, h.id)}
            onDragOver={(e) => onDragOver(e, h.id)}
            onDrop={(e) => onDrop(e, h.id)}
            onDragEnd={onDragEnd}
            style={{ cursor: onOpen ? "pointer" : "grab" }}
          >
            <div className={`hw-check ${h.done ? "done" : ""}`} onClick={(e) => toggle(h.id, e)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={h.done ? "var(--bg)" : "transparent"} strokeWidth="2.2" strokeLinecap="round">
                <path className="tick" d="M3 8l3.5 3.5L13 5" />
              </svg>
            </div>
            <div className="hw-subject-dot" style={{ background: s.color }}></div>
            <div className="hw-title">
              {h.title}
              {!compact && <span className="tag">· {h.tag}</span>}
            </div>
            <div className={`hw-meta ${h.urgent && !h.done ? "urgent" : ""}`}>
              {h.due}{h.dueNote ? ` · ${h.dueNote}` : ""} · {h.est}
            </div>
            <span className="hw-handle" onClick={(e) => e.stopPropagation()}>{Ico.drag}</span>
            <button
              title="Delete task"
              onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(h.id); }}
              style={{ border: 0, background: "transparent", color: "var(--ink-3)", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, opacity: 0.45, display: "grid", placeItems: "center" }}
            >×</button>
          </div>
        );
      })}
    </div>
  );
}

// Full homework page (used in design canvas)
function HomeworkPage({ density = "default" }) {
  return (
    <div className={`sn-root density-${density}`} style={{ height: "100%" }}>
      <div className="sn-app">
        <Sidebar active="homework" />
        <main className="sn-main">
          <Topbar placeholder="Search homework…" />
          <div className="sn-content">
            <HomeworkContent />
          </div>
        </main>
      </div>
    </div>
  );
}

// Content-only version for in-app routing
function HomeworkContent({ onOpenCanvas }) {
  const [filter, setFilter] = React.useState("open");
  const [subjectFilter, setSubjectFilter] = React.useState(null);
  const [showSubjectFilter, setShowSubjectFilter] = React.useState(false);
  const store = useNbStore(); // subscribe to store changes

  // Merge built-in sample homework with user-added homework
  const allHW = React.useMemo(() => [...HOMEWORK, ...store.homework], [store.homework]);

  const filtered = allHW.filter((h) => {
    if (subjectFilter && h.subject !== subjectFilter) return false;
    if (filter === "open") return !h.done;
    if (filter === "done") return h.done;
    if (filter === "urgent") return h.urgent && !h.done;
    return true;
  });

  // Compute meta text dynamically
  const openCount   = allHW.filter((h) => !h.done).length;
  const doneCount   = allHW.filter((h) => h.done).length;
  const urgentCount = allHW.filter((h) => h.urgent && !h.done).length;
  const metaText = allHW.length === 0
    ? "Nothing due — enjoy the break"
    : `${openCount} open · ${doneCount} done${urgentCount > 0 ? ` · ${urgentCount} overdue` : ""}`;

  const toggleDone = (id) => {
    const target = HOMEWORK.find((h) => h.id === id);
    if (target) target.done = !target.done;
    const userTarget = store.homework.find((h) => h.id === id);
    if (userTarget) { nbToggleHomework(id); return; }
    setFilter((f) => f); // force re-render
  };

  const deleteHw = (id) => {
    const isUser = store.homework.some((h) => h.id === id);
    if (isUser) { nbDeleteHomework(id); }
    else {
      const idx = HOMEWORK.findIndex((h) => h.id === id);
      if (idx >= 0) HOMEWORK.splice(idx, 1);
      setFilter((f) => f);
    }
    window.dispatchEvent(new CustomEvent("toast", { detail: "Task deleted" }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Workload · this week"
        title="Homework,"
        italic="all of it."
        meta={metaText}
        actions={<>
          <button className={`sn-btn ${showSubjectFilter ? "primary" : "ghost"}`} onClick={() => setShowSubjectFilter((v) => !v)}>Filter</button>
          <button className="sn-btn primary" onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd", { detail: { type: "homework" } }))}>+ Add</button>
        </>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: showSubjectFilter ? 10 : 16, flexWrap: "wrap" }}>
        {[["all","All"],["open","Open"],["urgent","Urgent"],["done","Completed"]].map(([k, l]) => (
          <button key={k} className={`sn-btn ${filter === k ? "primary" : ""}`} onClick={() => setFilter(k)} style={{ padding: "5px 12px", fontSize: 12 }}>
            {l}
            <span className="mono" style={{ opacity: 0.6, marginLeft: 4 }}>
              {allHW.filter((h) => k === "all" ? true : k === "open" ? !h.done : k === "done" ? h.done : (h.urgent && !h.done)).length}
            </span>
          </button>
        ))}
      </div>

      {showSubjectFilter && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", padding: 12, background: "var(--bg-2)", borderRadius: 4, animation: "fade-up 0.18s ease" }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", alignSelf: "center", marginRight: 4 }}>Subject:</span>
          <button onClick={() => setSubjectFilter(null)} style={{
            padding: "4px 10px", border: "1px solid " + (subjectFilter === null ? "var(--ink)" : "var(--hairline)"),
            background: subjectFilter === null ? "var(--ink)" : "var(--surface)",
            color: subjectFilter === null ? "var(--bg)" : "var(--ink-2)",
            borderRadius: 3, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit",
          }}>All subjects</button>
          {SUBJECTS.filter((s) => allHW.some((h) => h.subject === s.id)).map((s) => (
            <button key={s.id} onClick={() => setSubjectFilter(s.id)} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 10px", border: "1px solid " + (subjectFilter === s.id ? "var(--ink)" : "var(--hairline)"),
              background: subjectFilter === s.id ? "var(--ink)" : "var(--surface)",
              color: subjectFilter === s.id ? "var(--bg)" : "var(--ink)",
              borderRadius: 3, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 1, background: s.color }}></span>
              {s.short}
            </button>
          ))}
        </div>
      )}

      <div className="sn-card" style={{ padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "22px 8px 1fr auto auto 24px", gap: 12, padding: "10px 22px", borderBottom: "1px solid var(--hairline)", fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <div></div>
          <div></div>
          <div>Task</div>
          <div>Due · estimate</div>
          <div></div>
          <div></div>
        </div>
        <div style={{ padding: "0 22px" }}>
          <HomeworkList items={filtered} onOpen={(h) => { window.location.hash = "#/homework/" + h.id; }} onDelete={(id) => deleteHw(id)} />
          {filtered.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18 }}>
              No homework matches that filter. ✓
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        ↳ Click a row to open · drag to reorder · checkbox to complete
      </div>

      <div style={{ marginTop: 28 }}>
        <CanvasSyncBar onOpenSetup={onOpenCanvas || (() => window.dispatchEvent(new Event("openCanvasSetup")))} />
        <CanvasHomeworkSection onOpenSetup={onOpenCanvas || (() => window.dispatchEvent(new Event("openCanvasSetup")))} />
      </div>
    </>
  );
}

// ── Homework Detail Page — two-column: content left, AI panel right ──
function HomeworkDetailPage({ hwId }) {
  const store = useNbStore();
  const allHW = [...HOMEWORK, ...store.homework];
  const hw = allHW.find((h) => h.id === hwId);

  const saved = nbGetNoteOverride("hw-" + hwId) || {};
  const [content, setContent] = React.useState(saved.content || "");
  const [done, setDone] = React.useState(hw ? hw.done : false);
  const ceRef = React.useRef(null);
  const ceInitialized = React.useRef(false);

  React.useEffect(() => {
    if (ceRef.current && !ceInitialized.current) {
      ceRef.current.innerHTML = saved.content || "";
      ceInitialized.current = true;
    }
  }, []);

  if (!hw) {
    return (
      <div style={{ padding: "60px 56px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontStyle: "italic", color: "var(--ink-3)" }}>Homework not found.</div>
        <button className="sn-btn primary" onClick={() => window.location.hash = "#/homework"} style={{ marginTop: 18 }}>← Back to Homework</button>
      </div>
    );
  }

  const s = subjectBy(hw.subject);
  const isDone = done || hw.done;

  const mdToHtml = (md) => {
    const CALLOUTS = {
      TIP:       { bg: "#f0f9f4", border: "#6b8e5a", icon: "💡", label: "Tip",       color: "#2d6b3a" },
      NOTE:      { bg: "#eef4ff", border: "#5a7a99", icon: "📌", label: "Note",      color: "#2a4a7a" },
      IMPORTANT: { bg: "#fffbee", border: "#b58a3b", icon: "⭐", label: "Important", color: "#7a5a00" },
      WARNING:   { bg: "#fff4f4", border: "#c04040", icon: "⚠️", label: "Warning",   color: "#8a2020" },
      CAUTION:   { bg: "#fff4f4", border: "#c04040", icon: "🚨", label: "Caution",   color: "#8a2020" },
      EXAMPLE:   { bg: "#f5f0ff", border: "#7a4e6e", icon: "✅", label: "Example",   color: "#4a2060" },
    };
    const blocks = [];
    const stash = (html) => { const i = blocks.length; blocks.push(html); return `__NB_BLOCK_${i}__`; };

    let h = md;

    // 1. Stash code blocks before any escaping
    h = h.replace(/```mermaid\n?([\s\S]*?)```/g, (_, code) => stash(
      `<pre style="background:#f5f4f0;border:1px solid var(--hairline);border-radius:8px;padding:14px 16px;font-size:11.5px;overflow-x:auto;color:var(--ink-2);font-family:var(--f-mono);line-height:1.6;margin:10px 0"><span style="display:block;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink-3);margin-bottom:8px">🔀 Mermaid Diagram</span>${code.trim()}</pre>`));
    h = h.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => stash(
      `<pre style="background:var(--bg-2);border:1px solid var(--hairline);border-radius:6px;padding:10px 12px;font-size:12px;font-family:var(--f-mono);margin:8px 0">${code.trim()}</pre>`));

    // 2. Stash callout boxes
    h = h.replace(/^> \[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION|EXAMPLE)\]\n((?:> [^\n]*\n?)*)/gm, (_, type, body) => {
      const cd = CALLOUTS[type] || CALLOUTS.NOTE;
      const content = body.replace(/^> ?/gm, "").trim()
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
      return stash(`<div style="border-left:3px solid ${cd.border};background:${cd.bg};border-radius:0 8px 8px 0;padding:10px 14px;margin:10px 0"><div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${cd.color};margin-bottom:5px">${cd.icon} ${cd.label}</div><div style="font-size:13px;line-height:1.65">${content.replace(/\n/g, "<br>")}</div></div>`);
    });

    // 3. HTML-escape the remaining text
    h = h.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // 4. Tables
    h = h.replace(/((?:\|.+\|\n)+)/g, (table) => {
      const rows = table.trim().split("\n").filter(r => !/^\|[-| :]+\|$/.test(r.trim()));
      const html = rows.map((r, i) => {
        const cells = r.split("|").slice(1, -1);
        const tag = i === 0 ? "th" : "td";
        const thStyle = "padding:8px 12px;border:1px solid var(--hairline);background:var(--bg-2);font-weight:600;font-size:11.5px;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-3);";
        const tdStyle = "padding:7px 12px;border:1px solid var(--hairline);font-size:13px;";
        return `<tr>${cells.map(c => `<${tag} style="${i === 0 ? thStyle : tdStyle}">${c.trim()}</${tag}>`).join("")}</tr>`;
      });
      return `<div style="overflow-x:auto;margin:12px 0"><table style="border-collapse:collapse;width:100%;font-size:13px">${html.join("")}</table></div>`;
    });

    // 5. Headings
    h = h.replace(/^# (.+)$/gm, '<h1 style="font-family:var(--f-display);font-size:22px;font-weight:700;margin:24px 0 10px;color:var(--ink)">$1</h1>');
    h = h.replace(/^## (.+)$/gm, '<h2 style="font-family:var(--f-display);font-size:17px;font-weight:700;margin:20px 0 7px;color:var(--ink);padding-bottom:5px;border-bottom:1px solid var(--hairline)">$1</h2>');
    h = h.replace(/^### (.+)$/gm, '<h3 style="font-family:var(--f-display);font-size:14.5px;font-weight:600;margin:14px 0 5px;color:var(--ink)">$1</h3>');

    // 6. Bold + italic + inline code
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink)">$1</strong>');
    h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
    h = h.replace(/`([^`]+)`/g, '<code style="background:var(--bg-2);padding:1px 5px;border-radius:3px;font-family:var(--f-mono);font-size:11.5px">$1</code>');

    // 7. Lists
    h = h.replace(/^[-•*] (.+)$/gm, '<li style="margin:3px 0;padding-left:2px">$1</li>');
    h = h.replace(/^\d+\. (.+)$/gm, '<li style="margin:3px 0;padding-left:2px">$1</li>');
    h = h.replace(/(<li[^>]*>[\s\S]*?<\/li>)(\n<li)/g, '$1$2');
    h = h.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, m => `<ul style="padding-left:20px;margin:6px 0">${m}</ul>`);

    // 8. Horizontal rules
    h = h.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--hairline);margin:18px 0">');

    // 9. Restore stashed blocks
    h = h.replace(/__NB_BLOCK_(\d+)__/g, (_, i) => blocks[+i]);

    // 10. Remaining newlines
    h = h.replace(/\n/g, "<br>");
    return h;
  };

  const insertNotes = (text) => {
    if (!ceRef.current) return;
    const html = mdToHtml(text);
    ceRef.current.innerHTML = html;
    nbUpdateNoteContent("hw-" + hwId, { content: html });
    setContent(html);
    window.dispatchEvent(new CustomEvent("toast", { detail: "Notes inserted ✓" }));
  };

  const toggleDone = () => {
    nbToggleHomework(hw.id);
    const builtIn = HOMEWORK.find(h => h.id === hw.id);
    if (builtIn) builtIn.done = !builtIn.done;
    setDone(d => !d);
    window.dispatchEvent(new CustomEvent("toast", { detail: done ? "Marked as open" : "Marked as done ✓" }));
  };

  const deleteHw = () => {
    if (!window.confirm(`Delete "${hw.title}"?`)) return;
    const isUser = store.homework.some(h => h.id === hw.id);
    if (isUser) { nbDeleteHomework(hw.id); }
    else {
      const idx = HOMEWORK.findIndex(h => h.id === hw.id);
      if (idx >= 0) HOMEWORK.splice(idx, 1);
    }
    window.dispatchEvent(new CustomEvent("toast", { detail: "Task deleted" }));
    window.location.hash = "#/homework";
  };

  return (
    <div style={{ display: "flex", width: "100%", overflow: "hidden" }}>

      {/* ── Left: main content ── */}
      <div style={{ flex: 1, padding: "32px 48px 40px", overflowY: "auto", minWidth: 0 }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <button onClick={() => window.location.hash = "#/homework"}
            style={{ border: 0, background: "transparent", color: "var(--accent)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 11, padding: 0, display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
            ← Homework
          </button>
          <span style={{ color: "var(--hairline)" }}>/</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)" }}>{s.short}</span>
        </div>

        {/* Header */}
        <div style={{ borderLeft: "3px solid " + s.color, paddingLeft: 16, marginBottom: 20 }}>
          {/* Meta pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "3px 9px", borderRadius: 100,
              background: s.color + "22", color: s.color,
            }}>{s.short}</span>
            {hw.tag && <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
              padding: "3px 9px", borderRadius: 100,
              background: "var(--bg-2)", color: "var(--ink-3)",
            }}>{hw.tag}</span>}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 100,
              background: "#fef3d8", color: "#9a6a08",
            }}>⏰ {hw.due}{hw.dueNote ? ` · ${hw.dueNote}` : ""}</span>
            {hw.est && <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)" }}>{hw.est}</span>}
            {isDone && <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--done)", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid var(--done)", borderRadius: 3, padding: "1px 6px" }}>Done</span>}
            {hw.urgent && !isDone && <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid var(--accent)", borderRadius: 3, padding: "1px 6px" }}>Urgent</span>}
          </div>
          {/* Title */}
          <div style={{ fontFamily: "var(--f-display)", fontSize: 34, lineHeight: 1.15, letterSpacing: "-0.01em", textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--ink-3)" : "var(--ink)" }}>
            {hw.title}
          </div>
        </div>

        {/* Action row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, alignItems: "center" }}>
          <button className={`sn-btn ${isDone ? "ghost" : "primary"}`} onClick={toggleDone} style={{ fontSize: 12.5 }}>
            {isDone ? "↩ Mark as open" : "✓ Mark as done"}
          </button>
          <button className="sn-btn ghost" onClick={() => window.location.hash = "#/subject/" + hw.subject + "/notes"} style={{ fontSize: 12.5 }}>
            Open {s.short} notes →
          </button>
          <button onClick={deleteHw} style={{
            marginLeft: "auto", border: "none", background: "transparent",
            color: "#b84040", cursor: "pointer", fontSize: 12.5,
            padding: "6px 8px", opacity: 0.65, fontFamily: "inherit",
          }}>Delete</button>
        </div>

        {/* Notes area */}
        <div style={{ marginBottom: 32 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            Notes about this assignment
          </div>
          <style>{`[contenteditable][data-placeholder]:empty::before { content: attr(data-placeholder); color: var(--ink-3); pointer-events: none; display: block; font-style: italic; }`}</style>
          <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "14px 16px", boxShadow: "0 1px 0 var(--rule)", minHeight: 110 }}>
            <div
              ref={ceRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Write anything — instructions, your approach, questions to ask, links…"
              onInput={(e) => {
                const html = e.currentTarget.innerHTML;
                setContent(html);
                nbUpdateNoteContent("hw-" + hwId, { content: html });
              }}
              style={{
                outline: "none", minHeight: 80, fontSize: 13.5, lineHeight: 1.7,
                color: "var(--ink)", fontFamily: "inherit", whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            />
          </div>
        </div>

        {/* Attachments */}
        <HomeworkAttachments hwId={hwId} subjectColor={s.color} />
      </div>

      {/* ── Right: AI panel ── */}
      <HomeworkAIPanel hw={hw} hwId={hwId} onInsertNotes={insertNotes} />
    </div>
  );
}

// ── Homework Attachments (PDF / image import) ──
function HomeworkAttachments({ hwId, subjectColor }) {
  const store = useNbStore();
  const files = store.attachmentsFor("hw", hwId);
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
      await nbAddAttachment("hw", hwId, f);
    }
    setUploading(false);
    window.dispatchEvent(new CustomEvent("toast", { detail: "Attached ✓" }));
  };

  const openFile = (file) => {
    const w = window.open();
    if (!w) return;
    if (file.type.startsWith("image/")) {
      w.document.write(`<title>${file.name}</title><body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh"><img src="${file.url}" style="max-width:100vw;max-height:100vh"/></body>`);
    } else {
      w.location.href = file.url;
    }
  };

  const extOf = (name) => {
    const parts = name.split(".");
    return parts.length > 1 ? "." + parts.pop().toUpperCase() : "FILE";
  };

  return (
    <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px dashed var(--hairline)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Attachments · <span style={{ color: "var(--ink)" }}>{files.length}</span>
        </div>
        <button className="sn-btn ghost" onClick={() => inputRef.current && inputRef.current.click()} style={{ fontSize: 11.5 }}>+ Add file</button>
      </div>
      <input ref={inputRef} type="file" multiple accept="application/pdf,image/*,.doc,.docx,.txt,.pptx,.xlsx"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        style={{ display: "none" }}
      />

      {files.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, marginBottom: 12 }}>
          {files.map((f) => {
            const isImage = f.type.startsWith("image/");
            const ext = extOf(f.name);
            return (
              <div key={f.id} style={{
                border: "1px solid var(--hairline)", borderRadius: 5, overflow: "hidden",
                background: "var(--surface)", position: "relative",
              }}>
                <div onClick={() => openFile(f)} style={{
                  height: 60, background: subjectColor ? subjectColor + "18" : "var(--bg-2)", display: "grid", placeItems: "center",
                  borderBottom: "1px solid var(--hairline)", cursor: "pointer", overflow: "hidden",
                }}>
                  {isImage ? (
                    <img src={f.url} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 12.5, fontWeight: 600, color: subjectColor || "var(--accent)", letterSpacing: "0.05em" }}>{ext}</div>
                  )}
                </div>
                <div onClick={() => openFile(f)} style={{ padding: "5px 7px", cursor: "pointer" }}>
                  <div style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink)" }}>{f.name}</div>
                  <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", marginTop: 1 }}>{(f.size / 1024).toFixed(0)} KB</div>
                </div>
                <button onClick={() => nbRemoveAttachment("hw", hwId, f.id)} style={{
                  position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: 9,
                  border: "1px solid var(--hairline)", background: "var(--surface)",
                  color: "var(--ink-3)", cursor: "pointer", fontSize: 12, lineHeight: 1,
                  display: "grid", placeItems: "center",
                }}>×</button>
              </div>
            );
          })}
        </div>
      )}

      <div
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: "1.5px dashed " + (dragOver ? "var(--accent)" : "var(--hairline)"),
          borderRadius: 6, padding: "16px 14px",
          background: dragOver ? "var(--accent-soft)" : (uploading ? "var(--bg-2)" : "transparent"),
          textAlign: "center", cursor: "pointer", transition: "all 0.15s ease",
        }}
      >
        <div style={{ fontFamily: "var(--f-display)", fontSize: 15, color: "var(--ink-2)", fontStyle: "italic" }}>
          {uploading ? "Uploading…" : dragOver ? "Drop to attach" : "Drag a PDF or image here, or click to browse"}
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>
          PDF · DOC · IMG · TXT · up to 20 MB
        </div>
      </div>
    </div>
  );
}

// ── Homework AI Help — right sidebar ──
function HomeworkAIPanel({ hw, hwId, onInsertNotes }) {
  const store = useNbStore();
  const [activeKey, setActiveKey] = React.useState(null);
  const [response, setResponse] = React.useState("");
  const [loadingPhase, setLoadingPhase] = React.useState("");
  const s = subjectBy(hw.subject);
  const sName = s ? s.name : "class";

  const attachments = store.attachmentsFor("hw", hwId);
  const pdfs = attachments.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));

  const extractPdfText = async (file) => {
    try {
      const lib = window.pdfjsLib;
      if (!lib) return null;
      const task = lib.getDocument({ url: file.url });
      const pdf = await task.promise;
      const pages = Math.min(pdf.numPages, 20);
      const parts = [];
      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        parts.push(content.items.map((it) => it.str).join(" "));
      }
      return parts.join("\n\n").trim();
    } catch (e) {
      console.warn("[PDF extract]", file.name, e);
      return null;
    }
  };

  const buildPrompt = (baseMsg, pdfContext) => {
    if (!pdfContext) return baseMsg;
    return `${baseMsg}\n\nThe student has attached the following assignment material as a PDF — use it to give specific, accurate help:\n\n${pdfContext}`;
  };

  const prompts = [
    { label: "Explain this",     desc: "Break down what's being asked",        icon: "💡", key: "explain",   msg: `I have a homework assignment for ${sName}: "${hw.title}". In 3-4 sentences, explain what this assignment is asking me to do and what the learning goal of it is.` },
    { label: "Outline approach", desc: "Get a step-by-step plan",              icon: "📐", key: "outline",   msg: `I have homework for ${sName}: "${hw.title}". Give me a clear numbered step-by-step outline for how to approach and complete this assignment effectively.` },
    { label: "Break it down",    desc: "Split into smaller tasks",             icon: "🧩", key: "breakdown", msg: `Break down this homework assignment into 5-6 small, manageable sub-tasks I can check off one at a time: ${sName} — "${hw.title}". List them as numbered steps, each on its own line.` },
    { label: "Key concepts",     desc: "What to study beforehand",             icon: "🔑", key: "concepts",  msg: `For my ${sName} assignment "${hw.title}", what are the 4-5 key concepts, formulas, or topics I should know or review before starting? Be specific and concise.` },
    { label: "Generate notes",   desc: "Draft structured notes — insertable",  icon: "📝", key: "notes",     msg: `You are an expert AP teacher and premium study guide designer. Your output should look like a "YouTube productivity guru" study system — NOT a textbook.\n\nTransform this ${sName} assignment into HIGHLY VISUAL premium study notes: "${hw.title}"\n\nREQUIRED — include ALL of these:\n📊 COMPARISON TABLES — always tables over paragraphs\n🔀 MERMAID DIAGRAMS — at least one flowchart, concept map, or process diagram\n🧠 MEMORY TRICKS — mnemonics, word associations, acronyms for every key term\n💡 CALLOUT BOXES — use exactly this syntax:\n  > [!TIP]\\n  > content here\n  > [!IMPORTANT]\\n  > content here\n  > [!WARNING]\\n  > content here\n  > [!NOTE]\\n  > content here\n📝 PRACTICE QUESTIONS — 3-5 with answers\n✅ EXAMPLES + ❌ NON-EXAMPLES — always paired\n🎯 EXAM TIPS — specific and actionable\n⚠️ COMMON MISTAKES — at least 3, formatted as ❌ bullet list\n🔑 KEY VOCAB — bolded, defined in a table\n⚡ QUICK REVIEW — 30-second bullet list at the very end\n❓ WHY THIS MATTERS — one punchy sentence per major concept\n\nFORMATTING RULES:\n- Clean Markdown, # ## ### headings with emojis\n- Bold ALL important terms: **term**\n- Tables over prose always\n- Mermaid in fenced code blocks (triple-backtick mermaid ... triple-backtick)\n- Callout boxes use > [!TYPE] syntax above — include at least 4\n- Bullet points only — NO paragraphs\n- Short punchy sentences\n\nOPTIMIZE FOR: ADHD-friendly fast scanning, visual learners, high retention, exam performance.\nDO NOT write textbook-style notes.` },
  ];

  const run = async (prompt) => {
    if (loadingPhase) return;
    setActiveKey(prompt.key);
    setResponse("");
    let pdfContext = "";
    if (pdfs.length > 0) {
      setLoadingPhase("reading");
      const texts = await Promise.all(pdfs.map((f) => extractPdfText(f)));
      texts.forEach((text, i) => {
        if (text) pdfContext += `\n\n--- ${pdfs[i].name} ---\n${text.slice(0, 4000)}`;
      });
    }
    setLoadingPhase("thinking");
    try {
      const result = await aiComplete(buildPrompt(prompt.msg, pdfContext.trim()));
      setResponse(result || "No response.");
    } catch (e) {
      console.error("[HomeworkAI] aiComplete error:", e.message, e);
      if (e.message === "no-key" || e.message === "invalid-key") {
        setResponse("__no-key__");
      } else if (e.message === "fetch-failed") {
        setResponse("Network request blocked — open the app at http://localhost:3131 instead of the preview.");
      } else {
        setResponse(`Error: ${e.message}`);
      }
    }
    setLoadingPhase("");
  };

  const loading = !!loadingPhase;

  return (
    <div style={{
      width: 292, flexShrink: 0,
      borderLeft: "1px solid var(--hairline)",
      background: "var(--surface)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--hairline)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ color: "var(--accent)", fontSize: 15, fontFamily: "var(--f-display)", fontStyle: "italic" }}>✦</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>AI Help</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Ask anything about this assignment</div>
        {pdfs.length > 0 && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5, marginTop: 9,
            padding: "3px 9px", borderRadius: 6,
            background: "var(--accent-soft)", color: "var(--accent-ink)",
            fontSize: 10.5, fontWeight: 600, fontFamily: "var(--f-mono)",
            border: "1px solid var(--hairline)",
          }}>
            📎 {pdfs.length} PDF{pdfs.length > 1 ? "s" : ""} included
          </div>
        )}
      </div>

      {/* Quick action chips */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--hairline)", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Quick actions</div>
        {prompts.map((p) => {
          const isActive = activeKey === p.key && (loading || response);
          return (
            <button key={p.key} onClick={() => run(p)} disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 11px", borderRadius: 8, textAlign: "left", width: "100%",
                border: "1px solid " + (isActive ? "var(--accent)" : "var(--hairline)"),
                background: isActive ? "var(--accent-soft)" : "var(--bg)",
                cursor: loading ? "default" : "pointer",
                transition: "all .12s",
              }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", lineHeight: 1.3 }}>{p.label}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>{p.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Response area */}
      <div style={{ flex: 1, padding: "14px 16px", overflowY: "auto" }}>
        {!loading && !response ? (
          <div style={{ textAlign: "center", padding: "32px 12px", color: "var(--ink-3)" }}>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 26, marginBottom: 10, color: "var(--accent)" }}>✦</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>Choose a quick action above or ask your own question about this assignment.</div>
          </div>
        ) : loading ? (
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--ink-3)", fontSize: 14, padding: "8px 0" }}>
            {loadingPhase === "reading" ? `Reading ${pdfs.length} PDF${pdfs.length > 1 ? "s" : ""}…` : "Thinking…"}
          </div>
        ) : response === "__no-key__" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0" }}>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>Connect your Anthropic API key to use AI Help.</div>
            <button className="sn-btn primary" style={{ fontSize: 12, alignSelf: "flex-start" }}
              onClick={() => window.dispatchEvent(new Event("openApiKeyModal"))}>
              ✦ Connect AI
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 13.5, lineHeight: 1.75, whiteSpace: "pre-wrap", color: "var(--ink)" }}>
              {response}
            </div>
            {activeKey === "notes" && onInsertNotes && (
              <button
                onClick={() => onInsertNotes(response)}
                className="sn-btn primary"
                style={{ marginTop: 14, fontSize: 12, width: "100%", justifyContent: "center" }}
              >
                ↑ Insert into notes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { HomeworkList, HomeworkPage, HomeworkContent, HomeworkDetailPage });
