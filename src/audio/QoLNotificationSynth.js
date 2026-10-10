// Web Audio API Sound Engine: Binaural Beats, Breathing Audio Guides, & Tactile Mechanical Feedback
export class QoLNotificationSynth {
  constructor() {
    this.ctx = null;
    this.noiseNode = null;
    this.noiseGain = null;
    this.binauralLeft = null;
    this.binauralRight = null;
    this.binauralGain = null;
    this.activeNoiseType = null;
    this.activeBinauralType = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Mechanical tactile click for brutalist UI interactions
  playClick() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.03);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  // Pure 528Hz Solfeggio / Tibetan bell chime
  playBell() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, t);
    osc.frequency.exponentialRampToValueAtTime(264, t + 2.8);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 2.8);
  }

  // Water drop audio cue
  playWaterChime() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Breathing pacer audio cues
  playBreathCue(phase) {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';

    if (phase === 'inhale1') {
      // First deep inhale: gentle rising tone (220Hz -> 330Hz over 2s)
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.linearRampToValueAtTime(330, t + 1.8);
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 1.5);
      gain.gain.linearRampToValueAtTime(0.01, t + 2.0);
      osc.start(t);
      osc.stop(t + 2.0);
    } else if (phase === 'inhale2') {
      // Secondary top-off inhale (350Hz -> 440Hz short burst)
      osc.frequency.setValueAtTime(350, t);
      osc.frequency.linearRampToValueAtTime(440, t + 0.8);
      gain.gain.setValueAtTime(0.02, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.5);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.9);
      osc.start(t);
      osc.stop(t + 0.9);
    } else if (phase === 'exhale') {
      // Long soothing exhale: low pitch descending (300Hz -> 130Hz over 5s)
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(130, t + 5.0);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 5.0);
      osc.start(t);
      osc.stop(t + 5.0);
    } else if (phase === 'hold') {
      // Steady gentle low hum (164Hz)
      osc.frequency.setValueAtTime(164.8, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3.8);
      osc.start(t);
      osc.stop(t + 4.0);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
  }

  // True Stereo Binaural Beat Generator
  startBinaural(type = 'alpha') {
    this.init();
    this.stopBinaural();

    // Base carrier: 200 Hz
    const carrier = 200;
    let diff = 10; // Alpha (10 Hz)
    if (type === 'theta') diff = 6;  // Theta (6 Hz)
    if (type === 'delta') diff = 2.5; // Delta (2.5 Hz)

    const t = this.ctx.currentTime;
    this.binauralLeft = this.ctx.createOscillator();
    this.binauralRight = this.ctx.createOscillator();
    this.binauralGain = this.ctx.createGain();

    this.binauralLeft.type = 'sine';
    this.binauralRight.type = 'sine';
    this.binauralLeft.frequency.setValueAtTime(carrier, t);
    this.binauralRight.frequency.setValueAtTime(carrier + diff, t);

    // Channel merger for true stereo separation (left ear / right ear)
    const merger = this.ctx.createChannelMerger(2);
    this.binauralLeft.connect(merger, 0, 0);
    this.binauralRight.connect(merger, 0, 1);

    this.binauralGain.gain.setValueAtTime(0.001, t);
    this.binauralGain.gain.linearRampToValueAtTime(0.12, t + 1.5);

    merger.connect(this.binauralGain);
    this.binauralGain.connect(this.ctx.destination);

    this.binauralLeft.start(t);
    this.binauralRight.start(t);
    this.activeBinauralType = type;
  }

  stopBinaural() {
    if (this.binauralLeft && this.binauralRight) {
      try {
        const t = this.ctx.currentTime;
        this.binauralGain.gain.linearRampToValueAtTime(0.001, t + 0.3);
        setTimeout(() => {
          if (this.binauralLeft) {
            this.binauralLeft.stop();
            this.binauralLeft.disconnect();
            this.binauralLeft = null;
          }
          if (this.binauralRight) {
            this.binauralRight.stop();
            this.binauralRight.disconnect();
            this.binauralRight = null;
          }
        }, 350);
      } catch (e) {}
    }
    this.activeBinauralType = null;
  }

  // Procedural Noise Generator (Brown noise / Rain / Pink noise)
  startNoise(type = 'brown') {
    this.init();
    this.stopNoise();

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      } else {
        output[i] = white;
      }
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, this.ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    }

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.noiseGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.0);

    whiteNoise.connect(filter);
    filter.connect(this.noiseGain);
    this.noiseGain.connect(this.ctx.destination);

    whiteNoise.start();
    this.noiseNode = whiteNoise;
    this.activeNoiseType = type;
  }

  stopNoise() {
    if (this.noiseNode) {
      try {
        const t = this.ctx.currentTime;
        this.noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.3);
        setTimeout(() => {
          if (this.noiseNode) {
            this.noiseNode.stop();
            this.noiseNode.disconnect();
            this.noiseNode = null;
          }
        }, 350);
      } catch (e) {}
    }
    this.activeNoiseType = null;
  }
}
