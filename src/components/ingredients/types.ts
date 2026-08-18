/**
 * Ingredients (مكونات المنتج) — type definitions.
 *
 * One product cut-out standing in the middle of the section with its
 * ingredients / notes arranged around it, in one of two layouts:
 *
 * - `columns` — two flanking columns. Each ingredient is a small stack of its
 *   own: a name, a hairline connector, and a transparent cut-out. The connector
 *   always bends toward the product, so the composition reads as one exploded
 *   diagram of what is inside the bottle.
 * - `circle` — a thin ring orbiting the product, ingredients sitting on it with
 *   a dot marking each one's spot on the line. Here the ring IS the connector,
 *   so the per-ingredient hairline is not drawn.
 *
 * Placement is PHYSICAL (left/right of the product, never flipped by RTL), the
 * same convention `product-features` uses for its cards and
 * `interactive-product` uses for its hotspots: an ingredient stays on the side
 * the merchant put it on whatever the store language is. `side` carries over
 * into the circle layout as the HALF of the ring an ingredient orbits in, so
 * switching layouts preserves the arrangement instead of reshuffling it.
 *
 * With no product image the two columns collapse into a plain responsive grid,
 * so a half-configured section still renders something sensible.
 */

import type { MaybeMultiLang } from "../../shared/types";
import type { SectionSpacingFields } from "../../shared/section-spacing";

/** How the ingredients are arranged around the product. */
export type IngredientLayout = "columns" | "circle";

/**
 * Physical column an ingredient sits in, relative to the product — and, in the
 * circle layout, which half of the ring it orbits in.
 */
export type IngredientSide = "right" | "left";

/** Type / image scale tier of the ingredients. */
export type IngredientSize = "sm" | "md" | "lg";
/** Desktop override; "inherit" reuses the mobile TIER, not its pixel size. */
export type IngredientSizeDesktop = IngredientSize | "inherit";

/** Where the ingredient's name sits relative to its picture. */
export type IngredientLabelPosition = "above" | "below";

/**
 * Circle layout only. `auto` follows the ring: names above for ingredients in
 * the top half, below for the bottom half, which is what keeps them clear of
 * the line.
 */
export type IngredientLabelPositionCircle = IngredientLabelPosition | "auto";

/** How the name is aligned over its picture, in the columns layout. */
export type IngredientLabelAlign = "center" | "toward";

/** How the name is aligned over its picture, in the circle layout. */
export type IngredientLabelAlignCircle = "center" | "outward";

/** Shape of the hairline joining a name to its picture. */
export type IngredientConnector = "curved" | "straight" | "none";

/** Stroke of the ring the ingredients orbit. */
export type IngredientRingStyle = "solid" | "dashed" | "dotted" | "none";

/** Widest the whole composition may get, in px. */
export type IngredientStageMaxWidth = string | number;

/** One ingredient. */
export interface IngredientItem {
  /** Ingredient name, e.g. «خشب الصندل». */
  name?: MaybeMultiLang;
  /** Transparent cut-out of the ingredient. */
  image?: string;
  /**
   * Physical column, relative to the product. Dropdowns arrive from the panel
   * as `[{ label, value }]`; resolve with `_pickValue`.
   */
  side?: IngredientSide | Array<{ value?: string }> | string;
  /** Vertical nudge as a percentage of the ingredient's own height. */
  offset_y?: number | string;
  /** Per-ingredient size tweak, as a percentage of the resolved size tier. */
  image_scale?: number | string;
  /**
   * Circle layout only: degrees to nudge this ingredient along the ring, from
   * the spot auto-distribution gave it. A nudge rather than an absolute angle
   * so the default (0) always lands somewhere sensible — a collection number
   * field cannot express "unset".
   */
  angle_offset?: number | string;
}

export interface IngredientsConfig extends SectionSpacingFields {
  /** This section's anchor id, so hero nav links can target it. */
  anchor_id?: string;

  // --- Header ---
  section_title?: MaybeMultiLang;
  section_subtitle?: MaybeMultiLang;

  // --- Product shot ---
  product_image?: string;
  product_image_alt?: MaybeMultiLang;
  /**
   * Optical-centring nudge, as a percentage of the product image's own size.
   *
   * Centring the image BOX is not the same as centring what the eye reads as
   * the product: a cut-out with a shadow baked into one side has its visual
   * mass off to the other. No automatic rule gets this right for an arbitrary
   * upload, so the merchant corrects it by eye. Percent-of-own-size means the
   * correction survives any change to the width settings.
   *
   * ⚠️ On X, POSITIVE means LEFT — the opposite of the CSS axis. The merchant
   * panel is RTL and an RTL range input puts its minimum at the right end, so
   * this is what makes the product track the slider handle rather than mirror
   * it. The style sheet negates it; see the RTL slider note in CLAUDE.md.
   * Y is unflipped (negative = up), matching `IngredientItem.offset_y`.
   */
  product_offset_x?: number | string;
  product_offset_y?: number | string;

  // --- Content ---
  items?: IngredientItem[];

  // --- Layout (shared) ---
  layout?: IngredientLayout;
  item_size?: IngredientSize;
  item_size_desktop?: IngredientSizeDesktop;
  stage_max_width?: IngredientStageMaxWidth;

  // --- Layout: columns ---
  product_width?: number | string;
  /** Gates the desktop product width; a slider always carries a value, so the
      "leave it blank to inherit" trick cannot work on one. */
  desktop_custom_width?: boolean;
  product_width_desktop?: number | string;
  row_gap?: number | string;
  column_gap?: number | string;
  label_position?: IngredientLabelPosition;
  label_align?: IngredientLabelAlign;

  // --- Layout: circle ---
  /** All the circle measurements are percentages of the square stage's width,
      which is what lets the whole composition scale with no resize listener. */
  circle_product_width?: number | string;
  circle_desktop_custom?: boolean;
  circle_product_width_desktop?: number | string;
  /** Ring DIAMETER, so it reads on the same scale as the other widths. */
  ring_size?: number | string;
  ring_size_desktop?: number | string;
  /** Diameter of the circle the ingredients themselves sit on. Slightly wider
      than the ring puts them just outside the line, as in the reference. */
  orbit_size?: number | string;
  orbit_size_desktop?: number | string;
  /** Angle of the first ingredient on each side, clockwise from 12 o'clock. */
  circle_start_angle?: number | string;
  /** Degrees between the first and last ingredient on the same side. */
  circle_arc_span?: number | string;
  circle_label_position?: IngredientLabelPositionCircle;
  circle_label_align?: IngredientLabelAlignCircle;

  // --- Connector (columns) ---
  connector_style?: IngredientConnector;
  connector_width?: number | string;
  connector_dot?: boolean;

  // --- Ring (circle) ---
  ring_style?: IngredientRingStyle;
  ring_width?: number | string;
  ring_dot?: boolean;
  ring_dot_size?: number | string;
  /** Degrees around the arc between an ingredient and its bead on the ring. */
  ring_dot_offset?: number | string;

  // --- Motion ---
  enable_entrance_anim?: boolean;

  // --- Colors ---
  bg_color?: string;
  title_color?: string;
  subtitle_color?: string;
  label_color?: string;
  connector_color?: string;
  ring_color?: string;
}
