import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import type {
  IngredientsConfig,
  IngredientItem,
  IngredientLayout,
  IngredientSide,
  IngredientSize,
  IngredientSizeDesktop,
  IngredientLabelPosition,
  IngredientLabelPositionCircle,
  IngredientLabelAlign,
  IngredientLabelAlignCircle,
  IngredientConnector,
  IngredientRingStyle,
} from "./types";
import { ingredientsStyles } from "./style";

/**
 * Image + type scale per size tier, per breakpoint.
 *
 * The tiers are relative to their own breakpoint rather than absolute pixel
 * sizes: the stage is far wider on desktop, so the cut-out size that reads as
 * balanced on a phone reads as undersized there. Every desktop tier is
 * therefore larger than its mobile namesake — desktop "small" is bigger than
 * mobile "small". Scales the picture, the name and the hairline together.
 */
const ITEM_SCALE_MOBILE: Record<IngredientSize, number> = {
  sm: 0.84,
  md: 1,
  lg: 1.18,
};
const ITEM_SCALE_DESKTOP: Record<IngredientSize, number> = {
  sm: 1.08,
  md: 1.28,
  lg: 1.5,
};

/** Hairline geometry, in the connector SVG's own 40×26 viewBox. */
const LINK_CURVED = "M 33 4 C 33 13 26 15 14 22";
const LINK_STRAIGHT = "M 33 4 L 14 22";

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

/**
 * <salla-ingredients> — Ingredients (مكونات المنتج)
 *
 * A product cut-out standing in the middle of the section with its ingredients
 * arranged around it, in one of two layouts:
 *
 * - `columns` — two flanking columns, each ingredient a small stack of name,
 *   hairline and cut-out. Every hairline bends toward the product, so the
 *   section reads as one exploded diagram of what is inside.
 * - `circle` — a thin ring orbiting the product with the ingredients sitting on
 *   it and a dot marking each one's spot. Here the ring IS the connector, so no
 *   per-ingredient hairline is drawn.
 *
 * Sides are physical (left/right of the product) and never flip with store
 * language; in the circle layout a side becomes the half of the ring an
 * ingredient orbits in, so switching layouts preserves the arrangement. Without
 * a product shot the columns collapse into a plain two-up grid so a
 * half-configured section still renders.
 *
 * RTL-first and mobile-first; honours prefers-reduced-motion.
 */
export default class GrowthIngredients extends GrowthElement {
  static styles = ingredientsStyles;

  @property({ type: Object })
  config?: IngredientsConfig;

  /** Entrance gate for the ingredients. */
  @state() private _animState: "ready" | "in" = "ready";

  private _io: IntersectionObserver | null = null;
  private _fallbackTimer: number | null = null;

  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------

  /** Keep ingredients that have something to show. */
  private _items(): IngredientItem[] {
    const list = this.config?.items;
    if (!Array.isArray(list)) return [];
    return list.filter((it) => {
      if (!it || typeof it !== "object") return false;
      return !!(this.localizedString(it.name) || it.image);
    });
  }

  private _productImage(): string {
    const src = this.config?.product_image;
    return typeof src === "string" ? src.trim() : "";
  }

  private _reduceMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    this._syncAnchor(this.config?.anchor_id, "ingredients");
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  private _hostStyle(c: IngredientsConfig): string {
    const sizeMobile = this._pickValue<IngredientSize>(c.item_size, "md");
    const sizeDesktopRaw = this._pickValue<IngredientSizeDesktop>(
      c.item_size_desktop,
      "inherit"
    );
    // "inherit" carries the mobile TIER over, not the mobile pixel size — it
    // still resolves through the larger desktop scale table.
    const sizeDesktop =
      sizeDesktopRaw === "inherit" ? sizeMobile : sizeDesktopRaw;

    const widthMobile = clamp(this._num(c.product_width, 30), 15, 75);
    const widthDesktop = c.desktop_custom_width
      ? clamp(this._num(c.product_width_desktop, widthMobile), 15, 75)
      : widthMobile;

    // Circle layout. The desktop switch gates all three of its measurements at
    // once — they only read as a set, and separate switches would let a
    // merchant scale the product without the ring following it.
    const cWidth = clamp(this._num(c.circle_product_width, 25), 10, 60);
    const ringM = clamp(this._num(c.ring_size, 70), 30, 100);
    const orbitM = clamp(this._num(c.orbit_size, 78), 30, 110);
    const circleD = !!c.circle_desktop_custom;
    const cWidthD = circleD
      ? clamp(this._num(c.circle_product_width_desktop, cWidth), 10, 60)
      : cWidth;
    const ringD = circleD
      ? clamp(this._num(c.ring_size_desktop, ringM), 30, 100)
      : ringM;
    const orbitD = circleD
      ? clamp(this._num(c.orbit_size_desktop, orbitM), 30, 110)
      : orbitM;

    return [
      c.bg_color ? `--ing-bg:${c.bg_color}` : "",
      c.title_color ? `--ing-title:${c.title_color}` : "",
      c.subtitle_color ? `--ing-subtitle:${c.subtitle_color}` : "",
      c.label_color ? `--ing-label:${c.label_color}` : "",
      c.connector_color ? `--ing-connector:${c.connector_color}` : "",
      c.ring_color ? `--ing-ring:${c.ring_color}` : "",
      `--ing-scale-m:${ITEM_SCALE_MOBILE[sizeMobile] ?? 1}`,
      `--ing-scale-d:${ITEM_SCALE_DESKTOP[sizeDesktop] ?? 1.28}`,
      `--ing-product-w:${widthMobile}%`,
      `--ing-product-w-d:${widthDesktop}%`,
      `--ing-row-gap:${Math.max(0, this._num(c.row_gap, 26))}px`,
      `--ing-col-gap:${Math.max(0, this._num(c.column_gap, 10))}px`,
      `--ing-connector-w:${Math.max(0.5, this._num(c.connector_width, 1))}px`,
      `--ing-stage-max:${this._num(c.stage_max_width, 560)}px`,
      `--ing-prod-dx:${clamp(this._num(c.product_offset_x, 0), -40, 40)}%`,
      `--ing-prod-dy:${clamp(this._num(c.product_offset_y, 0), -40, 40)}%`,
      `--ing-circle-pw:${cWidth}%`,
      `--ing-circle-pw-d:${cWidthD}%`,
      `--ing-ring-m:${ringM}%`,
      `--ing-ring-d:${ringD}%`,
      `--ing-orbit-m:${orbitM}%`,
      `--ing-orbit-d:${orbitD}%`,
      `--ing-ring-w:${clamp(this._num(c.ring_width, 1), 0.5, 6)}px`,
      `--ing-dot-size:${clamp(this._num(c.ring_dot_size, 10), 4, 20)}px`,
    ]
      .filter(Boolean)
      .join("; ");
  }

  /**
   * Angle of every ingredient on the ring, in degrees clockwise from 12
   * o'clock.
   *
   * Each side keeps its own arc and is filled top-to-bottom, mirroring the way
   * the columns layout reads — so flipping between the two layouts preserves
   * the merchant's arrangement instead of reshuffling it. The left arc is the
   * right one mirrored across the vertical axis, which is what makes an even
   * four-ingredient set land on the diagonals.
   */
  private _circleAngles(
    c: IngredientsConfig,
    items: IngredientItem[],
    sides: IngredientSide[]
  ): number[] {
    const start = clamp(this._num(c.circle_start_angle, 55), 0, 180);
    const span = clamp(this._num(c.circle_arc_span, 85), 0, 179);
    const out = new Array<number>(items.length).fill(start);

    (["right", "left"] as const).forEach((want) => {
      const idx = items.map((_, i) => i).filter((i) => sides[i] === want);
      const step = idx.length > 1 ? span / (idx.length - 1) : 0;
      idx.forEach((itemIndex, k) => {
        const a = start + k * step;
        out[itemIndex] = want === "left" ? 360 - a : a;
      });
    });

    return out.map((a, i) => {
      const nudged = a + clamp(this._num(items[i].angle_offset, 0), -180, 180);
      return ((nudged % 360) + 360) % 360;
    });
  }

  /** The hairline joining a name to its picture. */
  private _renderLink(style: IngredientConnector, dot: boolean) {
    if (style === "none") return nothing;
    return html`<svg
      class="ing-link"
      viewBox="0 0 40 26"
      aria-hidden="true"
      focusable="false"
    >
      <path d=${style === "straight" ? LINK_STRAIGHT : LINK_CURVED} />
      ${dot ? html`<circle cx="33" cy="4" r="2.6" />` : nothing}
    </svg>`;
  }

  private _renderItem(o: {
    item: IngredientItem;
    i: number;
    side: IngredientSide;
    labelPos: IngredientLabelPosition;
    align: IngredientLabelAlign | IngredientLabelAlignCircle;
    link: IngredientConnector;
    dot: boolean;
    dir: "rtl" | "ltr";
    /** Circle layout: the angle of this ingredient's arm. */
    angle?: number;
    /** Circle layout: which way "away from the product" points, -1/0/+1. */
    out?: number;
  }) {
    const { item, i } = o;
    const name = this.localizedString(item.name);
    const src = (item.image || "").trim();
    const offset = clamp(this._num(item.offset_y, 0), -60, 60);
    const scale = clamp(this._num(item.image_scale, 100), 20, 300);

    const style = [
      `--i:${i}`,
      `--ing-offset:${offset}%`,
      `--ing-iscale:${scale / 100}`,
      o.angle === undefined ? "" : `--a:${o.angle}deg`,
      o.out === undefined ? "" : `--ing-out:${o.out}`,
    ]
      .filter(Boolean)
      .join("; ");

    return html`<figure
      class="ing-item"
      data-side=${o.side}
      data-label=${o.labelPos}
      data-align=${o.align}
      style=${style}
    >
      ${name
        ? html`<figcaption class="ing-label" dir=${o.dir}>${name}</figcaption>`
        : nothing}
      ${name && src ? this._renderLink(o.link, o.dot) : nothing}
      ${src
        ? html`<span class="ing-media">
            <img src=${src} alt="" loading="lazy" decoding="async" />
          </span>`
        : nothing}
    </figure>`;
  }

  render() {
    const c: IngredientsConfig = this.config || {};
    const items = this._items();
    const image = this._productImage();
    const hostStyle = this._hostStyle(c);

    if (!image && items.length === 0) {
      return html`<section class="ing" style=${hostStyle}>
        <p class="ing-empty">
          ${this._lang() === "ar"
            ? "أضف صورة المنتج ومكوّنًا واحدًا على الأقل لعرض هذا القسم."
            : "Add a product image and at least one ingredient to display this section."}
        </p>
      </section>`;
    }

    const title = this.localizedString(c.section_title);
    const subtitle = this.localizedString(c.section_subtitle);
    const layout = this._pickValue<IngredientLayout>(c.layout, "columns");
    const link = this._pickValue<IngredientConnector>(
      c.connector_style,
      "curved"
    );
    const dot = c.connector_dot !== false;
    const entrance = c.enable_entrance_anim !== false && !this._reduceMotion();
    const anim = entrance ? this._animState : "in";
    const dir = this._lang() === "ar" ? "rtl" : "ltr";
    const alt = this.localizedString(c.product_image_alt) || title || "";

    // Sides are physical, so an ingredient stays where the merchant put it in
    // either store language. Unset sides alternate left/right down the list.
    const sides = items.map((it, i) =>
      this._pickValue<IngredientSide>(it.side, i % 2 === 0 ? "left" : "right")
    );

    const header =
      title || subtitle
        ? html`<header class="ing-header">
            ${title ? html`<h2 class="ing-h2">${title}</h2>` : nothing}
            ${subtitle ? html`<p class="ing-sub">${subtitle}</p>` : nothing}
          </header>`
        : nothing;

    const body =
      layout === "circle"
        ? this._renderOrbit(c, items, sides, image, alt, anim, link, dot, dir)
        : this._renderColumns(c, items, sides, image, alt, anim, link, dot, dir);

    return html`
      <section class="ing" style=${hostStyle}>${header}${body}</section>
    `;
  }

  /** Two flanking columns — the default layout. */
  private _renderColumns(
    c: IngredientsConfig,
    items: IngredientItem[],
    sides: IngredientSide[],
    image: string,
    alt: string,
    anim: string,
    link: IngredientConnector,
    dot: boolean,
    dir: "rtl" | "ltr"
  ) {
    const labelPos = this._pickValue<IngredientLabelPosition>(
      c.label_position,
      "above"
    );
    const align = this._pickValue<IngredientLabelAlign>(c.label_align, "toward");

    const column = (want: IngredientSide) =>
      items
        .map((it, i) => ({ it, i }))
        .filter(({ i }) => sides[i] === want)
        .map(({ it, i }) =>
          this._renderItem({
            item: it,
            i,
            side: want,
            labelPos,
            align,
            link,
            dot,
            dir,
          })
        );

    return html`<div
      class="ing-stage"
      data-mode=${image ? "stage" : "grid"}
      data-anim=${anim}
    >
      <div class="ing-col" data-side="left">${column("left")}</div>
      ${image
        ? html`<div class="ing-product">
            <img src=${image} alt=${alt} decoding="async" />
          </div>`
        : nothing}
      <div class="ing-col" data-side="right">${column("right")}</div>
    </div>`;
  }

  /** A ring orbiting the product, ingredients sitting on the line. */
  private _renderOrbit(
    c: IngredientsConfig,
    items: IngredientItem[],
    sides: IngredientSide[],
    image: string,
    alt: string,
    anim: string,
    link: IngredientConnector,
    dot: boolean,
    dir: "rtl" | "ltr"
  ) {
    const angles = this._circleAngles(c, items, sides);
    const ring = this._pickValue<IngredientRingStyle>(c.ring_style, "solid");
    const labelMode = this._pickValue<IngredientLabelPositionCircle>(
      c.circle_label_position,
      "auto"
    );
    const align = this._pickValue<IngredientLabelAlignCircle>(
      c.circle_label_align,
      "outward"
    );
    const showDots = c.ring_dot !== false && ring !== "none";
    const dotShift = clamp(this._num(c.ring_dot_offset, 20), 0, 60);

    const placed = items.map((it, i) => {
      const a = angles[i];
      const rad = (a * Math.PI) / 180;
      // Names ride the ring: above it in the top half, below it in the bottom
      // half, which is what keeps them off the line either way.
      const labelPos: IngredientLabelPosition =
        labelMode === "auto"
          ? Math.cos(rad) >= 0
            ? "above"
            : "below"
          : labelMode;
      // Which way is "away from the product". Ingredients sitting near the
      // vertical axis get no nudge at all — there is no outward there.
      const sin = Math.sin(rad);
      const out = Math.abs(sin) < 0.15 ? 0 : sin > 0 ? 1 : -1;
      // The bead slides around the arc toward the name, into open background.
      // Angles grow clockwise, so "toward 12 o'clock" flips sign per half, and
      // the left arc being mirrored makes that come out symmetrical for free.
      const towardTop = labelPos === "above" ? -1 : 1;
      const dotAngle = a + dotShift * towardTop * (sides[i] === "left" ? -1 : 1);
      return { it, i, a, labelPos, out, dotAngle };
    });

    return html`<div class="ing-orbit" data-anim=${anim}>
      ${ring === "none"
        ? nothing
        : html`<div class="ing-ring-line" data-ring=${ring}></div>`}
      ${showDots
        ? placed.map(
            (p) =>
              html`<div class="ing-arm" style=${`--a:${p.dotAngle}deg`}>
                <span class="ing-dot"></span>
              </div>`
          )
        : nothing}
      ${image
        ? html`<div class="ing-product">
            <img src=${image} alt=${alt} decoding="async" />
          </div>`
        : nothing}
      ${placed.map(
        (p) => html`<div class="ing-arm" style=${`--a:${p.a}deg`}>
          ${this._renderItem({
            item: p.it,
            i: p.i,
            side: sides[p.i],
            labelPos: p.labelPos,
            align,
            link,
            dot,
            dir,
            angle: p.a,
            out: p.out,
          })}
        </div>`
      )}
    </div>`;
  }
}
