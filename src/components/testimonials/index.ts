import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import { resolveSectionSpacing } from "../../shared/section-spacing";
import { resolveWaveEdges } from "../../shared/wave-edges";
import type { WaveEdgesResolved } from "../../shared/wave-edges";
import type {
  TestimonialsConfig,
  TestimonialItem,
  TestimonialsLayout,
  TestimonialCardStyle,
  TestimonialsColumns,
  TestimonialsColumnsDesktop,
  TestimonialRatingStyle,
  TestimonialPhotoAspect,
  TestimonialBgPosition,
} from "./types";
import { testimonialsStyles } from "./style";

/** Fallback avatar when a testimonial has no avatar image of its own. */
const DEFAULT_AVATAR =
  "https://cdn.salla.network/images/themes/landing-page/default-avatar.png";

/** Resolved per-card visibility + style flags, threaded into _renderCard. */
interface CardOpts {
  showRating: boolean;
  ratingStyle: TestimonialRatingStyle;
  showAvatar: boolean;
  showPhoto: boolean;
  showQuoteMark: boolean;
}

/**
 * <growth-testimonials> — Testimonials (آراء العملاء)
 * Part of the Growth Kit bundle for Salla Twilight.
 *
 * A premium, social-proof wall with two arrangements and six card shapes:
 *   • Layouts: carousel (scroll-snap with arrows/dots/autoplay) and grid.
 *   • Card styles: modern (photo-led with overlaid name chip) and quote
 *     (text-forward, with a large quotation mark).
 *   • Fractional star ratings (e.g. 4.9).
 *   • Premium motion: staggered entrance, hover-lift.
 *
 * RTL-first and mobile-first throughout; respects prefers-reduced-motion.
 */
export default class GrowthTestimonials extends GrowthElement {
  static styles = testimonialsStyles;


  @property({ type: Object })
  config?: TestimonialsConfig;

  /** Entrance gate. */
  @state() private _animState: "ready" | "in" = "ready";
  /** Active carousel page (drives dot highlighting). */
  @state() private _carouselPage = 0;
  /** Reactive desktop flag so cards-per-view re-evaluates on resize. */
  @state() private _isDesktop = false;

  private _mql?: MediaQueryList;
  private _onMqlChange?: () => void;
  private _autoplayTimer: number | null = null;
  private _scrollRaf: number | null = null;
  private _interactionPaused = false;
  /** Whether the section is visible — carousel autoplay pauses while
      off-screen (the CSS side keys off the host attribute). */
  private _inView = true;
  private _io: IntersectionObserver | null = null;
  /** Pointer-drag (desktop) state for the carousel track. */
  private _dragActive = false;
  private _dragStartX = 0;
  private _dragStartScroll = 0;

  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------


  private _isRtl(): boolean {
    return getComputedStyle(this).direction === "rtl";
  }


  /** Round a rating to one decimal and trim trailing zeros ("5.0" → "5"). */
  private _formatRating(n: number): string {
    if (Number.isNaN(n)) return "";
    return String(Math.round(n * 10) / 10);
  }

  /** Keep only testimonials that carry some renderable content. */
  private _items(): TestimonialItem[] {
    const list = this.config?.items;
    if (!Array.isArray(list)) return [];
    return list.filter((it) => {
      if (!it || typeof it !== "object") return false;
      return !!(
        this.localizedString(it.quote) ||
        this.localizedString(it.name) ||
        it.photo ||
        it.avatar
      );
    });
  }

  /** Resolve grid/carousel column counts (mobile-first; desktop "inherit" → mobile). */
  private _resolveColumns(): { mobile: number; desktop: number } {
    const c = this.config || {};
    const m = this._num(
      this._pickValue<TestimonialsColumns>(c.columns_mobile, "1"),
      1
    );
    const dRaw = this._pickValue<TestimonialsColumnsDesktop>(
      c.columns_desktop,
      "inherit"
    );
    const d = dRaw === "inherit" ? m : this._num(dRaw, 3);
    return {
      mobile: Math.max(1, Math.min(4, m)),
      desktop: Math.max(1, Math.min(4, d)),
    };
  }

  private _cardsPerView(): number {
    const cols = this._resolveColumns();
    return this._isDesktop ? cols.desktop : cols.mobile;
  }

  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------

  connectedCallback() {
    super.connectedCallback();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const animDisabled = this.config?.enable_entrance_anim === false;

    if (reduceMotion || animDisabled) {
      this._animState = "in";
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._animState = "in";
        });
      });
    }

    this._mql = window.matchMedia("(min-width: 768px)");
    this._isDesktop = this._mql.matches;
    this._onMqlChange = () => {
      this._isDesktop = this._mql!.matches;
      // Cards-per-view changed → re-clamp the active page.
      this._carouselPage = 0;
    };
    this._mql.addEventListener("change", this._onMqlChange);

    // Pause autoplay when scrolled out of view (saves CPU and prevents the
    // carousel from racing on a long page).
    if ("IntersectionObserver" in window) {
      this._io = new IntersectionObserver(
        (entries) => {
          const ent = entries[0];
          if (!ent) return;
          this._inView = ent.isIntersecting;
          this.toggleAttribute("out-of-view", !this._inView);
          this._teardownAutoplay();
          if (this._inView) this._setupAutoplay();
        },
        { threshold: 0.15 }
      );
      this._io.observe(this);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._mql && this._onMqlChange)
      this._mql.removeEventListener("change", this._onMqlChange);
    this._teardownAutoplay();
    this._io?.disconnect();
    this._io = null;
    if (this._scrollRaf) cancelAnimationFrame(this._scrollRaf);
  }

  updated() {
    // Publish this section as a link target for the hero navbar. Runs every
    // cycle because Salla may inject `config` after the first render.
    this._syncAnchor(this.config?.anchor_id, "testimonials");

    // (Re)wire autoplay whenever the render settles — config or state may change.
    this._teardownAutoplay();
    this._setupAutoplay();
  }

  // ------------------------------------------------------------
  // Carousel: scroll-snap navigation (RTL-safe via rect deltas)
  // ------------------------------------------------------------

  private get _track(): HTMLElement | null {
    return this.renderRoot.querySelector(".t-carousel-track");
  }

  private get _cells(): HTMLElement[] {
    const track = this._track;
    return track
      ? Array.from(track.querySelectorAll<HTMLElement>(".t-carousel-cell"))
      : [];
  }

  private _pageCount(total: number): number {
    return Math.max(1, Math.ceil(total / this._cardsPerView()));
  }

  /**
   * Index of the cell sitting closest to the track's centre.
   *
   * Measured with getBoundingClientRect rather than scrollLeft: RTL engines
   * genuinely disagree on scrollLeft's origin and sign (0 at the right edge
   * counting down in Chrome/Firefox, counting up elsewhere), while rectangles
   * read identically in both directions.
   */
  private _nearestCell(): number {
    const track = this._track;
    const cells = this._cells;
    if (!track || !cells.length) return 0;
    const tr = track.getBoundingClientRect();
    const mid = tr.left + tr.width / 2;
    let best = 0;
    let bestDist = Infinity;
    cells.forEach((cell, i) => {
      const cr = cell.getBoundingClientRect();
      const dist = Math.abs(cr.left + cr.width / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  private _scrollToPage(page: number) {
    const track = this._track;
    const cells = this._cells;
    if (!track || !cells.length) return;
    const pages = this._pageCount(this._items().length);
    const clamped = Math.max(0, Math.min(pages - 1, page));
    const perView = this._cardsPerView();
    const target = cells[Math.min(cells.length - 1, clamped * perView)];
    if (!target) return;
    const tr = track.getBoundingClientRect();
    const cr = target.getBoundingClientRect();
    // One card in view (the centred mobile strip) centres it; several in view
    // align its leading edge. Scrolling by a rect DELTA keeps both RTL-safe.
    const delta =
      perView === 1
        ? cr.left + cr.width / 2 - (tr.left + tr.width / 2)
        : this._isRtl()
        ? cr.right - tr.right
        : cr.left - tr.left;
    // Assign scrollLeft rather than calling scrollBy/scrollTo: the CSSOM methods
    // take an absolute `left` in a coordinate space RTL engines disagree about,
    // whereas += on a rect delta is direction-agnostic. The smooth animation
    // still comes from `scroll-behavior: smooth` on the track.
    track.scrollLeft += delta;
    this._carouselPage = clamped;
  }

  private _carouselPrev = () => {
    const pages = this._pageCount(this._items().length);
    let p = this._carouselPage - 1;
    if (p < 0) p = this.config?.carousel_loop !== false ? pages - 1 : 0;
    this._scrollToPage(p);
  };

  private _carouselNext = () => {
    const pages = this._pageCount(this._items().length);
    let p = this._carouselPage + 1;
    if (p >= pages) p = this.config?.carousel_loop !== false ? 0 : pages - 1;
    this._scrollToPage(p);
  };

  private _onTrackScroll = () => {
    if (this._scrollRaf) return;
    this._scrollRaf = requestAnimationFrame(() => {
      this._scrollRaf = null;
      const track = this._track;
      if (!track || track.clientWidth === 0) return;
      const page = Math.floor(this._nearestCell() / this._cardsPerView());
      const pages = this._pageCount(this._items().length);
      const clamped = Math.max(0, Math.min(pages - 1, page));
      if (clamped !== this._carouselPage) this._carouselPage = clamped;
    });
  };

  // --- Desktop pointer-drag (mouse only; touch keeps native momentum) ---
  private _onDragDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const track = this._track;
    if (!track) return;
    this._dragActive = true;
    this._dragStartX = e.clientX;
    this._dragStartScroll = track.scrollLeft;
    track.style.scrollSnapType = "none";
    track.style.scrollBehavior = "auto";
    track.classList.add("is-grabbing");
  };

  private _onDragMove = (e: PointerEvent) => {
    if (!this._dragActive) return;
    const track = this._track;
    if (!track) return;
    const dx = e.clientX - this._dragStartX;
    track.scrollLeft = this._dragStartScroll - dx;
  };

  private _endDrag = () => {
    const track = this._track;
    if (!track || !this._dragActive) return;
    this._dragActive = false;
    track.style.scrollSnapType = "";
    track.style.scrollBehavior = "";
    track.classList.remove("is-grabbing");
  };

  // ------------------------------------------------------------
  // Autoplay (carousel only)
  // ------------------------------------------------------------

  private _setupAutoplay() {
    const c = this.config || {};
    const layout = this._pickValue<TestimonialsLayout>(c.layout, "grid");
    if (layout !== "carousel" || !c.carousel_autoplay) return;
    if (this._interactionPaused) return;
    if (!this._inView) return;
    if (this._pageCount(this._items().length) < 2) return;

    const delay = Math.max(2, this._num(c.carousel_autoplay_delay, 5)) * 1000;
    this._autoplayTimer = window.setTimeout(() => {
      this._autoplayTimer = null;
      this._carouselNext();
    }, delay);
  }

  private _teardownAutoplay() {
    if (this._autoplayTimer) {
      clearTimeout(this._autoplayTimer);
      this._autoplayTimer = null;
    }
  }

  private _pauseInteraction = () => {
    if (this._interactionPaused) return;
    this._interactionPaused = true;
    this._teardownAutoplay();
  };

  private _resumeInteraction = () => {
    if (!this._interactionPaused) return;
    this._interactionPaused = false;
    this._setupAutoplay();
  };

  // ------------------------------------------------------------
  // Icons
  // ------------------------------------------------------------

  private _starPath =
    "M12 17.27l-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73 1.64 7.03z";

  private _icon(name: "chevron" | "quote") {
    switch (name) {
      case "chevron":
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>`;
      case "quote":
        return html`<svg viewBox="0 0 24 24" fill="currentColor"
          aria-hidden="true"><path d="M9.5 7C6.5 7 4 9.5 4 12.5V19h6.5v-6.5H7.2c0-1.8 1.5-3 3.3-3V7zm10 0C16.5 7 14 9.5 14 12.5V19h6.5v-6.5h-3.3c0-1.8 1.5-3 3.3-3V7z" /></svg>`;
    }
  }

  // ------------------------------------------------------------
  // Render: stars
  // ------------------------------------------------------------

  private _renderStars(rating: number) {
    const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
    const row = (cls: string) => html`
      <div class=${cls} aria-hidden="true">
        ${[0, 1, 2, 3, 4].map(
          () => html`<svg viewBox="0 0 24 24"><path d=${this._starPath} /></svg>`
        )}
      </div>
    `;
    return html`
      <div class="t-stars" style=${`--t-star-pct:${pct}%`}>
        ${row("t-stars-bg")}
        <div class="t-stars-fg-clip">${row("t-stars-fg")}</div>
      </div>
    `;
  }

  private _renderRating(item: TestimonialItem, style: TestimonialRatingStyle) {
    const rating = Math.max(0, Math.min(5, this._num(item.rating, 5)));
    if (rating <= 0) return nothing;
    const label = this._formatRating(rating);
    if (style === "number") {
      return html`<div class="t-rating t-rating--num" aria-label=${`${label}/5`}>
        <svg class="t-rating-star" viewBox="0 0 24 24" aria-hidden="true">
          <path d=${this._starPath} />
        </svg>
        <span>${label}</span>
      </div>`;
    }
    return html`<div class="t-rating" aria-label=${`${label}/5`} role="img">
      ${this._renderStars(rating)}
      ${style === "stars-number"
        ? html`<span class="t-rating-text">(${label}/5)</span>`
        : nothing}
    </div>`;
  }

  // ------------------------------------------------------------
  // Render: a single testimonial card (shared across all layouts)
  // ------------------------------------------------------------

  private _renderCard(
    item: TestimonialItem,
    index: number,
    cardStyle: TestimonialCardStyle,
    opts: CardOpts
  ) {
    const localizedName = this.localizedString(item.name);
    const localizedMeta = this.localizedString(item.meta);
    const localizedQuote = this.localizedString(item.quote);

    // "modern" shows the customer's own product photo (UGC) and can toggle it off
    // for a text-only card; "quote" always uses the small round avatar instead.
    const photo =
      cardStyle === "modern" && opts.showPhoto ? item.photo || "" : "";
    const avatar = opts.showAvatar ? item.avatar || DEFAULT_AVATAR : "";

    const ratingBlock = opts.showRating
      ? this._renderRating(item, opts.ratingStyle)
      : nothing;

    // `stacked` centres the block and puts the avatar above the name — the
    // quote card leads with the author, the modern card trails with it.
    const author = (withAvatar: boolean, stacked = false) =>
      localizedName || localizedMeta || (withAvatar && avatar)
        ? html`<div
            class=${stacked ? "t-author t-author--stacked" : "t-author"}
          >
            ${withAvatar && avatar
              ? html`<span class="t-avatar"
                  ><img src=${avatar} alt=${localizedName} loading="lazy"
                /></span>`
              : nothing}
            <div class="t-author-meta">
              ${localizedName
                ? html`<span class="t-name">${localizedName}</span>`
                : nothing}
              ${localizedMeta
                ? html`<span class="t-meta">${localizedMeta}</span>`
                : nothing}
            </div>
          </div>`
        : nothing;

    // --- modern: photo on top with an overlaid name chip (reference design) ---
    if (cardStyle === "modern") {
      return html`
        <article class="t-card" data-style="modern" data-index=${index}>
          ${photo
            ? html`<div class="t-photo">
                <img
                  src=${photo}
                  alt=${localizedName
                    ? `تصوير العميل: ${localizedName}`
                    : "تصوير العميل"}
                  loading="lazy"
                />
                ${localizedName || localizedMeta
                  ? html`<span class="t-photo-chip">
                      ${avatar
                        ? html`<img
                            class="t-photo-chip-avatar"
                            src=${avatar}
                            alt=${localizedName}
                            loading="lazy"
                          />`
                        : nothing}
                      <span class="t-photo-chip-text"
                        >${localizedName}${localizedMeta
                          ? html`, ${localizedMeta}`
                          : nothing}</span
                      >
                    </span>`
                  : nothing}
              </div>`
            : nothing}
          <div class="t-body">
            ${!photo ? author(true) : nothing} ${ratingBlock}
            ${localizedQuote
              ? html`<p class="t-quote">${localizedQuote}</p>`
              : nothing}
          </div>
        </article>
      `;
    }

    // --- quote: centred text card — avatar, name, stars, then the quote ---
    return html`
      <article class="t-card" data-style="quote" data-index=${index}>
        ${opts.showQuoteMark
          ? html`<span class="t-quote-mark">${this._icon("quote")}</span>`
          : nothing}
        ${author(true, true)}
        ${ratingBlock}
        ${localizedQuote
          ? html`<p class="t-quote">${localizedQuote}</p>`
          : nothing}
      </article>
    `;
  }

  // ------------------------------------------------------------
  // Render: layouts
  // ------------------------------------------------------------

  private _renderCarousel(
    items: TestimonialItem[],
    cardStyle: TestimonialCardStyle,
    opts: CardOpts
  ) {
    const c = this.config || {};
    const showArrows = c.carousel_arrows !== false;
    const showDots = c.carousel_dots !== false;
    const pages = this._pageCount(items.length);
    const multiPage = pages > 1;

    return html`
      <div
        class="t-carousel"
        @mouseenter=${this._pauseInteraction}
        @mouseleave=${this._resumeInteraction}
      >
        <div
          class="t-carousel-track"
          @scroll=${this._onTrackScroll}
          @pointerdown=${this._onDragDown}
          @pointermove=${this._onDragMove}
          @pointerup=${this._endDrag}
          @pointercancel=${this._endDrag}
          @pointerleave=${this._endDrag}
        >
          ${items.map(
            (item, i) =>
              html`<div class="t-carousel-cell">
                ${this._renderCard(item, i, cardStyle, opts)}
              </div>`
          )}
        </div>

        ${showArrows && multiPage
          ? html`
              <button
                type="button"
                class="t-arrow t-arrow--prev"
                aria-label=${this._lang() === "ar" ? "السابق" : "Previous"}
                @click=${this._carouselPrev}
              >
                ${this._icon("chevron")}
              </button>
              <button
                type="button"
                class="t-arrow t-arrow--next"
                aria-label=${this._lang() === "ar" ? "التالي" : "Next"}
                @click=${this._carouselNext}
              >
                ${this._icon("chevron")}
              </button>
            `
          : nothing}
      </div>
      ${showDots && multiPage
        ? html`<div class="t-dots" role="tablist">
            ${Array.from({ length: pages }).map(
              (_, p) => html`<button
                type="button"
                class="t-dot"
                aria-current=${this._carouselPage === p ? "true" : "false"}
                aria-label=${`${this._lang() === "ar" ? "صفحة" : "Page"} ${p + 1}`}
                @click=${() => this._scrollToPage(p)}
              ></button>`
            )}
          </div>`
        : nothing}
    `;
  }

  private _renderGrid(
    items: TestimonialItem[],
    cardStyle: TestimonialCardStyle,
    opts: CardOpts
  ) {
    return html`<div class="t-grid">
      ${items.map(
        (item, i) =>
          html`<div class="t-grid-cell">
            ${this._renderCard(item, i, cardStyle, opts)}
          </div>`
      )}
    </div>`;
  }

  // ------------------------------------------------------------
  // Render: host style (CSS custom properties)
  // ------------------------------------------------------------

  private _buildHostStyle(
    c: TestimonialsConfig,
    wave: WaveEdgesResolved
  ): string {
    const cols = this._resolveColumns();
    const cardRadius = this._num(c.card_radius, 20);
    const aspect: TestimonialPhotoAspect = this._pickValue<TestimonialPhotoAspect>(
      c.photo_aspect,
      "4/5"
    );
    // Section background photo. The scrim is the section's own colour at the
    // merchant's opacity, declared here on the same element as --t-bg so the
    // color-mix resolves against the value being written beside it — a derived
    // property declared on :host would resolve against the host's default and
    // silently ignore a custom bg_color.
    const bgImage =
      c.enable_bg_image !== false ? (c.bg_image || "").trim() : "";
    const scrim = Math.min(100, Math.max(0, this._num(c.bg_overlay, 62)));
    const veil = `color-mix(in srgb, var(--t-bg) ${scrim}%, transparent)`;

    const parts = [
      c.bg_color ? `--t-bg:${c.bg_color}` : "",
      bgImage ? `--t-bg-img:url("${encodeURI(bgImage)}")` : "",
      bgImage ? `--t-bg-scrim:linear-gradient(${veil}, ${veil})` : "",
      bgImage
        ? `--t-bg-pos:${this._pickValue<TestimonialBgPosition>(
            c.bg_position,
            "center"
          )}`
        : "",
      c.title_color ? `--t-title:${c.title_color}` : "",
      c.subtitle_color ? `--t-subtitle:${c.subtitle_color}` : "",
      c.card_bg ? `--t-card-bg:${c.card_bg}` : "",
      c.border_color ? `--t-border:${c.border_color}` : "",
      c.name_color ? `--t-name:${c.name_color}` : "",
      c.meta_color ? `--t-meta:${c.meta_color}` : "",
      c.text_color ? `--t-text:${c.text_color}` : "",
      c.star_color ? `--t-star:${c.star_color}` : "",
      c.star_empty_color ? `--t-star-empty:${c.star_empty_color}` : "",
      c.accent_color ? `--t-accent:${c.accent_color}` : "",
      c.arrow_bg ? `--t-arrow-bg:${c.arrow_bg}` : "",
      c.arrow_icon_color ? `--t-arrow-fg:${c.arrow_icon_color}` : "",
      `--t-radius:${cardRadius}px`,
      `--t-aspect:${aspect}`,
      `--t-cols-mobile:${cols.mobile}`,
      `--t-cols-desktop:${cols.desktop}`,
      ...resolveSectionSpacing(
        c,
        (v, f) => this._pickValue(v, f),
      ),
      ...wave.vars,
    ];
    return parts.filter(Boolean).join("; ");
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  render() {
    const c: TestimonialsConfig = this.config || {};
    const items = this._items();

    const layout = this._pickValue<TestimonialsLayout>(c.layout, "grid");
    const cardStyle = this._pickValue<TestimonialCardStyle>(
      c.card_style,
      "modern"
    );
    const ratingStyle = this._pickValue<TestimonialRatingStyle>(
      c.rating_style,
      "stars-number"
    );
    const enableAnim = c.enable_entrance_anim !== false;
    const hoverLift = c.enable_hover_lift !== false;

    const opts: CardOpts = {
      showRating: c.show_rating !== false,
      ratingStyle,
      showAvatar: c.show_avatar !== false,
      showPhoto: c.show_photo !== false,
      showQuoteMark: c.show_quote_mark !== false,
    };

    const wave = resolveWaveEdges(c, (v, f) => this._pickValue(v, f));
    const hostStyle = this._buildHostStyle(c, wave);

    const localizedEyebrow = this.localizedString(c.eyebrow);
    const localizedSectionTitle = this.localizedString(c.section_title);
    const localizedSectionSubtitle = this.localizedString(c.section_subtitle);

    const showSummary = c.show_summary === true;
    const summaryRating = Math.max(0, Math.min(5, this._num(c.summary_rating, 0)));
    const summaryCount = this.localizedString(c.summary_count_text);
    const hasSummary = showSummary && (summaryRating > 0 || !!summaryCount);

    if (items.length === 0) {
      return html`<section class="t-section" style=${hostStyle}>
        <p class="t-empty">
          ${this._lang() === "ar"
            ? "أضف رأي عميل واحدًا على الأقل لعرض هذا القسم."
            : "Add at least one testimonial to display this section."}
        </p>
      </section>`;
    }

    const header =
      localizedEyebrow ||
      localizedSectionTitle ||
      localizedSectionSubtitle ||
      hasSummary
        ? html`<header
            class="t-header"
            data-anim=${enableAnim ? this._animState : "in"}
          >
            ${localizedEyebrow
              ? html`<p class="t-eyebrow">${localizedEyebrow}</p>`
              : nothing}
            ${localizedSectionTitle
              ? html`<h2 class="t-title">${localizedSectionTitle}</h2>`
              : nothing}
            ${localizedSectionSubtitle
              ? html`<p class="t-subtitle">${localizedSectionSubtitle}</p>`
              : nothing}
            ${hasSummary
              ? html`<div class="t-summary">
                  ${summaryRating > 0
                    ? html`<span class="t-summary-num"
                          >${this._formatRating(summaryRating)}</span
                        >${this._renderStars(summaryRating)}`
                    : nothing}
                  ${summaryCount
                    ? html`<span class="t-summary-count">${summaryCount}</span>`
                    : nothing}
                </div>`
              : nothing}
          </header>`
        : nothing;

    const body =
      layout === "carousel"
        ? this._renderCarousel(items, cardStyle, opts)
        : this._renderGrid(items, cardStyle, opts);

    return html`
      <section
        class="t-section"
        style=${hostStyle}
        data-wave=${wave.on ? "on" : "off"}
        data-layout=${layout}
        data-card=${cardStyle}
        data-anim=${enableAnim ? this._animState : "in"}
        data-hover-lift=${hoverLift ? "on" : "off"}
      >
        ${header}
        <div class="t-body-wrap">${body}</div>
      </section>
    `;
  }
}
