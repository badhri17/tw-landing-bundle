import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import { resolveSectionSpacing } from "../../shared/section-spacing";
import { resolveWaveEdges } from "../../shared/wave-edges";
import type { WaveEdgesResolved } from "../../shared/wave-edges";
import type {
  GalleryConfig,
  GalleryImageItem,
  GalleryAspect,
  GalleryRowStyle,
  GalleryItemSize,
  GalleryItemSizeDesktop,
} from "./types";
import {
  resolveSideElement,
  type SideElementResolved,
} from "../../shared/side-element";
import { galleryStyles } from "./style";

/** Photo width per size tier, as a share of the viewport. */
const ITEM_W_MOBILE: Record<GalleryItemSize, string> = {
  small: "43.2vw",
  medium: "62vw",
  large: "76vw",
};
/** Desktop tiers are their own scale — a 62vw photo would be absurd there. */
const ITEM_W_DESKTOP: Record<GalleryItemSize, string> = {
  small: "17vw",
  medium: "22vw",
  large: "28vw",
};

/**
 * <salla-gallery> — Gallery (معرض الصور)
 *
 * A row of product photos sitting beside each other and bleeding off both edges
 * of the section. Tapping one opens a full-screen lightbox where the visitor
 * moves between every image — arrows, keyboard, swipe or the thumbnail rail —
 * without leaving the page.
 *
 * Also hosts the reusable side design element (عنصر بصري جانبي): a decorative
 * transparent PNG parked against one edge and allowed to hang outside the
 * section. See ../../shared/side-element.ts.
 *
 * RTL-first and mobile-first; honours prefers-reduced-motion.
 */
export default class GrowthGallery extends GrowthElement {
  static styles = galleryStyles;

  @property({ type: Object })
  config?: GalleryConfig;

  /** Entrance gate for the row. */
  @state() private _animState: "ready" | "in" = "ready";
  /** Index of the open image; -1 when the lightbox is closed. */
  @state() private _lightboxIndex = -1;

  private _io: IntersectionObserver | null = null;
  private _fallbackTimer: number | null = null;
  private _onKeydown?: (e: KeyboardEvent) => void;
  /** body overflow captured while the lightbox holds the scroll lock. */
  private _prevBodyOverflow: string | null = null;
  private _touchStartX: number | null = null;
  private _stripLayoutSignature = "";

  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------

  /** Only photos that actually carry an image can render. */
  private _images(): GalleryImageItem[] {
    const list = this.config?.images;
    if (!Array.isArray(list)) return [];
    return list.filter(
      (it) => !!it && typeof it === "object" && !!(it.image || "").trim(),
    );
  }

  private _reduceMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private _lightboxEnabled(): boolean {
    return this.config?.enable_lightbox !== false;
  }

  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------

  private _reveal = () => {
    this._animState = "in";
    this._scheduleStripCenter();
    this._io?.disconnect();
    this._io = null;
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
  };

  connectedCallback() {
    super.connectedCallback();

    this._onKeydown = (e: KeyboardEvent) => {
      if (this._lightboxIndex < 0) return;
      if (e.key === "Escape") this._closeLightbox();
      else if (e.key === "ArrowRight") this._step(1);
      else if (e.key === "ArrowLeft") this._step(-1);
    };
    window.addEventListener("keydown", this._onKeydown);

    if (!("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }

    this._io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) this._reveal();
      },
      { threshold: 0.12 },
    );
    this._io.observe(this);

    // Safety net for contexts where the observer never reports an intersection
    // even though the section is on screen.
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
    if (this._onKeydown) window.removeEventListener("keydown", this._onKeydown);
    // Never leave the page unscrollable behind us.
    this._lightboxIndex = -1;
    this._syncScrollLock();
  }

  updated() {
    // Publish this section as a link target for the hero navbar. Runs every
    // cycle because Salla may inject `config` after the first render.
    this._syncAnchor(this.config?.anchor_id, "gallery");
    this._syncScrollLock();

    const c = this.config || {};
    const images = this._images();
    const rowStyle = this._pickValue<GalleryRowStyle | "staggered">(
      c.row_style,
      "equal",
    );
    const signature = [
      rowStyle,
      this._pickValue(c.item_size, "medium"),
      this._pickValue(c.aspect_ratio, "3/4"),
      this._num(c.gap, 12),
      ...images.map((image) => image.image || ""),
    ].join("|");

    if (signature !== this._stripLayoutSignature) {
      this._stripLayoutSignature = signature;
      this._scheduleStripCenter();
    }
  }

  private _scheduleStripCenter() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this._centerInitialImage());
    });
  }

  /** Start with the second photo centred so both neighbouring photos peek in. */
  private _centerInitialImage() {
    const strip = this.renderRoot.querySelector<HTMLElement>(".gal-strip");
    const items = strip?.querySelectorAll<HTMLElement>(".gal-item");
    if (!strip || strip.dataset.row !== "equal" || !items || items.length < 3)
      return;

    const item = items[1];
    const stripRect = strip.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const delta =
      itemRect.left +
      itemRect.width / 2 -
      (stripRect.left + stripRect.width / 2);
    strip.scrollLeft += delta;
  }

  /**
   * Hold the page still while the lightbox is open, and restore exactly what
   * was there before — themes sometimes set their own body overflow.
   */
  private _syncScrollLock() {
    const open = this._lightboxIndex >= 0;
    const locked = this._prevBodyOverflow !== null;
    if (open === locked) return;
    if (open) {
      this._prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = this._prevBodyOverflow ?? "";
      this._prevBodyOverflow = null;
    }
  }

  // ------------------------------------------------------------
  // Lightbox controls
  // ------------------------------------------------------------

  private _openLightbox(i: number) {
    if (!this._lightboxEnabled()) return;
    this._lightboxIndex = i;
  }

  private _closeLightbox = () => {
    this._lightboxIndex = -1;
  };

  /** Wrap around in both directions — a gallery has no natural end. */
  private _step(delta: number) {
    const n = this._images().length;
    if (n === 0) return;
    this._lightboxIndex = (this._lightboxIndex + delta + n) % n;
  }

  private _onBackdropClick = (e: MouseEvent) => {
    // Only a click on the backdrop itself closes; clicks on the image or the
    // controls must not.
    if (e.target === e.currentTarget) this._closeLightbox();
  };

  private _onTouchStart = (e: TouchEvent) => {
    this._touchStartX = e.changedTouches[0]?.clientX ?? null;
  };

  private _onTouchEnd = (e: TouchEvent) => {
    if (this._touchStartX === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - this._touchStartX;
    this._touchStartX = null;
    if (Math.abs(dx) < 40) return;
    // Swiping left moves forward in LTR and backward in RTL.
    const forward = this._lang() === "ar" ? dx > 0 : dx < 0;
    this._step(forward ? 1 : -1);
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  private _hostStyle(
    c: GalleryConfig,
    sideVars: string[],
    wave: WaveEdgesResolved,
  ): string {
    const sizeM = this._pickValue<GalleryItemSize>(c.item_size, "medium");
    const sizeDRaw = this._pickValue<GalleryItemSizeDesktop>(
      c.item_size_desktop,
      "inherit",
    );
    const sizeD = sizeDRaw === "inherit" ? sizeM : sizeDRaw;
    const gap = this._num(c.gap, 12);

    return [
      c.bg_color ? `--gal-bg:${c.bg_color}` : "",
      c.title_color ? `--gal-title:${c.title_color}` : "",
      c.lightbox_bg ? `--gal-lightbox-bg:${c.lightbox_bg}` : "",
      `--gal-item-m:${ITEM_W_MOBILE[sizeM] ?? "62vw"}`,
      `--gal-item-d:${ITEM_W_DESKTOP[sizeD] ?? "22vw"}`,
      `--gal-gap-m:${gap}px`,
      `--gal-gap-d:${Math.round(gap * 1.5)}px`,
      `--gal-radius:${this._num(c.card_radius, 14)}px`,
      `--gal-aspect:${this._pickValue<GalleryAspect>(c.aspect_ratio, "3/4")}`,
      ...sideVars,
      ...wave.vars,
      ...resolveSectionSpacing(
        c,
        (v, f) => this._pickValue(v, f),
      ),
    ]
      .filter(Boolean)
      .join("; ");
  }

  private _chevron() {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>`;
  }

  private _renderLightbox(images: GalleryImageItem[], c: GalleryConfig) {
    const i = this._lightboxIndex;
    const open = i >= 0;
    const current = open ? images[i] : undefined;
    const ar = this._lang() === "ar";
    const caption = current ? this.localizedString(current.alt) : "";
    const showThumbs = c.lightbox_thumbs !== false && images.length > 1;
    const showCounter = c.lightbox_counter !== false && images.length > 1;

    return html`<div
      class="lb"
      data-open=${open ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-hidden=${open ? "false" : "true"}
      aria-label=${ar ? "معرض الصور" : "Image gallery"}
      @click=${this._onBackdropClick}
      @touchstart=${this._onTouchStart}
      @touchend=${this._onTouchEnd}
    >
      <button
        class="lb-close"
        type="button"
        aria-label=${ar ? "إغلاق" : "Close"}
        @click=${this._closeLightbox}
      >
        ×
      </button>
      ${
        showCounter
          ? html`<span class="lb-counter"
              >${this._localeNum(i + 1)} /
              ${this._localeNum(images.length)}</span
            >`
          : nothing
      }

      <div class="lb-stage" @click=${this._onBackdropClick}>
        ${
          images.length > 1
            ? html`
                <button
                  class="lb-btn lb-prev"
                  type="button"
                  aria-label=${ar ? "السابق" : "Previous"}
                  @click=${() => this._step(-1)}
                >
                  ${this._chevron()}
                </button>
                <button
                  class="lb-btn lb-next"
                  type="button"
                  aria-label=${ar ? "التالي" : "Next"}
                  @click=${() => this._step(1)}
                >
                  ${this._chevron()}
                </button>
              `
            : nothing
        }
        ${
          current
            ? html`<figure class="lb-figure">
                <img
                  src=${current.image || ""}
                  alt=${caption}
                  decoding="async"
                />
                ${
                  caption
                    ? html`<figcaption class="lb-caption">
                        ${caption}
                      </figcaption>`
                    : nothing
                }
              </figure>`
            : nothing
        }
      </div>

      ${
        showThumbs
          ? html`<div class="lb-thumbs">
              ${images.map(
                (img, n) => html`
                  <button
                    class="lb-thumb"
                    type="button"
                    aria-current=${n === i ? "true" : "false"}
                    aria-label=${`${ar ? "صورة" : "Image"} ${this._localeNum(n + 1)}`}
                    @click=${() => (this._lightboxIndex = n)}
                  >
                    <img src=${img.image || ""} alt="" loading="lazy" />
                  </button>
                `,
              )}
            </div>`
          : nothing
      }
    </div>`;
  }

  render() {
    const c: GalleryConfig = this.config || {};
    const images = this._images();
    const resolveSide = (slot: 1 | 2) =>
      resolveSideElement(
        c,
        (v, f) => this._pickValue(v, f),
        (v, f) => this._num(v, f),
        slot,
      );
    const sides = [resolveSide(1), resolveSide(2)].filter(
      (side): side is SideElementResolved => !!side,
    );
    const wave = resolveWaveEdges(c, (v, f) => this._pickValue(v, f));
    const hostStyle = this._hostStyle(
      c,
      sides.flatMap((side) => side.vars),
      wave,
    );

    if (images.length === 0) {
      return html`<section class="gal" style=${hostStyle}>
        <p class="gal-empty">
          ${
            this._lang() === "ar"
              ? "أضف صورة واحدة على الأقل لعرض هذا القسم."
              : "Add at least one image to display this section."
          }
        </p>
      </section>`;
    }

    const title = this.localizedString(c.section_title);
    const savedRowStyle = this._pickValue<GalleryRowStyle | "staggered">(
      c.row_style,
      "equal",
    );
    // Old `staggered` configurations now render as the equal-width strip.
    const rowStyle: GalleryRowStyle =
      savedRowStyle === "grid" ? "grid" : "equal";
    const entrance = c.enable_entrance_anim !== false && !this._reduceMotion();
    const clickable = this._lightboxEnabled();

    return html`
      <section
        class="gal"
        style=${hostStyle}
        data-wave=${wave.on ? "on" : "off"}
      >
        ${sides.map(
          (side) =>
            html`<img
              class="gal-side"
              src=${side.image}
              alt=""
              aria-hidden="true"
              data-slot=${side.slot}
              data-side=${side.side}
              data-depth=${side.depth}
              decoding="async"
              loading="lazy"
            />`,
        )}
        ${
          title
            ? html`<header class="gal-header">
                <h2 class="gal-h2">${title}</h2>
              </header>`
            : nothing
        }

        <div
          class="gal-strip"
          data-row=${rowStyle}
          data-anim=${entrance ? this._animState : "in"}
        >
          ${images.map((img, i) => {
            const alt = this.localizedString(img.alt);
            return html`<button
              class="gal-item"
              type="button"
              data-static=${clickable ? "off" : "on"}
              ?disabled=${!clickable}
              aria-label=${
                clickable
                  ? `${this._lang() === "ar" ? "تكبير الصورة" : "Enlarge image"} ${this._localeNum(i + 1)}`
                  : nothing
              }
              @click=${() => this._openLightbox(i)}
            >
              <img
                src=${img.image || ""}
                alt=${alt}
                loading="lazy"
                decoding="async"
              />
            </button>`;
          })}
        </div>
      </section>
      ${clickable ? this._renderLightbox(images, c) : nothing}
    `;
  }
}
