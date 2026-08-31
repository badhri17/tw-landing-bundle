import { LitElement as z, css as I, html as d, nothing as p } from "lit";
import { property as E, state as k } from "lit/decorators.js";
function M(o, e) {
  if (typeof o == "string") return o;
  if (!o || typeof o != "object") return "";
  const r = o[e] || o.ar || o.en || "";
  return typeof r == "string" ? r.trim() : "";
}
function $(o) {
  return o.replace(/[٠-٩]/g, (e) => String(e.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (e) => String(e.charCodeAt(0) - 1776));
}
class D extends z {
  constructor() {
    super(...arguments), this._anchorBase = "", this._anchorDeepLinked = !1;
  }
  /**
   * Twilight transform injects `Component.registerSallaComponent(...)`.
   * Statics inherit, so `this` is the concrete component. The polling
   * fallback handles preview contexts where `Salla` loads after the
   * component file executes.
   */
  static registerSallaComponent(e) {
    const r = String(e || "").trim(), t = r.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), i = t.includes("-") ? t : `salla-${t || "component"}`, s = () => `${i}-${Math.random().toString(36).substring(2, 8)}`, n = () => {
      var c;
      const l = (c = window.Salla) == null ? void 0 : c.bundles;
      return l && typeof l.registerComponent == "function" ? (l.registerComponent(r, {
        component: this,
        dynamicTagName: s()
      }), !0) : !1;
    };
    if (n()) return;
    const a = window.setInterval(() => {
      n() && window.clearInterval(a);
    }, 100);
    window.setTimeout(() => window.clearInterval(a), 5e3);
  }
  /** Resolved document language. */
  _lang() {
    return (document.documentElement.lang || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
  }
  /** Pull the store-language string out of a Salla multilanguage value. */
  localizedString(e) {
    return M(e, this._lang());
  }
  /** Dropdown-list values from settings may come as [{ label, value }]. */
  _pickValue(e, r) {
    if (typeof e == "string" && e) return e;
    if (Array.isArray(e) && e.length > 0) {
      const t = e[0];
      if (t && typeof t.value == "string" && t.value)
        return t.value;
    }
    return r;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(e) {
    return $(e);
  }
  /**
   * The inverse: render a number in the digits the store's language uses, so a
   * counter or a step badge matches the copy beside it. Latin digits outside
   * Arabic, Arabic-Indic inside it.
   */
  _localeNum(e) {
    return this._lang() !== "ar" ? String(e) : String(e).replace(
      /\d/g,
      (r) => String.fromCharCode(1632 + Number(r))
    );
  }
  /**
   * Normalise a merchant-typed anchor into an id. Deliberately permissive
   * about script — Arabic ids are valid HTML and resolve fine through
   * getElementById — so we only strip the leading `#`, collapse whitespace,
   * and drop the characters that would break a URL fragment or a selector.
   */
  _slugify(e, r) {
    var s;
    return (typeof e == "string" ? e : Array.isArray(e) ? String(((s = e[0]) == null ? void 0 : s.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || r;
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
  _syncAnchor(e, r, t = 24) {
    const i = this._slugify(e, r);
    if (!i || i === this._anchorBase) return;
    this._anchorBase = i;
    let s = i;
    for (let a = 2; ; a++) {
      const l = document.getElementById(s);
      if (!l || l === this) break;
      s = `${i}-${a}`;
    }
    if (this.id = s, this.style.scrollMarginTop = `${t}px`, this._anchorDeepLinked) return;
    let n = "";
    try {
      n = decodeURIComponent(location.hash.slice(1));
    } catch {
      n = location.hash.slice(1);
    }
    n && n === s && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(e, r) {
    if (!r.startsWith("#") || r === "#") return;
    let t = r.slice(1);
    try {
      t = decodeURIComponent(t);
    } catch {
    }
    const i = document.getElementById(t);
    if (!i) return;
    e.preventDefault();
    const s = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    i.scrollIntoView({
      block: "start",
      behavior: s ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${t}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(e, r) {
    if (typeof e == "number" && !Number.isNaN(e)) return e;
    if (typeof e == "string" && e.trim() !== "") {
      const t = Number($(e.trim()));
      if (!Number.isNaN(t)) return t;
    }
    if (Array.isArray(e) && e.length > 0) {
      const t = e[0];
      if ((t == null ? void 0 : t.value) !== void 0) return this._num(t.value, r);
    }
    return r;
  }
}
const f = {
  none: 0,
  xs: 12,
  sm: 24,
  md: 40,
  lg: 56,
  xl: 72
}, g = {
  none: 0,
  xs: 20,
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128
};
function N(o, e, r = "md", t = "md") {
  const i = e(o == null ? void 0 : o.space_top, r), s = e(o == null ? void 0 : o.space_bottom, t), n = f[i] ?? f.md, a = f[s] ?? f.md, l = g[i] ?? g.md, c = g[s] ?? g.md;
  return [
    `--sp-top-m:${n}px`,
    `--sp-bot-m:${a}px`,
    `--sp-top-d:${l}px`,
    `--sp-bot-d:${c}px`
  ];
}
const V = I`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    /* Width comes from the container, never from the contents — keeps a long
       label from widening the Salla component card. */
    min-width: 0;
    max-width: 100%;

    --m-bg: #ffffff;
    --m-card-bg: #f4f3f1;
    --m-number: #3d230e;
    --m-label: #6b7280;
    --m-border: rgba(20, 24, 31, 0.1);

    --m-gap: clamp(10px, 2.4vw, 16px);
    --m-pad-x: clamp(1rem, 4vw, 2rem);
    --m-pad-y: clamp(1.25rem, 4vw, 2.5rem);
    --m-radius: 18px;
    --m-cols-mobile: 3;
    --m-cols-desktop: 3;
    /* Scaled by the number-size setting. */
    --m-scale: 1;
    --m-ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .m-section {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--m-bg);
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts. */
    padding-inline: var(--m-pad-x);
    padding-block: var(--sp-top-m) var(--sp-bot-m);
  }

  /* ============================================================
     HEADER (optional)
     ============================================================ */
  .m-header {
    max-width: 640px;
    margin: 0 auto clamp(1.1rem, 3vw, 1.75rem);
    text-align: center;
  }
  .m-title {
    margin: 0;
    color: var(--m-number);
    font-size: clamp(1.55rem, 4.5vw, 2rem);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }
  .m-subtitle {
    margin: 0.55rem 0 0;
    color: var(--m-label);
    font-size: clamp(0.9rem, 1.6vw, 1.02rem);
    line-height: 1.7;
  }

  /* ============================================================
     GRID
     ============================================================ */
  .m-grid {
    display: grid;
    grid-template-columns: repeat(var(--m-cols-mobile), minmax(0, 1fr));
    gap: var(--m-gap);
    align-items: stretch;
  }

  .m-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    min-width: 0;
    text-align: center;
    padding: clamp(0.85rem, 2.6vw, 1.35rem) clamp(0.5rem, 2vw, 1rem);
    border-radius: var(--m-radius);
    border: 1px solid transparent;
    background: transparent;
    /* Sizing context for the number: the cqw unit below is 1% of THIS card's
       content box, which is what decides whether a long figure fits. */
    container-type: inline-size;
  }

  .m-value {
    color: var(--m-number);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    /* Fixed-width digits so the counter doesn't jitter while it runs. */
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1;
    /* A number must never break mid-digit ("9,7" / "50"). */
    white-space: nowrap;

    /* Preferred size — also the fallback wherever container queries are
       unsupported and the min() below is dropped as invalid. */
    font-size: calc(clamp(1.25rem, 5.2vw, 2.05rem) * var(--m-scale));
    /* …capped at whatever actually fits on one line. --m-chars is the rendered
       length; 0.62em is the average advance of a bold tabular digit. */
    font-size: min(
      calc(clamp(1.25rem, 5.2vw, 2.05rem) * var(--m-scale)),
      calc(100cqw / (var(--m-chars, 4) * 0.62))
    );
  }

  .m-label {
    color: var(--m-label);
    font-size: calc(clamp(0.72rem, 2.5vw, 0.9rem) * var(--m-scale));
    font-weight: 600;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  /* ============================================================
     CARD STYLES
     ============================================================ */
  .m-section[data-style="soft"] .m-card {
    background: var(--m-card-bg);
  }

  .m-section[data-style="outline"] .m-card {
    border-color: var(--m-border);
  }

  /* Hairline cells: the grid paints the lines and 1px gaps reveal them, so the
     separators stay correct however many rows the cards wrap onto. */
  .m-section[data-style="divided"] .m-grid {
    gap: 1px;
    background: var(--m-border);
    border-radius: var(--m-radius);
    overflow: hidden;
  }
  .m-section[data-style="divided"] .m-card {
    background: var(--m-bg);
    border-radius: 0;
  }

  .m-section[data-style="plain"] .m-card {
    padding-inline: 0.25rem;
  }

  /* ============================================================
     MOTION — entrance rise, staggered per card
     ============================================================ */
  .m-card {
    transition:
      opacity 0.5s var(--m-ease),
      transform 0.5s var(--m-ease);
    transition-delay: calc(var(--i, 0) * 70ms);
  }
  .m-section[data-anim="ready"] .m-card {
    opacity: 0;
    transform: translateY(10px);
  }
  .m-section[data-anim="in"] .m-card {
    opacity: 1;
    transform: none;
  }

  .m-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--m-label);
    font-size: 0.92rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .m-card {
      transition: none;
    }
    .m-section[data-anim="ready"] .m-card {
      opacity: 1;
      transform: none;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    .m-section {
      padding-block: var(--sp-top-d) var(--sp-bot-d);
    }
    :host {
      --m-gap: clamp(14px, 1.6vw, 22px);
    }
    .m-grid {
      grid-template-columns: repeat(var(--m-cols-desktop), minmax(0, 1fr));
    }
  }
`;
var B = Object.defineProperty, v = (o, e, r, t) => {
  for (var i = void 0, s = o.length - 1, n; s >= 0; s--)
    (n = o[s]) && (i = n(e, r, i) || i);
  return i && B(e, r, i), i;
};
const S = 120, L = {
  fast: 1e3,
  normal: 1800,
  slow: 2600
}, O = {
  sm: 0.85,
  md: 1,
  lg: 1.2
}, R = "٠١٢٣٤٥٦٧٨٩", w = class w extends D {
  constructor() {
    super(...arguments), this._animState = "ready", this._elapsed = 0, this._raf = null, this._io = null, this._fallbackTimer = null, this._started = !1, this._inView = !1, this._sig = "", this._reveal = () => {
      var e;
      this._inView = !0, this._animState = "in", (e = this._io) == null || e.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null), this._startCount();
    };
  }
  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------
  /** Keep metrics that have something to show. */
  _items() {
    var r;
    const e = (r = this.config) == null ? void 0 : r.items;
    return Array.isArray(e) ? e.filter((t) => !t || typeof t != "object" ? !1 : !!((t.value === void 0 || t.value === null ? "" : String(t.value).trim()) || this.localizedString(t.label))) : [];
  }
  /**
   * Split a merchant-typed value into a number we can animate plus the raw
   * text we fall back to. Accepts Arabic-Indic digits and either separator
   * style, so "٩٬٧٥٠" and "9,750" both animate.
   */
  _parse(e) {
    var a;
    const r = e.value === void 0 || e.value === null ? "" : String(e.value).trim(), t = this._toLatinDigits(r).replace(/[٫]/g, ".").replace(/[٬,\s_]/g, ""), i = /^-?\d+(\.\d+)?$/.test(t), s = i ? Number(t) : null, n = i ? ((a = t.split(".")[1]) == null ? void 0 : a.length) ?? 0 : 0;
    return {
      raw: r,
      target: s,
      decimals: n,
      prefix: typeof e.prefix == "string" ? e.prefix.trim() : "",
      suffix: typeof e.suffix == "string" ? e.suffix.trim() : "",
      label: this.localizedString(e.label)
    };
  }
  /** Render a number the way the merchant asked for it. */
  _format(e, r, t, i) {
    const s = e < 0, n = Math.abs(e).toFixed(r);
    let [a, l] = n.split(".");
    t && (a = a.replace(/\B(?=(\d{3})+(?!\d))/g, i === "arabic" ? "٬" : ","));
    let c = l ? `${a}${i === "arabic" ? "٫" : "."}${l}` : a;
    return s && (c = `-${c}`), i === "arabic" && (c = c.replace(/\d/g, (u) => R[Number(u)])), c;
  }
  _speed() {
    var e;
    return L[this._pickValue((e = this.config) == null ? void 0 : e.count_speed, "normal")];
  }
  /** 0 → 1 for a single counter, offset by its position in the row. */
  _progress(e) {
    const r = this._speed(), t = (this._elapsed - e * S) / r;
    return t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3);
  }
  _reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  // ------------------------------------------------------------
  // Count-up animation
  // ------------------------------------------------------------
  _startCount() {
    if (this._started) return;
    this._started = !0;
    const e = this._items(), r = this._speed() + Math.max(0, e.length - 1) * S, t = performance.now(), i = (s) => {
      const n = s - t;
      if (n >= r) {
        this._elapsed = r, this._raf = null;
        return;
      }
      this._elapsed = n, this._raf = requestAnimationFrame(i);
    };
    this._raf = requestAnimationFrame(i);
  }
  _stopCount() {
    this._raf !== null && cancelAnimationFrame(this._raf), this._raf = null;
  }
  /** Re-run the counters — used when the merchant edits values in the panel. */
  _resetCount() {
    this._stopCount(), this._started = !1, this._elapsed = 0, this._inView && this._startCount();
  }
  connectedCallback() {
    if (super.connectedCallback(), !("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }
    this._io = new IntersectionObserver(
      (e) => {
        var r;
        (r = e[0]) != null && r.isIntersecting && this._reveal();
      },
      { threshold: 0.25 }
    ), this._io.observe(this), this._fallbackTimer = window.setTimeout(() => {
      if (this._fallbackTimer = null, this._inView) return;
      const e = this.getBoundingClientRect(), r = e.top < window.innerHeight && e.bottom > 0;
      (e.height === 0 || r) && this._reveal();
    }, 3e3);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), this._stopCount(), (e = this._io) == null || e.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null);
  }
  updated() {
    var r;
    this._syncAnchor((r = this.config) == null ? void 0 : r.anchor_id, "metrics");
    const e = this._items().map((t) => `${t.value ?? ""}|${t.prefix ?? ""}|${t.suffix ?? ""}`).join("~");
    e !== this._sig && (this._sig = e, this._resetCount());
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  _hostStyle(e, r, t) {
    const i = this._num(e.card_radius, 18), s = this._pickValue(e.number_size, "md");
    return [
      e.bg_color ? `--m-bg:${e.bg_color}` : "",
      e.card_bg ? `--m-card-bg:${e.card_bg}` : "",
      e.number_color ? `--m-number:${e.number_color}` : "",
      e.label_color ? `--m-label:${e.label_color}` : "",
      e.border_color ? `--m-border:${e.border_color}` : "",
      `--m-radius:${i}px`,
      `--m-scale:${O[s] ?? 1}`,
      `--m-cols-mobile:${r}`,
      `--m-cols-desktop:${t}`,
      ...N(
        e,
        (n, a) => this._pickValue(n, a),
        "sm",
        "sm"
      )
    ].filter(Boolean).join("; ");
  }
  /**
   * Length of the longest figure once it has finished counting. Every number
   * is sized off this one so the row stays visually uniform — and it is the
   * final length, not the current one, so the type doesn't shrink mid-count.
   */
  _widest(e, r, t) {
    let i = 1;
    for (const s of e) {
      const n = this._parse(s), a = n.target === null ? n.raw : this._format(n.target, n.decimals, r, t);
      i = Math.max(i, `${n.prefix}${a}${n.suffix}`.length);
    }
    return i;
  }
  /** Mobile count is primary; desktop "inherit" reuses it. */
  _columns(e) {
    const r = this._num(this._pickValue(e.columns_mobile, "3"), 3), t = this._pickValue(e.columns_desktop, "inherit"), i = t === "inherit" ? r : this._num(t, r);
    return {
      mobile: Math.max(1, Math.min(3, r)),
      desktop: Math.max(1, Math.min(6, i))
    };
  }
  render() {
    const e = this.config || {}, r = this._items(), t = this._pickValue(e.card_style, "soft"), i = this._pickValue(e.digits, "latin"), s = e.thousands_separator !== !1, n = this._columns(e), a = this._hostStyle(e, n.mobile, n.desktop), l = e.enable_count !== !1 && !this._reduceMotion(), c = e.enable_entrance_anim !== !1 && !this._reduceMotion(), u = this.localizedString(e.section_title), _ = this.localizedString(e.section_subtitle);
    if (r.length === 0)
      return d`<section class="m-section" style=${a}>
        <p class="m-empty">
          ${this._lang() === "ar" ? "أضف رقمًا واحدًا على الأقل لعرض هذا القسم." : "Add at least one metric to display this section."}
        </p>
      </section>`;
    const C = u || _ ? d`<header class="m-header">
            ${u ? d`<h2 class="m-title">${u}</h2>` : p}
            ${_ ? d`<p class="m-subtitle">${_}</p>` : p}
          </header>` : p;
    return d`
      <section
        class="m-section"
        style=${a}
        data-style=${t}
        data-anim=${c ? this._animState : "in"}
      >
        ${C}
        <div class="m-grid" style="--m-chars:${this._widest(r, s, i)}">
          ${r.map((A, y) => {
      const m = this._parse(A);
      let b;
      if (m.target === null)
        b = m.raw;
      else {
        const T = l ? m.target * this._progress(y) : m.target;
        b = this._format(T, m.decimals, s, i);
      }
      const x = `${m.prefix}${b}${m.suffix}`;
      return d`<div class="m-card" style="--i:${y}">
              ${x ? d`<div class="m-value" dir="auto">${x}</div>` : p}
              ${m.label ? d`<div class="m-label">${m.label}</div>` : p}
            </div>`;
    })}
        </div>
      </section>
    `;
  }
};
w.styles = V;
let h = w;
v([
  E({ type: Object })
], h.prototype, "config");
v([
  k()
], h.prototype, "_animState");
v([
  k()
], h.prototype, "_elapsed");
typeof h < "u" && h.registerSallaComponent("salla-metrics");
export {
  h as default
};
