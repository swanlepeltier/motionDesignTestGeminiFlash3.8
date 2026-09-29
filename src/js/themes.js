/**
 * Color Themes & Cinematic Shader Palettes
 */

export const THEMES = {
  cyber_core: {
    id: "cyber_core",
    name: "Cyber Core",
    bg: "#05070d",
    cardBg: "rgba(8, 12, 22, 0.75)",
    border: "rgba(0, 240, 255, 0.25)",
    accent: "#00f0ff",
    secondary: "rgba(0, 240, 255, 0.45)",
    tertiary: "#ff007f",
    textMain: "#ffffff",
    textMuted: "rgba(255, 255, 255, 0.6)",
    irisFill: "rgba(0, 240, 255, 0.05)",
    irisStroke: "rgba(0, 240, 255, 0.35)",

    get4DEdgeColor(normW, alpha) {
      // Interpolate from deep electric violet to radiant cyan
      const r = Math.floor(180 * (1 - normW));
      const g = Math.floor(60 + 195 * normW);
      const b = 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    getNodeGlowColor(normW) {
      return normW > 0.5 ? "rgba(0, 240, 255, 0.4)" : "rgba(255, 0, 128, 0.35)";
    },

    getSpectrumColor(val) {
      return val > 0.6 ? "#ff007f" : "#00f0ff";
    },

    getRibbonFill(t, ribbonIdx, time) {
      const hue = (t * 180 + time * 30 + ribbonIdx * 120) % 360;
      return `hsla(${hue}, 90%, 55%, 0.18)`;
    },

    getRibbonStroke(t, ribbonIdx) {
      return ribbonIdx === 0
        ? "#00f0ff"
        : ribbonIdx === 1
          ? "#ff007f"
          : "#ffe600";
    },

    getParticleColor(speed, seed) {
      if (speed > 2.8) return "#ffffff";
      if (seed > 0.7) return "#ff007f";
      if (seed > 0.3) return "#00f0ff";
      return "#3b82f6";
    },
  },

  solaris_gold: {
    id: "solaris_gold",
    name: "Solar Horology",
    bg: "#080705",
    cardBg: "rgba(18, 15, 10, 0.75)",
    border: "rgba(255, 185, 45, 0.25)",
    accent: "#ffb92d",
    secondary: "rgba(255, 185, 45, 0.45)",
    tertiary: "#ff5500",
    textMain: "#fff3db",
    textMuted: "rgba(255, 243, 219, 0.6)",
    irisFill: "rgba(255, 185, 45, 0.06)",
    irisStroke: "rgba(255, 185, 45, 0.35)",

    get4DEdgeColor(normW, alpha) {
      const r = 255;
      const g = Math.floor(140 + 80 * normW);
      const b = Math.floor(40 + 60 * (1 - normW));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    getNodeGlowColor(normW) {
      return normW > 0.5
        ? "rgba(255, 200, 50, 0.45)"
        : "rgba(255, 100, 20, 0.35)";
    },

    getSpectrumColor(val) {
      return val > 0.6 ? "#ff5500" : "#ffb92d";
    },

    getRibbonFill(t, ribbonIdx, time) {
      const hue = (35 + t * 45 + Math.sin(time) * 15) % 360;
      return `hsla(${hue}, 95%, 52%, 0.16)`;
    },

    getRibbonStroke(t, ribbonIdx) {
      return ribbonIdx === 0
        ? "#ffb92d"
        : ribbonIdx === 1
          ? "#ffe89e"
          : "#ff6a00";
    },

    getParticleColor(speed, seed) {
      if (speed > 2.8) return "#ffffff";
      if (seed > 0.6) return "#ffb92d";
      if (seed > 0.3) return "#ff7a18";
      return "#9c5b16";
    },
  },

  tokyo_matrix: {
    id: "tokyo_matrix",
    name: "Tokyo Matrix",
    bg: "#040b07",
    cardBg: "rgba(6, 18, 12, 0.75)",
    border: "rgba(0, 255, 140, 0.25)",
    accent: "#00ff8c",
    secondary: "rgba(0, 255, 140, 0.45)",
    tertiary: "#00e5ff",
    textMain: "#e6fffa",
    textMuted: "rgba(230, 255, 250, 0.6)",
    irisFill: "rgba(0, 255, 140, 0.05)",
    irisStroke: "rgba(0, 255, 140, 0.35)",

    get4DEdgeColor(normW, alpha) {
      const r = Math.floor(20 + 40 * (1 - normW));
      const g = 255;
      const b = Math.floor(120 + 135 * normW);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    getNodeGlowColor(normW) {
      return normW > 0.5
        ? "rgba(0, 255, 140, 0.45)"
        : "rgba(0, 229, 255, 0.35)";
    },

    getSpectrumColor(val) {
      return val > 0.6 ? "#00e5ff" : "#00ff8c";
    },

    getRibbonFill(t, ribbonIdx, time) {
      const hue = (130 + t * 50 + time * 20) % 360;
      return `hsla(${hue}, 90%, 48%, 0.17)`;
    },

    getRibbonStroke(t, ribbonIdx) {
      return ribbonIdx === 0
        ? "#00ff8c"
        : ribbonIdx === 1
          ? "#00e5ff"
          : "#a3ff00";
    },

    getParticleColor(speed, seed) {
      if (speed > 2.8) return "#ffffff";
      if (seed > 0.6) return "#00ff8c";
      if (seed > 0.3) return "#00e5ff";
      return "#0f766e";
    },
  },

  swiss_monochrome: {
    id: "swiss_monochrome",
    name: "Swiss Monochrome",
    bg: "#08080a",
    cardBg: "rgba(18, 18, 22, 0.8)",
    border: "rgba(255, 255, 255, 0.22)",
    accent: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.45)",
    tertiary: "#999999",
    textMain: "#ffffff",
    textMuted: "rgba(255, 255, 255, 0.55)",
    irisFill: "rgba(255, 255, 255, 0.04)",
    irisStroke: "rgba(255, 255, 255, 0.3)",

    get4DEdgeColor(normW, alpha) {
      const v = Math.floor(160 + 95 * normW);
      return `rgba(${v}, ${v}, ${v}, ${alpha})`;
    },

    getNodeGlowColor(normW) {
      return "rgba(255, 255, 255, 0.35)";
    },

    getSpectrumColor(val) {
      return val > 0.6 ? "#ffffff" : "rgba(255, 255, 255, 0.5)";
    },

    getRibbonFill(t, ribbonIdx, time) {
      const lum = 40 + Math.sin(t * 4 + time) * 30;
      return `hsla(0, 0%, ${lum}%, 0.14)`;
    },

    getRibbonStroke(t, ribbonIdx) {
      return ribbonIdx === 0
        ? "#ffffff"
        : ribbonIdx === 1
          ? "#cccccc"
          : "#777777";
    },

    getParticleColor(speed, seed) {
      if (speed > 2.5) return "#ffffff";
      if (seed > 0.5) return "#d4d4d8";
      return "#71717a";
    },
  },
};
