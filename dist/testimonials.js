import { LitElement as O, css as H, html as l, nothing as c } from "lit";
import { property as j, state as P } from "lit/decorators.js";
function F(e, t) {
  if (typeof e == "string") return e;
  if (!e || typeof e != "object") return "";
  const i = e[t] || e.ar || e.en || "";
  return typeof i == "string" ? i.trim() : "";
}
function V(e) {
  return e.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class Y extends O {
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
    const i = String(t || "").trim(), a = i.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), s = a.includes("-") ? a : `salla-${a || "component"}`, r = () => `${s}-${Math.random().toString(36).substring(2, 8)}`, o = () => {
      var d;
      const h = (d = window.Salla) == null ? void 0 : d.bundles;
      return h && typeof h.registerComponent == "function" ? (h.registerComponent(i, {
        component: this,
        dynamicTagName: r()
      }), !0) : !1;
    };
    if (o()) return;
    const n = window.setInterval(() => {
      o() && window.clearInterval(n);
    }, 100);
    window.setTimeout(() => window.clearInterval(n), 5e3);
  }
  /** Resolved document language. */
  _lang() {
    return (document.documentElement.lang || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
  }
  /** Pull the store-language string out of a Salla multilanguage value. */
  localizedString(t) {
    return F(t, this._lang());
  }
  /** Dropdown-list values from settings may come as [{ label, value }]. */
  _pickValue(t, i) {
    if (typeof t == "string" && t) return t;
    if (Array.isArray(t) && t.length > 0) {
      const a = t[0];
      if (a && typeof a.value == "string" && a.value)
        return a.value;
    }
    return i;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(t) {
    return V(t);
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
    var r;
    return (typeof t == "string" ? t : Array.isArray(t) ? String(((r = t[0]) == null ? void 0 : r.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || i;
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
  _syncAnchor(t, i, a = 24) {
    const s = this._slugify(t, i);
    if (!s || s === this._anchorBase) return;
    this._anchorBase = s;
    let r = s;
    for (let n = 2; ; n++) {
      const h = document.getElementById(r);
      if (!h || h === this) break;
      r = `${s}-${n}`;
    }
    if (this.id = r, this.style.scrollMarginTop = `${a}px`, this._anchorDeepLinked) return;
    let o = "";
    try {
      o = decodeURIComponent(location.hash.slice(1));
    } catch {
      o = location.hash.slice(1);
    }
    o && o === r && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(t, i) {
    if (!i.startsWith("#") || i === "#") return;
    let a = i.slice(1);
    try {
      a = decodeURIComponent(a);
    } catch {
    }
    const s = document.getElementById(a);
    if (!s) return;
    t.preventDefault();
    const r = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    s.scrollIntoView({
      block: "start",
      behavior: r ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${a}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, i) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const a = Number(V(t.trim()));
      if (!Number.isNaN(a)) return a;
    }
    if (Array.isArray(t) && t.length > 0) {
      const a = t[0];
      if ((a == null ? void 0 : a.value) !== void 0) return this._num(a.value, i);
    }
    return i;
  }
}
const A = {
  none: 0,
  xs: 12,
  sm: 24,
  md: 40,
  lg: 56,
  xl: 72
}, M = {
  none: 0,
  xs: 20,
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128
};
function U(e, t, i = "md", a = "md") {
  const s = t(e == null ? void 0 : e.space_top, i), r = t(e == null ? void 0 : e.space_bottom, a), o = A[s] ?? A.md, n = A[r] ?? A.md, h = M[s] ?? M.md, d = M[r] ?? M.md;
  return [
    `--sp-top-m:${o}px`,
    `--sp-bot-m:${n}px`,
    `--sp-top-d:${h}px`,
    `--sp-bot-d:${d}px`
  ];
}
const I = {
  wave: "M0,62 C240,14 480,14 720,46 C960,78 1200,80 1440,30 V100 H0 Z",
  double: "M0,50 C120,10 240,10 360,50 C480,90 600,90 720,50 C840,10 960,10 1080,50 C1200,90 1320,90 1440,50 V100 H0 Z",
  arc: "M0,84 C480,4 960,4 1440,84 V100 H0 Z"
}, B = { sm: 22, md: 34, lg: 50 }, N = { sm: 44, md: 68, lg: 100 };
function L(e, t) {
  const a = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="${e}" fill="#000"${t ? ' transform="rotate(180 720 50)"' : ""}/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(a)}")`;
}
function W(e, t) {
  const i = t(e == null ? void 0 : e.wave_edges, "off"), a = i === "top" || i === "both", s = i === "bottom" || i === "both";
  if (!a && !s) return { on: !1, vars: [] };
  const r = t(e == null ? void 0 : e.wave_shape, "wave"), o = I[r] || I.wave, n = t(e == null ? void 0 : e.wave_height_mobile, "md"), h = t(e == null ? void 0 : e.wave_height_desktop, "inherit"), d = h === "inherit" ? n : h, p = B[n] ?? B.md, m = N[d] ?? N.md, v = ((e == null ? void 0 : e.wave_behind_color) || "").trim();
  return {
    on: !0,
    vars: [
      a ? `--wv-top-img:${L(o, !1)}` : "",
      s ? `--wv-bot-img:${L(o, !0)}` : "",
      `--wv-top-m:${a ? p : 0}px`,
      `--wv-top-d:${a ? m : 0}px`,
      `--wv-bot-m:${s ? p : 0}px`,
      `--wv-bot-d:${s ? m : 0}px`,
      v ? `--wv-behind:${v}` : ""
    ].filter(Boolean)
  };
}
const z = {
  top: { top: "0%", pull: "0%" },
  center: { top: "50%", pull: "-50%" },
  bottom: { top: "100%", pull: "-100%" }
};
function K(e, t, i, a = 1) {
  const s = e == null ? void 0 : e.side_visual_count, r = s == null ? void 0 : t(s, "off"), o = ((e == null ? void 0 : e.side_image) || "").trim(), n = r ? r !== "off" : (e == null ? void 0 : e.enable_side_visual) === !0 || (e == null ? void 0 : e.enable_side_visual) == null && !!o;
  if (!(a === 1 ? n : r ? r === "two" : n && (e == null ? void 0 : e.enable_second_side_visual) === !0)) return null;
  const d = (a === 1 ? (e == null ? void 0 : e.side_image) || "" : (e == null ? void 0 : e.side2_image) || "").trim();
  if (!d) return null;
  const p = t(
    a === 1 ? e == null ? void 0 : e.side_side : e == null ? void 0 : e.side2_side,
    a === 1 ? "right" : "left"
  ), m = t(
    a === 1 ? e == null ? void 0 : e.side_depth : e == null ? void 0 : e.side2_depth,
    "front"
  ), y = (a === 1 ? [
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
    (E) => E != null && E !== ""
  ), _ = r ? !0 : (a === 1 ? e == null ? void 0 : e.side_desktop_custom : e == null ? void 0 : e.side2_desktop_custom) === !0 || y, x = t(
    a === 1 ? e == null ? void 0 : e.side_vpos : e == null ? void 0 : e.side2_vpos,
    a === 1 ? "top" : "bottom"
  ), k = t(
    a === 1 ? e == null ? void 0 : e.side_vpos_desktop : e == null ? void 0 : e.side2_vpos_desktop,
    "inherit"
  ), T = !_ || k === "inherit" ? x : k, w = i(a === 1 ? e == null ? void 0 : e.side_width : e == null ? void 0 : e.side2_width, 45), S = _ ? i(
    a === 1 ? e == null ? void 0 : e.side_width_desktop : e == null ? void 0 : e.side2_width_desktop,
    w
  ) : w, $ = i(a === 1 ? e == null ? void 0 : e.side_x : e == null ? void 0 : e.side2_x, 20), D = _ ? i(a === 1 ? e == null ? void 0 : e.side_x_desktop : e == null ? void 0 : e.side2_x_desktop, $) : $, C = i(a === 1 ? e == null ? void 0 : e.side_y : e == null ? void 0 : e.side2_y, 0), u = _ ? i(a === 1 ? e == null ? void 0 : e.side_y_desktop : e == null ? void 0 : e.side2_y_desktop, C) : C, g = z[x] ?? z.top, f = z[T] ?? z.top;
  return {
    image: d,
    side: p,
    depth: m,
    slot: a,
    vars: [
      `--se${a}-w-m:${w}%`,
      `--se${a}-w-d:${S}%`,
      `--se${a}-x-m:${$}%`,
      `--se${a}-x-d:${D}%`,
      `--se${a}-y-m:${C}%`,
      `--se${a}-y-d:${u}%`,
      `--se${a}-top-m:${g.top}`,
      `--se${a}-top-d:${f.top}`,
      `--se${a}-pull-m:${g.pull}`,
      `--se${a}-pull-d:${f.pull}`,
      `--se${a}-op:${Math.max(
        0,
        Math.min(
          100,
          i(a === 1 ? e == null ? void 0 : e.side_opacity : e == null ? void 0 : e.side2_opacity, 100)
        )
      ) / 100}`
    ]
  };
}
const X = H`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    /* Size containment: the host's width is taken from its container, never from
       its contents. This is what stops the carousel's wide track (or any other
       wide layout) from forcing an ancestor grid/flex item — e.g. Salla's
       component card — wider than the viewport and pushing other sections away.
       Width-only containment; height still grows with content. */
    container-type: inline-size;
    min-width: 0;
    max-width: 100%;

    --t-bg: #f6f4f0;
    --t-title: #14181f;
    --t-subtitle: #5b6573;
    --t-card-bg: #ffffff;
    --t-border: rgba(20, 24, 31, 0.09);
    --t-name: #14181f;
    --t-meta: #8a93a0;
    --t-text: #3f4754;
    --t-star: #ff9f1c;
    --t-star-empty: rgba(20, 24, 31, 0.14);
    --t-accent: #000000;

    --t-gap: clamp(12px, 2.6vw, 20px);
    --t-pad-x: clamp(1rem, 4vw, 2rem);
    --t-radius: 20px;
    --t-aspect: 4 / 5;
    --t-cols-mobile: 1;
    --t-cols-desktop: 3;
    /* تموج الحواف — nothing until the component writes a depth on the section.
       Plain values, so the inline declaration there shadows them.
       See src/shared/wave-edges.ts. */
    --wv-top-m: 0px;
    --wv-top-d: 0px;
    --wv-bot-m: 0px;
    --wv-bot-d: 0px;
    --t-ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* ============================================================
     SECTION + HEADER
     ============================================================ */
  /* The optional background photo and its scrim are two background LAYERS on
     the section itself, not a pseudo-element: nothing new joins the stacking
     order, so the cards and the carousel arrows keep the z-indexes
     they already had. Both default to "none", which leaves just the colour. */
  .t-section {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background-color: var(--t-bg);
    background-image: var(--t-bg-scrim, none), var(--t-bg-img, none);
    background-size: cover;
    background-position: var(--t-bg-pos, center);
    background-repeat: no-repeat;
    /* Derived from the two tiers above, so they are declared HERE — on the
       element the component writes its inline style to — and not on :host,
       where they would resolve against the host's own 0px and ignore it. */
    --wv-top: var(--wv-top-m);
    --wv-bot: var(--wv-bot-m);
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts.
       The wave's depth is added on top of the tier rather than taken out of it:
       the curve eats into the section, so without this the merchant's spacing
       would shrink by however deep they made the wave. Both depths are 0px
       unless an edge is waved, so an ordinary section is untouched. */
    padding-inline: var(--t-pad-x);
    padding-block: calc(var(--sp-top-m) + var(--wv-top))
      calc(var(--sp-bot-m) + var(--wv-bot));
    overflow: hidden;
  }

  .t-section[data-sides="on"] {
    overflow: visible;
    isolation: isolate;
  }
  .t-header,
  .t-body-wrap {
    position: relative;
    z-index: 2;
  }

  /* ============================================================
     SIDE DESIGN ELEMENTS
     ============================================================ */
  .t-side {
    position: absolute;
    z-index: 1;
    top: var(--se-top, 0%);
    width: var(--se-w, 45%);
    max-width: none;
    height: auto;
    opacity: var(--se-op, 1);
    pointer-events: none;
    user-select: none;
  }
  .t-side[data-depth="behind"] {
    z-index: 0;
  }
  .t-side[data-depth="front"] {
    z-index: 3;
  }
  .t-side[data-slot="1"] {
    --se-w: var(--se1-w-m);
    --se-x: var(--se1-x-m);
    --se-y: var(--se1-y-m);
    --se-top: var(--se1-top-m);
    --se-pull: var(--se1-pull-m);
    --se-op: var(--se1-op);
  }
  .t-side[data-slot="2"] {
    --se-w: var(--se2-w-m);
    --se-x: var(--se2-x-m);
    --se-y: var(--se2-y-m);
    --se-top: var(--se2-top-m);
    --se-pull: var(--se2-pull-m);
    --se-op: var(--se2-op);
  }
  .t-side[data-side="left"] {
    left: 0;
    transform: translate(
      calc(-1 * var(--se-x, 0%)),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }
  .t-side[data-side="right"] {
    right: 0;
    transform: translate(
      var(--se-x, 0%),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }

  /* تموج الحواف — the wave is a MASK over a background LAYER, never over the
     section itself: masking the section would erase anything that deliberately
     bleeds outside its box. The layer carries the whole background stack the
     section normally paints (colour, photo, scrim), so the photo is cut by the
     same curve for free.

     Three mask layers, unioned: the top curve, a solid middle filling the rest,
     the bottom curve. The middle is sized and offset from the same two depths,
     so an edge that is off contributes a zero-height layer and the middle just
     covers what it would have taken.

     "isolation" keeps the z-index:-1 layer inside the section's own stacking
     context, where it paints above the section's background — which is now the
     colour showing through the cut — and below every child. */
  .t-section[data-wave="on"] {
    position: relative;
    isolation: isolate;
    background-color: var(--wv-behind, transparent);
    background-image: none;
  }
  .t-section[data-wave="on"]::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background-color: var(--t-bg);
    background-image: var(--t-bg-scrim, none), var(--t-bg-img, none);
    background-size: cover;
    background-position: var(--t-bg-pos, center);
    background-repeat: no-repeat;
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

  .t-header {
    max-width: 720px;
    margin: 0 auto clamp(1.75rem, 4vw, 2.75rem);
    text-align: center;
  }
  .t-eyebrow {
    margin: 0 0 0.5rem;
    color: var(--t-accent);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 1.6px;
    text-transform: uppercase;
  }
  .t-title {
    margin: 0;
    color: var(--t-title);
    font-size: clamp(1.7rem, 5vw, 2.3rem);
    font-weight: 800;
    line-height: 1.18;
    letter-spacing: -0.01em;
  }
  .t-subtitle {
    margin: 0.7rem 0 0;
    color: var(--t-subtitle);
    font-size: clamp(0.95rem, 1.6vw, 1.08rem);
    line-height: 1.7;
  }
  .t-summary {
    margin-top: 1.1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .t-summary-num {
    color: var(--t-title);
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
  }
  .t-summary .t-stars svg {
    width: 20px;
    height: 20px;
  }
  .t-summary-count {
    color: var(--t-meta);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .t-body-wrap {
    max-width: 1240px;
    margin-inline: auto;
    width: 100%;
  }

  .t-empty {
    text-align: center;
    color: var(--t-meta);
    padding: 3rem 1rem;
    margin: 0;
  }

  /* ============================================================
     STARS (two-layer clip → supports fractional ratings)
     ============================================================ */
  .t-stars {
    position: relative;
    display: inline-flex;
    direction: ltr; /* ratings always fill left→right */
    line-height: 0;
    order:-1;
  }
  .t-stars-bg,
  .t-stars-fg {
    display: inline-flex;
    gap: 2px;
  }
  .t-stars svg {
    width: 16px;
    height: 16px;
    display: block;
  }
  .t-stars-bg svg {
    fill: var(--t-star-empty);
  }
  .t-stars-fg-clip {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    width: var(--t-star-pct, 100%);
    overflow: hidden;
    transition: width 0.9s var(--t-ease) 0.2s;
  }
  .t-stars-fg {
    width: max-content;
  }
  .t-stars-fg svg {
    fill: var(--t-star);
  }

  /* Compact numeric rating pill. */
  .t-rating {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }
  .t-rating-text {
    color: var(--t-meta);
    font-size: 0.82rem;
    font-weight: 700;
  }
  .t-rating--num {
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    background: rgba(255, 159, 28, 0.16);
    background: color-mix(in srgb, var(--t-star) 16%, transparent);
    border-radius: 999px;
    align-self: flex-start;
    font-weight: 800;
    color: var(--t-title);
    font-size: 0.92rem;
  }
  .t-rating--num .t-rating-star {
    width: 15px;
    height: 15px;
    fill: var(--t-star);
  }

  /* ============================================================
     CARD — base + shared pieces
     ============================================================ */
  .t-card {
    position: relative;
    height: 100%;
    background: var(--t-card-bg);
    border: 1px solid transparent;
    border-radius: var(--t-radius);
    box-shadow: 0 20px 44px -30px rgba(15, 23, 42, 0.45);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-align: start;
  }
  .t-card[data-style="quote"] {
    padding: clamp(18px, 4vw, 26px);
    gap: 12px;
    /* Centred anatomy: the author leads (avatar above the name), the quote
       follows. align-items centres the flex children; text-align centres the
       text inside each of them. */
    align-items: center;
    text-align: center;
  }
  .t-card[data-style="quote"] .t-rating {
    justify-content: center;
  }

  /* Quote text */
  .t-quote {
    margin: 0;
    color: var(--t-text);
    font-size: 0.98rem;
    line-height: 1.72;
  }
  .t-card[data-style="quote"] .t-quote {
    font-size: 1.06rem;
    line-height: 1.65;
  }

  /* Decorative quotation mark */
  .t-quote-mark {
    line-height: 0;
    color: var(--t-accent);
    opacity: 0.9;
  }
  /* In the quote card the mark is decoration, not a row of content: take it out
     of the flow so it adds nothing to the card's height (in flow it pushed the
     avatar and everything under it down), and park it in the leading top corner.
     inset-inline-start puts that on the right in RTL and the left in LTR. */
  .t-card[data-style="quote"] .t-quote-mark {
    position: absolute;
    top: clamp(10px, 2.5vw, 16px);
    inset-inline-start: clamp(12px, 3vw, 18px);
    pointer-events: none;
  }
  .t-quote-mark svg {
    width: 34px;
    height: 34px;
  }

  /* Author block */
  .t-author {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .t-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    flex: none;
    background: var(--t-star-empty);
  }
  .t-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .t-author-meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  /* Stacked: avatar sits above the name, whole block centred */
  .t-author--stacked {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .t-author--stacked .t-avatar {
    width: 56px;
    height: 56px;
  }
  .t-author--stacked .t-author-meta {
    align-items: center;
  }
  .t-name {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--t-name);
    font-weight: 700;
    font-size: 0.95rem;
    line-height: 1.2;
  }
  .t-meta {
    color: var(--t-meta);
    font-size: 0.82rem;
  }

  /* The quote's text is what stretches in an equal-height card, not the author */
  .t-card[data-style="quote"] .t-quote {
    margin-bottom: auto;
  }

  /* ============================================================
     CARD — modern (photo-led with overlaid name chip)
     ============================================================ */
  .t-card[data-style="modern"] {
    padding: 0;
    gap: 0;
  }
  .t-photo {
    position: relative;
    width: 100%;
    aspect-ratio: var(--t-aspect);
    overflow: hidden;
  }
  .t-photo > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .t-photo-chip {
    position: absolute;
    top: 12px;
    inset-inline-start: 12px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(18, 22, 28, 0.62);
    -webkit-backdrop-filter: blur(7px);
    backdrop-filter: blur(7px);
    color: #fff;
    font-weight: 600;
    font-size: 0.82rem;
    padding: 5px;
    padding-inline-end: 12px;
    border-radius: 999px;
  }
  .t-photo-chip-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.15);
  }
  .t-photo-chip-text {
    white-space: nowrap;
  }
  .t-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 11px;
    padding: 15px 16px 17px;
  }

  /* ============================================================
     LAYOUT — carousel (scroll-snap)
     ============================================================ */
  .t-carousel {
    position: relative;
  }
  .t-carousel-track {
    display: flex;
    gap: var(--t-gap);
    align-items: stretch;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-block: 6px;
  }
  .t-carousel-track::-webkit-scrollbar {
    display: none;
  }
  @media (pointer: fine) {
    .t-carousel-track {
      cursor: grab;
    }
    .t-carousel-track.is-grabbing {
      cursor: grabbing;
      scroll-snap-type: none;
      scroll-behavior: auto;
    }
  }
  .t-carousel-cell {
    flex: 0 0
      calc(
        (100% - (var(--t-cols-mobile) - 1) * var(--t-gap)) /
          var(--t-cols-mobile)
      );
    scroll-snap-align: start;
  }
  /* Mobile: the strip bleeds past the section's inline padding and centres the
     active card, so a slice of both neighbours stays visible.

     The 12% inline padding does double duty. It shrinks the track's CONTENT box
     to 76% of the strip, so a cell at flex-basis:100% is 76% wide and leaves a
     12% gutter each side — no vw units, so a narrow Salla page container cannot
     desync the two halves. And it is what lets the first and last card reach
     the centre at all; without it they clamp against the scroll extremes. */
  @media (max-width: 767.98px) {
    .t-carousel {
      margin-inline: calc(-1 * var(--t-pad-x));
    }
    .t-carousel-track {
      padding-inline: 12%;
      scroll-padding-inline: 12%;
    }
    .t-carousel-cell {
      flex-basis: 100%;
      scroll-snap-align: center;
    }
  }

  .t-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 4;
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 50%;
    background: var(--t-arrow-bg, var(--t-title));
    color: var(--t-arrow-fg, #fff);
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.55);
    transition: transform 0.2s var(--t-ease), opacity 0.2s var(--t-ease);
  }
  .t-arrow:hover {
    transform: translateY(-50%) scale(1.07);
  }
  .t-arrow svg {
    width: 20px;
    height: 20px;
  }
  .t-arrow--prev {
    inset-inline-start: 4px;
  }
  .t-arrow--next {
    inset-inline-end: 4px;
  }
  /* Chevron points outward in the reading direction */
  .t-arrow--prev svg {
    transform: rotate(180deg);
  }
  .t-arrow--next svg {
    transform: rotate(0deg);
  }
  .t-arrow:dir(rtl).t-arrow--prev svg {
    transform: rotate(0deg);
  }
  .t-arrow:dir(rtl).t-arrow--next svg {
    transform: rotate(180deg);
  }

  .t-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: clamp(16px, 3vw, 24px);
  }
  .t-dot {
    width: 8px;
    height: 8px;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: var(--t-star-empty);
    cursor: pointer;
    transition: width 0.3s var(--t-ease), background 0.3s var(--t-ease);
  }
  .t-dot[aria-current="true"] {
    width: 22px;
    background: var(--t-accent);
  }

  /* ============================================================
     LAYOUT — grid
     ============================================================ */
  .t-grid {
    display: grid;
    grid-template-columns: repeat(var(--t-cols-mobile), minmax(0, 1fr));
    gap: var(--t-gap);
  }
  .t-grid-cell {
    min-width: 0;
  }

  /* ============================================================
     ENTRANCE ANIMATIONS
     ============================================================ */
  /* Header */
  .t-header[data-anim="ready"] > * {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(6px);
  }
  .t-header[data-anim="in"] > * {
    opacity: 1;
    transform: none;
    filter: blur(0);
    transition: opacity 0.7s var(--t-ease), transform 0.7s var(--t-ease),
      filter 0.7s var(--t-ease);
  }
  .t-header[data-anim="in"] > *:nth-child(2) {
    transition-delay: 0.08s;
  }
  .t-header[data-anim="in"] > *:nth-child(3) {
    transition-delay: 0.16s;
  }
  .t-header[data-anim="in"] > *:nth-child(4) {
    transition-delay: 0.24s;
  }

  /* Cards (grid / carousel) */
  .t-section[data-anim="ready"] .t-grid-cell,
  .t-section[data-anim="ready"] .t-carousel-cell {
    opacity: 0;
    transform: translateY(16px) scale(0.985);
  }
  .t-section[data-anim="in"] .t-grid-cell,
  .t-section[data-anim="in"] .t-carousel-cell {
    opacity: 1;
    transform: none;
    transition: opacity 0.6s var(--t-ease), transform 0.7s var(--t-ease);
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(2),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(2) {
    transition-delay: 0.07s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(3),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(3) {
    transition-delay: 0.14s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(4),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(4) {
    transition-delay: 0.21s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(5),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(5) {
    transition-delay: 0.28s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(6),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(6) {
    transition-delay: 0.35s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(n + 7),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(n + 7) {
    transition-delay: 0.4s;
  }

  /* Star fill grows from 0 on entrance */
  .t-section[data-anim="ready"] .t-stars-fg-clip {
    width: 0;
  }

  /* ============================================================
     HOVER LIFT
     ============================================================ */
  .t-section[data-hover-lift="on"] .t-card {
    transition: transform 0.35s var(--t-ease), box-shadow 0.35s var(--t-ease);
  }
  @media (hover: hover) {
    .t-section[data-hover-lift="on"] .t-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 34px 64px -30px rgba(15, 23, 42, 0.5);
    }
    .t-section[data-hover-lift="on"] .t-card[data-style="modern"] .t-photo > img {
      transition: transform 0.7s var(--t-ease);
    }
    .t-section[data-hover-lift="on"]
      .t-card[data-style="modern"]:hover
      .t-photo
      > img {
      transform: scale(1.05);
    }
  }

  /* ============================================================
     DESKTOP ENHANCEMENTS (≥ 768px)
     ============================================================ */
  @media (min-width: 768px) {
    .t-section {
      --wv-top: var(--wv-top-d);
      --wv-bot: var(--wv-bot-d);
      padding-block: calc(var(--sp-top-d) + var(--wv-top))
        calc(var(--sp-bot-d) + var(--wv-bot));
    }
    .t-side[data-slot="1"] {
      --se-w: var(--se1-w-d);
      --se-x: var(--se1-x-d);
      --se-y: var(--se1-y-d);
      --se-top: var(--se1-top-d);
      --se-pull: var(--se1-pull-d);
    }
    .t-side[data-slot="2"] {
      --se-w: var(--se2-w-d);
      --se-x: var(--se2-x-d);
      --se-y: var(--se2-y-d);
      --se-top: var(--se2-top-d);
      --se-pull: var(--se2-pull-d);
    }
    .t-grid {
      grid-template-columns: repeat(var(--t-cols-desktop), minmax(0, 1fr));
    }
    .t-carousel-cell {
      flex-basis: calc(
        (100% - (var(--t-cols-desktop) - 1) * var(--t-gap)) /
          var(--t-cols-desktop)
      );
    }
    .t-arrow {
      width: 46px;
      height: 46px;
    }
  }

  /* ============================================================
     REDUCED MOTION
     ============================================================ */
  @media (prefers-reduced-motion: reduce) {
    .t-card,
    .t-photo > img,
    .t-grid-cell,
    .t-carousel-cell,
    .t-header > *,
    .t-stars-fg-clip,
    .t-arrow,
    .t-dot {
      transition: none !important;
      animation: none !important;
    }
    .t-section[data-anim] .t-grid-cell,
    .t-section[data-anim] .t-carousel-cell,
    .t-section[data-anim] .t-header > * {
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
    }
    .t-stars-fg-clip {
      width: var(--t-star-pct, 100%) !important;
    }
    .t-carousel-track {
      scroll-behavior: auto;
    }
  }
`;
var G = Object.defineProperty, R = (e, t, i, a) => {
  for (var s = void 0, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = o(t, i, s) || s);
  return s && G(t, i, s), s;
};
const Q = "https://cdn.salla.network/images/themes/landing-page/default-avatar.png", q = class q extends Y {
  constructor() {
    super(...arguments), this._animState = "ready", this._carouselPage = 0, this._isDesktop = !1, this._autoplayTimer = null, this._scrollRaf = null, this._initialCarouselRaf = null, this._initialCarouselSeeded = !1, this._interactionPaused = !1, this._inView = !0, this._io = null, this._dragActive = !1, this._dragStartX = 0, this._dragStartScroll = 0, this._carouselPrev = () => {
      var a;
      const t = this._pageCount(this._items().length);
      let i = this._carouselPage - 1;
      i < 0 && (i = ((a = this.config) == null ? void 0 : a.carousel_loop) !== !1 ? t - 1 : 0), this._scrollToPage(i);
    }, this._carouselNext = () => {
      var a;
      const t = this._pageCount(this._items().length);
      let i = this._carouselPage + 1;
      i >= t && (i = ((a = this.config) == null ? void 0 : a.carousel_loop) !== !1 ? 0 : t - 1), this._scrollToPage(i);
    }, this._onTrackScroll = () => {
      this._scrollRaf || (this._scrollRaf = requestAnimationFrame(() => {
        this._scrollRaf = null;
        const t = this._track;
        if (!t || t.clientWidth === 0) return;
        const i = Math.floor(this._nearestCell() / this._cardsPerView()), a = this._pageCount(this._items().length), s = Math.max(0, Math.min(a - 1, i));
        s !== this._carouselPage && (this._carouselPage = s);
      }));
    }, this._onDragDown = (t) => {
      if (t.pointerType !== "mouse") return;
      const i = this._track;
      i && (this._dragActive = !0, this._dragStartX = t.clientX, this._dragStartScroll = i.scrollLeft, i.style.scrollSnapType = "none", i.style.scrollBehavior = "auto", i.classList.add("is-grabbing"));
    }, this._onDragMove = (t) => {
      if (!this._dragActive) return;
      const i = this._track;
      if (!i) return;
      const a = t.clientX - this._dragStartX;
      i.scrollLeft = this._dragStartScroll - a;
    }, this._endDrag = () => {
      const t = this._track;
      !t || !this._dragActive || (this._dragActive = !1, t.style.scrollSnapType = "", t.style.scrollBehavior = "", t.classList.remove("is-grabbing"));
    }, this._pauseInteraction = () => {
      this._interactionPaused || (this._interactionPaused = !0, this._teardownAutoplay());
    }, this._resumeInteraction = () => {
      this._interactionPaused && (this._interactionPaused = !1, this._setupAutoplay());
    }, this._starPath = "M12 17.27l-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73 1.64 7.03z";
  }
  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------
  _isRtl() {
    return getComputedStyle(this).direction === "rtl";
  }
  /** Round a rating to one decimal and trim trailing zeros ("5.0" → "5"). */
  _formatRating(t) {
    return Number.isNaN(t) ? "" : String(Math.round(t * 10) / 10);
  }
  /** Keep only testimonials that carry some renderable content. */
  _items() {
    var i;
    const t = (i = this.config) == null ? void 0 : i.items;
    return Array.isArray(t) ? t.filter((a) => !a || typeof a != "object" ? !1 : !!(this.localizedString(a.quote) || this.localizedString(a.name) || a.photo || a.avatar)) : [];
  }
  /** Resolve grid/carousel column counts (mobile-first; desktop "inherit" → mobile). */
  _resolveColumns() {
    const t = this.config || {}, i = this._num(
      this._pickValue(t.columns_mobile, "1"),
      1
    ), a = this._pickValue(
      t.columns_desktop,
      "3"
    ), s = a === "inherit" ? i : this._num(a, 3);
    return {
      mobile: Math.max(1, Math.min(4, i)),
      desktop: Math.max(1, Math.min(4, s))
    };
  }
  _cardsPerView() {
    const t = this._resolveColumns();
    return this._isDesktop ? t.desktop : t.mobile;
  }
  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------
  connectedCallback() {
    var a;
    super.connectedCallback();
    const t = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches, i = ((a = this.config) == null ? void 0 : a.enable_entrance_anim) === !1;
    t || i ? this._animState = "in" : requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._animState = "in";
      });
    }), this._mql = window.matchMedia("(min-width: 768px)"), this._isDesktop = this._mql.matches, this._onMqlChange = () => {
      this._isDesktop = this._mql.matches, this._initialCarouselSeeded = !1;
    }, this._mql.addEventListener("change", this._onMqlChange), "IntersectionObserver" in window && (this._io = new IntersectionObserver(
      (s) => {
        const r = s[0];
        r && (this._inView = r.isIntersecting, this.toggleAttribute("out-of-view", !this._inView), this._teardownAutoplay(), this._inView && this._setupAutoplay());
      },
      { threshold: 0.15 }
    ), this._io.observe(this));
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), this._mql && this._onMqlChange && this._mql.removeEventListener("change", this._onMqlChange), this._teardownAutoplay(), (t = this._io) == null || t.disconnect(), this._io = null, this._scrollRaf && cancelAnimationFrame(this._scrollRaf), this._initialCarouselRaf && cancelAnimationFrame(this._initialCarouselRaf);
  }
  updated() {
    var t;
    this._syncAnchor((t = this.config) == null ? void 0 : t.anchor_id, "testimonials"), this._teardownAutoplay(), this._scheduleInitialCarouselPosition(), this._setupAutoplay();
  }
  // ------------------------------------------------------------
  // Carousel: scroll-snap navigation (RTL-safe via rect deltas)
  // ------------------------------------------------------------
  get _track() {
    return this.renderRoot.querySelector(".t-carousel-track");
  }
  get _cells() {
    const t = this._track;
    return t ? Array.from(t.querySelectorAll(".t-carousel-cell")) : [];
  }
  /**
   * Open the mobile carousel on its second card so both neighbours peek in.
   * Desktop already shows three cards, making the second card the visual
   * centre without scrolling. This is an internal composition choice rather
   * than a merchant setting.
   */
  _scheduleInitialCarouselPosition() {
    var i;
    this._initialCarouselSeeded || this._initialCarouselRaf || this._pickValue(
      (i = this.config) == null ? void 0 : i.layout,
      "carousel"
    ) !== "carousel" || this._items().length < 2 || (this._initialCarouselRaf = requestAnimationFrame(() => {
      if (this._initialCarouselRaf = null, this._initialCarouselSeeded) return;
      const a = this._track, s = this._cells;
      if (!a || a.clientWidth === 0 || s.length < 2) return;
      this._initialCarouselSeeded = !0;
      const r = this._isDesktop ? 0 : 1, o = s[r], n = a.getBoundingClientRect(), h = o.getBoundingClientRect(), d = this._isDesktop ? this._isRtl() ? s[0].getBoundingClientRect().right - n.right : s[0].getBoundingClientRect().left - n.left : h.left + h.width / 2 - (n.left + n.width / 2), p = a.style.scrollBehavior;
      a.style.scrollBehavior = "auto", a.scrollLeft += d, a.style.scrollBehavior = p, this._carouselPage = r;
    }));
  }
  _pageCount(t) {
    return Math.max(1, Math.ceil(t / this._cardsPerView()));
  }
  /**
   * Index of the cell sitting closest to the track's centre.
   *
   * Measured with getBoundingClientRect rather than scrollLeft: RTL engines
   * genuinely disagree on scrollLeft's origin and sign (0 at the right edge
   * counting down in Chrome/Firefox, counting up elsewhere), while rectangles
   * read identically in both directions.
   */
  _nearestCell() {
    const t = this._track, i = this._cells;
    if (!t || !i.length) return 0;
    const a = t.getBoundingClientRect(), s = a.left + a.width / 2;
    let r = 0, o = 1 / 0;
    return i.forEach((n, h) => {
      const d = n.getBoundingClientRect(), p = Math.abs(d.left + d.width / 2 - s);
      p < o && (o = p, r = h);
    }), r;
  }
  _scrollToPage(t) {
    const i = this._track, a = this._cells;
    if (!i || !a.length) return;
    const s = this._pageCount(this._items().length), r = Math.max(0, Math.min(s - 1, t)), o = this._cardsPerView(), n = a[Math.min(a.length - 1, r * o)];
    if (!n) return;
    const h = i.getBoundingClientRect(), d = n.getBoundingClientRect(), p = o === 1 ? d.left + d.width / 2 - (h.left + h.width / 2) : this._isRtl() ? d.right - h.right : d.left - h.left;
    i.scrollLeft += p, this._carouselPage = r;
  }
  // ------------------------------------------------------------
  // Autoplay (carousel only)
  // ------------------------------------------------------------
  _setupAutoplay() {
    const t = this.config || {};
    if (this._pickValue(t.layout, "carousel") !== "carousel" || !t.carousel_autoplay || this._interactionPaused || !this._inView || this._pageCount(this._items().length) < 2) return;
    const a = Math.max(2, this._num(t.carousel_autoplay_delay, 5)) * 1e3;
    this._autoplayTimer = window.setTimeout(() => {
      this._autoplayTimer = null, this._carouselNext();
    }, a);
  }
  _teardownAutoplay() {
    this._autoplayTimer && (clearTimeout(this._autoplayTimer), this._autoplayTimer = null);
  }
  _icon(t) {
    switch (t) {
      case "chevron":
        return l`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>`;
      case "quote":
        return l`<svg viewBox="0 0 24 24" fill="currentColor"
          aria-hidden="true"><path d="M9.5 7C6.5 7 4 9.5 4 12.5V19h6.5v-6.5H7.2c0-1.8 1.5-3 3.3-3V7zm10 0C16.5 7 14 9.5 14 12.5V19h6.5v-6.5h-3.3c0-1.8 1.5-3 3.3-3V7z" /></svg>`;
    }
  }
  // ------------------------------------------------------------
  // Render: stars
  // ------------------------------------------------------------
  _renderStars(t) {
    const i = Math.max(0, Math.min(100, t / 5 * 100)), a = (s) => l`
      <div class=${s} aria-hidden="true">
        ${[0, 1, 2, 3, 4].map(
      () => l`<svg viewBox="0 0 24 24"><path d=${this._starPath} /></svg>`
    )}
      </div>
    `;
    return l`
      <div class="t-stars" style=${`--t-star-pct:${i}%`}>
        ${a("t-stars-bg")}
        <div class="t-stars-fg-clip">${a("t-stars-fg")}</div>
      </div>
    `;
  }
  _renderRating(t, i) {
    const a = Math.max(0, Math.min(5, this._num(t.rating, 5)));
    if (a <= 0) return c;
    const s = this._formatRating(a);
    return i === "number" ? l`<div class="t-rating t-rating--num" aria-label=${`${s}/5`}>
        <svg class="t-rating-star" viewBox="0 0 24 24" aria-hidden="true">
          <path d=${this._starPath} />
        </svg>
        <span>${s}</span>
      </div>` : l`<div class="t-rating" aria-label=${`${s}/5`} role="img">
      ${this._renderStars(a)}
      ${i === "stars-number" ? l`<span class="t-rating-text">(${s}/5)</span>` : c}
    </div>`;
  }
  // ------------------------------------------------------------
  // Render: a single testimonial card (shared across all layouts)
  // ------------------------------------------------------------
  _renderCard(t, i, a, s) {
    const r = this.localizedString(t.name), o = this.localizedString(t.meta), n = this.localizedString(t.quote), h = a === "modern" && s.showPhoto && t.photo || "", d = s.showAvatar ? t.avatar || Q : "", p = s.showRating ? this._renderRating(t, s.ratingStyle) : c, m = (v, y = !1) => r || o || v && d ? l`<div
            class=${y ? "t-author t-author--stacked" : "t-author"}
          >
            ${d ? l`<span class="t-avatar"
                  ><img src=${d} alt=${r} loading="lazy"
                /></span>` : c}
            <div class="t-author-meta">
              ${r ? l`<span class="t-name">${r}</span>` : c}
              ${o ? l`<span class="t-meta">${o}</span>` : c}
            </div>
          </div>` : c;
    return a === "modern" ? l`
        <article class="t-card" data-style="modern" data-index=${i}>
          ${h ? l`<div class="t-photo">
                <img
                  src=${h}
                  alt=${r ? `تصوير العميل: ${r}` : "تصوير العميل"}
                  loading="lazy"
                />
                ${r || o ? l`<span class="t-photo-chip">
                      ${d ? l`<img
                            class="t-photo-chip-avatar"
                            src=${d}
                            alt=${r}
                            loading="lazy"
                          />` : c}
                      <span class="t-photo-chip-text"
                        >${r}${o ? l`, ${o}` : c}</span
                      >
                    </span>` : c}
              </div>` : c}
          <div class="t-body">
            ${h ? c : m(!0)} ${p}
            ${n ? l`<p class="t-quote">${n}</p>` : c}
          </div>
        </article>
      ` : l`
      <article class="t-card" data-style="quote" data-index=${i}>
        ${s.showQuoteMark ? l`<span class="t-quote-mark">${this._icon("quote")}</span>` : c}
        ${m(!0, !0)}
        ${p}
        ${n ? l`<p class="t-quote">${n}</p>` : c}
      </article>
    `;
  }
  // ------------------------------------------------------------
  // Render: layouts
  // ------------------------------------------------------------
  _renderCarousel(t, i, a) {
    const s = this.config || {}, r = s.carousel_arrows !== !1, o = s.carousel_dots !== !1, n = this._pageCount(t.length), h = n > 1;
    return l`
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
          ${t.map(
      (d, p) => l`<div class="t-carousel-cell">
                ${this._renderCard(d, p, i, a)}
              </div>`
    )}
        </div>

        ${r && h ? l`
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
            ` : c}
      </div>
      ${o && h ? l`<div class="t-dots" role="tablist">
            ${Array.from({ length: n }).map(
      (d, p) => l`<button
                type="button"
                class="t-dot"
                aria-current=${this._carouselPage === p ? "true" : "false"}
                aria-label=${`${this._lang() === "ar" ? "صفحة" : "Page"} ${p + 1}`}
                @click=${() => this._scrollToPage(p)}
              ></button>`
    )}
          </div>` : c}
    `;
  }
  _renderGrid(t, i, a) {
    return l`<div class="t-grid">
      ${t.map(
      (s, r) => l`<div class="t-grid-cell">
            ${this._renderCard(s, r, i, a)}
          </div>`
    )}
    </div>`;
  }
  // ------------------------------------------------------------
  // Render: host style (CSS custom properties)
  // ------------------------------------------------------------
  _buildHostStyle(t, i, a = []) {
    const s = this._resolveColumns(), r = this._num(t.card_radius, 20), o = this._pickValue(
      t.photo_aspect,
      "4/5"
    ), n = t.enable_bg_image !== !1 ? (t.bg_image || "").trim() : "", d = `color-mix(in srgb, var(--t-bg) ${Math.min(100, Math.max(0, this._num(t.bg_overlay, 62)))}%, transparent)`;
    return [
      t.bg_color ? `--t-bg:${t.bg_color}` : "",
      n ? `--t-bg-img:url("${encodeURI(n)}")` : "",
      n ? `--t-bg-scrim:linear-gradient(${d}, ${d})` : "",
      n ? `--t-bg-pos:${this._pickValue(
        t.bg_position,
        "center"
      )}` : "",
      t.title_color ? `--t-title:${t.title_color}` : "",
      t.subtitle_color ? `--t-subtitle:${t.subtitle_color}` : "",
      t.card_bg ? `--t-card-bg:${t.card_bg}` : "",
      t.border_color ? `--t-border:${t.border_color}` : "",
      t.name_color ? `--t-name:${t.name_color}` : "",
      t.meta_color ? `--t-meta:${t.meta_color}` : "",
      t.text_color ? `--t-text:${t.text_color}` : "",
      t.star_color ? `--t-star:${t.star_color}` : "",
      t.star_empty_color ? `--t-star-empty:${t.star_empty_color}` : "",
      t.accent_color ? `--t-accent:${t.accent_color}` : "",
      t.arrow_bg ? `--t-arrow-bg:${t.arrow_bg}` : "",
      t.arrow_icon_color ? `--t-arrow-fg:${t.arrow_icon_color}` : "",
      `--t-radius:${r}px`,
      `--t-aspect:${o}`,
      `--t-cols-mobile:${s.mobile}`,
      `--t-cols-desktop:${s.desktop}`,
      ...U(
        t,
        (m, v) => this._pickValue(m, v)
      ),
      ...i.vars,
      ...a
    ].filter(Boolean).join("; ");
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  render() {
    const t = this.config || {}, i = this._items(), a = this._pickValue(t.layout, "carousel"), s = this._pickValue(
      t.card_style,
      "quote"
    ), r = this._pickValue(
      t.rating_style,
      "stars"
    ), o = t.enable_entrance_anim !== !1, n = t.enable_hover_lift !== !1, h = {
      showRating: t.show_rating !== !1,
      ratingStyle: r,
      showAvatar: t.show_avatar !== !1,
      showPhoto: t.show_photo !== !1,
      showQuoteMark: t.show_quote_mark === !0
    }, d = W(t, (u, g) => this._pickValue(u, g)), p = {
      ...t,
      side_visual_count: t.side_visual_count ?? "off",
      side_side: t.side_side ?? "right",
      side_vpos: t.side_vpos ?? "top",
      side_vpos_desktop: t.side_vpos_desktop ?? "inherit"
    }, m = (u) => K(
      p,
      (g, f) => this._pickValue(g, f),
      (g, f) => this._num(g, f),
      u
    ), v = [m(1), m(2)].filter(
      (u) => !!u
    ), y = this._buildHostStyle(
      t,
      d,
      v.flatMap((u) => u.vars)
    ), _ = this.localizedString(t.eyebrow), x = this.localizedString(t.section_title), k = this.localizedString(t.section_subtitle), T = t.show_summary === !0, w = Math.max(0, Math.min(5, this._num(t.summary_rating, 0))), S = this.localizedString(t.summary_count_text), $ = T && (w > 0 || !!S);
    if (i.length === 0)
      return l`<section class="t-section" style=${y}>
        <p class="t-empty">
          ${this._lang() === "ar" ? "أضف رأي عميل واحدًا على الأقل لعرض هذا القسم." : "Add at least one testimonial to display this section."}
        </p>
      </section>`;
    const D = _ || x || k || $ ? l`<header
            class="t-header"
            data-anim=${o ? this._animState : "in"}
          >
            ${_ ? l`<p class="t-eyebrow">${_}</p>` : c}
            ${x ? l`<h2 class="t-title">${x}</h2>` : c}
            ${k ? l`<p class="t-subtitle">${k}</p>` : c}
            ${$ ? l`<div class="t-summary">
                  ${w > 0 ? l`<span class="t-summary-num"
                          >${this._formatRating(w)}</span
                        >${this._renderStars(w)}` : c}
                  ${S ? l`<span class="t-summary-count">${S}</span>` : c}
                </div>` : c}
          </header>` : c, C = a === "carousel" ? this._renderCarousel(i, s, h) : this._renderGrid(i, s, h);
    return l`
      <section
        class="t-section"
        style=${y}
        data-wave=${d.on ? "on" : "off"}
        data-layout=${a}
        data-card=${s}
        data-anim=${o ? this._animState : "in"}
        data-hover-lift=${n ? "on" : "off"}
        data-sides=${v.length ? "on" : "off"}
      >
        ${v.map(
      (u) => l`<img
            class="t-side"
            src=${u.image}
            alt=""
            aria-hidden="true"
            data-slot=${u.slot}
            data-side=${u.side}
            data-depth=${u.depth}
            decoding="async"
            loading="lazy"
          />`
    )}
        ${D}
        <div class="t-body-wrap">${C}</div>
      </section>
    `;
  }
};
q.styles = X;
let b = q;
R([
  j({ type: Object })
], b.prototype, "config");
R([
  P()
], b.prototype, "_animState");
R([
  P()
], b.prototype, "_carouselPage");
R([
  P()
], b.prototype, "_isDesktop");
typeof b < "u" && b.registerSallaComponent("salla-testimonials");
export {
  b as default
};
