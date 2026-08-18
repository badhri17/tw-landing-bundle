/**
 * Product Features (مميزات المنتج) — type definitions.
 *
 * One large product shot with small feature cards floating over it, hugging the
 * left and right edges of the image and connected to it by a hairline. Reads
 * best with a transparent (PNG/WebP) product cut-out, which is what the
 * merchant panel asks for.
 *
 * Card placement: `side` picks the physical edge (left/right — never flipped by
 * RTL, so a card stays where the merchant put it relative to the photo) and
 * `top` is a percentage of the IMAGE height, same convention as
 * `interactive-product`'s hotspots.
 *
 * With no product image the component falls back to a plain stacked list, so a
 * half-configured section still renders something sensible.
 */

import type { MaybeMultiLang } from "../../shared/types";
import type { SectionSpacingFields } from "../../shared/section-spacing";

/** Physical edge of the image a card hugs. */
export type FeatureSide = "right" | "left";

/** Card width as a share of the image width. */
export type FeatureCardWidth = "narrow" | "medium" | "wide";

/** Type / padding scale of the cards. */
export type FeatureCardSize = "sm" | "md" | "lg";
/** Desktop override; "inherit" reuses the mobile size. */
export type FeatureCardSizeDesktop = FeatureCardSize | "inherit";

/** Shape of the little feature image on the card. */
export type FeatureThumbShape = "circle" | "rounded" | "none";

/**
 * Where the feature image sits inside the card. "side" overhangs the card's
 * inline-start edge next to the text; "top" stacks it above the title, which
 * gives narrow cards their full width for text.
 */
export type FeatureThumbPosition = "side" | "top";

/**
 * Card surface. "glass" is a translucent, frosted panel tinted by `card_bg`;
 * "solid" paints `card_bg` flat.
 */
export type FeatureCardStyle = "glass" | "solid";

/** Widest the whole composition may get on desktop, in px. */
export type FeatureStageMaxWidth = string | number;

/**
 * Shape of the canvas the cards are placed on. "auto" follows the uploaded
 * image exactly; the fixed ratios give the cards a predictable amount of
 * vertical room even when the product shot is square or landscape, filling the
 * canvas (which trims the empty edges of a cut-out rather than shrinking it).
 */
export type FeatureStageRatio = "auto" | "3/4" | "4/5" | "1/1" | "2/3";

/** One feature card. */
export interface ProductFeatureItem {
  title?: MaybeMultiLang;
  description?: MaybeMultiLang;
  /** Small image on the card (circle by default). */
  image?: string;
  /** Physical edge of the image this card hugs. Dropdowns arrive from the
      panel as `[{ label, value }]`; resolve with `_pickValue`. */
  side?: FeatureSide | Array<{ value?: string }> | string;
  /** Vertical position as a percentage of the image height (0 = top). */
  top?: number | string;
}

export interface ProductFeaturesConfig extends SectionSpacingFields {
  /** This section's anchor id, so hero nav links can target it. */
  anchor_id?: string;

  // --- Header ---
  section_title?: MaybeMultiLang;
  section_subtitle?: MaybeMultiLang;

  // --- Product shot ---
  product_image?: string;
  product_image_alt?: MaybeMultiLang;

  // --- Content ---
  items?: ProductFeatureItem[];

  // --- Layout ---
  card_width?: FeatureCardWidth;
  card_size?: FeatureCardSize;
  card_size_desktop?: FeatureCardSizeDesktop;
  card_radius?: string | number;
  thumb_shape?: FeatureThumbShape;
  thumb_position?: FeatureThumbPosition;
  card_style?: FeatureCardStyle;
  show_connectors?: boolean;
  stage_ratio?: FeatureStageRatio;
  stage_max_width?: FeatureStageMaxWidth;

  // --- Motion ---
  enable_entrance_anim?: boolean;

  // --- Colors ---
  bg_color?: string;
  title_color?: string;
  subtitle_color?: string;
  card_bg?: string;
  card_border_color?: string;
  card_title_color?: string;
  card_text_color?: string;
  connector_color?: string;
}
