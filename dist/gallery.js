import { LitElement as H, css as P, html as m, nothing as _ } from "lit";
import { property as K, state as N } from "lit/decorators.js";
function q(e, t) {
  if (typeof e == "string") return e;
  if (!e || typeof e != "object") return "";
  const s = e[t] || e.ar || e.en || "";
  return typeof s == "string" ? s.trim() : "";
}
function L(e) {
  return e.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class X extends H {
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
    const s = String(t || "").trim(), i = s.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), a = i.includes("-") ? i : `salla-${i || "component"}`, o = () => `${a}-${Math.random().toString(36).substring(2, 8)}`, n = () => {
      var h;
      const l = (h = window.Salla) == null ? void 0 : h.bundles;
      return l && typeof l.registerComponent == "function" ? (l.registerComponent(s, {
        component: this,
        dynamicTagName: o()
      }), !0) : !1;
    };
    if (n()) return;
    const r = window.setInterval(() => {
      n() && window.clearInterval(r);
    }, 100);
    window.setTimeout(() => window.clearInterval(r), 5e3);
  }
  /** Resolved document language. */
  _lang() {
    return (document.documentElement.lang || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
  }
  /** Pull the store-language string out of a Salla multilanguage value. */
  localizedString(t) {
    return q(t, this._lang());
  }
  /** Dropdown-list values from settings may come as [{ label, value }]. */
  _pickValue(t, s) {
    if (typeof t == "string" && t) return t;
    if (Array.isArray(t) && t.length > 0) {
      const i = t[0];
      if (i && typeof i.value == "string" && i.value)
        return i.value;
    }
    return s;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(t) {
    return L(t);
  }
  /**
   * The inverse: render a number in the digits the store's language uses, so a
   * counter or a step badge matches the copy beside it. Latin digits outside
   * Arabic, Arabic-Indic inside it.
   */
  _localeNum(t) {
    return this._lang() !== "ar" ? String(t) : String(t).replace(
      /\d/g,
      (s) => String.fromCharCode(1632 + Number(s))
    );
  }
  /**
   * Normalise a merchant-typed anchor into an id. Deliberately permissive
   * about script — Arabic ids are valid HTML and resolve fine through
   * getElementById — so we only strip the leading `#`, collapse whitespace,
   * and drop the characters that would break a URL fragment or a selector.
   */
  _slugify(t, s) {
    var o;
    return (typeof t == "string" ? t : Array.isArray(t) ? String(((o = t[0]) == null ? void 0 : o.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || s;
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
  _syncAnchor(t, s, i = 24) {
    const a = this._slugify(t, s);
    if (!a || a === this._anchorBase) return;
    this._anchorBase = a;
    let o = a;
    for (let r = 2; ; r++) {
      const l = document.getElementById(o);
      if (!l || l === this) break;
      o = `${a}-${r}`;
    }
    if (this.id = o, this.style.scrollMarginTop = `${i}px`, this._anchorDeepLinked) return;
    let n = "";
    try {
      n = decodeURIComponent(location.hash.slice(1));
    } catch {
      n = location.hash.slice(1);
    }
    n && n === o && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(t, s) {
    if (!s.startsWith("#") || s === "#") return;
    let i = s.slice(1);
    try {
      i = decodeURIComponent(i);
    } catch {
    }
    const a = document.getElementById(i);
    if (!a) return;
    t.preventDefault();
    const o = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    a.scrollIntoView({
      block: "start",
      behavior: o ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${i}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, s) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const i = Number(L(t.trim()));
      if (!Number.isNaN(i)) return i;
    }
    if (Array.isArray(t) && t.length > 0) {
      const i = t[0];
      if ((i == null ? void 0 : i.value) !== void 0) return this._num(i.value, s);
    }
    return s;
  }
}
const g = {
  none: 0,
  xs: 12,
  sm: 24,
  md: 40,
  lg: 56,
  xl: 72
}, y = {
  none: 0,
  xs: 20,
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128
};
function W(e, t, s = "md", i = "md") {
  const a = t(e == null ? void 0 : e.space_top, s), o = t(e == null ? void 0 : e.space_bottom, i), n = g[a] ?? g.md, r = g[o] ?? g.md, l = y[a] ?? y.md, h = y[o] ?? y.md;
  return [
    `--sp-top-m:${n}px`,
    `--sp-bot-m:${r}px`,
    `--sp-top-d:${l}px`,
    `--sp-bot-d:${h}px`
  ];
}
const A = {
  wave: "M0,62 C240,14 480,14 720,46 C960,78 1200,80 1440,30 V100 H0 Z",
  double: "M0,50 C120,10 240,10 360,50 C480,90 600,90 720,50 C840,10 960,10 1080,50 C1200,90 1320,90 1440,50 V100 H0 Z",
  arc: "M0,84 C480,4 960,4 1440,84 V100 H0 Z"
}, B = { sm: 22, md: 34, lg: 50 }, M = { sm: 44, md: 68, lg: 100 };
function O(e, t) {
  const i = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="${e}" fill="#000"${t ? ' transform="rotate(180 720 50)"' : ""}/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(i)}")`;
}
function F(e, t) {
  const s = t(e == null ? void 0 : e.wave_edges, "off"), i = s === "top" || s === "both", a = s === "bottom" || s === "both";
  if (!i && !a) return { on: !1, vars: [] };
  const o = t(e == null ? void 0 : e.wave_shape, "wave"), n = A[o] || A.wave, r = t(e == null ? void 0 : e.wave_height_mobile, "md"), l = t(e == null ? void 0 : e.wave_height_desktop, "inherit"), h = l === "inherit" ? r : l, c = B[r] ?? B.md, u = M[h] ?? M.md, b = ((e == null ? void 0 : e.wave_behind_color) || "").trim();
  return {
    on: !0,
    vars: [
      i ? `--wv-top-img:${O(n, !1)}` : "",
      a ? `--wv-bot-img:${O(n, !0)}` : "",
      `--wv-top-m:${i ? c : 0}px`,
      `--wv-top-d:${i ? u : 0}px`,
      `--wv-bot-m:${a ? c : 0}px`,
      `--wv-bot-d:${a ? u : 0}px`,
      b ? `--wv-behind:${b}` : ""
    ].filter(Boolean)
  };
}
const x = {
  top: { top: "0%", pull: "0%" },
  center: { top: "50%", pull: "-50%" },
  bottom: { top: "100%", pull: "-100%" }
};
function U(e, t, s, i = 1) {
  const a = e == null ? void 0 : e.side_visual_count, o = a == null ? void 0 : t(a, "off"), n = ((e == null ? void 0 : e.side_image) || "").trim(), r = o ? o !== "off" : (e == null ? void 0 : e.enable_side_visual) === !0 || (e == null ? void 0 : e.enable_side_visual) == null && !!n;
  if (!(i === 1 ? r : o ? o === "two" : r && (e == null ? void 0 : e.enable_second_side_visual) === !0)) return null;
  const h = (i === 1 ? (e == null ? void 0 : e.side_image) || "" : (e == null ? void 0 : e.side2_image) || "").trim();
  if (!h) return null;
  const c = t(
    i === 1 ? e == null ? void 0 : e.side_side : e == null ? void 0 : e.side2_side,
    i === 1 ? "right" : "left"
  ), u = t(
    i === 1 ? e == null ? void 0 : e.side_depth : e == null ? void 0 : e.side2_depth,
    "front"
  ), d = (i === 1 ? [
    e == null ? void 0 : e.side_width_desktop,
    e == null ? void 0 : e.side_vpos_desktop,
    e == null ? void 0 : e.side_x_desktop,
    e == null ? void 0 : e.side_y_desktop
  ] : [
    e == null ? void 0 : e.side2_width_desktop,
    e == null ? void 0 : e.side2_vpos_desktop,
    e == null ? void 0 : e.side2_x_desktop,
    e == null ? void 0 : e.side2_y_desktop
  ]).some(
    (T) => T != null && T !== ""
  ), p = o ? !0 : (i === 1 ? e == null ? void 0 : e.side_desktop_custom : e == null ? void 0 : e.side2_desktop_custom) === !0 || d, v = t(
    i === 1 ? e == null ? void 0 : e.side_vpos : e == null ? void 0 : e.side2_vpos,
    i === 1 ? "top" : "bottom"
  ), E = t(
    i === 1 ? e == null ? void 0 : e.side_vpos_desktop : e == null ? void 0 : e.side2_vpos_desktop,
    "inherit"
  ), D = !p || E === "inherit" ? v : E, k = s(i === 1 ? e == null ? void 0 : e.side_width : e == null ? void 0 : e.side2_width, 45), V = p ? s(
    i === 1 ? e == null ? void 0 : e.side_width_desktop : e == null ? void 0 : e.side2_width_desktop,
    k
  ) : k, $ = s(i === 1 ? e == null ? void 0 : e.side_x : e == null ? void 0 : e.side2_x, 20), R = p ? s(i === 1 ? e == null ? void 0 : e.side_x_desktop : e == null ? void 0 : e.side2_x_desktop, $) : $, S = s(i === 1 ? e == null ? void 0 : e.side_y : e == null ? void 0 : e.side2_y, 0), j = p ? s(i === 1 ? e == null ? void 0 : e.side_y_desktop : e == null ? void 0 : e.side2_y_desktop, S) : S, z = x[v] ?? x.top, f = x[D] ?? x.top;
  return {
    image: h,
    side: c,
    depth: u,
    slot: i,
    vars: [
      `--se${i}-w-m:${k}%`,
      `--se${i}-w-d:${V}%`,
      `--se${i}-x-m:${$}%`,
      `--se${i}-x-d:${R}%`,
      `--se${i}-y-m:${S}%`,
      `--se${i}-y-d:${j}%`,
      `--se${i}-top-m:${z.top}`,
      `--se${i}-top-d:${f.top}`,
      `--se${i}-pull-m:${z.pull}`,
      `--se${i}-pull-d:${f.pull}`,
      `--se${i}-op:${Math.max(
        0,
        Math.min(
          100,
          s(i === 1 ? e == null ? void 0 : e.side_opacity : e == null ? void 0 : e.side2_opacity, 100)
        )
      ) / 100}`
    ]
  };
}
const Y = P`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    min-width: 0;
    max-width: 100%;

    --gal-bg: #ffffff;
    --gal-title: #14181f;
    --gal-lightbox-bg: rgba(12, 12, 14, 0.94);

    --gal-radius: 14px;
    --gal-pad-x: clamp(1rem, 4vw, 2.5rem);
    --gal-ease: cubic-bezier(0.22, 1, 0.36, 1);

    /* Mobile values; the desktop pair is set alongside and swapped below. */
    --gal-item-m: 62vw;
    --gal-item-d: 22vw;
    --gal-gap-m: 12px;
    --gal-gap-d: 18px;

    /* تموج الحواف — nothing until the component writes a depth on the section.
       Plain values, so the inline declaration there shadows them.
       See src/shared/wave-edges.ts. */
    --wv-top-m: 0px;
    --wv-top-d: 0px;
    --wv-bot-m: 0px;
    --wv-bot-d: 0px;
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
     SECTION
     ============================================================ */
  .gal {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--gal-bg);
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts.
       The wave's depth is added on top of the tier rather than taken out of it:
       the curve eats into the section, so without this the merchant's spacing
       would shrink by however deep they made the wave. Both depths are 0px
       unless an edge is waved, so an ordinary section is untouched. */
    padding-block: calc(var(--sp-top-m) + var(--wv-top))
      calc(var(--sp-bot-m) + var(--wv-bot));
    /* Not overflow:hidden — the strip and the side element both need to bleed.
       overflow-x is clipped on the strip itself instead. */
    overflow: clip visible;

    --gal-item: var(--gal-item-m);
    --gal-gap: var(--gal-gap-m);
    /* Derived from the two tiers, so they are declared HERE — on the element
       the component writes its inline style to — and not on :host, where they
       would resolve against the host's own 0px and ignore it. */
    --wv-top: var(--wv-top-m);
    --wv-bot: var(--wv-bot-m);
  }

  /* تموج الحواف — the wave is a MASK over a background LAYER, never over the
     section itself: this section deliberately bleeds (the strip past both
     inline edges, the side element past the block edges) and masking .gal would
     erase all of it.

     Three mask layers, unioned: the top curve, a solid middle filling the rest,
     the bottom curve. The middle is sized and offset from the same two depths,
     so an edge that is off contributes a zero-height layer and the middle just
     covers what it would have taken.

     "isolation" keeps the z-index:-1 layer inside .gal's own stacking context,
     where it paints above .gal's background — which is now the colour showing
     through the cut — and below the header (z-index 2), the strip and the side
     element (both 1). See src/shared/wave-edges.ts. */
  .gal[data-wave="on"] {
    isolation: isolate;
    background: var(--wv-behind, transparent);
  }
  .gal[data-wave="on"]::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: var(--gal-bg);
    -webkit-mask-image: var(--wv-top-img, none), linear-gradient(#000, #000),
      var(--wv-bot-img, none);
    mask-image: var(--wv-top-img, none), linear-gradient(#000, #000),
      var(--wv-bot-img, none);
    -webkit-mask-size: 100% var(--wv-top),
      100% calc(100% - var(--wv-top) - var(--wv-bot)), 100% var(--wv-bot);
    mask-size: 100% var(--wv-top),
      100% calc(100% - var(--wv-top) - var(--wv-bot)), 100% var(--wv-bot);
    -webkit-mask-position: 0 0, 0 var(--wv-top), 0 100%;
    mask-position: 0 0, 0 var(--wv-top), 0 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }

  .gal-header {
    max-width: 680px;
    margin: 0 auto clamp(1.25rem, 4vw, 2.25rem);
    padding-inline: var(--gal-pad-x);
    text-align: center;
    position: relative;
    z-index: 2;
  }
  .gal-h2 {
    margin: 0;
    color: var(--gal-title);
    font-size: clamp(1.6rem, 5.5vw, 2.1rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  /* ============================================================
     ROW — a scroll-snapping strip that bleeds off both edges
     ============================================================ */
  .gal-strip {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: var(--gal-gap);
    /* Safe centring: the row sits centred when it fits, and bleeds off BOTH
       edges once it doesn't — which is the look this section is for. A plain
       "center" would make the overflowing start unreachable by scrolling; the
       safe keyword falls back to flex-start in exactly that case. */
    justify-content: safe center;
    padding-inline: var(--gal-pad-x);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .gal-strip::-webkit-scrollbar {
    display: none;
  }

  .gal-item {
    flex: 0 0 var(--gal-item);
    scroll-snap-align: center;
    scroll-margin-inline-start: calc(var(--gal-gap) * 2);
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
    border-radius: var(--gal-radius);
    overflow: hidden;
    aspect-ratio: var(--gal-aspect, 3 / 4);
    transition:
      transform 0.4s var(--gal-ease),
      flex-basis 0.4s var(--gal-ease);
  }
  .gal-item[data-static="on"] {
    cursor: default;
  }
  .gal-strip[data-row="grid"] {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
    justify-content: initial;
    overflow: visible;
    overscroll-behavior-x: auto;
    scroll-snap-type: none;
  }
  .gal-strip[data-row="grid"] .gal-item {
    width: 100%;
    min-width: 0;
  }
  .gal-item img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .gal-item:not([data-static="on"]):hover img {
    transform: scale(1.03);
  }
  .gal-item img {
    transition: transform 0.5s var(--gal-ease);
  }
  .gal-item:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }

  /* ============================================================
     SIDE DESIGN ELEMENT (عنصر بصري جانبي)
     ============================================================ */
  .gal-side {
    position: absolute;
    z-index: 1;
    top: var(--se-top, 0%);
    width: var(--se-w, 45%);
    height: auto;
    opacity: var(--se-op, 1);
    pointer-events: none;
    user-select: none;
    max-width: none;
  }
  .gal-side[data-slot="1"] {
    --se-w: var(--se1-w-m);
    --se-x: var(--se1-x-m);
    --se-y: var(--se1-y-m);
    --se-top: var(--se1-top-m);
    --se-pull: var(--se1-pull-m);
    --se-op: var(--se1-op);
  }
  .gal-side[data-slot="2"] {
    --se-w: var(--se2-w-m);
    --se-x: var(--se2-x-m);
    --se-y: var(--se2-y-m);
    --se-top: var(--se2-top-m);
    --se-pull: var(--se2-pull-m);
    --se-op: var(--se2-op);
  }
  /* A positive X pushes the element further OUT of the section on whichever
     edge it is parked, so the merchant's slider means the same thing on both
     sides. */
  .gal-side[data-side="left"] {
    left: 0;
    transform: translate(
      calc(-1 * var(--se-x, 0%)),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }
  .gal-side[data-side="right"] {
    right: 0;
    transform: translate(
      var(--se-x, 0%),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  .lb {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    background: var(--gal-lightbox-bg);
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.28s var(--gal-ease),
      visibility 0s linear 0.28s;
  }
  .lb[data-open="true"] {
    visibility: visible;
    opacity: 1;
    transition:
      opacity 0.28s var(--gal-ease),
      visibility 0s;
  }

  .lb-stage {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(3rem, 8vw, 4.5rem) clamp(0.75rem, 4vw, 3.5rem)
      clamp(1rem, 3vw, 1.5rem);
  }
  .lb-figure {
    margin: 0;
    max-width: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  .lb-figure img {
    max-width: 100%;
    max-height: 68vh;
    object-fit: contain;
    border-radius: 10px;
  }
  .lb-caption {
    color: rgba(255, 255, 255, 0.82);
    font-size: 0.9rem;
    text-align: center;
    margin: 0;
  }

  .lb-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    cursor: pointer;
    transition: background 0.2s var(--gal-ease);
  }
  .lb-btn:hover {
    background: rgba(255, 255, 255, 0.28);
  }
  .lb-btn svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  /* Physical sides: "previous" is always the arrow pointing to the start of the
     reading direction, so the glyph flips rather than the button. */
  .lb-prev {
    inset-inline-start: clamp(0.5rem, 2vw, 1.5rem);
  }
  .lb-next {
    inset-inline-end: clamp(0.5rem, 2vw, 1.5rem);
  }
  .lb-prev svg,
  .lb-next svg {
    transform: rotate(180deg);
  }
  .lb-next svg {
    transform: none;
  }
  :host(:dir(rtl)) .lb-prev svg {
    transform: none;
  }
  :host(:dir(rtl)) .lb-next svg {
    transform: rotate(180deg);
  }

  .lb-close {
    position: absolute;
    top: clamp(0.75rem, 2vw, 1.25rem);
    inset-inline-end: clamp(0.75rem, 2vw, 1.25rem);
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 1.35rem;
    line-height: 1;
    cursor: pointer;
    z-index: 2;
  }
  .lb-close:hover {
    background: rgba(255, 255, 255, 0.28);
  }

  .lb-counter {
    position: absolute;
    top: clamp(0.9rem, 2vw, 1.4rem);
    inset-inline-start: clamp(0.9rem, 2vw, 1.5rem);
    color: rgba(255, 255, 255, 0.78);
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }

  /* Thumbnail rail — the "scroll between the images from the inside" affordance. */
  .lb-thumbs {
    flex: 0 0 auto;
    display: flex;
    gap: 8px;
    justify-content: flex-start;
    padding: 0 clamp(0.75rem, 4vw, 2rem) clamp(1rem, 3vw, 1.75rem);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .lb-thumbs::-webkit-scrollbar {
    display: none;
  }
  .lb-thumb {
    flex: 0 0 auto;
    width: 56px;
    height: 56px;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    background: none;
    cursor: pointer;
    opacity: 0.5;
    transition:
      opacity 0.2s var(--gal-ease),
      border-color 0.2s var(--gal-ease);
  }
  .lb-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .lb-thumb[aria-current="true"] {
    opacity: 1;
    border-color: #fff;
  }
  .lb-thumb:hover {
    opacity: 0.85;
  }

  .gal-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.92rem;
  }

  /* ============================================================
     MOTION
     ============================================================ */
  .gal-item,
  .gal-header {
    transition:
      opacity 0.55s var(--gal-ease),
      transform 0.55s var(--gal-ease);
  }
  .gal-strip[data-anim="ready"] .gal-item {
    opacity: 0;
    transform: translateY(10px);
  }
  .gal-strip[data-anim="ready"] .gal-item:nth-child(1) {
    transition-delay: 0.05s;
  }
  .gal-strip[data-anim="ready"] .gal-item:nth-child(2) {
    transition-delay: 0.12s;
  }
  .gal-strip[data-anim="ready"] .gal-item:nth-child(3) {
    transition-delay: 0.19s;
  }
  .gal-strip[data-anim="in"] .gal-item {
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .gal-item,
    .gal-item img,
    .gal-header,
    .lb,
    .lb-btn,
    .lb-thumb {
      transition: none !important;
    }
    .gal-strip[data-anim="ready"] .gal-item {
      opacity: 1;
      transform: none;
    }
    .gal-strip {
      scroll-behavior: auto;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    .gal {
      padding-block: calc(var(--sp-top-d) + var(--wv-top))
        calc(var(--sp-bot-d) + var(--wv-bot));
      --wv-top: var(--wv-top-d);
      --wv-bot: var(--wv-bot-d);
    }
    .gal {
      --gal-item: var(--gal-item-d);
      --gal-gap: var(--gal-gap-d);
    }
    .gal-strip[data-row="grid"] {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .gal-side[data-slot="1"] {
      --se-w: var(--se1-w-d);
      --se-x: var(--se1-x-d);
      --se-y: var(--se1-y-d);
      --se-top: var(--se1-top-d);
      --se-pull: var(--se1-pull-d);
    }
    .gal-side[data-slot="2"] {
      --se-w: var(--se2-w-d);
      --se-x: var(--se2-x-d);
      --se-y: var(--se2-y-d);
      --se-top: var(--se2-top-d);
      --se-pull: var(--se2-pull-d);
    }
    .lb-thumbs {
      justify-content: center;
    }
    .lb-thumb {
      width: 68px;
      height: 68px;
    }
  }
`;
var Z = Object.defineProperty, C = (e, t, s, i) => {
  for (var a = void 0, o = e.length - 1, n; o >= 0; o--)
    (n = e[o]) && (a = n(t, s, a) || a);
  return a && Z(t, s, a), a;
};
const G = {
  small: "43.2vw",
  medium: "62vw",
  large: "76vw"
}, J = {
  small: "17vw",
  medium: "22vw",
  large: "28vw"
}, I = class I extends X {
  constructor() {
    super(...arguments), this._animState = "ready", this._lightboxIndex = -1, this._io = null, this._fallbackTimer = null, this._prevBodyOverflow = null, this._touchStartX = null, this._stripLayoutSignature = "", this._reveal = () => {
      var t;
      this._animState = "in", this._scheduleStripCenter(), (t = this._io) == null || t.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null);
    }, this._closeLightbox = () => {
      this._lightboxIndex = -1;
    }, this._onBackdropClick = (t) => {
      t.target === t.currentTarget && this._closeLightbox();
    }, this._onTouchStart = (t) => {
      var s;
      this._touchStartX = ((s = t.changedTouches[0]) == null ? void 0 : s.clientX) ?? null;
    }, this._onTouchEnd = (t) => {
      var a;
      if (this._touchStartX === null) return;
      const s = (((a = t.changedTouches[0]) == null ? void 0 : a.clientX) ?? 0) - this._touchStartX;
      if (this._touchStartX = null, Math.abs(s) < 40) return;
      const i = this._lang() === "ar" ? s > 0 : s < 0;
      this._step(i ? 1 : -1);
    };
  }
  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------
  /** Only photos that actually carry an image can render. */
  _images() {
    var s;
    const t = (s = this.config) == null ? void 0 : s.images;
    return Array.isArray(t) ? t.filter(
      (i) => !!i && typeof i == "object" && !!(i.image || "").trim()
    ) : [];
  }
  _reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  _lightboxEnabled() {
    var t;
    return ((t = this.config) == null ? void 0 : t.enable_lightbox) !== !1;
  }
  connectedCallback() {
    if (super.connectedCallback(), this._onKeydown = (t) => {
      this._lightboxIndex < 0 || (t.key === "Escape" ? this._closeLightbox() : t.key === "ArrowRight" ? this._step(1) : t.key === "ArrowLeft" && this._step(-1));
    }, window.addEventListener("keydown", this._onKeydown), !("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }
    this._io = new IntersectionObserver(
      (t) => {
        var s;
        (s = t[0]) != null && s.isIntersecting && this._reveal();
      },
      { threshold: 0.12 }
    ), this._io.observe(this), this._fallbackTimer = window.setTimeout(() => {
      if (this._fallbackTimer = null, this._animState === "in") return;
      const t = this.getBoundingClientRect();
      (t.height === 0 || t.top < window.innerHeight && t.bottom > 0) && this._reveal();
    }, 3e3);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._io) == null || t.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null), this._onKeydown && window.removeEventListener("keydown", this._onKeydown), this._lightboxIndex = -1, this._syncScrollLock();
  }
  updated() {
    var o;
    this._syncAnchor((o = this.config) == null ? void 0 : o.anchor_id, "gallery"), this._syncScrollLock();
    const t = this.config || {}, s = this._images(), a = [
      this._pickValue(
        t.row_style,
        "equal"
      ),
      this._pickValue(t.item_size, "small"),
      this._pickValue(t.aspect_ratio, "4/5"),
      this._num(t.gap, 18),
      ...s.map((n) => n.image || "")
    ].join("|");
    a !== this._stripLayoutSignature && (this._stripLayoutSignature = a, this._scheduleStripCenter());
  }
  _scheduleStripCenter() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this._centerInitialImage());
    });
  }
  /** Start with the second photo centred so both neighbouring photos peek in. */
  _centerInitialImage() {
    const t = this.renderRoot.querySelector(".gal-strip"), s = t == null ? void 0 : t.querySelectorAll(".gal-item");
    if (!t || t.dataset.row !== "equal" || !s || s.length < 3)
      return;
    const i = s[1], a = t.getBoundingClientRect(), o = i.getBoundingClientRect(), n = o.left + o.width / 2 - (a.left + a.width / 2);
    t.scrollLeft += n;
  }
  /**
   * Hold the page still while the lightbox is open, and restore exactly what
   * was there before — themes sometimes set their own body overflow.
   */
  _syncScrollLock() {
    const t = this._lightboxIndex >= 0, s = this._prevBodyOverflow !== null;
    t !== s && (t ? (this._prevBodyOverflow = document.body.style.overflow, document.body.style.overflow = "hidden") : (document.body.style.overflow = this._prevBodyOverflow ?? "", this._prevBodyOverflow = null));
  }
  // ------------------------------------------------------------
  // Lightbox controls
  // ------------------------------------------------------------
  _openLightbox(t) {
    this._lightboxEnabled() && (this._lightboxIndex = t);
  }
  /** Wrap around in both directions — a gallery has no natural end. */
  _step(t) {
    const s = this._images().length;
    s !== 0 && (this._lightboxIndex = (this._lightboxIndex + t + s) % s);
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  _hostStyle(t, s, i) {
    const a = this._pickValue(t.item_size, "small"), o = this._pickValue(
      t.item_size_desktop,
      "inherit"
    ), n = o === "inherit" ? a : o, r = this._num(t.gap, 18);
    return [
      t.bg_color ? `--gal-bg:${t.bg_color}` : "",
      t.title_color ? `--gal-title:${t.title_color}` : "",
      t.lightbox_bg ? `--gal-lightbox-bg:${t.lightbox_bg}` : "",
      `--gal-item-m:${G[a] ?? "62vw"}`,
      `--gal-item-d:${J[n] ?? "22vw"}`,
      `--gal-gap-m:${r}px`,
      `--gal-gap-d:${Math.round(r * 1.5)}px`,
      `--gal-radius:${this._num(t.card_radius, 20)}px`,
      `--gal-aspect:${this._pickValue(t.aspect_ratio, "4/5")}`,
      ...s,
      ...i.vars,
      ...W(
        t,
        (l, h) => this._pickValue(l, h)
      )
    ].filter(Boolean).join("; ");
  }
  _chevron() {
    return m`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>`;
  }
  _renderLightbox(t, s) {
    const i = this._lightboxIndex, a = i >= 0, o = a ? t[i] : void 0, n = this._lang() === "ar", r = o ? this.localizedString(o.alt) : "", l = s.lightbox_thumbs !== !1 && t.length > 1, h = s.lightbox_counter !== !1 && t.length > 1;
    return m`<div
      class="lb"
      data-open=${a ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-hidden=${a ? "false" : "true"}
      aria-label=${n ? "معرض الصور" : "Image gallery"}
      @click=${this._onBackdropClick}
      @touchstart=${this._onTouchStart}
      @touchend=${this._onTouchEnd}
    >
      <button
        class="lb-close"
        type="button"
        aria-label=${n ? "إغلاق" : "Close"}
        @click=${this._closeLightbox}
      >
        ×
      </button>
      ${h ? m`<span class="lb-counter"
              >${this._localeNum(i + 1)} /
              ${this._localeNum(t.length)}</span
            >` : _}

      <div class="lb-stage" @click=${this._onBackdropClick}>
        ${t.length > 1 ? m`
                <button
                  class="lb-btn lb-prev"
                  type="button"
                  aria-label=${n ? "السابق" : "Previous"}
                  @click=${() => this._step(-1)}
                >
                  ${this._chevron()}
                </button>
                <button
                  class="lb-btn lb-next"
                  type="button"
                  aria-label=${n ? "التالي" : "Next"}
                  @click=${() => this._step(1)}
                >
                  ${this._chevron()}
                </button>
              ` : _}
        ${o ? m`<figure class="lb-figure">
                <img
                  src=${o.image || ""}
                  alt=${r}
                  decoding="async"
                />
                ${r ? m`<figcaption class="lb-caption">
                        ${r}
                      </figcaption>` : _}
              </figure>` : _}
      </div>

      ${l ? m`<div class="lb-thumbs">
              ${t.map(
      (c, u) => m`
                  <button
                    class="lb-thumb"
                    type="button"
                    aria-current=${u === i ? "true" : "false"}
                    aria-label=${`${n ? "صورة" : "Image"} ${this._localeNum(u + 1)}`}
                    @click=${() => this._lightboxIndex = u}
                  >
                    <img src=${c.image || ""} alt="" loading="lazy" />
                  </button>
                `
    )}
            </div>` : _}
    </div>`;
  }
  render() {
    const t = this.config || {}, s = this._images(), i = {
      ...t,
      side_visual_count: t.side_visual_count ?? "two",
      side_side: t.side_side ?? "left",
      side_vpos: t.side_vpos ?? "top",
      side_vpos_desktop: t.side_vpos_desktop ?? "inherit",
      side2_side: t.side2_side ?? "right",
      side2_vpos: t.side2_vpos ?? "bottom",
      side2_vpos_desktop: t.side2_vpos_desktop ?? "inherit"
    }, a = (d) => U(
      i,
      (p, v) => this._pickValue(p, v),
      (p, v) => this._num(p, v),
      d
    ), o = [a(1), a(2)].filter(
      (d) => !!d
    ), n = F(t, (d, p) => this._pickValue(d, p)), r = this._hostStyle(
      t,
      o.flatMap((d) => d.vars),
      n
    );
    if (s.length === 0)
      return m`<section class="gal" style=${r}>
        <p class="gal-empty">
          ${this._lang() === "ar" ? "أضف صورة واحدة على الأقل لعرض هذا القسم." : "Add at least one image to display this section."}
        </p>
      </section>`;
    const l = this.localizedString(t.section_title), c = this._pickValue(
      t.row_style,
      "equal"
    ) === "grid" ? "grid" : "equal", u = t.enable_entrance_anim !== !1 && !this._reduceMotion(), b = this._lightboxEnabled();
    return m`
      <section
        class="gal"
        style=${r}
        data-wave=${n.on ? "on" : "off"}
      >
        ${o.map(
      (d) => m`<img
              class="gal-side"
              src=${d.image}
              alt=""
              aria-hidden="true"
              data-slot=${d.slot}
              data-side=${d.side}
              data-depth=${d.depth}
              decoding="async"
              loading="eager"
            />`
    )}
        ${l ? m`<header class="gal-header">
                <h2 class="gal-h2">${l}</h2>
              </header>` : _}

        <div
          class="gal-strip"
          data-row=${c}
          data-anim=${u ? this._animState : "in"}
        >
          ${s.map((d, p) => {
      const v = this.localizedString(d.alt);
      return m`<button
              class="gal-item"
              type="button"
              data-static=${b ? "off" : "on"}
              ?disabled=${!b}
              aria-label=${b ? `${this._lang() === "ar" ? "تكبير الصورة" : "Enlarge image"} ${this._localeNum(p + 1)}` : _}
              @click=${() => this._openLightbox(p)}
            >
              <img
                src=${d.image || ""}
                alt=${v}
                loading="lazy"
                decoding="async"
              />
            </button>`;
    })}
        </div>
      </section>
      ${b ? this._renderLightbox(s, t) : _}
    `;
  }
};
I.styles = Y;
let w = I;
C([
  K({ type: Object })
], w.prototype, "config");
C([
  N()
], w.prototype, "_animState");
C([
  N()
], w.prototype, "_lightboxIndex");
typeof w < "u" && w.registerSallaComponent("salla-gallery");
export {
  w as default
};
