import type { MaybeMultiLang } from "../../shared/types";

export type FlexibleBannerLayout = "separate" | "overlay";
export type FlexibleBannerAlign = "right" | "center" | "left";
export type FlexibleBannerVertical = "top" | "center" | "bottom";
export type FlexibleBannerFit = "cover" | "contain";
export type FlexibleBannerPosition =
  | "center"
  | "top"
  | "bottom"
  | "right"
  | "left";
export type FlexibleBannerHeight = "compact" | "medium" | "large" | "screen";
export type FlexibleBannerSpacing = "compact" | "comfortable" | "airy";
export type FlexibleBannerRadius = "none" | "soft" | "rounded";
export type FlexibleBannerButtonStyle = "filled" | "outline";

export interface FlexibleBannerContentConfig {
  layout_mode?: FlexibleBannerLayout;
  image?: string;
  image_alt?: MaybeMultiLang;
  image_fit?: FlexibleBannerFit;
  image_position?: FlexibleBannerPosition;
  /**
   * Image edge to edge across the viewport (default) or held to the same
   * max-width as the copy. The section's background colour always fills the
   * full width either way, so the narrow choice reads as a framed image
   * sitting on a full-bleed band — never as a floating card.
   */
  image_full_width?: boolean;
  height_mobile?: FlexibleBannerHeight;
  height_desktop?: FlexibleBannerHeight;

  title?: MaybeMultiLang;
  description?: MaybeMultiLang;
  details?: MaybeMultiLang;
  current_price?: MaybeMultiLang;
  old_price?: MaybeMultiLang;
  cta_label?: MaybeMultiLang;
  cta_url?: string;
  cta_style?: FlexibleBannerButtonStyle;

  content_align?: FlexibleBannerAlign;
  overlay_vertical?: FlexibleBannerVertical;
  overlay_darkness?: number | string;
  separate_text_color?: string;
  overlay_text_color?: string;
  background_color?: string;
  button_background?: string;
  button_text_color?: string;
  content_spacing?: FlexibleBannerSpacing;
  corner_radius?: FlexibleBannerRadius;
  anchor_id?: string;
}
