/**
 * Procedural Web Audio Engine
 * Zero external audio files — 100% synthesized in real time via Web Audio API.
 * Provides interactive SFX, ambient drone, and real-time FFT spectrum analysis.
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.droneGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;
    this.isEnabled = false;
    this.isMuted = true;
    this.fftData = new Uint8Array(64);
    this.waveData = new Uint8Array(64);
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.4,
        this.ctx.currentTime,
      );

      // Spectrum Analyser
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.82;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.initAmbientDrone();
      this.isEnabled = true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked:", e);
    }
  }

  toggleMute() {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const targetVol = this.isMuted ? 0 : 0.35;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);

    if (!this.isMuted) {
      this.playChime(660);
    }
    return !this.isMuted;
  }

  initAmbientDrone() {
    if (!this.ctx) return;

    // Sub-bass stereo generative drone
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = "lowpass";
    this.droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // Fundamental oscillator (55Hz / A1)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = "sine";
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    // Harmonic detuned 5th (82.4Hz / E2)
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = "triangle";
    this.droneOsc2.frequency.setValueAtTime(82.4, this.ctx.currentTime);

    // LFO for breathing filter sweep
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(45, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(this.droneFilter.frequency);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
    lfo.start();
  }

  updateDroneModulation(intensity = 1.0) {
    if (!this.droneFilter || !this.ctx || this.isMuted) return;
    const baseFreq = 120 + Math.min(intensity, 3.0) * 160;
    this.droneFilter.frequency.setTargetAtTime(
      baseFreq,
      this.ctx.currentTime,
      0.2,
    );
  }

  /**
   * Crisp mechanical relay / Vernier tick
   */
  playTick(pitch = 1800, volume = 0.15) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, t + 0.025);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(pitch, t);
    filter.Q.setValueAtTime(4, t);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  /**
   * Robotic micro-servo hum
   */
  playServo(duration = 0.15, pitch = 440) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.linearRampToValueAtTime(pitch * 1.3, t + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(pitch * 0.9, t + duration);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.linearRampToValueAtTime(0.08, t + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  /**
   * Harmonic crystal chime
   */
  playChime(freq = 523.25, duration = 0.8) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Carrier
    const carrier = this.ctx.createOscillator();
    const carrierGain = this.ctx.createGain();

    // Modulator for FM chime sheen
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();

    carrier.type = "sine";
    carrier.frequency.setValueAtTime(freq, t);

    mod.type = "sine";
    mod.frequency.setValueAtTime(freq * 2.5, t);
    modGain.gain.setValueAtTime(freq * 0.8, t);
    modGain.gain.exponentialRampToValueAtTime(1, t + duration * 0.5);

    mod.connect(carrier.frequency);

    carrierGain.gain.setValueAtTime(0.18, t);
    carrierGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    carrier.connect(carrierGain);
    carrierGain.connect(this.masterGain);

    mod.start(t);
    carrier.start(t);
    mod.stop(t + duration);
    carrier.stop(t + duration);
  }

  /**
   * Warp whoosh for scene transitions
   */
  playWhoosh(duration = 0.7) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + duration * 0.4);
    osc.frequency.exponentialRampToValueAtTime(140, t + duration);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(250, t + duration);
    filter.Q.setValueAtTime(6.0, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  /**
   * Punchy cinematic sub-bass impact
   */
  playSubBass(freq = 60, duration = 0.6) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 2.2, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + duration);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  /**
   * Retrieves real-time FFT frequency spectrum and waveform
   */
  getTelemetry() {
    if (!this.analyser || this.isMuted) {
      return {
        frequency: this.fftData.fill(0),
        waveform: this.waveData.fill(128),
        energy: 0,
      };
    }
    this.analyser.getByteFrequencyData(this.fftData);
    this.analyser.getByteTimeDomainData(this.waveData);

    let sum = 0;
    for (let i = 0; i < 16; i++) {
      sum += this.fftData[i];
    }
    const energy = sum / (16 * 255);

    return {
      frequency: this.fftData,
      waveform: this.waveData,
      energy,
    };
  }
}
