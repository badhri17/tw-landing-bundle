import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import { resolveSectionSpacing } from "../../shared/section-spacing";
import type {
  UseCasesConfig,
  UseCaseItem,
  UseCasesLayout,
  UseCasesTextPlacement,
  UseCaseSide,
  UseCaseSideAuto,
  UseCasesAspect,
  UseCasesItemSize,
  UseCasesItemSizeDesktop,
  UseCasesImageShare,
  UseCasesImageShareDesktop,
  UseCasesOverlayPosition,
  UseCasesOverlayStrength,
  UseCasesDimStrength,
  UseCasesTextAlign,
} from "./types";
import { useCasesStyles } from "./style";

/** Row layout: photo width per size tier, as a share of the viewport. */
const ITEM_W_MOBILE: Record<UseCasesItemSize, string> = {
  small: "48vw",
  medium: "62vw",
  large: "76vw",
};
/** Desktop tiers are their own scale — a 62vw photo would be absurd there. */
const ITEM_W_DESKTOP: Record<UseCasesItemSize, string> = {
  small: "17vw",
  medium: "22vw",
  large: "28vw",
};

/**
 * Stack layout: how much of the card width the photo takes.
 *
 * Unlike the row tiers these are shares of the card rather than of the screen,
 * so mobile and desktop are close by nature. Desktop still gets its own table:
 * a desktop card is far wider, and a photo that reads as generous on a phone
 * reads as a thumbnail beside three lines of copy at 860px.
 */
const SHARE_MOBILE: Record<UseCasesImageShare, string> = {
  sm: "32%",
  md: "38%",
  lg: "46%",
};
const SHARE_DESKTOP: Record<UseCasesImageShare, string> = {
  sm: "34%",
  md: "42%",
  lg: "50%",
};

/** Peak alpha of the wash under copy laid over a photo. */
const SCRIM: Record<UseCasesOverlayStrength, number> = {
  soft: 0.5,
  medium: 0.7,
  strong: 0.88,
};

/** How far the out-of-focus frames recede in the row layout. */
const DIM: Record<UseCasesDimStrength, number> = {
  soft: 0.28,
  medium: 0.48,
  strong: 0.66,
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

const flip = (side: UseCaseSide): UseCaseSide =>
  side === "left" ? "right" : "left";

/**
 * <salla-use-cases> — Use Cases & Benefits (استخدامات وفوائد المنتج)
 *
 * A run of large photos, each with a short line of supporting copy. One shape,
 * three jobs, and the panel copy names all three: where the product fits, what
 * the buyer gets out of it, and how it is used step by step. `show_numbers` is
 * what makes the third real rather than merely claimed.
 *
 * In one of two layouts:
 *
 * - `stack` — cards one above the other, photo beside copy, the photo
 *   alternating sides down the list so the reading eye zig-zags. A card can
 *   also carry its copy OVER the photo instead of beside it.
 * - `row` — the photos beside each other in a strip that bleeds off both edges
 *   of the section, copy laid over each one. The frame nearest the middle is
 *   brought forward and the rest recede, so the strip reads as a focused
 *   arrangement rather than a filmstrip.
 *
 * Sides are physical (left/right of the card) and never flip with store
 * language. Nothing here links anywhere: on a landing page the photos sell the
 * situation and the hero owns the single conversion.
 *
 * RTL-first and mobile-first; honours prefers-reduced-motion.
 */
export default class GrowthUseCases extends GrowthElement {
  static styles = useCasesStyles;

  @property({ type: Object })
  config?: UseCasesConfig;

  /** Entrance gate for the cards. */
  @state() private _animState: "ready" | "in" = "ready";
  /** Row layout: frame nearest the middle of the strip; -1 until measured. */
  @state() private _activeIndex = -1;

  private _io: IntersectionObserver | null = null;
  private _fallbackTimer: number | null = null;
  /** The strip currently wired for scroll tracking, if any. */
  private _strip: HTMLElement | null = null;
  /** One-shot guard for centring the strip on its middle frame. */
  private _centered = false;
  private _rafId: number | null = null;

  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------

  /** Only use cases that actually carry a photo can render. */
  private _items(): UseCaseItem[] {
    const list = this.config?.items;
    if (!Array.isArray(list)) return [];
    return list.filter(
      (it) => !!it && typeof it === "object" && !!(it.image || "").trim()
    );
  }

  private _reduceMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private _layout(): UseCasesLayout {
    return this._pickValue<UseCasesLayout>(this.config?.layout, "stack");
  }

  /**
   * Does the copy sit ON the photo? One question, one field, both layouts —
   * which is the whole reason `text_position` is not per-layout: the panel can
   * only hide the overlay settings behind a single `field = value` test.
   */
  private _isOverlay(): boolean {
    return (
      this._pickValue<UseCasesTextPlacement>(
        this.config?.text_position,
        "outside"
      ) === "over"
    );
  }

  private _focusEnabled(): boolean {
    return this._layout() === "row" && this.config?.focus_center !== false;
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
    window.addEventListener("resize", this._onStripScroll, { passive: true });

    if (!("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }

    this._io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) this._reveal();
      },
      { threshold: 0.12 }
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
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    window.removeEventListener("resize", this._onStripScroll);
    this._strip?.removeEventListener("scroll", this._onStripScroll);
    this._strip = null;
    this._centered = false;
  }

  updated() {
    // Publish this section as a link target for the hero navbar. Runs every
    // cycle because Salla may inject `config` after the first render.
    this._syncAnchor(this.config?.anchor_id, "use-cases");
    this._syncStrip();
  }

  // ------------------------------------------------------------
  // Row layout — which frame is in the middle
  // ------------------------------------------------------------

  /**
   * Wire (or unwire) the strip after a render. The layout dropdown can swap the
   * strip in and out at any time, so this runs every cycle and keys off the
   * element identity rather than a one-time flag.
   */
  private _syncStrip() {
    const strip = this._focusEnabled()
      ? this.renderRoot.querySelector<HTMLElement>(".uc-strip")
      : null;

    if (strip !== this._strip) {
      this._strip?.removeEventListener("scroll", this._onStripScroll);
      this._strip = strip;
      this._centered = false;
      strip?.addEventListener("scroll", this._onStripScroll, { passive: true });
    }
    if (!strip || this._centered) return;

    // Park the strip on its middle frame, so the section opens on the focused
    // arrangement instead of scrolled hard to one end. Geometry is already
    // settled at this point — every frame has a fixed width and an
    // aspect-ratio — so this does not wait on the photos decoding.
    this._centered = true;
    requestAnimationFrame(() => {
      const slides = this._slides();
      if (slides.length > 2)
        this._centerSlide(Math.floor((slides.length - 1) / 2));
      this._syncActive();
    });
  }

  private _slides(): HTMLElement[] {
    if (!this._strip) return [];
    return Array.from(this._strip.querySelectorAll<HTMLElement>(".uc-slide"));
  }

  private _onStripScroll = () => {
    if (this._rafId !== null) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._syncActive();
    });
  };

  /**
   * Measured in viewport coordinates rather than from `scrollLeft`, which is
   * the one number that genuinely differs between engines in RTL (0 at the
   * right edge and counting down in some, counting up in others). Rectangles
   * are the same everywhere.
   */
  private _syncActive() {
    const strip = this._strip;
    const slides = this._slides();
    if (!strip || slides.length === 0) return;

    const stripRect = strip.getBoundingClientRect();
    const mid = stripRect.left + stripRect.width / 2;

    let best = 0;
    let bestDistance = Infinity;
    slides.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    });
    if (best !== this._activeIndex) this._activeIndex = best;
  }

  /** Scroll the strip so one frame sits in its middle. Direction-agnostic. */
  private _centerSlide(index: number) {
    const strip = this._strip;
    const el = this._slides()[index];
    if (!strip || !el) return;
    const stripRect = strip.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const delta = r.left + r.width / 2 - (stripRect.left + stripRect.width / 2);
    if (Math.abs(delta) < 1) return;
    strip.scrollBy({ left: delta, behavior: "auto" });
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  private _hostStyle(c: UseCasesConfig): string {
    const shareMobile = this._pickValue<UseCasesImageShare>(
      c.image_share,
      "md"
    );
    const shareDesktopRaw = this._pickValue<UseCasesImageShareDesktop>(
      c.image_share_desktop,
      "inherit"
    );
    // "inherit" carries the mobile TIER over, not the mobile share — it still
    // resolves through the desktop table.
    const shareDesktop =
      shareDesktopRaw === "inherit" ? shareMobile : shareDesktopRaw;

    const sizeMobile = this._pickValue<UseCasesItemSize>(c.item_size, "medium");
    const sizeDesktopRaw = this._pickValue<UseCasesItemSizeDesktop>(
      c.item_size_desktop,
      "inherit"
    );
    const sizeDesktop =
      sizeDesktopRaw === "inherit" ? sizeMobile : sizeDesktopRaw;

    const gap = Math.max(0, this._num(c.gap, 16));
    const scrim =
      SCRIM[
        this._pickValue<UseCasesOverlayStrength>(c.overlay_strength, "medium")
      ] ?? SCRIM.medium;
    const dim =
      DIM[this._pickValue<UseCasesDimStrength>(c.dim_strength, "medium")] ??
      DIM.medium;

    return [
      c.bg_color ? `--uc-bg:${c.bg_color}` : "",
      c.title_color ? `--uc-title:${c.title_color}` : "",
      c.subtitle_color ? `--uc-subtitle:${c.subtitle_color}` : "",
      c.card_bg ? `--uc-card-bg:${c.card_bg}` : "",
      c.card_title_color ? `--uc-card-title:${c.card_title_color}` : "",
      c.card_text_color ? `--uc-card-text:${c.card_text_color}` : "",
      c.overlay_title_color ? `--uc-ov-title:${c.overlay_title_color}` : "",
      c.overlay_text_color ? `--uc-ov-text:${c.overlay_text_color}` : "",
      c.number_bg ? `--uc-num-bg:${c.number_bg}` : "",
      c.number_color ? `--uc-num-fg:${c.number_color}` : "",
      `--uc-radius:${clamp(this._num(c.card_radius, 18), 0, 48)}px`,
      `--uc-gap-m:${gap}px`,
      `--uc-gap-d:${Math.round(gap * 1.4)}px`,
      `--uc-share-m:${SHARE_MOBILE[shareMobile] ?? "38%"}`,
      `--uc-share-d:${SHARE_DESKTOP[shareDesktop] ?? "42%"}`,
      `--uc-item-m:${ITEM_W_MOBILE[sizeMobile] ?? "62vw"}`,
      `--uc-item-d:${ITEM_W_DESKTOP[sizeDesktop] ?? "22vw"}`,
      `--uc-aspect:${this._pickValue<UseCasesAspect>(c.aspect_ratio, "4/5")}`,
      `--uc-stack-ar:${this._pickValue<UseCasesAspect>(c.stack_aspect, "1/1")}`,
      `--uc-stack-over-ar:${this._pickValue<UseCasesAspect>(c.stack_over_aspect, "4/3")}`,
      `--uc-stack-max:${clamp(this._num(c.stack_max_width, 860), 480, 1400)}px`,
      `--uc-scrim:${scrim}`,
      `--uc-dim:${dim}`,
      ...resolveSectionSpacing(
        c,
        (v, f) => this._pickValue(v, f),
      ),
    ]
      .filter(Boolean)
      .join("; ");
  }

  /** Alt text: the merchant's own, else the visible title, else decorative. */
  private _alt(item: UseCaseItem): string {
    return (
      this.localizedString(item.alt) || this.localizedString(item.title) || ""
    );
  }

  /**
   * The step badge. Rendered only when the merchant asked for numbering, which
   * is what turns an unordered set of use cases into a "how to use it" list.
   * `aria-hidden` because the order is already carried by the DOM.
   */
  private _renderNumber(step: number | 0) {
    if (!step) return nothing;
    return html`<span class="uc-num" aria-hidden="true"
      >${this._localeNum(step)}</span
    >`;
  }

  /**
   * A captioned photo, in one of two arrangements.
   *
   * - `over`    — the caption is absolutely positioned inside the frame, on a
   *   scrim. Used by the row layout and by a stack card set to "copy over the
   *   photo".
   * - `outside` — the caption is a sibling of the photo box in normal flow, so
   *   it lands underneath with no scrim. Row layout only: the stack puts its
   *   copy BESIDE the photo instead, which is `_renderSplitCard`.
   *
   * The two need different DOM rather than just different CSS — an overlaid
   * caption has to sit inside the element that clips to the frame's aspect
   * ratio, and a caption underneath has to sit outside it.
   */
  private _renderFrame(
    item: UseCaseItem,
    o: {
      pos: UseCasesOverlayPosition;
      align: UseCasesTextAlign;
      dir: "rtl" | "ltr";
      /** 1-based step, or 0 when numbering is off. */
      step: number;
      place: UseCasesTextPlacement;
    }
  ) {
    const title = this.localizedString(item.title);
    const text = this.localizedString(item.text);
    // A numbered photo still needs its caption box, and its scrim with it.
    const bare = !title && !text && !o.step;

    const photo = html`<img
      src=${item.image || ""}
      alt=${this._alt(item)}
      loading="lazy"
      decoding="async"
    />`;

    const caption = bare
      ? nothing
      : html`<figcaption
          class="uc-cap"
          data-place=${o.place}
          data-pos=${o.pos}
          data-align=${o.align}
          dir=${o.dir}
        >
          ${this._renderNumber(o.step)}
          ${title ? html`<span class="uc-cap-title">${title}</span>` : nothing}
          ${text ? html`<span class="uc-cap-text">${text}</span>` : nothing}
        </figcaption>`;

    if (o.place === "outside") {
      return html`<figure class="uc-fig">
        <div class="uc-frame" data-bare="true">${photo}</div>
        ${caption}
      </figure>`;
    }

    return html`<figure
      class="uc-frame"
      data-pos=${o.pos}
      data-bare=${bare ? "true" : "false"}
    >
      ${photo}${caption}
    </figure>`;
  }

  /** A stack card: the photo on one physical side, the copy on the other. */
  private _renderSplitCard(
    item: UseCaseItem,
    o: {
      side: UseCaseSide;
      align: UseCasesTextAlign;
      dir: "rtl" | "ltr";
      /** 1-based step, or 0 when numbering is off. */
      step: number;
    }
  ) {
    const title = this.localizedString(item.title);
    const text = this.localizedString(item.text);

    const cardStyle = item.background_color
      ? `--uc-card-bg:${item.background_color}`
      : "";

    return html`<article
      class="uc-card"
      data-side=${o.side}
      style=${cardStyle}
    >
      <div class="uc-media">
        <img
          src=${item.image || ""}
          alt=${this._alt(item)}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="uc-body" data-align=${o.align} dir=${o.dir}>
        ${this._renderNumber(o.step)}
        ${title ? html`<h3 class="uc-card-title">${title}</h3>` : nothing}
        ${text ? html`<p class="uc-card-text">${text}</p>` : nothing}
      </div>
    </article>`;
  }

  render() {
    const c: UseCasesConfig = this.config || {};
    const items = this._items();
    const hostStyle = this._hostStyle(c);

    if (items.length === 0) {
      return html`<section class="uc" style=${hostStyle}>
        <p class="uc-empty">
          ${
            this._lang() === "ar"
              ? "أضف بطاقة واحدة على الأقل مع صورتها لعرض هذا القسم."
              : "Add at least one card with a photo to display this section."
          }
        </p>
      </section>`;
    }

    const title = this.localizedString(c.section_title);
    const subtitle = this.localizedString(c.section_subtitle);
    const entrance = c.enable_entrance_anim !== false && !this._reduceMotion();
    const anim = entrance ? this._animState : "in";
    const dir = this._lang() === "ar" ? "rtl" : "ltr";

    const header =
      title || subtitle
        ? html`<header class="uc-header">
            ${title ? html`<h2 class="uc-h2">${title}</h2>` : nothing}
            ${subtitle ? html`<p class="uc-sub">${subtitle}</p>` : nothing}
          </header>`
        : nothing;

    const body =
      this._layout() === "row"
        ? this._renderRow(c, items, anim, dir)
        : this._renderStack(c, items, anim, dir);

    return html`<section class="uc" style=${hostStyle}>
      ${header}${body}
    </section>`;
  }

  /** Cards one above the other — the default layout. */
  private _renderStack(
    c: UseCasesConfig,
    items: UseCaseItem[],
    anim: string,
    dir: "rtl" | "ltr"
  ) {
    const overlay = this._isOverlay();
    const first = this._pickValue<UseCaseSide>(c.first_image_side, "right");
    const alternate = c.alternate_sides !== false;
    const align = this._pickValue<UseCasesTextAlign>(c.text_align, "center");
    const pos = this._pickValue<UseCasesOverlayPosition>(
      c.overlay_position,
      "bottom"
    );
    const overlayAlign = this._pickValue<UseCasesTextAlign>(
      c.overlay_align,
      "center"
    );

    // Sides are physical, so a photo stays where the merchant put it in either
    // store language. Unset items take their turn in the alternating rhythm.
    const sideOf = (item: UseCaseItem, i: number): UseCaseSide => {
      const picked = this._pickValue<UseCaseSideAuto>(item.side, "auto");
      if (picked === "left" || picked === "right") return picked;
      if (!alternate) return first;
      return i % 2 === 0 ? first : flip(first);
    };

    const numbered = c.show_numbers === true;

    return html`<div class="uc-stack" data-anim=${anim}>
      ${items.map((item, i) =>
        overlay
          ? this._renderFrame(item, {
              pos,
              align: overlayAlign,
              dir,
              step: numbered ? i + 1 : 0,
              place: "over",
            })
          : this._renderSplitCard(item, {
              side: sideOf(item, i),
              align,
              dir,
              step: numbered ? i + 1 : 0,
            })
      )}
    </div>`;
  }

  /** A strip of captioned photos bleeding off both edges of the section. */
  private _renderRow(
    c: UseCasesConfig,
    items: UseCaseItem[],
    anim: string,
    dir: "rtl" | "ltr"
  ) {
    const pos = this._pickValue<UseCasesOverlayPosition>(
      c.overlay_position,
      "bottom"
    );
    const focus = this._focusEnabled();
    const numbered = c.show_numbers === true;
    const place: UseCasesTextPlacement = this._isOverlay() ? "over" : "outside";
    // A caption underneath is body copy on the section background, not a label
    // on a photo, so it centres under its frame and its alignment control stays
    // hidden with the rest of the overlay settings.
    const align =
      place === "over"
        ? this._pickValue<UseCasesTextAlign>(c.overlay_align, "center")
        : "center";
    // Before the first measurement the middle frame is the focused one, so the
    // section paints in its resting state instead of flashing the first frame.
    const active =
      this._activeIndex >= 0
        ? this._activeIndex
        : Math.floor((items.length - 1) / 2);

    return html`<div
      class="uc-strip"
      data-anim=${anim}
      data-focus=${focus ? "on" : "off"}
    >
      ${items.map(
        (item, i) =>
          html`<div
            class="uc-slide"
            data-active=${focus && i === active ? "true" : "false"}
          >
            ${this._renderFrame(item, {
              pos,
              align,
              dir,
              step: numbered ? i + 1 : 0,
              place,
            })}
          </div>`
      )}
    </div>`;
  }
}
