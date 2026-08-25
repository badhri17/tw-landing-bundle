/**
 * Growth Kit — Testimonials (آراء العملاء)
 * Type definitions for the Testimonials component configuration.
 *
 * A premium, heavily-configurable social-proof wall.
 *
 * Deliberately has no product linking: this bundle builds landing pages, where a
 * testimonial's job is social proof, not merchandising. Reviews stay pure text +
 * author + photo.
 *
 * All fields are optional; the component applies premium, layout-aware defaults.
 */

import type { SectionSpacingFields } from "../../shared/section-spacing";
import type { WaveEdgeFields } from "../../shared/wave-edges";

/** Value coming back from a Salla `multilanguage: true` field. */
export type MaybeMultiLang =
  | string
  | { ar?: string; en?: string }
  | null
  | undefined;

/** How the testimonials are arranged on the page. */
export type TestimonialsLayout = "carousel" | "grid";

/** Visual treatment / shape of each testimonial card. */
export type TestimonialCardStyle =
  | "modern" // UGC photo-led card: customer's product photo with a name chip overlaid
  | "quote"; // large quotation mark, text-forward

/** Column count tiers (also used as "cards per view" for the carousel). */
export type TestimonialsColumns = "1" | "2" | "3" | "4";
export type TestimonialsColumnsDesktop = TestimonialsColumns | "inherit";

/** How the rating is presented. */
export type TestimonialRatingStyle = "stars" | "stars-number" | "number";

/** Carousel autoplay cadence (seconds). */
export type TestimonialAutoplayDelay = "3" | "5" | "7" | "10";

/** Card image aspect ratio (the large photo in photo-led styles). */
export type TestimonialPhotoAspect = "1/1" | "2/3" | "3/4" | "4/5" | "5/7";

/** Which part of the section's background photo stays visible as it crops. */
export type TestimonialBgPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right";

/** Card corner roundness in px (resolved as a number). */
export type TestimonialCardRadius = string | number;

/** One testimonial entry. */
export interface TestimonialItem {
  // --- Author ---
  name?: MaybeMultiLang; // e.g. "تايلور" / "Taylor"
  meta?: MaybeMultiLang; // e.g. "33" or "الرياض" — rendered as "Name · meta"
  avatar?: string; // small round portrait (quote style)
  photo?: string; // customer's own product photo (UGC) — large image in the modern style

  // --- Review ---
  rating?: number | string; // 0–5, supports fractions (e.g. 4.9)
  quote?: MaybeMultiLang; // the testimonial body
}

export interface TestimonialsConfig
  extends SectionSpacingFields,
    WaveEdgeFields {
  /** This section's anchor id, so hero nav links can target it. */
  anchor_id?: string;

  // --- Header ---
  eyebrow?: MaybeMultiLang;
  section_title?: MaybeMultiLang;
  section_subtitle?: MaybeMultiLang;

  // --- Aggregate summary (optional rating headline) ---
  show_summary?: boolean;
  summary_rating?: number | string; // e.g. 4.9
  summary_count_text?: MaybeMultiLang; // e.g. "بناءً على ٢٬٣٠٠ تقييم"

  // --- Items ---
  items?: TestimonialItem[];

  // --- Layout ---
  layout?: TestimonialsLayout;
  columns_mobile?: TestimonialsColumns; // grid cols + carousel cards-per-view
  columns_desktop?: TestimonialsColumnsDesktop; // "inherit" → reuse mobile
  card_style?: TestimonialCardStyle;
  card_radius?: TestimonialCardRadius;
  photo_aspect?: TestimonialPhotoAspect; // "modern" photo box ratio

  // --- Element toggles ---
  show_rating?: boolean;
  rating_style?: TestimonialRatingStyle;
  show_avatar?: boolean;
  show_photo?: boolean; // large photo on photo-led styles
  show_quote_mark?: boolean;

  // --- Carousel ---
  carousel_autoplay?: boolean;
  carousel_autoplay_delay?: TestimonialAutoplayDelay;
  carousel_arrows?: boolean;
  carousel_dots?: boolean;
  carousel_loop?: boolean;

  // --- Motion ---
  enable_entrance_anim?: boolean;
  enable_hover_lift?: boolean;

  // --- Section background ---
  /**
   * Photo behind the whole section. `bg_color` stays the base underneath it (and
   * the only background when this is off), and doubles as the scrim colour: the
   * veil over the photo is `bg_color` at `bg_overlay`% opacity, so the merchant
   * tunes contrast with one slider instead of picking a second colour.
   */
  enable_bg_image?: boolean;
  bg_image?: string;
  /** 0–100; 0 shows the bare photo, 100 hides it behind a solid `bg_color`. */
  bg_overlay?: number | string;
  bg_position?: TestimonialBgPosition | Array<{ value?: string }> | string;

  // --- Wavy edges (تموج الحواف) ---
  // wave_edges / wave_shape / wave_height_* / wave_behind_color come from
  // WaveEdgeFields, shared verbatim with every other section that adopts it.

  // --- Colors ---
  bg_color?: string;
  title_color?: string;
  subtitle_color?: string;
  card_bg?: string;
  border_color?: string;
  name_color?: string;
  meta_color?: string;
  text_color?: string;
  star_color?: string;
  star_empty_color?: string;
  arrow_bg?: string; // carousel arrow button background
  arrow_icon_color?: string; // carousel arrow glyph
  accent_color?: string; // quote marks, eyebrow, dots, arrows
}

