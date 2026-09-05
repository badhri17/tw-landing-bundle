import { LitElement as D, css as T, nothing as s, html as c } from "lit";
import { property as A } from "lit/decorators.js";
import { ifDefined as w } from "lit/directives/if-defined.js";
function P(n, t) {
  if (typeof n == "string") return n;
  if (!n || typeof n != "object") return "";
  const i = n[t] || n.ar || n.en || "";
  return typeof i == "string" ? i.trim() : "";
}
function x(n) {
  return n.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class I extends D {
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
    const i = String(t || "").trim(), e = i.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), a = e.includes("-") ? e : `salla-${e || "component"}`, r = () => `${a}-${Math.random().toString(36).substring(2, 8)}`, o = () => {
      var p;
      const d = (p = window.Salla) == null ? void 0 : p.bundles;
      return d && typeof d.registerComponent == "function" ? (d.registerComponent(i, {
        component: this,
        dynamicTagName: r()
      }), !0) : !1;
    };
    if (o()) return;
    const h = window.setInterval(() => {
      o() && window.clearInterval(h);
    }, 100);
    window.setTimeout(() => window.clearInterval(h), 5e3);
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
    return x(t);
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
    const a = this._slugify(t, i);
    if (!a || a === this._anchorBase) return;
    this._anchorBase = a;
    let r = a;
    for (let h = 2; ; h++) {
      const d = document.getElementById(r);
      if (!d || d === this) break;
      r = `${a}-${h}`;
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
    const a = document.getElementById(e);
    if (!a) return;
    t.preventDefault();
    const r = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    a.scrollIntoView({
      block: "start",
      behavior: r ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${e}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, i) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const e = Number(x(t.trim()));
      if (!Number.isNaN(e)) return e;
    }
    if (Array.isArray(t) && t.length > 0) {
      const e = t[0];
      if ((e == null ? void 0 : e.value) !== void 0) return this._num(e.value, i);
    }
    return i;
  }
}
const L = T`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    font-family: inherit;
    direction: inherit;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .section {
    --fbc-bg: #f6f4f1;
    --fbc-text: #21150d;
    --fbc-button-bg: #3d230e;
    --fbc-button-text: #ffffff;
    --fbc-overlay: 0.4;
    --fbc-height-mobile: 320px;
    --fbc-height-desktop: 420px;
    --fbc-image-fit: contain;
    --fbc-image-position: center;
    --fbc-radius: 24px;
    --fbc-content-pad: clamp(1.8rem, 7vw, 3.75rem);
    --fbc-gap: 1rem;
    --fbc-max: 1280px;

    /* The band is the section itself: full-bleed, no outer gutter, and it owns
       the background colour so the fill reaches both viewport edges. Anything
       that needs to stay readable caps its own width instead (see .frame's
       "narrow" variant and .content). */
    width: 100%;
    background: var(--fbc-bg);
    color: var(--fbc-text);
  }

  .section[data-spacing="compact"] {
    --fbc-content-pad: clamp(1.25rem, 4vw, 2rem);
    --fbc-gap: 0.7rem;
  }

  .section[data-spacing="comfortable"] {
    --fbc-content-pad: clamp(1.8rem, 7vw, 3.75rem);
    --fbc-gap: 1rem;
  }

  .section[data-spacing="airy"] {
    --fbc-content-pad: clamp(2.5rem, 9vw, 5.5rem);
    --fbc-gap: 1.35rem;
  }

  .section[data-radius="none"] { --fbc-radius: 0px; }
  .section[data-radius="soft"] { --fbc-radius: 14px; }
  .section[data-radius="rounded"] { --fbc-radius: 26px; }

  .frame {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100%;
    border-radius: var(--fbc-radius);
    color: inherit;
  }

  /* image_full_width off: the image is held to the copy's max-width and the
     section's background fills the rest of the band. In the overlay layout the
     whole frame narrows (the image IS the frame's backdrop there); in the
     separate layout only .media does, so the copy below stays where it was. */
  .frame[data-media="narrow"] {
    width: min(100%, var(--fbc-max));
    margin-inline: auto;
  }

  .frame[data-layout="separate"][data-media="narrow"] {
    width: 100%;
  }

  .frame[data-layout="separate"][data-media="narrow"] .media {
    width: min(100%, var(--fbc-max));
    margin-inline: auto;
  }

  .media {
    overflow: hidden;
    background: var(--fbc-bg);
  }

  .media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: var(--fbc-image-fit);
    object-position: var(--fbc-image-position);
  }

  .frame[data-layout="separate"] .media {
    height: var(--fbc-height-mobile);
  }

  .frame[data-layout="overlay"] {
    min-height: var(--fbc-height-mobile);
    display: grid;
  }

  .frame[data-layout="overlay"] .media,
  .shade,
  .overlay-content {
    grid-area: 1 / 1;
  }

  .frame[data-layout="overlay"] .media {
    position: absolute;
    z-index: -2;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .shade {
    position: absolute;
    z-index: -1;
    inset: 0;
    background: rgba(0, 0, 0, var(--fbc-overlay));
    pointer-events: none;
  }

  /* The frame is edge to edge now, so the copy caps itself — otherwise a line of
     text would run the full width of a wide monitor. */
  .content {
    min-width: 0;
    width: min(100%, var(--fbc-max));
    margin-inline: auto;
    padding: var(--fbc-content-pad);
  }

  /* Copy sitting UNDER an image reads as one unit with it, so it gets no top
     padding — the tier only pads the sides and the bottom there. Gated on
     data-has-image because without an image .content is the whole section, and
     zero top padding would butt the title against the section's top edge.
     The overlay layout keeps its padding on all four sides: there the copy sits
     ON the image and the padding is what holds it off the frame's edges. */
  .frame[data-layout="separate"][data-has-image="on"] .content {
    padding-top: 0;
  }

  .overlay-content {
    min-height: var(--fbc-height-mobile);
    display: flex;
    flex-direction: column;
  }

  .overlay-content[data-vertical="top"] { justify-content: flex-start; }
  .overlay-content[data-vertical="center"] { justify-content: center; }
  .overlay-content[data-vertical="bottom"] { justify-content: flex-end; }

  .copy {
    width: min(100%, 720px);
    display: flex;
    flex-direction: column;
    gap: var(--fbc-gap);
  }

  .content[data-align="right"] .copy {
    margin-inline-end: auto;
    align-items: flex-start;
    text-align: right;
  }

  .content[data-align="center"] .copy {
    margin-inline: auto;
    align-items: center;
    text-align: center;
  }

  .content[data-align="left"] .copy {
    margin-inline-start: auto;
    align-items: flex-end;
    text-align: left;
  }

  .title {
    margin: 0;
    color: inherit;
    font-size: clamp(1.85rem, 5.5vw, 3.15rem);
    font-weight: 850;
    line-height: 1.18;
    letter-spacing: -0.025em;
    text-wrap: balance;
  }

  .description,
  .details {
    max-width: 66ch;
    margin: 0;
    color: inherit;
    white-space: pre-line;
    text-wrap: pretty;
  }

  .description {
    font-size: clamp(1rem, 2.4vw, 1.18rem);
    line-height: 1.8;
    opacity: 0.88;
  }

  .details {
    font-size: clamp(0.88rem, 2vw, 1rem);
    line-height: 1.75;
    opacity: 0.72;
  }

  .prices {
    display: inline-flex;
    direction: rtl;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.75rem;
    margin-top: 0.15rem;
  }

  .current-price {
    font-size: clamp(1.05rem, 2.7vw, 1.4rem);
    font-weight: 850;
  }

  .old-price {
    font-size: 0.92rem;
    opacity: 0.52;
    text-decoration: line-through;
    text-decoration-thickness: 1px;
  }

  .cta {
    min-width: 102px;
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.25rem;
    padding: 0.45rem 1.35rem;
    border: 1px solid var(--fbc-button-bg);
    border-radius: 6px;
    background: var(--fbc-button-bg);
    color: var(--fbc-button-text);
    font-size: 0.86rem;
    font-weight: 800;
    line-height: 1;
    text-decoration: none;
    transition:
      transform 0.24s ease,
      box-shadow 0.24s ease,
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .cta[data-style="outline"] {
    background: transparent;
    color: var(--fbc-button-bg);
  }

  .frame[data-layout="overlay"] .cta[data-style="outline"] {
    border-color: currentColor;
    color: inherit;
  }

  .cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px color-mix(in srgb, var(--fbc-button-bg) 24%, transparent);
  }

  .cta:focus-visible {
    outline: 3px solid color-mix(in srgb, currentColor 42%, transparent);
    outline-offset: 4px;
  }

  @media (min-width: 768px) {
    .frame[data-layout="separate"] .media {
      height: var(--fbc-height-desktop);
    }

    .frame[data-layout="overlay"],
    .overlay-content {
      min-height: var(--fbc-height-desktop);
    }
  }

  @media (max-width: 520px) {
    .section[data-radius="rounded"] { --fbc-radius: 20px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta { transition: none; }
  }
`;
var N = Object.defineProperty, V = (n, t, i, e) => {
  for (var a = void 0, r = n.length - 1, o; r >= 0; r--)
    (o = n[r]) && (a = o(t, i, a) || a);
  return a && N(t, i, a), a;
};
const E = {
  compact: "220px",
  medium: "320px",
  large: "440px",
  screen: "75svh"
}, j = {
  compact: "280px",
  medium: "420px",
  large: "560px",
  screen: "75svh"
}, b = class b extends I {
  updated() {
    var t;
    this._syncAnchor((t = this.config) == null ? void 0 : t.anchor_id, "flexible-banner-content");
  }
  _renderContent(t) {
    const i = !!t.currentPrice || !!t.oldPrice, e = !!t.ctaLabel && !!t.ctaUrl;
    return c`
      <div class="copy">
        ${t.localizedTitle ? c`<h2 class="title">${t.localizedTitle}</h2>` : s}
        ${t.localizedDescription ? c`<p class="description">${t.localizedDescription}</p>` : s}
        ${t.localizedDetails ? c`<p class="details">${t.localizedDetails}</p>` : s}
        ${i ? c`
              <div class="prices" aria-label="السعر">
                ${t.currentPrice ? c`<span class="current-price">${t.currentPrice}</span>` : s}
                ${t.oldPrice ? c`<span class="old-price">${t.oldPrice}</span>` : s}
              </div>
            ` : s}
        ${e ? c`
              <a
                class="cta"
                data-style=${t.ctaStyle}
                href=${t.ctaUrl}
                target=${w(t.ctaUrl.startsWith("#") ? void 0 : "_blank")}
                rel=${w(
      t.ctaUrl.startsWith("#") ? void 0 : "noopener noreferrer"
    )}
                @click=${(a) => this._scrollToAnchor(a, t.ctaUrl)}
              >${t.ctaLabel}</a>
            ` : s}
      </div>
    `;
  }
  render() {
    const t = this.config || {}, i = this._pickValue(
      t.layout_mode,
      "separate"
    ), e = this._pickValue(t.content_align, "center"), a = this._pickValue(
      t.overlay_vertical,
      "center"
    ), r = this._pickValue(t.image_fit, "contain"), o = this._pickValue(
      t.image_position,
      "center"
    ), h = this._pickValue(
      t.height_mobile,
      "medium"
    ), d = this._pickValue(
      t.height_desktop,
      "medium"
    ), p = t.image_full_width !== !1, _ = this._pickValue(
      t.content_spacing,
      "comfortable"
    ), v = this._pickValue(
      t.corner_radius,
      "none"
    ), $ = this._pickValue(
      t.cta_style,
      "filled"
    ), f = typeof t.image == "string" ? t.image.trim() : "", g = i === "overlay" && f ? "overlay" : "separate", y = this.localizedString(t.image_alt), l = {
      localizedTitle: this.localizedString(t.title),
      localizedDescription: this.localizedString(t.description),
      localizedDetails: this.localizedString(t.details),
      currentPrice: this.localizedString(t.current_price),
      oldPrice: this.localizedString(t.old_price),
      ctaLabel: this.localizedString(t.cta_label),
      ctaUrl: typeof t.cta_url == "string" ? t.cta_url.trim() : "",
      ctaStyle: $
    }, u = !!(l.localizedTitle || l.localizedDescription || l.localizedDetails || l.currentPrice || l.oldPrice || l.ctaLabel && l.ctaUrl);
    if (!f && !u) return s;
    const k = this._num(t.overlay_darkness, 40), z = Math.min(90, Math.max(0, k)) / 100, S = g === "overlay" ? t.overlay_text_color || "#ffffff" : t.separate_text_color || "#21150d", C = [
      `--fbc-bg:${t.background_color || "#f6f4f1"}`,
      `--fbc-text:${S}`,
      `--fbc-button-bg:${t.button_background || "#3D230E"}`,
      `--fbc-button-text:${t.button_text_color || "#ffffff"}`,
      `--fbc-overlay:${z}`,
      `--fbc-height-mobile:${E[h]}`,
      `--fbc-height-desktop:${j[d]}`,
      `--fbc-image-fit:${r}`,
      `--fbc-image-position:${o}`
    ].join(";");
    return c`
      <section
        class="section"
        style=${C}
        data-spacing=${_}
        data-radius=${v}
        aria-label=${l.localizedTitle || y || "بنر ومحتوى مرن"}
      >
        <div
          class="frame"
          data-layout=${g}
          data-media=${p ? "full" : "narrow"}
          data-has-image=${f ? "on" : "off"}
          data-has-content=${u ? "on" : "off"}
        >
          ${f ? c`
                <div class="media">
                  <img src=${f} alt=${y} loading="lazy" />
                </div>
              ` : s}

          ${g === "overlay" && f ? c`<div class="shade" aria-hidden="true"></div>` : s}

          ${u ? c`
                <div
                  class="content ${g === "overlay" ? "overlay-content" : "separate-content"}"
                  data-align=${e}
                  data-vertical=${a}
                >
                  ${this._renderContent(l)}
                </div>
              ` : s}
        </div>
      </section>
    `;
  }
};
b.styles = L;
let m = b;
V([
  A({ type: Object })
], m.prototype, "config");
typeof m < "u" && m.registerSallaComponent("salla-flexible-banner-content");
export {
  m as default
};
