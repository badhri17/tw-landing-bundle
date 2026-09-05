import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import { resolveSectionSpacing } from "../../shared/section-spacing";
import type {
  ProductFeaturesConfig,
  ProductFeatureItem,
  FeatureSide,
  FeatureCardWidth,
  FeatureCardSize,
  FeatureCardSizeDesktop,
  FeatureThumbShape,
  FeatureThumbPosition,
  FeatureCardStyle,
  FeatureStageRatio,
} from "./types";
import { productFeaturesStyles } from "./style";

/** Card width as a share of the product image's width. */
const CARD_WIDTH: Record<FeatureCardWidth, string> = {
  narrow: "36%",
  medium: "42%",
  wide: "52%",
};

/**
 * Type + padding multiplier per size tier, per breakpoint.
 *
 * The tiers are relative to their own breakpoint, not absolute pixel sizes:
 * desktop gives the cards ~1.7x the width mobile does (a 42% card is ~140px on
 * a phone but ~235px inside the 560px stage), so the same type size that reads
 * as balanced on mobile reads as undersized on desktop. Every desktop tier is
 * therefore larger than its mobile namesake — desktop "small" is bigger than
 * mobile "small". Scales the thumb, the title, the description and the padding
 * together.
 */
const CARD_SCALE_MOBILE: Record<FeatureCardSize, number> = {
  sm: 0.8,
  md: 0.88,
  lg: 1.02,
};
const CARD_SCALE_DESKTOP: Record<FeatureCardSize, number> = {
  sm: 1.0,
  md: 1.16,
  lg: 1.34,
};

/** Vertical spread used when a card has no position of its own. */
const DEFAULT_TOPS = [6, 26, 48, 68, 84, 90];

/**
 * <salla-product-features> — Product Features (مميزات المنتج)
 *
 * One big product shot with small feature cards floating over it, each hugging
 * the left or right edge of the image and tethered to it by a hairline. Built
 * for a transparent product cut-out; the merchant panel says so up front.
 *
 * Card placement is physical (left/right edge + a percentage down the image),
 * so cards stay where the merchant put them relative to the photo. Without a
 * product image the section degrades to a plain stacked list.
 *
 * RTL-first and mobile-first; honours prefers-reduced-motion.
 */
export default class GrowthProductFeatures extends GrowthElement {
  static styles = productFeaturesStyles;

  @property({ type: Object })
  config?: ProductFeaturesConfig;

  /** Entrance gate for the cards. */
  @state() private _animState: "ready" | "in" = "ready";

  private _io: IntersectionObserver | null = null;
  private _fallbackTimer: number | null = null;

  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------

  /** Keep features that have something to show. */
  private _items(): ProductFeatureItem[] {
    const list = this.config?.items;
    if (!Array.isArray(list)) return [];
    return list.filter((it) => {
      if (!it || typeof it !== "object") return false;
      return !!(
        this.localizedString(it.title) ||
        this.localizedString(it.description) ||
        it.image
      );
    });
  }

  private _productImage(): string {
    const src = this.config?.product_image;
    return typeof src === "string" ? src.trim() : "";
  }

  private _reduceMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Translucent version of a merchant colour, for the glass card surface.
   *
   * Done here rather than with CSS `color-mix()` so the frosted look also works
   * in browsers that predate it. Salla's colour picker always returns hex; any
   * other notation falls through to the stylesheet's own default.
   */
  private _translucent(color: unknown, alpha: number): string {
    const raw = typeof color === "string" ? color.trim() : "";
    const m = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(raw);
    if (!m) return "";
    let h = m[1];
    if (h.length <= 4)
      h = h
        .split("")
        .map((ch) => ch + ch)
        .join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------

  private _reveal = () => {
    this._animState = "in";
    this._io?.disconnect();
    this._io = null;
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
  };

  connectedCallback() {
    super.connectedCallback();

    if (!("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }

    this._io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) this._reveal();
      },
      { threshold: 0.15 }
    );
    this._io.observe(this);

    // Safety net for contexts where the observer never reports an intersection
    // even though the section is on screen. A section genuinely below the fold
    // keeps waiting for the observer.
    this._fallbackTimer = window.setTimeout(() => {
      this._fallbackTimer = null;
      if (this._animState === "in") return;
      const r = this.getBoundingClientRect();
      if (r.height === 0 || (r.top < window.innerHeight && r.bottom > 0))
        this._reveal();
    }, 3000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._io?.disconnect();
    this._io = null;
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
  }

  updated() {
    // Publish this section as a link target for the hero navbar. Runs every
    // cycle because Salla may inject `config` after the first render.
    this._syncAnchor(this.config?.anchor_id, "product-features");
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  private _stageRatio(c: ProductFeaturesConfig): FeatureStageRatio {
    return this._pickValue<FeatureStageRatio>(c.stage_ratio, "3/4");
  }

  private _hostStyle(c: ProductFeaturesConfig): string {
    const width = this._pickValue<FeatureCardWidth>(c.card_width, "medium");
    const sizeMobile = this._pickValue<FeatureCardSize>(c.card_size, "md");
    const sizeDesktopRaw = this._pickValue<FeatureCardSizeDesktop>(
      c.card_size_desktop,
      "inherit"
    );
    // "inherit" carries the mobile TIER over, not the mobile pixel size — it
    // still resolves through the desktop scale table.
    const sizeDesktop =
      sizeDesktopRaw === "inherit" ? sizeMobile : sizeDesktopRaw;
    const ratio = this._stageRatio(c);
    const glassTint = this._translucent(c.card_bg ?? "#ffffff", 0.72);

    return [
      c.bg_color ? `--pf-bg:${c.bg_color}` : "",
      c.title_color ? `--pf-title:${c.title_color}` : "",
      c.subtitle_color ? `--pf-subtitle:${c.subtitle_color}` : "",
      c.card_bg ? `--pf-card-bg:${c.card_bg}` : "",
      // Glass tint. Falls back to the stylesheet default when the colour isn't
      // hex, so the frosted surface never collapses to fully transparent.
      glassTint ? `--pf-card-glass:${glassTint}` : "",
      c.card_border_color ? `--pf-card-border:${c.card_border_color}` : "",
      c.card_title_color ? `--pf-card-title:${c.card_title_color}` : "",
      c.card_text_color ? `--pf-card-text:${c.card_text_color}` : "",
      c.connector_color ? `--pf-connector:${c.connector_color}` : "",
      `--pf-card-w:${CARD_WIDTH[width] ?? "52%"}`,
      `--pf-scale-m:${CARD_SCALE_MOBILE[sizeMobile] ?? 1}`,
      `--pf-scale-d:${CARD_SCALE_DESKTOP[sizeDesktop] ?? 1.16}`,
      `--pf-radius:${this._num(c.card_radius, 16)}px`,
      `--pf-stage-max:${this._num(c.stage_max_width, 560)}px`,
      ratio === "auto" ? "" : `--pf-ratio:${ratio}`,
      ...resolveSectionSpacing(
        c,
        (v, f) => this._pickValue(v, f),
      ),
    ]
      .filter(Boolean)
      .join("; ");
  }

  private _renderCard(
    item: ProductFeatureItem,
    i: number,
    shape: FeatureThumbShape,
    overlay: boolean,
    showLine: boolean
  ) {
    const localizedTitle = this.localizedString(item.title);
    const localizedText = this.localizedString(item.description);
    const thumb = shape === "none" ? "" : (item.image || "").trim();

    const side = this._pickValue<FeatureSide>(
      item.side,
      i % 2 === 0 ? "right" : "left"
    );
    const top = Math.max(
      0,
      Math.min(92, this._num(item.top, DEFAULT_TOPS[i] ?? 90))
    );

    return html`<div
      class="pf-pin"
      data-side=${side}
      style=${overlay ? `--i:${i};--top:${top}%` : `--i:${i}`}
    >
      ${overlay && showLine ? html`<span class="pf-line"></span>` : nothing}
      <div class="pf-card" data-thumb=${thumb ? "on" : "off"}>
        ${thumb
          ? html`<span class="pf-thumb" data-shape=${shape}>
              <img src=${thumb} alt="" loading="lazy" decoding="async" />
            </span>`
          : nothing}
        ${localizedTitle
          ? html`<h3 class="pf-card-title">${localizedTitle}</h3>`
          : nothing}
        ${localizedText
          ? html`<p class="pf-card-text">${localizedText}</p>`
          : nothing}
      </div>
    </div>`;
  }

  render() {
    const c: ProductFeaturesConfig = this.config || {};
    const items = this._items();
    const image = this._productImage();
    const hostStyle = this._hostStyle(c);

    if (!image && items.length === 0) {
      return html`<section class="pf" style=${hostStyle}>
        <p class="pf-empty">
          ${this._lang() === "ar"
            ? "أضف صورة المنتج وميزة واحدة على الأقل لعرض هذا القسم."
            : "Add a product image and at least one feature to display this section."}
        </p>
      </section>`;
    }

    const localizedTitle = this.localizedString(c.section_title);
    const localizedSubtitle = this.localizedString(c.section_subtitle);
    const shape = this._pickValue<FeatureThumbShape>(c.thumb_shape, "circle");
    const thumbPos = this._pickValue<FeatureThumbPosition>(
      c.thumb_position,
      "side"
    );
    const cardStyle = this._pickValue<FeatureCardStyle>(c.card_style, "glass");
    const showLine = c.show_connectors !== false;
    const entrance = c.enable_entrance_anim !== false && !this._reduceMotion();

    // No product shot → the overlay has nothing to sit on; stack the cards.
    const overlay = !!image;

    const header =
      localizedTitle || localizedSubtitle
        ? html`<header class="pf-header">
            ${localizedTitle
              ? html`<h2 class="pf-h2">${localizedTitle}</h2>`
              : nothing}
            ${localizedSubtitle
              ? html`<p class="pf-sub">${localizedSubtitle}</p>`
              : nothing}
          </header>`
        : nothing;

    return html`
      <section class="pf" style=${hostStyle}>
        ${header}
        <div
          class="pf-stage"
          data-mode=${overlay ? "overlay" : "stack"}
          data-ratio=${overlay && this._stageRatio(c) !== "auto" ? "on" : "off"}
          data-thumb-pos=${thumbPos}
          data-card=${cardStyle}
          data-anim=${entrance ? this._animState : "in"}
        >
          ${overlay
            ? html`<img
                class="pf-product"
                src=${image}
                alt=${this.localizedString(c.product_image_alt) || localizedTitle || ""}
                decoding="async"
              />`
            : nothing}
          ${items.map((item, i) =>
            this._renderCard(item, i, shape, overlay, showLine)
          )}
        </div>
      </section>
    `;
  }
}
