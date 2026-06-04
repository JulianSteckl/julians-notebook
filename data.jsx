// Mock data for the school notebook

// Load user subjects from onboarding profile if available, else use sample data
const _nbProfile = (() => { try { return JSON.parse(localStorage.getItem("nb-profile-v1") || "null"); } catch { return null; } })();

const SUBJECTS = (_nbProfile && _nbProfile.subjects && _nbProfile.subjects.length > 0)
  ? _nbProfile.subjects
  : [
  { id: "ap-lit",     name: "AP English Literature", short: "AP Lit",  color: "#c8694a", grade: "A-", teacher: "Ms. Halverson",  room: "204", notes: 38, hw: 3, quizzes: 2 },
  { id: "ap-bio",     name: "AP Biology",            short: "Bio",     color: "#6b8e5a", grade: "B+", teacher: "Mr. Okafor",     room: "118", notes: 52, hw: 5, quizzes: 4 },
  { id: "alg2",       name: "Algebra II / Trig",     short: "Alg II",  color: "#5a7a99", grade: "A",  teacher: "Mrs. Chen",      room: "303", notes: 64, hw: 4, quizzes: 6 },
  { id: "us-hist",    name: "U.S. History",          short: "US Hist", color: "#b58a3b", grade: "B",  teacher: "Mr. Delaney",    room: "210", notes: 41, hw: 2, quizzes: 3 },
  { id: "spanish-3",  name: "Spanish III",           short: "Esp 3",   color: "#7a4e6e", grade: "A-", teacher: "Sra. Vargas",    room: "121", notes: 29, hw: 3, quizzes: 5 },
  { id: "chem",       name: "Chemistry",             short: "Chem",    color: "#3f7d8a", grade: "B+", teacher: "Dr. Whitford",   room: "B12", notes: 47, hw: 6, quizzes: 4 },
  { id: "studio-art", name: "Studio Art",            short: "Art",     color: "#b3543b", grade: "A",  teacher: "Ms. Pell",       room: "Annex", notes: 12, hw: 1, quizzes: 0 },
  { id: "phys-ed",    name: "Phys. Ed.",             short: "PE",      color: "#9a9082", grade: "P",  teacher: "Coach Briggs",   room: "Gym", notes: 4,  hw: 0, quizzes: 0 },
];

const _userHasOwnSubjects = _nbProfile && _nbProfile.subjects && _nbProfile.subjects.length > 0;

const HOMEWORK = _userHasOwnSubjects ? [] : [
  { id: "h1", subject: "ap-lit",    title: "Read Beloved, chapters 9–12",                tag: "reading",   due: "Tonight",     dueNote: "11:59 PM", urgent: true,  done: false, est: "45m" },
  { id: "h2", subject: "alg2",      title: "Problem set 7.3 — identities",                tag: "problems",  due: "Tomorrow",    dueNote: "in class", urgent: true,  done: false, est: "30m" },
  { id: "h3", subject: "ap-bio",    title: "Lab report: enzyme kinetics",                 tag: "writing",   due: "Wed",         dueNote: "1500w",    urgent: false, done: false, est: "1h 30m" },
  { id: "h4", subject: "us-hist",   title: "Primary source response — Federalist No. 10", tag: "writing",   due: "Thu",         dueNote: "800w",     urgent: false, done: false, est: "1h" },
  { id: "h5", subject: "spanish-3", title: "Vocabulario unidad 6 — flashcards",            tag: "vocab",     due: "Fri",         dueNote: "30 cards", urgent: false, done: false, est: "20m" },
  { id: "h6", subject: "chem",      title: "Molarity worksheet",                          tag: "problems",  due: "Fri",         dueNote: "10 q",     urgent: false, done: true,  est: "25m" },
  { id: "h7", subject: "alg2",      title: "Watch lecture — inverse functions",           tag: "video",     due: "Mon",         dueNote: "22 min",   urgent: false, done: true,  est: "25m" },
];

const QUIZZES_UPCOMING = _userHasOwnSubjects ? [] : [
  { id: "q1", subject: "ap-bio",    title: "Cellular Respiration",             when: "Thursday",   length: "20 q", confidence: 0.58 },
  { id: "q2", subject: "spanish-3", title: "Pretérito vs. Imperfecto",         when: "Friday",     length: "15 q", confidence: 0.42 },
  { id: "q3", subject: "alg2",      title: "Trig Identities Pop Quiz (likely)", when: "Next week",  length: "10 q", confidence: 0.71 },
];

const RECENT_NOTES = _userHasOwnSubjects ? [] : [
  { id: "n1", subject: "ap-lit",   title: "Beloved — motifs of memory",                  excerpt: "Sethe's milk as both nourishment and theft. Sweet Home is a fiction…", when: "2h ago" },
  { id: "n2", subject: "ap-bio",   title: "Krebs cycle (citric acid cycle)",              excerpt: "Acetyl-CoA enters, cycle produces 3 NADH, 1 FADH2, 1 GTP per turn…",       when: "yesterday" },
  { id: "n3", subject: "alg2",     title: "Double-angle identities",                      excerpt: "sin(2θ) = 2 sinθ cosθ. cos(2θ) has three forms — pick by what cancels.", when: "yesterday" },
  { id: "n4", subject: "us-hist",  title: "Federalist No. 10 — factions",                 excerpt: "Madison: the cure for the mischiefs of faction is in the extent…",         when: "3d ago" },
];

const SCHEDULE_TODAY = _userHasOwnSubjects ? [] : [
  { time: "8:10",  end: "9:00",  subject: "ap-lit",    room: "204",   note: "Beloved discussion — Pt II" },
  { time: "9:10",  end: "10:00", subject: "alg2",      room: "303",   note: "Quiz returned" },
  { time: "10:10", end: "11:00", subject: "ap-bio",    room: "118",   note: "Lab — enzyme kinetics" },
  { time: "11:10", end: "11:40", subject: null,        room: "Caf",   note: "Lunch A" },
  { time: "12:00", end: "12:50", subject: "spanish-3", room: "121",   note: "Subjuntivo intro" },
  { time: "1:00",  end: "1:50",  subject: "us-hist",   room: "210",   note: "Federalist papers" },
  { time: "2:00",  end: "2:50",  subject: "studio-art", room: "Annex", note: "Charcoal still life" },
];

const WEEK = _userHasOwnSubjects ? [
  { day: "Mon", date: 18, items: [] },
  { day: "Tue", date: 19, items: [] },
  { day: "Wed", date: 20, today: true, items: [] },
  { day: "Thu", date: 21, items: [] },
  { day: "Fri", date: 22, items: [] },
  { day: "Sat", date: 23, items: [] },
  { day: "Sun", date: 24, items: [] },
] : [
  { day: "Mon", date: 18, items: [{ subject: "alg2", note: "Quiz" }, { subject: "ap-lit", note: "Discussion" }] },
  { day: "Tue", date: 19, items: [{ subject: "ap-bio", note: "Lab due" }, { subject: "spanish-3", note: "Oral" }] },
  { day: "Wed", date: 20, today: true, items: [{ subject: "ap-lit", note: "Beloved Pt II" }, { subject: "us-hist", note: "Fed #10" }, { subject: "chem", note: "Worksheet" }] },
  { day: "Thu", date: 21, items: [{ subject: "ap-bio", note: "Quiz: Resp." }, { subject: "alg2", note: "PS 7.4" }] },
  { day: "Fri", date: 22, items: [{ subject: "spanish-3", note: "Quiz: Pret." }, { subject: "studio-art", note: "Critique" }] },
  { day: "Sat", date: 23, items: [] },
  { day: "Sun", date: 24, items: [{ subject: "ap-bio", note: "Lab report draft" }] },
];

const FLASHCARDS_BIO = [
  { front: "Glycolysis", back: "Cytoplasmic breakdown of glucose → 2 pyruvate. Net 2 ATP + 2 NADH. Anaerobic." },
  { front: "Krebs cycle", back: "Mitochondrial matrix. Per turn: 3 NADH, 1 FADH₂, 1 GTP, 2 CO₂." },
  { front: "Electron transport chain", back: "Inner mitochondrial membrane. NADH/FADH₂ donate e⁻ → pumps H⁺ → ATP synthase. Final acceptor: O₂." },
  { front: "ATP yield (aerobic)", back: "~30–32 ATP per glucose, varying by NADH shuttle." },
];

const DECKS = {
  "bio-respiration": {
    subject: "ap-bio", title: "Cellular respiration",
    cards: FLASHCARDS_BIO,
  },
  "esp-u6": {
    subject: "spanish-3", title: "Vocab Unidad 6",
    cards: [
      { front: "olvidar", back: "to forget" },
      { front: "el recuerdo", back: "memory" },
      { front: "soñar", back: "to dream" },
      { front: "el sueño", back: "dream" },
      { front: "el pasado", back: "the past" },
      { front: "regresar", back: "to return / go back" },
    ],
  },
  "lit-beloved": {
    subject: "ap-lit", title: "Beloved — characters",
    cards: [
      { front: "Sethe", back: "Escaped enslaved woman; mother of Denver and Beloved. Killed her daughter to prevent her recapture." },
      { front: "Denver", back: "Sethe's surviving daughter; isolated, eventually steps into community and adulthood." },
      { front: "Paul D", back: "Former Sweet Home man; arrives at 124 carrying his 'tin tobacco box' of repressed memory." },
      { front: "Beloved", back: "Ghost / embodied returnee; the daughter Sethe killed, or so it's implied." },
      { front: "Schoolteacher", back: "Sweet Home overseer after Mr. Garner; embodies clinical, dehumanizing white supremacy." },
    ],
  },
  "alg2-trig": {
    subject: "alg2", title: "Trig identities",
    cards: [
      { front: "sin²θ + cos²θ", back: "= 1" },
      { front: "sin(2θ)", back: "= 2 sinθ cosθ" },
      { front: "cos(2θ)", back: "= cos²θ − sin²θ = 1 − 2sin²θ = 2cos²θ − 1" },
      { front: "tan(2θ)", back: "= 2 tanθ / (1 − tan²θ)" },
      { front: "sin(α + β)", back: "= sinα cosβ + cosα sinβ" },
      { front: "cos(α + β)", back: "= cosα cosβ − sinα sinβ" },
    ],
  },
  "us-fed": {
    subject: "us-hist", title: "Federalist Papers",
    cards: [
      { front: "Federalist No. 10", back: "Madison — the cure for factions is a large, diverse republic." },
      { front: "Federalist No. 51", back: "Madison — ambition must counteract ambition; checks & balances." },
      { front: "Federalist No. 78", back: "Hamilton — judiciary is the 'least dangerous branch'; judicial review." },
    ],
  },
  "chem-periodic": {
    subject: "chem", title: "Periodic trends",
    cards: [
      { front: "Atomic radius — across a period", back: "Decreases left → right (greater nuclear pull)." },
      { front: "Ionization energy — down a group", back: "Decreases (outer e⁻ further from nucleus, more shielded)." },
      { front: "Electronegativity", back: "Pull on shared electrons. Increases ↗ to F." },
      { front: "Metallic character", back: "Increases ↙ — opposite of EN trend." },
    ],
  },
};

const _fallbackSubject = { id: "unknown", name: "Unknown", short: "?", color: "#9a9082", grade: "—", teacher: "", room: "", notes: 0, hw: 0, quizzes: 0 };
const subjectBy = (id) => SUBJECTS.find((s) => s.id === id) || _fallbackSubject;
const deckBy = (id) => DECKS[id];

// Per-subject notes — id, unit, title, when, then either content blocks or auto-generated placeholder.
const NOTES_BY_SUBJECT = {
  "ap-lit": {
    units: ["Unit 6 · Beloved (Morrison)", "Unit 5 · The Great Gatsby"],
    notes: [
      { id: "lit-motifs", unit: 0, title: "Beloved — motifs of memory", when: "2h ago", tags: ["#beloved", "#unit-6", "#essay"], blocks: [
        { type: "p", text: "Sethe's milk operates as both nourishment AND theft — every act of care in the novel doubles as an exposure. Schoolteacher's nephews don't just rob her body; they rob her capacity to mother." },
        { type: "h2", text: "The 'rememory' problem" },
        { type: "p", text: "Morrison's verb: not 'remembering' but 're-memorying' — memory as a place that still exists, that other people can walk into. Sethe says: 'Some things you forget. Other things you never do.'" },
        { type: "li", text: "Memory is spatial, not chronological" },
        { type: "li", text: "Trauma is contagious — Denver, then Paul D, then the community" },
        { type: "li", text: "Sweet Home is a fiction maintained by white people" },
        { type: "quote", text: "Anything dead coming back to life hurts." },
        { type: "h2", text: "Use for the essay" },
        { type: "p", text: "Body paragraph 2: the milk scene as the founding theft. Compare to the schoolteacher's measurement scene — both reduce Sethe to body without consent." },
      ]},
      { id: "lit-characters", unit: 0, title: "Beloved — character map", when: "yesterday", tags: ["#beloved", "#characters"], blocks: [
        { type: "h2", text: "Sethe" },
        { type: "p", text: "Escaped Sweet Home with Denver still in utero. Killed her older daughter ('Beloved') with a handsaw rather than let her be taken back. The novel asks: was that love?" },
        { type: "h2", text: "Denver" },
        { type: "p", text: "Sethe's surviving daughter. Spends much of the novel paralyzed by isolation; her growth IS the plot. Goes to Lady Jones, then to the community, and finally to wage work." },
        { type: "h2", text: "Paul D" },
        { type: "p", text: "Last surviving Sweet Home man. Carries a 'tin tobacco box' of locked-away memory in his chest. Beloved is the one who pries it open." },
      ]},
      { id: "lit-gatsby", unit: 1, title: "The Great Gatsby — green light", when: "Apr 30", tags: ["#gatsby", "#symbolism"], blocks: [
        { type: "p", text: "The green light at the end of Daisy's dock is the cleanest symbol Fitzgerald gives us: a future you can see but never touch." },
        { type: "quote", text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us." },
        { type: "h2", text: "What's actually in the light" },
        { type: "li", text: "Money (literal green)" },
        { type: "li", text: "Daisy (the woman, the class she represents)" },
        { type: "li", text: "America's promise of self-reinvention" },
      ]},
      { id: "lit-voice", unit: 1, title: "Morrison vs. Fitzgerald — voice", when: "last week", tags: ["#style"], blocks: [
        { type: "p", text: "Morrison's sentences are recursive — they circle and re-enter. Fitzgerald's are linear and lyric. Compare the opening lines of each novel for an exam-ready contrast." },
      ]},
    ],
  },
  "ap-bio": {
    units: ["Unit 3 · Cellular Energetics", "Unit 2 · Cell Structure"],
    notes: [
      { id: "bio-krebs", unit: 0, title: "Krebs cycle (citric acid cycle)", when: "yesterday", tags: ["#mitochondria", "#unit-3", "#quiz-thursday"], blocks: [
        { type: "p", text: "Also called the citric acid cycle or TCA cycle. Takes place in the mitochondrial matrix after pyruvate is decarboxylated to acetyl-CoA." },
        { type: "h2", text: "What goes in, what comes out" },
        { type: "p", text: "Per acetyl-CoA (so multiply by 2 per glucose):" },
        { type: "li", text: "3 NADH" },
        { type: "li", text: "1 FADH₂" },
        { type: "li", text: "1 GTP (or ATP equivalent)" },
        { type: "li", text: "2 CO₂ released" },
        { type: "quote", text: "The cycle itself doesn't make much ATP — the real payoff is the reduced carriers feeding the electron transport chain." },
        { type: "h2", text: "Why oxaloacetate matters" },
        { type: "p", text: "Acetyl-CoA (2C) joins oxaloacetate (4C) → citrate (6C). The cycle's job is to regenerate oxaloacetate. If OAA is depleted, the cycle stalls." },
      ]},
      { id: "bio-glycolysis", unit: 0, title: "Glycolysis — payoff phase", when: "Mon", tags: ["#unit-3"], blocks: [
        { type: "p", text: "Glucose (6C) → 2 pyruvate (3C). Happens in the cytoplasm. Net: 2 ATP, 2 NADH, 2 pyruvate." },
        { type: "h2", text: "Investment vs payoff" },
        { type: "li", text: "Investment: spend 2 ATP to destabilize glucose" },
        { type: "li", text: "Payoff: make 4 ATP via substrate-level phosphorylation" },
        { type: "li", text: "Net = +2 ATP" },
      ]},
      { id: "bio-etc", unit: 0, title: "Electron transport chain", when: "Mon", tags: ["#unit-3"], blocks: [
        { type: "p", text: "Inner mitochondrial membrane. NADH and FADH₂ drop electrons in; oxygen accepts them at the end (Complex IV)." },
        { type: "h2", text: "The point of the whole thing" },
        { type: "p", text: "Electrons fall down an energy gradient, complexes pump H⁺ into the intermembrane space. H⁺ then comes back through ATP synthase = ATP." },
        { type: "quote", text: "If you kill the H⁺ gradient, ATP synthesis stops — even if there's plenty of glucose and oxygen." },
      ]},
      { id: "bio-fermentation", unit: 0, title: "Anaerobic respiration & fermentation", when: "last week", tags: ["#unit-3"], blocks: [
        { type: "p", text: "When O₂ is absent, ETC stalls (no final acceptor). Cells need a way to regenerate NAD⁺ so glycolysis can keep going." },
        { type: "li", text: "Lactic acid fermentation (muscle, lactobacillus)" },
        { type: "li", text: "Alcoholic fermentation (yeast → CO₂ + ethanol)" },
      ]},
      { id: "bio-enzymes", unit: 0, title: "Enzymes & activation energy", when: "Apr 30", tags: ["#enzymes"], blocks: [
        { type: "p", text: "Enzymes don't change ΔG — they lower the activation energy hump. Substrate binds active site → induced fit → product." },
      ]},
      { id: "bio-photo", unit: 1, title: "Photosynthesis — light reactions", when: "Apr 22", tags: ["#unit-2"], blocks: [
        { type: "p", text: "Thylakoid membrane. Photons excite electrons in PSII, water gets split (source of O₂), electrons flow PSII → PQ → cyt b6f → PC → PSI → NADP⁺." },
      ]},
      { id: "bio-calvin", unit: 1, title: "Calvin cycle", when: "Apr 18", tags: ["#unit-2"], blocks: [
        { type: "p", text: "Stroma. Uses ATP and NADPH from light reactions to fix CO₂ → G3P → glucose. RuBisCO is the (slow, error-prone) enzyme that catalyzes carbon fixation." },
      ]},
    ],
  },
  "alg2": {
    units: ["Unit 7 · Trigonometric Identities", "Unit 6 · Trig Functions"],
    notes: [
      { id: "alg2-double", unit: 0, title: "Double-angle identities", when: "yesterday", tags: ["#trig", "#identities"], blocks: [
        { type: "p", text: "Derived from the angle-sum formulas with α = β." },
        { type: "li", text: "sin(2θ) = 2 sinθ cosθ" },
        { type: "li", text: "cos(2θ) = cos²θ − sin²θ = 1 − 2sin²θ = 2cos²θ − 1" },
        { type: "li", text: "tan(2θ) = 2tanθ / (1 − tan²θ)" },
        { type: "quote", text: "When in doubt on cos(2θ), substitute cos²θ = 1 − sin²θ and see what cancels." },
      ]},
      { id: "alg2-sum", unit: 0, title: "Sum & difference formulas", when: "Mon", tags: ["#trig"], blocks: [
        { type: "p", text: "Memorize the two and derive the rest." },
        { type: "li", text: "sin(α ± β) = sinα cosβ ± cosα sinβ" },
        { type: "li", text: "cos(α ± β) = cosα cosβ ∓ sinα sinβ" },
      ]},
      { id: "alg2-inverse", unit: 1, title: "Inverse trig functions", when: "last week", tags: ["#inverse"], blocks: [
        { type: "p", text: "arcsin, arccos, arctan are RESTRICTED to make them functions. arcsin returns [-π/2, π/2]. arccos returns [0, π]. arctan returns (-π/2, π/2)." },
      ]},
      { id: "alg2-sines", unit: 1, title: "Law of sines", when: "Apr 28", tags: ["#non-right"], blocks: [
        { type: "p", text: "For any triangle: a/sinA = b/sinB = c/sinC. Use when you have AAS or ASA. Watch out for the ambiguous SSA case." },
      ]},
    ],
  },
  "us-hist": {
    units: ["Unit 3 · Founding Era", "Unit 4 · Civil War"],
    notes: [
      { id: "ush-fed10", unit: 0, title: "Federalist No. 10 — factions", when: "3d ago", tags: ["#federalist", "#madison"], blocks: [
        { type: "p", text: "Madison: the 'mischiefs of faction' can't be cured by removing causes (impossible without tyranny). Must be controlled by managing effects." },
        { type: "h2", text: "His big move" },
        { type: "p", text: "A large, diverse republic is HARDER to capture by a single faction than a small, homogeneous democracy. Counter-intuitive at the time." },
        { type: "quote", text: "The latent causes of faction are thus sown in the nature of man." },
      ]},
      { id: "ush-fed51", unit: 0, title: "Federalist No. 51 — checks & balances", when: "Mon", tags: ["#federalist"], blocks: [
        { type: "p", text: "Madison again. 'Ambition must be made to counteract ambition.' The structural argument for separation of powers." },
      ]},
      { id: "ush-civilwar", unit: 1, title: "Causes of the Civil War", when: "last week", tags: ["#civil-war"], blocks: [
        { type: "p", text: "Slavery was THE precipitating cause — every other dispute (states' rights, tariffs, territorial expansion) reduces to slavery on close inspection." },
      ]},
      { id: "ush-recon", unit: 1, title: "Reconstruction amendments", when: "Apr 30", tags: ["#amendments"], blocks: [
        { type: "li", text: "13th — abolishes slavery (1865)" },
        { type: "li", text: "14th — equal protection, citizenship (1868)" },
        { type: "li", text: "15th — voting rights regardless of race (1870)" },
      ]},
    ],
  },
  "spanish-3": {
    units: ["Unidad 6 · Recuerdos", "Unidad 5 · El Subjuntivo"],
    notes: [
      { id: "es-pret", unit: 0, title: "Pretérito vs. Imperfecto", when: "yesterday", tags: ["#tiempos", "#unidad-6"], blocks: [
        { type: "p", text: "El pretérito = una acción terminada, con principio y fin definidos. El imperfecto = una acción en progreso, habitual, o de fondo." },
        { type: "h2", text: "Indicadores" },
        { type: "li", text: "Pretérito: ayer, anoche, el año pasado, de repente" },
        { type: "li", text: "Imperfecto: siempre, cada día, mientras, de niño" },
        { type: "quote", text: "Cuando llovía (imperfect background), de repente sonó el teléfono (preterite action)." },
      ]},
      { id: "es-vocab", unit: 0, title: "Vocabulario Unidad 6", when: "Mon", tags: ["#vocab"], blocks: [
        { type: "li", text: "olvidar — to forget" },
        { type: "li", text: "el recuerdo — memory" },
        { type: "li", text: "soñar — to dream" },
        { type: "li", text: "el sueño — dream" },
      ]},
      { id: "es-subj", unit: 1, title: "Subjuntivo — cuándo se usa", when: "last week", tags: ["#subjuntivo"], blocks: [
        { type: "p", text: "WEIRDO: Wishes, Emotions, Impersonal expressions, Recommendations, Doubt/Denial, Ojalá. Use after these triggers when there's a change in subject." },
      ]},
    ],
  },
  "chem": {
    units: ["Unit 4 · Solutions", "Unit 3 · Periodic Trends"],
    notes: [
      { id: "ch-mol", unit: 0, title: "Molarity & dilutions", when: "today", tags: ["#solutions"], blocks: [
        { type: "p", text: "M = moles solute / liters solution. NOT liters of solvent — the volume includes the solute." },
        { type: "quote", text: "M₁V₁ = M₂V₂ — the dilution equation. Moles are conserved." },
      ]},
      { id: "ch-trends", unit: 1, title: "Periodic trends", when: "Mon", tags: ["#periodic"], blocks: [
        { type: "li", text: "Atomic radius — increases ↙, decreases →" },
        { type: "li", text: "Ionization energy — decreases ↙, increases →" },
        { type: "li", text: "Electronegativity — peaks at F (top right minus noble gases)" },
        { type: "li", text: "Metallic character — opposite of EN" },
      ]},
      { id: "ch-stoich", unit: 1, title: "Stoichiometry recap", when: "last week", tags: ["#stoich"], blocks: [
        { type: "p", text: "Mole ratios from balanced equations bridge between grams of A and grams of B. Limiting reagent caps the product." },
      ]},
    ],
  },
  "studio-art": {
    units: ["Unit · Drawing"],
    notes: [
      { id: "art-char", unit: 0, title: "Charcoal still life — process", when: "today", tags: ["#charcoal"], blocks: [
        { type: "p", text: "Start with vine charcoal for blocking in. Don't commit to compressed until the composition is set — it's hard to lift once down." },
        { type: "li", text: "Block in big shapes first, no detail" },
        { type: "li", text: "Establish darks early, then mid-tones, then highlights last (eraser as tool)" },
        { type: "li", text: "Squint to see value, not edge" },
      ]},
      { id: "art-comp", unit: 0, title: "Composition rules", when: "Apr 30", tags: ["#composition"], blocks: [
        { type: "p", text: "Rule of thirds. Negative space matters as much as positive. Triangular eye paths feel stable, S-curves feel dynamic." },
      ]},
    ],
  },
  "phys-ed": {
    units: ["Logs"],
    notes: [
      { id: "pe-log", unit: 0, title: "May workout log", when: "yesterday", tags: ["#log"], blocks: [
        { type: "p", text: "Mile time: 7:18 (down from 7:42 in April). Squats 3x10 @ 65 lb. Deadlift 3x5 @ 95 lb." },
      ]},
    ],
  },
};
const notesForSubject = (id) => (NOTES_BY_SUBJECT[id] && NOTES_BY_SUBJECT[id].notes) || [];

// Convert a schedule time like "8:10" / "12:00" / "1:00" → minutes since midnight.
// Assumes a normal high-school day: hour < 8 is afternoon, hour 8–11 is morning, 12 is noon.
function schedToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  let h24 = h;
  if (h >= 1 && h < 8) h24 = h + 12;
  return h24 * 60 + m;
}

// Returns { nowIdx, nextIdx, minsToNext, status } based on real wall-clock time.
function getScheduleStatus(schedule = SCHEDULE_TODAY, now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  let nowIdx = -1, nextIdx = -1;
  for (let i = 0; i < schedule.length; i++) {
    const start = schedToMinutes(schedule[i].time);
    const end   = schedToMinutes(schedule[i].end);
    if (mins >= start && mins < end) { nowIdx = i; }
    if (mins < start && nextIdx === -1) nextIdx = i;
  }
  let status = "in-school";
  if (nowIdx === -1 && nextIdx === -1) status = "after-school";
  else if (nowIdx === -1 && nextIdx === 0) status = "before-school";

  const minsToNext = nextIdx >= 0 ? schedToMinutes(schedule[nextIdx].time) - mins : null;
  return { nowIdx, nextIdx, minsToNext, status };
}

// React hook that re-renders every 30s so the "now" indicator stays current.
// Also reads the live schedule from the store (falls back to SCHEDULE_TODAY).
function useScheduleStatus() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30 * 1000);
    const onStore = () => setTick((x) => x + 1);
    window.addEventListener("nbStoreChange", onStore);
    return () => { clearInterval(t); window.removeEventListener("nbStoreChange", onStore); };
  }, []);
  const schedule = (typeof nbGetSchedule === "function" ? nbGetSchedule() : SCHEDULE_TODAY);
  return React.useMemo(() => ({ schedule, ...getScheduleStatus(schedule, new Date()) }), [schedule, tick]);
}

function fmtDuration(mins) {
  if (mins == null) return "—";
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const MCQ_ALG2 = [
  {
    q: "Which identity rewrites cos(2θ) using only sin(θ)?",
    choices: [
      "cos(2θ) = 1 − 2 sin²θ",
      "cos(2θ) = 2 cos²θ − 1",
      "cos(2θ) = cos²θ − sin²θ",
      "cos(2θ) = 2 sinθ cosθ",
    ],
    correct: 0,
    explain: "Substitute cos²θ = 1 − sin²θ into cos²θ − sin²θ to get 1 − 2sin²θ.",
  },
  {
    q: "sin(2θ) equals…",
    choices: [
      "sinθ + cosθ",
      "2 sin²θ",
      "2 sinθ cosθ",
      "1 − cos(2θ)",
    ],
    correct: 2,
    explain: "Standard double-angle formula derived from sin(α+β) with α = β.",
  },
  {
    q: "If sinθ = 3/5 and θ is in QI, what is sin(2θ)?",
    choices: ["24/25", "7/25", "6/5", "−24/25"],
    correct: 0,
    explain: "cosθ = 4/5 in QI. sin(2θ) = 2 · (3/5)(4/5) = 24/25.",
  },
];

const TYPE_VOCAB = [
  { es: "olvidar",   en: "to forget" },
  { es: "el recuerdo", en: "memory" },
  { es: "soñar",     en: "to dream" },
  { es: "el sueño",  en: "dream" },
];

Object.assign(window, {
  SUBJECTS, HOMEWORK, QUIZZES_UPCOMING, RECENT_NOTES, SCHEDULE_TODAY,
  WEEK, FLASHCARDS_BIO, MCQ_ALG2, TYPE_VOCAB, DECKS, NOTES_BY_SUBJECT,
  subjectBy, deckBy, notesForSubject,
  getScheduleStatus, useScheduleStatus, schedToMinutes, fmtDuration,
});
