import { LitElement as D, css as N, nothing as _, svg as O, html as d } from "lit";
import { property as R, state as B } from "lit/decorators.js";
function V(l, t) {
  if (typeof l == "string") return l;
  if (!l || typeof l != "object") return "";
  const i = l[t] || l.ar || l.en || "";
  return typeof i == "string" ? i.trim() : "";
}
function A(l) {
  return l.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class P extends D {
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
    const i = String(t || "").trim(), e = i.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), n = e.includes("-") ? e : `salla-${e || "component"}`, a = () => `${n}-${Math.random().toString(36).substring(2, 8)}`, r = () => {
      var c;
      const o = (c = window.Salla) == null ? void 0 : c.bundles;
      return o && typeof o.registerComponent == "function" ? (o.registerComponent(i, {
        component: this,
        dynamicTagName: a()
      }), !0) : !1;
    };
    if (r()) return;
    const s = window.setInterval(() => {
      r() && window.clearInterval(s);
    }, 100);
    window.setTimeout(() => window.clearInterval(s), 5e3);
  }
  /** Resolved document language. */
  _lang() {
    return (document.documentElement.lang || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
  }
  /** Pull the store-language string out of a Salla multilanguage value. */
  localizedString(t) {
    return V(t, this._lang());
  }
  /** Dropdown-list values from settings may come as [{ label, value }]. */
  _pickValue(t, i) {
    if (typeof t == "string" && t) return t;
    if (Array.isArray(t) && t.length > 0) {
      const e = t[0];
      if (e && typeof e.value == "string" && e.value)
        return e.value;
    }
    return i;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(t) {
    return A(t);
  }
  /**
   * The inverse: render a number in the digits the store's language uses, so a
   * counter or a step badge matches the copy beside it. Latin digits outside
   * Arabic, Arabic-Indic inside it.
   */
  _localeNum(t) {
    return this._lang() !== "ar" ? String(t) : String(t).replace(
      /\d/g,
      (i) => String.fromCharCode(1632 + Number(i))
    );
  }
  /**
   * Normalise a merchant-typed anchor into an id. Deliberately permissive
   * about script — Arabic ids are valid HTML and resolve fine through
   * getElementById — so we only strip the leading `#`, collapse whitespace,
   * and drop the characters that would break a URL fragment or a selector.
   */
  _slugify(t, i) {
    var a;
    return (typeof t == "string" ? t : Array.isArray(t) ? String(((a = t[0]) == null ? void 0 : a.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || i;
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
  _syncAnchor(t, i, e = 24) {
    const n = this._slugify(t, i);
    if (!n || n === this._anchorBase) return;
    this._anchorBase = n;
    let a = n;
    for (let s = 2; ; s++) {
      const o = document.getElementById(a);
      if (!o || o === this) break;
      a = `${n}-${s}`;
    }
    if (this.id = a, this.style.scrollMarginTop = `${e}px`, this._anchorDeepLinked) return;
    let r = "";
    try {
      r = decodeURIComponent(location.hash.slice(1));
    } catch {
      r = location.hash.slice(1);
    }
    r && r === a && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(t, i) {
    if (!i.startsWith("#") || i === "#") return;
    let e = i.slice(1);
    try {
      e = decodeURIComponent(e);
    } catch {
    }
    const n = document.getElementById(e);
    if (!n) return;
    t.preventDefault();
    const a = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    n.scrollIntoView({
      block: "start",
      behavior: a ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${e}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, i) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const e = Number(A(t.trim()));
      if (!Number.isNaN(e)) return e;
    }
    if (Array.isArray(t) && t.length > 0) {
      const e = t[0];
      if ((e == null ? void 0 : e.value) !== void 0) return this._num(e.value, i);
    }
    return i;
  }
}
const $ = {
  none: 0,
  xs: 12,
  sm: 24,
  md: 40,
  lg: 56,
  xl: 72
}, x = {
  none: 0,
  xs: 20,
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128
};
function Y(l, t, i = "md", e = "md") {
  const n = t(l == null ? void 0 : l.space_top, i), a = t(l == null ? void 0 : l.space_bottom, e), r = $[n] ?? $.md, s = $[a] ?? $.md, o = x[n] ?? x.md, c = x[a] ?? x.md;
  return [
    `--sp-top-m:${r}px`,
    `--sp-bot-m:${s}px`,
    `--sp-top-d:${o}px`,
    `--sp-bot-d:${c}px`
  ];
}
const j = N`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    /* Width comes from the container, never from the contents. */
    min-width: 0;
    max-width: 100%;

    --ing-bg: #f5f5f5;
    --ing-title: #14181f;
    --ing-subtitle: #5b6573;
    --ing-label: #14181f;
    --ing-connector: #9aa0a6;

    /* Full-bleed on mobile; the desktop breakpoint restores a gutter. */
    --ing-pad-x: 0px;
    --ing-stage-max: 560px;
    --ing-product-w: 30%;
    --ing-product-w-d: 30%;
    --ing-row-gap: 26px;
    --ing-col-gap: 10px;
    --ing-connector-w: 1px;
    --ing-scale-m: 1;
    --ing-scale-d: 1.28;

    /* Circle layout. Every measurement is a percentage of the square stage's
       own width, which is what lets the ring scale with the viewport without a
       resize listener or any CSS trig. */
    --ing-ring: #c2a284;
    --ing-ring-w: 1px;
    --ing-dot-size: 10px;
    --ing-circle-pw: 25%;
    --ing-circle-pw-d: 25%;
    --ing-ring-m: 70%;
    --ing-ring-d: 70%;
    --ing-orbit-m: 78%;
    --ing-orbit-d: 78%;

    --ing-ease: cubic-bezier(0.22, 1, 0.36, 1);
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
  .ing {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--ing-bg);
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts. */
    padding-inline: var(--ing-pad-x);
    padding-block: var(--sp-top-m) var(--sp-bot-m);
    overflow: hidden;

    /* These all DERIVE from --ing-scale-m / --ing-product-w, so they must be
       declared on the element the component writes its inline overrides to.
       Declared on :host they would resolve against the host's own defaults and
       every size setting would silently do nothing. */
    --ing-scale: var(--ing-scale-m, 1);
    --ing-pw: var(--ing-product-w, 30%);
    --ing-media: calc(96px * var(--ing-scale));
    --ing-label-fs: calc(0.78rem * var(--ing-scale));
    --ing-link-w: calc(40px * var(--ing-scale));
    --ing-link-h: calc(26px * var(--ing-scale));
    --ing-gap: calc(4px * var(--ing-scale));

    /* Circle layout. --ing-arm-top / --ing-dot-top are the vertical distance
       from the stage top to a point sitting at 12 o'clock on each radius; the
       arm rotation below carries that point around to its real angle. */
    --ing-cpw: var(--ing-circle-pw, 25%);
    --ing-ring-size: var(--ing-ring-m, 70%);
    --ing-orbit-size: var(--ing-orbit-m, 78%);
    --ing-arm-top: calc(50% - var(--ing-orbit-size) / 2);
    --ing-dot-top: calc(50% - var(--ing-ring-size) / 2);
  }

  .ing-header {
    max-width: 640px;
    margin: 0 auto clamp(1.25rem, 4vw, 2rem);
    /* The section is full-bleed on mobile, so the header carries its own
       gutter — only the stage should actually touch the screen edges. */
    padding-inline: clamp(1rem, 4vw, 2rem);
    text-align: center;
  }
  .ing-h2 {
    margin: 0;
    color: var(--ing-title);
    font-size: clamp(1.6rem, 5.5vw, 2.1rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .ing-sub {
    margin: 0.55rem 0 0;
    color: var(--ing-subtitle);
    font-size: clamp(0.9rem, 1.6vw, 1.02rem);
    line-height: 1.7;
  }

  /* ============================================================
     STAGE — ingredients | product | ingredients
     ============================================================ */
  .ing-stage {
    direction: ltr;
    display: grid;
    grid-template-columns: 1fr var(--ing-pw) 1fr;
    align-items: center;
    column-gap: var(--ing-col-gap);
    width: 100%;
    max-width: var(--ing-stage-max);
    margin-inline: auto;
    padding-inline: clamp(0.5rem, 3vw, 1rem);
  }

  .ing-product {
    grid-column: 2;
    align-self: center;
    min-width: 0;
    /* Optical centring: the component centres the image BOX, which is not the
       same as centring what the eye reads as the product when a shadow is baked
       into one side of the cut-out. Percentages here are of the image's own
       size, so the correction holds at any width setting or breakpoint.

       ⚠️ --ing-prod-dx is NEGATED: positive means LEFT. The merchant panel is
       RTL, and an RTL range input renders its minimum at the RIGHT end, so
       dragging the handle rightwards LOWERS the value. Negating here is what
       makes the product follow the handle instead of mirroring it. See the
       RTL slider note in CLAUDE.md before "fixing" this sign. */
    transform: translate(
      calc(-1 * var(--ing-prod-dx, 0%)),
      var(--ing-prod-dy, 0%)
    );
  }
  .ing-product img {
    display: block;
    width: 100%;
    height: auto;
  }

  .ing-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--ing-row-gap);
    min-width: 0;
  }
  .ing-col[data-side="left"] {
    grid-column: 1;
  }
  .ing-col[data-side="right"] {
    grid-column: 3;
  }

  /* ============================================================
     ONE INGREDIENT — name, hairline, cut-out
     ============================================================ */
  .ing-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ing-gap);
    margin: 0;
    min-width: 0;
    max-width: 100%;
    transform: translateY(var(--ing-offset, 0%));
  }
  /* The name under the picture: flip the stack, and the hairline with it, so
     the dot still lands at the name end. */
  .ing-item[data-label="below"] {
    flex-direction: column-reverse;
  }
  .ing-item[data-label="below"] .ing-link {
    transform: scaleY(-1);
  }
  .ing-item[data-label="below"][data-side="right"] .ing-link {
    transform: scale(-1, -1);
  }

  .ing-label {
    margin: 0;
    color: var(--ing-label);
    font-size: var(--ing-label-fs);
    font-weight: 700;
    line-height: 1.4;
    text-align: center;
    /* Long names must wrap inside the column rather than widen it. */
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  /* Nudge the name toward the product, which is what makes the hairline read
     as a leader line rather than a stray tick. */
  .ing-item[data-align="toward"][data-side="left"] .ing-label {
    transform: translateX(calc(var(--ing-media) * 0.16));
  }
  .ing-item[data-align="toward"][data-side="right"] .ing-label {
    transform: translateX(calc(var(--ing-media) * -0.16));
  }

  .ing-link {
    display: block;
    width: var(--ing-link-w);
    height: var(--ing-link-h);
    overflow: visible;
    color: var(--ing-connector);
    flex: 0 0 auto;
  }
  /* Drawn bending to the right, for an ingredient sitting LEFT of the product.
     The right-hand column is the same curve mirrored. */
  .ing-item[data-side="right"] .ing-link {
    transform: scaleX(-1);
  }
  .ing-link path {
    fill: none;
    stroke: currentColor;
    stroke-width: var(--ing-connector-w);
    stroke-linecap: round;
  }
  .ing-link circle {
    fill: currentColor;
    stroke: none;
  }

  .ing-media {
    display: block;
    width: calc(var(--ing-media) * var(--ing-iscale, 1));
    max-width: 100%;
  }
  .ing-media img {
    display: block;
    width: 100%;
    height: auto;
  }

  /* ============================================================
     FALLBACK — no product shot: a plain two-up grid
     ============================================================ */
  .ing-stage[data-mode="grid"] {
    direction: inherit;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ing-row-gap) var(--ing-col-gap);
    max-width: 520px;
  }
  .ing-stage[data-mode="grid"] .ing-col {
    display: contents;
  }
  /* Nothing to point at once the product is gone. */
  .ing-stage[data-mode="grid"] .ing-link {
    display: none;
  }
  .ing-stage[data-mode="grid"] .ing-item {
    transform: none;
  }
  .ing-stage[data-mode="grid"] .ing-label {
    transform: none;
  }

  .ing-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--ing-subtitle);
    font-size: 0.92rem;
  }

  /* ============================================================
     CIRCLE LAYOUT — a ring orbiting the product

     Placement uses the rotate / counter-rotate arm trick rather than JS
     coordinates or CSS trig: an arm is stretched over the whole square stage
     and rotated to the ingredient's angle, its child is parked at the top of
     that arm one orbit-radius up, then counter-rotated so it sits upright.
     Every input is a percentage, so the whole composition is responsive with
     no resize listener and no sin()/cos() support to worry about.
     ============================================================ */
  .ing-orbit {
    direction: ltr;
    position: relative;
    width: 100%;
    /* Square, so a percentage radius is the same length horizontally and
       vertically and the ring stays a circle. */
    aspect-ratio: 1;
    max-width: var(--ing-stage-max);
    margin-inline: auto;
  }

  .ing-ring-line {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--ing-ring-size);
    aspect-ratio: 1;
    margin: 0;
    border: var(--ing-ring-w) solid var(--ing-ring);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .ing-ring-line[data-ring="dashed"] {
    border-style: dashed;
  }
  .ing-ring-line[data-ring="dotted"] {
    border-style: dotted;
  }

  /* Rotated to its angle; stretched over the stage so its child can be placed
     with a percentage offset from the centre. */
  .ing-arm {
    position: absolute;
    inset: 0;
    transform: rotate(var(--a, 0deg));
    pointer-events: none;
  }
  .ing-arm > * {
    pointer-events: auto;
  }

  /* An outlined bead, not a filled dot — it reads as a station on the line
     rather than a blob, and stays legible at 1px stroke. Sits a few degrees
     around the arc from its ingredient, on the side the name is, so the cut-out
     never covers it. */
  .ing-dot {
    position: absolute;
    left: 50%;
    top: var(--ing-dot-top);
    width: var(--ing-dot-size);
    height: var(--ing-dot-size);
    border: var(--ing-ring-w) solid var(--ing-ring);
    border-radius: 50%;
    background: var(--ing-bg);
    transform: translate(-50%, -50%);
  }

  .ing-orbit .ing-product {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--ing-cpw);
    /* Same nudge, folded into the centring translate — and negated on X for the
       same RTL-slider reason. The ring stays centred on the section; only the
       product moves inside it. */
    transform: translate(
      calc(-50% - var(--ing-prod-dx, 0%)),
      calc(-50% + var(--ing-prod-dy, 0%))
    );
    z-index: 1;
  }

  .ing-orbit .ing-item {
    position: absolute;
    left: 50%;
    top: var(--ing-arm-top);
    /* Kept narrower than the gap to the centre so a long name wraps instead of
       running over the product. */
    max-width: 38%;
    z-index: 2;
    --ing-place: translate(-50%, -50%) rotate(calc(-1 * var(--a, 0deg)));
    transform: var(--ing-place) translateY(var(--ing-offset, 0%));
  }
  /* No hairline in this layout: the ring and its dot are the connector. */
  .ing-orbit .ing-link {
    display: none;
  }
  /* Reserve a square cell up front. The pictures are lazy-loaded, and an
     absolutely-positioned item whose image has not decoded yet collapses to
     label height and jumps once it does — very visible here, because the
     entrance animation can finish before the picture arrives. Equal square
     cells are also what the ring composition wants. */
  .ing-orbit .ing-media {
    aspect-ratio: 1;
  }
  .ing-orbit .ing-media img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  /* Nudge the name away from the product, out over open background. */
  .ing-item[data-align="outward"] .ing-label {
    transform: translateX(calc(var(--ing-media) * 0.18 * var(--ing-out, 1)));
  }

  /* ============================================================
     MOTION
     ============================================================ */
  .ing-item {
    transition:
      opacity 0.55s var(--ing-ease),
      transform 0.55s var(--ing-ease);
    transition-delay: calc(var(--i, 0) * 90ms);
  }
  .ing-stage[data-anim="ready"] .ing-item {
    opacity: 0;
    transform: translateY(calc(var(--ing-offset, 0%) + 10px)) scale(0.96);
  }
  .ing-stage[data-anim="in"] .ing-item {
    opacity: 1;
    transform: translateY(var(--ing-offset, 0%));
  }
  .ing-product {
    transition: opacity 0.6s var(--ing-ease);
  }
  .ing-stage[data-anim="ready"] .ing-product {
    opacity: 0;
  }
  .ing-stage[data-anim="in"] .ing-product {
    opacity: 1;
  }

  /* The orbit re-states the same two states, because its items carry the
     placement transform and cannot simply inherit the columns one. */
  .ing-orbit[data-anim="ready"] .ing-item {
    opacity: 0;
    transform: var(--ing-place) translateY(calc(var(--ing-offset, 0%) + 10px))
      scale(0.92);
  }
  .ing-orbit[data-anim="in"] .ing-item {
    opacity: 1;
    transform: var(--ing-place) translateY(var(--ing-offset, 0%));
  }
  .ing-ring-line,
  .ing-dot {
    transition:
      opacity 0.7s var(--ing-ease),
      transform 0.7s var(--ing-ease);
  }
  .ing-orbit[data-anim="ready"] .ing-ring-line {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.86);
  }
  .ing-orbit[data-anim="in"] .ing-ring-line {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  .ing-dot {
    transition-delay: 0.25s;
  }
  .ing-orbit[data-anim="ready"] .ing-dot {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
  }
  .ing-orbit[data-anim="in"] .ing-dot {
    opacity: 1;
    transform: translate(-50%, -50%);
  }

  @media (prefers-reduced-motion: reduce) {
    .ing-item,
    .ing-product,
    .ing-ring-line,
    .ing-dot {
      transition: none;
    }
    .ing-stage[data-anim="ready"] .ing-item {
      opacity: 1;
      transform: translateY(var(--ing-offset, 0%));
    }
    .ing-stage[data-anim="ready"] .ing-product {
      opacity: 1;
    }
    .ing-orbit[data-anim="ready"] .ing-item {
      opacity: 1;
      transform: var(--ing-place) translateY(var(--ing-offset, 0%));
    }
    .ing-orbit[data-anim="ready"] .ing-ring-line,
    .ing-orbit[data-anim="ready"] .ing-dot {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    .ing {
      padding-block: var(--sp-top-d) var(--sp-bot-d);
    }
    :host {
      --ing-pad-x: clamp(1rem, 4vw, 2rem);
    }
    .ing {
      --ing-scale: var(--ing-scale-d, 1);
      --ing-pw: var(--ing-product-w-d, var(--ing-product-w, 30%));
      --ing-cpw: var(--ing-circle-pw-d, var(--ing-circle-pw, 25%));
      --ing-ring-size: var(--ing-ring-d, var(--ing-ring-m, 70%));
      --ing-orbit-size: var(--ing-orbit-d, var(--ing-orbit-m, 78%));
    }
    .ing-header {
      padding-inline: 0;
    }
    .ing-stage {
      padding-inline: 0;
    }
  }
`;
var K = Object.defineProperty, L = (l, t, i, e) => {
  for (var n = void 0, a = l.length - 1, r; a >= 0; a--)
    (r = l[a]) && (n = r(t, i, n) || n);
  return n && K(t, i, n), n;
};
const q = {
  sm: 0.84,
  md: 1,
  lg: 1.18
}, X = {
  sm: 1.08,
  md: 1.28,
  lg: 1.5
}, W = "M 33 4 C 33 13 26 15 14 22", F = "M 33 4 L 14 22", g = (l, t, i) => Math.max(t, Math.min(i, l)), T = class T extends P {
  constructor() {
    super(...arguments), this._animState = "ready", this._io = null, this._fallbackTimer = null, this._reveal = () => {
      var t;
      this._animState = "in", (t = this._io) == null || t.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null);
    };
  }
  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------
  /** Keep ingredients that have something to show. */
  _items() {
    var i;
    const t = (i = this.config) == null ? void 0 : i.items;
    return Array.isArray(t) ? t.filter((e) => !e || typeof e != "object" ? !1 : !!(this.localizedString(e.name) || e.image)) : [];
  }
  _productImage() {
    var i;
    const t = (i = this.config) == null ? void 0 : i.product_image;
    return typeof t == "string" ? t.trim() : "";
  }
  _reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  connectedCallback() {
    if (super.connectedCallback(), !("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }
    this._io = new IntersectionObserver(
      (t) => {
        var i;
        (i = t[0]) != null && i.isIntersecting && this._reveal();
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
    this._syncAnchor((t = this.config) == null ? void 0 : t.anchor_id, "ingredients");
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  _hostStyle(t) {
    const i = this._pickValue(t.item_size, "md"), e = this._pickValue(
      t.item_size_desktop,
      "inherit"
    ), n = e === "inherit" ? i : e, a = g(this._num(t.product_width, 30), 15, 75), r = t.desktop_custom_width ? g(this._num(t.product_width_desktop, a), 15, 75) : a, s = g(this._num(t.circle_product_width, 25), 10, 60), o = g(this._num(t.ring_size, 70), 30, 100), c = g(this._num(t.orbit_size, 78), 30, 110), m = !!t.circle_desktop_custom, h = m ? g(this._num(t.circle_product_width_desktop, s), 10, 60) : s, p = m ? g(this._num(t.ring_size_desktop, o), 30, 100) : o, b = m ? g(this._num(t.orbit_size_desktop, c), 30, 110) : c;
    return [
      t.bg_color ? `--ing-bg:${t.bg_color}` : "",
      t.title_color ? `--ing-title:${t.title_color}` : "",
      t.subtitle_color ? `--ing-subtitle:${t.subtitle_color}` : "",
      t.label_color ? `--ing-label:${t.label_color}` : "",
      t.connector_color ? `--ing-connector:${t.connector_color}` : "",
      t.ring_color ? `--ing-ring:${t.ring_color}` : "",
      `--ing-scale-m:${q[i] ?? 1}`,
      `--ing-scale-d:${X[n] ?? 1.28}`,
      `--ing-product-w:${a}%`,
      `--ing-product-w-d:${r}%`,
      `--ing-row-gap:${Math.max(0, this._num(t.row_gap, 26))}px`,
      `--ing-col-gap:${Math.max(0, this._num(t.column_gap, 10))}px`,
      `--ing-connector-w:${Math.max(0.5, this._num(t.connector_width, 1))}px`,
      `--ing-stage-max:${this._num(t.stage_max_width, 560)}px`,
      `--ing-prod-dx:${g(this._num(t.product_offset_x, 0), -40, 40)}%`,
      `--ing-prod-dy:${g(this._num(t.product_offset_y, 0), -40, 40)}%`,
      `--ing-circle-pw:${s}%`,
      `--ing-circle-pw-d:${h}%`,
      `--ing-ring-m:${o}%`,
      `--ing-ring-d:${p}%`,
      `--ing-orbit-m:${c}%`,
      `--ing-orbit-d:${b}%`,
      `--ing-ring-w:${g(this._num(t.ring_width, 1), 0.5, 6)}px`,
      `--ing-dot-size:${g(this._num(t.ring_dot_size, 10), 4, 20)}px`,
      ...Y(t, (f, v) => this._pickValue(f, v))
    ].filter(Boolean).join("; ");
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
  _circleAngles(t, i, e) {
    const n = g(this._num(t.circle_start_angle, 55), 0, 180), a = g(this._num(t.circle_arc_span, 85), 0, 179), r = new Array(i.length).fill(n);
    return ["right", "left"].forEach((s) => {
      const o = i.map((m, h) => h).filter((m) => e[m] === s), c = o.length > 1 ? a / (o.length - 1) : 0;
      o.forEach((m, h) => {
        const p = n + h * c;
        r[m] = s === "left" ? 360 - p : p;
      });
    }), r.map((s, o) => ((s + g(this._num(i[o].angle_offset, 0), -180, 180)) % 360 + 360) % 360);
  }
  /** The hairline joining a name to its picture. */
  _renderLink(t, i) {
    return t === "none" ? _ : d`<svg
      class="ing-link"
      viewBox="0 0 40 26"
      aria-hidden="true"
      focusable="false"
    >
      <path d=${t === "straight" ? F : W} />
      <!-- svg tag, not html: a child interpolated into an <svg> from an html
           template lands in the XHTML namespace and never paints. -->
      ${i ? O`<circle cx="33" cy="4" r="2.6" />` : _}
    </svg>`;
  }
  _renderItem(t) {
    const { item: i, i: e } = t, n = this.localizedString(i.name), a = (i.image || "").trim(), r = g(this._num(i.offset_y, 0), -60, 60), s = g(this._num(i.image_scale, 100), 20, 300), o = [
      `--i:${e}`,
      `--ing-offset:${r}%`,
      `--ing-iscale:${s / 100}`,
      t.angle === void 0 ? "" : `--a:${t.angle}deg`,
      t.out === void 0 ? "" : `--ing-out:${t.out}`
    ].filter(Boolean).join("; ");
    return d`<figure
      class="ing-item"
      data-side=${t.side}
      data-label=${t.labelPos}
      data-align=${t.align}
      style=${o}
    >
      ${n ? d`<figcaption class="ing-label" dir=${t.dir}>
              ${n}
            </figcaption>` : _}
      ${n && a ? this._renderLink(t.link, t.dot) : _}
      ${a ? d`<span class="ing-media">
              <img src=${a} alt="" loading="lazy" decoding="async" />
            </span>` : _}
    </figure>`;
  }
  render() {
    const t = this.config || {}, i = this._items(), e = this._productImage(), n = this._hostStyle(t);
    if (!e && i.length === 0)
      return d`<section class="ing" style=${n}>
        <p class="ing-empty">
          ${this._lang() === "ar" ? "أضف صورة المنتج ومكوّنًا واحدًا على الأقل لعرض هذا القسم." : "Add a product image and at least one ingredient to display this section."}
        </p>
      </section>`;
    const a = this.localizedString(t.section_title), r = this.localizedString(t.section_subtitle), s = this._pickValue(t.layout, "circle"), o = this._pickValue(
      t.connector_style,
      "curved"
    ), c = t.connector_dot !== !1, h = t.enable_entrance_anim !== !1 && !this._reduceMotion() ? this._animState : "in", p = this._lang() === "ar" ? "rtl" : "ltr", b = this.localizedString(t.product_image_alt) || a || "", f = i.map(
      (u, y) => this._pickValue(u.side, y % 2 === 0 ? "left" : "right")
    ), v = a || r ? d`<header class="ing-header">
            ${a ? d`<h2 class="ing-h2">${a}</h2>` : _}
            ${r ? d`<p class="ing-sub">${r}</p>` : _}
          </header>` : _, k = s === "circle" ? this._renderOrbit(
      t,
      i,
      f,
      e,
      b,
      h,
      o,
      c,
      p
    ) : this._renderColumns(
      t,
      i,
      f,
      e,
      b,
      h,
      o,
      c,
      p
    );
    return d`
      <section class="ing" style=${n}>${v}${k}</section>
    `;
  }
  /** Two flanking columns — the default layout. */
  _renderColumns(t, i, e, n, a, r, s, o, c) {
    const m = this._pickValue(
      t.label_position,
      "above"
    ), h = this._pickValue(
      t.label_align,
      "toward"
    ), p = (b) => i.map((f, v) => ({ it: f, i: v })).filter(({ i: f }) => e[f] === b).map(
      ({ it: f, i: v }) => this._renderItem({
        item: f,
        i: v,
        side: b,
        labelPos: m,
        align: h,
        link: s,
        dot: o,
        dir: c
      })
    );
    return d`<div
      class="ing-stage"
      data-mode=${n ? "stage" : "grid"}
      data-anim=${r}
    >
      <div class="ing-col" data-side="left">${p("left")}</div>
      ${n ? d`<div class="ing-product">
              <img src=${n} alt=${a} decoding="async" />
            </div>` : _}
      <div class="ing-col" data-side="right">${p("right")}</div>
    </div>`;
  }
  /** A ring orbiting the product, ingredients sitting on the line. */
  _renderOrbit(t, i, e, n, a, r, s, o, c) {
    const m = this._circleAngles(t, i, e), h = this._pickValue(t.ring_style, "solid"), p = this._pickValue(
      t.circle_label_position,
      "auto"
    ), b = this._pickValue(
      t.circle_label_align,
      "outward"
    ), f = t.ring_dot !== !1 && h !== "none", v = g(this._num(t.ring_dot_offset, 20), 0, 60), k = i.map((u, y) => {
      const S = m[y], z = S * Math.PI / 180, E = p === "auto" ? Math.cos(z) >= 0 ? "above" : "below" : p, C = Math.sin(z), I = Math.abs(C) < 0.15 ? 0 : C > 0 ? 1 : -1, M = S + v * (E === "above" ? -1 : 1) * (e[y] === "left" ? -1 : 1);
      return { it: u, i: y, a: S, labelPos: E, out: I, dotAngle: M };
    });
    return d`<div class="ing-orbit" data-anim=${r}>
      ${h === "none" ? _ : d`<div class="ing-ring-line" data-ring=${h}></div>`}
      ${f ? k.map(
      (u) => d`<div class="ing-arm" style=${`--a:${u.dotAngle}deg`}>
                  <span class="ing-dot"></span>
                </div>`
    ) : _}
      ${n ? d`<div class="ing-product">
              <img src=${n} alt=${a} decoding="async" />
            </div>` : _}
      ${k.map(
      (u) => d`<div class="ing-arm" style=${`--a:${u.a}deg`}>
            ${this._renderItem({
        item: u.it,
        i: u.i,
        side: e[u.i],
        labelPos: u.labelPos,
        align: b,
        link: s,
        dot: o,
        dir: c,
        angle: u.a,
        out: u.out
      })}
          </div>`
    )}
    </div>`;
  }
};
T.styles = j;
let w = T;
L([
  R({ type: Object })
], w.prototype, "config");
L([
  B()
], w.prototype, "_animState");
typeof w < "u" && w.registerSallaComponent("salla-ingredients");
export {
  w as default
};
