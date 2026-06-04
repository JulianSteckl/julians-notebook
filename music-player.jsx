// Study Music Player — ambient sounds + lo-fi via Web Audio API + YouTube

const MUSIC_MODES = [
  { id: "lofi",       label: "Lo-fi",      emoji: "🎵", desc: "Chill beats to study to",        color: "#7a4e6e" },
  { id: "rain",       label: "Rain",       emoji: "🌧",  desc: "Soft rain on a window",          color: "#5a7a99" },
  { id: "forest",     label: "Forest",     emoji: "🌿",  desc: "Wind through leaves",            color: "#6b8e5a" },
  { id: "whitenoise", label: "Focus",      emoji: "〰",  desc: "White noise for deep focus",     color: "#9a9082" },
  { id: "cafe",       label: "Café",       emoji: "☕",  desc: "Soft café ambience",             color: "#b58a3b" },
];

// Web Audio generators — no external dependencies
function createAudioEngine() {
  let ctx = null;
  let nodes = [];
  let gainNode = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function stopAll() {
    nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch(e){} });
    if (gainNode) { try { gainNode.disconnect(); } catch(e){} }
    nodes = [];
    gainNode = null;
  }

  function setVolume(v) {
    if (gainNode) gainNode.gain.setTargetAtTime(v, getCtx().currentTime, 0.1);
  }

  // White noise buffer
  function makeNoiseBuffer(type = "white") {
    const c = getCtx();
    const bufLen = c.sampleRate * 2;
    const buf = c.createBuffer(1, bufLen, c.sampleRate);
    const data = buf.getChannelData(0);
    if (type === "white") {
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    } else { // brown
      let last = 0;
      for (let i = 0; i < bufLen; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + (0.02 * w)) / 1.02;
        data[i] = last * 3.5;
      }
    }
    return buf;
  }

  function playWhiteNoise(vol = 0.3) {
    const c = getCtx();
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer("white");
    src.loop = true;
    gainNode = c.createGain();
    gainNode.gain.value = vol;
    src.connect(gainNode);
    gainNode.connect(c.destination);
    src.start();
    nodes.push(src);
  }

  function playRain(vol = 0.4) {
    const c = getCtx();
    // Base rain: brown noise through a lowpass
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer("brown");
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.Q.value = 0.5;
    gainNode = c.createGain();
    gainNode.gain.value = vol;
    src.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(c.destination);
    src.start();
    nodes.push(src);

    // Occasional drop sounds — random pings
    function schedDrop() {
      if (!ctx) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.value = 400 + Math.random() * 600;
      g.gain.value = 0;
      osc.connect(g);
      g.connect(gainNode);
      const now = c.currentTime;
      g.gain.setTargetAtTime(0.06, now, 0.002);
      g.gain.setTargetAtTime(0, now + 0.04, 0.06);
      osc.start(now);
      osc.stop(now + 0.5);
      nodes.push(osc);
      setTimeout(schedDrop, 400 + Math.random() * 1200);
    }
    setTimeout(schedDrop, 500 + Math.random() * 800);
  }

  function playForest(vol = 0.35) {
    const c = getCtx();
    // Wind: brown noise through a bandpass, slowly modulated
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer("brown");
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 300;
    filter.Q.value = 0.8;
    gainNode = c.createGain();
    gainNode.gain.value = vol;
    src.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(c.destination);
    src.start();
    nodes.push(src);

    // LFO for wind swell
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
    nodes.push(lfo);

    // Bird chirps
    function schedChirp() {
      if (!ctx) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      const base = 1800 + Math.random() * 1200;
      osc.frequency.setValueAtTime(base, c.currentTime);
      osc.frequency.linearRampToValueAtTime(base * 1.3, c.currentTime + 0.08);
      osc.frequency.linearRampToValueAtTime(base, c.currentTime + 0.16);
      g.gain.value = 0;
      osc.connect(g);
      g.connect(gainNode);
      const now = c.currentTime;
      g.gain.setTargetAtTime(0.07, now, 0.01);
      g.gain.setTargetAtTime(0, now + 0.15, 0.04);
      osc.start(now);
      osc.stop(now + 0.5);
      nodes.push(osc);
      // Chirp in pairs sometimes
      if (Math.random() < 0.4) {
        setTimeout(schedChirp, 200);
      }
      setTimeout(schedChirp, 3000 + Math.random() * 8000);
    }
    setTimeout(schedChirp, 1000);
  }

  function playCafe(vol = 0.3) {
    const c = getCtx();
    // Background murmur: brown noise through lowpass
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer("brown");
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    gainNode = c.createGain();
    gainNode.gain.value = vol * 0.6;
    src.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(c.destination);
    src.start();
    nodes.push(src);

    // Cup clinks
    function schedClink() {
      if (!ctx) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "triangle";
      osc.frequency.value = 2000 + Math.random() * 1000;
      g.gain.value = 0;
      osc.connect(g);
      g.connect(gainNode);
      const now = c.currentTime;
      g.gain.setTargetAtTime(0.12, now, 0.001);
      g.gain.setTargetAtTime(0, now + 0.03, 0.08);
      osc.start(now);
      osc.stop(now + 1);
      nodes.push(osc);
      setTimeout(schedClink, 3000 + Math.random() * 7000);
    }
    setTimeout(schedClink, 500);
  }

  return { stopAll, setVolume, playWhiteNoise, playRain, playForest, playCafe, getCtx };
}

let __audioEngine = null;
function getAudioEngine() {
  if (!__audioEngine) __audioEngine = createAudioEngine();
  return __audioEngine;
}

// ── Lo-fi YouTube embed (hidden iframe, controlled via postMessage) ──────────
const LOFI_URL = "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1&playlist=jfKfPfyJRdk&enablejsapi=1&controls=0";

function MusicPlayer() {
  const [open, setOpen] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [mode, setMode] = React.useState("lofi");
  const [volume, setVolume] = React.useState(0.5);
  const iframeRef = React.useRef(null);
  const currentMode = MUSIC_MODES.find(m => m.id === mode);

  const stopAudio = () => {
    getAudioEngine().stopAll();
    if (iframeRef.current) {
      try { iframeRef.current.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', "*"); } catch(e) {}
    }
  };

  const startAudio = (modeId, vol) => {
    stopAudio();
    const eng = getAudioEngine();
    try { eng.getCtx().resume(); } catch(e) {}
    switch (modeId) {
      case "rain":       eng.playRain(vol); break;
      case "forest":     eng.playForest(vol); break;
      case "whitenoise": eng.playWhiteNoise(vol); break;
      case "cafe":       eng.playCafe(vol); break;
      // lofi: handled by iframe
    }
    if (modeId === "lofi" && iframeRef.current) {
      try { iframeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*"); } catch(e) {}
    }
  };

  const togglePlay = () => {
    if (playing) {
      stopAudio();
      setPlaying(false);
    } else {
      startAudio(mode, volume);
      setPlaying(true);
    }
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    if (playing) startAudio(newMode, volume);
  };

  const changeVolume = (v) => {
    setVolume(v);
    getAudioEngine().setVolume(v);
  };

  React.useEffect(() => () => stopAudio(), []);

  const modeColor = currentMode ? currentMode.color : "var(--accent)";

  return (
    <>
      {/* Hidden YouTube iframe for lo-fi */}
      <iframe
        ref={iframeRef}
        src={mode === "lofi" && playing ? LOFI_URL : "about:blank"}
        style={{ position: "fixed", width: 1, height: 1, opacity: 0, bottom: 0, left: 0, pointerEvents: "none", border: "none", zIndex: -1 }}
        allow="autoplay"
        title="lofi"
      />

      {/* Floating player */}
      <div style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0,
        filter: "drop-shadow(0 4px 18px rgba(20,16,11,0.18))",
      }}>
        {/* Expanded panel */}
        {open && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--hairline)",
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 8,
            width: 240,
            animation: "spring-bottom 0.4s cubic-bezier(0.22,1.06,0.36,1) both",
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
              Study Music
            </div>
            {/* Mode selector */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
              {MUSIC_MODES.map(m => (
                <button key={m.id} onClick={() => changeMode(m.id)} title={m.desc} style={{
                  padding: "5px 9px", borderRadius: 4, border: "1px solid var(--hairline)",
                  background: mode === m.id ? modeColor : "var(--bg-2)",
                  color: mode === m.id ? "#fff" : "var(--ink-2)",
                  fontSize: 12, cursor: "pointer", fontFamily: "var(--f-ui)",
                  transition: "all 0.15s ease",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>
            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>Vol</span>
              <input type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e => changeVolume(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: modeColor, height: 4, cursor: "pointer" }} />
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-3)", width: 30 }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
            {mode === "lofi" && (
              <div style={{ marginTop: 8, fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--ink-3)" }}>
                via YouTube · requires internet
              </div>
            )}
          </div>
        )}

        {/* Pill button */}
        <button onClick={() => setOpen(o => !o)} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 14px", borderRadius: 99,
          border: `1.5px solid ${playing ? modeColor : "var(--hairline)"}`,
          background: playing ? modeColor : "var(--surface)",
          color: playing ? "#fff" : "var(--ink-2)",
          cursor: "pointer", fontFamily: "var(--f-ui)", fontSize: 12.5,
          transition: "all 0.2s ease",
          boxShadow: playing ? `0 4px 16px -4px ${modeColor}80` : "0 2px 8px rgba(20,16,11,0.1)",
        }}>
          {playing && <span className="pomo-pulse" style={{ background: "rgba(255,255,255,0.7)", width: 5, height: 5, margin: "0 -2px 0 0" }}></span>}
          <span>{currentMode ? currentMode.emoji : "🎵"}</span>
          <span>{playing ? currentMode.label : "Study music"}</span>
          {/* play/stop inline */}
          <span onClick={e => { e.stopPropagation(); togglePlay(); }} style={{
            marginLeft: 2, fontSize: 12, opacity: 0.8,
            background: "rgba(255,255,255,0.18)", borderRadius: "50%",
            width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            {playing ? "■" : "▶"}
          </span>
        </button>
      </div>
    </>
  );
}

Object.assign(window, { MusicPlayer });
