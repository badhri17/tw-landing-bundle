import type { MaybeMultiLang } from "../../shared/types";

export type FooterSocialStyle = "filled" | "outline";
export type FooterRadius = "none" | "soft" | "rounded";
export type FooterSpacing = "compact" | "comfortable" | "airy";
export type FooterLogoTone = "original" | "light";
export type FinalCtaVerticalAlignment = "top" | "center" | "bottom";
export type FinalCtaButtonStyle = "filled" | "outline";
export type FinalCtaOverlayStyle =
  | "dark-gradient"
  | "glass-dark"
  | "glass-light"
  /** Kept for previously saved configurations; renders as dark glass. */
  | "glass"
  | "light-gradient";

export interface FooterConfig {
  final_cta_enabled?: boolean;
  final_cta_text?: MaybeMultiLang;
  final_cta_button_label?: MaybeMultiLang;
  final_cta_button_url?: string;
  final_cta_button_style?: FinalCtaButtonStyle;
  final_cta_image?: string;
  final_cta_vertical_alignment?: FinalCtaVerticalAlignment;
  final_cta_overlay_style?: FinalCtaOverlayStyle;
  final_cta_background_color?: string;
  final_cta_text_color?: string;
  final_cta_button_background?: string;
  final_cta_button_text_color?: string;
  final_cta_overlay_darkness?: number;

  logo?: string;
  logo_tone?: FooterLogoTone;
  brand_name?: MaybeMultiLang;
  description?: MaybeMultiLang;
  copyright?: MaybeMultiLang;

  social_style?: FooterSocialStyle;
  x_url?: string;
  snapchat_url?: string;
  tiktok_url?: string;
  instagram_url?: string;

  background_color?: string;
  text_color?: string;
  corner_radius?: FooterRadius;
  spacing?: FooterSpacing;
  anchor_id?: string;
}
