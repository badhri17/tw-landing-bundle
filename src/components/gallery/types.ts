/**
 * Gallery (معرض الصور) — type definitions.
 *
 * A row of product photos sitting beside each other and bleeding off both edges
 * of the section. Tapping one opens a full-screen lightbox where the visitor
 * moves between all the images without leaving the page.
 *
 * Landing-page component: the images are merchant-uploaded, not pulled from a
 * product. Nothing here links to a SKU.
 *
 * RTL-first and mobile-first; honours prefers-reduced-motion.
 */

import type { MaybeMultiLang } from "../../shared/types";
import type { SideElementFields } from "./side-element";

/** Shape of each photo in the row. */
export type GalleryAspect = "1/1" | "3/4" | "4/5" | "2/3" | "4/3" | "16/9";

/**
 * Rhythm of the row:
 *   • equal     → every photo the same size
 *   • staggered → alternating photos shrink, so the row reads as an editorial
 *                 arrangement rather than a filmstrip (matches the reference)
 */
export type GalleryRowStyle = "equal" | "staggered";

/** Photo width tiers, as a share of the viewport. */
export type GalleryItemSize = "small" | "medium" | "large";
export type GalleryItemSizeDesktop = GalleryItemSize | "inherit";

/** One photo. */
export interface GalleryImageItem {
  image?: string;
  /** Alt text — also used as the lightbox caption. */
  alt?: MaybeMultiLang;
}

export interface GalleryConfig extends SideElementFields {
  /** This section's anchor id, so hero nav links can target it. */
  anchor_id?: string;

  // --- Header ---
  section_title?: MaybeMultiLang;

  // --- Content ---
  images?: GalleryImageItem[];

  // --- Layout ---
  row_style?: GalleryRowStyle;
  item_size?: GalleryItemSize;
  item_size_desktop?: GalleryItemSizeDesktop;
  aspect_ratio?: GalleryAspect;
  card_radius?: number | string;
  gap?: number | string;

  // --- Lightbox ---
  enable_lightbox?: boolean;
  lightbox_counter?: boolean;
  lightbox_thumbs?: boolean;

  // --- Motion ---
  enable_entrance_anim?: boolean;

  // --- Colors ---
  bg_color?: string;
  title_color?: string;
  lightbox_bg?: string;
}
