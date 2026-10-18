// Sundarban Sentinel - Grameenphone Futuremakers 2026 Interactive Script

// Web Audio API Synthesizer for high-tech sound effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, delay = 0) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
  } catch (e) {
    // Audio context may require user interaction
  }
}

function playShutterSound() {
  playTone(800, 'sine', 0.05);
  playTone(400, 'triangle', 0.08, 0.05);
}

function playSuccessChime() {
  playTone(523.25, 'sine', 0.15); // C5
  playTone(659.25, 'sine', 0.15, 0.1); // E5
  playTone(783.99, 'sine', 0.25, 0.2); // G5
  playTone(1046.50, 'sine', 0.4, 0.3); // C6
}

function playWarningTone() {
  playTone(300, 'sawtooth', 0.1);
  playTone(250, 'sawtooth', 0.15, 0.1);
}

// Chapter Definitions with Timestamps & Voiceover Cues
const chapters = [
  {
    index: 0,
    startTime: 0,
    endTime: 25,
    title: "1. Wilderness Isolation",
    prompter: "00:00 - 00:25 | The deep Sundarbans 10,000 km² labyrinth: zero cellular coverage and isolated ranger patrols.",
    networkState: "offline"
  },
  {
    index: 1,
    startTime: 25,
    endTime: 55,
    title: "2. Hunter Deterrence & Community Law",
    prompter: "00:25 - 00:55 | Educating coastal fishermen & hunters: on-screen bilingual deterrence under Wildlife Act 2012.",
    networkState: "offline"
  },
  {
    index: 2,
    startTime: 55,
    endTime: 105,
    title: "3. Offline Edge AI & Legal Cards (VOICEOVER SYNC)",
    prompter: "[00:55 - 01:45 | VOICEOVER]: 'Introducing Sundarban Sentinel: an offline edge-AI conservation terminal...'",
    networkState: "offline"
  },
  {
    index: 3,
    startTime: 105,
    endTime: 135,
    title: "4. NASA Satellite Deforestation Alerts",
    prompter: "01:45 - 02:15 | NASA Earthdata NDVI anomaly monitoring: detecting forest canopy clearing and salinity stress.",
    networkState: "offline"
  },
  {
    index: 4,
    startTime: 135,
    endTime: 170,
    title: "5. Grameenphone 5G Handshake",
    prompter: "02:15 - 02:50 | Approaching coastal coverage: sudden Grameenphone 5G connection and zero-data-loss buffer auto-sync.",
    networkState: "connected"
  },
  {
    index: 5,
    startTime: 170,
    endTime: 190,
    title: "6. National Impact & Futuremakers Vision",
    prompter: "02:50 - 03:10 | AI for Nature: scalable conservation infrastructure powered by Grameenphone Futuremakers 2026.",
    networkState: "connected"
  }
];

let currentChapter = 0;
let isPlaying = false;
let playTimer = null;
let currentSeconds = 0;
const totalSeconds = 190; // 3 mins 10 secs

// DOM Elements
const stageViewport = document.getElementById('stageViewport');
const sceneViews = document.querySelectorAll('.scene-view');
const chapterTabs = document.querySelectorAll('.chapter-tab');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const timeReadout = document.getElementById('timeReadout');
const prompterText = document.getElementById('prompterText');
const networkPill = document.getElementById('networkPill');
const statusDot = document.getElementById('statusDot');
const statusLabel = document.getElementById('statusLabel');
const statusSub = document.getElementById('statusSub');
const toggleNetBtn = document.getElementById('toggleNetBtn');
const autoPlayBtn = document.getElementById('autoPlayBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Scene 3 Model Switcher Elements
const pickerBtns = document.querySelectorAll('.picker-btn');
const activeAppScreen = document.getElementById('activeAppScreen');
const hudBox = document.getElementById('hudBox');
const hudTag = document.getElementById('hudTag');
const latencyDisplay = document.getElementById('latencyDisplay');

// Model Switch Data
const modelsData = {
  tiger: {
    img: 'assets/raretiger.png',
    tag: 'রয়্যাল বেঙ্গল টাইগার 94.0%',
    top: '19%',
    left: '17%',
    width: '66%',
    height: '24%',
    borderColor: '#f59e0b',
    latency: '509ms (640x640 INT8) on CPU/NPU'
  },
  net: {
    img: 'assets/riskynetdetectoffline.png',
    tag: 'নিষিদ্ধ কারেন্ট জাল 95.0%',
    top: '20%',
    left: '17%',
    width: '66%',
    height: '23%',
    borderColor: '#ef4444',
    latency: '353ms (640x640 INT8) on CPU/NPU'
  },
  deer: {
    img: 'assets/deer.png',
    tag: 'চিত্রা হরিণ 92.0%',
    top: '21%',
    left: '17%',
    width: '66%',
    height: '23%',
    borderColor: '#10b981',
    latency: '1511ms (640x640 INT8) on CPU/NPU'
  }
};

pickerBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pickerBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const model = btn.getAttribute('data-model');
    const data = modelsData[model];

    playShutterSound();
    activeAppScreen.src = data.img;
    hudTag.textContent = data.tag;
    hudTag.style.background = data.borderColor;
    hudBox.style.borderColor = data.borderColor;
    hudBox.style.top = data.top;
    hudBox.style.left = data.left;
    hudBox.style.width = data.width;
    hudBox.style.height = data.height;
    latencyDisplay.textContent = data.latency;
  });
});

// Scene 4 NASA Screen Tabs
const screenTabs = document.querySelectorAll('.screen-tab');
const nasaScreenImg = document.getElementById('nasaScreenImg');

screenTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    screenTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const imgName = tab.getAttribute('data-img');
    playTone(600, 'sine', 0.06);
    nasaScreenImg.src = 'assets/' + imgName;
  });
});

// Scene 5 Grameenphone Handshake Trigger
const triggerHandshakeBtn = document.getElementById('triggerHandshakeBtn');
const syncProgressBar = document.getElementById('syncProgressBar');
const syncLogTerminal = document.getElementById('syncLogTerminal');
const syncStatusText = document.getElementById('syncStatusText');

function executeGrameenphoneHandshake() {
  playSuccessChime();
  setNetworkState('connected');
  syncStatusText.innerHTML = `SIGNAL ACQUIRED: GRAMEENPHONE 5G<br><span style="color:#38bdf8;">Flushing Offline Incident Buffer to Central HQ...</span>`;
  
  let progress = 0;
  syncProgressBar.style.width = '0%';
  syncLogTerminal.innerHTML = `[GP-5G] Tower Handshake established.<br>[IP-LINK] Authenticated with Sundarban Sentinel Cloud.`;

  const interval = setInterval(() => {
    progress += 20;
    syncProgressBar.style.width = progress + '%';
    
    if (progress === 40) {
      syncLogTerminal.innerHTML += `<br>[STORE-FORWARD] Uploading 3 court-admissible evidence cards...`;
      playTone(700, 'sine', 0.05);
    } else if (progress === 80) {
      syncLogTerminal.innerHTML += `<br>[EVIDENCE VAULT] High-res tiger & current jal photos synced.`;
      playTone(850, 'sine', 0.05);
    } else if (progress >= 100) {
      clearInterval(interval);
      syncLogTerminal.innerHTML += `<br>[NASA INGEST] Updated 16-day NDVI vegetation granules downloaded.<br><strong style="color:#34d399;">[SYNC COMPLETE] Zero data loss achieved!</strong>`;
      syncStatusText.innerHTML = `GRAMEENPHONE 5G SYNCHRONIZED<br><span style="color:#34d399;">All incidents safely logged with Forest Dept HQ.</span>`;
      playSuccessChime();
    }
  }, 400);
}

if (triggerHandshakeBtn) {
  triggerHandshakeBtn.addEventListener('click', executeGrameenphoneHandshake);
}

// Network Toggle Helper
function setNetworkState(state) {
  if (state === 'connected') {
    networkPill.classList.add('connected');
    statusDot.style.background = 'var(--gp-blue)';
    statusDot.style.boxShadow = '0 0 10px var(--gp-blue)';
    statusLabel.textContent = 'GRAMEENPHONE 5G CONNECTED';
    statusSub.textContent = '5 BARS • CLOUD AUTO-SYNC ACTIVE';
    toggleNetBtn.innerHTML = '<span class="icon">📴</span> Go Offline';
  } else {
    networkPill.classList.remove('connected');
    statusDot.style.background = 'var(--alert-red)';
    statusDot.style.boxShadow = '0 0 10px var(--alert-red)';
    statusLabel.textContent = 'OFFLINE FIELD MODE';
    statusSub.textContent = '0 BARS • ZERO CLOUD RELIANCE';
    toggleNetBtn.innerHTML = '<span class="icon">📶</span> Connect GP 5G';
  }
}

toggleNetBtn.addEventListener('click', () => {
  if (networkPill.classList.contains('connected')) {
    setNetworkState('offline');
    playWarningTone();
  } else {
    executeGrameenphoneHandshake();
  }
});

// Format Time Readout
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Chapter Switcher
function showChapter(idx) {
  if (idx < 0 || idx >= chapters.length) return;
  currentChapter = idx;
  const chapter = chapters[idx];

  // Update tabs
  chapterTabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === idx);
  });

  // Update scenes
  sceneViews.forEach((view, i) => {
    view.classList.toggle('active', i === idx);
  });

  // Update prompter
  prompterText.textContent = chapter.prompter;

  // Set network state
  setNetworkState(chapter.networkState);

  // If entering scene 4 automatically, trigger handshake
  if (idx === 4) {
    setTimeout(executeGrameenphoneHandshake, 800);
  }

  playTone(500, 'sine', 0.05);
}

chapterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const idx = parseInt(tab.getAttribute('data-chapter'), 10);
    currentSeconds = chapters[idx].startTime;
    timeReadout.textContent = `${formatTime(currentSeconds)} / ${formatTime(totalSeconds)}`;
    showChapter(idx);
  });
});

prevBtn.addEventListener('click', () => {
  if (currentChapter > 0) {
    showChapter(currentChapter - 1);
    currentSeconds = chapters[currentChapter].startTime;
  }
});

nextBtn.addEventListener('click', () => {
  if (currentChapter < chapters.length - 1) {
    showChapter(currentChapter + 1);
    currentSeconds = chapters[currentChapter].startTime;
  }
});

// Play / Pause Simulation Timer
function togglePlay() {
  isPlaying = !isPlaying;
  if (isPlaying) {
    playPauseBtn.textContent = '⏸ Pause';
    autoPlayBtn.innerHTML = '<span>⏸</span> Pause Pitch';
    playTimer = setInterval(() => {
      currentSeconds++;
      timeReadout.textContent = `${formatTime(currentSeconds)} / ${formatTime(totalSeconds)}`;

      // Check chapter switch
      for (let i = 0; i < chapters.length; i++) {
        if (currentSeconds >= chapters[i].startTime && currentSeconds < chapters[i].endTime) {
          if (currentChapter !== i) {
            showChapter(i);
          }
          break;
        }
      }

      if (currentSeconds >= totalSeconds) {
        currentSeconds = 0;
        togglePlay();
      }
    }, 1000);
  } else {
    playPauseBtn.textContent = '▶ Play Presentation';
    autoPlayBtn.innerHTML = '<span class="play-icon">▶</span> Auto-Play Pitch';
    clearInterval(playTimer);
  }
}

playPauseBtn.addEventListener('click', togglePlay);
autoPlayBtn.addEventListener('click', togglePlay);

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// Keyboard Navigation
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') {
    nextBtn.click();
  } else if (e.key === 'ArrowLeft') {
    prevBtn.click();
  } else if (e.key === ' ') {
    e.preventDefault();
    togglePlay();
  }
});

// Initial Setup
showChapter(0);
