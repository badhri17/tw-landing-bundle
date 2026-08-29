/**
 * Product Use Cases & Benefits (استخدامات وفوائد المنتج) — type definitions.
 *
 * An editorial section built from a handful of large photos, each carrying a
 * short line of supporting copy. Deliberately not tied to one purpose — the
 * same structure answers three different questions, and the panel copy says so:
 *
 *   • where/when the product fits    → «أماكن أو لحظات الاستخدام»
 *   • what the buyer gets out of it  → «فوائد المنتج ومميزاته»
 *   • how it is actually used        → «طريقة الاستخدام خطوة بخطوة»
 *
 * The third is what `show_numbers` is for: without a step number the section
 * can only *claim* to do instructions. The component name stays `use-cases`
 * because the tag, the dist filename and the default anchor slug are baked into
 * published pages; only the merchant-facing copy carries the wider meaning.
 *
 * Two layouts, both driven by the same `items` collection so a merchant can
 * flip between them without re-entering anything:
 *
 * - `stack` — cards sitting one above the other, each one a large photo beside
 *   its copy, with the photo alternating sides down the list. The reading eye
 *   zig-zags, which is what makes a long list scannable.
 * - `row` — the photos beside each other in a strip that bleeds off both edges
 *   of the section, each frame captioned either on the photo or under it. Same
 *   bleeding-strip idea as `gallery`, but the frame in the middle is the one in
 *   focus.
 *
 * `text_position` decides on-the-photo vs clear-of-it in BOTH layouts — see it
 * for why that has to be a single field rather than one per layout.
 *
 * Landing-page component: nothing here links anywhere. The photos sell the
 * situation, the hero sells the product — a use case that sprouts its own CTA
 * competes with the single conversion the page is built around.
 *
 * RTL-first and mobile-first; honours prefers-reduced-motion.
 */

import type { MaybeMultiLang } from "../../shared/types";
import type { SectionSpacingFields } from "../../shared/section-spacing";

/** How the cards are arranged. */
export type UseCasesLayout = "stack" | "row";

/**
 * Where the copy sits relative to its photo. Applies to BOTH layouts, and is
 * deliberately the only thing that answers "is the text on the photo?" —
 * Salla's `conditions` support a single `field = value` test with no OR, so
 * the overlay settings can only be hidden if one field decides it outright.
 *
 *   • over    → the copy is laid on the photo, over a scrim
 *   • outside → the copy sits clear of the photo. Which side depends on the
 *               layout, because that is where the room is: BESIDE the photo in
 *               the stack (a wide card), UNDER it in the row (a narrow frame).
 */
export type UseCasesTextPlacement = "over" | "outside";

/**
 * Physical side of the photo inside a stack card — never flipped by store
 * language, the same convention `ingredients` and `product-features` use.
 * `auto` leaves the item to the section's own alternating rhythm.
 */
export type UseCaseSide = "left" | "right";
export type UseCaseSideAuto = UseCaseSide | "auto";

/** Frame shape of the photos. */
export type UseCasesAspect = "1/1" | "3/4" | "4/5" | "2/3" | "4/3" | "16/9";

/** Row layout: photo width tiers, as a share of the viewport. */
export type UseCasesItemSize = "small" | "medium" | "large";
export type UseCasesItemSizeDesktop = UseCasesItemSize | "inherit";

/** Stack layout: how much of the card width the photo takes. */
export type UseCasesImageShare = "sm" | "md" | "lg";
export type UseCasesImageShareDesktop = UseCasesImageShare | "inherit";

/** Where copy laid over a photo sits in the frame. */
export type UseCasesOverlayPosition = "bottom" | "center";

/** How dark the scrim under overlaid copy gets. */
export type UseCasesOverlayStrength = "soft" | "medium" | "strong";

/** How hard the out-of-focus frames recede in the row layout. */
export type UseCasesDimStrength = "soft" | "medium" | "strong";

/** Copy alignment inside a card. */
export type UseCasesTextAlign = "start" | "center";

/** One use case. */
export interface UseCaseItem {
  /** Lifestyle photo — the whole point of the card. */
  image?: string;
  /** Short label, e.g. «المطبخ». Doubles as the alt text when `alt` is empty. */
  title?: MaybeMultiLang;
  /** One or two lines of supporting copy. */
  text?: MaybeMultiLang;
  /** Alt text, when the visible title is not a good description of the photo. */
  alt?: MaybeMultiLang;
  /** Optional card background; falls back to the section-wide card color. */
  background_color?: string;
  /**
   * Stack layout: force this card's photo to a physical side instead of taking
   * its turn in the alternating rhythm. Dropdowns arrive from the panel as
   * `[{ label, value }]`; resolve with `_pickValue`.
   */
  side?: UseCaseSideAuto | Array<{ value?: string }> | string;
}

export interface UseCasesConfig extends SectionSpacingFields {
  /** This section's anchor id, so hero nav links can target it. */
  anchor_id?: string;

  // --- Header ---
  section_title?: MaybeMultiLang;
  section_subtitle?: MaybeMultiLang;

  // --- Content ---
  items?: UseCaseItem[];

  // --- Layout (shared) ---
  layout?: UseCasesLayout;
  card_radius?: number | string;
  gap?: number | string;
  text_align?: UseCasesTextAlign;
  /**
   * Number each card in order — what turns the section into a "how to use it"
   * sequence. Off by default: a set of use cases or benefits is not ordered,
   * and numbering one implies a sequence the merchant did not intend.
   */
  show_numbers?: boolean;

  /** See UseCasesTextPlacement — shared by both layouts. */
  text_position?: UseCasesTextPlacement;

  // --- Layout: stack ---
  /** Physical side the FIRST card's photo sits on; the rest alternate from it. */
  first_image_side?: UseCaseSide;
  alternate_sides?: boolean;
  image_share?: UseCasesImageShare;
  image_share_desktop?: UseCasesImageShareDesktop;
  /** Frame shape of the photo when the copy sits beside it. */
  stack_aspect?: UseCasesAspect;
  /** Frame shape of the whole card when the copy sits over the photo. */
  stack_over_aspect?: UseCasesAspect;
  /** Widest the column of cards may get, in px. */
  stack_max_width?: number | string;

  // --- Layout: row ---
  item_size?: UseCasesItemSize;
  item_size_desktop?: UseCasesItemSizeDesktop;
  aspect_ratio?: UseCasesAspect;
  /**
   * Bring the frame nearest the middle of the strip forward and let the rest
   * recede. Off makes every frame equal, which reads more like a gallery.
   */
  focus_center?: boolean;
  dim_strength?: UseCasesDimStrength;

  // --- Overlaid copy: only reachable while text_position === "over" ---
  overlay_position?: UseCasesOverlayPosition;
  overlay_align?: UseCasesTextAlign;
  overlay_strength?: UseCasesOverlayStrength;

  // --- Motion ---
  enable_entrance_anim?: boolean;

  // --- Colors ---
  bg_color?: string;
  title_color?: string;
  subtitle_color?: string;
  card_bg?: string;
  card_title_color?: string;
  card_text_color?: string;
  /** Copy laid over a photo carries its own pair — it sits on a dark scrim. */
  overlay_title_color?: string;
  overlay_text_color?: string;
  /**
   * Step badge, in the card layout only. A badge laid over a photo takes a
   * fixed translucent-white treatment instead, so it stays readable on the
   * scrim whatever these are set to.
   */
  number_bg?: string;
  number_color?: string;
}
