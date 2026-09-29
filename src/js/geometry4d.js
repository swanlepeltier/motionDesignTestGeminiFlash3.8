/**
 * 4D Hyper-Dimensional Geometry Engine
 * Implements 4D rotation matrices across 6 orthogonal planes,
 * perspective 4D->3D stereographic projection, dynamic vertex shading,
 * and illuminated hyper-edges with depth sorting.
 */

export class Geometry4D {
  constructor() {
    this.type = "tesseract"; // 'tesseract' | 'orthoplex' | 'hyper_torus'
    this.size = 180;
    this.distance4D = 2.6;

    // 4D Rotation angles
    this.rot = {
      xy: 0,
      xz: 0,
      xw: 0,
      yz: 0,
      yw: 0,
      zw: 0,
    };

    // Rotation speeds
    this.speed = {
      xy: 0.008,
      xz: 0.005,
      xw: 0.016, // Rotates 4th dimension
      yz: 0.004,
      yw: 0.012,
      zw: 0.018,
    };

    this.initGeometries();
  }

  initGeometries() {
    // 1. Tesseract (16 vertices, 32 edges, 24 faces)
    this.tesseractVertices = [];
    for (let i = 0; i < 16; i++) {
      this.tesseractVertices.push([
        i & 1 ? 1 : -1,
        i & 2 ? 1 : -1,
        i & 4 ? 1 : -1,
        i & 8 ? 1 : -1,
      ]);
    }

    this.tesseractEdges = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        // Two vertices share an edge if their coordinates differ by exactly 1 bit
        const diff = i ^ j;
        if (diff === 1 || diff === 2 || diff === 4 || diff === 8) {
          this.tesseractEdges.push([i, j]);
        }
      }
    }

    // 2. 16-Cell / 4D Orthoplex (8 vertices, 24 edges)
    this.orthoplexVertices = [
      [1.6, 0, 0, 0],
      [-1.6, 0, 0, 0],
      [0, 1.6, 0, 0],
      [0, -1.6, 0, 0],
      [0, 0, 1.6, 0],
      [0, 0, -1.6, 0],
      [0, 0, 0, 1.6],
      [0, 0, 0, -1.6],
    ];
    this.orthoplexEdges = [];
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        // Connect vertices that are not opposite each other
        if (i % 2 === 0 && j === i + 1) continue;
        this.orthoplexEdges.push([i, j]);
      }
    }

    // 3. 4D Clifford Torus / Hopf Lattice (Parameterized grid)
    this.torusVertices = [];
    this.torusEdges = [];
    const uSteps = 12;
    const vSteps = 12;
    const r1 = 1.0,
      r2 = 1.0;

    for (let u = 0; u < uSteps; u++) {
      const uAngle = (u / uSteps) * Math.PI * 2;
      for (let v = 0; v < vSteps; v++) {
        const vAngle = (v / vSteps) * Math.PI * 2;
        this.torusVertices.push([
          r1 * Math.cos(uAngle),
          r1 * Math.sin(uAngle),
          r2 * Math.cos(vAngle),
          r2 * Math.sin(vAngle),
        ]);

        const curr = u * vSteps + v;
        const nextU = ((u + 1) % uSteps) * vSteps + v;
        const nextV = u * vSteps + ((v + 1) % vSteps);
        this.torusEdges.push([curr, nextU]);
        this.torusEdges.push([curr, nextV]);
      }
    }
  }

  update(dt = 0.016, speedMultiplier = 1.0) {
    this.rot.xy += this.speed.xy * speedMultiplier;
    this.rot.xz += this.speed.xz * speedMultiplier;
    this.rot.xw += this.speed.xw * speedMultiplier;
    this.rot.yz += this.speed.yz * speedMultiplier;
    this.rot.yw += this.speed.yw * speedMultiplier;
    this.rot.zw += this.speed.zw * speedMultiplier;
  }

  /**
   * Applies 4D rotation across all 6 planes to point (x, y, z, w)
   */
  rotate4D(point) {
    let [x, y, z, w] = point;

    // Plane XW
    if (this.rot.xw !== 0) {
      const cos = Math.cos(this.rot.xw),
        sin = Math.sin(this.rot.xw);
      const x1 = x * cos - w * sin;
      const w1 = x * sin + w * cos;
      x = x1;
      w = w1;
    }

    // Plane YW
    if (this.rot.yw !== 0) {
      const cos = Math.cos(this.rot.yw),
        sin = Math.sin(this.rot.yw);
      const y1 = y * cos - w * sin;
      const w1 = y * sin + w * cos;
      y = y1;
      w = w1;
    }

    // Plane ZW
    if (this.rot.zw !== 0) {
      const cos = Math.cos(this.rot.zw),
        sin = Math.sin(this.rot.zw);
      const z1 = z * cos - w * sin;
      const w1 = z * sin + w * cos;
      z = z1;
      w = w1;
    }

    // Plane XY
    if (this.rot.xy !== 0) {
      const cos = Math.cos(this.rot.xy),
        sin = Math.sin(this.rot.xy);
      const x1 = x * cos - y * sin;
      const y1 = x * sin + y * cos;
      x = x1;
      y = y1;
    }

    // Plane XZ
    if (this.rot.xz !== 0) {
      const cos = Math.cos(this.rot.xz),
        sin = Math.sin(this.rot.xz);
      const x1 = x * cos - z * sin;
      const z1 = x * sin + z * cos;
      x = x1;
      z = z1;
    }

    // Plane YZ
    if (this.rot.yz !== 0) {
      const cos = Math.cos(this.rot.yz),
        sin = Math.sin(this.rot.yz);
      const y1 = y * cos - z * sin;
      const z1 = y * sin + z * cos;
      y = y1;
      z = z1;
    }

    return [x, y, z, w];
  }

  /**
   * Perspective 4D to 3D projection
   */
  project4Dto3D(p4) {
    const [x, y, z, w] = p4;
    const invW = 1.0 / Math.max(0.2, this.distance4D - w);
    return {
      x: x * invW * this.size,
      y: y * invW * this.size,
      z: z * invW * this.size,
      w: w,
      wFactor: invW,
    };
  }

  render(ctx, camera, cx, cy, theme) {
    let rawVertices, edges;
    if (this.type === "orthoplex") {
      rawVertices = this.orthoplexVertices;
      edges = this.orthoplexEdges;
    } else if (this.type === "hyper_torus") {
      rawVertices = this.torusVertices;
      edges = this.torusEdges;
    } else {
      rawVertices = this.tesseractVertices;
      edges = this.tesseractEdges;
    }

    // 1. Transform 4D -> 3D -> 2D
    const projectedNodes = [];
    for (let i = 0; i < rawVertices.length; i++) {
      const rotated4 = this.rotate4D(rawVertices[i]);
      const p3 = this.project4Dto3D(rotated4);
      const p2 = camera.project(p3.x, p3.y, p3.z, cx, cy);

      projectedNodes.push({
        x2: p2.x,
        y2: p2.y,
        depth: p2.depth,
        scale: p2.scale,
        w: p3.w,
        wFactor: p3.wFactor,
        isVisible: p2.isVisible,
      });
    }

    // 2. Sort edges by average depth for painter's algorithm
    const edgeList = [];
    for (let i = 0; i < edges.length; i++) {
      const [idxA, idxB] = edges[i];
      const a = projectedNodes[idxA];
      const b = projectedNodes[idxB];
      if (!a.isVisible || !b.isVisible) continue;

      const avgDepth = (a.depth + b.depth) * 0.5;
      const avgW = (a.w + b.w) * 0.5;
      edgeList.push({ a, b, avgDepth, avgW });
    }

    edgeList.sort((e1, e2) => e2.avgDepth - e1.avgDepth);

    // 3. Render illuminated edges
    for (let i = 0; i < edgeList.length; i++) {
      const { a, b, avgW } = edgeList[i];

      // Depth cueing based on 4D W coordinate
      const normW = (avgW + 1.2) / 2.4; // 0 to 1
      const alpha = Math.max(0.15, Math.min(0.95, normW * 0.85 + 0.15));
      const lineWidth = Math.max(1.0, Math.min(3.5, normW * 3.0));

      ctx.beginPath();
      ctx.moveTo(a.x2, a.y2);
      ctx.lineTo(b.x2, b.y2);

      // Color gradation
      ctx.strokeStyle = theme.get4DEdgeColor(normW, alpha);
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Core luminous highlight
      if (normW > 0.6) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${(normW - 0.5) * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 4. Render vertex nodes
    for (let i = 0; i < projectedNodes.length; i++) {
      const node = projectedNodes[i];
      if (!node.isVisible) continue;

      const normW = (node.w + 1.2) / 2.4;
      const nodeRadius = Math.max(
        2.5,
        Math.min(7.5, (normW * 4.5 + 2) * (node.scale * 1.2)),
      );

      // Glowing outer ring
      ctx.beginPath();
      ctx.arc(node.x2, node.y2, nodeRadius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = theme.getNodeGlowColor(normW);
      ctx.fill();

      // Sharp central core
      ctx.beginPath();
      ctx.arc(node.x2, node.y2, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
  }
}
