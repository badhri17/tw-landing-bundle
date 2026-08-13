/**
 * عنصر بصري جانبي — Side Design Element.
 *
 * A decorative image (usually a transparent PNG: a bottle, a leaf, a flower, a
 * swatch of fabric) parked against one edge of a section and allowed to hang
 * partly outside it, for an editorial layered look.
 *
 * Self-contained on purpose: the FAQ and other sections are expected to want the
 * same option later, so nothing here reaches into the gallery. Promoting it to
 * `src/shared/` when a second component adopts it is a file move, not a rewrite
 * — the only gallery-specific thing is the `--se-*` prefix.
 *
 * Placement is expressed entirely through custom properties so the mobile and
 * desktop arrangements can be swapped in a media query. Vertical placement in
 * particular is two numbers rather than an attribute (`top` + a translate that
 * pulls the element back by its own height), because an attribute cannot change
 * at a breakpoint but a variable can.
 */

/** Physical edge of the section the element hugs. Never flipped by RTL. */
export type SideElementSide = "left" | "right";

/** Vertical anchor within the section. */
export type SideElementVPos = "top" | "center" | "bottom";
/** Desktop override; "inherit" reuses the mobile anchor. */
export type SideElementVPosDesktop = SideElementVPos | "inherit";

/** Whether the decoration sits behind the content or over it. */
export type SideElementDepth = "behind" | "front";

/** The merchant-facing fields, mixed into a component's own config. */
export interface SideElementFields {
  side_image?: string;
  side_side?: SideElementSide;
  side_depth?: SideElementDepth;
  /** 0–100; 100 = fully opaque. */
  side_opacity?: number | string;

  // --- Mobile (primary) ---
  /** Width as a % of the section's width. */
  side_width?: number | string;
  side_vpos?: SideElementVPos;
  /** Horizontal nudge, % of its own width. Positive pushes it further OUT of
      the section, negative tucks it in. Mirrored automatically per side. */
  side_x?: number | string;
  /** Vertical nudge, % of its own height. Positive moves it down. */
  side_y?: number | string;

  // --- Desktop (optional) ---
  /** Master switch: off → desktop reuses every mobile value. */
  side_desktop_custom?: boolean;
  side_width_desktop?: number | string;
  side_vpos_desktop?: SideElementVPosDesktop;
  side_x_desktop?: number | string;
  side_y_desktop?: number | string;
}

/** `top` / translate pair that realises each vertical anchor. */
const V_ANCHOR: Record<SideElementVPos, { top: string; pull: string }> = {
  top: { top: "0%", pull: "0%" },
  center: { top: "50%", pull: "-50%" },
  bottom: { top: "100%", pull: "-100%" },
};

export interface SideElementResolved {
  /** "" when the merchant uploaded no image — render nothing. */
  image: string;
  side: SideElementSide;
  depth: SideElementDepth;
  /** Custom-property declarations for the SECTION element. */
  vars: string[];
}

/**
 * Resolve the merchant's values into custom properties.
 *
 * `pick` / `num` are passed in rather than imported so this module stays free of
 * any base-class dependency — they are `GrowthElement._pickValue` / `._num`.
 */
export function resolveSideElement(
  cfg: SideElementFields | undefined,
  pick: <T extends string>(v: unknown, fallback: T) => T,
  num: (v: unknown, fallback: number) => number
): SideElementResolved | null {
  const image = (cfg?.side_image || "").trim();
  if (!image) return null;

  const side = pick<SideElementSide>(cfg?.side_side, "right");
  const depth = pick<SideElementDepth>(cfg?.side_depth, "front");

  /**
   * The desktop placement is behind a switch rather than a set of blank-means-
   * inherit fields. Sliders always carry a value, so "blank" stopped being
   * expressible the moment these became sliders — the switch is what says
   * "desktop differs" now.
   */
  const custom = cfg?.side_desktop_custom === true;

  const vposM = pick<SideElementVPos>(cfg?.side_vpos, "top");
  const vposDRaw = pick<SideElementVPosDesktop>(cfg?.side_vpos_desktop, "inherit");
  const vposD = !custom || vposDRaw === "inherit" ? vposM : vposDRaw;

  const widthM = num(cfg?.side_width, 45);
  const widthD = custom ? num(cfg?.side_width_desktop, widthM) : widthM;

  const xM = num(cfg?.side_x, 20);
  const xD = custom ? num(cfg?.side_x_desktop, xM) : xM;

  const yM = num(cfg?.side_y, 0);
  const yD = custom ? num(cfg?.side_y_desktop, yM) : yM;

  const a = V_ANCHOR[vposM] ?? V_ANCHOR.top;
  const b = V_ANCHOR[vposD] ?? V_ANCHOR.top;

  return {
    image,
    side,
    depth,
    vars: [
      `--se-w-m:${widthM}%`,
      `--se-w-d:${widthD}%`,
      `--se-x-m:${xM}%`,
      `--se-x-d:${xD}%`,
      `--se-y-m:${yM}%`,
      `--se-y-d:${yD}%`,
      `--se-top-m:${a.top}`,
      `--se-top-d:${b.top}`,
      `--se-pull-m:${a.pull}`,
      `--se-pull-d:${b.pull}`,
      `--se-op:${Math.max(0, Math.min(100, num(cfg?.side_opacity, 100))) / 100}`,
    ],
  };
}
