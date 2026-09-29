/**
 * Interactive Cubic Bézier Easing Engine & Solver
 * Features:
 * - Newton-Raphson root solver for x(t) -> y(t) evaluation
 * - Interactive Canvas UI with draggable control points (P1, P2)
 * - Real-time acceleration bead visualization
 * - Standard and extreme motion design presets
 */

export class BezierEasing {
  constructor(x1 = 0.16, y1 = 1.0, x2 = 0.3, y2 = 1.0) {
    this.setPoints(x1, y1, x2, y2);
  }

  setPoints(x1, y1, x2, y2) {
    this.x1 = Math.max(0, Math.min(1, x1));
    this.y1 = y1;
    this.x2 = Math.max(0, Math.min(1, x2));
    this.y2 = y2;
  }

  // Precomputed polynomial coefficients
  // x(t) = a*t^3 + b*t^2 + c*t
  calcBezier(t, a1, a2) {
    return ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t;
  }

  calcBezierSlope(t, a1, a2) {
    return (
      3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1
    );
  }

  /**
   * Evaluates y given an input x in [0, 1] using Newton-Raphson iteration
   */
  solve(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    if (this.x1 === this.y1 && this.x2 === this.y2) return x;

    // Newton-Raphson iteration
    let t = x;
    for (let i = 0; i < 8; i++) {
      const currentSlope = this.calcBezierSlope(t, this.x1, this.x2);
      if (currentSlope === 0) break;
      const currentX = this.calcBezier(t, this.x1, this.x2) - x;
      t -= currentX / currentSlope;
    }

    // Binary search fallback if Newton-Raphson diverges
    if (t < 0 || t > 1) {
      let t0 = 0,
        t1 = 1;
      t = x;
      while (t0 < t1) {
        const currentX = this.calcBezier(t, this.x1, this.x2);
        if (Math.abs(currentX - x) < 0.001) break;
        if (x > currentX) t0 = t;
        else t1 = t;
        t = (t1 + t0) * 0.5;
      }
    }

    return this.calcBezier(t, this.y1, this.y2);
  }

  getCSS() {
    return `cubic-bezier(${this.x1.toFixed(2)}, ${this.y1.toFixed(2)}, ${this.x2.toFixed(2)}, ${this.y2.toFixed(2)})`;
  }
}

export class BezierEditor {
  constructor(canvasElement, onChange = null) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.onChange = onChange;

    this.solver = new BezierEasing(0.16, 1.0, 0.3, 1.0);

    this.padding = 34;
    this.activePoint = null;
    this.isDragging = false;
    this.previewProgress = 0;

    this.presets = {
      "cyber-snap": [0.05, 0.95, 0.15, 1.0],
      "cinematic-swift": [0.16, 1.0, 0.3, 1.0],
      "elastic-rebound": [0.68, -0.4, 0.265, 1.4],
      "smooth-sine": [0.45, 0.05, 0.55, 0.95],
      "precision-linear": [0.0, 0.0, 1.0, 1.0],
    };

    this.initEvents();
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const toNorm = (pos) => {
      const graphW = this.canvas.width - this.padding * 2;
      const graphH = this.canvas.height - this.padding * 2;
      return {
        x: Math.max(0, Math.min(1, (pos.x - this.padding) / graphW)),
        y: 1 - (pos.y - this.padding) / graphH,
      };
    };

    const toCanvas = (norm) => {
      const graphW = this.canvas.width - this.padding * 2;
      const graphH = this.canvas.height - this.padding * 2;
      return {
        x: this.padding + norm.x * graphW,
        y: this.padding + (1 - norm.y) * graphH,
      };
    };

    this.toCanvas = toCanvas;
    this.toNorm = toNorm;

    const hitTest = (pos) => {
      const p1Canvas = toCanvas({ x: this.solver.x1, y: this.solver.y1 });
      const p2Canvas = toCanvas({ x: this.solver.x2, y: this.solver.y2 });
      const radius = 16;

      const d1 = Math.hypot(pos.x - p1Canvas.x, pos.y - p1Canvas.y);
      const d2 = Math.hypot(pos.x - p2Canvas.x, pos.y - p2Canvas.y);

      if (d1 < radius) return "p1";
      if (d2 < radius) return "p2";
      return null;
    };

    this.canvas.addEventListener("mousedown", (e) => {
      const pos = getPos(e);
      const hit = hitTest(pos);
      if (hit) {
        this.activePoint = hit;
        this.isDragging = true;
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging || !this.activePoint) return;
      const pos = getPos(e);
      const norm = toNorm(pos);

      if (this.activePoint === "p1") {
        this.solver.setPoints(norm.x, norm.y, this.solver.x2, this.solver.y2);
      } else {
        this.solver.setPoints(this.solver.x1, this.solver.y1, norm.x, norm.y);
      }

      if (this.onChange) this.onChange(this.solver);
      this.draw();
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.activePoint = null;
    });

    // Touch events
    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          const pos = getPos(touch);
          const hit = hitTest(pos);
          if (hit) {
            this.activePoint = hit;
            this.isDragging = true;
            e.preventDefault();
          }
        }
      },
      { passive: false },
    );

    window.addEventListener("touchmove", (e) => {
      if (!this.isDragging || !this.activePoint) return;
      const touch = e.touches[0];
      const pos = getPos(touch);
      const norm = toNorm(pos);

      if (this.activePoint === "p1") {
        this.solver.setPoints(norm.x, norm.y, this.solver.x2, this.solver.y2);
      } else {
        this.solver.setPoints(this.solver.x1, this.solver.y1, norm.x, norm.y);
      }

      if (this.onChange) this.onChange(this.solver);
      this.draw();
    });

    window.addEventListener("touchend", () => {
      this.isDragging = false;
      this.activePoint = null;
    });
  }

  setPreset(name) {
    if (this.presets[name]) {
      const [x1, y1, x2, y2] = this.presets[name];
      this.solver.setPoints(x1, y1, x2, y2);
      if (this.onChange) this.onChange(this.solver);
      this.draw();
    }
  }

  setPreviewProgress(p) {
    this.previewProgress = p % 1.0;
    this.draw();
  }

  draw() {
    const { ctx, canvas, padding } = this;
    const w = canvas.width;
    const h = canvas.height;
    const graphW = w - padding * 2;
    const graphH = h - padding * 2;

    ctx.clearRect(0, 0, w, h);

    // Dark sleek background
    ctx.fillStyle = "rgba(10, 14, 23, 0.85)";
    ctx.fillRect(0, 0, w, h);

    // Subtle Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    const divisions = 4;
    for (let i = 0; i <= divisions; i++) {
      const x = padding + (i / divisions) * graphW;
      const y = padding + (i / divisions) * graphH;

      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, h - padding);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    // Diagonal reference line (Linear 1:1)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Unit Box Borders
    ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padding, padding, graphW, graphH);

    const p0 = this.toCanvas({ x: 0, y: 0 });
    const p1 = this.toCanvas({ x: this.solver.x1, y: this.solver.y1 });
    const p2 = this.toCanvas({ x: this.solver.x2, y: this.solver.y2 });
    const p3 = this.toCanvas({ x: 1, y: 1 });

    // Handle Lines
    ctx.lineWidth = 1.5;
    // P0 -> P1 handle
    ctx.strokeStyle = "rgba(0, 240, 255, 0.6)";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    // P3 -> P2 handle
    ctx.strokeStyle = "rgba(255, 0, 128, 0.6)";
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Main Cubic Curve
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    const steps = 60;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = this.solver.calcBezier(t, this.solver.x1, this.solver.x2);
      const y = this.solver.calcBezier(t, this.solver.y1, this.solver.y2);
      const c = this.toCanvas({ x, y });
      ctx.lineTo(c.x, c.y);
    }

    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(0, 240, 255, 0.7)";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draggable Handle Handles
    // P1 Handle (Cyan)
    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // P2 Handle (Magenta)
    ctx.fillStyle = "#ff0080";
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Animated Runner Bead on curve
    const easedY = this.solver.solve(this.previewProgress);
    const bead = this.toCanvas({ x: this.previewProgress, y: easedY });

    ctx.fillStyle = "#ffe600";
    ctx.shadowColor = "#ffe600";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(bead.x, bead.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "10px monospace";
    ctx.fillText(
      `P1: (${this.solver.x1.toFixed(2)}, ${this.solver.y1.toFixed(2)})`,
      padding,
      h - 8,
    );
    ctx.fillText(
      `P2: (${this.solver.x2.toFixed(2)}, ${this.solver.y2.toFixed(2)})`,
      w - padding - 85,
      h - 8,
    );
  }
}
