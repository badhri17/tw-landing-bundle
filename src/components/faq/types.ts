import type { MaybeMultiLang } from "../../shared/types";
import type { SideElementFields } from "../../shared/side-element";
import type { SectionSpacingFields } from "../../shared/section-spacing";

/** How many answers may stay open at once. */
export type FaqOpenMode = "single" | "multi";

/** The glyph in the question row's trigger. */
export type FaqIconStyle = "chevron" | "plus";

/** One row of the `items` collection. */
export interface FaqItem {
  question?: MaybeMultiLang;
  answer?: MaybeMultiLang;
}

/**
 * Merchant settings. `SideElementFields` is mixed in rather than nested because
 * Salla's form builder has no concept of a field group — every side-element
 * field is a top-level field on this component, exactly as in `gallery`.
 *
 * Dropdowns may arrive as a bare string or as `[{ value }]`, so every `items`
 * field widens to include the array shape; resolve with `_pickValue`.
 */
export interface FaqConfig extends SideElementFields, SectionSpacingFields {
  section_title?: MaybeMultiLang;
  section_subtitle?: MaybeMultiLang;
  items?: FaqItem[];

  open_mode?: FaqOpenMode | Array<{ value?: string }> | string;
  first_open?: boolean;
  icon_style?: FaqIconStyle | Array<{ value?: string }> | string;

  bg_color?: string;
  title_color?: string;
  subtitle_color?: string;
  card_bg?: string;
  question_color?: string;
  answer_color?: string;
  border_color?: string;
  icon_color?: string;
  card_radius?: number | string;

  enable_entrance_anim?: boolean;

  anchor_id?: string;
}
