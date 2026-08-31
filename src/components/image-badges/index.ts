import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import { resolveSectionSpacing } from "../../shared/section-spacing";
import { imageBadgesStyles } from "./style";
import type {
  ImageBadgeItem,
  ImageBadgesColumnsDesktop,
  ImageBadgesColumnsMobile,
  ImageBadgesConfig,
  ImageBadgesGap,
  ImageBadgesLayout,
  ImageBadgesSize,
  ImageBadgesSizeDesktop,
} from "./types";

const SIZE_MOBILE: Record<ImageBadgesSize, number> = {
  sm: 100,
  md: 132,
  lg: 164,
};

const SIZE_DESKTOP: Record<ImageBadgesSize, number> = {
  sm: 140,
  md: 180,
  lg: 220,
};

const GAP_MOBILE: Record<ImageBadgesGap, number> = {
  compact: 4,
  normal: 18,
  spacious: 32,
};

const GAP_DESKTOP: Record<ImageBadgesGap, number> = {
  compact: 8,
  normal: 28,
  spacious: 44,
};

export default class ImageBadges extends GrowthElement {
  static styles = imageBadgesStyles;

  @property({ type: Object })
  config?: ImageBadgesConfig;

  @state() private _animState: "ready" | "in" = "ready";

  private _io: IntersectionObserver | null = null;

  private _items(): ImageBadgeItem[] {
    const items = this.config?.items;
    if (!Array.isArray(items)) return [];
    return items.filter(
      (item) =>
        !!item && typeof item === "object" && !!(item.image || "").trim(),
    );
  }

  private _reduceMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!("IntersectionObserver" in window) || this._reduceMotion()) {
      this._animState = "in";
      return;
    }

    this._io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        this._animState = "in";
        this._io?.disconnect();
        this._io = null;
      },
      { threshold: 0.15 },
    );
    this._io.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._io?.disconnect();
    this._io = null;
  }

  protected updated() {
    this._syncAnchor(this.config?.anchor_id, "image-badges");
  }

  private _layout(c: ImageBadgesConfig): ImageBadgesLayout {
    return this._pickValue<ImageBadgesLayout>(c.layout, "pyramid");
  }

  private _columns(c: ImageBadgesConfig) {
    const mobile = this._num(
      this._pickValue<ImageBadgesColumnsMobile>(c.columns_mobile, "3"),
      3,
    );
    const desktopRaw = this._pickValue<ImageBadgesColumnsDesktop>(
      c.columns_desktop,
      "inherit",
    );
    const desktop =
      desktopRaw === "inherit" ? mobile : this._num(desktopRaw, mobile);
    return {
      mobile: Math.max(2, Math.min(4, mobile)),
      desktop: Math.max(3, Math.min(6, desktop)),
    };
  }

  private _sizes(c: ImageBadgesConfig) {
    const mobile = this._pickValue<ImageBadgesSize>(c.image_size_mobile, "lg");
    const desktopRaw = this._pickValue<ImageBadgesSizeDesktop>(
      c.image_size_desktop,
      "inherit",
    );
    const desktop = desktopRaw === "inherit" ? mobile : desktopRaw;
    return {
      mobile: SIZE_MOBILE[mobile] ?? SIZE_MOBILE.md,
      desktop: SIZE_DESKTOP[desktop] ?? SIZE_DESKTOP.md,
    };
  }

  private _hostStyle(c: ImageBadgesConfig): string {
    const columns = this._columns(c);
    const sizes = this._sizes(c);
    const gap = this._pickValue<ImageBadgesGap>(c.gap, "compact");
    return [
      c.bg_color ? `--ib-bg:${c.bg_color}` : "",
      c.title_color ? `--ib-title:${c.title_color}` : "",
      c.subtitle_color ? `--ib-subtitle:${c.subtitle_color}` : "",
      c.item_title_color ? `--ib-item-title:${c.item_title_color}` : "",
      `--ib-cols-m:${columns.mobile}`,
      `--ib-cols-d:${columns.desktop}`,
      `--ib-size-m:${sizes.mobile}px`,
      `--ib-size-d:${sizes.desktop}px`,
      `--ib-gap-m:${GAP_MOBILE[gap] ?? GAP_MOBILE.normal}px`,
      `--ib-gap-d:${GAP_DESKTOP[gap] ?? GAP_DESKTOP.normal}px`,
      ...resolveSectionSpacing(c, (value, fallback) =>
        this._pickValue(value, fallback),
      ),
    ]
      .filter(Boolean)
      .join("; ");
  }

  render() {
    const c: ImageBadgesConfig = this.config || {};
    const items = this._items();
    const title = this.localizedString(c.section_title);
    const subtitle = this.localizedString(c.section_subtitle);
    const entrance = c.enable_entrance_anim !== false && !this._reduceMotion();
    const hostStyle = this._hostStyle(c);

    if (items.length === 0) {
      return html`<section class="ib-section" style=${hostStyle}>
        <p class="ib-empty">
          ${
            this._lang() === "ar"
              ? "أضف صورة واحدة على الأقل لعرض الشارات."
              : "Add at least one image to display the badges."
          }
        </p>
      </section>`;
    }

    return html`
      <section
        class="ib-section"
        style=${hostStyle}
        data-anim=${entrance ? this._animState : "in"}
      >
        ${
          title || subtitle
            ? html`<header class="ib-header">
                ${title ? html`<h2 class="ib-title">${title}</h2>` : nothing}
                ${
                subtitle
                  ? html`<p class="ib-subtitle">${subtitle}</p>`
                  : nothing
              }
              </header>`
            : nothing
        }

        <div class="ib-grid" data-layout=${this._layout(c)}>
          ${items.map((item, index) => {
            const itemTitle = this.localizedString(item.title);
            const imageAlt = this.localizedString(item.image_alt) || itemTitle;
            return html`<figure class="ib-item" style=${`--i:${index}`}>
              <img
                class="ib-image"
                src=${item.image || ""}
                alt=${imageAlt}
                loading="lazy"
                decoding="async"
              />
              ${
                itemTitle
                  ? html`<figcaption class="ib-item-title">
                      ${itemTitle}
                    </figcaption>`
                  : nothing
              }
            </figure>`;
          })}
        </div>
      </section>
    `;
  }
}
