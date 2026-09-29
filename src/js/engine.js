/**
 * Core Motion Design Rendering Engine
 * Handles HiDPI canvas, decoupled physics loop, scene compositing,
 * post-processing passes (chromatic aberration, scanlines, vignette),
 * timeline transport, and video recording export.
 */

import { Camera3D } from './camera.js';
import { Geometry4D } from './geometry4d.js';
import { TelemetryHUD } from './hud.js';
import { HarmonicRibbons } from './ribbons.js';
import { ParticleSystem } from './particles.js';
import { KineticTypography } from './typography.js';
import { THEMES } from './themes.js';

export class MotionEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });

    // HiDPI
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Sub-systems
    this.camera = new Camera3D(canvas);
    this.geom4d = new Geometry4D();
    this.hud = new TelemetryHUD();
    this.ribbons = new HarmonicRibbons();
    this.particles = new ParticleSystem(14000);
    this.typography = new KineticTypography();

    // Active Theme
    this.theme = THEMES.cyber_core;

    // Scenes: 1: 'tesseract', 2: 'gimbal', 3: 'ribbons', 4: 'particles', 5: 'symphony'
    this.activeScene = 'symphony';

    // Timeline & Transport
    this.currentTime = 0;
    this.duration = 12.0; // 12-second master choreographed cycle
    this.isPlaying = true;
    this.playbackSpeed = 1.0;
    this.bezierEasing = null;

    // Post-processing toggles
    this.effects = {
      chromaticAberration: true,
      scanlines: true,
      vignette: true,
      bloom: true
    };

    // Telemetry & FPS metrics
    this.lastTime = performance.now();
    this.fps = 60;
    this.frameTime = 16.6;
    this.frameCount = 0;
    this.fpsHistory = new Array(60).fill(60);

    // MediaRecorder
    this.recorder = null;
    this.recordedChunks = [];
    this.isRecording = false;

    this.initCanvasSize();
    this.initEvents();
  }

  initCanvasSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.width = w;
    this.height = h;

    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  initEvents() {
    window.addEventListener('resize', () => this.initCanvasSize());

    // Mouse tracking for HUD & particles
    window.addEventListener('mousemove', (e) => {
      const cx = this.width * 0.5;
      const cy = this.height * 0.5;
      this.hud.setCursor(e.clientX, e.clientY, cx, cy);
    });

    // Click triggers shockwave burst
    this.canvas.addEventListener('click', (e) => {
      const cx = this.width * 0.5;
      const cy = this.height * 0.5;
      // Convert screen click into 3D shockwave point
      const p3X = (e.clientX - cx) * 0.8;
      const p3Y = (cy - e.clientY) * 0.8;
      this.particles.triggerShockwave(p3X, p3Y, 0);
    });
  }

  setTheme(themeId) {
    if (THEMES[themeId]) {
      this.theme = THEMES[themeId];
      // Update CSS variables on document
      const root = document.documentElement;
      root.style.setProperty('--theme-accent', this.theme.accent);
      root.style.setProperty('--theme-border', this.theme.border);
      root.style.setProperty('--theme-bg', this.theme.bg);
    }
  }

  setScene(sceneId) {
    this.activeScene = sceneId;
    this.typography.triggerGlitch(0.35);

    // Camera viewpoints tailored to each scene
    if (sceneId === 'tesseract') {
      this.camera.setViewPreset('iso');
    } else if (sceneId === 'gimbal') {
      this.camera.setViewPreset('front');
    } else if (sceneId === 'ribbons') {
      this.camera.setViewPreset('dramatic');
    } else if (sceneId === 'particles') {
      this.camera.setViewPreset('iso');
    } else if (sceneId === 'symphony') {
      this.camera.setViewPreset('iso');
    }
  }

  setPlaybackSpeed(speed) {
    this.playbackSpeed = speed;
  }

  seek(timeInSec) {
    this.currentTime = Math.max(0, Math.min(this.duration, timeInSec));
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  startRecording() {
    try {
      const stream = this.canvas.captureStream(60);
      this.recordedChunks = [];
      const options = { mimeType: 'video/webm; codecs=vp9' };
      this.recorder = new MediaRecorder(stream, options);

      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };

      this.recorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aetheris-motion-capture-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      this.recorder.start();
      this.isRecording = true;
      return true;
    } catch (e) {
      console.warn('Recording failed or not supported:', e);
      return false;
    }
  }

  stopRecording() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop();
      this.isRecording = false;
    }
  }

  takeSnapshot() {
    const dataUrl = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `aetheris-snapshot-${Date.now()}.png`;
    a.click();
  }

  update(now, audioTelemetry = null) {
    const rawDt = (now - this.lastTime) * 0.001;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.1); // Clamp delta time

    // Calculate rolling FPS
    this.frameCount++;
    this.frameTime = rawDt * 1000;
    this.fps = 1.0 / Math.max(0.001, rawDt);
    this.fpsHistory.shift();
    this.fpsHistory.push(this.fps);

    if (!this.isPlaying) return;

    // Timeline progress
    const speed = this.playbackSpeed;
    this.currentTime = (this.currentTime + dt * speed) % this.duration;

    // Update Sub-systems
    this.camera.update(dt);
    this.geom4d.update(dt, speed);
    this.hud.update(dt, speed, audioTelemetry);
    this.ribbons.update(dt, speed);
    this.particles.update(dt, speed);
    this.typography.update(dt, speed, this.bezierEasing);
  }

  render(audioTelemetry = null) {
    const { ctx, width, height, theme } = this;
    const cx = width * 0.5;
    const cy = height * 0.5;

    // 1. Clear background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Render Scene Layers based on active scene
    const isSymphony = this.activeScene === 'symphony';

    // Particle flow field (deep layer)
    if (isSymphony || this.activeScene === 'particles') {
      this.particles.render(ctx, this.camera, cx, cy, theme);
    }

    // Lissajous ribbons
    if (isSymphony || this.activeScene === 'ribbons') {
      this.ribbons.render(ctx, this.camera, cx, cy, theme);
    }

    // 4D Geometry
    if (isSymphony || this.activeScene === 'tesseract') {
      this.geom4d.render(ctx, this.camera, cx, cy, theme);
    }

    // Precision Gyro HUD
    if (isSymphony || this.activeScene === 'gimbal') {
      const hudRadius = Math.min(width, height) * 0.38;
      this.hud.render(ctx, cx, cy, hudRadius, theme, audioTelemetry);
    }

    // Kinetic Typography overlay
    const typoY = height > 700 ? height * 0.82 : height * 0.88;
    this.typography.render(ctx, cx, typoY, theme);

    // 3. Post-Processing Passes
    if (this.effects.scanlines) {
      this.renderScanlines(ctx, width, height);
    }
    if (this.effects.vignette) {
      this.renderVignette(ctx, width, height);
    }
  }

  renderScanlines(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();
  }

  renderVignette(ctx, w, h) {
    ctx.save();
    const radius = Math.hypot(w, h) * 0.55;
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, radius * 0.4, w * 0.5, h * 0.5, radius);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  getTelemetry() {
    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    return {
      fps: Math.round(avgFps),
      frameTime: this.frameTime.toFixed(1),
      particles: this.particles.count,
      rotXW: (this.geom4d.rot.xw % (Math.PI * 2)).toFixed(2),
      rotZW: (this.geom4d.rot.zw % (Math.PI * 2)).toFixed(2),
      currentTime: this.currentTime,
      duration: this.duration,
      isPlaying: this.isPlaying,
      cameraDist: Math.round(this.camera.radius)
    };
  }
}
