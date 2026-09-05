import { html, nothing, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import { resolveSectionSpacing } from "../../shared/section-spacing";
import type {
  CollectionConfig,
  CollectionAnimation,
  CollectionAspect,
  CollectionDesktopLayout,
  CollectionSlideItem,
} from "./types";
import { collectionStyles } from "./style";

/**
 * <growth-collection> — Bundle contents slider (مكونات المجموعة)
 * Part of the Growth Kit bundle for Salla Twilight.
 *
 * Shows what's inside a bundle/kit. Landing-page only: slides are informational,
 * with no product link and no shop CTA.
 *
 * Two animation modes:
 *   • simple → active slide scales up & saturates (360.html style).
 *   • reveal → swap a closed image for an opened image on the active slide
 *              (daily.html style). Slides without an `image_opened` fall back
 *              to the simple behaviour automatically.
 */
export default class GrowthCollection extends GrowthElement {
  static styles = collectionStyles;

  @property({ type: Object })
  config?: CollectionConfig;

  @state() private _activeIndex = 0;
  /** Drives the header fade-in. */
  @state() private _animState: "ready" | "in" = "ready";
  /** Drives the caption fade — flips out → in when the active slide changes. */
  @state() private _captionState: "in" | "out" = "in";

  private _autoplayTimer: number | null = null;
  private _captionTimer: number | null = null;
  private _hoverPaused = false;
  private _hasInitializedActive = false;
  /** Whether the section is visible — autoplay pauses while off-screen. */
  private _inView = true;
  private _io: IntersectionObserver | null = null;

  /** Swipe tracking on the track. */
  private _swipeStartX: number | null = null;
  private _swipeStartY: number | null = null;
  private _swipeActive = false;

  /** Last-rendered wrapped offset per slide index — lets us detect a slide
      that wrapped around the loop so we can snap it instead of flying it. */
  private _prevDiff = new Map<number, number>();

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------

  private _slides() {
    const list = this.config?.slides;
    if (!Array.isArray(list)) return [];
    return list.filter((s) => {
      if (!s || typeof s !== "object") return false;
      return !!(s.image || s.image_opened);
    });
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
      // Double rAF so the browser paints the "ready" frame first, then animates.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._animState = "in";
        });
      });
    }

    // Pause autoplay when scrolled out of view (saves CPU and prevents the
    // slider from racing on a long page).
    if ("IntersectionObserver" in window) {
      this._io = new IntersectionObserver(
        (entries) => {
          const ent = entries[0];
          if (!ent) return;
          this._inView = ent.isIntersecting;
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
    this._teardownAutoplay();
    this._io?.disconnect();
    this._io = null;
    if (this._captionTimer) {
      clearTimeout(this._captionTimer);
      this._captionTimer = null;
    }
  }

  willUpdate(changed: PropertyValues) {
    if (!changed.has("config")) return;

    const slides = this._slides();
    if (!this._hasInitializedActive && slides.length > 0) {
      const wanted = this._num(this.config?.initial_slide, NaN);
      // The coverflow starts centered so both neighbours peek in.
      const autoStart = Math.floor(slides.length / 2);
      const start = Number.isNaN(wanted)
        ? autoStart
        : Math.max(0, Math.min(slides.length - 1, Math.round(wanted) - 1));
      this._activeIndex = start;
      this._hasInitializedActive = true;
    } else if (this._activeIndex >= slides.length) {
      this._activeIndex = Math.max(0, slides.length - 1);
    }

    this._teardownAutoplay();
    this._setupAutoplay();
  }

  updated() {
    // Publish this section as a link target for the hero navbar. Runs every
    // cycle because Salla may inject `config` after the first render.
    this._syncAnchor(this.config?.anchor_id, "collection");

    // Snapshot where each slide ended up so the next render can tell which
    // slide wrapped around the loop (see the `instant` check in render).
    const n = this._slides().length;
    this._prevDiff.clear();
    for (let i = 0; i < n; i++) this._prevDiff.set(i, this._wrappedDiff(i));
  }

  // ------------------------------------------------------------
  // Autoplay
  // ------------------------------------------------------------

  private _setupAutoplay() {
    const c = this.config || {};
    if (!c.autoplay) return;
    if (!this._inView) return;
    if (this._slides().length < 2) return;
    const delaySec = Math.max(1, this._num(c.autoplay_delay, 5));
    this._autoplayTimer = window.setInterval(() => {
      if (this._hoverPaused || this._swipeActive) return;
      this._goNext();
    }, delaySec * 1000);
  }

  private _teardownAutoplay() {
    if (this._autoplayTimer) {
      clearInterval(this._autoplayTimer);
      this._autoplayTimer = null;
    }
  }

  // ------------------------------------------------------------
  // Carousel navigation
  // ------------------------------------------------------------

  private _changeActive(next: number) {
    if (next === this._activeIndex) return;
    this._activeIndex = next;
    this._flashCaption();
  }

  /** Brief fade-out → text swap → fade-in on the caption block. */
  private _flashCaption() {
    if (this._captionTimer) {
      clearTimeout(this._captionTimer);
      this._captionTimer = null;
    }
    this._captionState = "out";
    this._captionTimer = window.setTimeout(() => {
      this._captionState = "in";
      this._captionTimer = null;
    }, 220);
  }

  private _goPrev = () => {
    const n = this._slides().length;
    if (n <= 1) return;
    const loop = this.config?.loop === true;
    let next = this._activeIndex - 1;
    if (next < 0) next = loop ? n - 1 : 0;
    this._changeActive(next);
  };

  private _goNext = () => {
    const n = this._slides().length;
    if (n <= 1) return;
    const loop = this.config?.loop === true;
    let next = this._activeIndex + 1;
    if (next >= n) next = loop ? 0 : n - 1;
    this._changeActive(next);
  };

  private _goTo = (idx: number) => {
    const n = this._slides().length;
    if (idx < 0 || idx >= n) return;
    this._changeActive(idx);
  };

  /** Signed slot offset from the active slide, wrapped to the shorter way
      around the ring when looping (so slide 0 can sit just left of the last). */
  private _wrappedDiff(i: number): number {
    const n = this._slides().length;
    if (n === 0) return 0;
    let diff = i - this._activeIndex;
    if (this.config?.loop === true) {
      if (diff > n / 2) diff -= n;
      if (diff < -n / 2) diff += n;
    }
    return diff;
  }

  private _slidePos(
    i: number
  ): "active" | "left" | "right" | "far-left" | "far-right" | "hidden" {
    if (this._slides().length === 0) return "hidden";
    const diff = this._wrappedDiff(i);
    if (diff === 0) return "active";
    if (diff === -1) return "left";
    if (diff === 1) return "right";
    if (diff === -2) return "far-left";
    if (diff === 2) return "far-right";
    return "hidden";
  }

  private _isPrevDisabled(): boolean {
    if (this.config?.loop === true) return false;
    return this._activeIndex === 0 || this._slides().length <= 1;
  }
  private _isNextDisabled(): boolean {
    if (this.config?.loop === true) return false;
    return (
      this._activeIndex === this._slides().length - 1 ||
      this._slides().length <= 1
    );
  }

  // ------------------------------------------------------------
  // Click / swipe to navigate
  // ------------------------------------------------------------

  private _onSlideClick = (e: MouseEvent) => {
    if (this._swipeActive) return;
    const slide = e.currentTarget as HTMLElement | null;
    if (!slide) return;
    // Active slide stays put; any side or far slide is brought to center —
    // matches the reference's click-to-focus.
    if (slide.dataset.pos === "active") return;
    const idx = Number(slide.dataset.index);
    if (Number.isInteger(idx)) this._goTo(idx);
  };

  private _onPointerDown = (e: PointerEvent) => {
    if (this._slides().length <= 1) return;
    // Capture so a release outside the stage still lands on our pointerup.
    // Without it, _swipeStartX stays non-null after the pointer leaves and the
    // next move over the stage resumes a phantom drag from the stale origin.
    try {
      (e.currentTarget as HTMLElement | null)?.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    this._swipeStartX = e.clientX;
    this._swipeStartY = e.clientY;
    this._swipeActive = false;
  };

  private _onPointerMove = (e: PointerEvent) => {
    if (this._swipeStartX === null) return;
    const dx = e.clientX - this._swipeStartX;
    const dy = e.clientY - (this._swipeStartY ?? e.clientY);
    if (!this._swipeActive && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy))
      this._swipeActive = true;
  };

  private _onPointerUp = (e: PointerEvent) => {
    try {
      const el = e.currentTarget as HTMLElement | null;
      if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    if (this._swipeStartX === null) return;
    const dx = e.clientX - this._swipeStartX;
    const isRtl = getComputedStyle(this).direction === "rtl";
    if (this._swipeActive && Math.abs(dx) > 40) {
      const advance = isRtl ? dx > 0 : dx < 0;
      if (advance) this._goNext();
      else this._goPrev();
    }
    this._swipeStartX = null;
    this._swipeStartY = null;
    window.setTimeout(() => {
      this._swipeActive = false;
    }, 50);
  };

  private _onHoverIn = () => {
    this._hoverPaused = true;
  };
  private _onHoverOut = () => {
    this._hoverPaused = false;
  };

  // ------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------

  private _slideImage(
    slide: CollectionSlideItem
  ): { closed?: string; opened?: string; localizedAlt: string } {
    const closed = slide.image || undefined;
    const opened = slide.image_opened || undefined;
    const localizedAlt = this.localizedString(slide.title) || "";
    return { closed, opened, localizedAlt };
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  render() {
    const c: CollectionConfig = this.config || {};
    const slides = this._slides();
    const animation = this._pickValue<CollectionAnimation>(
      c.slide_animation,
      "reveal"
    );
    const aspect = this._pickValue<CollectionAspect>(c.aspect_ratio, "1/1");
    const layout = this._pickValue<CollectionDesktopLayout>(
      c.desktop_layout,
      "coverflow"
    );

    const localizedSectionTitle = this.localizedString(
      c.section_title ?? c.title
    );
    const showCaption = c.show_caption !== false;
    const showNav = c.show_nav_buttons === true;
    const showDots = !!c.show_pagination;
    const enableAnim = c.enable_entrance_anim !== false;
    const cardRadius = this._num(c.card_radius, 20);

    const hostStyle = [
      c.bg_color ? `--col-bg: ${c.bg_color}` : "",
      c.title_color ? `--col-title-color: ${c.title_color}` : "",
      c.caption_title_color
        ? `--col-caption-title-color: ${c.caption_title_color}`
        : "",
      c.caption_text_color
        ? `--col-caption-text-color: ${c.caption_text_color}`
        : "",
      `--col-card-radius: ${cardRadius}px`,
      c.nav_bg ? `--col-nav-bg: ${c.nav_bg}` : "",
      c.nav_icon_color ? `--col-nav-icon: ${c.nav_icon_color}` : "",
      c.dot_color ? `--col-dot-color: ${c.dot_color}` : "",
      `--col-aspect: ${aspect}`,
      ...resolveSectionSpacing(
        c,
        (v, f) => this._pickValue(v, f),
      ),
    ]
      .filter(Boolean)
      .join("; ");

    if (slides.length === 0) {
      return html`
        <section class="col-empty" style=${hostStyle}>
          <p>أضف صورة واحدة على الأقل لكل شريحة للبدء.</p>
        </section>
      `;
    }

    const isSingle = slides.length === 1;
    const chevronPath = "m9 6 6 6-6 6";

    // Resolved once per render so the caption reads from the same source as the
    // visible active slide.
    const activeSlide = slides[this._activeIndex];
    const activeTitle = activeSlide
      ? this.localizedString(activeSlide.title)
      : "";
    const activeDesc = activeSlide
      ? this.localizedString(activeSlide.description)
      : "";
    const hasCaption = !!(showCaption && (activeTitle || activeDesc));

    return html`
      <section
        class="col-section"
        style=${hostStyle}
        data-layout=${layout}
        data-anim=${animation}
        data-enter=${enableAnim ? this._animState : "in"}
        @mouseenter=${this._onHoverIn}
        @mouseleave=${this._onHoverOut}
      >
        ${localizedSectionTitle
          ? html`
              <div
                class="col-header"
                data-anim=${enableAnim ? this._animState : "in"}
              >
                <h2 class="col-title">${localizedSectionTitle}</h2>
              </div>
            `
          : nothing}

        <div
          class="col-stage"
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}
        >
          <div class="col-track">
            ${slides.map((slide, i) => {
              const diff = this._wrappedDiff(i);
              const pos = this._slidePos(i);
              // A slide that jumped more than half the ring since last render
              // wrapped around the loop — snap it (no transition) so it doesn't
              // glide all the way across the stage.
              const prev = this._prevDiff.get(i);
              const instant =
                prev !== undefined &&
                Math.abs(diff - prev) > slides.length / 2;
              const { closed, opened, localizedAlt } = this._slideImage(slide);
              const noOpened = !opened || animation !== "reveal";
              return html`
                <div
                  class="col-slide"
                  data-pos=${pos}
                  data-index=${i}
                  data-instant=${instant ? "" : nothing}
                  @click=${this._onSlideClick}
                >
                  <div
                    class="col-card ${noOpened ? "col-card--no-opened" : ""}"
                  >
                    ${closed
                      ? html`<img
                          class="col-img-closed"
                          src=${closed}
                          alt=${localizedAlt}
                          loading="lazy"
                          draggable="false"
                        />`
                      : nothing}
                    ${animation === "reveal" && opened
                      ? html`<img
                          class="col-img-opened"
                          src=${opened}
                          alt=${localizedAlt}
                          loading="lazy"
                          draggable="false"
                        />`
                      : nothing}
                  </div>
                </div>
              `;
            })}
          </div>

          ${!isSingle && showNav
            ? html`
                <button
                  class="col-nav col-nav-prev"
                  type="button"
                  @click=${this._goPrev}
                  ?disabled=${this._isPrevDisabled()}
                  aria-label="Previous"
                >
                  <svg viewBox="0 0 24 24">
                    <path d=${chevronPath} />
                  </svg>
                </button>
                <button
                  class="col-nav col-nav-next"
                  type="button"
                  @click=${this._goNext}
                  ?disabled=${this._isNextDisabled()}
                  aria-label="Next"
                >
                  <svg viewBox="0 0 24 24">
                    <path d=${chevronPath} />
                  </svg>
                </button>
              `
            : nothing}
        </div>

        ${hasCaption
          ? html`
              <div class="col-caption" data-state=${this._captionState}>
                ${activeTitle
                  ? html`<h3 class="col-caption__title">${activeTitle}</h3>`
                  : nothing}
                ${activeDesc
                  ? html`<p class="col-caption__desc">${activeDesc}</p>`
                  : nothing}
              </div>
            `
          : nothing}

        ${!isSingle && showDots
          ? html`
              <div class="col-dots" role="tablist">
                ${slides.map(
                  (_, i) => html`
                    <button
                      class="col-dot"
                      type="button"
                      aria-current=${this._activeIndex === i
                        ? "true"
                        : "false"}
                      aria-label=${`Slide ${i + 1}`}
                      @click=${() => this._goTo(i)}
                    ></button>
                  `
                )}
              </div>
            `
          : nothing}
      </section>
    `;
  }
}
