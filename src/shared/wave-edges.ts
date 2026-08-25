/**
 * تموج الحواف — wavy section edges.
 *
 * Cuts the top and/or the bottom edge of a section into a curve instead of a
 * straight line, so a coloured section reads as floating between its
 * neighbours rather than butting against them.
 *
 * The cut is a **CSS mask over the section's background layer**, not an SVG
 * shape painted on top of the edge. Three things follow from that, and they are
 * the reason to keep it this way:
 *
 *  1. The cut is genuinely transparent, so it works over any page background
 *    without the merchant naming a second colour — and a background photo on
 *    the same layer is cut by the same curve for free. A painted divider needs
 *    a colour before it can show anything, which is a field that goes wrong the
 *    moment the page behind it changes.
 *  2. The mask rides a `::before` layer rather than the section itself, so a
 *    decoration that deliberately bleeds outside the section (gallery's side
 *    element, its edge-to-edge strip) is untouched. Masking the section would
 *    erase everything outside its box.
 *  3. Because the section's own background is then free, `wave_behind_color`
 *    is just that background: it shows through the cut with no extra element.
 *
 * The consumer owns the CSS. Copy the `[data-wave="on"]` block out of an
 * existing adopter — it is identical everywhere except for which background
 * properties the masked layer inherits.
 *
 * Like `side-element.ts`, this takes `pick` as an argument rather than
 * importing the base class, and its custom properties are deliberately
 * un-prefixed (`--wv-*`): every component renders into its own shadow root, so
 * there is nothing to collide with and the CSS is identical in each one.
 */

/** Which edges get cut. */
export type WaveEdges = "off" | "top" | "bottom" | "both";

/** The curve drawn along a waved edge. */
export type WaveShape = "wave" | "double" | "arc";

/** How deep the wave bites into the section. */
export type WaveHeight = "sm" | "md" | "lg";
export type WaveHeightDesktop = WaveHeight | "inherit";

/** The merchant fields every adopter exposes, verbatim. */
export interface WaveEdgeFields {
  wave_edges?: WaveEdges | Array<{ value?: string }> | string;
  wave_shape?: WaveShape | Array<{ value?: string }> | string;
  wave_height_mobile?: WaveHeight | Array<{ value?: string }> | string;
  wave_height_desktop?:
    | WaveHeightDesktop
    | Array<{ value?: string }>
    | string;
  /** Painted inside the cut; empty leaves it transparent. */
  wave_behind_color?: string;
}

export interface WaveEdgesResolved {
  /** At least one edge is waved — drives the section's `data-wave`. */
  on: boolean;
  /** Custom properties for the section's inline style. */
  vars: string[];
}

/**
 * Each path is the KEEP region of a TOP edge inside a 1440x100 box: the curve
 * itself, then down the right side, along the bottom and back — so everything
 * above the curve is what gets cut away. The box is stretched to the section's
 * width with preserveAspectRatio="none", which is why one path serves every
 * viewport, and why the bottom edge is the same path turned 180 degrees rather
 * than a second drawing to keep in sync.
 */
const WAVE_PATHS: Record<WaveShape, string> = {
  wave: "M0,62 C240,14 480,14 720,46 C960,78 1200,80 1440,30 V100 H0 Z",
  double:
    "M0,50 C120,10 240,10 360,50 C480,90 600,90 720,50 C840,10 960,10 1080,50 C1200,90 1320,90 1440,50 V100 H0 Z",
  arc: "M0,84 C480,4 960,4 1440,84 V100 H0 Z",
};

/** Mobile is the concrete scale... */
const HEIGHT_MOBILE: Record<WaveHeight, number> = { sm: 22, md: 34, lg: 50 };
/** ...and the same tier means more on a desktop-wide section (relative tiers). */
const HEIGHT_DESKTOP: Record<WaveHeight, number> = { sm: 44, md: 68, lg: 100 };

/**
 * Wrap a wave path into a mask-image url(). `flip` turns it 180 degrees around
 * the box centre, which mirrors it on both axes at once: the bottom edge then
 * curves the opposite way to the top one instead of looking like a photocopy.
 */
function waveMask(path: string, flip: boolean): string {
  const transform = flip ? ` transform="rotate(180 720 50)"` : "";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" ` +
    `preserveAspectRatio="none"><path d="${path}" fill="#000"${transform}/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Resolve the merchant's values into the custom properties the mask reads.
 *
 * `pick` is passed in rather than imported so this module stays free of any
 * base-class dependency — it is `GrowthElement._pickValue`.
 */
export function resolveWaveEdges(
  cfg: WaveEdgeFields | undefined,
  pick: <T extends string>(v: unknown, fallback: T) => T,
): WaveEdgesResolved {
  const edges = pick<WaveEdges>(cfg?.wave_edges, "off");
  const top = edges === "top" || edges === "both";
  const bottom = edges === "bottom" || edges === "both";
  if (!top && !bottom) return { on: false, vars: [] };

  const shape = pick<WaveShape>(cfg?.wave_shape, "wave");
  const path = WAVE_PATHS[shape] || WAVE_PATHS.wave;

  const hm = pick<WaveHeight>(cfg?.wave_height_mobile, "md");
  const hdRaw = pick<WaveHeightDesktop>(cfg?.wave_height_desktop, "inherit");
  // A relative tier: "inherit" carries the mobile TIER across, then resolves
  // through the larger desktop table — not the mobile pixels.
  const hd = hdRaw === "inherit" ? hm : hdRaw;
  const mobile = HEIGHT_MOBILE[hm] ?? HEIGHT_MOBILE.md;
  const desktop = HEIGHT_DESKTOP[hd] ?? HEIGHT_DESKTOP.md;

  const behind = (cfg?.wave_behind_color || "").trim();

  return {
    on: true,
    vars: [
      top ? `--wv-top-img:${waveMask(path, false)}` : "",
      bottom ? `--wv-bot-img:${waveMask(path, true)}` : "",
      `--wv-top-m:${top ? mobile : 0}px`,
      `--wv-top-d:${top ? desktop : 0}px`,
      `--wv-bot-m:${bottom ? mobile : 0}px`,
      `--wv-bot-d:${bottom ? desktop : 0}px`,
      behind ? `--wv-behind:${behind}` : "",
    ].filter(Boolean),
  };
}
