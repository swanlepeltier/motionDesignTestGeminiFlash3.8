/**
 * 3D Harmonic Lissajous Wave Ribbons & Euler Spirals
 * Mathematical continuous ribbon surface extrusion, surface normal computation,
 * depth-sorted quad rendering, and iridescent dynamic color gradients.
 */

export class HarmonicRibbons {
  constructor() {
    this.numRibbons = 3;
    this.pointsPerRibbon = 140;
    this.ribbonWidth = 14;
    this.time = 0;

    // Harmonic ratios
    this.freqA = 2.0;
    this.freqB = 3.0;
    this.freqC = 5.0;

    this.radiusX = 260;
    this.radiusY = 200;
    this.radiusZ = 220;

    // Sparkle satellites traveling along the ribbons
    this.satellites = [
      { tOffset: 0.1, ribbonIdx: 0, speed: 0.008, color: "#ffffff" },
      { tOffset: 0.55, ribbonIdx: 1, speed: -0.01, color: "#00f0ff" },
      { tOffset: 0.82, ribbonIdx: 2, speed: 0.012, color: "#ff00aa" },
    ];
  }

  setHarmonics(a, b, c) {
    this.freqA = a;
    this.freqB = b;
    this.freqC = c;
  }

  update(dt = 0.016, speedMultiplier = 1.0) {
    this.time += dt * 0.9 * speedMultiplier;

    // Update satellites
    for (let i = 0; i < this.satellites.length; i++) {
      const sat = this.satellites[i];
      sat.tOffset = (sat.tOffset + sat.speed * speedMultiplier + 1.0) % 1.0;
    }
  }

  /**
   * Evaluates 3D position along the harmonic curve
   */
  evaluatePoint(t, phaseOffset = 0) {
    const angle = t * Math.PI * 2;
    const pX = angle * this.freqA + this.time + phaseOffset;
    const pY = angle * this.freqB + this.time * 0.8 + phaseOffset * 1.5;
    const pZ = angle * this.freqC + this.time * 1.2 + phaseOffset * 2.0;

    return {
      x: Math.sin(pX) * this.radiusX,
      y: Math.sin(pY) * this.radiusY,
      z: Math.cos(pZ) * this.radiusZ,
    };
  }

  render(ctx, camera, cx, cy, theme) {
    const segments = [];

    // 1. Generate ribbon quad strips
    for (let r = 0; r < this.numRibbons; r++) {
      const phase = (r * Math.PI * 2) / this.numRibbons;
      const ribbonWidth = this.ribbonWidth * (1.0 - r * 0.15);

      const path3D = [];
      for (let i = 0; i <= this.pointsPerRibbon; i++) {
        const t = i / this.pointsPerRibbon;
        path3D.push(this.evaluatePoint(t, phase));
      }

      // Generate extruded normals and quads
      for (let i = 0; i < this.pointsPerRibbon; i++) {
        const p1 = path3D[i];
        const p2 = path3D[i + 1];

        // Tangent vector
        const tx = p2.x - p1.x;
        const ty = p2.y - p1.y;
        const tz = p2.z - p1.z;
        const len = Math.hypot(tx, ty, tz) || 1;

        // Normal perpendicular in XY plane (simplified binormal for extrusion)
        const nx = -ty / len;
        const ny = tx / len;
        const nz = 0;

        // Upper and lower edges
        const u1 = {
          x: p1.x + nx * ribbonWidth,
          y: p1.y + ny * ribbonWidth,
          z: p1.z,
        };
        const d1 = {
          x: p1.x - nx * ribbonWidth,
          y: p1.y - ny * ribbonWidth,
          z: p1.z,
        };
        const u2 = {
          x: p2.x + nx * ribbonWidth,
          y: p2.y + ny * ribbonWidth,
          z: p2.z,
        };
        const d2 = {
          x: p2.x - nx * ribbonWidth,
          y: p2.y - ny * ribbonWidth,
          z: p2.z,
        };

        // Project all 4 corners
        const pu1 = camera.project(u1.x, u1.y, u1.z, cx, cy);
        const pd1 = camera.project(d1.x, d1.y, d1.z, cx, cy);
        const pu2 = camera.project(u2.x, u2.y, u2.z, cx, cy);
        const pd2 = camera.project(d2.x, d2.y, d2.z, cx, cy);

        if (
          !pu1.isVisible ||
          !pd1.isVisible ||
          !pu2.isVisible ||
          !pd2.isVisible
        )
          continue;

        const avgDepth = (pu1.depth + pd1.depth + pu2.depth + pd2.depth) * 0.25;
        const tVal = i / this.pointsPerRibbon;

        segments.push({
          pu1,
          pd1,
          pu2,
          pd2,
          avgDepth,
          tVal,
          ribbonIdx: r,
        });
      }
    }

    // 2. Depth sort for correct transparency
    segments.sort((s1, s2) => s2.avgDepth - s1.avgDepth);

    // 3. Render quads
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const { pu1, pd1, pu2, pd2, tVal, ribbonIdx } = seg;

      ctx.beginPath();
      ctx.moveTo(pu1.x, pu1.y);
      ctx.lineTo(pu2.x, pu2.y);
      ctx.lineTo(pd2.x, pd2.y);
      ctx.lineTo(pd1.x, pd1.y);
      ctx.closePath();

      // Iridescent surface gradient
      const fillColor = theme.getRibbonFill(tVal, ribbonIdx, this.time);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Subtle edge highlight
      ctx.strokeStyle = theme.getRibbonStroke(tVal, ribbonIdx);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // 4. Render satellite sparks
    for (let i = 0; i < this.satellites.length; i++) {
      const sat = this.satellites[i];
      const phase = (sat.ribbonIdx * Math.PI * 2) / this.numRibbons;
      const p3 = this.evaluatePoint(sat.tOffset, phase);
      const p2 = camera.project(p3.x, p3.y, p3.z, cx, cy);

      if (p2.isVisible) {
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 4.5 * p2.scale, 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.shadowColor = sat.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
}
