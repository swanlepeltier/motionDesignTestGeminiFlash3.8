/**
 * Kinetic Matrix Typography Engine
 * Staggered 3D character transforms, letter-spacing breathing,
 * chromatic aberration glitch slicing, and precision editorial scaffolding.
 */

export class KineticTypography {
  constructor() {
    this.text = "CHRONOS // 4D KINEMATICS";
    this.phrases = [
      "CHRONOS // 4D KINEMATICS",
      "QUANTUM MANIFOLD // ACT-01",
      "SYNTHETIC CHOREOGRAPHY",
      "NEURAL MOTION VECTOR",
      "BEYOND THREE DIMENSIONS",
    ];
    this.phraseIndex = 0;
    this.time = 0;
    this.glitchTimer = 0;
    this.glitchActive = false;
    this.customText = null;

    // Character state array
    this.charStates = [];
    this.rebuildChars();
  }

  setText(newText) {
    this.text = newText;
    this.rebuildChars();
  }

  cyclePhrase() {
    this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
    this.setText(this.phrases[this.phraseIndex]);
  }

  rebuildChars() {
    this.charStates = [];
    for (let i = 0; i < this.text.length; i++) {
      this.charStates.push({
        char: this.text[i],
        offsetY: 0,
        rotateX: 0,
        opacity: 1,
        glitchOffset: 0,
      });
    }
  }

  triggerGlitch(duration = 0.3) {
    this.glitchActive = true;
    this.glitchTimer = duration;
  }

  update(dt = 0.016, speedMultiplier = 1.0, bezierSolver = null) {
    this.time += dt * speedMultiplier;

    if (this.glitchActive) {
      this.glitchTimer -= dt * speedMultiplier;
      if (this.glitchTimer <= 0) {
        this.glitchActive = false;
      }
    }

    const len = this.charStates.length;
    for (let i = 0; i < len; i++) {
      const char = this.charStates[i];

      // Staggered wave motion
      const stagger = (i / len) * Math.PI * 2;
      const wave = Math.sin(this.time * 2.5 + stagger);

      // Staggered drop entry
      const phase = (this.time * 0.4 + (i / len) * 0.3) % 1.0;
      let ease = phase;
      if (bezierSolver) {
        ease = bezierSolver.solve(phase);
      }

      char.offsetY = wave * 6;
      char.rotateX = Math.sin(this.time * 1.8 + stagger) * 0.18;
      char.opacity = 0.75 + wave * 0.25;

      // Glitch displacement
      if (this.glitchActive && Math.random() > 0.4) {
        char.glitchOffset = (Math.random() - 0.5) * 24;
      } else {
        char.glitchOffset = 0;
      }
    }
  }

  render(ctx, cx, cy, theme) {
    ctx.save();
    const len = this.charStates.length;

    // Font styling
    const fontSize = Math.max(16, Math.min(32, window.innerWidth * 0.024));
    ctx.font = `800 ${fontSize}px "Space Grotesk", "Inter", -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Letter spacing expansion with sine breathing
    const spacing = fontSize * 0.72 + Math.sin(this.time * 1.2) * 3.5;
    const totalW = len * spacing;
    const startX = cx - totalW * 0.5 + spacing * 0.5;
    const posY = cy;

    // Editorial Scaffolding Box
    this.renderScaffolding(ctx, cx, posY, totalW + 60, fontSize + 36, theme);

    // Render individual characters
    for (let i = 0; i < len; i++) {
      const state = this.charStates[i];
      const charX = startX + i * spacing + state.glitchOffset;
      const charY = posY + state.offsetY;

      ctx.save();
      ctx.translate(charX, charY);

      // 3D Perspective tilt simulation
      ctx.transform(1, 0, Math.tan(state.rotateX), 1, 0, 0);

      // Chromatic Aberration Split when glitching
      if (this.glitchActive && state.glitchOffset !== 0) {
        // Red channel offset
        ctx.fillStyle = "rgba(255, 0, 80, 0.8)";
        ctx.fillText(state.char, -3, 0);

        // Cyan channel offset
        ctx.fillStyle = "rgba(0, 240, 255, 0.8)";
        ctx.fillText(state.char, 3, 0);
      }

      // Main letter fill
      ctx.fillStyle = theme.textMain;
      ctx.fillText(state.char, 0, 0);

      // Sub-index notation: [01], [02]...
      if (fontSize >= 18 && i % 4 === 0) {
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = theme.accent;
        ctx.fillText(`[${i < 9 ? "0" + (i + 1) : i + 1}]`, 0, -fontSize * 0.75);
        ctx.font = `800 ${fontSize}px "Space Grotesk", sans-serif`;
      }

      ctx.restore();
    }

    ctx.restore();
  }

  renderScaffolding(ctx, cx, cy, w, h, theme) {
    const halfW = w * 0.5;
    const halfH = h * 0.5;

    // Corner brackets
    const b = 10;
    ctx.strokeStyle = theme.secondary;
    ctx.lineWidth = 1;

    ctx.beginPath();
    // Top-Left
    ctx.moveTo(cx - halfW, cy - halfH + b);
    ctx.lineTo(cx - halfW, cy - halfH);
    ctx.lineTo(cx - halfW + b, cy - halfH);

    // Top-Right
    ctx.moveTo(cx + halfW - b, cy - halfH);
    ctx.lineTo(cx + halfW, cy - halfH);
    ctx.lineTo(cx + halfW, cy - halfH + b);

    // Bottom-Left
    ctx.moveTo(cx - halfW, cy + halfH - b);
    ctx.lineTo(cx - halfW, cy + halfH);
    ctx.lineTo(cx - halfW + b, cy + halfH);

    // Bottom-Right
    ctx.moveTo(cx + halfW - b, cy + halfH);
    ctx.lineTo(cx + halfW, cy + halfH);
    ctx.lineTo(cx + halfW, cy + halfH - b);
    ctx.stroke();

    // Top subtle status label
    ctx.fillStyle = theme.accent;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = "left";
    ctx.fillText(
      "SYS.TYPO // KINETIC MATRIX V4.2",
      cx - halfW + 14,
      cy - halfH - 6,
    );

    ctx.textAlign = "right";
    ctx.fillText(
      `FPS SYNC: 120HZ // PHASE: ${(this.time % 10).toFixed(2)}s`,
      cx + halfW - 14,
      cy - halfH - 6,
    );
  }
}
