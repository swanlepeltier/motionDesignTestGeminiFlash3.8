# AETHERIS // Hyper-Kinematic Motion Design Engine

> A masterclass interactive motion design and procedural animation system built entirely on web standards: **Zero External Dependencies**, **120 FPS Decoupled Physics**, **4D Mathematical Geometry**, **Pure Web Audio FM Synthesis**, and an **Interactive Cubic Bézier Easing Lab**.

---

## Technical Highlights

### 1. 4D Hyper-Dimensional Projection & Kinematics (`geometry4d.js`)
- **Real 4D Rotation Matrices**: Computes rotation across all 6 orthogonal Euclidean 4D planes: $XY, XZ, XW, YZ, YW, ZW$.
- **Perspective 4D-to-3D Stereographic Projection**: Translates 4D hypercube coordinates into 3D using focal depth $w$-factor equations ($f_4 = \frac{D_4}{D_4 - w}$).
- **Illuminated Edge Wireframes & Vertex Shading**: Dynamic line weight, opacity, and color hue computed per-vertex and per-edge based on 4D hyper-depth $w$.
- Supports multiple 4-polytopes: **Tesseract (8-cell)**, **Orthoplex (16-cell)**, and **Clifford Torus (Hopf fibration)**.

### 2. Aerospace Astrolabe & Mechanical Iris HUD (`hud.js`)
- Concentric counter-rotating gimbal rings inspired by luxury horology tourbillons and fighter jet HUDs.
- Outer dial with 360° degree markings, cardinal reticles, and 10° degree typography.
- Middle dial with Vernier scale subdivisions ($0.1^\circ$ precision sub-ticks) and gear teeth.
- **Mechanical Iris Aperture**: 12 curved overlapping polygonal blades that dynamically dilate and constrict with spring physics.
- Real-time 360° sweeping radar with phosphor persistence and interactive spring-damped crosshair tracker.

### 3. 3D Harmonic Lissajous Wave Ribbons (`ribbons.js`)
- Continuous parametric 3D curves governed by 3-axis harmonic frequencies ($A_x \sin(\omega_1 t), A_y \sin(\omega_2 t), A_z \cos(\omega_3 t)$).
- Surface normal extrusion generating double-sided quad strips with depth sorting (Painter's algorithm).
- Iridescent dynamic color shifting along curve arc length with orbiting satellite photon sparks.

### 4. Quantum Singularity & Curl-Noise Field (`particles.js`)
- **14,000+ real-time particles** updated at 60–120 FPS.
- Divergence-free 3D curl-noise flow field forces driving fluid vortex motion.
- Central gravitational singularity with accretion jet respawning when crossing the event horizon.
- Interactive shockwave physics: clicking anywhere on screen generates an explosive 3D shockwave dispersing nearby particles with velocity damping.

### 5. Kinetic Matrix Typography Engine (`typography.js`)
- Staggered character transforms with individual 3D perspective pitch/yaw.
- Letter-spacing breathing with harmonic sinusoidal tracking expansion.
- Chromatic aberration glitch slicing ($RGB$ split displacement) on scene transitions.
- Live custom input: Type any text into the HUD to immediately witness it animated in real time!

### 6. Interactive Cubic Bézier Easing Lab (`bezier.js`)
- Draggable $P_1(x_1, y_1)$ and $P_2(x_2, y_2)$ control point handles directly on the canvas.
- High-precision **Newton-Raphson polynomial root solver** ($x(t) \to y(t)$) with bisection fallback.
- Live animated runner bead previewing instantaneous acceleration on the curve.
- One-click **Copy CSS** snippet generation: `cubic-bezier(x1, y1, x2, y2)`.
- Pre-configured motion presets: *Cinematic Swift*, *Cyber Snap*, *Elastic Rebound*, *Smooth Sine*, *Linear*.

### 7. Procedural Web Audio Synthesizer (`audio.js`)
- **Zero audio files / 100% synthesized in real time**:
  - Mechanical Vernier relay ticks on gear rotation.
  - Generative sub-bass ambient drone modulated by 4D rotation speed.
  - Frequency Modulation (FM) crystal chimes on UI interactions.
  - Warp whoosh filter sweeps during scene transitions.
- **Real-Time FFT Spectrum Analyser**: Circular audio oscilloscope rendered directly into the gimbal HUD ring.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Play / Pause Timeline |
| **1 – 5** | Jump to Scene (Tesseract, Gimbal, Ribbons, Singularity, Symphony) |
| **M** | Toggle Procedural Synthesizer Sound |
| **S** | Capture 4K Ultra-HD Snapshot (PNG) |
| **R** | Record Live Motion Reel (WebM Video) |
| **H** | Toggle HUD / Dock Overlays (Clean Cinema View) |
| **F** | Fullscreen Mode |
| **Click / Drag** | Orbit 3D Camera / Trigger Singularity Shockwave |
| **Scroll / Wheel** | Zoom In / Out |

---

## Quick Start

### Option 1: Native Local Server
```bash
python3 -m http.server 3000
```
Then open `http://localhost:3000` in any modern web browser.

### Option 2: Vite Dev Server
```bash
npm install
npm run dev
```

---

## Architecture

```
├── index.html            # Main application interface with cyber-glassmorphism HUD
├── package.json          # Node scripts & Vite configuration
├── README.md             # Technical documentation
└── src/
    ├── css/
    │   └── style.css     # CSS custom properties, glassmorphism, responsive HUD
    └── js/
        ├── app.js        # Orchestrator, keybindings, event loops
        ├── audio.js      # Procedural Web Audio API synth & FFT spectrum
        ├── bezier.js     # Interactive Bézier editor & Newton-Raphson solver
        ├── camera.js     # 3D spherical orbit camera with inertial damping
        ├── engine.js     # HiDPI render loop, scene compositor, video recorder
        ├── geometry4d.js # 4D Tesseract, Orthoplex, rotation matrices
        ├── hud.js        # Precision gimbal dials, mechanical iris, telemetry
        ├── particles.js  # 14,000 particle curl-noise singularity field
        ├── ribbons.js    # 3D harmonic Lissajous wave ribbons
        ├── themes.js     # Color palettes & shader grading
        └── typography.js # Kinetic matrix typography & glitch slicing
```
