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

/** Value coming back from a Salla `multilanguage: true` field. */
export type MaybeMultiLang =
  | string
  | { ar?: string; en?: string }
  | null
  | undefined;

/** How the testimonials are arranged on the page. */
export type TestimonialsLayout = "marquee" | "carousel" | "grid" | "masonry";

/** Visual treatment / shape of each testimonial card. */
export type TestimonialCardStyle =
  | "modern" // UGC photo-led card: customer's product photo with a name chip overlaid
  | "overlay" // full-bleed customer photo with a frosted-glass panel pinned to the bottom
  | "quote" // large quotation mark, text-forward
  | "bubble" // chat speech-bubble with a tail, author sits below
  | "minimal" // clean hairline-bordered card, no elevation
  | "glass"; // translucent, blurred surface

/** Column count tiers (also used as "cards per view" for the carousel). */
export type TestimonialsColumns = "1" | "2" | "3" | "4";
export type TestimonialsColumnsDesktop = TestimonialsColumns | "inherit";

/** How the rating is presented. */
export type TestimonialRatingStyle = "stars" | "stars-number" | "number";

/** Marquee tuning. */
export type TestimonialMarqueeRows = "1" | "2";
export type TestimonialMarqueeSpeed = "slow" | "normal" | "fast";
export type TestimonialMarqueeDirection = "forward" | "backward";

/** Carousel autoplay cadence (seconds). */
export type TestimonialAutoplayDelay = "3" | "5" | "7" | "10";

/** Card image aspect ratio (the large photo in photo-led styles). */
export type TestimonialPhotoAspect = "1/1" | "2/3" | "3/4" | "4/5" | "5/7";

/** Glass tone of the "overlay" card's frosted bottom panel (drives text color too). */
export type TestimonialOverlayTone = "dark" | "light";

/** Card corner roundness in px (resolved as a number). */
export type TestimonialCardRadius = string | number;

/** One testimonial entry. */
export interface TestimonialItem {
  // --- Author ---
  name?: MaybeMultiLang; // e.g. "تايلور" / "Taylor"
  meta?: MaybeMultiLang; // e.g. "33" or "الرياض" — rendered as "Name · meta"
  avatar?: string; // small round portrait (quote/minimal/glass styles)
  photo?: string; // customer's own product photo (UGC) — large image in the modern style

  // --- Review ---
  rating?: number | string; // 0–5, supports fractions (e.g. 4.9)
  quote?: MaybeMultiLang; // the testimonial body
}

export interface TestimonialsConfig {
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
  columns_mobile?: TestimonialsColumns; // grid/masonry cols + carousel cards-per-view
  columns_desktop?: TestimonialsColumnsDesktop; // "inherit" → reuse mobile
  card_style?: TestimonialCardStyle;
  card_radius?: TestimonialCardRadius;
  photo_aspect?: TestimonialPhotoAspect; // "modern" photo box ratio
  overlay_tone?: TestimonialOverlayTone; // "overlay" frosted panel tone

  // --- Element toggles ---
  show_rating?: boolean;
  rating_style?: TestimonialRatingStyle;
  show_avatar?: boolean;
  show_photo?: boolean; // large photo on photo-led styles
  show_quote_mark?: boolean;

  // --- Marquee ---
  marquee_rows?: TestimonialMarqueeRows;
  marquee_speed?: TestimonialMarqueeSpeed;
  marquee_direction?: TestimonialMarqueeDirection;
  marquee_pause_hover?: boolean;

  // --- Carousel ---
  carousel_autoplay?: boolean;
  carousel_autoplay_delay?: TestimonialAutoplayDelay;
  carousel_arrows?: boolean;
  carousel_dots?: boolean;
  carousel_loop?: boolean;

  // --- Motion ---
  enable_entrance_anim?: boolean;
  enable_hover_lift?: boolean;

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
  accent_color?: string; // quote marks, eyebrow, dots, arrows
}

