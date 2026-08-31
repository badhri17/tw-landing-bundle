import type { MaybeMultiLang } from "../../shared/types";
import type { SideElementFields } from "../../shared/side-element";
import type { SectionSpacingFields } from "../../shared/section-spacing";

/**
 * Where the headline sits. "in_table" puts it in the feature column's header
 * cell — the arrangement the section is built around, where the question and
 * the answers share one frame. "above" moves it out to a normal section
 * header when the merchant wants the table to read as a plain data block.
 */
export type ComparisonTitlePosition = "in_table" | "above" | "hidden";

/** How a yes/no cell is drawn. */
export type ComparisonMarkStyle = "plain" | "circle" | "solid";

/** Which compared column sits next to the feature column. */
export type ComparisonColumnOrder = "us_first" | "others_first";

/** Relative row-density tier; resolved through two tables, mobile and desktop. */
export type ComparisonDensity = "compact" | "normal" | "spacious";
export type ComparisonDensityDesktop = ComparisonDensity | "inherit";

/** Relative logo-size tier; likewise two tables. */
export type ComparisonLogoSize = "sm" | "md" | "lg";
export type ComparisonLogoSizeDesktop = ComparisonLogoSize | "inherit";

/**
 * One compared row.
 *
 * `us` / `others` are the yes-no answer. `us_text` / `others_text` override the
 * glyph with a short value ("سنتان", "٣ أيام") when the row is a measurement
 * rather than a yes-or-no — an empty override falls back to the mark, so the
 * two live together with no dropdown to switch between them.
 */
export interface ComparisonItem {
  text?: MaybeMultiLang;
  us?: boolean;
  others?: boolean;
  us_text?: MaybeMultiLang;
  others_text?: MaybeMultiLang;
}

/**
 * Merchant settings. `SideElementFields` and `SectionSpacingFields` are mixed
 * in rather than nested because Salla's form builder has no field groups —
 * every one of them is a top-level field, exactly as in `gallery` and `faq`.
 *
 * Dropdowns may arrive as a bare string or as `[{ value }]`, so every `items`
 * field widens to include the array shape; resolve with `_pickValue`.
 */
export interface ComparisonConfig
  extends SideElementFields, SectionSpacingFields {
  section_title?: MaybeMultiLang;
  section_subtitle?: MaybeMultiLang;
  title_position?: ComparisonTitlePosition | Array<{ value?: string }> | string;
  items?: ComparisonItem[];

  us_logo?: string;
  us_label?: MaybeMultiLang;
  others_label?: MaybeMultiLang;
  footnote?: MaybeMultiLang;

  column_order?: ComparisonColumnOrder | Array<{ value?: string }> | string;
  mark_style?: ComparisonMarkStyle | Array<{ value?: string }> | string;
  highlight_us?: boolean;
  row_stripes?: boolean;
  grid_lines?: boolean;

  density_mobile?: ComparisonDensity | Array<{ value?: string }> | string;
  full_width_mobile?: boolean;
  density_desktop?:
    ComparisonDensityDesktop | Array<{ value?: string }> | string;
  logo_size_mobile?: ComparisonLogoSize | Array<{ value?: string }> | string;
  logo_size_desktop?:
    ComparisonLogoSizeDesktop | Array<{ value?: string }> | string;

  table_radius?: number | string;

  bg_color?: string;
  title_color?: string;
  subtitle_color?: string;
  card_bg?: string;
  text_color?: string;
  border_color?: string;
  us_col_bg?: string;
  us_col_border?: string;
  others_color?: string;
  check_color?: string;
  cross_color?: string;
  footnote_color?: string;

  enable_entrance_anim?: boolean;

  /** Clear space above the table when a decorative image sits at the top. */
  side_top_clearance_mobile?: number | string;
  side_top_clearance_desktop?: number | string;

  anchor_id?: string;
}
