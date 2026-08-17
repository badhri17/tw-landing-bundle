import type { MaybeMultiLang } from "../../shared/types";

export type FooterSocialStyle = "filled" | "outline";
export type FooterRadius = "none" | "soft" | "rounded";
export type FooterSpacing = "compact" | "comfortable" | "airy";

export interface FooterConfig {
  logo?: string;
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

