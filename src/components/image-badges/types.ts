import type { SectionSpacingFields } from "../../shared/section-spacing";
import type { MaybeMultiLang } from "../../shared/types";

export type ImageBadgesLayout = "grid" | "pyramid";
export type ImageBadgesColumnsMobile = "2" | "3" | "4";
export type ImageBadgesColumnsDesktop = "inherit" | "3" | "4" | "5" | "6";
export type ImageBadgesSize = "sm" | "md" | "lg";
export type ImageBadgesSizeDesktop = ImageBadgesSize | "inherit";
export type ImageBadgesGap = "compact" | "normal" | "spacious";

export interface ImageBadgeItem {
  image?: string;
  image_alt?: MaybeMultiLang;
  title?: MaybeMultiLang;
}

export interface ImageBadgesConfig extends SectionSpacingFields {
  section_title?: MaybeMultiLang;
  section_subtitle?: MaybeMultiLang;
  items?: ImageBadgeItem[];

  layout?: ImageBadgesLayout | Array<{ value?: string }> | string;
  columns_mobile?:
    ImageBadgesColumnsMobile | Array<{ value?: string }> | string;
  columns_desktop?:
    ImageBadgesColumnsDesktop | Array<{ value?: string }> | string;
  image_size_mobile?: ImageBadgesSize | Array<{ value?: string }> | string;
  image_size_desktop?:
    ImageBadgesSizeDesktop | Array<{ value?: string }> | string;
  gap?: ImageBadgesGap | Array<{ value?: string }> | string;

  bg_color?: string;
  title_color?: string;
  subtitle_color?: string;
  item_title_color?: string;

  enable_entrance_anim?: boolean;
  anchor_id?: string;
}
