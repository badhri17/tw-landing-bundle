import { LitElement as S, css as v, html as m, nothing as p } from "lit";
import { property as z, state as k } from "lit/decorators.js";
function A(s, t) {
  if (typeof s == "string") return s;
  if (!s || typeof s != "object") return "";
  const i = s[t] || s.ar || s.en || "";
  return typeof i == "string" ? i.trim() : "";
}
function g(s) {
  return s.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class C extends S {
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
    const i = String(t || "").trim(), e = i.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), n = e.includes("-") ? e : `salla-${e || "component"}`, r = () => `${n}-${Math.random().toString(36).substring(2, 8)}`, o = () => {
      var c;
      const l = (c = window.Salla) == null ? void 0 : c.bundles;
      return l && typeof l.registerComponent == "function" ? (l.registerComponent(i, {
        component: this,
        dynamicTagName: r()
      }), !0) : !1;
    };
    if (o()) return;
    const a = window.setInterval(() => {
      o() && window.clearInterval(a);
    }, 100);
    window.setTimeout(() => window.clearInterval(a), 5e3);
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
    return g(t);
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
  _syncAnchor(t, i, e = 24) {
    const n = this._slugify(t, i);
    if (!n || n === this._anchorBase) return;
    this._anchorBase = n;
    let r = n;
    for (let a = 2; ; a++) {
      const l = document.getElementById(r);
      if (!l || l === this) break;
      r = `${n}-${a}`;
    }
    if (this.id = r, this.style.scrollMarginTop = `${e}px`, this._anchorDeepLinked) return;
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
    let e = i.slice(1);
    try {
      e = decodeURIComponent(e);
    } catch {
    }
    const n = document.getElementById(e);
    if (!n) return;
    t.preventDefault();
    const r = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    n.scrollIntoView({
      block: "start",
      behavior: r ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${e}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, i) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const e = Number(g(t.trim()));
      if (!Number.isNaN(e)) return e;
    }
    if (Array.isArray(t) && t.length > 0) {
      const e = t[0];
      if ((e == null ? void 0 : e.value) !== void 0) return this._num(e.value, i);
    }
    return i;
  }
}
const u = {
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
function E(s, t, i = "md", e = "md") {
  const n = t(s == null ? void 0 : s.space_top, i), r = t(s == null ? void 0 : s.space_bottom, e), o = u[n] ?? u.md, a = u[r] ?? u.md, l = b[n] ?? b.md, c = b[r] ?? b.md;
  return [
    `--sp-top-m:${o}px`,
    `--sp-bot-m:${a}px`,
    `--sp-top-d:${l}px`,
    `--sp-bot-d:${c}px`
  ];
}
const I = v`
  :host {
    display: block;
    direction: inherit;
    font-family: inherit;
    min-width: 0;
    max-width: 100%;

    --ib-bg: #ffffff;
    --ib-title: #14181f;
    --ib-subtitle: #5b6472;
    --ib-item-title: #14181f;
    --ib-size-m: 164px;
    --ib-size-d: 220px;
    --ib-gap-m: 4px;
    --ib-gap-d: 8px;
    --ib-cols-m: 3;
    --ib-cols-d: 4;
    --ib-pad-x: clamp(1rem, 4vw, 2.5rem);
    --ib-ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .ib-section {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding-inline: var(--ib-pad-x);
    padding-block: var(--sp-top-m) var(--sp-bot-m);
    background: var(--ib-bg);
    --ib-size: var(--ib-size-m);
    --ib-gap: var(--ib-gap-m);
  }

  .ib-header {
    position: relative;
    z-index: 1;
    max-width: 680px;
    margin: 0 auto clamp(1.65rem, 6vw, 2.75rem);
    text-align: center;
  }

  .ib-title {
    margin: 0;
    color: var(--ib-title);
    font-size: clamp(1.65rem, 6vw, 2.25rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .ib-subtitle {
    margin: 0.6rem 0 0;
    color: var(--ib-subtitle);
    font-size: clamp(0.92rem, 2.8vw, 1.05rem);
    line-height: 1.75;
    white-space: pre-line;
    text-wrap: pretty;
  }

  .ib-grid {
    display: grid;
    grid-template-columns: repeat(var(--ib-cols-m), minmax(0, 1fr));
    align-items: start;
    justify-items: center;
    gap: var(--ib-gap);
    width: 100%;
    max-width: 960px;
    margin-inline: auto;
  }

  .ib-grid[data-layout="pyramid"] {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 680px;
  }

  .ib-grid[data-layout="pyramid"] .ib-item:first-child {
    grid-column: 1 / -1;
  }

  .ib-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0.7rem;
    width: 100%;
    min-width: 0;
    margin: 0;
    text-align: center;
    transition:
      opacity 0.55s var(--ib-ease),
      transform 0.55s var(--ib-ease);
    transition-delay: calc(var(--i, 0) * 75ms);
  }

  .ib-image {
    display: block;
    width: min(var(--ib-size), 100%);
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }

  .ib-item-title {
    max-width: var(--ib-size);
    color: var(--ib-item-title);
    font-size: clamp(0.82rem, 2.9vw, 1rem);
    font-weight: 700;
    line-height: 1.55;
    text-wrap: balance;
  }

  .ib-section[data-anim="ready"] .ib-item {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }

  .ib-section[data-anim="in"] .ib-item {
    opacity: 1;
    transform: none;
  }

  .ib-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    color: var(--ib-subtitle);
    font-size: 0.92rem;
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .ib-item {
      transition: none;
    }

    .ib-section[data-anim="ready"] .ib-item {
      opacity: 1;
      transform: none;
    }
  }

  @media (min-width: 768px) {
    .ib-section {
      padding-block: var(--sp-top-d) var(--sp-bot-d);
      --ib-size: var(--ib-size-d);
      --ib-gap: var(--ib-gap-d);
    }

    .ib-grid:not([data-layout="pyramid"]) {
      grid-template-columns: repeat(var(--ib-cols-d), minmax(0, 1fr));
    }
  }
`;
var M = Object.defineProperty, w = (s, t, i, e) => {
  for (var n = void 0, r = s.length - 1, o; r >= 0; r--)
    (o = s[r]) && (n = o(t, i, n) || n);
  return n && M(t, i, n), n;
};
const f = {
  sm: 100,
  md: 132,
  lg: 164
}, _ = {
  sm: 140,
  md: 180,
  lg: 220
}, y = {
  compact: 4,
  normal: 18,
  spacious: 32
}, x = {
  compact: 8,
  normal: 28,
  spacious: 44
}, h = class h extends C {
  constructor() {
    super(...arguments), this._animState = "ready", this._io = null;
  }
  _items() {
    var i;
    const t = (i = this.config) == null ? void 0 : i.items;
    return Array.isArray(t) ? t.filter(
      (e) => !!e && typeof e == "object" && !!(e.image || "").trim()
    ) : [];
  }
  _reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  connectedCallback() {
    if (super.connectedCallback(), !("IntersectionObserver" in window) || this._reduceMotion()) {
      this._animState = "in";
      return;
    }
    this._io = new IntersectionObserver(
      (t) => {
        var i, e;
        (i = t[0]) != null && i.isIntersecting && (this._animState = "in", (e = this._io) == null || e.disconnect(), this._io = null);
      },
      { threshold: 0.15 }
    ), this._io.observe(this);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._io) == null || t.disconnect(), this._io = null;
  }
  updated() {
    var t;
    this._syncAnchor((t = this.config) == null ? void 0 : t.anchor_id, "image-badges");
  }
  _layout(t) {
    return this._pickValue(t.layout, "pyramid");
  }
  _columns(t) {
    const i = this._num(
      this._pickValue(t.columns_mobile, "3"),
      3
    ), e = this._pickValue(
      t.columns_desktop,
      "inherit"
    ), n = e === "inherit" ? i : this._num(e, i);
    return {
      mobile: Math.max(2, Math.min(4, i)),
      desktop: Math.max(3, Math.min(6, n))
    };
  }
  _sizes(t) {
    const i = this._pickValue(t.image_size_mobile, "lg"), e = this._pickValue(
      t.image_size_desktop,
      "inherit"
    ), n = e === "inherit" ? i : e;
    return {
      mobile: f[i] ?? f.md,
      desktop: _[n] ?? _.md
    };
  }
  _hostStyle(t) {
    const i = this._columns(t), e = this._sizes(t), n = this._pickValue(t.gap, "compact");
    return [
      t.bg_color ? `--ib-bg:${t.bg_color}` : "",
      t.title_color ? `--ib-title:${t.title_color}` : "",
      t.subtitle_color ? `--ib-subtitle:${t.subtitle_color}` : "",
      t.item_title_color ? `--ib-item-title:${t.item_title_color}` : "",
      `--ib-cols-m:${i.mobile}`,
      `--ib-cols-d:${i.desktop}`,
      `--ib-size-m:${e.mobile}px`,
      `--ib-size-d:${e.desktop}px`,
      `--ib-gap-m:${y[n] ?? y.normal}px`,
      `--ib-gap-d:${x[n] ?? x.normal}px`,
      ...E(
        t,
        (r, o) => this._pickValue(r, o)
      )
    ].filter(Boolean).join("; ");
  }
  render() {
    const t = this.config || {}, i = this._items(), e = this.localizedString(t.section_title), n = this.localizedString(t.section_subtitle), r = t.enable_entrance_anim !== !1 && !this._reduceMotion(), o = this._hostStyle(t);
    return i.length === 0 ? m`<section class="ib-section" style=${o}>
        <p class="ib-empty">
          ${this._lang() === "ar" ? "أضف صورة واحدة على الأقل لعرض الشارات." : "Add at least one image to display the badges."}
        </p>
      </section>` : m`
      <section
        class="ib-section"
        style=${o}
        data-anim=${r ? this._animState : "in"}
      >
        ${e || n ? m`<header class="ib-header">
                ${e ? m`<h2 class="ib-title">${e}</h2>` : p}
                ${n ? m`<p class="ib-subtitle">${n}</p>` : p}
              </header>` : p}

        <div class="ib-grid" data-layout=${this._layout(t)}>
          ${i.map((a, l) => {
      const c = this.localizedString(a.title), $ = this.localizedString(a.image_alt) || c;
      return m`<figure class="ib-item" style=${`--i:${l}`}>
              <img
                class="ib-image"
                src=${a.image || ""}
                alt=${$}
                loading="lazy"
                decoding="async"
              />
              ${c ? m`<figcaption class="ib-item-title">
                      ${c}
                    </figcaption>` : p}
            </figure>`;
    })}
        </div>
      </section>
    `;
  }
};
h.styles = I;
let d = h;
w([
  z({ type: Object })
], d.prototype, "config");
w([
  k()
], d.prototype, "_animState");
typeof d < "u" && d.registerSallaComponent("salla-image-badges");
export {
  d as default
};
