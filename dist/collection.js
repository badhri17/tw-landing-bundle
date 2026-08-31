import { LitElement as B, css as L, html as r, nothing as p } from "lit";
import { property as V, state as x } from "lit/decorators.js";
function j(s, t) {
  if (typeof s == "string") return s;
  if (!s || typeof s != "object") return "";
  const e = s[t] || s.ar || s.en || "";
  return typeof e == "string" ? e.trim() : "";
}
function N(s) {
  return s.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class E extends B {
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
    const e = String(t || "").trim(), i = e.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), o = i.includes("-") ? i : `salla-${i || "component"}`, a = () => `${o}-${Math.random().toString(36).substring(2, 8)}`, n = () => {
      var u;
      const l = (u = window.Salla) == null ? void 0 : u.bundles;
      return l && typeof l.registerComponent == "function" ? (l.registerComponent(e, {
        component: this,
        dynamicTagName: a()
      }), !0) : !1;
    };
    if (n()) return;
    const d = window.setInterval(() => {
      n() && window.clearInterval(d);
    }, 100);
    window.setTimeout(() => window.clearInterval(d), 5e3);
  }
  /** Resolved document language. */
  _lang() {
    return (document.documentElement.lang || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
  }
  /** Pull the store-language string out of a Salla multilanguage value. */
  localizedString(t) {
    return j(t, this._lang());
  }
  /** Dropdown-list values from settings may come as [{ label, value }]. */
  _pickValue(t, e) {
    if (typeof t == "string" && t) return t;
    if (Array.isArray(t) && t.length > 0) {
      const i = t[0];
      if (i && typeof i.value == "string" && i.value)
        return i.value;
    }
    return e;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(t) {
    return N(t);
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
    var a;
    return (typeof t == "string" ? t : Array.isArray(t) ? String(((a = t[0]) == null ? void 0 : a.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || e;
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
  _syncAnchor(t, e, i = 24) {
    const o = this._slugify(t, e);
    if (!o || o === this._anchorBase) return;
    this._anchorBase = o;
    let a = o;
    for (let d = 2; ; d++) {
      const l = document.getElementById(a);
      if (!l || l === this) break;
      a = `${o}-${d}`;
    }
    if (this.id = a, this.style.scrollMarginTop = `${i}px`, this._anchorDeepLinked) return;
    let n = "";
    try {
      n = decodeURIComponent(location.hash.slice(1));
    } catch {
      n = location.hash.slice(1);
    }
    n && n === a && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(t, e) {
    if (!e.startsWith("#") || e === "#") return;
    let i = e.slice(1);
    try {
      i = decodeURIComponent(i);
    } catch {
    }
    const o = document.getElementById(i);
    if (!o) return;
    t.preventDefault();
    const a = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    o.scrollIntoView({
      block: "start",
      behavior: a ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${i}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, e) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const i = Number(N(t.trim()));
      if (!Number.isNaN(i)) return i;
    }
    if (Array.isArray(t) && t.length > 0) {
      const i = t[0];
      if ((i == null ? void 0 : i.value) !== void 0) return this._num(i.value, e);
    }
    return e;
  }
}
const g = {
  none: 0,
  xs: 12,
  sm: 24,
  md: 40,
  lg: 56,
  xl: 72
}, _ = {
  none: 0,
  xs: 20,
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128
};
function O(s, t, e = "md", i = "md") {
  const o = t(s == null ? void 0 : s.space_top, e), a = t(s == null ? void 0 : s.space_bottom, i), n = g[o] ?? g.md, d = g[a] ?? g.md, l = _[o] ?? _.md, u = _[a] ?? _.md;
  return [
    `--sp-top-m:${n}px`,
    `--sp-bot-m:${d}px`,
    `--sp-top-d:${l}px`,
    `--sp-bot-d:${u}px`
  ];
}
const R = L`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;

    --col-bg: #feecd4;
    --col-title-color: #18332f;
    --col-text-color: #4b5563;
    --col-caption-title-color: #111111;
    --col-caption-text-color: #555555;
    --col-card-radius: 20px;
    --col-nav-bg: rgba(255, 255, 255, 0.95);
    --col-nav-icon: #18332f;
    --col-dot-color: #18332f;
    --col-aspect: 1 / 1;
    --col-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .col-section {
    width: 100%;
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts. */
    padding-inline: clamp(1rem, 3vw, 1.5rem);
    padding-block: var(--sp-top-m) var(--sp-bot-m);
    background-color: var(--col-bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  /* ---------- Header ---------- */
  .col-header {
    width: 100%;
    max-width: 720px;
    text-align: center;
    margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
  }
  .col-title {
    font-size: clamp(1.9rem, 4.5vw, 2.5rem);
    font-weight: 500;
    letter-spacing: 1.5px;
    color: var(--col-title-color);
    margin: 0 0 0.5rem;
    line-height: 1.2;
  }

  /* ---------- Stage ---------- */
  .col-stage {
    position: relative;
    width: 100%;
    max-width: 1200px;
    padding: 1rem 3.5rem;
  }
  @media (min-width: 1024px) {
    .col-stage {
      padding: 1rem 5rem;
    }
  }
  @media (max-width: 480px) {
    .col-stage {
      padding: 0.5rem 3.75rem;
    }
  }

  /* Track is the 3D stage: it owns the perspective so each slide's rotateY +
     translateZ render as real depth. Side slides poke out past it. */
  .col-track {
    position: relative;
    width: 100%;
    max-width: 560px;
    margin-inline: auto;
    aspect-ratio: var(--col-aspect);
    overflow: visible;
    perspective: 1400px;
    transform-style: preserve-3d;
  }

  /* ---------- Slide positioning ----------
     A depth coverflow: one combined transform per resting position —
     translateX glides it sideways, translateZ recedes it into the scene, scale
     shrinks it. No rotation — cards stay flat-on. Side slides are fully opaque
     so the section background never tints through the transparent card. */
  .col-slide {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.6s var(--col-ease),
      opacity 0.6s var(--col-ease);
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity;
  }

  /* When a slide wraps around the loop it would otherwise fly all the way
     across the stage. Snap it to its new side with no transition instead. */
  .col-slide[data-instant] {
    transition: none;
  }

  .col-slide[data-pos="active"] {
    opacity: 1;
    pointer-events: auto;
    z-index: 5;
    transform: translateX(0) translateZ(0) scale(1);
  }
  .col-slide[data-pos="left"] {
    opacity: 1;
    z-index: 4;
    transform: translateX(-90%) translateZ(-90px) scale(0.62);
  }
  .col-slide[data-pos="right"] {
    opacity: 1;
    z-index: 4;
    transform: translateX(90%) translateZ(-90px) scale(0.62);
  }
  /* Only 3 slides are ever visible (active + the two neighbours). The far
     positions stay laid out for the wrap animation but are fully hidden, so a
     slide fades in from the edge as it slides into the neighbour slot. */
  .col-slide[data-pos="far-left"] {
    opacity: 0;
    z-index: 2;
    transform: translateX(-130%) translateZ(-170px) scale(0.5);
  }
  .col-slide[data-pos="far-right"] {
    opacity: 0;
    z-index: 2;
    transform: translateX(130%) translateZ(-170px) scale(0.5);
  }
  .col-slide[data-pos="hidden"] {
    opacity: 0;
    z-index: 1;
    transform: translateZ(-340px) scale(0.45);
  }

  /* RTL mirrors the arc: sides swap to the opposite hand. */
  .col-slide:dir(rtl)[data-pos="left"] {
    transform: translateX(90%) translateZ(-90px) scale(0.62);
  }
  .col-slide:dir(rtl)[data-pos="right"] {
    transform: translateX(-90%) translateZ(-90px) scale(0.62);
  }
  .col-slide:dir(rtl)[data-pos="far-left"] {
    transform: translateX(130%) translateZ(-170px) scale(0.5);
  }
  .col-slide:dir(rtl)[data-pos="far-right"] {
    transform: translateX(-130%) translateZ(-170px) scale(0.5);
  }

  /* Single layout: only the active slide shows — everything else recedes out. */
  .col-section[data-layout="single"] .col-slide:not([data-pos="active"]) {
    opacity: 0;
    transform: translateZ(-340px) scale(0.45);
  }

  /* Mobile: neighbours shrink and peek in from the edges with a gap. */
  @media (max-width: 1023px) {
    .col-slide[data-pos="left"] {
      transform: translateX(-78%) translateZ(-60px) scale(0.56);
    }
    .col-slide[data-pos="right"] {
      transform: translateX(78%) translateZ(-60px) scale(0.56);
    }
    .col-slide:dir(rtl)[data-pos="left"] {
      transform: translateX(78%) translateZ(-60px) scale(0.56);
    }
    .col-slide:dir(rtl)[data-pos="right"] {
      transform: translateX(-78%) translateZ(-60px) scale(0.56);
    }
  }

  /* ---------- Slides entrance: stacked → spread ----------
     With «حركة الظهور» on, every slide starts collapsed at the center (receded
     into the scene and faded out), then releases to its coverflow position —
     the cards appear stacked, then fan out. The four-class selector outranks
     every resting data-pos rule (incl. the RTL / mobile ones) so it wins while
     "ready"; once the state flips to "in" it stops matching and the normal
     positions take over, and .col-slide's own transition animates the spread. */
  .col-section[data-enter="ready"] .col-track .col-slide {
    transform: translateX(0) translateZ(-220px) scale(0.6);
    opacity: 0;
  }

  /* ---------- Card ---------- */
  .col-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: var(--col-card-radius);
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    background: transparent;
    cursor: pointer;
  }
  .col-slide[data-pos="active"] .col-card {
    cursor: default;
  }

  .col-card img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
    transition: opacity 0.5s var(--col-ease),
      transform 0.5s var(--col-ease);
  }

  /* ---------- Animation: reveal ----------
     Two stacked images per slide; on active we cross-fade from closed→opened
     (with a hair of scale to feel like the product is "opening"). Slides
     without an "image_opened" are tagged "col-card--no-opened" so the swap
     is skipped — otherwise the closed image would fade out into nothing. */
  .col-card:not(.col-card--no-opened) .col-img-opened {
    opacity: 0;
    transform: scale(1.05);
    z-index: 2;
  }
  .col-card:not(.col-card--no-opened) .col-img-closed {
    opacity: 1;
    transform: scale(1);
    z-index: 1;
  }
  .col-slide[data-pos="active"]
    .col-card:not(.col-card--no-opened)
    .col-img-opened {
    opacity: 1;
    transform: scale(1);
  }
  .col-slide[data-pos="active"]
    .col-card:not(.col-card--no-opened)
    .col-img-closed {
    opacity: 0;
    transform: scale(1.1);
  }
  /* Hold the reveal until the slide has finished gliding to center: wait out
     the 0.6s slide-move transition before the closed→opened cross-fade starts.
     Reverting (leaving active) uses the base transition with no delay, so the
     closed image returns promptly. */
  .col-slide[data-pos="active"]
    .col-card:not(.col-card--no-opened)
    .col-img-opened,
  .col-slide[data-pos="active"]
    .col-card:not(.col-card--no-opened)
    .col-img-closed {
    transition-delay: 0.4s;
  }
  .col-card.col-card--no-opened .col-img-opened {
    display: none;
  }

  /* ---------- Caption block (per-slide, under carousel) ----------
     Fades out → swaps text → fades in as the active slide changes. */
  .col-caption {
    width: 100%;
    max-width: 640px;
    text-align: center;
    margin: clamp(1.25rem, 3vw, 2rem) auto 0;
    padding: 0 1rem;
    min-height: 6rem;
  }
  .col-caption[data-state="out"] .col-caption__title,
  .col-caption[data-state="out"] .col-caption__desc {
    opacity: 0;
    transform: translateY(6px);
  }
  .col-caption[data-state="in"] .col-caption__title,
  .col-caption[data-state="in"] .col-caption__desc {
    opacity: 1;
    transform: translateY(0);
  }
  .col-caption__title,
  .col-caption__desc {
    transition: opacity 0.45s var(--col-ease),
      transform 0.45s var(--col-ease);
  }
  .col-caption__title {
    font-size: clamp(1.3rem, 2.4vw, 1.85rem);
    font-weight: 400;
    letter-spacing: 0.5px;
    color: var(--col-caption-title-color);
    margin: 0 0 0.6rem;
    line-height: 1.3;
  }
  .col-caption__desc {
    font-size: clamp(0.95rem, 1.3vw, 1.05rem);
    color: var(--col-caption-text-color);
    line-height: 1.7;
    margin: 0;
    transition-delay: 0.05s;
  }

  /* ---------- Navigation ---------- */
  .col-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    background: var(--col-nav-bg);
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s var(--col-ease),
      box-shadow 0.25s var(--col-ease), filter 0.25s var(--col-ease);
    box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.3);
  }
  .col-nav:hover {
    transform: translateY(-50%) scale(1.1);
    filter: brightness(1.05);
    box-shadow: 0 10px 28px -8px rgba(0, 0, 0, 0.45);
  }
  .col-nav:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: translateY(-50%);
    box-shadow: none;
  }
  .col-nav svg {
    width: 22px;
    height: 22px;
    stroke: var(--col-nav-icon);
    fill: none;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .col-nav-prev {
    left: 0;
  }
  .col-nav-next {
    right: 0;
  }
  .col-nav-prev svg {
    transform: rotate(180deg);
  }
  /* RTL: swap nav button sides + flip arrows. */
  .col-nav-prev:dir(rtl) {
    left: auto;
    right: 0;
  }
  .col-nav-next:dir(rtl) {
    right: auto;
    left: 0;
  }
  .col-nav-prev:dir(rtl) svg {
    transform: rotate(0deg);
  }
  .col-nav-next:dir(rtl) svg {
    transform: rotate(180deg);
  }

  /* ---------- Pagination dots ---------- */
  .col-dots {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 24px;
  }
  .col-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: none;
    padding: 0;
    background: var(--col-dot-color);
    opacity: 0.35;
    cursor: pointer;
    transition: opacity 0.25s var(--col-ease),
      transform 0.25s var(--col-ease);
  }
  .col-dot[aria-current="true"] {
    opacity: 1;
    transform: scale(1.25);
  }
  .col-dot:hover {
    opacity: 0.7;
  }

  /* ---------- Header entrance (fade + de-blur) ---------- */
  .col-header > * {
    will-change: opacity, filter, transform;
  }
  .col-header[data-anim="ready"] > * {
    opacity: 0;
    filter: blur(14px);
    transform: translateY(8px);
  }
  .col-header[data-anim="in"] > * {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
    transition: opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.85s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.95s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .col-header[data-anim="in"] > *:nth-child(1) {
    transition-delay: 0.08s;
  }
  .col-header[data-anim="in"] > *:nth-child(2) {
    transition-delay: 0.26s;
  }

  /* ---------- Empty state ---------- */
  .col-empty {
    width: 100%;
    padding: 60px 20px;
    text-align: center;
    color: #888;
    background: var(--col-bg);
  }

  /* ---------- Reduced motion ---------- */
  @media (prefers-reduced-motion: reduce) {
    .col-slide,
    .col-card,
    .col-card img,
    .col-nav,
    .col-dot,
    .col-caption__title,
    .col-caption__desc {
      transition: none !important;
    }
    .col-header[data-anim] > * {
      opacity: 1 !important;
      filter: blur(0) !important;
      transform: none !important;
      transition: none !important;
    }
  }

  /* ---------- Mobile tuning ---------- */
  @media (max-width: 640px) {
    .col-nav {
      width: 42px;
      height: 42px;
    }
    .col-nav svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (min-width: 768px) {
    .col-section {
      padding-block: var(--sp-top-d) var(--sp-bot-d);
    }
  }
`;
var H = Object.defineProperty, v = (s, t, e, i) => {
  for (var o = void 0, a = s.length - 1, n; a >= 0; a--)
    (n = s[a]) && (o = n(t, e, o) || o);
  return o && H(t, e, o), o;
};
const $ = class $ extends E {
  constructor() {
    super(...arguments), this._activeIndex = 0, this._animState = "ready", this._captionState = "in", this._autoplayTimer = null, this._captionTimer = null, this._hoverPaused = !1, this._hasInitializedActive = !1, this._inView = !0, this._io = null, this._swipeStartX = null, this._swipeStartY = null, this._swipeActive = !1, this._prevDiff = /* @__PURE__ */ new Map(), this._goPrev = () => {
      var o;
      const t = this._slides().length;
      if (t <= 1) return;
      const e = ((o = this.config) == null ? void 0 : o.loop) === !0;
      let i = this._activeIndex - 1;
      i < 0 && (i = e ? t - 1 : 0), this._changeActive(i);
    }, this._goNext = () => {
      var o;
      const t = this._slides().length;
      if (t <= 1) return;
      const e = ((o = this.config) == null ? void 0 : o.loop) === !0;
      let i = this._activeIndex + 1;
      i >= t && (i = e ? 0 : t - 1), this._changeActive(i);
    }, this._goTo = (t) => {
      const e = this._slides().length;
      t < 0 || t >= e || this._changeActive(t);
    }, this._onSlideClick = (t) => {
      if (this._swipeActive) return;
      const e = t.currentTarget;
      if (!e || e.dataset.pos === "active") return;
      const i = Number(e.dataset.index);
      Number.isInteger(i) && this._goTo(i);
    }, this._onPointerDown = (t) => {
      var e;
      if (!(this._slides().length <= 1)) {
        try {
          (e = t.currentTarget) == null || e.setPointerCapture(t.pointerId);
        } catch {
        }
        this._swipeStartX = t.clientX, this._swipeStartY = t.clientY, this._swipeActive = !1;
      }
    }, this._onPointerMove = (t) => {
      if (this._swipeStartX === null) return;
      const e = t.clientX - this._swipeStartX, i = t.clientY - (this._swipeStartY ?? t.clientY);
      !this._swipeActive && Math.abs(e) > 10 && Math.abs(e) > Math.abs(i) && (this._swipeActive = !0);
    }, this._onPointerUp = (t) => {
      try {
        const o = t.currentTarget;
        o != null && o.hasPointerCapture(t.pointerId) && o.releasePointerCapture(t.pointerId);
      } catch {
      }
      if (this._swipeStartX === null) return;
      const e = t.clientX - this._swipeStartX, i = getComputedStyle(this).direction === "rtl";
      this._swipeActive && Math.abs(e) > 40 && ((i ? e > 0 : e < 0) ? this._goNext() : this._goPrev()), this._swipeStartX = null, this._swipeStartY = null, window.setTimeout(() => {
        this._swipeActive = !1;
      }, 50);
    }, this._onHoverIn = () => {
      this._hoverPaused = !0;
    }, this._onHoverOut = () => {
      this._hoverPaused = !1;
    };
  }
  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  _slides() {
    var e;
    const t = (e = this.config) == null ? void 0 : e.slides;
    return Array.isArray(t) ? t.filter((i) => !i || typeof i != "object" ? !1 : !!(i.image || i.image_opened)) : [];
  }
  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------
  connectedCallback() {
    var i;
    super.connectedCallback();
    const t = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches, e = ((i = this.config) == null ? void 0 : i.enable_entrance_anim) === !1;
    t || e ? this._animState = "in" : requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._animState = "in";
      });
    }), "IntersectionObserver" in window && (this._io = new IntersectionObserver(
      (o) => {
        const a = o[0];
        a && (this._inView = a.isIntersecting, this._teardownAutoplay(), this._inView && this._setupAutoplay());
      },
      { threshold: 0.15 }
    ), this._io.observe(this));
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), this._teardownAutoplay(), (t = this._io) == null || t.disconnect(), this._io = null, this._captionTimer && (clearTimeout(this._captionTimer), this._captionTimer = null);
  }
  willUpdate(t) {
    var i;
    if (!t.has("config")) return;
    const e = this._slides();
    if (!this._hasInitializedActive && e.length > 0) {
      const o = this._num((i = this.config) == null ? void 0 : i.initial_slide, NaN), a = Math.floor(e.length / 2), n = Number.isNaN(o) ? a : Math.max(0, Math.min(e.length - 1, Math.round(o) - 1));
      this._activeIndex = n, this._hasInitializedActive = !0;
    } else this._activeIndex >= e.length && (this._activeIndex = Math.max(0, e.length - 1));
    this._teardownAutoplay(), this._setupAutoplay();
  }
  updated() {
    var e;
    this._syncAnchor((e = this.config) == null ? void 0 : e.anchor_id, "collection");
    const t = this._slides().length;
    this._prevDiff.clear();
    for (let i = 0; i < t; i++) this._prevDiff.set(i, this._wrappedDiff(i));
  }
  // ------------------------------------------------------------
  // Autoplay
  // ------------------------------------------------------------
  _setupAutoplay() {
    const t = this.config || {};
    if (!t.autoplay || !this._inView || this._slides().length < 2) return;
    const e = Math.max(1, this._num(t.autoplay_delay, 5));
    this._autoplayTimer = window.setInterval(() => {
      this._hoverPaused || this._swipeActive || this._goNext();
    }, e * 1e3);
  }
  _teardownAutoplay() {
    this._autoplayTimer && (clearInterval(this._autoplayTimer), this._autoplayTimer = null);
  }
  // ------------------------------------------------------------
  // Carousel navigation
  // ------------------------------------------------------------
  _changeActive(t) {
    t !== this._activeIndex && (this._activeIndex = t, this._flashCaption());
  }
  /** Brief fade-out → text swap → fade-in on the caption block. */
  _flashCaption() {
    this._captionTimer && (clearTimeout(this._captionTimer), this._captionTimer = null), this._captionState = "out", this._captionTimer = window.setTimeout(() => {
      this._captionState = "in", this._captionTimer = null;
    }, 220);
  }
  /** Signed slot offset from the active slide, wrapped to the shorter way
      around the ring when looping (so slide 0 can sit just left of the last). */
  _wrappedDiff(t) {
    var o;
    const e = this._slides().length;
    if (e === 0) return 0;
    let i = t - this._activeIndex;
    return ((o = this.config) == null ? void 0 : o.loop) === !0 && (i > e / 2 && (i -= e), i < -e / 2 && (i += e)), i;
  }
  _slidePos(t) {
    if (this._slides().length === 0) return "hidden";
    const e = this._wrappedDiff(t);
    return e === 0 ? "active" : e === -1 ? "left" : e === 1 ? "right" : e === -2 ? "far-left" : e === 2 ? "far-right" : "hidden";
  }
  _isPrevDisabled() {
    var t;
    return ((t = this.config) == null ? void 0 : t.loop) === !0 ? !1 : this._activeIndex === 0 || this._slides().length <= 1;
  }
  _isNextDisabled() {
    var t;
    return ((t = this.config) == null ? void 0 : t.loop) === !0 ? !1 : this._activeIndex === this._slides().length - 1 || this._slides().length <= 1;
  }
  // ------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------
  _slideImage(t) {
    const e = t.image || void 0, i = t.image_opened || void 0, o = this.localizedString(t.title) || "";
    return { closed: e, opened: i, alt: o };
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  render() {
    const t = this.config || {}, e = this._slides(), i = this._pickValue(
      t.slide_animation,
      "reveal"
    ), o = this._pickValue(t.aspect_ratio, "1/1"), a = this._pickValue(
      t.desktop_layout,
      "coverflow"
    ), n = this.localizedString(
      t.section_title ?? t.title
    ), d = t.show_caption !== !1, l = t.show_nav_buttons === !0, u = !!t.show_pagination, S = t.enable_entrance_anim !== !1, P = this._num(t.card_radius, 20), k = [
      t.bg_color ? `--col-bg: ${t.bg_color}` : "",
      t.title_color ? `--col-title-color: ${t.title_color}` : "",
      t.caption_title_color ? `--col-caption-title-color: ${t.caption_title_color}` : "",
      t.caption_text_color ? `--col-caption-text-color: ${t.caption_text_color}` : "",
      `--col-card-radius: ${P}px`,
      t.nav_bg ? `--col-nav-bg: ${t.nav_bg}` : "",
      t.nav_icon_color ? `--col-nav-icon: ${t.nav_icon_color}` : "",
      t.dot_color ? `--col-dot-color: ${t.dot_color}` : "",
      `--col-aspect: ${o}`,
      ...O(
        t,
        (f, c) => this._pickValue(f, c)
      )
    ].filter(Boolean).join("; ");
    if (e.length === 0)
      return r`
        <section class="col-empty" style=${k}>
          <p>أضف صورة واحدة على الأقل لكل شريحة للبدء.</p>
        </section>
      `;
    const A = e.length === 1, T = "m9 6 6 6-6 6", m = e[this._activeIndex], w = m ? this.localizedString(m.title) : "", y = m ? this.localizedString(m.description) : "", D = !!(d && (w || y));
    return r`
      <section
        class="col-section"
        style=${k}
        data-layout=${a}
        data-anim=${i}
        data-enter=${S ? this._animState : "in"}
        @mouseenter=${this._onHoverIn}
        @mouseleave=${this._onHoverOut}
      >
        ${n ? r`
              <div
                class="col-header"
                data-anim=${S ? this._animState : "in"}
              >
                <h2 class="col-title">${n}</h2>
              </div>
            ` : p}

        <div
          class="col-stage"
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}
        >
          <div class="col-track">
            ${e.map((f, c) => {
      const X = this._wrappedDiff(c), M = this._slidePos(c), I = this._prevDiff.get(c), Z = I !== void 0 && Math.abs(X - I) > e.length / 2, { closed: z, opened: b, alt: C } = this._slideImage(f), Y = !b || i !== "reveal";
      return r`
                <div
                  class="col-slide"
                  data-pos=${M}
                  data-index=${c}
                  data-instant=${Z ? "" : p}
                  @click=${this._onSlideClick}
                >
                  <div
                    class="col-card ${Y ? "col-card--no-opened" : ""}"
                  >
                    ${z ? r`<img
                          class="col-img-closed"
                          src=${z}
                          alt=${C}
                          loading="lazy"
                          draggable="false"
                        />` : p}
                    ${i === "reveal" && b ? r`<img
                          class="col-img-opened"
                          src=${b}
                          alt=${C}
                          loading="lazy"
                          draggable="false"
                        />` : p}
                  </div>
                </div>
              `;
    })}
          </div>

          ${!A && l ? r`
                <button
                  class="col-nav col-nav-prev"
                  type="button"
                  @click=${this._goPrev}
                  ?disabled=${this._isPrevDisabled()}
                  aria-label="Previous"
                >
                  <svg viewBox="0 0 24 24">
                    <path d=${T} />
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
                    <path d=${T} />
                  </svg>
                </button>
              ` : p}
        </div>

        ${D ? r`
              <div class="col-caption" data-state=${this._captionState}>
                ${w ? r`<h3 class="col-caption__title">${w}</h3>` : p}
                ${y ? r`<p class="col-caption__desc">${y}</p>` : p}
              </div>
            ` : p}

        ${!A && u ? r`
              <div class="col-dots" role="tablist">
                ${e.map(
      (f, c) => r`
                    <button
                      class="col-dot"
                      type="button"
                      aria-current=${this._activeIndex === c ? "true" : "false"}
                      aria-label=${`Slide ${c + 1}`}
                      @click=${() => this._goTo(c)}
                    ></button>
                  `
    )}
              </div>
            ` : p}
      </section>
    `;
  }
};
$.styles = R;
let h = $;
v([
  V({ type: Object })
], h.prototype, "config");
v([
  x()
], h.prototype, "_activeIndex");
v([
  x()
], h.prototype, "_animState");
v([
  x()
], h.prototype, "_captionState");
typeof h < "u" && h.registerSallaComponent("salla-collection");
export {
  h as default
};
