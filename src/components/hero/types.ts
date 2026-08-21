/**
 * Growth Kit — Store Hero
 * Type definitions for the Hero component configuration.
 * All fields are optional except `headline`; smart defaults are applied in the component.
 */

export type HeroHeight = "full" | "large" | "medium" | "compact";
export type HeroHeightDesktop = HeroHeight | "inherit";
/** Desktop layout mode: full-bleed background (default) or a split media/content panel. */
export type HeroDesktopLayout = "background" | "split";
/** In split mode, which side the media (image/video/gradient) sits on (desktop, physical). */
export type HeroSplitSide = "left" | "right";
/** In split mode, how the two columns share the width. */
export type HeroSplitRatio = "equal" | "media" | "content";
export type HeroAlignH = "start" | "center" | "end";
export type HeroAlignV = "top" | "middle" | "bottom";
export type HeroOverlayStyle = "none" | "dark-bottom" | "dark-full" | "light-full" | "vignette";
export type HeroOverlayIntensity = "subtle" | "medium" | "strong";
export type HeroTextTheme = "light" | "dark";
export type HeroGradientType = "linear" | "radial" | "radial-corner" | "conic";
/** Background fill when no image/video: a single solid colour or a two-stop gradient. */
export type HeroBgFill = "solid" | "gradient";

/** Value coming back from a Salla `multilanguage: true` field. */
export type MaybeMultiLang = string | { ar?: string; en?: string } | null | undefined;

/** One entry in the `trust_points` collection — a short reassurance line with a check icon. */
export interface TrustPoint {
  text?: MaybeMultiLang;
}

/**
 * Value from a Salla `variable-list` link field. The platform resolves the
 * picked target (product / category / page / brand / blog / external URL) to a
 * final URL string; typed loosely because it may arrive as a bare string, a
 * `{ url | value }` object, or a single-item array wrapping either.
 */
export type RawLinkValue =
  | string
  | { url?: string; value?: string; label?: string }
  | Array<string | { url?: string; value?: string; label?: string }>
  | null
  | undefined;

/**
 * Where a nav item points. The bundle's own sections are listed by their
 * default anchor slug; `custom` opens a free-text anchor field (for a renamed
 * or duplicated section) and `link` opens the standard variable-list picker
 * for off-page targets.
 */
export type HeroNavTargetKind =
  | "hero"
  | "collection"
  | "interactive-product"
  | "testimonials"
  | "metrics"
  | "product-features"
  | "gallery"
  | "ingredients"
  | "use-cases"
  | "faq"
  | "comparison"
  | "custom"
  | "link";

/**
 * What the top bar holds, and where the logo sits when it holds nothing else.
 * The two concerns share one field on purpose: logo placement only has a
 * question to answer once the links are gone, so a second (conditional) field
 * would buy nothing but another gate.
 */
export type HeroNavLayout = "logo_links" | "logo_only_start" | "logo_only_center";

/** One entry in the `nav_items` collection — a single link in the top navbar. */
export interface HeroNavItem {
  label?: MaybeMultiLang;
  /** Dropdown selection; see HeroNavTargetKind. */
  target?: HeroNavTargetKind | Array<{ value?: string }> | string;
  /** Free-text anchor id, shown when `target === "custom"`. */
  section_custom?: string;
  /** Off-page link picker, shown when `target === "link"`. */
  link?: RawLinkValue;
}

export interface HeroConfig {
  /** This hero's own anchor id, so other navs can link back to it. */
  anchor_id?: string;

  // --- Top navbar ---
  enable_nav?: boolean;          // off by default; the hero renders bare
  /**
   * Dropdown; defaults to "logo_only_center" — a landing page drives one
   * conversion, owned by the hero, so the bar ships as brand presence with no
   * exits. The two "logo_only" values suppress the links (and with them the
   * mobile drawer) without clearing `nav_items`: the rows stay stored, so
   * choosing "logo_links" brings them back with nothing lost.
   */
  nav_layout?: HeroNavLayout | Array<{ value?: string }> | string;
  nav_logo?: string;             // image URL; falls back to nav_store_name
  nav_store_name?: MaybeMultiLang;
  nav_home_url?: string;         // where the logo points; default "#"
  nav_items?: HeroNavItem[];     // up to 6 links
  nav_show_cta?: boolean;        // mirror the hero's primary CTA into the bar
  nav_border?: boolean;          // hairline under the bar
  /**
   * Pin the bar to the viewport so it follows the visitor down the whole page.
   * Defaults to OFF — read it as `=== true`, never `!== false`. While the hero is
   * still behind the bar it stays transparent; once the hero scrolls past, the
   * bar takes the two colours below so its contents stay readable over whatever
   * section is underneath.
   */
  nav_fixed?: boolean;
  nav_scrolled_bg?: string;      // bar background once past the hero
  nav_scrolled_color?: string;   // bar text/icons once past the hero

  // --- Background media (mobile / default) ---
  video_url?: string;
  background_image?: string;

  // --- Background media (desktop override, ≥768 px) ---
  video_url_desktop?: string;
  background_image_desktop?: string;

  // --- Background colour (fallback when no image/video) ---
  bg_fill_type?: HeroBgFill;    // "solid" (default) | "gradient"
  gradient_from?: string;       // the colour (solid) / the start stop (gradient)
  gradient_to?: string;         // the end stop, only used in gradient mode
  gradient_angle?: number;      // 0–360, default 135
  gradient_type?: HeroGradientType;

  // --- Overlay ---
  overlay_style?: HeroOverlayStyle;
  overlay_intensity?: HeroOverlayIntensity;

  // --- Content ---
  eyebrow?: MaybeMultiLang;      // small text above headline
  headline?: MaybeMultiLang;     // required in practice
  subtitle?: MaybeMultiLang;     // paragraph below headline

  // --- Custom content colours (when enabled, override text_theme per element) ---
  enable_custom_colors?: boolean;  // off → follow text_theme; on → use the colours below
  title_color?: string;            // headline
  eyebrow_color?: string;          // eyebrow
  subtitle_color?: string;         // subtitle + trust points
  button_bg_color?: string;        // filled CTA background
  button_text_color?: string;      // CTA text/border

  // --- CTA ---
  primary_label?: MaybeMultiLang;
  primary_url?: string;
  primary_outline?: boolean;     // default false → filled

  // --- Trust points (up to 3 short reassurance lines under the CTA) ---
  trust_points?: TrustPoint[];

  // --- Layout ---
  height_mobile?: HeroHeight;
  height_desktop?: HeroHeightDesktop;  // "inherit" → use height_mobile on desktop too

  // --- Desktop layout (≥768 px only; mobile always stays full background) ---
  desktop_layout?: HeroDesktopLayout;  // "background" (default) | "split"
  split_media_side?: HeroSplitSide;    // which side the media sits on in split mode
  split_ratio?: HeroSplitRatio;        // column width distribution in split mode
  split_content_bg?: string;           // optional bg colour of the content panel
  split_text_theme?: HeroTextTheme;    // desktop split panel only; mobile uses text_theme

  align_h?: HeroAlignH;
  align_v?: HeroAlignV;
  text_theme?: HeroTextTheme;
  content_max_width?: number;    // px cap for the inner content block

  // --- Video behaviour ---
  video_autoplay?: boolean;
  video_loop?: boolean;
  video_muted?: boolean;

  // --- Smart connection-aware fallback (default ON when undefined) ---
  smart_data_saver?: boolean;
  /** Swap video for the background image when the browser blocks autoplay
      (Safari Low Power Mode). Default ON; only acts when an image exists. */
  battery_saver_fallback?: boolean;

  // --- Motion ---
  enable_entrance_anim?: boolean;
  enable_ken_burns?: boolean;    // slow zoom on image
  enable_parallax?: boolean;     // subtle scroll parallax
}
