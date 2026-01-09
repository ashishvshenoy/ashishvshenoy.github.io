/* Baby Shower Jeopardy Tournament
   - 4 players per round
   - 4 initial rounds + Final round (winners)
   - timed question per clue
   - in-app JSON editor for rounds/questions
*/

const LS_KEY = "bsj_tournament_state_v1";
const LS_Q_KEY = "bsj_questions_v1";

const el = (id) => document.getElementById(id);

const setupView = el("setupView");
const boardView = el("boardView");

const roundSelect = el("roundSelect");
const timerSecondsInput = el("timerSeconds");
const pInputs = [el("p1"), el("p2"), el("p3"), el("p4")];
const btnStartRound = el("btnStartRound");
const btnQuickFill = el("btnQuickFill");
const setupHint = el("setupHint");
const statusBox = el("statusBox");

const boardTitle = el("boardTitle");
const boardSub = el("boardSub");
const scoreboard = el("scoreboard");
const board = el("board");
const btnEndRound = el("btnEndRound");

const modal = el("modal");
const modalCategory = el("modalCategory");
const modalValue = el("modalValue");
const modalQuestion = el("modalQuestion");
const modalImage = el("modalImage");
const modalAnswerBox = el("modalAnswerBox");
const modalAnswer = el("modalAnswer");
const btnReveal = el("btnReveal");
const btnPlayAudio = el("btnPlayAudio");
const btnToggleImage = el("btnToggleImage");
const btnCloseModal = el("btnCloseModal");
const adjudicateButtons = el("adjudicateButtons");

const timerDisplay = el("timerDisplay");
const btnTimerStart = el("btnTimerStart");
const btnTimerPause = el("btnTimerPause");
const btnTimerReset = el("btnTimerReset");

const btnOpenSettings = el("btnOpenSettings");
const btnCloseSettings = el("btnCloseSettings");
const btnSaveQuestions = el("btnSaveQuestions");
const btnRestoreDefault = el("btnRestoreDefault");
const settingsModal = el("settingsModal");
const questionsEditor = el("questionsEditor");
const settingsMessage = el("settingsMessage");

const btnResetAll = el("btnResetAll");

// -------- State --------
let rounds = loadRounds();
let state = loadState();

let currentRoundId = null;
let currentRound = null;
let players = [];
let scores = {};
let used = {}; // clue key -> true
let activeClue = null; // {catIndex, clueIndex}
let timer = { total: 25, remaining: 25, running: false, handle: null };
let clueAudio = new Audio();
clueAudio.preload = "auto";

// -------- Sound FX (WebAudio; no copyrighted Jeopardy audio) --------
let audioCtx = null;
let soundEnabled = true;

function getAudioCtx(){
  if(!audioCtx){
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  // Some browsers start suspended until a user gesture
  if(audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  return audioCtx;
}

function playTone({freq=440, duration=0.15, type='sine', gain=0.08, when=0} = {}){
  if(!soundEnabled) return;
  const ctx = getAudioCtx();
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function playCorrectSfx(){
  // quick happy triad
  playTone({freq: 523.25, duration: 0.12, type: 'triangle', gain: 0.09});
  playTone({freq: 659.25, duration: 0.12, type: 'triangle', gain: 0.09, when: 0.08});
  playTone({freq: 783.99, duration: 0.16, type: 'triangle', gain: 0.10, when: 0.16});
}

function playWrongSfx(){
  // buzzy descending
  playTone({freq: 220, duration: 0.12, type: 'sawtooth', gain: 0.07});
  playTone({freq: 196, duration: 0.18, type: 'sawtooth', gain: 0.07, when: 0.08});
  playTone({freq: 174.61, duration: 0.22, type: 'sawtooth', gain: 0.07, when: 0.18});
}

function playTimeUpSfx(){
  // three beeps
  playTone({freq: 880, duration: 0.10, type: 'square', gain: 0.06});
  playTone({freq: 880, duration: 0.10, type: 'square', gain: 0.06, when: 0.16});
  playTone({freq: 880, duration: 0.10, type: 'square', gain: 0.06, when: 0.32});
}

function loadRounds(){
  const saved = localStorage.getItem(LS_Q_KEY);
  if(saved){
    try { return JSON.parse(saved); } catch(e){}
  }
  return JSON.parse(JSON.stringify(window.DEFAULT_ROUNDS));
}

function saveRounds(newRounds){
  localStorage.setItem(LS_Q_KEY, JSON.stringify(newRounds));
}

function loadState(){
  const saved = localStorage.getItem(LS_KEY);
  if(saved){
    try { return JSON.parse(saved); } catch(e){}
  }
  return {
    completedRounds: {}, // roundId -> { winnerName, scores }
    finalists: [],
    finalWinner: null
  };
}

function saveState(){
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function resetTournament(){
  if(!confirm("Reset the entire tournament (round winners + finals)?")) return;
  localStorage.removeItem(LS_KEY);
  state = loadState();
  renderStatus();
  populateRoundSelect();
  setupHint.textContent = "";
}

function formatTime(sec){
  const m = Math.floor(sec/60);
  const s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function timerSet(seconds){
  timer.total = seconds;
  timer.remaining = seconds;
  timer.running = false;
  if(timer.handle) clearInterval(timer.handle);
  timer.handle = null;
  timerDisplay.textContent = formatTime(timer.remaining);
}

function timerStart(){
  if(timer.running) return;
  timer.running = true;
  if(timer.handle) clearInterval(timer.handle);
  timer.handle = setInterval(()=>{
    timer.remaining = Math.max(0, timer.remaining - 1);
    timerDisplay.textContent = formatTime(timer.remaining);
    if(timer.remaining === 0){
      timerPause();
      timerDisplay.textContent = "⏰ 00:00";
      playTimeUpSfx();
    }
  }, 1000);
}
function timerPause(){
  timer.running = false;
  if(timer.handle) clearInterval(timer.handle);
  timer.handle = null;
}
function timerReset(){
  timerPause();
  timer.remaining = timer.total;
  timerDisplay.textContent = formatTime(timer.remaining);
}

btnTimerStart.addEventListener("click", timerStart);
btnTimerPause.addEventListener("click", timerPause);
btnTimerReset.addEventListener("click", timerReset);


function applyImageStage(imgEl, stage){
  // stage 0: super zoomed + heavy blur (cropped)
  // stage 1: zoomed + lighter blur
  // stage 2: normal (no blur, contain)
  if(!imgEl) return;
  imgEl.dataset.stage = String(stage);

  if(stage === 0){
    imgEl.classList.add("blurred");
    imgEl.style.objectFit = "cover";
    imgEl.style.transform = "scale(1.8)";
  } else if(stage === 1){
    imgEl.classList.add("blurred");
    imgEl.style.objectFit = "cover";
    imgEl.style.transform = "scale(1.25)";
    // lighter blur via inline filter override
    imgEl.style.filter = "blur(7px) saturate(1.1)";
  } else {
    imgEl.classList.remove("blurred");
    imgEl.style.filter = "";
    imgEl.style.objectFit = "contain";
    imgEl.style.transform = "none";
  }
}

// -------- UI --------
function populateRoundSelect(){
  roundSelect.innerHTML = "";
  rounds.forEach(r=>{
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = r.name + (state.completedRounds[r.id] ? " ✅" : "");
    roundSelect.appendChild(opt);
  });

  const initial = rounds.filter(r=>r.id !== "FINAL");
  const next = initial.find(r=>!state.completedRounds[r.id]);
  roundSelect.value = (next ? next.id : "FINAL");
}

function renderStatus(){
  const initial = rounds.filter(r=>r.id !== "FINAL");
  const doneCount = initial.filter(r=>state.completedRounds[r.id]).length;

  const finalists = initial
    .map(r => state.completedRounds[r.id]?.winnerName)
    .filter(Boolean);

  state.finalists = finalists;
  saveState();

  const finalReady = finalists.length === initial.length;

  statusBox.innerHTML = "";

  const s1 = document.createElement("div");
  s1.className = "statusItem";
  s1.innerHTML = `<strong>Initial rounds completed</strong><span class="badge ${doneCount===initial.length ? "win":"pending"}">${doneCount}/${initial.length}</span>`;
  statusBox.appendChild(s1);

  initial.forEach(r=>{
    const row = document.createElement("div");
    row.className = "statusItem";
    const winner = state.completedRounds[r.id]?.winnerName;
    row.innerHTML = `<span>${escapeHtml(r.name)}</span><span class="badge ${winner ? "win":"pending"}">${winner ? "Winner: " + escapeHtml(winner) : "Pending"}</span>`;
    statusBox.appendChild(row);
  });

  const s2 = document.createElement("div");
  s2.className = "statusItem";
  s2.innerHTML = `<strong>Final round</strong><span class="badge ${state.completedRounds["FINAL"] ? "win" : (finalReady ? "pending":"pending")}">${state.completedRounds["FINAL"] ? "Completed ✅" : (finalReady ? "Ready" : "Locked")}</span>`;
  statusBox.appendChild(s2);

  if(state.completedRounds["FINAL"]){
    const row = document.createElement("div");
    row.className = "statusItem";
    row.innerHTML = `<span>Champion</span><span class="badge win">🏆 ${escapeHtml(state.completedRounds["FINAL"].winnerName)}</span>`;
    statusBox.appendChild(row);
  } else if(finalReady){
    const row = document.createElement("div");
    row.className = "statusItem";
    row.innerHTML = `<span>Finalists</span><span class="badge pending">${finalists.map(escapeHtml).join(", ")}</span>`;
    statusBox.appendChild(row);
  }
}

function showSetup(){
  setupView.classList.remove("hidden");
  boardView.classList.add("hidden");
}

function showBoard(){
  setupView.classList.add("hidden");
  boardView.classList.remove("hidden");
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function getRoundById(id){
  return rounds.find(r=>r.id===id);
}

// -------- Game logic --------
function validatePlayers(names){
  const trimmed = names.map(n=>n.trim()).filter(Boolean);
  if(trimmed.length !== 4) return { ok:false, msg:"Please enter exactly 4 player names." };
  const uniq = new Set(trimmed.map(n=>n.toLowerCase()));
  if(uniq.size !== 4) return { ok:false, msg:"Player names must be unique." };
  return { ok:true, names: trimmed };
}

function startRound(){
  const roundId = roundSelect.value;
  const roundObj = getRoundById(roundId);
  if(!roundObj){
    setupHint.textContent = "Round not found.";
    return;
  }

  if(roundId === "FINAL"){
    const initial = rounds.filter(r=>r.id !== "FINAL");
    const finalists = initial.map(r=>state.completedRounds[r.id]?.winnerName).filter(Boolean);
    if(finalists.length !== initial.length){
      setupHint.textContent = "Final round is locked until all initial rounds have winners.";
      return;
    }
    players = finalists.slice(0,4);
    setupHint.textContent = "";
  } else {
    const v = validatePlayers(pInputs.map(i=>i.value));
    if(!v.ok){
      setupHint.textContent = v.msg;
      return;
    }
    players = v.names;
    setupHint.textContent = "";
  }

  const seconds = Math.max(5, Math.min(120, parseInt(timerSecondsInput.value || "25",10)));
  timerSet(seconds);

  currentRoundId = roundId;
  currentRound = roundObj;
  scores = {};
  players.forEach(p=>scores[p]=0);
  used = {};
  activeClue = null;

  renderBoard();
  renderScoreboard();
  showBoard();
}

function renderScoreboard(){
  scoreboard.innerHTML = "";
  players.forEach(p=>{
    const card = document.createElement("div");
    card.className = "scoreCard";
    const left = document.createElement("div");
    left.innerHTML = `<div class="scoreName">${escapeHtml(p)}</div><div class="hint smallHint">Score</div>`;
    const right = document.createElement("div");
    right.innerHTML = `<div class="scoreValue" id="score_${cssSafe(p)}">${scores[p]}</div>`;
    const controls = document.createElement("div");
    controls.className = "scoreControls";
    const b1 = document.createElement("button"); b1.textContent = "+100"; b1.onclick=()=>{scores[p]+=100; updateScore(p);};
    const b2 = document.createElement("button"); b2.textContent = "-100"; b2.className="secondary"; b2.onclick=()=>{scores[p]-=100; updateScore(p);};
    controls.appendChild(b1); controls.appendChild(b2);
    right.appendChild(controls);
    card.appendChild(left);
    card.appendChild(right);
    scoreboard.appendChild(card);
  });
}

function cssSafe(name){
  return name.replace(/[^a-zA-Z0-9_-]/g,"_");
}

function updateScore(player){
  const node = document.getElementById("score_"+cssSafe(player));
  if(node) node.textContent = scores[player];
}

function clueKey(catIndex, clueIndex){
  return `${currentRoundId}:${catIndex}:${clueIndex}`;
}

function allCluesUsed(){
  const total = currentRound.categories.reduce((acc,c)=>acc + c.clues.length, 0);
  return Object.keys(used).length >= total;
}

function renderBoard(){
  boardTitle.textContent = currentRound.name;
  boardSub.textContent = `Players: ${players.join(" • ")}`;

  board.innerHTML = "";

  currentRound.categories.forEach((cat)=>{
    const c = document.createElement("div");
    c.className = "category";
    c.textContent = cat.name;
    board.appendChild(c);
  });

  for(let row=0; row<2; row++){
    currentRound.categories.forEach((cat, catIndex)=>{
      const clue = cat.clues[row];
      const key = clueKey(catIndex, row);
      const t = document.createElement("div");
      t.className = "tile" + (used[key] ? " used" : "");
      t.textContent = "$" + clue.value;
      t.onclick = ()=> {
        if(used[key]) return;
        openClue(catIndex, row);
      };
      board.appendChild(t);
    });
  }
}

function openClue(catIndex, clueIndex){
  activeClue = {catIndex, clueIndex};

  const cat = currentRound.categories[catIndex];
  const clue = cat.clues[clueIndex];

  modalCategory.textContent = cat.name;
  modalValue.textContent = "$" + clue.value;
  modalQuestion.textContent = clue.q;

  // ---- Audio (nursery rhyme / sound clips) ----
  // Use "audioUrl" in your clue JSON, e.g. audioUrl: "assets/audio/twinkle.mp3"
  if (clue.audioUrl) {
    btnPlayAudio.classList.remove("hidden");
    btnPlayAudio.textContent = "Play audio";

    // Reset + load new audio
    clueAudio.pause();
    clueAudio.currentTime = 0;
    clueAudio.src = clue.audioUrl;
    clueAudio.load();

    // OPTIONAL: autoplay as soon as question opens (uncomment if you want)
    // clueAudio.play().then(()=>{ btnPlayAudio.textContent = "Pause audio"; }).catch(()=>{});
  } else {
    // No audio for this clue
    btnPlayAudio.classList.add("hidden");
    btnPlayAudio.textContent = "Play audio";
    clueAudio.pause();
    clueAudio.currentTime = 0;
    clueAudio.removeAttribute("src");
  }

  if(clue.imageUrl){
    modalImage.classList.remove("hidden");
    if(clue.trickyImage){
      modalImage.innerHTML = `
        <div class="imgWrap">
          <img class="clueImg blurred" alt="Question image" src="${clue.imageUrl}"/>
          <button class="imgRevealBtn" type="button">Reveal image</button>
        </div>`;
      const btn = modalImage.querySelector(".imgRevealBtn");
      const img = modalImage.querySelector(".clueImg");
      btn.onclick = () => {
        img.classList.toggle("blurred");
        btn.textContent = img.classList.contains("blurred") ? "Reveal image" : "Re-blur";
      };
    } else {
      modalImage.innerHTML = `<img class="clueImg" alt="Question image" src="${clue.imageUrl}"/>`;
    }
  } else if(clue.imageSvg){
    modalImage.classList.remove("hidden");
    modalImage.innerHTML = clue.imageSvg;
  } else {
    modalImage.classList.add("hidden");
    modalImage.innerHTML = "";
  }

  modalAnswerBox.classList.add("hidden");
  modalAnswer.textContent = clue.a;

  adjudicateButtons.innerHTML = "";
  players.forEach(p=>{
    const correct = document.createElement("button");
    correct.textContent = `✅ ${p} +${clue.value}`;
    correct.onclick = ()=>scoreClue(p, +clue.value);

    const wrong = document.createElement("button");
    wrong.textContent = `❌ ${p} -${clue.value}`;
    wrong.className = "wrong";
    wrong.onclick = ()=>scoreClue(p, -clue.value);

    adjudicateButtons.appendChild(correct);
    adjudicateButtons.appendChild(wrong);
  });

  const skip = document.createElement("button");
  skip.textContent = "No score (skip)";
  skip.className = "skip";
  skip.onclick = ()=>closeClue(false);
  adjudicateButtons.appendChild(skip);

  modal.classList.remove("hidden");

  timerReset();
  timerStart();
}

function scoreClue(player, delta){
  scores[player] += delta;
  updateScore(player);
  if(delta > 0) playCorrectSfx();
  if(delta < 0) playWrongSfx();
  closeClue(true);
}

function closeClue(markUsed){
  if(activeClue && markUsed){
    const key = clueKey(activeClue.catIndex, activeClue.clueIndex);
    used[key] = true;
  }
  activeClue = null;
  modal.classList.add("hidden");
    // Stop any playing clue audio
  clueAudio.pause();
  clueAudio.currentTime = 0;
  if (btnPlayAudio) btnPlayAudio.textContent = "Play audio";
  timerPause();
  renderBoard();

  if(allCluesUsed()){
    boardSub.textContent = `All clues used. Click "End Round" to finalize winner.`;
  }
}

btnToggleImage && btnToggleImage.addEventListener("click", ()=>{
  const imgEl = modalImage.querySelector("img");
  if(!imgEl) return;
  const stage = parseInt(imgEl.dataset.stage || "2", 10);

  // Cycle reveal stages for tricky images
  const next = (stage + 1) % 3;
  applyImageStage(imgEl, next);

  btnToggleImage.textContent = (next === 2) ? "Blur image" : "Reveal image";
});

btnReveal.addEventListener("click", ()=> {
  modalAnswerBox.classList.remove("hidden");
});
btnCloseModal.addEventListener("click", ()=> closeClue(false));
modal.addEventListener("click", (e)=>{ if(e.target === modal) closeClue(false); });

btnEndRound.addEventListener("click", ()=> endRound());
btnPlayAudio && btnPlayAudio.addEventListener("click", async () => {
  if (!clueAudio.src) return;

  // Toggle play/pause
  if (!clueAudio.paused) {
    clueAudio.pause();
    btnPlayAudio.textContent = "Play audio";
    return;
  }

  try {
    await clueAudio.play();
    btnPlayAudio.textContent = "Pause audio";
  } catch (e) {
    console.warn("Audio play blocked:", e);
    // Usually only blocked if not triggered by a user gesture — this click should be ok.
  }
});

// When audio ends, reset button label
clueAudio.addEventListener("ended", () => {
  if (btnPlayAudio) btnPlayAudio.textContent = "Play audio";
});

function endRound(){
  if(!currentRoundId) return;

  const entries = Object.entries(scores);
  entries.sort((a,b)=> b[1]-a[1]);
  const topScore = entries[0][1];
  const tied = entries.filter(([_,s])=>s===topScore).map(([p,_])=>p);

  let winner = tied[0];
  if(tied.length > 1){
    const chosen = prompt(`Tie for 1st (${topScore}) between: ${tied.join(", ")}\nType the winner name exactly:`, winner);
    if(chosen && tied.includes(chosen.trim())) winner = chosen.trim();
  }

  state.completedRounds[currentRoundId] = { winnerName: winner, scores: scores };
  saveState();

  renderStatus();
  populateRoundSelect();
  showSetup();

  alert(`${currentRound.name} winner: ${winner} (score ${scores[winner]}).`);
}

// -------- Settings / Editor --------
function openSettings(){
  settingsMessage.textContent = "";
  questionsEditor.value = JSON.stringify(rounds, null, 2);
  settingsModal.classList.remove("hidden");
}
function closeSettings(){
  settingsModal.classList.add("hidden");
}

btnOpenSettings.addEventListener("click", openSettings);
btnCloseSettings.addEventListener("click", closeSettings);
settingsModal.addEventListener("click", (e)=>{ if(e.target===settingsModal) closeSettings(); });

btnSaveQuestions.addEventListener("click", ()=>{
  try{
    const parsed = JSON.parse(questionsEditor.value);
    validateRounds(parsed);
    rounds = parsed;
    saveRounds(rounds);
    populateRoundSelect();
    renderStatus();
    settingsMessage.textContent = "Saved ✅";
  }catch(e){
    settingsMessage.textContent = "Error: " + e.message;
  }
});

btnRestoreDefault.addEventListener("click", ()=>{
  if(!confirm("Restore default questions? This will overwrite your saved edits.")) return;
  rounds = JSON.parse(JSON.stringify(window.DEFAULT_ROUNDS));
  saveRounds(rounds);
  questionsEditor.value = JSON.stringify(rounds, null, 2);
  populateRoundSelect();
  renderStatus();
  settingsMessage.textContent = "Restored defaults ✅";
});

function validateRounds(rds){
  if(!Array.isArray(rds)) throw new Error("Rounds must be an array.");
  rds.forEach((r,i)=>{
    if(!r.id || !r.name) throw new Error(`Round at index ${i} must have id and name.`);
    if(!Array.isArray(r.categories) || r.categories.length !== 4) throw new Error(`Round ${r.id} must have exactly 4 categories.`);
    r.categories.forEach((c,ci)=>{
      if(!c.name) throw new Error(`Round ${r.id} category ${ci} missing name.`);
      if(!Array.isArray(c.clues) || c.clues.length !== 2) throw new Error(`Round ${r.id} category "${c.name}" must have exactly 2 clues.`);
      c.clues.forEach((cl,ki)=>{
        if(typeof cl.value !== "number") throw new Error(`Round ${r.id} "${c.name}" clue ${ki} value must be number.`);
        if(!cl.q || !cl.a) throw new Error(`Round ${r.id} "${c.name}" clue ${ki} must have q and a.`);
      });
    });
  });
}

// -------- Setup helpers --------
btnStartRound.addEventListener("click", startRound);
btnQuickFill.addEventListener("click", ()=>["A","B","C","D"].forEach((v,i)=>pInputs[i].value=v));
btnResetAll.addEventListener("click", resetTournament);

// -------- Init --------
function init(){
  renderStatus();
  populateRoundSelect();
  timerSet(parseInt(timerSecondsInput.value,10) || 25);

  roundSelect.addEventListener("change", ()=>{
    if(roundSelect.value === "FINAL"){
      const initial = rounds.filter(r=>r.id !== "FINAL");
      const finalists = initial.map(r=>state.completedRounds[r.id]?.winnerName).filter(Boolean);
      if(finalists.length === initial.length){
        pInputs.forEach((inp, idx)=> inp.value = finalists[idx] || "");
        setupHint.textContent = finalists.length>4 ? "You have 5 winners. This template runs a 4-player final (first 4 shown)." : "";
      } else {
        pInputs.forEach(inp=>inp.value="");
        setupHint.textContent = "Final is locked until all initial rounds are completed.";
      }
    } else {
      setupHint.textContent = "";
      pInputs.forEach(inp=>inp.value="");
    }
  });
}
init();
