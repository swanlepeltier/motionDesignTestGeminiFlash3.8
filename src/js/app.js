/**
 * Application Orchestrator & UI Controller
 */

import { MotionEngine } from './engine.js';
import { AudioEngine } from './audio.js';
import { BezierEditor } from './bezier.js';

class App {
  constructor() {
    this.canvas = document.getElementById('motion-canvas');
    this.bezierCanvas = document.getElementById('bezier-canvas');

    this.audio = new AudioEngine();
    this.engine = new MotionEngine(this.canvas);

    // Setup Bezier Editor
    this.bezierEditor = new BezierEditor(this.bezierCanvas, (solver) => {
      this.engine.bezierEasing = solver;
      const cssDisplay = document.getElementById('bezier-css');
      if (cssDisplay) cssDisplay.textContent = solver.getCSS();
    });
    this.engine.bezierEasing = this.bezierEditor.solver;

    this.toastTimer = null;
    this.initUI();
    this.startLoop();
  }

  showToast(text, duration = 2200) {
    const toast = document.getElementById('toast-msg');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = text;
    toast.classList.add('show');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  initUI() {
    // 1. Scene Navigation Buttons
    const sceneButtons = document.querySelectorAll('[data-scene]');
    sceneButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        sceneButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const scene = btn.getAttribute('data-scene');
        this.engine.setScene(scene);
        this.audio.playWhoosh(0.5);
        this.showToast(`SCENE ACTIVATED: ${scene.toUpperCase()}`);
      });
    });

    // 2. Theme Selector
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.engine.setTheme(e.target.value);
        this.audio.playTick(1200);
        this.showToast(`THEME APPLIED: ${e.target.selectedOptions[0].text.toUpperCase()}`);
      });
    }

    // 3. Audio Toggle Button
    const audioBtn = document.getElementById('btn-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isSoundOn = this.audio.toggleMute();
        audioBtn.classList.toggle('active', isSoundOn);
        audioBtn.title = isSoundOn ? 'Mute Procedural Audio (M)' : 'Enable Procedural Audio (M)';
        this.showToast(isSoundOn ? 'PROCEDURAL SYNTHESIZER: ACTIVE' : 'AUDIO MUTED');
      });
    }

    // 4. Playback Transport
    const playBtn = document.getElementById('btn-play');
    const playIcon = document.getElementById('play-icon');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const playing = this.engine.togglePlay();
        playIcon.innerHTML = playing
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        this.audio.playTick(playing ? 1600 : 800);
      });
    }

    // 5. Scrubber Track
    const scrubberTrack = document.getElementById('scrubber-track');
    const scrubberProgress = document.getElementById('scrubber-progress');
    const scrubberThumb = document.getElementById('scrubber-thumb');
    let isScrubbing = false;

    const handleScrub = (e) => {
      const rect = scrubberTrack.getBoundingClientRect();
      const norm = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.engine.seek(norm * this.engine.duration);
    };

    if (scrubberTrack) {
      scrubberTrack.addEventListener('mousedown', (e) => {
        isScrubbing = true;
        handleScrub(e);
      });
      window.addEventListener('mousemove', (e) => {
        if (isScrubbing) handleScrub(e);
      });
      window.addEventListener('mouseup', () => {
        isScrubbing = false;
      });
    }

    // 6. Playback Speed Buttons
    const speedPills = document.querySelectorAll('[data-speed]');
    speedPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        speedPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const speed = parseFloat(pill.getAttribute('data-speed'));
        this.engine.setPlaybackSpeed(speed);
        this.audio.playTick(1400);
      });
    });

    // 7. Preset Bezier buttons
    const presetSelect = document.getElementById('bezier-preset-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        this.bezierEditor.setPreset(e.target.value);
        this.audio.playTick(1800);
      });
    }

    // Copy Bezier CSS
    const copyBtn = document.getElementById('btn-copy-css');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const css = this.bezierEditor.solver.getCSS();
        navigator.clipboard.writeText(css).then(() => {
          this.showToast('CSS COPIED TO CLIPBOARD!');
          this.audio.playChime(880, 0.4);
        });
      });
    }

    // 8. Custom Typography Input
    const typoInput = document.getElementById('typo-input');
    if (typoInput) {
      typoInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toUpperCase() || 'ANTIGRAVITY // MOTION';
        this.engine.typography.setText(val);
      });
    }

    // 9. Camera View Preset Selector
    const camSelect = document.getElementById('cam-preset-select');
    if (camSelect) {
      camSelect.addEventListener('change', (e) => {
        this.engine.camera.setViewPreset(e.target.value);
        this.audio.playServo(0.2);
      });
    }

    // Auto-Rotate Camera Toggle
    const autoRotateToggle = document.getElementById('cam-autorotate');
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener('change', (e) => {
        this.engine.camera.autoRotate = e.target.checked;
      });
    }

    // 10. Snapshot PNG
    const snapBtn = document.getElementById('btn-snapshot');
    if (snapBtn) {
      snapBtn.addEventListener('click', () => {
        this.engine.takeSnapshot();
        this.audio.playChime(1046, 0.5);
        this.showToast('4K ULTRA-HD SNAPSHOT SAVED');
      });
    }

    // 11. Video Record Button
    const recordBtn = document.getElementById('btn-record');
    if (recordBtn) {
      recordBtn.addEventListener('click', () => {
        if (!this.engine.isRecording) {
          const started = this.engine.startRecording();
          if (started) {
            recordBtn.classList.add('active');
            recordBtn.title = 'Stop Recording (R)';
            this.showToast('RECORDING MOTION SEQUENCE (WEBM)...');
            this.audio.playSubBass(70, 0.4);
          } else {
            this.showToast('MediaRecorder not available in this browser');
          }
        } else {
          this.engine.stopRecording();
          recordBtn.classList.remove('active');
          recordBtn.title = 'Record Motion Reel (R)';
          this.showToast('RECORDING FINALIZED & EXPORTED');
          this.audio.playChime(660, 0.6);
        }
      });
    }

    // 12. Fullscreen Toggle
    const fsBtn = document.getElementById('btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // 13. Toggle HUD Panels (H key or button)
    const toggleHudBtn = document.getElementById('btn-toggle-hud');
    const leftDock = document.getElementById('dock-left');
    const rightDock = document.getElementById('dock-right');
    const toggleHUD = () => {
      leftDock.classList.toggle('collapsed');
      rightDock.classList.toggle('collapsed');
      this.audio.playTick(1000);
    };

    if (toggleHudBtn) {
      toggleHudBtn.addEventListener('click', toggleHUD);
    }

    // 14. Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't intercept when user is typing in text inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (playBtn) playBtn.click();
      } else if (e.code === 'KeyM') {
        if (audioBtn) audioBtn.click();
      } else if (e.code === 'KeyS') {
        if (snapBtn) snapBtn.click();
      } else if (e.code === 'KeyR') {
        if (recordBtn) recordBtn.click();
      } else if (e.code === 'KeyH') {
        toggleHUD();
      } else if (e.code === 'Digit1') {
        this.activateSceneByIndex(0);
      } else if (e.code === 'Digit2') {
        this.activateSceneByIndex(1);
      } else if (e.code === 'Digit3') {
        this.activateSceneByIndex(2);
      } else if (e.code === 'Digit4') {
        this.activateSceneByIndex(3);
      } else if (e.code === 'Digit5') {
        this.activateSceneByIndex(4);
      }
    });
  }

  activateSceneByIndex(idx) {
    const sceneButtons = document.querySelectorAll('[data-scene]');
    if (sceneButtons[idx]) {
      sceneButtons[idx].click();
    }
  }

  startLoop() {
    const loop = (now) => {
      // Audio Telemetry
      const audioTelemetry = this.audio.getTelemetry();

      // Update Engine
      this.engine.update(now, audioTelemetry);

      // Render Frame
      this.engine.render(audioTelemetry);

      // Update Bezier Runner Bead Preview
      const normProgress = (this.engine.currentTime / this.engine.duration) % 1.0;
      this.bezierEditor.setPreviewProgress(normProgress);

      // Update Telemetry UI
      this.updateTelemetryUI();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  updateTelemetryUI() {
    const telemetry = this.engine.getTelemetry();

    // FPS & Frame time
    const fpsEl = document.getElementById('metric-fps');
    if (fpsEl) fpsEl.textContent = `${telemetry.fps} FPS`;

    const ftEl = document.getElementById('metric-ft');
    if (ftEl) ftEl.textContent = `${telemetry.frameTime} ms`;

    // 4D Rotation Coordinates
    const rotEl = document.getElementById('metric-rot');
    if (rotEl) rotEl.textContent = `XW:${telemetry.rotXW} ZW:${telemetry.rotZW}`;

    // Timeline Bar progress
    const norm = telemetry.currentTime / telemetry.duration;
    const scrubberProgress = document.getElementById('scrubber-progress');
    const scrubberThumb = document.getElementById('scrubber-thumb');
    if (scrubberProgress) scrubberProgress.style.width = `${(norm * 100).toFixed(1)}%`;
    if (scrubberThumb) scrubberThumb.style.left = `${(norm * 100).toFixed(1)}%`;

    // Time readout
    const curTimeEl = document.getElementById('time-current');
    if (curTimeEl) {
      const curSec = Math.floor(telemetry.currentTime);
      const curMs = Math.floor((telemetry.currentTime % 1) * 100);
      curTimeEl.textContent = `00:${curSec < 10 ? '0' + curSec : curSec}:${curMs < 10 ? '0' + curMs : curMs}`;
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.__aetherisApp = new App();
});
