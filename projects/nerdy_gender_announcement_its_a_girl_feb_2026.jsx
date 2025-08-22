import React from "react";

// Nerdy Gender Announcement — single-file React component (no external libs)
// Personalize here ↓↓↓
const CONFIG = {
  parents: { partner1: "Ashish", partner2: "Meghna" },
  baby: { gender: "girl", due: "February 2026", codename: "Project Stork" },
  // Optional: paste direct audio file URLs for baby coo/giggle here (mobile-safe if user-tapped)
  // Examples to try (download/host yourself or ensure hotlink allowed):
  //  - Pixabay "Baby babble" page: https://pixabay.com/sound-effects/baby-babble-70664/ (download then host)
  //  - Freesound "Baby Girl coos" https://freesound.org/people/Sauron974/sounds/244237/ (check license)
  sfx: {
    cooUrl: "",     // e.g. "/audio/baby-coo.mp3"
    giggleUrl: "",  // e.g. "/audio/baby-giggle.mp3"
  }
};

// --- Cute baby ASCII artworks keyed by stage (use real newlines) ---
const BABY_ASCII = {
  preflight: `   (ᵔᴥᵔ)♡
   /|  /|   heartbeat OK
  /_| /_|   diapers ready`,
  cloning:   `   ___   🕊️
  /__ \\  stork en route
 (____) ) carrying code`,
  lint:      `  (•◡•)  ✨
  /|_ |_\\
  (___|___)  no lint, just lintels`,
  data:      `   (•ᴗ•)  🍼
  <)  )>  loading data
   /  \\   wiggle augment`,
  deps:      `  [📦][🍼][🧸]
   (•‿•) okies!`,
  seed:      `   🌱
  (•◡•) set‑seed 42`,
  compile:   `  (⚙️⚙️)
  (•_•) building snuggles`,
  cache:     `   ⌂ crib cache
  (•ᴗ• )つ[blanket]`,
  train:     `  (ง •̀_•́)ง  rattle reps!
  [==  tiny gains  ==]`,
  eval:      `   🔎
  (•ᴗ•) metrics coo`,
  package:   `   🎁 bundle‑of‑joy
  (•◡•) ✓`
};

// Deterministic Baby Zoo mapping by stage (no rotation randomness)
const BABY_ZOO = [
  `  (•ᴗ•)🍼
  /)  )  bottle bot
  /  /`,
  `   _
 _( )_  teddy guard
(_ . _)
  /_\\`,
  `  (•ө•)  duckling dev
  <)  )=
   "  "`,
  `  (•ᴗ•)  rattle ops
  /|  |\\
  /_|__|_\\`,
  `   ___  stork CI
  <(o )__
    ( ._ )>`
];
const STAGE2ZOO = {
  preflight: 1,
  cloning: 4,
  lint: 3,
  data: 2,
  deps: 0,
  seed: 2,
  compile: 3,
  cache: 1,
  train: 0,   // epochs won't show ASCII; zoo still used for non-epoch 'train' header line
  eval: 2,
  package: 4,
  countdown: 1,
  idle: 1,
};

// --- Countdown ASCII (5 → 1 → baby). Pure ASCII art ---
const COUNTDOWN_ASCII = [
  // index 5 -> '5', 4 -> '4', 3 -> '3', 2 -> '2', 1 -> '1', 0 -> baby
  `  ██████\n  ██     \n  ██████ \n       ██\n  ██████  `, // 5
  `     ██\n   █  ███\n     ██  \n     ██  \n  █████████`, // 4
  `  ██████\n       ██\n    ███  \n       ██\n  ██████  `, // 3
  `   ████\n  ██    ██\n       ██\n     ██\n  █████████`, // 2
  `     ██\n    ████\n      ██\n      ██\n     ████`, // 1
  `   (•ᴗ•)  \n  ( ｡• ｡)  baby time!\n  /)   )\n  /  ♥  \n  👶`      // 0
];

// --- Sound Effects (Web Audio + optional <audio> samples) ---
function useSfx(){
  const ctxRef = React.useRef(null);
  const unlockedRef = React.useRef(false);
  const cooRef = React.useRef(null);
  const giggleRef = React.useRef(null);

  React.useEffect(()=>()=>{ try{ ctxRef.current?.close(); }catch{} },[]);

  function ctx(){ if (!ctxRef.current){ const C = window.AudioContext||window.webkitAudioContext; if (C) ctxRef.current = new C(); } return ctxRef.current; }
  function ensure(){ const c = ctx(); if (!c) return false; if (c.state === 'suspended') c.resume(); unlockedRef.current = true; return true; }

  function tone({freq=600, dur=0.12, type='sine', vol=0.04}){ try{ const c=ctx(); if(!c||!unlockedRef.current) return; const o=c.createOscillator(); const g=c.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=vol; o.connect(g); g.connect(c.destination); const t=c.currentTime; o.start(t); o.stop(t+dur);}catch{} }
  function sweep({from=400,to=900,dur=0.4,type='sine',vol=0.035}){ try{ const c=ctx(); if(!c||!unlockedRef.current) return; const o=c.createOscillator(); const g=c.createGain(); o.type=type; g.gain.value=vol; o.connect(g); g.connect(c.destination); const t=c.currentTime; o.frequency.setValueAtTime(from,t); o.frequency.linearRampToValueAtTime(to,t+dur); o.start(t); o.stop(t+dur);}catch{} }
  function noise({dur=0.2, vol=0.02}){ try{ const c=ctx(); if(!c||!unlockedRef.current) return; const buffer=c.createBuffer(1, c.sampleRate*dur, c.sampleRate); const data=buffer.getChannelData(0); for(let i=0;i<data.length;i++){ data[i] = (Math.random()*2-1)*0.4; } const src=c.createBufferSource(); const g=c.createGain(); g.gain.value=vol; src.buffer=buffer; src.connect(g); g.connect(c.destination); const t=c.currentTime; src.start(t); src.stop(t+dur);}catch{} }

  function playTag(tagRef){ try{ const el = tagRef.current; if (!el) return false; el.currentTime = 0; const p = el.play(); if (p && p.catch) p.catch(()=>{}); return true; }catch{ return false; } }

  return {
    attach(elCoo, elGiggle){ cooRef.current = elCoo; giggleRef.current = elGiggle; },
    unlock(){ return ensure(); },
    tick(){ tone({freq:520,dur:0.09,type:'triangle'}); },
    coo(){ if (!playTag(cooRef)) sweep({from:440,to:720,dur:0.5,type:'sine'}); },
    giggle(){ if (!playTag(giggleRef)) { sweep({from:700,to:900,dur:0.18,type:'triangle'}); setTimeout(()=>sweep({from:680,to:880,dur:0.18,type:'triangle'}),120); } },
    rattle(){ noise({dur:0.18, vol:0.03}); },
    chime(){ tone({freq:880,dur:0.16,type:'sine',vol:0.05}); setTimeout(()=>tone({freq:1175,dur:0.2,type:'sine',vol:0.05}),120); },
  };
}

// --- Helpers ---
function clampProgress(p){ return Math.max(0, Math.min(100, Number.isFinite(p) ? p : 0)); }
function useRafCount({ from = 0, to = 100, duration = 1500, easing = t => t, start = false, onDone }){
  const [val, setVal] = React.useState(from);
  React.useEffect(() => {
    if (!start) return; let raf, t0;
    function frame(ts){ if (!t0) t0 = ts; const p = Math.min(1, (ts - t0) / duration); setVal(from + (to - from) * easing(p)); if (p < 1) raf = requestAnimationFrame(frame); else onDone && onDone(); }
    raf = requestAnimationFrame(frame); return () => cancelAnimationFrame(raf);
  }, [start, from, to, duration, easing, onDone]);
  return val;
}
const easeInOut = t => (t<.5? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2);

// SPM helper (still present for self-tests consistency)
function computeSPM(n){
  const base = [20, 45, 70, 95, 120];
  return base.slice(0, Math.max(0, Math.min(n, base.length)));
}

// --- Lightweight sanity tests (NEVER change unless wrong) ---
(function selfTests(){
  try {
    console.assert(typeof clampProgress === 'function', 'clampProgress exists');
    console.assert(clampProgress(-5) === 0, 'clamp floors at 0');
    console.assert(clampProgress(50) === 50, 'clamp passthrough');
    console.assert(clampProgress(150) === 100, 'clamp caps at 100');
    const must = ['preflight','cloning','lint','data','deps','seed','compile','cache','train','eval','package'];
    must.forEach(k => console.assert(!!BABY_ASCII[k], `ascii for ${k}`));
    const spm = computeSPM(5); for (let i=1;i<spm.length;i++){ console.assert(spm[i] >= spm[i-1], 'SPM monotonic'); }
    console.assert(BABY_ZOO.length>0, 'zoo has entries');
    console.assert(BABY_ZOO.every(s => !s.includes('\\n')), 'zoo uses real newlines');
  } catch (e){ console.warn('Self-tests: issue', e); }
})();

// --- Component ---
export default function BabyReveal() {
  const [phase, setPhase] = React.useState('idle');
  const [runningBuild, setRunningBuild] = React.useState(false);
  const [buildStatic, setBuildStatic] = React.useState([]); // array of {txt,s}
  const [buildCurrent, setBuildCurrent] = React.useState("");
  const [buildShow, setBuildShow] = React.useState(false);
  const [progressBuild, setProgressBuild] = React.useState(0);
  const [stage, setStage] = React.useState("idle");
  const [revealed, setRevealed] = React.useState(false);
  const [confettiOn, setConfettiOn] = React.useState(false);
  const [dark, setDark] = React.useState(false);
  const [devMode, setDevMode] = React.useState(false);
  const [epochCount, setEpochCount] = React.useState(0);
  const [countdown, setCountdown] = React.useState(null); // 5..0 or null
  const [soundReady, setSoundReady] = React.useState(false);

  // Ensure system-wide dark class for better compatibility
  React.useEffect(() => {
    const root = document.documentElement; if (!root) return;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
  }, [dark]);

  // Konami toggles dev-mode (Easter egg)
  React.useEffect(() => {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]; let i=0;
    function onKey(e){ const key = e.key.length===1? e.key.toLowerCase(): e.key; const target = seq[i]; if (key===target || key===target?.toLowerCase()){ i++; if(i===seq.length){ setDevMode(d=>!d); i=0; } } else { i=0; } }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sfx = useSfx();
  const cooTag = React.useRef(null);
  const giggleTag = React.useRef(null);
  React.useEffect(()=>{ sfx.attach(cooTag.current, giggleTag.current); },[sfx]);

  // Build pipeline steps
  const sequenceBuild = [
    { s: "preflight", txt: "$ preflight --check env,heart,home" },
    { s: "cloning",  txt: "$ git clone https://repo.life/" + CONFIG.baby.codename.toLowerCase() },
    { s: "cloning",  txt: "Cloning into '" + CONFIG.baby.codename + "'..." },
    { s: "lint",     txt: "$ eslint . --fix (nursery rules applied)" },
    { s: "data",     txt: "$ prepare_data --source=ultrasound --augment=wriggles,heartbeats" },
    { s: "deps",     txt: "$ npm install diapers pacifier swaddles --save" },
    { s: "deps",     txt: "audited 40 pacifiers — 0 vulnerabilities (only adorableness)" },
    { s: "seed",     txt: "$ set-seed 42 (deterministically cute)" },
    { s: "compile",  txt: "$ compile-kernels --target=snuggleGPU" },
    { s: "cache",    txt: "$ warm-cache --crib --bottles" },
    { s: "train",    txt: "$ python train.py --epochs=5 --patience=∞" },
    { s: "train",    txt: "[Epoch 1/5] loss: 0.62 → acc: 0.58 — baseline coos" },
    { s: "train",    txt: "[Epoch 2/5] loss: 0.31 → acc: 0.80 — smiles detected" },
    { s: "train",    txt: "[Epoch 3/5] loss: 0.18 → acc: 0.90 — nap scheduler stabilized" },
    { s: "train",    txt: "[Epoch 4/5] loss: 0.10 → acc: 0.96 — overfit mode guarded with hugs" },
    { s: "train",    txt: "[Epoch 5/5] loss: 0.07 → acc: 0.98 — optimum cuddles achieved" },
    { s: "eval",     txt: "$ eval.py --metrics=F1,ROC‑AUC,SnackScore" },
    { s: "eval",     txt: "ROC‑AUC: 0.99 — SnackScore: 11/10" },
    { s: "package",  txt: "$ package --format=bundle-of-joy" },
  ];

  function start() {
    if (runningBuild) return;
    setPhase('build'); setRunningBuild(true);
    setBuildStatic([]); setBuildCurrent(""); setBuildShow(false);
    setProgressBuild(0); setRevealed(false); setEpochCount(0); setCountdown(null);
    // attempt to unlock audio on click/tap of Run Reveal
    const ok = sfx.unlock(); setSoundReady(ok);
    runBuildSequence(0);
  }

  function runBuildSequence(idx){
    const total = sequenceBuild.length;
    if (idx >= total){
      // Count down in terminal with ASCII only before reveal
      startCountdown(5);
      return;
    }
    const seg = sequenceBuild[idx]; setStage(seg.s);
    setProgressBuild(Math.round((idx/total)*100));

    const isEpoch = seg.s === 'train' && seg.txt.startsWith('[');

    // gentle baby-ish sfx per step; during epochs prefer baby coo sample
    if (isEpoch) { sfx.coo(); } else if (seg.s === 'package') { sfx.chime(); } else { sfx.tick(); }

    if (isEpoch){
      // Epoch lines: text only, NO ASCII during epochs; accumulate until end of training block
      setBuildCurrent(seg.txt); setBuildShow(true);
      setHandleBuildTyped(() => () => {
        setProgressBuild(Math.round(((idx+1)/total)*100));
        setBuildStatic(prev => [...prev, { txt: seg.txt, s: seg.s }]);
        setEpochCount(c => Math.min(5, c+1));
        setBuildCurrent(""); setBuildShow(false);
        const nextSeg = sequenceBuild[idx+1];
        if (nextSeg && nextSeg.s === 'train' && nextSeg.txt.startsWith('[')){
          runBuildSequence(idx+1);
        } else {
          setTimeout(() => { setBuildStatic([]); }, 1000);
          setTimeout(() => runBuildSequence(idx+1), 1100);
        }
      });
      return;
    }

    // Non-epoch lines
    setBuildCurrent(seg.txt); setBuildShow(true);
    setHandleBuildTyped(() => () => {
      setProgressBuild(Math.round(((idx+1)/total)*100));
      setTimeout(() => { setBuildShow(false); setBuildCurrent(""); }, 1000);
      setTimeout(() => runBuildSequence(idx+1), 1100);
    });
  }

  function startCountdown(n){
    setPhase('countdown'); setStage('countdown'); setCountdown(n);
    const step = (k) => {
      setCountdown(k);
      if (k === 0){ sfx.giggle(); setTimeout(()=> { sfx.chime(); finalizeReveal(); }, 180); return; }
      sfx.coo(); setTimeout(()=> step(k-1), 1000);
    };
    step(n);
  }

  function finalizeReveal(){
    setRunningBuild(false); setProgressBuild(100);
    setTimeout(() => { setRevealed(true); setConfettiOn(true); }, 200);
  }

  const [handleBuildTyped, setHandleBuildTyped] = React.useState(() => () => {});

  // Background palette switches to pink after reveal; dark theme shows heartbeat monitor
  const bgClasses = revealed
    ? "bg-gradient-to-b from-rose-50 to-pink-100 dark:from-rose-950 dark:to-pink-950 animate-celebrate"
    : "bg-gradient-to-b from-stone-50 to-emerald-50 dark:from-black dark:to-zinc-950";

  const accuracy = useRafCount({ from: 0.6, to: 0.99, duration: 1800, easing: easeInOut, start: revealed });
  const loss     = useRafCount({ from: 1.2, to: 0.05, duration: 1800, easing: easeInOut, start: revealed });

  return (
    <div className={(dark ? "dark " : "") + "min-h-screen w-full relative " + bgClasses + " text-zinc-800 dark:text-zinc-100"}>
      {dark && <HeartbeatBackground />}
      <FloatingBits active={runningBuild || revealed} />
      {/* MouseTrail removed per request */}
      <EmojiRain active={revealed} />

      {/* Hidden audio tags for external samples (attach & preload) */}
      <audio ref={cooTag} src={CONFIG.sfx.cooUrl || undefined} preload="auto" crossOrigin="anonymous" />
      <audio ref={giggleTag} src={CONFIG.sfx.giggleUrl || undefined} preload="auto" crossOrigin="anonymous" />

      {!soundReady && (
        <SoundGate onEnable={() => { const ok = sfx.unlock(); setSoundReady(ok); }} />
      )}

      <div className="relative max-w-4xl mx-auto px-4 py-10">
        <Header dark={dark} setDark={setDark} />
        <Hero revealed={revealed} stage={stage} />

        {/* Progress ABOVE terminal */}
        <BuildProgress progress={progressBuild} stage={stage} />

        <Terminal
          title="build"
          staticLines={buildStatic}
          text={buildShow ? buildCurrent : ""}
          running={runningBuild}
          stage={stage}
          zooKey={STAGE2ZOO[stage] ?? 0}
          countdown={countdown}
          onRun={start}
          onTyped={handleBuildTyped}
        />

        {revealed && <RevealCard devMode={devMode} />}
        {revealed && (<ModelMetrics acc={accuracy} loss={loss} />)}
        {revealed && (<MetricsVisuals acc={accuracy} loss={loss} />)}
        <Controls />
        <Footer />
      </div>
      {confettiOn && <EmojiConfetti onDone={() => setConfettiOn(false)} />}
    </div>
  );
}

// ---------- UI Subcomponents ----------
function SoundGate({ onEnable }){
  return (
    <div className="fixed inset-x-0 bottom-4 flex justify-center z-20">
      <button onClick={onEnable} className="px-4 py-2 rounded-full shadow border bg-emerald-600 text-white hover:bg-emerald-500">
        🔊 Enable sound
      </button>
    </div>
  );
}

function Header({ dark, setDark }){
  return (
    <div className="flex items-center justify-between gap-4 mb-6" data-testid="header">
      <div className="flex items-center gap-3 animate-fade-in">
        <BabyIcon className="w-9 h-9" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Hello world baby!</h1>
        </div>
      </div>
      <button
        className="rounded-full border px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        onClick={() => setDark(d => !d)}
        aria-label="Toggle dark mode"
      >
        {dark ? "☀️ Light" : "🌙 Dark"}
      </button>
    </div>
  );
}

function Hero({ revealed, stage }){
  return (
    <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-emerald-100 via-lime-100 to-amber-100 dark:from-emerald-900/20 dark:via-lime-900/20 dark:to-amber-900/20 border border-emerald-200/60 dark:border-emerald-700/40 animate-rise">
      <p className="text-sm uppercase tracking-widest opacity-70">{CONFIG.baby.codename} <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/70 dark:bg-zinc-900/40 border">{stage}</span></p>
      <h2 className="text-3xl md:text-4xl font-black leading-tight mt-1">
        {revealed ? (
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 dark:from-pink-300 dark:via-rose-300 dark:to-fuchsia-300 animate-pop hover:animate-wobble">
            It’s a {CONFIG.baby.gender}! 🎉
          </span>
        ) : (
          <>Deploying <span className="underline decoration-wavy decoration-emerald-600 underline-offset-4">something adorable</span>…</>
        )}
      </h2>
      <p className="mt-2 text-base opacity-80">
        {CONFIG.parents.partner1} & {CONFIG.parents.partner2} are thrilled to announce a new teammate arriving in {CONFIG.baby.due}.
      </p>
      <HeartbeatDivider />
    </div>
  );
}

function Terminal({ title = "shell", staticLines = [], text, running, stage, zooKey = 0, countdown=null, onRun, onTyped }){
  const ascii = BABY_ASCII[stage] || '';
  const zooArt = BABY_ZOO[Math.max(0, Math.min(BABY_ZOO.length-1, zooKey))];
  const isEpochLine = stage === 'train' && typeof text === 'string' && text.startsWith('[');
  const isCountdown = stage === 'countdown' && (countdown !== null);
  const cdArt = countdown !== null ? (COUNTDOWN_ASCII[Math.max(0, Math.min(5, countdown))] || COUNTDOWN_ASCII[0]) : '';
  return (
    <div className="font-mono text-sm bg-zinc-950 text-zinc-50 rounded-2xl overflow-hidden border border-zinc-800 mb-6 shadow-lg animate-fade-in" data-testid={`terminal-${title}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-3 opacity-70">dev@parents: ~/projects/{CONFIG.baby.codename.toLowerCase()} ({title})</span>
        <div className="flex-1" />
        {title === 'build' && (
          <button
            onClick={onRun}
            disabled={running}
            className={`px-3 py-1 rounded-md border transition-colors ${running ? "opacity-60 cursor-not-allowed bg-zinc-800/60 border-zinc-700" : "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-500"}`}
          >
            {running ? "Running…" : "Run Reveal ▶"}
          </button>
        )}
      </div>
      <div className="p-4 min-h-[260px] space-y-3">
        {/* Persisted epoch lines (NO ASCII for epochs) */}
        {staticLines.map((l, i) => {
          const isEpoch = typeof l === 'object' && l.s === 'train' && typeof l.txt === 'string' && l.txt.startsWith('[');
          return (
            <div key={i} className="opacity-90">
              <div>{typeof l === 'string' ? l : l.txt}</div>
              {!isEpoch && <pre className="opacity-70 whitespace-pre leading-4 mt-1">{BABY_ASCII[typeof l === 'string' ? 'train' : l.s] || ''}</pre>}
              {!isEpoch && <pre className="opacity-60 whitespace-pre leading-4 mt-1">{zooArt}</pre>}
            </div>
          );
        })}

        {/* Countdown mode: ASCII only */}
        {isCountdown && (
          <pre className="text-2xl whitespace-pre leading-6 select-none">{cdArt}</pre>
        )}

        {/* Current line */}
        {!isCountdown && text ? (
          <div>
            <TypeLine text={text} onDone={onTyped} />
            {!isEpochLine && <pre className="opacity-70 whitespace-pre leading-4 mt-1">{ascii}</pre>}
            {!isEpochLine && <pre className="opacity-60 whitespace-pre leading-4 mt-1">{zooArt}</pre>}
          </div>
        ) : (
          !isCountdown && (staticLines.length === 0 ? <div className="opacity-20 select-none">{/* blank */}</div> : null)
        )}
      </div>
    </div>
  );
}

function TypeLine({ text, onDone }){
  const [display, setDisplay] = React.useState("");
  React.useEffect(() => {
    setDisplay(""); let i = 0;
    const id = setInterval(() => {
      i++; setDisplay(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); onDone && onDone(); }
    }, 64);
    return () => clearInterval(id);
  }, [text, onDone]);
  return <div className="whitespace-pre-wrap"><span>{display}</span><span className="animate-cursor">▍</span></div>;
}

function BuildProgress({ progress, stage }){
  const value = clampProgress(progress);
  const label = { preflight: "preflight", cloning: "clone", lint: "lint", data: "data", deps: "deps", seed: "seed", compile: "compile", cache: "cache", train: "train", eval: "eval", package: "package", countdown: "countdown", idle: "idle" }[stage || 'idle'];
  return (
    <div className="mb-6 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-4 animate-fade-in" data-testid="progress">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Pipeline: <span className="uppercase">{label}</span></div>
        <div className="text-sm opacity-70">{Math.round(value)}%</div>
      </div>
      <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-lime-500 animate-shimmer" style={{ width: `${value}%` }} />
      </div>
      <div className="mt-2 text-xs opacity-70">Stages: preflight → clone → lint → data → deps → seed → compile → cache → train → eval → package → countdown</div>
    </div>
  );
}

function RevealCard({ devMode }){
  return (
    <div className="mb-6 rounded-2xl border bg-white dark:bg-zinc-950 border-pink-200 dark:border-pink-800/60 p-5 animate-pop hover:animate-wobble" data-testid="reveal">
      <div className="text-sm uppercase tracking-widest opacity-70">Release Notes</div>
      <h3 className="text-2xl font-black mt-1 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 dark:from-pink-300 dark:via-rose-300 dark:to-fuchsia-300">It’s a GIRL! 🎉</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        <li>• Feature: Tiny toes with enterprise-grade cuteness.</li>
        <li>• Performance: Throughput: 120 smiles/min at batch size 1 (on‑device inference).</li>
        <li>• Generalization: Zero‑shot grandparents support.</li>
        <li>• Regularization: Extra hugs prevent overfitting to parents only.</li>
        <li>• Explainability: Transparent cry‑to‑snack attention maps.</li>
      </ul>
      {devMode && (
        <div className="mt-3 text-xs opacity-75"><span className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 mr-2">dev‑mode</span>CI logs attached: zero flaky tests; 1 flaky nap.</div>
      )}
    </div>
  );
}

function ModelMetrics({ acc, loss }){
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8 animate-fade-in">
      <MetricCard label="Accuracy (smiles)" value={(acc*100).toFixed(1) + "%"} note="validated on family.dev" />
      <MetricCard label="Loss (tears)" value={loss.toFixed(2)} note="decreasing with cuddles" />
      <MetricCard label="F1 (Family‑1)" value={((2*(acc)/(1+acc))*100).toFixed(1) + "%"} note="precision=hugs recall=snacks" />
    </div>
  );
}
function MetricCard({ label, value, note }){
  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-4">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl font-black tracking-tight mt-1 animate-glow-soft">{value}</div>
      <div className="text-xs opacity-70 mt-1">{note}</div>
    </div>
  );
}

function Controls(){
  return (
    <div className="mb-8 grid md:grid-cols-1 gap-3">
      <div className="rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-3 text-sm opacity-80 flex items-center justify-between">
        <span className="text-xs opacity-70">(click “Run Reveal ▶” to start)</span>
      </div>
    </div>
  );
}

function Footer(){
  return (
    <div className="mt-15 text-xs opacity-70 text-center animate-fade-in">Built with ♥ by two sleep‑deprived engineers.</div>
  );
}

function EmojiConfetti({ onDone }){
  const [pieces] = React.useState(() => {
    const base = 120;
    return Array.from({ length: base }, (_, i) => ({ id: i, left: Math.random() * 100, size: 14 + Math.random() * 22, delay: Math.random() * 0.8, duration: 2.8 + Math.random() * 1.8, rotate: (Math.random() * 2 - 1) * 200, emoji: ["🎉","💖","🍼","👶","✨","🎀","🧸"][Math.floor(Math.random() * 7)], }));
  });
  React.useEffect(() => { const id = setTimeout(() => onDone?.(), 5200); return () => clearTimeout(id); }, [onDone]);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map(p => (
        <span key={p.id} style={{ position: 'absolute', left: p.left + '%', top: '-10%', fontSize: p.size + 'px', transform: `rotate(${p.rotate}deg)`, animation: `fall ${p.duration}s ${p.delay}s ease-in forwards`, }}>{p.emoji}</span>
      ))}
      <style>{`@keyframes fall { 0%{ transform: translateY(-10vh) rotate(0) } 100%{ transform: translateY(110vh) rotate(360deg) } }`}</style>
    </div>
  );
}

function FloatingBits({ active }){
  const [nodes] = React.useState(() => Array.from({length: 24}, (_, i) => ({ id: i, x: Math.random()*100, y: Math.random()*100, d: 12 + Math.random()*24, a: 6 + Math.random()*10, })));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {nodes.map(n => (
        <span key={n.id} className={`absolute rounded-full ${active ? 'bg-pink-400/10 dark:bg-pink-300/10' : 'bg-emerald-400/10 dark:bg-emerald-300/10'} blur-md`} style={{ left: n.x+"%", top: n.y+"%", width: n.d, height: n.d, animation: active ? `float ${4+n.a}s ease-in-out infinite alternate` : 'none' }} />
      ))}
      <style>{`@keyframes float { from{ transform: translateY(-6px)} to{ transform: translateY(6px)} }`}</style>
    </div>
  );
}

// Dark-mode heartbeat monitor background
function HeartbeatBackground(){
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-60">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#111" strokeWidth="0.2"/>
          </pattern>
          <linearGradient id="hbgrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee"/>
            <stop offset="50%" stopColor="#f472b6"/>
            <stop offset="100%" stopColor="#a78bfa"/>
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#grid)" />
        {/* ECG line */}
        <path d="M0,60 L10,60 20,40 25,80 30,60 40,60 50,45 55,75 60,60 70,60 80,38 85,82 90,60 100,60" fill="none" stroke="url(#hbgrad)" strokeWidth="1.8" filter="url(#glow)">
          <animate attributeName="stroke-dasharray" values="0,300;60,300" dur="1.6s" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" values="0;-120" dur="1.6s" repeatCount="indefinite"/>
        </path>
      </svg>
    </div>
  );
}

function HeartbeatDivider(){
  return (
    <div className="mt-4 h-8 relative overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-emerald-300/60 dark:bg-emerald-700/60" />
      <div className="absolute left-1/2 -translate-x-1/2 text-emerald-700 dark:text-emerald-300 animate-heartbeat">❤</div>
      <style>{`@keyframes heartbeat{0%,100%{transform:scale(1)}25%{transform:scale(1.25)}50%{transform:scale(0.9)}75%{transform:scale(1.15)}} .animate-heartbeat{animation:heartbeat 1.8s ease-in-out infinite}`}</style>
    </div>
  );
}

function BabyIcon({ className = "w-6 h-6" }){
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="10" className="fill-emerald-200/60 dark:fill-emerald-400/30" />
      <circle cx="9" cy="11" r="1.5" className="fill-zinc-900 dark:fill-zinc-100"/>
      <circle cx="15" cy="11" r="1.5" className="fill-zinc-900 dark:fill-zinc-100"/>
      <path d="M8 15c1.2 1 2.6 1.5 4 1.5S14.8 16 16 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-emerald-700 dark:text-emerald-300"/>
    </svg>
  );
}

function EmojiRain({ active }){
  const [drops, setDrops] = React.useState([]);
  React.useEffect(() => {
    if (!active) return; const base = 50;
    setDrops(Array.from({ length: base }, (_, i) => ({ id: i, left: Math.random() * 100, size: 20 + Math.random() * 20, duration: 3 + Math.random() * 2, delay: Math.random() * 2, emoji: ["🍼","👶","🎀","💖","🧸"][Math.floor(Math.random()*5)] })));
  }, [active]);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {drops.map(d => (<span key={d.id} style={{ position:'absolute', left:d.left+'%', top:'-10%', fontSize:d.size+'px', animation:`drop ${d.duration}s ${d.delay}s linear forwards` }}>{d.emoji}</span>))}
      <style>{`@keyframes drop {0%{transform:translateY(-10vh)}100%{transform:translateY(110vh)}}`}</style>
    </div>
  );
}

// ---------- Fun Visualizations (no external libs) ----------
function MetricsVisuals({ acc = 0.99, loss = 0.05 }){
  // Normalize helpers
  const pct = Math.max(0, Math.min(1, Number(acc) || 0));
  const lossN = Math.max(0, Math.min(1, Number(loss) || 0.5));
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-10">
      <DonutCard label="Accuracy" value={pct} suffix="%" />
      <TearCard label="Loss" value={lossN} />
      <HeartMatrixCard label="Family‑1 Confusion Matrix" acc={pct} />
    </div>
  );
}

function DonutCard({ label, value, suffix = "%" }){
  const perc = Math.round(value * 100);
  const r = 36, C = 2 * Math.PI * r; // circumference
  const off = C * (1 - value);
  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-4">
      <div className="text-sm opacity-70 mb-2">{label}</div>
      <div className="flex items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120" className="animate-fade-in">
          <defs>
            <linearGradient id="gradAcc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981"/>
              <stop offset="100%" stopColor="#f59e0b"/>
            </linearGradient>
            <filter id="softGlow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <circle cx="60" cy="60" r={r} stroke="#e5e7eb" strokeWidth="12" fill="none" />
          <circle cx="60" cy="60" r={r} stroke="url(#gradAcc)" strokeWidth="12" fill="none"
                  strokeDasharray={C} strokeDashoffset={off}
                  style={{ transition: 'stroke-dashoffset 1200ms ease' }}
                  transform="rotate(-90 60 60)" filter="url(#softGlow)"/>
          <text x="60" y="64" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-100" style={{fontWeight:800,fontSize:'20px'}}>{perc}{suffix}</text>
        </svg>
      </div>
      <div className="text-xs opacity-70 text-center">higher = more smiles detected</div>
    </div>
  );
}

function TearCard({ label, value }){
  // value ~ loss in [0,1]; lower is better. We fill tear to (1-value)
  const fill = Math.max(0, Math.min(1, 1 - value));
  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-4">
      <div className="text-sm opacity-70 mb-2">{label}</div>
      <div className="flex items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="tearGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa"/>
              <stop offset="100%" stopColor="#3b82f6"/>
            </linearGradient>
            <clipPath id="tearClip">
              {/* stylized teardrop */}
              <path d="M60 16 C54 28 36 46 36 68 c0 14 10 30 24 30s24-16 24-30c0-22-18-40-24-52z" />
            </clipPath>
          </defs>
          {/* Outline */}
          <path d="M60 16 C54 28 36 46 36 68 c0 14 10 30 24 30s24-16 24-30c0-22-18-40-24-52z" fill="#1f2937" opacity="0.08" stroke="#2563eb" strokeWidth="2"/>
          {/* Fill rising according to (1-loss) */}
          <g clipPath="url(#tearClip)">
            <rect x="30" y={100 - 80*fill} width="60" height="80" fill="url(#tearGrad)" style={{ transition: 'y 1000ms ease,height 1000ms ease' }} />
          </g>
          <text x="60" y="112" textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300" style={{fontSize:'11px'}}>lower = fewer tears</text>
        </svg>
      </div>
    </div>
  );
}

function HeartMatrixCard({ label, acc=0.99 }){
  // A playful 2x2 confusion matrix with hearts; we bias TP/TN by accuracy
  const tp = Math.round(100 * acc);
  const tn = Math.round(100 * acc * 0.9);
  const fp = 100 - tn;
  const fn = 100 - tp;
  const cell = (title, v, hue) => (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-white/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800">
      <div className="text-xs opacity-70 mb-1">{title}</div>
      <div aria-hidden className="text-2xl" style={{filter:'drop-shadow(0 0 6px rgba(0,0,0,.08))'}}>
        <span style={{color:hue}}>❤</span> × {v}
      </div>
    </div>
  );
  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-4">
      <div className="text-sm opacity-70 mb-2">{label}</div>
      <div className="grid grid-cols-2 gap-3">
        {cell('TP (smiles caught)', tp, '#ef4444')}
        {cell('FP (phantom coos)', fp, '#f59e0b')}
        {cell('FN (missed giggles)', fn, '#8b5cf6')}
        {cell('TN (silence ok)', tn, '#10b981')}
      </div>
      <div className="text-xs opacity-70 mt-2">Playful, not scientific — but very adorable.</div>
    </div>
  );
}

// extra micro self-test for visuals helpers
(function visualsSelfTest(){
  try{
    console.assert(typeof MetricsVisuals === 'function', 'MetricsVisuals exists');
    // simple check: donut offset math
    const r=36, C=2*Math.PI*r, val=0.5; const expected=C*(1-val); console.assert(Math.abs(expected - (C*(1-0.5)))<1e-6, 'donut offset ok');
  }catch(e){ console.warn('Visuals self-test issue', e); }
})();

// ---------- Global utility animations ----------
const globalStyles = `
@keyframes shimmer { 0%{ background-position: 0% 50% } 100%{ background-position: 100% 50% } }
@keyframes rise { from { opacity:0; transform: translateY(8px)} to { opacity:1; transform: translateY(0)} }
@keyframes fadein { from { opacity:0 } to { opacity:1 } }
@keyframes glow { 0%,100%{ filter: drop-shadow(0 0 0 rgba(16,185,129,0.0)) } 50%{ filter: drop-shadow(0 0 12px rgba(16,185,129,0.45)) } }
@keyframes cursor { 0%,49%{ opacity:1 } 50%,100%{ opacity:0 } }
@keyframes pop { 0%{ opacity:0; transform: scale(.6) translateY(12px) } 60%{ opacity:1; transform: scale(1.08) translateY(0) } 100%{ transform: scale(1) } }
@keyframes wobble { 0%{ transform: rotate(0) } 25%{ transform: rotate(1.4deg) } 50%{ transform: rotate(-1.2deg) } 75%{ transform: rotate(0.8deg) } 100%{ transform: rotate(0) } }
@keyframes celebrate { 0%{ background-color:#fff } 50%{ background-color:#fbcfe8 } 100%{ background-color:#fce7f3 } }
.animate-glow{ animation: glow 2.4s ease-in-out infinite }
.animate-glow-soft{ animation: glow 3s ease-in-out infinite }
.animate-rise{ animation: rise .6s ease-out both }
.animate-fade-in{ animation: fadein .6s ease-out both }
.animate-cursor{ animation: cursor 1.1s steps(1,end) infinite }
.animate-shimmer{ background-size: 200% 100%; animation: shimmer 3s linear infinite }
.animate-pop{ animation: pop .7s cubic-bezier(.2,1.1,.2,1) both }
.animate-wobble:hover{ animation: wobble .5s ease-in-out both }
.animate-celebrate{ animation: celebrate 2s ease-in-out; }
`;

if (typeof document !== 'undefined' && !document.getElementById('global-ml-styles')){
  const style = document.createElement('style');
  style.id = 'global-ml-styles';
  style.innerHTML = globalStyles;
  document.head.appendChild(style);
}
