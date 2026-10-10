import { QoLNotificationSynth } from './audio/QoLNotificationSynth.js';

// Application State
const state = {
  theme: localStorage.getItem('deskflow_theme') || 'light',
  activeTab: 'tab-breathing',
  synth: new QoLNotificationSynth(),

  // Physiological Sigh
  isSighRunning: false,
  sighPhaseIndex: 0,
  sighRounds: 0,
  sighTimer: null,
  sighAnimation: null,

  // Box Breathing
  isBoxRunning: false,
  boxPhase: 'IDLE',
  boxPhaseSec: 4,
  boxTimer: null,

  // Saccadic Eye Tracker
  isSaccadicRunning: false,
  saccadicSpeed: 0.003, // slow: 0.003, med: 0.006, fast: 0.010
  saccadicPos: 0,
  saccadicDir: 1,
  saccadicAnimId: null,

  // 20-20-20 Eye Timer
  eyeDuration: 20 * 60,
  eyeTimeLeft: 20 * 60,
  isEyeRunning: false,
  eyeInterval: null,

  // Somatic Unclench
  somaticSecondsLeft: 20,
  somaticInterval: null,

  // Pomodoro
  pomoMode: 'work',
  pomoDurations: { work: 25 * 60, short: 5 * 60, long: 15 * 60 },
  pomoTimeLeft: 25 * 60,
  isPomoRunning: false,
  pomoInterval: null,

  // Hydration (8 blocks of 250ml = 2000ml)
  waterTotal: parseInt(localStorage.getItem('deskflow_water_total') || '0', 10),

  // Blackout Overlay
  blackoutSec: 20,
  blackoutInterval: null
};

// UI INITIALIZATION
function initApp() {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeButton();
  setupNavigation();

  // 01. Neuro-Breath: Physiological Sigh & Box
  setupPhysiologicalSigh();
  setupBoxBreathing();

  // 02. Saccadic Eyes & 20-20-20
  setupSaccadicEyeTracker();
  setupEyeTimer();

  // 03. Somatic Unclench
  setupSomaticUnclench();

  // 04. Binaural Waves & Noise
  setupBinauralAndNoise();

  // 05. Work Clock & Hydration
  setupPomodoro();
  setupHydrationBlocks();

  // 06. Brain Dump
  setupBrainDump();

  // Global Blackout Zen
  setupBlackoutZen();

  // Theme Toggle
  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    state.synth.playClick();
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('deskflow_theme', state.theme);
    updateThemeButton();
  });
}

function updateThemeButton() {
  const label = document.getElementById('theme-label');
  label.textContent = state.theme === 'light' ? 'DARK_MODE' : 'LIGHT_MODE';
}

function setupNavigation() {
  document.querySelectorAll('.b-nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.synth.playClick();
      const targetId = tab.dataset.tab;
      document.querySelectorAll('.b-nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(targetId).classList.add('active');
      state.activeTab = targetId;
    });
  });
}

// -------------------------------------------------------------
// 01. NEURO-RESPIRATORY: PHYSIOLOGICAL SIGH & BOX BREATH
// -------------------------------------------------------------
function setupPhysiologicalSigh() {
  const btnToggle = document.getElementById('btn-sigh-toggle');
  const btnReset = document.getElementById('btn-sigh-reset');

  btnToggle.addEventListener('click', () => {
    state.synth.playClick();
    if (state.isSighRunning) {
      stopSigh();
    } else {
      startSigh();
    }
  });

  btnReset.addEventListener('click', () => {
    state.synth.playClick();
    stopSigh();
    state.sighRounds = 0;
    document.getElementById('sigh-round-count').textContent = '0';
    document.getElementById('sigh-phase-text').textContent = 'PRESS START TO INITIATE';
    document.getElementById('sigh-gauge-bar').style.width = '0%';
  });
}

function startSigh() {
  state.isSighRunning = true;
  document.getElementById('btn-sigh-toggle').textContent = 'HALT SIGH PACER';
  document.getElementById('session-status').textContent = 'NEURO_SIGH';
  runSighCycle();
}

function stopSigh() {
  state.isSighRunning = false;
  clearTimeout(state.sighTimer);
  document.getElementById('btn-sigh-toggle').textContent = 'START SIGH PACER';
  document.getElementById('session-status').textContent = 'STANDBY';
}

function runSighCycle() {
  if (!state.isSighRunning) return;

  const phaseLabel = document.getElementById('sigh-phase-text');
  const bar = document.getElementById('sigh-gauge-bar');
  const inst = document.getElementById('sigh-instruction');

  // STEP 1: Deep Nasal Inhale (2.0s)
  phaseLabel.textContent = '1. DEEP NASAL INHALE >>>';
  inst.textContent = 'Fill lungs smoothly through your nostrils (70% full)...';
  bar.style.transition = 'width 2.0s ease-out';
  bar.style.width = '70%';
  state.synth.playBreathCue('inhale1');

  state.sighTimer = setTimeout(() => {
    if (!state.isSighRunning) return;

    // STEP 2: Quick Top-Off Inhale (1.0s)
    phaseLabel.textContent = '2. TOP-OFF SHARP INHALE ^^^';
    inst.textContent = 'Quick extra breath to fully inflate collapsed alveoli...';
    bar.style.transition = 'width 0.9s ease-out';
    bar.style.width = '100%';
    state.synth.playBreathCue('inhale2');

    state.sighTimer = setTimeout(() => {
      if (!state.isSighRunning) return;

      // STEP 3: Long Slow Exhale (5.5s)
      phaseLabel.textContent = '3. LONG SOOTHING EXHALE <<<';
      inst.textContent = 'Slowly dump carbon dioxide through relaxed mouth...';
      bar.style.transition = 'width 5.5s linear';
      bar.style.width = '0%';
      state.synth.playBreathCue('exhale');

      state.sighTimer = setTimeout(() => {
        if (!state.isSighRunning) return;

        state.sighRounds++;
        document.getElementById('sigh-round-count').textContent = state.sighRounds;

        // Brief 1s pause between cycles
        phaseLabel.textContent = 'RESTING GAP...';
        state.sighTimer = setTimeout(() => {
          runSighCycle();
        }, 1000);

      }, 5500);

    }, 1000);

  }, 2000);
}

// BOX BREATHING
function setupBoxBreathing() {
  const btnToggle = document.getElementById('btn-box-toggle');
  const btnReset = document.getElementById('btn-box-reset');

  btnToggle.addEventListener('click', () => {
    state.synth.playClick();
    if (state.isBoxRunning) {
      stopBox();
    } else {
      startBox();
    }
  });

  btnReset.addEventListener('click', () => {
    state.synth.playClick();
    stopBox();
    document.getElementById('box-phase-name').textContent = 'IDLE';
    document.getElementById('box-phase-sec').textContent = '4';
    positionBoxDot('top-left');
  });
}

function startBox() {
  state.isBoxRunning = true;
  document.getElementById('btn-box-toggle').textContent = 'HALT BOX SESSION';
  document.getElementById('session-status').textContent = 'BOX_BREATH';

  const phases = [
    { name: 'INHALE', pos: 'top-right', cue: 'inhale1' },
    { name: 'HOLD',   pos: 'bottom-right', cue: 'hold' },
    { name: 'EXHALE', pos: 'bottom-left', cue: 'exhale' },
    { name: 'HOLD',   pos: 'top-left', cue: 'hold' }
  ];

  let pIndex = 0;
  let sec = 4;

  const tick = () => {
    if (!state.isBoxRunning) return;

    if (sec === 4) {
      const cur = phases[pIndex];
      document.getElementById('box-phase-name').textContent = cur.name;
      positionBoxDot(cur.pos);
      state.synth.playBreathCue(cur.cue);
    }

    document.getElementById('box-phase-sec').textContent = sec;
    sec--;

    if (sec < 0) {
      sec = 4;
      pIndex = (pIndex + 1) % phases.length;
    }

    state.boxTimer = setTimeout(tick, 1000);
  };

  tick();
}

function stopBox() {
  state.isBoxRunning = false;
  clearTimeout(state.boxTimer);
  document.getElementById('btn-box-toggle').textContent = 'START BOX SESSION';
  document.getElementById('session-status').textContent = 'STANDBY';
}

function positionBoxDot(pos) {
  const dot = document.getElementById('box-indicator');
  if (pos === 'top-left') {
    dot.style.top = '-11px';
    dot.style.left = '-11px';
  } else if (pos === 'top-right') {
    dot.style.top = '-11px';
    dot.style.left = '153px';
  } else if (pos === 'bottom-right') {
    dot.style.top = '153px';
    dot.style.left = '153px';
  } else if (pos === 'bottom-left') {
    dot.style.top = '153px';
    dot.style.left = '-11px';
  }
}

// -------------------------------------------------------------
// 02. SACCADIC BILATERAL EYE TRACKER & 20-20-20 TIMER
// -------------------------------------------------------------
function setupSaccadicEyeTracker() {
  const btnToggle = document.getElementById('btn-saccadic-toggle');
  const dot = document.getElementById('saccadic-dot');

  btnToggle.addEventListener('click', () => {
    state.synth.playClick();
    if (state.isSaccadicRunning) {
      stopSaccadic();
    } else {
      startSaccadic();
    }
  });

  // Speed chips
  document.querySelectorAll('.speed-selector-row .b-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.synth.playClick();
      document.querySelectorAll('.speed-selector-row .b-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const speedMode = chip.dataset.speed;
      if (speedMode === 'slow') state.saccadicSpeed = 0.0035;
      if (speedMode === 'med')  state.saccadicSpeed = 0.007;
      if (speedMode === 'fast') state.saccadicSpeed = 0.012;
    });
  });
}

function startSaccadic() {
  state.isSaccadicRunning = true;
  document.getElementById('btn-saccadic-toggle').textContent = 'PAUSE TRACKER';
  document.getElementById('session-status').textContent = 'EYE_TRACKING';

  const dot = document.getElementById('saccadic-dot');

  const animate = () => {
    if (!state.isSaccadicRunning) return;

    state.saccadicPos += state.saccadicSpeed * state.saccadicDir;

    if (state.saccadicPos >= 1) {
      state.saccadicPos = 1;
      state.saccadicDir = -1;
      state.synth.playClick();
    } else if (state.saccadicPos <= 0) {
      state.saccadicPos = 0;
      state.saccadicDir = 1;
      state.synth.playClick();
    }

    dot.style.left = `${(state.saccadicPos * 100).toFixed(2)}%`;
    state.saccadicAnimId = requestAnimationFrame(animate);
  };

  state.saccadicAnimId = requestAnimationFrame(animate);
}

function stopSaccadic() {
  state.isSaccadicRunning = false;
  cancelAnimationFrame(state.saccadicAnimId);
  document.getElementById('btn-saccadic-toggle').textContent = 'ACTIVATE TRACKER';
  document.getElementById('session-status').textContent = 'STANDBY';
}

// 20-20-20 EYE PRESERVATION
function setupEyeTimer() {
  const btnStart = document.getElementById('btn-eye-start');
  const btnReset = document.getElementById('btn-eye-reset');
  const btnManual = document.getElementById('btn-trigger-overlay');

  btnStart.addEventListener('click', toggleEyeTimer);
  btnReset.addEventListener('click', resetEyeTimer);
  btnManual.addEventListener('click', () => {
    state.synth.playClick();
    triggerBlackout(20);
  });
}

function toggleEyeTimer() {
  state.synth.playClick();
  const btn = document.getElementById('btn-eye-start');

  if (state.isEyeRunning) {
    clearInterval(state.eyeInterval);
    state.isEyeRunning = false;
    btn.textContent = 'RESUME 20M COUNTDOWN';
  } else {
    state.isEyeRunning = true;
    btn.textContent = 'PAUSE 20M COUNTDOWN';

    state.eyeInterval = setInterval(() => {
      if (state.eyeTimeLeft > 0) {
        state.eyeTimeLeft--;
        updateEyeDisplay();
      } else {
        clearInterval(state.eyeInterval);
        state.isEyeRunning = false;
        state.synth.playBell();
        triggerBlackout(20);
        resetEyeTimer();
      }
    }, 1000);
  }
}

function resetEyeTimer() {
  clearInterval(state.eyeInterval);
  state.isEyeRunning = false;
  state.eyeTimeLeft = state.eyeDuration;
  updateEyeDisplay();
  document.getElementById('btn-eye-start').textContent = 'START 20M COUNTDOWN';
}

function updateEyeDisplay() {
  const mins = Math.floor(state.eyeTimeLeft / 60);
  const secs = state.eyeTimeLeft % 60;
  document.getElementById('eye-timer-text').textContent = 
    `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const pct = (state.eyeTimeLeft / state.eyeDuration) * 100;
  document.getElementById('eye-progress-fill').style.width = `${pct}%`;
}

// -------------------------------------------------------------
// 03. SOMATIC DECOMPRESSION UNCLENCH
// -------------------------------------------------------------
function setupSomaticUnclench() {
  const banner = document.getElementById('somatic-active-box');
  const bannerTitle = document.getElementById('somatic-active-title');
  const bannerDesc = document.getElementById('somatic-active-desc');
  const btnCancel = document.getElementById('btn-cancel-somatic');

  const protocols = {
    jaw: {
      title: 'RELEASE: JAW & TONGUE DROP',
      desc: 'Drop the jaw slack, part lips, let tongue float loosely. Inhale nose, exhale mouth.'
    },
    shoulders: {
      title: 'RELEASE: SCAPULAR RETRACTION',
      desc: 'Gently glide shoulder blades down into back pockets. Breathe deeply.'
    },
    palming: {
      title: 'RELEASE: OPTIC PALMING DARKNESS',
      desc: 'Cup warm palms over closed eyes. Enjoy pure pitch darkness.'
    },
    median: {
      title: 'RELEASE: MEDIAN NERVE TENSION',
      desc: 'Keep arm relaxed, flex fingers back gently, breathe out wrist strain.'
    }
  };

  document.querySelectorAll('.somatic-tile').forEach(tile => {
    const btn = tile.querySelector('.tile-btn');
    const type = tile.dataset.somatic;

    btn.addEventListener('click', () => {
      state.synth.playClick();
      startSomaticRelease(protocols[type]);
    });
  });

  btnCancel.addEventListener('click', () => {
    state.synth.playClick();
    clearInterval(state.somaticInterval);
    banner.classList.add('hidden');
    document.getElementById('session-status').textContent = 'STANDBY';
  });
}

function startSomaticRelease(protocol) {
  const banner = document.getElementById('somatic-active-box');
  const title = document.getElementById('somatic-active-title');
  const desc = document.getElementById('somatic-active-desc');
  const timer = document.getElementById('somatic-countdown');

  clearInterval(state.somaticInterval);
  title.textContent = protocol.title;
  desc.textContent = protocol.desc;
  banner.classList.remove('hidden');

  state.somaticSecondsLeft = 20;
  timer.textContent = '20';
  document.getElementById('session-status').textContent = 'SOMATIC_RELEASE';
  state.synth.playBreathCue('hold');

  state.somaticInterval = setInterval(() => {
    state.somaticSecondsLeft--;
    timer.textContent = state.somaticSecondsLeft;

    if (state.somaticSecondsLeft <= 0) {
      clearInterval(state.somaticInterval);
      state.synth.playBell();
      banner.classList.add('hidden');
      document.getElementById('session-status').textContent = 'STANDBY';
    }
  }, 1000);
}

// -------------------------------------------------------------
// 04. BINAURAL BEAT ENGINE & AUDIO SHIELDING
// -------------------------------------------------------------
function setupBinauralAndNoise() {
  const statusBox = document.getElementById('audio-live-indicator');

  // Binaural buttons
  document.querySelectorAll('.b-wave-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.synth.playClick();
      const wave = btn.dataset.wave;

      if (state.synth.activeBinauralType === wave) {
        state.synth.stopBinaural();
        btn.classList.remove('active');
        btn.textContent = `ACTIVATE ${wave.toUpperCase()}`;
        updateAudioStatus();
      } else {
        document.querySelectorAll('.b-wave-btn').forEach(b => {
          b.classList.remove('active');
          b.textContent = `ACTIVATE ${b.dataset.wave.toUpperCase()}`;
        });
        state.synth.startBinaural(wave);
        btn.classList.add('active');
        btn.textContent = `STOP ${wave.toUpperCase()}`;
        updateAudioStatus();
      }
    });
  });

  // Noise buttons
  document.querySelectorAll('.b-noise-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.synth.playClick();
      const noise = btn.dataset.noise;

      if (state.synth.activeNoiseType === noise) {
        state.synth.stopNoise();
        btn.classList.remove('active');
        btn.textContent = noise === 'brown' ? 'ENGAGE NOISE' : 'ENGAGE RAIN';
        updateAudioStatus();
      } else {
        document.querySelectorAll('.b-noise-btn').forEach(b => {
          b.classList.remove('active');
          b.textContent = b.dataset.noise === 'brown' ? 'ENGAGE NOISE' : 'ENGAGE RAIN';
        });
        state.synth.startNoise(noise);
        btn.classList.add('active');
        btn.textContent = `STOP ${noise.toUpperCase()}`;
        updateAudioStatus();
      }
    });
  });

  function updateAudioStatus() {
    const b = state.synth.activeBinauralType;
    const n = state.synth.activeNoiseType;
    if (b || n) {
      statusBox.textContent = `AUDIO ENGINE ACTIVE: [${(b ? b.toUpperCase() + ' BEAT' : '')} ${(n ? n.toUpperCase() + ' NOISE' : '')}]`;
      statusBox.style.background = 'var(--yellow)';
      statusBox.style.color = '#000000';
    } else {
      statusBox.textContent = 'AUDIO ENGINE: OFF';
      statusBox.style.background = 'var(--bg)';
      statusBox.style.color = 'var(--ink)';
    }
  }
}

// -------------------------------------------------------------
// 05. WORK // REST CLOCK & TACTILE HYDRATION
// -------------------------------------------------------------
function setupPomodoro() {
  const btnToggle = document.getElementById('btn-pomo-toggle');
  const btnReset = document.getElementById('btn-pomo-reset');

  btnToggle.addEventListener('click', togglePomo);
  btnReset.addEventListener('click', resetPomo);

  document.querySelectorAll('.mode-chips .b-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      state.synth.playClick();
      document.querySelectorAll('.mode-chips .b-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.pomoMode = chip.dataset.pomo;

      const labels = {
        work: '[STATUS: FOCUS WORK BLOCK]',
        short: '[STATUS: SHORT RECUPERATION]',
        long: '[STATUS: EXTENDED DECOMPRESSION]'
      };
      document.getElementById('pomo-clock-label').textContent = labels[state.pomoMode];
      resetPomo();
    });
  });
}

function togglePomo() {
  state.synth.playClick();
  const btn = document.getElementById('btn-pomo-toggle');

  if (state.isPomoRunning) {
    clearInterval(state.pomoInterval);
    state.isPomoRunning = false;
    btn.textContent = 'RESUME WORK BLOCK';
  } else {
    state.isPomoRunning = true;
    btn.textContent = 'PAUSE WORK BLOCK';

    state.pomoInterval = setInterval(() => {
      if (state.pomoTimeLeft > 0) {
        state.pomoTimeLeft--;
        updatePomoDisplay();
      } else {
        clearInterval(state.pomoInterval);
        state.isPomoRunning = false;
        state.synth.playBell();
        alert('Work block concluded! Take a decompression break.');
        resetPomo();
      }
    }, 1000);
  }
}

function resetPomo() {
  clearInterval(state.pomoInterval);
  state.isPomoRunning = false;
  state.pomoTimeLeft = state.pomoDurations[state.pomoMode];
  updatePomoDisplay();
  document.getElementById('btn-pomo-toggle').textContent = 'START WORK BLOCK';
}

function updatePomoDisplay() {
  const mins = Math.floor(state.pomoTimeLeft / 60);
  const secs = state.pomoTimeLeft % 60;
  document.getElementById('pomo-clock-text').textContent = 
    `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// HYDRATION TACTILE BLOCKS
function setupHydrationBlocks() {
  renderHydration();

  document.getElementById('btn-stamp-water').addEventListener('click', () => {
    state.synth.playWaterChime();
    state.waterTotal = Math.min(2000, state.waterTotal + 250);
    localStorage.setItem('deskflow_water_total', state.waterTotal);
    renderHydration();
  });

  document.getElementById('btn-reset-water').addEventListener('click', () => {
    state.synth.playClick();
    state.waterTotal = 0;
    localStorage.setItem('deskflow_water_total', 0);
    renderHydration();
  });
}

function renderHydration() {
  document.getElementById('water-current-num').textContent = state.waterTotal.toLocaleString();
  const pct = Math.round((state.waterTotal / 2000) * 100);
  document.getElementById('hydration-pct').textContent = `${pct}% LOGGED`;

  const stampedBlocksCount = Math.floor(state.waterTotal / 250);
  document.querySelectorAll('.h-block').forEach((block, idx) => {
    if (idx < stampedBlocksCount) {
      block.classList.add('stamped');
    } else {
      block.classList.remove('stamped');
    }
  });
}

// -------------------------------------------------------------
// 06. BRAIN DUMP & TEXT SCRATCHPAD
// -------------------------------------------------------------
function setupBrainDump() {
  const textarea = document.getElementById('raw-scratchpad');
  textarea.value = localStorage.getItem('deskflow_braindump') || '';
  updateDumpStats();

  textarea.addEventListener('input', () => {
    localStorage.setItem('deskflow_braindump', textarea.value);
    updateDumpStats();
  });

  document.getElementById('btn-copy-dump').addEventListener('click', () => {
    state.synth.playClick();
    navigator.clipboard.writeText(textarea.value);
    alert('Buffer copied to clipboard.');
  });

  document.getElementById('btn-clean-dump').addEventListener('click', () => {
    state.synth.playClick();
    textarea.value = textarea.value.replace(/\s+/g, ' ').trim();
    localStorage.setItem('deskflow_braindump', textarea.value);
    updateDumpStats();
  });

  document.getElementById('btn-upper-dump').addEventListener('click', () => {
    state.synth.playClick();
    textarea.value = textarea.value.toUpperCase();
    localStorage.setItem('deskflow_braindump', textarea.value);
  });

  document.getElementById('btn-lower-dump').addEventListener('click', () => {
    state.synth.playClick();
    textarea.value = textarea.value.toLowerCase();
    localStorage.setItem('deskflow_braindump', textarea.value);
  });

  document.getElementById('btn-clear-dump').addEventListener('click', () => {
    state.synth.playClick();
    if (confirm('Purge raw buffer contents?')) {
      textarea.value = '';
      localStorage.setItem('deskflow_braindump', '');
      updateDumpStats();
    }
  });
}

function updateDumpStats() {
  const val = document.getElementById('raw-scratchpad').value;
  const chars = val.length;
  const words = val.trim() ? val.trim().split(/\s+/).length : 0;
  document.getElementById('scratch-words').textContent = `${words} WORDS`;
  document.getElementById('scratch-chars').textContent = `${chars} CHARS`;
}

// -------------------------------------------------------------
// GLOBAL BLACKOUT ZEN OVERLAY
// -------------------------------------------------------------
function setupBlackoutZen() {
  document.getElementById('btn-zen-panic').addEventListener('click', () => {
    state.synth.playClick();
    triggerBlackout(20);
  });

  document.getElementById('btn-close-blackout').addEventListener('click', () => {
    state.synth.playClick();
    closeBlackout();
  });
}

function triggerBlackout(seconds = 20) {
  const overlay = document.getElementById('blackout-screen');
  const timer = document.getElementById('blackout-countdown');

  clearInterval(state.blackoutInterval);
  overlay.classList.remove('hidden');
  state.blackoutSec = seconds;
  timer.textContent = state.blackoutSec;
  state.synth.playBell();

  state.blackoutInterval = setInterval(() => {
    state.blackoutSec--;
    timer.textContent = state.blackoutSec;

    if (state.blackoutSec <= 0) {
      clearInterval(state.blackoutInterval);
      state.synth.playBell();
      closeBlackout();
    }
  }, 1000);
}

function closeBlackout() {
  clearInterval(state.blackoutInterval);
  document.getElementById('blackout-screen').classList.add('hidden');
}

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  initApp();
});
