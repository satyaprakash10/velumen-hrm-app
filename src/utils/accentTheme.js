/**
 * Accent theme
 * ---------------------------------------------------------------------------
 * A single accent can be selected from Settings → Appearance. It drives the
 * interactive surfaces across the app (primary buttons, active nav state,
 * focus rings, notification accents, landing CTAs…).
 *
 * Implementation is intentionally tiny: we stamp the selected accent on
 * `<html data-accent="…">` and publish a handful of CSS custom properties.
 * Components opt in via utility classes (`accent-bg`, `accent-ring`,
 * `accent-border`, `accent-text`, `accent-gradient`) which live in
 * `main.css`. This keeps the tokens portable without forcing a runtime
 * rewrite of every Tailwind class.
 */

const PALETTES = {
  sky: {
    from: "#0ea5e9",
    to: "#6366f1",
    fg: "#0284c7",
    soft: "rgba(14, 165, 233, 0.12)",
    ring: "rgba(14, 165, 233, 0.35)",
    contrast: "#ffffff",
  },
  violet: {
    from: "#a855f7",
    to: "#ec4899",
    fg: "#7c3aed",
    soft: "rgba(168, 85, 247, 0.14)",
    ring: "rgba(168, 85, 247, 0.35)",
    contrast: "#ffffff",
  },
  emerald: {
    from: "#10b981",
    to: "#14b8a6",
    fg: "#059669",
    soft: "rgba(16, 185, 129, 0.14)",
    ring: "rgba(16, 185, 129, 0.35)",
    contrast: "#ffffff",
  },
  amber: {
    from: "#f59e0b",
    to: "#f43f5e",
    fg: "#b45309",
    soft: "rgba(245, 158, 11, 0.16)",
    ring: "rgba(245, 158, 11, 0.4)",
    contrast: "#1a1306",
  },
  slate: {
    from: "#475569",
    to: "#0f172a",
    fg: "#334155",
    soft: "rgba(71, 85, 105, 0.18)",
    ring: "rgba(71, 85, 105, 0.4)",
    contrast: "#ffffff",
  },
};

export const ACCENT_OPTIONS = Object.keys(PALETTES);

export function applyAccent(name) {
  if (typeof document === "undefined") return;
  const key = PALETTES[name] ? name : "sky";
  const p = PALETTES[key];
  const root = document.documentElement;
  root.setAttribute("data-accent", key);
  root.style.setProperty("--accent-from", p.from);
  root.style.setProperty("--accent-to", p.to);
  root.style.setProperty("--accent-fg", p.fg);
  root.style.setProperty("--accent-soft", p.soft);
  root.style.setProperty("--accent-ring", p.ring);
  root.style.setProperty("--accent-contrast", p.contrast);
  root.style.setProperty(
    "--accent-gradient",
    `linear-gradient(90deg, ${p.from}, ${p.to})`,
  );
}

/**
 * Density is a one-knob scaler on the root font-size. Every Tailwind spacing
 * utility uses rem, so shrinking the root by ~12% gives compact layouts
 * tighter padding, smaller buttons, denser tables — without rewriting a
 * single component. Data attribute is also stamped on <html> for the odd
 * component that wants to opt in to compact-only tweaks.
 */
const DENSITY = {
  comfortable: { scale: 1, rootFontPx: 16, rowPadY: "0.75rem", tablePadY: "0.75rem" },
  compact: { scale: 0.9, rootFontPx: 14, rowPadY: "0.5rem", tablePadY: "0.5rem" },
};

export const DENSITY_OPTIONS = Object.keys(DENSITY);

export function applyDensity(name) {
  if (typeof document === "undefined") return;
  const key = DENSITY[name] ? name : "comfortable";
  const d = DENSITY[key];
  const root = document.documentElement;
  root.setAttribute("data-density", key);
  root.style.setProperty("--density-scale", String(d.scale));
  root.style.setProperty("--density-row-pad-y", d.rowPadY);
  root.style.setProperty("--density-table-pad-y", d.tablePadY);
  // Shrinking the root font scales every rem-based spacing utility at once,
  // which is exactly what density is supposed to do.
  root.style.fontSize = `${d.rootFontPx}px`;
}
