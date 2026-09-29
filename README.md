# AETHERIS // Hyper-Kinematic Motion Design Engine

> A masterclass interactive motion design and procedural animation system built entirely on web standards: Zero External Dependencies, 120 FPS Decoupled Physics, 4D Mathematical Geometry, Pure Web Audio FM Synthesis, and an Interactive Cubic Bézier Easing Lab.

---

## Technical Highlights

### 1. 4D Hyper-Dimensional Projection & Kinematics (geometry4d.js) - Real 4D Rotation Matrices: Computes rotation across all 6 orthogonal Euclidean 4D planes: 
X
Y
,
X
Z
,
X
W
,
Y
Z
,
Y
W
,
Z
W
XY,XZ,XW,YZ,YW,ZW. - Perspective 4D-to-3D Stereographic Projection: Translates 4D hypercube coordinates into 3D using focal depth 
w
w-factor equations (
f
4
=
D
4
D
4
−
w
f 
4
​
 = 
D 
4
​
 −w
D 
4
​
 
​
 ). - Illuminated Edge Wireframes & Vertex Shading: Dynamic line weight, opacity, and color hue computed per-vertex and per-edge based on 4D hyper-depth 
w
w. - Supports multiple 4-polytopes: Tesseract (8-cell), Orthoplex (16-cell), and Clifford Torus (Hopf fibration).

### 2. Aerospace Astrolabe & Mechanical Iris HUD (hud.js) - Concentric counter-rotating gimbal rings inspired by luxury horology tourbillons and fighter jet HUDs. - Outer dial with 360° degree markings, cardinal reticles, and 10° degree typography. - Middle dial with Vernier scale subdivisions (
0.1
∘
0.1 
∘
  precision sub-ticks) and gear teeth. - Mechanical Iris Aperture: 12 curved overlapping polygonal blades that dynamically dilate and constrict with spring physics. - Real-time 360° sweeping radar with phosphor persistence and interactive spring-damped crosshair tracker.

### 3. 3D Harmonic Lissajous Wave Ribbons (ribbons.js) - Continuous parametric 3D curves governed by 3-axis harmonic frequencies (
A
x
sin
⁡
(
ω
1
t
)
,
A
y
sin
⁡
(
ω
2
t
)
,
A
z
cos
⁡
(
ω
3
t
)
A 
x
​
 sin(ω 
1
​
 t),A 
y
​
 sin(ω 
2
​
 t),A 
z
​
 cos(ω 
3
​
 t)). - Surface normal extrusion generating double-sided quad strips with depth sorting (Painter's algorithm). - Iridescent dynamic color shifting along curve arc length with orbiting satellite photon sparks.

### 4. Quantum Singularity & Curl-Noise Field (particles.js) - 14,000+ real-time particles updated at 60–120 FPS. - Divergence-free 3D curl-noise flow field forces driving fluid vortex motion. - Central gravitational singularity with accretion jet respawning when crossing the event horizon. - Interactive shockwave physics: clicking anywhere on screen generates an explosive 3D shockwave dispersing nearby particles with velocity damping.

### 5. Kinetic Matrix Typography Engine (typography.js) - Staggered character transforms with individual 3D perspective pitch/yaw. - Letter-spacing breathing with harmonic sinusoidal tracking expansion. - Chromatic aberration glitch slicing (
R
G
B
RGB split displacement) on scene transitions. - Live custom input: Type any text into the HUD to immediately witness it animated in real time!

### 6. Interactive Cubic Bézier Easing Lab (bezier.js) - Draggable 
P
1
(
x
1
,
y
1
)
P 
1
​
 (x 
1
​
 ,y 
1
​
 ) and 
P
2
(
x
2
,
y
2
)
P 
2
​
 (x 
2
​
 ,y 
2
​
 ) control point handles directly on the canvas. - High-precision Newton-Raphson polynomial root solver (
x
(
t
)
→
y
(
t
)
x(t)→y(t)) with bisection fallback. - Live animated runner bead previewing instantaneous acceleration on the curve. - One-click Copy CSS snippet generation: cubic-bezier(x1, y1, x2, y2). - Pre-configured motion presets: Cinematic Swift, Cyber Snap, Elastic Rebound, Smooth Sine, Linear.

### 7. Procedural Web Audio Synthesizer (audio.js) - Zero audio files / 100% synthesized in real time: - Mechanical Vernier relay ticks on gear rotation. - Generative sub-bass ambient drone modulated by 4D rotation speed. - Frequency Modulation (FM) crystal chimes on UI interactions. - Warp whoosh filter sweeps during scene transitions. - Real-Time FFT Spectrum Analyser: Circular audio oscilloscope rendered directly into the gimbal HUD ring.

---

## Keyboard Shortcuts

| Key | Action | |-----|--------| | Space | Play / Pause Timeline | | 1 – 5 | Jump to Scene (Tesseract, Gimbal, Ribbons, Singularity, Symphony) | | M | Toggle Procedural Synthesizer Sound | | S | Capture 4K Ultra-HD Snapshot (PNG) | | R | Record Live Motion Reel (WebM Video) | | H | Toggle HUD / Dock Overlays (Clean Cinema View) | | F | Fullscreen Mode | | Click / Drag | Orbit 3D Camera / Trigger Singularity Shockwave | | Scroll / Wheel | Zoom In / Out |

---

## Quick Start

### Option 1: Native Local Server bash<span data-diff-end="74"></span> <span data-diff-start="75"></span>python3 -m http.server 3000<span data-diff-end="75"></span> <span data-diff-start="76"></span> Then open http://localhost:3000 in any modern web browser.

### Option 2: Vite Dev Server bash<span data-diff-end="80"></span> <span data-diff-start="81"></span>npm install<span data-diff-end="81"></span> <span data-diff-start="82"></span>npm run dev<span data-diff-end="82"></span> <span data-diff-start="83"></span>

---

## Architecture

<span data-diff-end="89"></span> <span data-diff-start="90"></span>├── index.html # Main application interface with cyber-glassmorphism HUD<span data-diff-end="90"></span> <span data-diff-start="91"></span>├── package.json # Node scripts & Vite configuration<span data-diff-end="91"></span> <span data-diff-start="92"></span>├── README.md # Technical documentation<span data-diff-end="92"></span> <span data-diff-start="93"></span>└── src/<span data-diff-end="93"></span> <span data-diff-start="94"></span> ├── css/<span data-diff-end="94"></span> <span data-diff-start="95"></span> │ └── style.css # CSS custom properties, glassmorphism, responsive HUD<span data-diff-end="95"></span> <span data-diff-start="96"></span> └── js/<span data-diff-end="96"></span> <span data-diff-start="97"></span> ├── app.js # Orchestrator, keybindings, event loops<span data-diff-end="97"></span> <span data-diff-start="98"></span> ├── audio.js # Procedural Web Audio API synth & FFT spectrum<span data-diff-end="98"></span> <span data-diff-start="99"></span> ├── bezier.js # Interactive Bézier editor & Newton-Raphson solver<span data-diff-end="99"></span> <span data-diff-start="100"></span> ├── camera.js # 3D spherical orbit camera with inertial damping<span data-diff-end="100"></span> <span data-diff-start="101"></span> ├── engine.js # HiDPI render loop, scene compositor, video recorder<span data-diff-end="101"></span> <span data-diff-start="102"></span> ├── geometry4d.js # 4D Tesseract, Orthoplex, rotation matrices<span data-diff-end="102"></span> <span data-diff-start="103"></span> ├── hud.js # Precision gimbal dials, mechanical iris, telemetry<span data-diff-end="103"></span> <span data-diff-start="104"></span> ├── particles.js # 14,000 particle curl-noise singularity field<span data-diff-end="104"></span> <span data-diff-start="105"></span> ├── ribbons.js # 3D harmonic Lissajous wave ribbons<span data-diff-end="105"></span> <span data-diff-start="106"></span> ├── themes.js # Color palettes & shader grading<span data-diff-end="106"></span> <span data-diff-start="107"></span> └── typography.js # Kinetic matrix typography & glitch slicing<span data-diff-end="107"></span> <span data-diff-start="108"></span>