/**
 * 3D Spherical Orbit Camera with Inertial Damping & Cinematic Director
 */

export class Camera3D {
  constructor(canvas) {
    this.canvas = canvas;

    // Spherical coordinates
    this.radius = 650;
    this.targetRadius = 650;
    this.theta = 0.6;
    this.targetTheta = 0.6;
    this.phi = 1.1;
    this.targetPhi = 1.1;

    this.target = { x: 0, y: 0, z: 0 };
    this.panTarget = { x: 0, y: 0, z: 0 };

    this.damping = 0.12;
    this.fov = 600;

    this.isDragging = false;
    this.isPanning = false;
    this.lastMouse = { x: 0, y: 0 };

    this.autoRotate = true;
    this.autoRotateSpeed = 0.004;

    this.cinematicTime = 0;

    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.isPanning = e.button === 2 || e.shiftKey;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;
      this.lastMouse = { x: e.clientX, y: e.clientY };

      if (this.isPanning) {
        const panSpeed = this.radius * 0.0015;
        this.panTarget.x -= dx * panSpeed;
        this.panTarget.y += dy * panSpeed;
      } else {
        this.targetTheta += dx * 0.008;
        this.targetPhi = Math.max(
          0.1,
          Math.min(Math.PI - 0.1, this.targetPhi - dy * 0.008),
        );
      }
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.isPanning = false;
    });

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        this.targetRadius = Math.max(
          200,
          Math.min(2200, this.targetRadius * zoomFactor),
        );
      },
      { passive: false },
    );

    // Touch support
    let touchStartDist = 0;
    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
          touchStartDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY,
          );
        }
      },
      { passive: true },
    );

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 1 && this.isDragging) {
          const dx = e.touches[0].clientX - this.lastMouse.x;
          const dy = e.touches[0].clientY - this.lastMouse.y;
          this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          this.targetTheta += dx * 0.008;
          this.targetPhi = Math.max(
            0.1,
            Math.min(Math.PI - 0.1, this.targetPhi - dy * 0.008),
          );
        } else if (e.touches.length === 2) {
          const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY,
          );
          const diff = touchStartDist - currentDist;
          this.targetRadius = Math.max(
            200,
            Math.min(2200, this.targetRadius + diff * 1.5),
          );
          touchStartDist = currentDist;
        }
      },
      { passive: true },
    );

    this.canvas.addEventListener("touchend", () => {
      this.isDragging = false;
    });

    // Disable context menu on canvas for right-click pan
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  setViewPreset(preset) {
    switch (preset) {
      case "iso":
        this.targetTheta = Math.PI * 0.25;
        this.targetPhi = Math.PI * 0.35;
        this.targetRadius = 650;
        break;
      case "front":
        this.targetTheta = 0;
        this.targetPhi = Math.PI * 0.5;
        this.targetRadius = 600;
        break;
      case "top":
        this.targetTheta = 0;
        this.targetPhi = 0.12;
        this.targetRadius = 700;
        break;
      case "dramatic":
        this.targetTheta = Math.PI * 0.65;
        this.targetPhi = Math.PI * 0.72;
        this.targetRadius = 480;
        break;
      case "macro":
        this.targetTheta = Math.PI * 0.15;
        this.targetPhi = Math.PI * 0.45;
        this.targetRadius = 320;
        break;
    }
  }

  update(dt = 0.016) {
    if (this.autoRotate && !this.isDragging) {
      this.cinematicTime += dt;
      this.targetTheta += this.autoRotateSpeed;
      // Gentle cinematic breathing bob
      this.targetPhi += Math.sin(this.cinematicTime * 0.4) * 0.0006;
    }

    // Smooth inertia
    this.theta += (this.targetTheta - this.theta) * this.damping;
    this.phi += (this.targetPhi - this.phi) * this.damping;
    this.radius += (this.targetRadius - this.radius) * this.damping;

    this.target.x += (this.panTarget.x - this.target.x) * this.damping;
    this.target.y += (this.panTarget.y - this.target.y) * this.damping;
    this.target.z += (this.panTarget.z - this.target.z) * this.damping;

    // Precompute trigonometric terms for camera rotation matrix
    this.cosT = Math.cos(this.theta);
    this.sinT = Math.sin(this.theta);
    this.cosP = Math.cos(this.phi);
    this.sinP = Math.sin(this.phi);

    // Eye position in world coordinates
    this.eyeX = this.target.x + this.radius * this.sinP * this.sinT;
    this.eyeY = this.target.y + this.radius * this.cosP;
    this.eyeZ = this.target.z + this.radius * this.sinP * this.cosT;
  }

  /**
   * Projects a 3D point (x, y, z) into 2D viewport coordinates
   * Returns: { x: screenX, y: screenY, depth, scale, isVisible }
   */
  project(x, y, z, cx, cy) {
    // Translate relative to camera target
    const dx = x - this.target.x;
    const dy = y - this.target.y;
    const dz = z - this.target.z;

    // Rotate by azimuthal angle theta around Y
    const x1 = dx * this.cosT - dz * this.sinT;
    const z1 = dx * this.sinT + dz * this.cosT;

    // Rotate by polar angle phi around X
    const y2 = dy * this.sinP - z1 * this.cosP;
    const z2 = dy * this.cosP + z1 * this.sinP;

    // View-space depth
    const depth = this.radius - z2;
    if (depth <= 1) {
      return { x: cx, y: cy, depth: 1, scale: 0, isVisible: false };
    }

    const scale = this.fov / depth;
    const screenX = cx + x1 * scale;
    const screenY = cy - y2 * scale;

    return {
      x: screenX,
      y: screenY,
      depth,
      scale,
      isVisible: true,
    };
  }
}
