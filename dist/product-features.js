import { LitElement as k, css as S, nothing as l, html as p } from "lit";
import { property as T, state as z } from "lit/decorators.js";
function A(s, t) {
  if (typeof s == "string") return s;
  if (!s || typeof s != "object") return "";
  const e = s[t] || s.ar || s.en || "";
  return typeof e == "string" ? e.trim() : "";
}
function _(s) {
  return s.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class C extends k {
  constructor() {
    super(...arguments), this._anchorBase = "", this._anchorDeepLinked = !1;
  }
  /**
   * Twilight transform injects `Component.registerSallaComponent(...)`.
   * Statics inherit, so `this` is the concrete component. The polling
   * fallback handles preview contexts where `Salla` loads after the
   * component file executes.
   */
  static registerSallaComponent(t) {
    const e = String(t || "").trim(), a = e.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), r = a.includes("-") ? a : `salla-${a || "component"}`, i = () => `${r}-${Math.random().toString(36).substring(2, 8)}`, o = () => {
      var d;
      const n = (d = window.Salla) == null ? void 0 : d.bundles;
      return n && typeof n.registerComponent == "function" ? (n.registerComponent(e, {
        component: this,
        dynamicTagName: i()
      }), !0) : !1;
    };
    if (o()) return;
    const c = window.setInterval(() => {
      o() && window.clearInterval(c);
    }, 100);
    window.setTimeout(() => window.clearInterval(c), 5e3);
  }
  /** Resolved document language. */
  _lang() {
    return (document.documentElement.lang || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
  }
  /** Pull the store-language string out of a Salla multilanguage value. */
  localizedString(t) {
    return A(t, this._lang());
  }
  /** Dropdown-list values from settings may come as [{ label, value }]. */
  _pickValue(t, e) {
    if (typeof t == "string" && t) return t;
    if (Array.isArray(t) && t.length > 0) {
      const a = t[0];
      if (a && typeof a.value == "string" && a.value)
        return a.value;
    }
    return e;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(t) {
    return _(t);
  }
  /**
   * The inverse: render a number in the digits the store's language uses, so a
   * counter or a step badge matches the copy beside it. Latin digits outside
   * Arabic, Arabic-Indic inside it.
   */
  _localeNum(t) {
    return this._lang() !== "ar" ? String(t) : String(t).replace(
      /\d/g,
      (e) => String.fromCharCode(1632 + Number(e))
    );
  }
  /**
   * Normalise a merchant-typed anchor into an id. Deliberately permissive
   * about script — Arabic ids are valid HTML and resolve fine through
   * getElementById — so we only strip the leading `#`, collapse whitespace,
   * and drop the characters that would break a URL fragment or a selector.
   */
  _slugify(t, e) {
    var i;
    return (typeof t == "string" ? t : Array.isArray(t) ? String(((i = t[0]) == null ? void 0 : i.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || e;
  }
  /**
   * Publish this component as a linkable page section.
   *
   * The id goes on the HOST element, never inside the render root: every
   * component here renders into a shadow root, and neither `#hash` fragment
   * navigation nor getElementById can see an id inside someone else's shadow
   * tree. The host is ordinary light DOM, so both work.
   *
   * Safe to call from `updated()` — Salla injects `config` as a property that
   * may land after the first render, so the anchor has to be able to change
   * once. Two instances of the same component on one page get `-2`, `-3`, …
   * appended rather than silently colliding.
   *
   * @param raw       merchant's `anchor_id` value (may be undefined)
   * @param fallback  component's default slug, e.g. "collection"
   * @param navOffset px of breathing room above the section when scrolled to
   */
  _syncAnchor(t, e, a = 24) {
    const r = this._slugify(t, e);
    if (!r || r === this._anchorBase) return;
    this._anchorBase = r;
    let i = r;
    for (let c = 2; ; c++) {
      const n = document.getElementById(i);
      if (!n || n === this) break;
      i = `${r}-${c}`;
    }
    if (this.id = i, this.style.scrollMarginTop = `${a}px`, this._anchorDeepLinked) return;
    let o = "";
    try {
      o = decodeURIComponent(location.hash.slice(1));
    } catch {
      o = location.hash.slice(1);
    }
    o && o === i && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(t, e) {
    if (!e.startsWith("#") || e === "#") return;
    let a = e.slice(1);
    try {
      a = decodeURIComponent(a);
    } catch {
    }
    const r = document.getElementById(a);
    if (!r) return;
    t.preventDefault();
    const i = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    r.scrollIntoView({
      block: "start",
      behavior: i ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${a}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, e) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const a = Number(_(t.trim()));
      if (!Number.isNaN(a)) return a;
    }
    if (Array.isArray(t) && t.length > 0) {
      const a = t[0];
      if ((a == null ? void 0 : a.value) !== void 0) return this._num(a.value, e);
    }
    return e;
  }
}
const u = {
  none: 0,
  xs: 12,
  sm: 24,
  md: 40,
  lg: 56,
  xl: 72
}, m = {
  none: 0,
  xs: 20,
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128
};
function E(s, t, e = "md", a = "md") {
  const r = t(s == null ? void 0 : s.space_top, e), i = t(s == null ? void 0 : s.space_bottom, a), o = u[r] ?? u.md, c = u[i] ?? u.md, n = m[r] ?? m.md, d = m[i] ?? m.md;
  return [
    `--sp-top-m:${o}px`,
    `--sp-bot-m:${c}px`,
    `--sp-top-d:${n}px`,
    `--sp-bot-d:${d}px`
  ];
}
const I = S`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    /* Width comes from the container, never from the contents. */
    min-width: 0;
    max-width: 100%;

    --pf-bg: #f5f4f2;
    --pf-title: #14181f;
    --pf-subtitle: #5b6573;
    --pf-card-bg: #ffffff;
    --pf-card-border: rgba(20, 24, 31, 0.06);
    --pf-card-title: #14181f;
    --pf-card-text: #6b7280;
    --pf-connector: #ffffff;

    /* Full-bleed on mobile: horizontal room is the scarce resource there, and
       every px of section padding is a px the cards and the product lose.
       Desktop restores the gutter in the breakpoint below. */
    --pf-pad-x: 0px;
    --pf-radius: 16px;
    --pf-card-w: 50%;
    --pf-stage-max: 560px;
    --pf-scale-m: 1;
    --pf-scale-d: 1;

    --pf-ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  :host([hidden]) {
    display: none;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* ============================================================
     SECTION + HEADER
     ============================================================ */
  .pf {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--pf-bg);
    /* Extra room at the bottom: a low-placed card whose text wraps to several
       lines hangs past the image, and overflow:hidden would clip it. */
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts. */
    padding-inline: var(--pf-pad-x);
    padding-block: var(--sp-top-m) var(--sp-bot-m);
    overflow: hidden;

    /* These three DERIVE from --pf-scale-m/-d, so they have to be declared on
       the same element the component writes its inline overrides to. Declared
       on :host they would substitute the host's own (default) values and the
       merchant's size setting would silently do nothing. */
    --pf-scale: var(--pf-scale-m, 1);
    --pf-thumb: calc(46px * var(--pf-scale));
    /* How far the feature image overhangs its card. */
    --pf-thumb-out: calc(var(--pf-thumb) * 0.42);
  }

  .pf-header {
    max-width: 640px;
    margin: 0 auto clamp(1.25rem, 4vw, 2rem);
    /* The section is full-bleed on mobile, so the header carries its own gutter
       — only the stage should actually touch the screen edges. */
    padding-inline: clamp(1rem, 4vw, 2rem);
    text-align: center;
  }
  .pf-h2 {
    margin: 0;
    color: var(--pf-title);
    font-size: clamp(1.6rem, 5.5vw, 2.1rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .pf-sub {
    margin: 0.55rem 0 0;
    color: var(--pf-subtitle);
    font-size: clamp(0.9rem, 1.6vw, 1.02rem);
    line-height: 1.7;
  }

  /* ============================================================
     STAGE — the product shot, with the cards floating over it
     ============================================================ */
  .pf-stage {
    position: relative;
    width: 100%;
    max-width: var(--pf-stage-max);
    margin-inline: auto;
  }

  .pf-product {
    display: block;
    width: 100%;
    height: auto;
  }

  /* A fixed canvas shape guarantees the cards enough vertical room even when
     the merchant's product shot is square or landscape. The image fills that
     canvas: on a transparent cut-out the trimmed edges are empty pixels, so the
     product ends up bigger rather than floating in dead space. Merchants with a
     tightly cropped shot pick the natural-ratio option instead. */
  .pf-stage[data-ratio="on"] {
    aspect-ratio: var(--pf-ratio, 3 / 4);
  }
  .pf-stage[data-ratio="on"] .pf-product {
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .pf-pin {
    position: absolute;
    top: var(--top, 0%);
    width: var(--pf-card-w);
    z-index: 2;
  }
  /* Inset by the overhang so the feature image lands flush with the image edge
     instead of spilling into the section padding. */
  .pf-pin[data-side="right"] {
    right: var(--pf-thumb-out);
  }
  .pf-pin[data-side="left"] {
    left: var(--pf-thumb-out);
  }

  .pf-card {
    position: relative;
    z-index: 1;
    padding: calc(9px * var(--pf-scale)) calc(12px * var(--pf-scale));
    /* Room for the part of the feature image that sits inside the card. */
    padding-inline-start: calc(
      var(--pf-thumb) - var(--pf-thumb-out) + 8px * var(--pf-scale)
    );
    background: var(--pf-card-bg);
    border: 1px solid var(--pf-card-border);
    border-radius: var(--pf-radius);
    box-shadow:
      0 10px 24px rgba(20, 24, 31, 0.1),
      0 2px 6px rgba(20, 24, 31, 0.05);
  }
  .pf-card[data-thumb="off"] {
    padding-inline-start: calc(12px * var(--pf-scale));
  }

  /* ---- Glass surface -------------------------------------------------
     A translucent panel tinted by the merchant's card colour, frosting
     whatever it sits over and lit by a diagonal gloss sweep plus a top
     edge highlight. The product shot reads through it, which is the whole
     point of the treatment.

     The tint and the sheen both live in the background shorthand rather
     than a ::before, so they paint behind the text with no z-index
     interplay against the absolutely-positioned thumb. Browsers without
     backdrop-filter still get the translucent tint and the sweep. */
  .pf-stage[data-card="glass"] .pf-card {
    background:
      linear-gradient(
        155deg,
        rgba(255, 255, 255, 0.62) 0%,
        rgba(255, 255, 255, 0.22) 38%,
        rgba(255, 255, 255, 0) 62%
      ),
      var(--pf-card-glass, rgba(255, 255, 255, 0.72));
    -webkit-backdrop-filter: blur(12px) saturate(160%);
    backdrop-filter: blur(12px) saturate(160%);
    border-color: rgba(255, 255, 255, 0.75);
    box-shadow:
      0 12px 30px rgba(20, 24, 31, 0.13),
      0 2px 8px rgba(20, 24, 31, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.85);
  }

  /* ---- Feature image above the title ---------------------------------
     The thumb leaves the flow-out position and becomes a block in normal
     flow, so it lands on the inline-start edge (right in Arabic) directly
     above the title and the card gets its full width back for text. */
  .pf-stage[data-thumb-pos="top"] .pf-card,
  .pf-stage[data-thumb-pos="top"] .pf-card[data-thumb="on"] {
    padding-inline-start: calc(12px * var(--pf-scale));
  }
  .pf-stage[data-thumb-pos="top"] .pf-thumb {
    position: static;
    display: block;
    transform: none;
    margin-bottom: calc(7px * var(--pf-scale));
  }
  /* Nothing overhangs any more, so the card itself sits flush with the edge
     and every connector can start right at the card border. Declared on the
     pin, not the stage, to beat the per-side rules above — which sit on the
     pin itself and would otherwise win by proximity whatever their specificity. */
  .pf-stage[data-thumb-pos="top"] .pf-pin[data-side] {
    --pf-line-gap: 0px;
  }
  .pf-stage[data-thumb-pos="top"] .pf-pin[data-side="right"] {
    right: 0;
  }
  .pf-stage[data-thumb-pos="top"] .pf-pin[data-side="left"] {
    left: 0;
  }

  .pf-thumb {
    position: absolute;
    top: 50%;
    inset-inline-start: calc(-1 * var(--pf-thumb-out));
    transform: translateY(-50%);
    width: var(--pf-thumb);
    height: var(--pf-thumb);
    border-radius: 50%;
    overflow: hidden;
    background: var(--pf-card-border);
    box-shadow: 0 4px 12px rgba(20, 24, 31, 0.16);
    z-index: 2;
  }
  .pf-thumb[data-shape="rounded"] {
    border-radius: calc(var(--pf-radius) * 0.55);
  }
  .pf-thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pf-card-title {
    margin: 0;
    color: var(--pf-card-title);
    font-size: calc(0.88rem * var(--pf-scale));
    font-weight: 800;
    line-height: 1.3;
  }
  .pf-card-text {
    margin: calc(3px * var(--pf-scale)) 0 0;
    color: var(--pf-card-text);
    font-size: calc(0.7rem * var(--pf-scale));
    line-height: 1.55;
  }

  /* ============================================================
     CONNECTOR — hairline running from the card toward the product, with
     the dot anchored at the CARD end and the bare end pointing at the
     product.

     The line starts at the card's visible outer boundary, not at the card
     box: with the feature image beside the title it overhangs the card, so
     a line starting at the card border would emerge from underneath it and
     bury the dot. --pf-line-gap pushes the start out past that overhang,
     and drops to 0 when the image sits on top of the title and nothing
     overhangs any more.
     ============================================================ */
  /* The feature image overhangs ONE edge of the card — its inline-start. A
     connector leaving through that same edge has to clear the image or the dot
     ends up buried under it; a connector leaving through the opposite edge must
     not be offset at all, or it floats away from the card. Which physical side
     that is depends on text direction, so RTL is the base (Arabic is the
     default here) and :dir(ltr) mirrors it. Browsers without :dir() keep the
     RTL arrangement, which is the one that matters most. */
  .pf-pin {
    --pf-line-gap: 0px;
  }
  .pf-pin[data-side="left"] {
    --pf-line-gap: var(--pf-thumb-out);
  }
  :host(:dir(ltr)) .pf-pin[data-side="left"] {
    --pf-line-gap: 0px;
  }
  :host(:dir(ltr)) .pf-pin[data-side="right"] {
    --pf-line-gap: var(--pf-thumb-out);
  }

  .pf-line {
    position: absolute;
    top: 50%;
    z-index: 0;
    width: 22px;
    height: 1px;
    background: var(--pf-connector);
  }
  .pf-pin[data-side="left"] .pf-line {
    left: calc(100% + var(--pf-line-gap));
  }
  .pf-pin[data-side="right"] .pf-line {
    right: calc(100% + var(--pf-line-gap));
  }
  .pf-line::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 5px;
    height: 5px;
    margin-top: -2.5px;
    border-radius: 50%;
    background: var(--pf-connector);
  }
  /* The dot marks the card end. A left-hand card's line runs rightward, so
     its card end is the line's left edge — and vice versa. */
  .pf-pin[data-side="left"] .pf-line::after {
    left: 0;
  }
  .pf-pin[data-side="right"] .pf-line::after {
    right: 0;
  }

  /* ============================================================
     FALLBACK — no product image: a plain stacked list
     ============================================================ */
  .pf-stage[data-mode="stack"] {
    display: flex;
    flex-direction: column;
    gap: calc(12px * var(--pf-scale));
    max-width: 520px;
  }
  .pf-stage[data-mode="stack"] .pf-pin {
    position: static;
    width: 100%;
  }
  .pf-stage[data-mode="stack"] .pf-line {
    display: none;
  }

  .pf-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--pf-subtitle);
    font-size: 0.92rem;
  }

  /* ============================================================
     MOTION
     ============================================================ */
  .pf-pin {
    transition:
      opacity 0.55s var(--pf-ease),
      transform 0.55s var(--pf-ease);
    transition-delay: calc(var(--i, 0) * 90ms);
  }
  .pf-stage[data-anim="ready"] .pf-pin {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  .pf-stage[data-anim="in"] .pf-pin {
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .pf-pin {
      transition: none;
    }
    .pf-stage[data-anim="ready"] .pf-pin {
      opacity: 1;
      transform: none;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    .pf {
      padding-block: var(--sp-top-d) var(--sp-bot-d);
    }
    :host {
      --pf-pad-x: clamp(1rem, 4vw, 2rem);
    }
    .pf {
      --pf-scale: var(--pf-scale-d, 1);
    }
    .pf-header {
      padding-inline: 0;
    }
  }
`;
var D = Object.defineProperty, v = (s, t, e, a) => {
  for (var r = void 0, i = s.length - 1, o; i >= 0; i--)
    (o = s[i]) && (r = o(t, e, r) || r);
  return r && D(t, e, r), r;
};
const L = {
  narrow: "36%",
  medium: "42%",
  wide: "52%"
}, N = {
  sm: 0.8,
  md: 0.88,
  lg: 1.02
}, R = {
  sm: 1,
  md: 1.16,
  lg: 1.34
}, B = [6, 26, 48, 68, 84, 90], b = class b extends C {
  constructor() {
    super(...arguments), this._animState = "ready", this._io = null, this._fallbackTimer = null, this._reveal = () => {
      var t;
      this._animState = "in", (t = this._io) == null || t.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null);
    };
  }
  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------
  /** Keep features that have something to show. */
  _items() {
    var e;
    const t = (e = this.config) == null ? void 0 : e.items;
    return Array.isArray(t) ? t.filter((a) => !a || typeof a != "object" ? !1 : !!(this.localizedString(a.title) || this.localizedString(a.description) || a.image)) : [];
  }
  _productImage() {
    var e;
    const t = (e = this.config) == null ? void 0 : e.product_image;
    return typeof t == "string" ? t.trim() : "";
  }
  _reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  /**
   * Translucent version of a merchant colour, for the glass card surface.
   *
   * Done here rather than with CSS `color-mix()` so the frosted look also works
   * in browsers that predate it. Salla's colour picker always returns hex; any
   * other notation falls through to the stylesheet's own default.
   */
  _translucent(t, e) {
    const a = typeof t == "string" ? t.trim() : "", r = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(a);
    if (!r) return "";
    let i = r[1];
    i.length <= 4 && (i = i.split("").map((d) => d + d).join(""));
    const o = parseInt(i.slice(0, 2), 16), c = parseInt(i.slice(2, 4), 16), n = parseInt(i.slice(4, 6), 16);
    return `rgba(${o}, ${c}, ${n}, ${e})`;
  }
  connectedCallback() {
    if (super.connectedCallback(), !("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }
    this._io = new IntersectionObserver(
      (t) => {
        var e;
        (e = t[0]) != null && e.isIntersecting && this._reveal();
      },
      { threshold: 0.15 }
    ), this._io.observe(this), this._fallbackTimer = window.setTimeout(() => {
      if (this._fallbackTimer = null, this._animState === "in") return;
      const t = this.getBoundingClientRect();
      (t.height === 0 || t.top < window.innerHeight && t.bottom > 0) && this._reveal();
    }, 3e3);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._io) == null || t.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null);
  }
  updated() {
    var t;
    this._syncAnchor((t = this.config) == null ? void 0 : t.anchor_id, "product-features");
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  _stageRatio(t) {
    return this._pickValue(t.stage_ratio, "3/4");
  }
  _hostStyle(t) {
    const e = this._pickValue(t.card_width, "medium"), a = this._pickValue(t.card_size, "md"), r = this._pickValue(
      t.card_size_desktop,
      "inherit"
    ), i = r === "inherit" ? a : r, o = this._stageRatio(t), c = this._translucent(t.card_bg ?? "#ffffff", 0.72);
    return [
      t.bg_color ? `--pf-bg:${t.bg_color}` : "",
      t.title_color ? `--pf-title:${t.title_color}` : "",
      t.subtitle_color ? `--pf-subtitle:${t.subtitle_color}` : "",
      t.card_bg ? `--pf-card-bg:${t.card_bg}` : "",
      // Glass tint. Falls back to the stylesheet default when the colour isn't
      // hex, so the frosted surface never collapses to fully transparent.
      c ? `--pf-card-glass:${c}` : "",
      t.card_border_color ? `--pf-card-border:${t.card_border_color}` : "",
      t.card_title_color ? `--pf-card-title:${t.card_title_color}` : "",
      t.card_text_color ? `--pf-card-text:${t.card_text_color}` : "",
      t.connector_color ? `--pf-connector:${t.connector_color}` : "",
      `--pf-card-w:${L[e] ?? "52%"}`,
      `--pf-scale-m:${N[a] ?? 1}`,
      `--pf-scale-d:${R[i] ?? 1.16}`,
      `--pf-radius:${this._num(t.card_radius, 16)}px`,
      `--pf-stage-max:${this._num(t.stage_max_width, 560)}px`,
      o === "auto" ? "" : `--pf-ratio:${o}`,
      ...E(
        t,
        (n, d) => this._pickValue(n, d)
      )
    ].filter(Boolean).join("; ");
  }
  _renderCard(t, e, a, r, i) {
    const o = this.localizedString(t.title), c = this.localizedString(t.description), n = a === "none" ? "" : (t.image || "").trim(), d = this._pickValue(
      t.side,
      e % 2 === 0 ? "right" : "left"
    ), g = Math.max(
      0,
      Math.min(92, this._num(t.top, B[e] ?? 90))
    );
    return p`<div
      class="pf-pin"
      data-side=${d}
      style=${r ? `--i:${e};--top:${g}%` : `--i:${e}`}
    >
      ${r && i ? p`<span class="pf-line"></span>` : l}
      <div class="pf-card" data-thumb=${n ? "on" : "off"}>
        ${n ? p`<span class="pf-thumb" data-shape=${a}>
              <img src=${n} alt="" loading="lazy" decoding="async" />
            </span>` : l}
        ${o ? p`<h3 class="pf-card-title">${o}</h3>` : l}
        ${c ? p`<p class="pf-card-text">${c}</p>` : l}
      </div>
    </div>`;
  }
  render() {
    const t = this.config || {}, e = this._items(), a = this._productImage(), r = this._hostStyle(t);
    if (!a && e.length === 0)
      return p`<section class="pf" style=${r}>
        <p class="pf-empty">
          ${this._lang() === "ar" ? "أضف صورة المنتج وميزة واحدة على الأقل لعرض هذا القسم." : "Add a product image and at least one feature to display this section."}
        </p>
      </section>`;
    const i = this.localizedString(t.section_title), o = this.localizedString(t.section_subtitle), c = this._pickValue(t.thumb_shape, "circle"), n = this._pickValue(
      t.thumb_position,
      "side"
    ), d = this._pickValue(t.card_style, "glass"), g = t.show_connectors !== !1, w = t.enable_entrance_anim !== !1 && !this._reduceMotion(), f = !!a, x = i || o ? p`<header class="pf-header">
            ${i ? p`<h2 class="pf-h2">${i}</h2>` : l}
            ${o ? p`<p class="pf-sub">${o}</p>` : l}
          </header>` : l;
    return p`
      <section class="pf" style=${r}>
        ${x}
        <div
          class="pf-stage"
          data-mode=${f ? "overlay" : "stack"}
          data-ratio=${f && this._stageRatio(t) !== "auto" ? "on" : "off"}
          data-thumb-pos=${n}
          data-card=${d}
          data-anim=${w ? this._animState : "in"}
        >
          ${f ? p`<img
                class="pf-product"
                src=${a}
                alt=${this.localizedString(t.product_image_alt) || i || ""}
                decoding="async"
              />` : l}
          ${e.map(
      (y, $) => this._renderCard(y, $, c, f, g)
    )}
        </div>
      </section>
    `;
  }
};
b.styles = I;
let h = b;
v([
  T({ type: Object })
], h.prototype, "config");
v([
  z()
], h.prototype, "_animState");
typeof h < "u" && h.registerSallaComponent("salla-product-features");
export {
  h as default
};
