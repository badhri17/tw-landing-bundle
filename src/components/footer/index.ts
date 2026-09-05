import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { GrowthElement } from "../../shared/growth-element";
import type {
  FinalCtaButtonStyle,
  FinalCtaOverlayStyle,
  FinalCtaVerticalAlignment,
  FooterConfig,
  FooterLogoTone,
  FooterRadius,
  FooterSocialStyle,
  FooterSpacing,
} from "./types";
import { footerStyles } from "./style";

interface SocialLink {
  networkName: string;
  href: string;
  icon: TemplateResult;
}

export default class GrowthFooter extends GrowthElement {
  static styles = footerStyles;

  @property({ type: Object })
  config?: FooterConfig;

  private _socials(): SocialLink[] {
    const c = this.config || {};
    const candidates: Array<SocialLink | null> = [
      this._social(
        "X",
        c.x_url,
        html`<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
          />
        </svg>`,
      ),
      this._social(
        "Snapchat",
        c.snapchat_url,
        html`<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path
            d="M12.04 2.25c-3.3 0-5.35 2.54-5.35 5.7 0 .73.12 1.5.25 2.14-.39.22-1.04.45-1.65.22-.51-.2-.89-.04-1.02.29-.19.48.43 1.16 1.9 1.73-.42 1.03-1.23 2.32-2.54 2.78-.42.15-.62.47-.54.82.1.43.67.72 1.72.88.17.38.28.85.37 1.2.06.24.3.4.55.37.69-.09 1.36-.04 1.93.15.75.25 1.35.86 2.02 1.34.62.45 1.3.81 2.3.81h.12c1 0 1.69-.36 2.31-.81.67-.48 1.27-1.09 2.02-1.34.57-.19 1.24-.24 1.93-.15.25.03.49-.13.55-.37.09-.35.2-.82.37-1.2 1.05-.16 1.62-.45 1.72-.88.08-.35-.12-.67-.54-.82-1.31-.46-2.12-1.75-2.54-2.78 1.47-.57 2.09-1.25 1.9-1.73-.13-.33-.51-.49-1.02-.29-.61.23-1.26 0-1.65-.22.13-.64.25-1.41.25-2.14 0-3.16-2.05-5.7-5.35-5.7h-.04Z"
          />
        </svg>`,
      ),
      this._social(
        "TikTok",
        c.tiktok_url,
        html`<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path
            d="M15.57 2.25h-3.39v13.18a3.05 3.05 0 1 1-2.63-3.02V8.98a6.44 6.44 0 1 0 6.02 6.42V8.7a8.04 8.04 0 0 0 4.7 1.5V6.81a4.7 4.7 0 0 1-4.7-4.56Z"
          />
        </svg>`,
      ),
      this._social(
        "Instagram",
        c.instagram_url,
        html`<svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
        </svg>`,
      ),
    ];
    return candidates.filter((item): item is SocialLink => !!item);
  }

  private _social(
    networkName: string,
    rawHref: string | undefined,
    icon: TemplateResult,
  ): SocialLink | null {
    const href = typeof rawHref === "string" ? rawHref.trim() : "";
    return href ? { networkName, href, icon } : null;
  }

  protected updated() {
    this._syncAnchor(this.config?.anchor_id, "footer");
  }

  render() {
    const c = this.config || {};
    const finalCtaEnabled = c.final_cta_enabled !== false;
    const finalCtaText = this.localizedString(c.final_cta_text);
    const finalCtaButtonLabel = this.localizedString(c.final_cta_button_label);
    const finalCtaButtonUrl = (c.final_cta_button_url || "").trim();
    const finalCtaButtonStyle = this._pickValue<FinalCtaButtonStyle>(
      c.final_cta_button_style,
      "outline",
    );
    const finalCtaImage = (c.final_cta_image || "").trim();
    const finalCtaVerticalAlignment =
      this._pickValue<FinalCtaVerticalAlignment>(
        c.final_cta_vertical_alignment,
        "top",
      );
    const finalCtaOverlayStyle = this._pickValue<FinalCtaOverlayStyle>(
      c.final_cta_overlay_style,
      "dark-gradient",
    );
    const finalCtaOverlayDarkness = Math.min(
      90,
      Math.max(
        0,
        typeof c.final_cta_overlay_darkness === "number"
          ? c.final_cta_overlay_darkness
          : 35,
      ),
    );
    const finalCtaStyle = [
      c.final_cta_background_color
        ? `--fcta-bg: ${c.final_cta_background_color}`
        : "",
      c.final_cta_text_color ? `--fcta-text: ${c.final_cta_text_color}` : "",
      c.final_cta_button_background
        ? `--fcta-button-bg: ${c.final_cta_button_background}`
        : "",
      c.final_cta_button_text_color
        ? `--fcta-button-text: ${c.final_cta_button_text_color}`
        : "",
      `--fcta-overlay-alpha: ${finalCtaOverlayDarkness / 100}`,
      `--fcta-overlay-soft-alpha: ${Math.max(0, finalCtaOverlayDarkness - 15) / 100}`,
      `--fcta-overlay-strong-alpha: ${Math.min(100, finalCtaOverlayDarkness + 20) / 100}`,
    ]
      .filter(Boolean)
      .join("; ");
    const logo = (c.logo || "").trim();
    const logoTone = this._pickValue<FooterLogoTone>(c.logo_tone, "original");
    const brandName = this.localizedString(c.brand_name) || "AUREN";
    const localizedDescription = this.localizedString(c.description);
    const localizedCopyright = this.localizedString(c.copyright);
    const socials = this._socials();
    const socialStyle = this._pickValue<FooterSocialStyle>(
      c.social_style,
      "filled",
    );
    const radius = this._pickValue<FooterRadius>(c.corner_radius, "rounded");
    const spacing = this._pickValue<FooterSpacing>(c.spacing, "comfortable");
    const sectionStyle = [
      c.background_color ? `--f-bg: ${c.background_color}` : "",
      c.text_color ? `--f-text: ${c.text_color}` : "",
    ]
      .filter(Boolean)
      .join("; ");

    return html`
      ${
        finalCtaEnabled
          ? html`
              <section
                class="final-cta"
                style=${finalCtaStyle}
                data-has-image=${finalCtaImage ? "true" : "false"}
                data-content-position=${finalCtaVerticalAlignment}
                data-overlay-style=${finalCtaOverlayStyle}
                data-button-style=${finalCtaButtonStyle}
                aria-label=${finalCtaText || "الدعوة الختامية"}
              >
                ${
                finalCtaImage
                  ? html`
                      <img
                        class="final-cta-image"
                        src=${finalCtaImage}
                        alt=""
                        aria-hidden="true"
                      />
                    `
                  : nothing
              }
                <div class="final-cta-content">
                  <div class="final-cta-panel">
                    ${
                    finalCtaText
                      ? html`<p class="final-cta-message">${finalCtaText}</p>`
                      : nothing
                  }
                    ${
                    finalCtaButtonLabel && finalCtaButtonUrl
                      ? html`
                          <a class="final-cta-button" href=${finalCtaButtonUrl}>
                            ${finalCtaButtonLabel}
                          </a>
                        `
                      : nothing
                  }
                  </div>
                </div>
              </section>
            `
          : nothing
      }
      <footer
        class="footer"
        style=${sectionStyle}
        data-radius=${radius}
        data-spacing=${spacing}
        data-logo-tone=${logoTone}
        aria-label="تذييل الصفحة"
      >
        <div class="inner">
          <div class="brand">
            ${
              logo
                ? html`<img class="logo" src=${logo} alt=${brandName} />`
                : html`<p class="brand-name">${brandName}</p>`
            }
          </div>

          ${
            localizedDescription
              ? html`<p class="description">${localizedDescription}</p>`
              : nothing
          }
          ${
            socials.length
              ? html`
                  <div class="socials" data-style=${socialStyle}>
                    ${socials.map(
                    (social) => html`
                      <a
                        class="social-link"
                        href=${social.href}
                        target=${ifDefined(social.href === "#" ? undefined : "_blank")}
                        rel=${ifDefined(
                          social.href === "#"
                            ? undefined
                            : "noopener noreferrer",
                        )}
                        aria-label=${social.networkName}
                      >
                        ${social.icon}
                      </a>
                    `,
                  )}
                  </div>
                `
              : nothing
          }
          ${localizedCopyright
            ? html`<p class="copyright">${localizedCopyright}</p>`
            : nothing}
        </div>
      </footer>
    `;
  }
}
