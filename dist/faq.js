import { LitElement as L, css as R, html as u, nothing as T } from "lit";
import { property as V, state as M } from "lit/decorators.js";
function P(e, t) {
  if (typeof e == "string") return e;
  if (!e || typeof e != "object") return "";
  const a = e[t] || e.ar || e.en || "";
  return typeof a == "string" ? a.trim() : "";
}
function I(e) {
  return e.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class j extends L {
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
    const a = String(t || "").trim(), i = a.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), s = i.includes("-") ? i : `salla-${i || "component"}`, r = () => `${s}-${Math.random().toString(36).substring(2, 8)}`, n = () => {
      var p;
      const l = (p = window.Salla) == null ? void 0 : p.bundles;
      return l && typeof l.registerComponent == "function" ? (l.registerComponent(a, {
        component: this,
        dynamicTagName: r()
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
    return P(t, this._lang());
  }
  /** Dropdown-list values from settings may come as [{ label, value }]. */
  _pickValue(t, a) {
    if (typeof t == "string" && t) return t;
    if (Array.isArray(t) && t.length > 0) {
      const i = t[0];
      if (i && typeof i.value == "string" && i.value)
        return i.value;
    }
    return a;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(t) {
    return I(t);
  }
  /**
   * The inverse: render a number in the digits the store's language uses, so a
   * counter or a step badge matches the copy beside it. Latin digits outside
   * Arabic, Arabic-Indic inside it.
   */
  _localeNum(t) {
    return this._lang() !== "ar" ? String(t) : String(t).replace(
      /\d/g,
      (a) => String.fromCharCode(1632 + Number(a))
    );
  }
  /**
   * Normalise a merchant-typed anchor into an id. Deliberately permissive
   * about script — Arabic ids are valid HTML and resolve fine through
   * getElementById — so we only strip the leading `#`, collapse whitespace,
   * and drop the characters that would break a URL fragment or a selector.
   */
  _slugify(t, a) {
    var r;
    return (typeof t == "string" ? t : Array.isArray(t) ? String(((r = t[0]) == null ? void 0 : r.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || a;
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
  _syncAnchor(t, a, i = 24) {
    const s = this._slugify(t, a);
    if (!s || s === this._anchorBase) return;
    this._anchorBase = s;
    let r = s;
    for (let d = 2; ; d++) {
      const l = document.getElementById(r);
      if (!l || l === this) break;
      r = `${s}-${d}`;
    }
    if (this.id = r, this.style.scrollMarginTop = `${i}px`, this._anchorDeepLinked) return;
    let n = "";
    try {
      n = decodeURIComponent(location.hash.slice(1));
    } catch {
      n = location.hash.slice(1);
    }
    n && n === r && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(t, a) {
    if (!a.startsWith("#") || a === "#") return;
    let i = a.slice(1);
    try {
      i = decodeURIComponent(i);
    } catch {
    }
    const s = document.getElementById(i);
    if (!s) return;
    t.preventDefault();
    const r = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    s.scrollIntoView({
      block: "start",
      behavior: r ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${i}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, a) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const i = Number(I(t.trim()));
      if (!Number.isNaN(i)) return i;
    }
    if (Array.isArray(t) && t.length > 0) {
      const i = t[0];
      if ((i == null ? void 0 : i.value) !== void 0) return this._num(i.value, a);
    }
    return a;
  }
}
const q = {
  none: 0,
  xs: 12,
  sm: 24,
  md: 40,
  lg: 56,
  xl: 72
}, b = {
  none: 0,
  xs: 20,
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128
};
function H(e, t, a = "md", i = "md") {
  const s = t(e == null ? void 0 : e.space_top, a), r = t(e == null ? void 0 : e.space_bottom, i), n = q[s] ?? q.md, d = q[r] ?? q.md, l = b[s] ?? b.md, p = b[r] ?? b.md;
  return [
    `--sp-top-m:${n}px`,
    `--sp-bot-m:${d}px`,
    `--sp-top-d:${l}px`,
    `--sp-bot-d:${p}px`
  ];
}
const w = {
  top: { top: "0%", pull: "0%" },
  center: { top: "50%", pull: "-50%" },
  bottom: { top: "100%", pull: "-100%" }
};
function U(e, t, a, i = 1) {
  const s = e == null ? void 0 : e.side_visual_count, r = s == null ? void 0 : t(s, "off"), n = ((e == null ? void 0 : e.side_image) || "").trim(), d = r ? r !== "off" : (e == null ? void 0 : e.enable_side_visual) === !0 || (e == null ? void 0 : e.enable_side_visual) == null && !!n;
  if (!(i === 1 ? d : r ? r === "two" : d && (e == null ? void 0 : e.enable_second_side_visual) === !0)) return null;
  const p = (i === 1 ? (e == null ? void 0 : e.side_image) || "" : (e == null ? void 0 : e.side2_image) || "").trim();
  if (!p) return null;
  const y = t(
    i === 1 ? e == null ? void 0 : e.side_side : e == null ? void 0 : e.side2_side,
    i === 1 ? "right" : "left"
  ), f = t(
    i === 1 ? e == null ? void 0 : e.side_depth : e == null ? void 0 : e.side2_depth,
    "front"
  ), h = (i === 1 ? [
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
    (S) => S != null && S !== ""
  ), m = r ? !0 : (i === 1 ? e == null ? void 0 : e.side_desktop_custom : e == null ? void 0 : e.side2_desktop_custom) === !0 || h, c = t(
    i === 1 ? e == null ? void 0 : e.side_vpos : e == null ? void 0 : e.side2_vpos,
    i === 1 ? "top" : "bottom"
  ), v = t(
    i === 1 ? e == null ? void 0 : e.side_vpos_desktop : e == null ? void 0 : e.side2_vpos_desktop,
    "inherit"
  ), D = !m || v === "inherit" ? c : v, x = a(i === 1 ? e == null ? void 0 : e.side_width : e == null ? void 0 : e.side2_width, 45), N = m ? a(
    i === 1 ? e == null ? void 0 : e.side_width_desktop : e == null ? void 0 : e.side2_width_desktop,
    x
  ) : x, $ = a(i === 1 ? e == null ? void 0 : e.side_x : e == null ? void 0 : e.side2_x, 20), B = m ? a(i === 1 ? e == null ? void 0 : e.side_x_desktop : e == null ? void 0 : e.side2_x_desktop, $) : $, k = a(i === 1 ? e == null ? void 0 : e.side_y : e == null ? void 0 : e.side2_y, 0), O = m ? a(i === 1 ? e == null ? void 0 : e.side_y_desktop : e == null ? void 0 : e.side2_y_desktop, k) : k, z = w[c] ?? w.top, A = w[D] ?? w.top;
  return {
    image: p,
    side: y,
    depth: f,
    slot: i,
    vars: [
      `--se${i}-w-m:${x}%`,
      `--se${i}-w-d:${N}%`,
      `--se${i}-x-m:${$}%`,
      `--se${i}-x-d:${B}%`,
      `--se${i}-y-m:${k}%`,
      `--se${i}-y-d:${O}%`,
      `--se${i}-top-m:${z.top}`,
      `--se${i}-top-d:${A.top}`,
      `--se${i}-pull-m:${z.pull}`,
      `--se${i}-pull-d:${A.pull}`,
      `--se${i}-op:${Math.max(
        0,
        Math.min(
          100,
          a(i === 1 ? e == null ? void 0 : e.side_opacity : e == null ? void 0 : e.side2_opacity, 100)
        )
      ) / 100}`
    ]
  };
}
const G = R`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    min-width: 0;
    max-width: 100%;

    --faq-bg: #f5f5f5;
    --faq-title: #14181f;
    --faq-sub: #5b6472;
    --faq-card-bg: #ffffff;
    --faq-q: #14181f;
    --faq-a: #5b6472;
    --faq-border: #e6e8ec;
    --faq-icon: #14181f;

    --faq-radius: 14px;
    --faq-pad-x: clamp(1rem, 4vw, 2.5rem);
    --faq-max: 760px;
    --faq-ease: cubic-bezier(0.22, 1, 0.36, 1);
    --faq-dur: 0.32s;
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
  .faq {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--faq-bg);
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts. */
    padding-block: var(--sp-top-m) var(--sp-bot-m);
    /* See the file header: the side element bleeds, so this is not
       overflow:hidden. "clip visible" is a legal pair that creates no scroll
       container in either axis. */
    overflow: clip visible;
  }

  .faq-header {
    position: relative;
    z-index: 2;
    max-width: var(--faq-max);
    margin: 0 auto clamp(1.5rem, 4vw, 2.25rem);
    padding-inline: var(--faq-pad-x);
    text-align: center;
  }

  .faq-title {
    margin: 0;
    color: var(--faq-title);
    font-size: clamp(1.7rem, 5vw, 2.25rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .faq-sub {
    margin: 0.6rem 0 0;
    color: var(--faq-sub);
    font-size: clamp(0.95rem, 2.4vw, 1.0625rem);
    line-height: 1.8;
    white-space: pre-line;
    text-wrap: pretty;
  }

  .faq-empty {
    margin: 0;
    padding-inline: var(--faq-pad-x);
    color: var(--faq-sub);
    text-align: center;
    font-size: 0.95rem;
  }

  /* ============================================================
     LIST
     ============================================================ */
  .faq-list {
    position: relative;
    z-index: 1;
    max-width: var(--faq-max);
    margin-inline: auto;
    padding-inline: var(--faq-pad-x);
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .faq-item {
    background: var(--faq-card-bg);
    border: 1px solid var(--faq-border);
    border-radius: var(--faq-radius);
    /* The radius has to bite the question row's focus ring and the answer's
       bottom edge, and the row is a grid that would otherwise paint over it. */
    overflow: hidden;
    transition:
      border-color var(--faq-dur) var(--faq-ease),
      box-shadow var(--faq-dur) var(--faq-ease),
      opacity 0.5s var(--faq-ease),
      transform 0.5s var(--faq-ease);
  }

  .faq-item[data-open="true"] {
    border-color: color-mix(in srgb, var(--faq-icon) 34%, var(--faq-border));
    box-shadow: 0 6px 20px
      color-mix(in srgb, var(--faq-icon) 10%, transparent);
  }

  /* The heading exists for document outline only; all visual weight is on the
     button inside it. */
  .faq-q-wrap {
    margin: 0;
    font-size: inherit;
    font-weight: inherit;
  }

  .faq-q {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    margin: 0;
    padding: clamp(0.95rem, 3.4vw, 1.25rem) clamp(1rem, 3.6vw, 1.4rem);
    border: 0;
    background: none;
    color: var(--faq-q);
    font: inherit;
    font-size: clamp(0.98rem, 2.6vw, 1.0625rem);
    font-weight: 700;
    line-height: 1.6;
    /* The question reads right-to-left in Arabic and left-to-right in English;
       "start" follows the document either way. */
    text-align: start;
    cursor: pointer;
  }

  .faq-q:focus-visible {
    outline: 2px solid var(--faq-icon);
    outline-offset: -2px;
  }

  .faq-q-text {
    flex: 1 1 auto;
    min-width: 0;
  }

  /* ============================================================
     TRIGGER GLYPH
     ============================================================ */
  .faq-icon {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--faq-icon) 8%, transparent);
    color: var(--faq-icon);
    transition: transform var(--faq-dur) var(--faq-ease);
  }

  .faq-icon svg {
    display: block;
    width: 1rem;
    height: 1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* A chevron points down when closed and flips up when open. */
  .faq-item[data-open="true"] .faq-icon[data-icon="chevron"] {
    transform: rotate(180deg);
  }

  /* A plus becomes a minus: only the vertical stroke rotates away. */
  .faq-icon[data-icon="plus"] .faq-plus-v {
    transform-origin: center;
    transform-box: fill-box;
    transition: transform var(--faq-dur) var(--faq-ease);
  }

  .faq-item[data-open="true"] .faq-icon[data-icon="plus"] .faq-plus-v {
    transform: rotate(90deg);
  }

  /* ============================================================
     ANSWER
     ============================================================ */
  .faq-a-wrap {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows var(--faq-dur) var(--faq-ease);
  }

  .faq-item[data-open="true"] .faq-a-wrap {
    grid-template-rows: 1fr;
  }

  /* visibility (not display) so the collapsed answer leaves the accessibility
     tree without breaking the row transition; it is delayed on the way out so
     the text stays painted while the panel closes. */
  .faq-a {
    overflow: hidden;
    visibility: hidden;
    transition: visibility 0s linear var(--faq-dur);
  }

  .faq-item[data-open="true"] .faq-a {
    visibility: visible;
    transition: visibility 0s;
  }

  .faq-a-inner {
    padding: 0 clamp(1rem, 3.6vw, 1.4rem) clamp(1rem, 3.4vw, 1.3rem);
    color: var(--faq-a);
    font-size: clamp(0.92rem, 2.4vw, 1rem);
    line-height: 1.85;
    white-space: pre-line;
    text-wrap: pretty;
  }

  /* ============================================================
     ENTRANCE
     ============================================================ */
  .faq-list[data-anim="ready"] .faq-item {
    opacity: 0;
    transform: translateY(14px);
  }

  .faq-list[data-anim="in"] .faq-item {
    opacity: 1;
    transform: none;
    transition-delay: calc(var(--i, 0) * 70ms);
  }

  /* ============================================================
     SIDE DESIGN ELEMENT (عنصر بصري جانبي)
     Shared resolver in src/shared/side-element.ts; the properties below are the
     ones it returns. Depth is honoured here (the gallery ignores it): the
     header sits at 2 and the list at 1, so "behind" tucks under both and
     "front" floats over them.
     ============================================================ */
  .faq-side {
    position: absolute;
    top: var(--se-top, 0%);
    width: var(--se-w, 45%);
    height: auto;
    opacity: var(--se-op, 1);
    pointer-events: none;
    user-select: none;
    max-width: none;
  }

  .faq-side[data-depth="behind"] {
    z-index: 0;
  }

  .faq-side[data-depth="front"] {
    z-index: 3;
  }

  .faq-side[data-slot="1"] {
    --se-w: var(--se1-w-m);
    --se-x: var(--se1-x-m);
    --se-y: var(--se1-y-m);
    --se-top: var(--se1-top-m);
    --se-pull: var(--se1-pull-m);
    --se-op: var(--se1-op);
  }

  .faq-side[data-slot="2"] {
    --se-w: var(--se2-w-m);
    --se-x: var(--se2-x-m);
    --se-y: var(--se2-y-m);
    --se-top: var(--se2-top-m);
    --se-pull: var(--se2-pull-m);
    --se-op: var(--se2-op);
  }

  /* A positive X always pushes the element further OUT of the section, whichever
     edge it is parked on, so the merchant's slider means one thing on both
     sides. This is why the value is a magnitude and not a signed nudge: an RTL
     range input runs its minimum at the right, while CSS translateX(positive)
     is always physically rightward, so a signed value would drag backwards. */
  .faq-side[data-side="left"] {
    left: 0;
    transform: translate(
      calc(-1 * var(--se-x, 0%)),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }

  .faq-side[data-side="right"] {
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
    .faq-item,
    .faq-icon,
    .faq-a-wrap,
    .faq-icon[data-icon="plus"] .faq-plus-v {
      transition: none;
    }
    .faq-list[data-anim="ready"] .faq-item {
      opacity: 1;
      transform: none;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    .faq {
      padding-block: var(--sp-top-d) var(--sp-bot-d);
    }
    .faq-list {
      gap: 0.75rem;
    }
    .faq-side[data-slot="1"] {
      --se-w: var(--se1-w-d);
      --se-x: var(--se1-x-d);
      --se-y: var(--se1-y-d);
      --se-top: var(--se1-top-d);
      --se-pull: var(--se1-pull-d);
    }
    .faq-side[data-slot="2"] {
      --se-w: var(--se2-w-d);
      --se-x: var(--se2-x-d);
      --se-y: var(--se2-y-d);
      --se-top: var(--se2-top-d);
      --se-pull: var(--se2-pull-d);
    }
  }
`;
var K = Object.defineProperty, C = (e, t, a, i) => {
  for (var s = void 0, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = n(t, a, s) || s);
  return s && K(t, a, s), s;
};
const E = class E extends j {
  constructor() {
    super(...arguments), this._open = [], this._animState = "ready", this._seeded = !1, this._io = null, this._fallbackTimer = null, this._reveal = () => {
      var t;
      this._animState = "in", (t = this._io) == null || t.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null);
    };
  }
  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------
  /** Only rows carrying a question can render; an answer alone has no trigger. */
  _items() {
    var a;
    const t = (a = this.config) == null ? void 0 : a.items;
    return Array.isArray(t) ? t.filter(
      (i) => !!i && typeof i == "object" && !!this.localizedString(i.question)
    ) : [];
  }
  _openMode() {
    var t;
    return this._pickValue((t = this.config) == null ? void 0 : t.open_mode, "single");
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
        var a;
        (a = t[0]) != null && a.isIntersecting && this._reveal();
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
    var a, i;
    this._syncAnchor((a = this.config) == null ? void 0 : a.anchor_id, "faq"), !(this._seeded || this._items().length === 0) && (this._seeded = !0, ((i = this.config) == null ? void 0 : i.first_open) !== !1 && (this._open = [0]));
  }
  // ------------------------------------------------------------
  // Interaction
  // ------------------------------------------------------------
  _toggle(t) {
    if (this._open.includes(t)) {
      this._open = this._open.filter((i) => i !== t);
      return;
    }
    this._open = this._openMode() === "multi" ? [...this._open, t] : [t];
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  _hostStyle(t, a) {
    return [
      t.bg_color ? `--faq-bg:${t.bg_color}` : "",
      t.title_color ? `--faq-title:${t.title_color}` : "",
      t.subtitle_color ? `--faq-sub:${t.subtitle_color}` : "",
      t.card_bg ? `--faq-card-bg:${t.card_bg}` : "",
      t.question_color ? `--faq-q:${t.question_color}` : "",
      t.answer_color ? `--faq-a:${t.answer_color}` : "",
      t.border_color ? `--faq-border:${t.border_color}` : "",
      t.icon_color ? `--faq-icon:${t.icon_color}` : "",
      `--faq-radius:${this._num(t.card_radius, 14)}px`,
      ...a,
      ...H(
        t,
        (i, s) => this._pickValue(i, s)
      )
    ].filter(Boolean).join("; ");
  }
  _icon(t) {
    return u`<span class="faq-icon" data-icon=${t} aria-hidden="true">
      ${t === "plus" ? u`<svg viewBox="0 0 24 24">
            <path d="M5 12h14" />
            <path class="faq-plus-v" d="M12 5v14" />
          </svg>` : u`<svg viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>`}
    </span>`;
  }
  render() {
    const t = this.config || {}, a = {
      ...t,
      side_depth: t.side_depth ?? "behind",
      side2_depth: t.side2_depth ?? "behind"
    }, i = (o) => U(
      a,
      (h, m) => this._pickValue(h, m),
      (h, m) => this._num(h, m),
      o
    ), s = [i(1), i(2)].filter(
      (o) => !!o
    ), r = this._hostStyle(
      t,
      s.flatMap((o) => o.vars)
    ), n = s.map(
      (o) => u`<img
        class="faq-side"
        src=${o.image}
        alt=""
        aria-hidden="true"
        data-slot=${o.slot}
        data-side=${o.side}
        data-depth=${o.depth}
        decoding="async"
        loading="lazy"
      />`
    ), d = this._items();
    if (d.length === 0) {
      const o = this._lang() === "ar" ? "أضف سؤالًا واحدًا على الأقل لعرض هذا القسم." : "Add at least one row to display this section.";
      return u`<section class="faq" style=${r}>
        ${n}
        <p class="faq-empty">${o}</p>
      </section>`;
    }
    const l = this.localizedString(t.section_title), p = this.localizedString(t.section_subtitle), y = this._pickValue(t.icon_style, "chevron"), f = t.enable_entrance_anim !== !1 && !this._reduceMotion();
    return u`
      <section class="faq" style=${r}>
        ${n}
        ${l || p ? u`<header class="faq-header">
              ${l ? u`<h2 class="faq-title">${l}</h2>` : T}
              ${p ? u`<p class="faq-sub">${p}</p>` : T}
            </header>` : T}

        <div class="faq-list" data-anim=${f ? this._animState : "in"}>
          ${d.map((o, h) => {
      const m = this._open.includes(h), c = `faq-q-${h}`, v = `faq-a-${h}`;
      return u`<div
              class="faq-item"
              data-open=${m ? "true" : "false"}
              style=${`--i:${h}`}
            >
              <h3 class="faq-q-wrap">
                <button
                  class="faq-q"
                  id=${c}
                  type="button"
                  aria-expanded=${m ? "true" : "false"}
                  aria-controls=${v}
                  @click=${() => this._toggle(h)}
                >
                  <span class="faq-q-text"
                    >${this.localizedString(o.question)}</span
                  >
                  ${this._icon(y)}
                </button>
              </h3>
              <div class="faq-a-wrap" id=${v} role="region" aria-labelledby=${c}>
                <div class="faq-a">
                  <div class="faq-a-inner">
                    ${this.localizedString(o.answer)}
                  </div>
                </div>
              </div>
            </div>`;
    })}
        </div>
      </section>
    `;
  }
};
E.styles = G;
let _ = E;
C([
  V({ type: Object })
], _.prototype, "config");
C([
  M()
], _.prototype, "_open");
C([
  M()
], _.prototype, "_animState");
typeof _ < "u" && _.registerSallaComponent("salla-faq");
export {
  _ as default
};
