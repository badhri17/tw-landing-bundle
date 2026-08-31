/**
 * عنصر بصري جانبي — Side Design Element.
 *
 * A decorative image (usually a transparent PNG: a bottle, a leaf, a flower, a
 * swatch of fabric) parked against one edge of a section and allowed to hang
 * partly outside it, for an editorial layered look.
 *
 * Shared by `gallery` and `faq`. It reaches into neither: `pick` / `num` arrive
 * as arguments rather than through `GrowthElement`, so this module has no
 * base-class dependency and each component owns the CSS that consumes the
 * `--se*-…` properties it returns (`.gal-side`, `.faq-side`).
 *
 * ⚠️ It lives in `src/shared/`, so `duplicateSharedPerComponentPlugin` inlines a
 * private copy per component. Never give it module-level state expecting it to
 * be shared across components — at runtime there is no single instance.
 *
 * Placement is expressed entirely through custom properties so the mobile and
 * desktop arrangements can be swapped in a media query. Vertical placement in
 * particular is two numbers rather than an attribute (`top` + a translate that
 * pulls the element back by its own height), because an attribute cannot change
 * at a breakpoint but a variable can.
 */

/** Physical horizontal placement within the section. Never flipped by RTL. */
export type SideElementSide = "left" | "center" | "right";

/** Vertical anchor within the section. */
export type SideElementVPos = "top" | "center" | "bottom";
/** Desktop override; "inherit" reuses the mobile anchor. */
export type SideElementVPosDesktop = SideElementVPos | "inherit";

/** Whether the decoration sits behind the content or over it. */
export type SideElementDepth = "behind" | "front";

/** The merchant-facing fields, mixed into a component's own config. */
export interface SideElementFields {
  side_visual_count?: "off" | "one" | "two";
  enable_side_visual?: boolean;
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

  enable_second_side_visual?: boolean;
  side2_image?: string;
  side2_side?: SideElementSide;
  side2_depth?: SideElementDepth;
  side2_opacity?: number | string;
  side2_width?: number | string;
  side2_vpos?: SideElementVPos;
  side2_x?: number | string;
  side2_y?: number | string;
  side2_desktop_custom?: boolean;
  side2_width_desktop?: number | string;
  side2_vpos_desktop?: SideElementVPosDesktop;
  side2_x_desktop?: number | string;
  side2_y_desktop?: number | string;
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
  slot: 1 | 2;
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
  num: (v: unknown, fallback: number) => number,
  slot: 1 | 2 = 1,
): SideElementResolved | null {
  const rawMode = cfg?.side_visual_count;
  const mode =
    rawMode == null ? undefined : pick<"off" | "one" | "two">(rawMode, "off");
  const legacyFirstImage = (cfg?.side_image || "").trim();
  const firstEnabled = mode
    ? mode !== "off"
    : cfg?.enable_side_visual === true ||
      (cfg?.enable_side_visual == null && !!legacyFirstImage);
  const enabled =
    slot === 1
      ? firstEnabled
      : mode
        ? mode === "two"
        : firstEnabled && cfg?.enable_second_side_visual === true;
  if (!enabled) return null;

  const image = (
    slot === 1 ? cfg?.side_image || "" : cfg?.side2_image || ""
  ).trim();
  if (!image) return null;

  const side = pick<SideElementSide>(
    slot === 1 ? cfg?.side_side : cfg?.side2_side,
    slot === 1 ? "right" : "left",
  );
  const depth = pick<SideElementDepth>(
    slot === 1 ? cfg?.side_depth : cfg?.side2_depth,
    "front",
  );

  /** New count-based configs expose desktop values directly. Some preview
   * environments omit dropdown defaults until the editor is saved, while still
   * passing the desktop numeric values. Treat those explicit values as an
   * enabled desktop override so the preview matches the configured example. */
  const desktopValues =
    slot === 1
      ? [
          cfg?.side_width_desktop,
          cfg?.side_vpos_desktop,
          cfg?.side_x_desktop,
          cfg?.side_y_desktop,
        ]
      : [
          cfg?.side2_width_desktop,
          cfg?.side2_vpos_desktop,
          cfg?.side2_x_desktop,
          cfg?.side2_y_desktop,
        ];
  const hasDesktopValues = desktopValues.some(
    (value) => value !== undefined && value !== null && value !== "",
  );
  const custom = mode
    ? true
    : (slot === 1 ? cfg?.side_desktop_custom : cfg?.side2_desktop_custom) ===
        true || hasDesktopValues;

  const vposM = pick<SideElementVPos>(
    slot === 1 ? cfg?.side_vpos : cfg?.side2_vpos,
    slot === 1 ? "top" : "bottom",
  );
  const vposDRaw = pick<SideElementVPosDesktop>(
    slot === 1 ? cfg?.side_vpos_desktop : cfg?.side2_vpos_desktop,
    "inherit",
  );
  const vposD = !custom || vposDRaw === "inherit" ? vposM : vposDRaw;

  const widthM = num(slot === 1 ? cfg?.side_width : cfg?.side2_width, 45);
  const widthD = custom
    ? num(
        slot === 1 ? cfg?.side_width_desktop : cfg?.side2_width_desktop,
        widthM,
      )
    : widthM;

  const xM = num(slot === 1 ? cfg?.side_x : cfg?.side2_x, 20);
  const xD = custom
    ? num(slot === 1 ? cfg?.side_x_desktop : cfg?.side2_x_desktop, xM)
    : xM;

  const yM = num(slot === 1 ? cfg?.side_y : cfg?.side2_y, 0);
  const yD = custom
    ? num(slot === 1 ? cfg?.side_y_desktop : cfg?.side2_y_desktop, yM)
    : yM;

  const a = V_ANCHOR[vposM] ?? V_ANCHOR.top;
  const b = V_ANCHOR[vposD] ?? V_ANCHOR.top;

  return {
    image,
    side,
    depth,
    slot,
    vars: [
      `--se${slot}-w-m:${widthM}%`,
      `--se${slot}-w-d:${widthD}%`,
      `--se${slot}-x-m:${xM}%`,
      `--se${slot}-x-d:${xD}%`,
      `--se${slot}-y-m:${yM}%`,
      `--se${slot}-y-d:${yD}%`,
      `--se${slot}-top-m:${a.top}`,
      `--se${slot}-top-d:${b.top}`,
      `--se${slot}-pull-m:${a.pull}`,
      `--se${slot}-pull-d:${b.pull}`,
      `--se${slot}-op:${
        Math.max(
          0,
          Math.min(
            100,
            num(slot === 1 ? cfg?.side_opacity : cfg?.side2_opacity, 100),
          ),
        ) / 100
      }`,
    ],
  };
}
