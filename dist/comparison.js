import { LitElement as j, css as K, svg as M, html as l, nothing as x } from "lit";
import { property as G, state as H } from "lit/decorators.js";
function q(e, t) {
  if (typeof e == "string") return e;
  if (!e || typeof e != "object") return "";
  const s = e[t] || e.ar || e.en || "";
  return typeof s == "string" ? s.trim() : "";
}
function L(e) {
  return e.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class F extends j {
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
    const s = String(t || "").trim(), a = s.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), o = a.includes("-") ? a : `salla-${a || "component"}`, r = () => `${o}-${Math.random().toString(36).substring(2, 8)}`, i = () => {
      var c;
      const d = (c = window.Salla) == null ? void 0 : c.bundles;
      return d && typeof d.registerComponent == "function" ? (d.registerComponent(s, {
        component: this,
        dynamicTagName: r()
      }), !0) : !1;
    };
    if (i()) return;
    const p = window.setInterval(() => {
      i() && window.clearInterval(p);
    }, 100);
    window.setTimeout(() => window.clearInterval(p), 5e3);
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
      const a = t[0];
      if (a && typeof a.value == "string" && a.value)
        return a.value;
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
    var r;
    return (typeof t == "string" ? t : Array.isArray(t) ? String(((r = t[0]) == null ? void 0 : r.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || s;
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
  _syncAnchor(t, s, a = 24) {
    const o = this._slugify(t, s);
    if (!o || o === this._anchorBase) return;
    this._anchorBase = o;
    let r = o;
    for (let p = 2; ; p++) {
      const d = document.getElementById(r);
      if (!d || d === this) break;
      r = `${o}-${p}`;
    }
    if (this.id = r, this.style.scrollMarginTop = `${a}px`, this._anchorDeepLinked) return;
    let i = "";
    try {
      i = decodeURIComponent(location.hash.slice(1));
    } catch {
      i = location.hash.slice(1);
    }
    i && i === r && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(t, s) {
    if (!s.startsWith("#") || s === "#") return;
    let a = s.slice(1);
    try {
      a = decodeURIComponent(a);
    } catch {
    }
    const o = document.getElementById(a);
    if (!o) return;
    t.preventDefault();
    const r = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    o.scrollIntoView({
      block: "start",
      behavior: r ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${a}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, s) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const a = Number(L(t.trim()));
      if (!Number.isNaN(a)) return a;
    }
    if (Array.isArray(t) && t.length > 0) {
      const a = t[0];
      if ((a == null ? void 0 : a.value) !== void 0) return this._num(a.value, s);
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
}, T = {
  none: 0,
  xs: 20,
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128
};
function U(e, t, s = "md", a = "md") {
  const o = t(e == null ? void 0 : e.space_top, s), r = t(e == null ? void 0 : e.space_bottom, a), i = g[o] ?? g.md, p = g[r] ?? g.md, d = T[o] ?? T.md, c = T[r] ?? T.md;
  return [
    `--sp-top-m:${i}px`,
    `--sp-bot-m:${p}px`,
    `--sp-top-d:${d}px`,
    `--sp-bot-d:${c}px`
  ];
}
const E = {
  top: { top: "0%", pull: "0%" },
  center: { top: "50%", pull: "-50%" },
  bottom: { top: "100%", pull: "-100%" }
};
function W(e, t, s, a = 1) {
  const o = e == null ? void 0 : e.side_visual_count, r = o == null ? void 0 : t(o, "off"), i = ((e == null ? void 0 : e.side_image) || "").trim(), p = r ? r !== "off" : (e == null ? void 0 : e.enable_side_visual) === !0 || (e == null ? void 0 : e.enable_side_visual) == null && !!i;
  if (!(a === 1 ? p : r ? r === "two" : p && (e == null ? void 0 : e.enable_second_side_visual) === !0)) return null;
  const c = (a === 1 ? (e == null ? void 0 : e.side_image) || "" : (e == null ? void 0 : e.side2_image) || "").trim();
  if (!c) return null;
  const _ = t(
    a === 1 ? e == null ? void 0 : e.side_side : e == null ? void 0 : e.side2_side,
    a === 1 ? "right" : "left"
  ), k = t(
    a === 1 ? e == null ? void 0 : e.side_depth : e == null ? void 0 : e.side2_depth,
    "front"
  ), v = (a === 1 ? [
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
    (D) => D != null && D !== ""
  ), u = r ? !0 : (a === 1 ? e == null ? void 0 : e.side_desktop_custom : e == null ? void 0 : e.side2_desktop_custom) === !0 || v, $ = t(
    a === 1 ? e == null ? void 0 : e.side_vpos : e == null ? void 0 : e.side2_vpos,
    a === 1 ? "top" : "bottom"
  ), z = t(
    a === 1 ? e == null ? void 0 : e.side_vpos_desktop : e == null ? void 0 : e.side2_vpos_desktop,
    "inherit"
  ), S = !u || z === "inherit" ? $ : z, w = s(a === 1 ? e == null ? void 0 : e.side_width : e == null ? void 0 : e.side2_width, 45), C = u ? s(
    a === 1 ? e == null ? void 0 : e.side_width_desktop : e == null ? void 0 : e.side2_width_desktop,
    w
  ) : w, y = s(a === 1 ? e == null ? void 0 : e.side_x : e == null ? void 0 : e.side2_x, 20), n = u ? s(a === 1 ? e == null ? void 0 : e.side_x_desktop : e == null ? void 0 : e.side2_x_desktop, y) : y, m = s(a === 1 ? e == null ? void 0 : e.side_y : e == null ? void 0 : e.side2_y, 0), h = u ? s(a === 1 ? e == null ? void 0 : e.side_y_desktop : e == null ? void 0 : e.side2_y_desktop, m) : m, I = E[$] ?? E.top, O = E[S] ?? E.top;
  return {
    image: c,
    side: _,
    depth: k,
    slot: a,
    vars: [
      `--se${a}-w-m:${w}%`,
      `--se${a}-w-d:${C}%`,
      `--se${a}-x-m:${y}%`,
      `--se${a}-x-d:${n}%`,
      `--se${a}-y-m:${m}%`,
      `--se${a}-y-d:${h}%`,
      `--se${a}-top-m:${I.top}`,
      `--se${a}-top-d:${O.top}`,
      `--se${a}-pull-m:${I.pull}`,
      `--se${a}-pull-d:${O.pull}`,
      `--se${a}-op:${Math.max(
        0,
        Math.min(
          100,
          s(a === 1 ? e == null ? void 0 : e.side_opacity : e == null ? void 0 : e.side2_opacity, 100)
        )
      ) / 100}`
    ]
  };
}
const Y = K`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    min-width: 0;
    max-width: 100%;

    --cmp-bg: #f5f5f5;
    --cmp-title: #14181f;
    --cmp-sub: #5b6472;
    --cmp-card-bg: #ffffff;
    --cmp-text: #14181f;
    --cmp-border: #e6e8ec;
    --cmp-us-bg: #f7fbf9;
    --cmp-us-border: #cfe7dc;
    --cmp-others: #8b95a3;
    --cmp-check: #1f9d63;
    --cmp-cross: #e0555a;
    --cmp-note: #8b95a3;

    --cmp-radius: 18px;
    /* Fixed, not a merchant field: the header, the card and the footnote all
       measure against it, so it is one number holding three rules in line
       rather than a decision worth asking about. */
    --cmp-max: 880px;

    /* Mobile is primary; the desktop twin is swapped in the media query. */
    --cmp-pad-m: 13px;
    --cmp-pad-d: 19px;
    --cmp-fs-m: 0.92rem;
    --cmp-fs-d: 1.02rem;
    --cmp-logo-m: 92px;
    --cmp-logo-d: 124px;
    --cmp-side-clearance-m: 0px;
    --cmp-side-clearance-d: 0px;

    --cmp-pad-x: clamp(1rem, 4vw, 2.5rem);
    --cmp-ease: cubic-bezier(0.22, 1, 0.36, 1);
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
  .cmp {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--cmp-bg);
    /* Vertical space is the merchant's, via the shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts. */
    padding-block: max(var(--sp-top-m), var(--cmp-side-clearance-m))
      var(--sp-bot-m);
    padding-inline: var(--cmp-pad-x);
    overflow: clip visible;

    /* Derived values live here, on the element that receives the inline
       style — see the file header. */
    --cmp-pad: var(--cmp-pad-m);
    --cmp-fs: var(--cmp-fs-m);
    --cmp-logo: var(--cmp-logo-m);
    --cmp-radius-in: max(0px, calc(var(--cmp-radius) - 5px));

    /* Floor width of the two compared columns. The feature column is the only
       one declared "width: 100%", so it absorbs whatever these two leave —
       which makes this the number that decides how hard the Arabic feature
       text wraps. A mark plus its padding needs ~42px, so 58 is the honest
       floor on a phone. Deliberately not a merchant field: it is a
       consequence of the layout, not a decision worth asking about. */
    --cmp-colw: 58px;

    /* Every cell pays this twice, three times across the row, so on a phone it
       is worth more to the feature text than it looks. */
    --cmp-cell-x: 0.5rem;

    /* Glyph sizing, smaller on a phone so the columns can be narrower. */
    --cmp-mark: 1.15rem;
    --cmp-mark-box: 1.65rem;
    --cmp-mark-in: 0.95rem;
  }

  .cmp-header {
    position: relative;
    z-index: 2;
    max-width: var(--cmp-max);
    margin: 0 auto clamp(1.5rem, 4vw, 2.25rem);
    text-align: center;
  }

  .cmp-title {
    margin: 0;
    color: var(--cmp-title);
    font-size: clamp(1.7rem, 5vw, 2.25rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .cmp-sub {
    margin: 0.6rem 0 0;
    color: var(--cmp-sub);
    font-size: clamp(0.95rem, 2.4vw, 1.0625rem);
    line-height: 1.8;
    white-space: pre-line;
    text-wrap: pretty;
  }

  .cmp-empty {
    margin: 0;
    color: var(--cmp-sub);
    text-align: center;
    font-size: 0.95rem;
  }

  /* ============================================================
     CARD
     The scroll container of last resort: three columns fit a phone, but a
     merchant writing long override values can still overflow, and a table
     that pushes the whole page sideways is worse than one that scrolls
     inside its own frame.
     ============================================================ */
  .cmp-card {
    position: relative;
    z-index: 1;
    max-width: var(--cmp-max);
    margin-inline: auto;
    background: var(--cmp-card-bg);
    border: 1px solid var(--cmp-border);
    border-radius: var(--cmp-radius);
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }

  .cmp-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    /* Below this the Arabic feature text wraps to about a word per line. */
    min-width: 19rem;
  }

  /* Let the card bleed to both mobile viewport edges when requested. */
  .cmp[data-full-mobile="on"] {
    padding-inline: 0;
  }

  /* ============================================================
     CELLS
     ============================================================ */
  .cmp-th,
  .cmp-cell {
    margin: 0;
    padding: var(--cmp-pad) var(--cmp-cell-x);
    font-weight: 400;
    vertical-align: middle;
    background-clip: padding-box;
  }

  /* The feature column absorbs whatever the two compared columns leave, so
     those two floors are what decide how hard the Arabic text wraps. */
  .cmp-th[data-col="feature"],
  .cmp-cell[data-col="feature"] {
    width: 100%;
    text-align: start;
  }

  .cmp-th[data-col="us"],
  .cmp-cell[data-col="us"],
  .cmp-th[data-col="others"],
  .cmp-cell[data-col="others"] {
    min-width: var(--cmp-colw);
    text-align: center;
  }

  /* Only reserve room for the logo when there IS one. Keying this off
     --cmp-logo unconditionally held ~116px for an image that was never there,
     and the feature text paid for it in wrapped lines. */
  .cmp-table[data-logo="on"] .cmp-th[data-col="us"],
  .cmp-table[data-logo="on"] .cmp-cell[data-col="us"] {
    min-width: max(
      var(--cmp-colw),
      calc(var(--cmp-logo) + var(--cmp-cell-x) * 2)
    );
  }

  .cmp-cell[data-col="feature"] {
    color: var(--cmp-text);
    font-size: var(--cmp-fs);
    font-weight: 600;
    line-height: 1.7;
    text-wrap: pretty;
  }

  /* ============================================================
     HEADER ROW
     ============================================================ */
  .cmp-th {
    padding-block: clamp(1rem, 3.4vw, 1.5rem);
    vertical-align: bottom;
  }

  .cmp-table-title {
    display: block;
    color: var(--cmp-title);
    font-size: clamp(1.15rem, 3.6vw, 1.6rem);
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .cmp-logo {
    display: block;
    width: var(--cmp-logo);
    max-width: 100%;
    height: auto;
    margin-inline: auto;
    object-fit: contain;
  }

  .cmp-col-label {
    display: block;
    color: var(--cmp-others);
    /* Sized off the row text so the whole table shrinks together on a phone. */
    font-size: calc(var(--cmp-fs) * 0.86);
    font-weight: 600;
    line-height: 1.5;
    text-wrap: balance;
  }

  /* Our own column keeps the ink of the section when it has no logo, so it
     still reads as the answer rather than as the runner-up. */
  .cmp-th[data-col="us"] .cmp-col-label {
    color: var(--cmp-title);
    font-weight: 800;
  }

  /* ============================================================
     GRID LINES
     Logical sides, so one rule draws the correct edge in both directions: a
     start-side line separates a cell from the one before it.
     ============================================================ */
  .cmp-table[data-grid="on"] tbody .cmp-cell {
    border-block-start: 1px solid var(--cmp-border);
  }

  .cmp-table[data-grid="on"] .cmp-th:not([data-col="feature"]),
  .cmp-table[data-grid="on"] .cmp-cell:not([data-col="feature"]) {
    border-inline-start: 1px solid var(--cmp-border);
  }

  /* ============================================================
     STRIPES
     Skipped on the highlighted column, which paints its own tint and must not
     be striped over.
     ============================================================ */
  .cmp-table[data-stripes="on"]
    tbody
    tr:nth-child(even)
    .cmp-cell:not([data-col="us"]) {
    background: color-mix(in srgb, var(--cmp-border) 26%, transparent);
  }

  /* ============================================================
     HIGHLIGHTED COLUMN
     See the file header for why this is an inset shadow and not a border.
     ============================================================ */
  .cmp-table[data-highlight="on"] [data-col="us"] {
    background: var(--cmp-us-bg);
    box-shadow:
      inset 1px 0 0 var(--cmp-us-border),
      inset -1px 0 0 var(--cmp-us-border);
  }

  .cmp-table[data-highlight="on"] thead [data-col="us"] {
    box-shadow:
      inset 1px 0 0 var(--cmp-us-border),
      inset -1px 0 0 var(--cmp-us-border),
      inset 0 1px 0 var(--cmp-us-border);
    border-start-start-radius: var(--cmp-radius-in);
    border-start-end-radius: var(--cmp-radius-in);
  }

  .cmp-table[data-highlight="on"] tbody tr:last-child [data-col="us"] {
    box-shadow:
      inset 1px 0 0 var(--cmp-us-border),
      inset -1px 0 0 var(--cmp-us-border),
      inset 0 -1px 0 var(--cmp-us-border);
    border-end-start-radius: var(--cmp-radius-in);
    border-end-end-radius: var(--cmp-radius-in);
  }

  /* ============================================================
     MARKS
     currentColor carries the yes/no decision, so one set of rules dresses
     both glyphs and the tinted and filled variants come for free.
     ============================================================ */
  .cmp-mark {
    display: inline-grid;
    place-items: center;
    color: var(--cmp-cross);
  }

  .cmp-mark[data-on="yes"] {
    color: var(--cmp-check);
  }

  .cmp-mark svg {
    display: block;
    width: var(--cmp-mark);
    height: var(--cmp-mark);
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .cmp-mark[data-style="circle"],
  .cmp-mark[data-style="solid"] {
    width: var(--cmp-mark-box);
    height: var(--cmp-mark-box);
    border-radius: 50%;
  }

  .cmp-mark[data-style="circle"] {
    background: color-mix(in srgb, currentColor 13%, transparent);
  }

  .cmp-mark[data-style="solid"] {
    background: currentColor;
  }

  .cmp-mark[data-style="circle"] svg,
  .cmp-mark[data-style="solid"] svg {
    width: var(--cmp-mark-in);
    height: var(--cmp-mark-in);
    stroke-width: 2.6;
  }

  .cmp-mark[data-style="solid"] svg {
    stroke: var(--cmp-card-bg);
  }

  /* A short value in place of the glyph, for rows that measure rather than
     answer yes or no. */
  .cmp-val {
    display: block;
    color: var(--cmp-text);
    font-size: calc(var(--cmp-fs) * 0.94);
    font-weight: 700;
    line-height: 1.5;
    text-wrap: balance;
  }

  .cmp-cell[data-col="others"] .cmp-val {
    color: var(--cmp-others);
    font-weight: 600;
  }

  /* ============================================================
     FOOTNOTE
     ============================================================ */
  .cmp-note {
    position: relative;
    z-index: 1;
    max-width: var(--cmp-max);
    margin: 0.9rem auto 0;
    color: var(--cmp-note);
    font-size: clamp(0.75rem, 2vw, 0.83rem);
    line-height: 1.7;
    text-align: center;
    white-space: pre-line;
    text-wrap: pretty;
  }

  /* ============================================================
     ENTRANCE
     The transform rides an inner span, never the row or the cell: a transform
     on a table row or a table cell is the one place engines still disagree,
     and the backgrounds painted above must not fade with the content.
     ============================================================ */
  .cmp-in {
    display: block;
    transition:
      opacity 0.5s var(--cmp-ease),
      transform 0.5s var(--cmp-ease);
    transition-delay: calc(var(--i, 0) * 60ms);
  }

  .cmp-table[data-anim="ready"] .cmp-in {
    opacity: 0;
    transform: translateY(10px);
  }

  .cmp-table[data-anim="in"] .cmp-in {
    opacity: 1;
    transform: none;
  }

  /* ============================================================
     SIDE DESIGN ELEMENT (عنصر بصري جانبي)
     Shared resolver in src/shared/side-element.ts; the properties below are
     the ones it returns. Depth is honoured as it is in faq: the header sits
     at 2 and the card at 1, so "behind" tucks under both and "front" floats
     over them.
     ============================================================ */
  .cmp-side {
    position: absolute;
    top: var(--se-top, 0%);
    width: var(--se-w, 45%);
    height: auto;
    opacity: var(--se-op, 1);
    pointer-events: none;
    user-select: none;
    max-width: none;
  }

  .cmp-side[data-depth="behind"] {
    z-index: 0;
  }

  .cmp-side[data-depth="front"] {
    z-index: 3;
  }

  .cmp-side[data-slot="1"] {
    --se-w: var(--se1-w-m);
    --se-x: var(--se1-x-m);
    --se-y: var(--se1-y-m);
    --se-top: var(--se1-top-m);
    --se-pull: var(--se1-pull-m);
    --se-op: var(--se1-op);
  }

  .cmp-side[data-slot="2"] {
    --se-w: var(--se2-w-m);
    --se-x: var(--se2-x-m);
    --se-y: var(--se2-y-m);
    --se-top: var(--se2-top-m);
    --se-pull: var(--se2-pull-m);
    --se-op: var(--se2-op);
  }

  /* A positive X always pushes the element further OUT of the section,
     whichever edge it is parked on, so the merchant's slider means one thing
     on both sides. The value is a magnitude and not a signed nudge because an
     RTL range input runs its minimum at the right while CSS translateX with a
     positive argument is always physically rightward — a signed value would
     drag backwards. */
  .cmp-side[data-side="left"] {
    left: 0;
    transform: translate(
      calc(-1 * var(--se-x, 0%)),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }

  .cmp-side[data-side="right"] {
    right: 0;
    transform: translate(
      var(--se-x, 0%),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }

  /* ============================================================
     REDUCED MOTION
     ============================================================ */
  @media (prefers-reduced-motion: reduce) {
    .cmp-in {
      transition: none;
    }
    .cmp-table[data-anim="ready"] .cmp-in {
      opacity: 1;
      transform: none;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    .cmp[data-full-mobile="on"] {
      padding-inline: var(--cmp-pad-x);
    }

    .cmp {
      padding-block: max(var(--sp-top-d), var(--cmp-side-clearance-d))
        var(--sp-bot-d);
      --cmp-pad: var(--cmp-pad-d);
      --cmp-fs: var(--cmp-fs-d);
      --cmp-logo: var(--cmp-logo-d);
      --cmp-colw: 108px;
      --cmp-cell-x: clamp(1rem, 2.2vw, 1.5rem);
      --cmp-mark: 1.35rem;
      --cmp-mark-box: 1.9rem;
      --cmp-mark-in: 1.05rem;
    }
    .cmp-side[data-slot="1"] {
      --se-w: var(--se1-w-d);
      --se-x: var(--se1-x-d);
      --se-y: var(--se1-y-d);
      --se-top: var(--se1-top-d);
      --se-pull: var(--se1-pull-d);
    }
    .cmp-side[data-slot="2"] {
      --se-w: var(--se2-w-d);
      --se-x: var(--se2-x-d);
      --se-y: var(--se2-y-d);
      --se-top: var(--se2-top-d);
      --se-pull: var(--se2-pull-d);
    }
  }
`;
var X = Object.defineProperty, P = (e, t, s, a) => {
  for (var o = void 0, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (o = i(t, s, o) || o);
  return o && X(t, s, o), o;
};
const N = {
  compact: { pad: 10, fs: 0.78 },
  normal: { pad: 13, fs: 0.84 },
  spacious: { pad: 17, fs: 0.9 }
}, R = {
  compact: { pad: 14, fs: 0.95 },
  normal: { pad: 19, fs: 1.02 },
  spacious: { pad: 26, fs: 1.1 }
}, V = {
  sm: 56,
  md: 72,
  lg: 92
}, B = {
  sm: 92,
  md: 124,
  lg: 160
}, A = class A extends F {
  constructor() {
    super(...arguments), this._animState = "ready", this._io = null, this._fallbackTimer = null, this._reveal = () => {
      var t;
      this._animState = "in", (t = this._io) == null || t.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null);
    };
  }
  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------
  /** A row with no feature text has nothing to compare; drop it. */
  _items() {
    var s;
    const t = (s = this.config) == null ? void 0 : s.items;
    return Array.isArray(t) ? t.filter(
      (a) => !!a && typeof a == "object" && !!this.localizedString(a.text)
    ) : [];
  }
  _reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  /** Mobile tier first, then desktop — "inherit" carries the TIER across, and
      it is resolved through the desktop table, not the mobile pixels. */
  _density(t) {
    const s = this._pickValue(t.density_mobile, "normal"), a = this._pickValue(
      t.density_desktop,
      "inherit"
    ), o = a === "inherit" ? s : a;
    return {
      m: N[s] ?? N.normal,
      d: R[o] ?? R.normal
    };
  }
  _logo(t) {
    const s = this._pickValue(t.logo_size_mobile, "md"), a = this._pickValue(
      t.logo_size_desktop,
      "inherit"
    ), o = a === "inherit" ? s : a;
    return {
      m: V[s] ?? V.md,
      d: B[o] ?? B.md
    };
  }
  connectedCallback() {
    if (super.connectedCallback(), !("IntersectionObserver" in window)) {
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
    super.disconnectedCallback(), (t = this._io) == null || t.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null);
  }
  updated() {
    var t;
    this._syncAnchor((t = this.config) == null ? void 0 : t.anchor_id, "comparison");
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  _hostStyle(t, s) {
    const a = this._density(t), o = this._logo(t);
    return [
      t.bg_color ? `--cmp-bg:${t.bg_color}` : "",
      t.title_color ? `--cmp-title:${t.title_color}` : "",
      t.subtitle_color ? `--cmp-sub:${t.subtitle_color}` : "",
      t.card_bg ? `--cmp-card-bg:${t.card_bg}` : "",
      t.text_color ? `--cmp-text:${t.text_color}` : "",
      t.border_color ? `--cmp-border:${t.border_color}` : "",
      t.us_col_bg ? `--cmp-us-bg:${t.us_col_bg}` : "",
      t.us_col_border ? `--cmp-us-border:${t.us_col_border}` : "",
      t.others_color ? `--cmp-others:${t.others_color}` : "",
      t.check_color ? `--cmp-check:${t.check_color}` : "",
      t.cross_color ? `--cmp-cross:${t.cross_color}` : "",
      t.footnote_color ? `--cmp-note:${t.footnote_color}` : "",
      `--cmp-radius:${this._num(t.table_radius, 18)}px`,
      `--cmp-pad-m:${a.m.pad}px`,
      `--cmp-pad-d:${a.d.pad}px`,
      `--cmp-fs-m:${a.m.fs}rem`,
      `--cmp-fs-d:${a.d.fs}rem`,
      `--cmp-logo-m:${o.m}px`,
      `--cmp-logo-d:${o.d}px`,
      `--cmp-side-clearance-m:${Math.max(
        0,
        this._num(t.side_top_clearance_mobile, 0)
      )}px`,
      `--cmp-side-clearance-d:${Math.max(
        0,
        this._num(t.side_top_clearance_desktop, 0)
      )}px`,
      ...s,
      ...U(t, (r, i) => this._pickValue(r, i))
    ].filter(Boolean).join("; ");
  }
  /** The yes/no glyph. The label is read out, so a screen reader gets the
        answer a sighted visitor gets from the colour and the shape.
  
        The paths come from lit's svg tag, never html: a nested template
        interpolated as a CHILD of an <svg> is parsed in the HTML namespace, so
        the browser builds an HTMLUnknownElement named PATH and paints nothing.
        Interpolating an attribute inside a literal <svg> is unaffected — only a
        template boundary that opens inside the element is. */
  _mark(t, s) {
    const a = this._lang() === "ar";
    return l`<span
      class="cmp-mark"
      data-on=${t ? "yes" : "no"}
      data-style=${s}
      role="img"
      aria-label=${t ? a ? "متوفر" : "Included" : a ? "غير متوفر" : "Not included"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        ${t ? M`<path d="M20 6 9 17l-5-5" />` : M`<path d="M18 6 6 18" /> <path d="m6 6 12 12" />`}
      </svg>
    </span>`;
  }
  /**
   * One compared cell. A written override wins over the glyph, which is what
   * lets a yes/no table carry the occasional measured row without a mode
   * switch: leave the override empty and the mark comes back.
   */
  _cell(t, s, a) {
    const o = this.localizedString(
      t === "us" ? s.us_text : s.others_text
    );
    if (o) return l`<span class="cmp-val">${o}</span>`;
    const r = t === "us" ? s.us !== !1 : s.others === !0;
    return this._mark(r, a);
  }
  render() {
    const t = this.config || {}, s = {
      ...t,
      side_depth: t.side_depth ?? "behind",
      side2_depth: t.side2_depth ?? "behind"
    }, a = (n) => W(
      s,
      (m, h) => this._pickValue(m, h),
      (m, h) => this._num(m, h),
      n
    ), o = [a(1), a(2)].filter(
      (n) => !!n
    ), r = this._hostStyle(
      t,
      o.flatMap((n) => n.vars)
    ), i = o.map(
      (n) => l`<img
          class="cmp-side"
          src=${n.image}
          alt=""
          aria-hidden="true"
          data-slot=${n.slot}
          data-side=${n.side}
          data-depth=${n.depth}
          decoding="async"
          loading="lazy"
        />`
    ), p = this._items();
    if (p.length === 0)
      return l`<section
        class="cmp"
        data-full-mobile=${t.full_width_mobile === !0 ? "on" : "off"}
        style=${r}
      >
        ${i}
        <p class="cmp-empty">
          ${this._lang() === "ar" ? "أضف صفًا واحدًا على الأقل لعرض جدول المقارنة." : "Add at least one row to display the comparison table."}
        </p>
      </section>`;
    const d = this._pickValue(
      t.title_position,
      "in_table"
    ), c = d === "hidden" ? "" : this.localizedString(t.section_title), _ = this.localizedString(t.section_subtitle), k = this.localizedString(t.footnote), f = this.localizedString(t.us_label), v = (t.us_logo || "").trim(), u = this.localizedString(t.others_label), $ = this._pickValue(
      t.mark_style,
      "plain"
    ), S = this._pickValue(
      t.column_order,
      "us_first"
    ) === "others_first" ? ["others", "us"] : ["us", "others"], w = t.enable_entrance_anim !== !1 && !this._reduceMotion(), C = d === "above" && c || _, y = (n) => n === "us" ? l`<th class="cmp-th" data-col="us" scope="col">
            <span class="cmp-in" style="--i:0">
              ${v ? l`<img
                      class="cmp-logo"
                      src=${v}
                      alt=${f}
                      decoding="async"
                    />` : l`<span class="cmp-col-label">${f}</span>`}
            </span>
          </th>` : l`<th class="cmp-th" data-col="others" scope="col">
            <span class="cmp-in" style="--i:0">
              <span class="cmp-col-label">${u}</span>
            </span>
          </th>`;
    return l`
      <section
        class="cmp"
        data-full-mobile=${t.full_width_mobile === !0 ? "on" : "off"}
        style=${r}
      >
        ${i}
        ${C ? l`<header class="cmp-header">
                ${d === "above" && c ? l`<h2 class="cmp-title">${c}</h2>` : x}
                ${_ ? l`<p class="cmp-sub">${_}</p>` : x}
              </header>` : x}

        <div class="cmp-card">
          <table
            class="cmp-table"
            data-anim=${w ? this._animState : "in"}
            data-logo=${v ? "on" : "off"}
            data-highlight=${t.highlight_us === !1 ? "off" : "on"}
            data-stripes=${t.row_stripes === !0 ? "on" : "off"}
            data-grid=${t.grid_lines === !1 ? "off" : "on"}
          >
            <thead>
              <tr>
                <th class="cmp-th" data-col="feature" scope="col">
                  ${d === "in_table" && c ? l`<span class="cmp-in" style="--i:0"
                          ><span class="cmp-table-title">${c}</span></span
                        >` : x}
                </th>
                ${S.map((n) => y(n))}
              </tr>
            </thead>
            <tbody>
              ${p.map(
      (n, m) => l`<tr style=${`--i:${m + 1}`}>
                    <th class="cmp-cell" data-col="feature" scope="row">
                      <span class="cmp-in"
                        >${this.localizedString(n.text)}</span
                      >
                    </th>
                    ${S.map(
        (h) => l`<td class="cmp-cell" data-col=${h}>
                          <span class="cmp-in"
                            >${this._cell(h, n, $)}</span
                          >
                        </td>`
      )}
                  </tr>`
    )}
            </tbody>
          </table>
        </div>

        ${k ? l`<p class="cmp-note">${k}</p>` : x}
      </section>
    `;
  }
};
A.styles = Y;
let b = A;
P([
  G({ type: Object })
], b.prototype, "config");
P([
  H()
], b.prototype, "_animState");
typeof b < "u" && b.registerSallaComponent("salla-comparison");
export {
  b as default
};
