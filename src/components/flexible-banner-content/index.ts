import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { GrowthElement } from "../../shared/growth-element";
import { flexibleBannerContentStyles } from "./style";
import type {
  FlexibleBannerAlign,
  FlexibleBannerButtonStyle,
  FlexibleBannerContentConfig,
  FlexibleBannerFit,
  FlexibleBannerHeight,
  FlexibleBannerLayout,
  FlexibleBannerPosition,
  FlexibleBannerRadius,
  FlexibleBannerSpacing,
  FlexibleBannerVertical,
} from "./types";

const MOBILE_HEIGHTS: Record<FlexibleBannerHeight, string> = {
  compact: "220px",
  medium: "320px",
  large: "440px",
  screen: "75svh",
};

const DESKTOP_HEIGHTS: Record<FlexibleBannerHeight, string> = {
  compact: "280px",
  medium: "420px",
  large: "560px",
  screen: "75svh",
};

interface ContentValues {
  localizedTitle: string;
  localizedDescription: string;
  localizedDetails: string;
  currentPrice: string;
  oldPrice: string;
  ctaLabel: string;
  ctaUrl: string;
  ctaStyle: FlexibleBannerButtonStyle;
}

export default class FlexibleBannerContent extends GrowthElement {
  static styles = flexibleBannerContentStyles;

  @property({ type: Object })
  config?: FlexibleBannerContentConfig;

  protected updated() {
    this._syncAnchor(this.config?.anchor_id, "flexible-banner-content");
  }

  private _renderContent(values: ContentValues): TemplateResult {
    const hasPrice = !!values.currentPrice || !!values.oldPrice;
    const hasCta = !!values.ctaLabel && !!values.ctaUrl;

    return html`
      <div class="copy">
        ${values.localizedTitle
          ? html`<h2 class="title">${values.localizedTitle}</h2>`
          : nothing}
        ${values.localizedDescription
          ? html`<p class="description">${values.localizedDescription}</p>`
          : nothing}
        ${values.localizedDetails
          ? html`<p class="details">${values.localizedDetails}</p>`
          : nothing}
        ${hasPrice
          ? html`
              <div class="prices" aria-label="السعر">
                ${values.currentPrice
                  ? html`<span class="current-price">${values.currentPrice}</span>`
                  : nothing}
                ${values.oldPrice
                  ? html`<span class="old-price">${values.oldPrice}</span>`
                  : nothing}
              </div>
            `
          : nothing}
        ${hasCta
          ? html`
              <a
                class="cta"
                data-style=${values.ctaStyle}
                href=${values.ctaUrl}
                target=${ifDefined(values.ctaUrl.startsWith("#") ? undefined : "_blank")}
                rel=${ifDefined(
                  values.ctaUrl.startsWith("#") ? undefined : "noopener noreferrer"
                )}
                @click=${(event: Event) => this._scrollToAnchor(event, values.ctaUrl)}
              >${values.ctaLabel}</a>
            `
          : nothing}
      </div>
    `;
  }

  render() {
    const c = this.config || {};
    const configuredLayout = this._pickValue<FlexibleBannerLayout>(
      c.layout_mode,
      "separate"
    );
    const align = this._pickValue<FlexibleBannerAlign>(c.content_align, "center");
    const vertical = this._pickValue<FlexibleBannerVertical>(
      c.overlay_vertical,
      "center"
    );
    const imageFit = this._pickValue<FlexibleBannerFit>(c.image_fit, "contain");
    const imagePosition = this._pickValue<FlexibleBannerPosition>(
      c.image_position,
      "center"
    );
    const mobileHeight = this._pickValue<FlexibleBannerHeight>(
      c.height_mobile,
      "medium"
    );
    const desktopHeight = this._pickValue<FlexibleBannerHeight>(
      c.height_desktop,
      "medium"
    );
    // Full-bleed unless the merchant turns it off. A dropdown fallback must
    // match the `selected` value its field ships in twilight-bundle.json — that
    // fallback is what an instance with no stored value renders (the dev demo
    // page, and any template omitting the field), so a divergence shows styling
    // the panel claims is off.
    const imageFullWidth = c.image_full_width !== false;
    const spacing = this._pickValue<FlexibleBannerSpacing>(
      c.content_spacing,
      "comfortable"
    );
    const radius = this._pickValue<FlexibleBannerRadius>(
      c.corner_radius,
      "none"
    );
    const ctaStyle = this._pickValue<FlexibleBannerButtonStyle>(
      c.cta_style,
      "filled"
    );

    const image = typeof c.image === "string" ? c.image.trim() : "";
    const layout: FlexibleBannerLayout =
      configuredLayout === "overlay" && image ? "overlay" : "separate";
    const imageAlt = this.localizedString(c.image_alt);
    const values: ContentValues = {
      localizedTitle: this.localizedString(c.title),
      localizedDescription: this.localizedString(c.description),
      localizedDetails: this.localizedString(c.details),
      currentPrice: this.localizedString(c.current_price),
      oldPrice: this.localizedString(c.old_price),
      ctaLabel: this.localizedString(c.cta_label),
      ctaUrl: typeof c.cta_url === "string" ? c.cta_url.trim() : "",
      ctaStyle,
    };
    const hasContent = !!(
      values.localizedTitle ||
      values.localizedDescription ||
      values.localizedDetails ||
      values.currentPrice ||
      values.oldPrice ||
      (values.ctaLabel && values.ctaUrl)
    );

    if (!image && !hasContent) return nothing;

    const rawDarkness = this._num(c.overlay_darkness, 40);
    const darkness = Math.min(90, Math.max(0, rawDarkness)) / 100;
    const textColor =
      layout === "overlay"
        ? c.overlay_text_color || "#ffffff"
        : c.separate_text_color || "#21150d";
    const sectionStyle = [
      `--fbc-bg:${c.background_color || "#f6f4f1"}`,
      `--fbc-text:${textColor}`,
      `--fbc-button-bg:${c.button_background || "#3D230E"}`,
      `--fbc-button-text:${c.button_text_color || "#ffffff"}`,
      `--fbc-overlay:${darkness}`,
      `--fbc-height-mobile:${MOBILE_HEIGHTS[mobileHeight]}`,
      `--fbc-height-desktop:${DESKTOP_HEIGHTS[desktopHeight]}`,
      `--fbc-image-fit:${imageFit}`,
      `--fbc-image-position:${imagePosition}`,
    ].join(";");

    return html`
      <section
        class="section"
        style=${sectionStyle}
        data-spacing=${spacing}
        data-radius=${radius}
        aria-label=${values.localizedTitle || imageAlt || "بنر ومحتوى مرن"}
      >
        <div
          class="frame"
          data-layout=${layout}
          data-media=${imageFullWidth ? "full" : "narrow"}
          data-has-image=${image ? "on" : "off"}
          data-has-content=${hasContent ? "on" : "off"}
        >
          ${image
            ? html`
                <div class="media">
                  <img src=${image} alt=${imageAlt} loading="lazy" />
                </div>
              `
            : nothing}

          ${layout === "overlay" && image
            ? html`<div class="shade" aria-hidden="true"></div>`
            : nothing}

          ${hasContent
            ? html`
                <div
                  class="content ${layout === "overlay"
                    ? "overlay-content"
                    : "separate-content"}"
                  data-align=${align}
                  data-vertical=${vertical}
                >
                  ${this._renderContent(values)}
                </div>
              `
            : nothing}
        </div>
      </section>
    `;
  }
}
