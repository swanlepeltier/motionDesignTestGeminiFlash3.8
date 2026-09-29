/**
 * Precision Aerospace Gyroscopic Gimbal & Mechanical Iris HUD
 * High-precision vector dials, Vernier scales, aperture blades, and telemetry.
 */

export class TelemetryHUD {
  constructor() {
    this.rotationOuter = 0;
    this.rotationMiddle = 0;
    this.rotationInner = 0;
    this.radarAngle = 0;
    this.apertureOpen = 0.55;
    this.targetAperture = 0.55;

    // Crosshair spring tracker
    this.crosshair = { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.radarBlips = [
      { r: 0.35, angle: 1.2, alpha: 0.8 },
      { r: 0.62, angle: 2.8, alpha: 0.6 },
      { r: 0.85, angle: 4.5, alpha: 0.9 }
    ];
  }

  setCursor(x, y, cx, cy) {
    this.crosshair.targetX = x - cx;
    this.crosshair.targetY = y - cy;
  }

  update(dt = 0.016, speedMultiplier = 1.0, audioTelemetry = null) {
    this.rotationOuter += 0.003 * speedMultiplier;
    this.rotationMiddle -= 0.005 * speedMultiplier;
    this.rotationInner += 0.008 * speedMultiplier;
    this.radarAngle += 0.035 * speedMultiplier;

    // Aperture dilation breathing
    const audioBoost = audioTelemetry ? audioTelemetry.energy * 0.4 : 0;
    this.apertureOpen += (this.targetAperture + audioBoost - this.apertureOpen) * 0.1;

    // Spring damping crosshair
    this.crosshair.x += (this.crosshair.targetX - this.crosshair.x) * 0.15;
    this.crosshair.y += (this.crosshair.targetY - this.crosshair.y) * 0.15;
  }

  render(ctx, cx, cy, radius, theme, audioTelemetry) {
    ctx.save();
    ctx.translate(cx, cy);

    const accent = theme.accent;
    const secondary = theme.secondary;

    // 1. Outer Gimbal Ring (Radius ~ 340)
    this.renderOuterDial(ctx, radius * 0.95, accent, secondary);

    // 2. Middle Vernier Ring (Radius ~ 270)
    this.renderMiddleRing(ctx, radius * 0.76, secondary, accent);

    // 3. Audio Spectrum Circle
    this.renderAudioSpectrumRing(ctx, radius * 0.62, theme, audioTelemetry);

    // 4. Mechanical Iris Aperture (Radius ~ 180)
    this.renderMechanicalIris(ctx, radius * 0.50, theme);

    // 5. Radar Sweep Line & Blips
    this.renderRadarSweep(ctx, radius * 0.92, accent);

    // 6. Interactive Spring Crosshair Reticle
    this.renderReticle(ctx, this.crosshair.x, this.crosshair.y, accent);

    ctx.restore();
  }

  renderOuterDial(ctx, r, accent, secondary) {
    ctx.save();
    ctx.rotate(this.rotationOuter);

    // Main circle ring
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Secondary concentric border
    ctx.beginPath();
    ctx.arc(0, 0, r + 10, 0, Math.PI * 2);
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 12]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 360 degree tick marks (every 5 degrees, larger at 30)
    for (let deg = 0; deg < 360; deg += 5) {
      const angle = (deg * Math.PI) / 180;
      const isMajor = deg % 30 === 0;
      const isCard = deg % 90 === 0;

      const len = isCard ? 16 : (isMajor ? 10 : 5);
      const innerR = r - len;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cos * r, sin * r);
      ctx.lineTo(cos * innerR, sin * innerR);
      ctx.strokeStyle = isCard ? '#ffffff' : (isMajor ? accent : secondary);
      ctx.lineWidth = isCard ? 2 : (isMajor ? 1.5 : 1);
      ctx.stroke();

      // Degree labels at 30 degree intervals
      if (isMajor) {
        ctx.save();
        ctx.translate(cos * (r - 24), sin * (r - 24));
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = secondary;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}°`, 0, 0);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  renderMiddleRing(ctx, r, accent, secondary) {
    ctx.save();
    ctx.rotate(this.rotationMiddle);

    // Segmented circular arc segments
    const segments = 4;
    for (let i = 0; i < segments; i++) {
      const start = (i * Math.PI * 2) / segments + 0.1;
      const end = ((i + 1) * Math.PI * 2) / segments - 0.1;

      ctx.beginPath();
      ctx.arc(0, 0, r, start, end);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Vernier sub-divisions on each segment
      const subTicks = 10;
      for (let j = 0; j <= subTicks; j++) {
        const subAngle = start + (j / subTicks) * (end - start);
        const cos = Math.cos(subAngle);
        const sin = Math.sin(subAngle);
        ctx.beginPath();
        ctx.moveTo(cos * r, sin * r);
        ctx.lineTo(cos * (r + (j % 5 === 0 ? 8 : 4)), sin * (r + (j % 5 === 0 ? 8 : 4)));
        ctx.strokeStyle = secondary;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Outer gear teeth
    const teeth = 36;
    for (let i = 0; i < teeth; i++) {
      const angle = (i * Math.PI * 2) / teeth;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(cos * (r - 12), sin * (r - 12));
      ctx.lineTo(cos * (r - 4), sin * (r - 4));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  renderAudioSpectrumRing(ctx, r, theme, audio) {
    if (!audio || !audio.frequency) return;
    const freq = audio.frequency;
    const count = Math.min(64, freq.length);

    ctx.save();
    ctx.rotate(this.rotationInner);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const val = freq[i] / 255.0; // 0 to 1
      const barH = 3 + val * 35;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cos * r, sin * r);
      ctx.lineTo(cos * (r + barH), sin * (r + barH));

      ctx.strokeStyle = theme.getSpectrumColor(val);
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  renderMechanicalIris(ctx, outerR, theme) {
    ctx.save();
    const blades = 12;
    const openFactor = Math.max(0.2, Math.min(0.9, this.apertureOpen));
    const innerR = outerR * openFactor;

    ctx.rotate(this.rotationInner * 0.5);

    // Draw the 12 overlapping blades
    for (let i = 0; i < blades; i++) {
      const angle = (i / blades) * Math.PI * 2;
      const nextAngle = ((i + 1) / blades) * Math.PI * 2;

      ctx.save();
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(innerR, 0);
      ctx.quadraticCurveTo(outerR * 0.7, outerR * 0.5, outerR, 0);
      ctx.arc(0, 0, outerR, 0, (Math.PI * 2) / blades);
      ctx.closePath();

      ctx.fillStyle = theme.irisFill;
      ctx.fill();

      ctx.strokeStyle = theme.irisStroke;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Mechanical pivot rivet
      ctx.beginPath();
      ctx.arc(outerR * 0.92, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    }

    // Central circular aperture boundary
    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  renderRadarSweep(ctx, r, accent) {
    ctx.save();
    ctx.rotate(this.radarAngle);

    // Glowing sector gradient
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, r);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.8, 'rgba(0, 240, 255, 0.02)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.15)');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, -0.3, 0);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Leading laser line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r, 0);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();

    // Radar blips
    for (let i = 0; i < this.radarBlips.length; i++) {
      const blip = this.radarBlips[i];
      const blipR = blip.r * r;
      const bx = Math.cos(blip.angle) * blipR;
      const by = Math.sin(blip.angle) * blipR;

      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Echo ring
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${blip.alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  renderReticle(ctx, rx, ry, accent) {
    ctx.save();
    ctx.translate(rx, ry);

    // Precision reticle box & crosshair
    const size = 18;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.2;

    // Corner brackets
    const b = 6;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(-size, -size + b); ctx.lineTo(-size, -size); ctx.lineTo(-size + b, -size);
    // Top-right
    ctx.moveTo(size - b, -size); ctx.lineTo(size, -size); ctx.lineTo(size, -size + b);
    // Bottom-left
    ctx.moveTo(-size, size - b); ctx.lineTo(-size, size); ctx.lineTo(-size + b, size);
    // Bottom-right
    ctx.moveTo(size - b, size); ctx.lineTo(size, size); ctx.lineTo(size, size - b);
    ctx.stroke();

    // Central crosshair dot
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Offset coordinates
    ctx.fillStyle = accent;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText(`ΔX: ${rx.toFixed(0)}  ΔY: ${ry.toFixed(0)}`, size + 4, 3);

    ctx.restore();
  }
}
