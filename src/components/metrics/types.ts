/**
 * Metrics (الأرقام) — type definitions.
 *
 * A compact row of "proof numbers": +72 ساعة من الثبات · +98% رضا العملاء ·
 * +9,750 زجاجة مباعة. Each number counts up when the section scrolls into view.
 *
 * All fields are optional; the component ships with premium defaults.
 */

import type { MaybeMultiLang } from "../../shared/types";

/** Cards per row on mobile — mobile is the primary canvas. */
export type MetricsColumns = "1" | "2" | "3";
/** Desktop override; "inherit" reuses the mobile count. */
export type MetricsColumnsDesktop = "inherit" | "2" | "3" | "4" | "5" | "6";

/** Visual treatment of each metric. */
export type MetricsCardStyle =
  | "soft" // filled pill (the default look)
  | "outline" // hairline border, transparent fill
  | "divided" // borderless cells separated by hairlines
  | "plain"; // no card at all — numbers floating on the section background

/** Number scale. */
export type MetricsSize = "sm" | "md" | "lg";

/** Count-up duration tier. */
export type MetricsCountSpeed = "fast" | "normal" | "slow";

/** Numeral system used to render the value. */
export type MetricsDigits = "latin" | "arabic";

/** Corner roundness in px (resolved as a number; 999 = full pill). */
export type MetricsCardRadius = string | number;

/** One metric. */
export interface MetricItem {
  /** The number itself, e.g. "9750" or "4.9". Non-numeric text renders as-is. */
  value?: string | number;
  /** Glyph before the number, e.g. "+". */
  prefix?: string;
  /** Glyph or word after the number, e.g. "%" or "ك". */
  suffix?: string;
  /** Caption under the number. */
  label?: MaybeMultiLang;
}

export interface MetricsConfig {
  /** This section's anchor id, so hero nav links can target it. */
  anchor_id?: string;

  // --- Header (both optional; empty by default) ---
  section_title?: MaybeMultiLang;
  section_subtitle?: MaybeMultiLang;

  // --- Content ---
  items?: MetricItem[];

  // --- Layout ---
  columns_mobile?: MetricsColumns;
  columns_desktop?: MetricsColumnsDesktop;
  card_style?: MetricsCardStyle;
  card_radius?: MetricsCardRadius;
  number_size?: MetricsSize;

  // --- Number formatting ---
  thousands_separator?: boolean;
  digits?: MetricsDigits;

  // --- Motion ---
  enable_count?: boolean;
  count_speed?: MetricsCountSpeed;
  enable_entrance_anim?: boolean;

  // --- Colors ---
  bg_color?: string;
  card_bg?: string;
  number_color?: string;
  label_color?: string;
  border_color?: string;
}
