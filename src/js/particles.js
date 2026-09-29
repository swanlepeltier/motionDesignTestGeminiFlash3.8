/**
 * Quantum Singularity & Curl-Noise Particle Field
 * 15,000+ interactive particles driven by curl-noise vector fields,
 * central black-hole gravitational singularity, accretion jet respawning,
 * and mouse shockwave physics.
 */

export class ParticleSystem {
  constructor(count = 14000) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.lifespans = new Float32Array(count);
    this.colors = new Float32Array(count);

    this.shockwave = {
      active: false,
      x: 0,
      y: 0,
      z: 0,
      radius: 0,
      maxRadius: 380,
      speed: 18,
    };
    this.gravityStrength = 0.85;
    this.curlScale = 0.0035;
    this.time = 0;

    this.initParticles();
  }

  initParticles() {
    for (let i = 0; i < this.count; i++) {
      this.resetParticle(i, true);
    }
  }

  resetParticle(i, initial = false) {
    const idx = i * 3;
    const radius = initial
      ? 40 + Math.random() * 320
      : 240 + Math.random() * 120;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    this.positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
    this.positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
    this.positions[idx + 2] = radius * Math.cos(phi);

    // Initial tangential velocity for orbital angular momentum
    const speed = 1.2 + Math.random() * 1.5;
    this.velocities[idx] = -Math.sin(theta) * speed;
    this.velocities[idx + 1] = Math.cos(theta) * speed;
    this.velocities[idx + 2] = (Math.random() - 0.5) * speed * 0.5;

    this.lifespans[i] = 0.4 + Math.random() * 0.6;
    this.colors[i] = Math.random();
  }

  triggerShockwave(x, y, z = 0) {
    this.shockwave.active = true;
    this.shockwave.x = x;
    this.shockwave.y = y;
    this.shockwave.z = z;
    this.shockwave.radius = 10;
  }

  update(dt = 0.016, speedMultiplier = 1.0, mousePos3D = null) {
    this.time += dt * speedMultiplier;
    const cScale = this.curlScale;
    const t = this.time * 0.6;

    // Advance shockwave
    if (this.shockwave.active) {
      this.shockwave.radius += this.shockwave.speed * speedMultiplier;
      if (this.shockwave.radius > this.shockwave.maxRadius) {
        this.shockwave.active = false;
      }
    }

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      let px = this.positions[idx];
      let py = this.positions[idx + 1];
      let pz = this.positions[idx + 2];

      let vx = this.velocities[idx];
      let vy = this.velocities[idx + 1];
      let vz = this.velocities[idx + 2];

      // 1. Curl-Noise Force Approximation (fast 3D trigonometric potential)
      const nx = Math.sin(py * cScale + t) + Math.cos(pz * cScale - t);
      const ny = Math.cos(px * cScale + t) - Math.sin(pz * cScale + t);
      const nz = Math.sin(px * cScale - t) + Math.cos(py * cScale + t);

      vx += nx * 0.08 * speedMultiplier;
      vy += ny * 0.08 * speedMultiplier;
      vz += nz * 0.08 * speedMultiplier;

      // 2. Gravitational Singularity (Central Attractor at 0, 0, 0)
      const distSq = px * px + py * py + pz * pz + 400;
      const dist = Math.sqrt(distSq);
      const force = (this.gravityStrength * 800) / distSq;

      vx -= (px / dist) * force * speedMultiplier;
      vy -= (py / dist) * force * speedMultiplier;
      vz -= (pz / dist) * force * speedMultiplier;

      // 3. Shockwave repulsion
      if (this.shockwave.active) {
        const sdx = px - this.shockwave.x;
        const sdy = py - this.shockwave.y;
        const sdz = pz - this.shockwave.z;
        const sDist = Math.hypot(sdx, sdy, sdz) || 1;
        const deltaR = Math.abs(sDist - this.shockwave.radius);

        if (deltaR < 35) {
          const repulse = ((35 - deltaR) / 35) * 6.5;
          vx += (sdx / sDist) * repulse;
          vy += (sdy / sDist) * repulse;
          vz += (sdz / sDist) * repulse;
        }
      }

      // 4. Mouse attraction well
      if (mousePos3D) {
        const mdx = mousePos3D.x - px;
        const mdy = mousePos3D.y - py;
        const mdz = mousePos3D.z - pz;
        const mDistSq = mdx * mdx + mdy * mdy + mdz * mdz + 900;
        if (mDistSq < 160000) {
          const mForce = 1200 / mDistSq;
          vx += (mdx / Math.sqrt(mDistSq)) * mForce * speedMultiplier;
          vy += (mdy / Math.sqrt(mDistSq)) * mForce * speedMultiplier;
          vz += (mdz / Math.sqrt(mDistSq)) * mForce * speedMultiplier;
        }
      }

      // Drag / Friction
      vx *= 0.985;
      vy *= 0.985;
      vz *= 0.985;

      // Integrate position
      px += vx * speedMultiplier;
      py += vy * speedMultiplier;
      pz += vz * speedMultiplier;

      // Check singularity event horizon (r < 22) or boundary escape
      if (dist < 22 || dist > 600) {
        this.resetParticle(i, false);
      } else {
        this.positions[idx] = px;
        this.positions[idx + 1] = py;
        this.positions[idx + 2] = pz;
        this.velocities[idx] = vx;
        this.velocities[idx + 1] = vy;
        this.velocities[idx + 2] = vz;
      }
    }
  }

  render(ctx, camera, cx, cy, theme) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const pArray = [];
    const step = 1; // Render all particles

    for (let i = 0; i < this.count; i += step) {
      const idx = i * 3;
      const px = this.positions[idx];
      const py = this.positions[idx + 1];
      const pz = this.positions[idx + 2];

      const p2 = camera.project(px, py, pz, cx, cy);
      if (!p2.isVisible) continue;

      const vx = this.velocities[idx];
      const vy = this.velocities[idx + 1];
      const vz = this.velocities[idx + 2];
      const speed = Math.hypot(vx, vy, vz);

      pArray.push({
        x: p2.x,
        y: p2.y,
        depth: p2.depth,
        scale: p2.scale,
        speed,
        colorSeed: this.colors[i],
      });
    }

    // Render particles
    for (let i = 0; i < pArray.length; i++) {
      const p = pArray[i];
      const pSize = Math.max(
        0.8,
        Math.min(3.2, (1.2 + p.speed * 0.4) * p.scale),
      );
      const color = theme.getParticleColor(p.speed, p.colorSeed);

      ctx.fillStyle = color;
      ctx.fillRect(p.x - pSize * 0.5, p.y - pSize * 0.5, pSize, pSize);
    }

    // Render shockwave ripple ring in 3D
    if (this.shockwave.active) {
      const s2 = camera.project(
        this.shockwave.x,
        this.shockwave.y,
        this.shockwave.z,
        cx,
        cy,
      );
      if (s2.isVisible) {
        const ringR = this.shockwave.radius * s2.scale;
        ctx.beginPath();
        ctx.arc(s2.x, s2.y, ringR, 0, Math.PI * 2);
        const shockAlpha =
          (1.0 - this.shockwave.radius / this.shockwave.maxRadius) * 0.7;
        ctx.strokeStyle = `rgba(0, 240, 255, ${shockAlpha})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
