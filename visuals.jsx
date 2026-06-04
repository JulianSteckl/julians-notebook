// Editorial / notebook visual kit — subject glyphs, ornaments, hatched fills, paper textures.
// Loaded after shell.jsx, before dashboard.jsx.

/* global SUBJECTS */

// ────────────────────────────────────────────────────────────────────
// Subject monograms — small monoline SVG marks chosen by subject id keyword.
// All marks are designed on a 24×24 grid, stroked, currentColor.
// Use <SubjectGlyph subject={id} size={N} /> anywhere a dot appears.

const _GLYPHS = {
  // Literature / English — open book
  lit: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5.5C6 5 9 5 12 6.5C15 5 18 5 21 5.5V19C18 18.5 15 18.5 12 20C9 18.5 6 18.5 3 19V5.5Z" />
      <path d="M12 6.5V20" />
    </g>
  ),
  // Biology — leaf with vein
  bio: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19C5 11 11 5 19 5C19 13 13 19 5 19Z" />
      <path d="M5 19L13 11" />
    </g>
  ),
  // Algebra / Math — integral
  alg: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M9 21C9 21 15 21 15 12C15 3 9 3 9 3" />
    </g>
  ),
  math: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M9 21C9 21 15 21 15 12C15 3 9 3 9 3" />
    </g>
  ),
  // History — ionic column
  hist: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5H19" />
      <path d="M5 5L5 7M19 5L19 7" />
      <path d="M7 7V18M12 7V18M17 7V18" />
      <path d="M4 18H20" />
      <path d="M4 21H20" />
    </g>
  ),
  // Spanish / Language — speech with diacritic
  spanish: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13C4 8.5 7.5 6 12 6C16.5 6 20 8.5 20 13C20 17.5 16.5 20 12 20H7L4 22V13Z" />
      <path d="M9 4L11 2M15 4L13 2" />
    </g>
  ),
  lang: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13C4 8.5 7.5 6 12 6C16.5 6 20 8.5 20 13C20 17.5 16.5 20 12 20H7L4 22V13Z" />
      <path d="M9 4L11 2M15 4L13 2" />
    </g>
  ),
  french: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13C4 8.5 7.5 6 12 6C16.5 6 20 8.5 20 13C20 17.5 16.5 20 12 20H7L4 22V13Z" />
      <path d="M9 4L11 2M15 4L13 2" />
    </g>
  ),
  // Chemistry — erlenmeyer flask
  chem: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H15" />
      <path d="M10 3V9L5 20C4.5 21 5.3 22 6.5 22H17.5C18.7 22 19.5 21 19 20L14 9V3" />
      <path d="M7.5 16H16.5" />
    </g>
  ),
  // Studio art — brush
  art: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21C3 21 5 21 7 19C9 17 9 14 9 14L10 13" />
      <path d="M10 13L14 8C15 7 16.5 7 17.5 8C18.5 9 18.5 10.5 17.5 11.5L13 16" />
      <path d="M13 16L9 14" />
      <circle cx="19" cy="5" r="1.5" />
    </g>
  ),
  // Phys ed — triangle ruler
  phys: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20L20 4L20 20L4 20Z" />
      <path d="M8 20V18M12 20V16M16 20V12" />
    </g>
  ),
  pe: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20L20 4L20 20L4 20Z" />
      <path d="M8 20V18M12 20V16M16 20V12" />
    </g>
  ),
  // Computer / CS — angle brackets
  cs: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6L3 12L9 18" />
      <path d="M15 6L21 12L15 18" />
    </g>
  ),
  comp: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6L3 12L9 18" />
      <path d="M15 6L21 12L15 18" />
    </g>
  ),
  // Music
  music: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="18" r="2.5" />
      <circle cx="17" cy="16" r="2.5" />
      <path d="M9.5 18V5L19.5 3V16" />
    </g>
  ),
  // Generic — pilcrow
  _default: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4V20" />
      <path d="M12 4V20" />
      <path d="M12 4H16M12 4C9 4 6 5.5 6 8.5C6 11.5 9 13 12 13" />
    </g>
  ),
};

function _glyphKeyFor(subjectId, subjectName) {
  const hay = ((subjectId || "") + " " + (subjectName || "")).toLowerCase();
  if (/(lit|engl|read|writ)/.test(hay))            return "lit";
  if (/(bio|life|ecol|anat)/.test(hay))            return "bio";
  if (/(alg|trig|geom|calc|stat|math|pre-?calc)/.test(hay)) return "alg";
  if (/(hist|civ|gov|econ|world|us\b|amer)/.test(hay)) return "hist";
  if (/(span|esp|lat|french|fr\b|germ|chin|jap|lang)/.test(hay)) return "spanish";
  if (/(chem)/.test(hay))                          return "chem";
  if (/(art|stud|draw|paint|design)/.test(hay))    return "art";
  if (/(phys.?ed|p\.?e|gym|fit|sport|health)/.test(hay)) return "phys";
  if (/(phys)/.test(hay))                          return "phys";
  if (/(cs|comp|code|prog|software)/.test(hay))    return "cs";
  if (/(music|band|orch|choir)/.test(hay))         return "music";
  return "_default";
}

function SubjectGlyph({ subject, size = 16, color, style, title }) {
  const sb = (typeof subject === "string" && typeof subjectBy === "function") ? subjectBy(subject) : subject;
  const id = sb?.id || (typeof subject === "string" ? subject : "");
  const name = sb?.name || "";
  const key = _glyphKeyFor(id, name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ color: color || sb?.color || "currentColor", flexShrink: 0, ...style }}
      aria-label={title || name || id}
    >
      {_GLYPHS[key] || _GLYPHS._default}
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────
// Printer's ornaments — small SVG flourishes used to separate sections.
// Use <Ornament variant="diamond|flower|asterism|rule" />

function Ornament({ variant = "diamond", size = 18, color = "currentColor", style }) {
  const props = { width: size, height: (size * 12) / 24, viewBox: "0 0 80 40", style, fill: "none", stroke: color, strokeWidth: "1.2", strokeLinecap: "round" };
  if (variant === "asterism") {
    return (
      <svg {...props}>
        <g fill={color} stroke="none">
          <path d="M40 8L42 14L48 16L42 18L40 24L38 18L32 16L38 14Z" />
          <path d="M20 22L21.5 26L26 27L21.5 28L20 32L18.5 28L14 27L18.5 26Z" opacity="0.6" />
          <path d="M60 22L61.5 26L66 27L61.5 28L60 32L58.5 28L54 27L58.5 26Z" opacity="0.6" />
        </g>
      </svg>
    );
  }
  if (variant === "flower") {
    return (
      <svg {...props}>
        <g fill="none" stroke={color} strokeWidth="1.2">
          <path d="M10 20H30" />
          <path d="M50 20H70" />
          <circle cx="40" cy="20" r="3" fill={color} stroke="none" />
          <path d="M40 12C42 16 44 18 48 20C44 22 42 24 40 28C38 24 36 22 32 20C36 18 38 16 40 12Z" />
        </g>
      </svg>
    );
  }
  if (variant === "rule") {
    return (
      <svg {...props}>
        <path d="M2 20H35M45 20H78" stroke={color} strokeWidth="0.8" />
        <circle cx="40" cy="20" r="2" fill={color} stroke="none" />
      </svg>
    );
  }
  // diamond (default)
  return (
    <svg {...props}>
      <path d="M2 20H30" stroke={color} strokeWidth="0.8" />
      <path d="M50 20H78" stroke={color} strokeWidth="0.8" />
      <path d="M40 14L46 20L40 26L34 20Z" fill={color} stroke="none" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────
// HatchBar — progress as diagonal hatching that "fills in" rather than a solid bar.
// Looks like ink wash. Used in subject progress.

function HatchBar({ pct = 0, color = "var(--accent)", height = 8 }) {
  const filledId = "hatch-" + Math.random().toString(36).slice(2, 8);
  const clipId = "clip-" + Math.random().toString(36).slice(2, 8);
  const fillPct = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ position: "relative", height, background: "var(--bg-2)", borderRadius: 2, overflow: "hidden", border: "1px solid var(--hairline)" }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <pattern id={filledId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="2.4" />
          </pattern>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={`${fillPct}%`} height="100%" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${filledId})`} clipPath={`url(#${clipId})`} />
        {/* end tick */}
        {fillPct > 0 && fillPct < 100 && (
          <line x1={`${fillPct}%`} y1="0" x2={`${fillPct}%`} y2="100%" stroke={color} strokeWidth="1.2" opacity="0.6" />
        )}
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// TallyMarks — render a small count as ink tally marks (groups of 5).
// Used in stat counts to add character.

function TallyMarks({ count = 0, color = "currentColor", height = 14, max = 25 }) {
  const n = Math.min(count, max);
  const groups = Math.floor(n / 5);
  const rem = n % 5;
  const all = [];
  for (let g = 0; g < groups; g++) all.push(5);
  if (rem > 0) all.push(rem);
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", color, lineHeight: 1 }}>
      {all.map((g, gi) => (
        <svg key={gi} width={g * 2.5 + 4 + (g === 5 ? 4 : 0)} height={height} viewBox={`0 0 ${g * 3 + 6} 16`} style={{ overflow: "visible" }}>
          <g stroke={color} strokeWidth="1.2" strokeLinecap="round">
            {Array.from({ length: Math.min(g, 4) }).map((_, i) => (
              <line key={i} x1={i * 3 + 2} y1="2" x2={i * 3 + 2} y2="14" />
            ))}
            {g === 5 && <line x1="0" y1="13" x2="14" y2="3" />}
          </g>
        </svg>
      ))}
      {count > max && <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", marginLeft: 2 }}>+{count - max}</span>}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────
// TimeOfDayArc — circular arc showing the current time of day position.
// Used in the dashboard hero / schedule card. radius 40.

function TimeOfDayArc({ minutes = null, size = 90, color = "var(--accent)" }) {
  const now = minutes != null ? minutes : (new Date().getHours() * 60 + new Date().getMinutes());
  // Map 6am (360) → 0deg, 6pm (1080) → 180deg, full day → 360deg
  const dayMins = 24 * 60;
  const angle = ((now / dayMins) * 360 - 90) * Math.PI / 180;
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const px = cx + Math.cos(angle) * r;
  const py = cy + Math.sin(angle) * r;
  // Sun arc from 6am to 6pm
  const sunStart = (-90 + (6 / 24) * 360) * Math.PI / 180;
  const sunEnd = (-90 + (18 / 24) * 360) * Math.PI / 180;
  const arcStartX = cx + Math.cos(sunStart) * r;
  const arcStartY = cy + Math.sin(sunStart) * r;
  const arcEndX = cx + Math.cos(sunEnd) * r;
  const arcEndY = cy + Math.sin(sunEnd) * r;
  // Time labels in mono around the dial
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {/* Dial */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--hairline)" strokeWidth="0.8" strokeDasharray="1 3" />
      {/* Day arc */}
      <path d={`M ${arcStartX} ${arcStartY} A ${r} ${r} 0 0 1 ${arcEndX} ${arcEndY}`} fill="none" stroke="var(--ink-3)" strokeWidth="0.8" opacity="0.45" />
      {/* Tick marks at 6/12/18/0 */}
      {[0, 6, 12, 18].map((h) => {
        const a = (-90 + (h / 24) * 360) * Math.PI / 180;
        const ix = cx + Math.cos(a) * (r - 4);
        const iy = cy + Math.sin(a) * (r - 4);
        const ox = cx + Math.cos(a) * (r + 2);
        const oy = cy + Math.sin(a) * (r + 2);
        return <line key={h} x1={ix} y1={iy} x2={ox} y2={oy} stroke="var(--ink-3)" strokeWidth="0.9" />;
      })}
      {/* N/E/S/W labels */}
      <text x={cx} y={9} textAnchor="middle" style={{ fontFamily: "var(--f-mono)", fontSize: 8, fill: "var(--ink-3)" }}>0</text>
      <text x={size - 4} y={cy + 3} textAnchor="end" style={{ fontFamily: "var(--f-mono)", fontSize: 8, fill: "var(--ink-3)" }}>6</text>
      <text x={cx} y={size - 2} textAnchor="middle" style={{ fontFamily: "var(--f-mono)", fontSize: 8, fill: "var(--ink-3)" }}>12</text>
      <text x={5} y={cy + 3} textAnchor="start" style={{ fontFamily: "var(--f-mono)", fontSize: 8, fill: "var(--ink-3)" }}>18</text>
      {/* Marker */}
      <line x1={cx} y1={cy} x2={px} y2={py} stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx={px} cy={py} r="3" fill={color} />
      <circle cx={cx} cy={cy} r="1.6" fill="var(--ink)" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────
// DropFolio — large italic serif folio number, used decoratively next to "Day N".
// <DropFolio number={42} />

function DropFolio({ number, size = 56, color = "var(--ink)", suffix }) {
  return (
    <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: size, lineHeight: 0.85, color, letterSpacing: "-0.04em", display: "inline-flex", alignItems: "baseline", gap: 4 }}>
      {number}
      {suffix && <span style={{ fontSize: size * 0.4, fontStyle: "normal", color: "var(--ink-3)", fontFamily: "var(--f-mono)", letterSpacing: 0 }}>{suffix}</span>}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────
// WatermarkGlyph — a giant, low-opacity subject glyph used as a card watermark.

function WatermarkGlyph({ subject, opacity = 0.07, size = 220, style }) {
  return (
    <div aria-hidden style={{
      position: "absolute", right: -30, bottom: -30, pointerEvents: "none",
      color: "var(--ink)", opacity, ...style,
    }}>
      <SubjectGlyph subject={subject} size={size} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// StreakMatrix — calendar-style heat matrix (7 wide × N tall) for study streak.

function StreakMatrix({ streak = 0, weeks = 12 }) {
  const days = weeks * 7;
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  // Position today at bottom-right; "i" counts back from today
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const offset = days - 1 - i; // 0 = today
    const isToday = offset === 0;
    const studied = offset < streak;
    cells.push({ studied, isToday, key: i });
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${weeks}, 1fr)`, gridAutoFlow: "column", gap: 3 }}>
      {cells.map((c, idx) => (
        <div key={c.key} className="streak-cell" style={{
          aspectRatio: "1 / 1",
          borderRadius: 2,
          background: c.studied ? "var(--accent)" : "var(--hairline)",
          "--i": idx,
          "--target-opacity": c.studied ? 1 : 0.5,
          boxShadow: c.isToday ? "0 0 0 1.5px var(--ink)" : "none",
        }} />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Stamp — round letterpress-style stamp for "DONE / OVERDUE / NEW" labels.

function Stamp({ text = "DONE", color = "var(--done)", angle = -8, size = 72 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}`,
      color, fontFamily: "var(--f-mono)", fontWeight: 700,
      display: "grid", placeItems: "center",
      letterSpacing: "0.1em",
      fontSize: size * 0.18,
      transform: `rotate(${angle}deg)`,
      opacity: 0.85,
      textTransform: "uppercase",
      background: "transparent",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 5, borderRadius: "50%",
        border: `1px solid ${color}`, opacity: 0.6,
      }}></div>
      {text}
    </div>
  );
}

// Make available globally
Object.assign(window, { SubjectGlyph, Ornament, HatchBar, TallyMarks, TimeOfDayArc, DropFolio, WatermarkGlyph, StreakMatrix, Stamp });
