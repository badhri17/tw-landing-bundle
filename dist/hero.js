import { LitElement as K, css as W, nothing as h, html as o } from "lit";
import { property as X, state as x } from "lit/decorators.js";
import { ifDefined as q } from "lit/directives/if-defined.js";
function J(l, e) {
  if (typeof l == "string") return l;
  if (!l || typeof l != "object") return "";
  const t = l[e] || l.ar || l.en || "";
  return typeof t == "string" ? t.trim() : "";
}
function D(l) {
  return l.replace(/[٠-٩]/g, (e) => String(e.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (e) => String(e.charCodeAt(0) - 1776));
}
class Q extends K {
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
    const t = String(e || "").trim(), n = t.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), a = n.includes("-") ? n : `salla-${n || "component"}`, i = () => `${a}-${Math.random().toString(36).substring(2, 8)}`, r = () => {
      var m;
      const s = (m = window.Salla) == null ? void 0 : m.bundles;
      return s && typeof s.registerComponent == "function" ? (s.registerComponent(t, {
        component: this,
        dynamicTagName: i()
      }), !0) : !1;
    };
    if (r()) return;
    const c = window.setInterval(() => {
      r() && window.clearInterval(c);
    }, 100);
    window.setTimeout(() => window.clearInterval(c), 5e3);
  }
  /** Resolved document language. */
  _lang() {
    return (document.documentElement.lang || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
  }
  /** Pull the store-language string out of a Salla multilanguage value. */
  localizedString(e) {
    return J(e, this._lang());
  }
  /** Dropdown-list values from settings may come as [{ label, value }]. */
  _pickValue(e, t) {
    if (typeof e == "string" && e) return e;
    if (Array.isArray(e) && e.length > 0) {
      const n = e[0];
      if (n && typeof n.value == "string" && n.value)
        return n.value;
    }
    return t;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(e) {
    return D(e);
  }
  /**
   * The inverse: render a number in the digits the store's language uses, so a
   * counter or a step badge matches the copy beside it. Latin digits outside
   * Arabic, Arabic-Indic inside it.
   */
  _localeNum(e) {
    return this._lang() !== "ar" ? String(e) : String(e).replace(
      /\d/g,
      (t) => String.fromCharCode(1632 + Number(t))
    );
  }
  /**
   * Normalise a merchant-typed anchor into an id. Deliberately permissive
   * about script — Arabic ids are valid HTML and resolve fine through
   * getElementById — so we only strip the leading `#`, collapse whitespace,
   * and drop the characters that would break a URL fragment or a selector.
   */
  _slugify(e, t) {
    var i;
    return (typeof e == "string" ? e : Array.isArray(e) ? String(((i = e[0]) == null ? void 0 : i.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || t;
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
  _syncAnchor(e, t, n = 24) {
    const a = this._slugify(e, t);
    if (!a || a === this._anchorBase) return;
    this._anchorBase = a;
    let i = a;
    for (let c = 2; ; c++) {
      const s = document.getElementById(i);
      if (!s || s === this) break;
      i = `${a}-${c}`;
    }
    if (this.id = i, this.style.scrollMarginTop = `${n}px`, this._anchorDeepLinked) return;
    let r = "";
    try {
      r = decodeURIComponent(location.hash.slice(1));
    } catch {
      r = location.hash.slice(1);
    }
    r && r === i && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(e, t) {
    if (!t.startsWith("#") || t === "#") return;
    let n = t.slice(1);
    try {
      n = decodeURIComponent(n);
    } catch {
    }
    const a = document.getElementById(n);
    if (!a) return;
    e.preventDefault();
    const i = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    a.scrollIntoView({
      block: "start",
      behavior: i ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${n}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(e, t) {
    if (typeof e == "number" && !Number.isNaN(e)) return e;
    if (typeof e == "string" && e.trim() !== "") {
      const n = Number(D(e.trim()));
      if (!Number.isNaN(n)) return n;
    }
    if (Array.isArray(e) && e.length > 0) {
      const n = e[0];
      if ((n == null ? void 0 : n.value) !== void 0) return this._num(n.value, t);
    }
    return t;
  }
}
const Z = W`
  :host {
    /* Inherits from the theme so Arabic font, brand colours, and dir flow through. */
    display: block;
    font-family: inherit;
    direction: inherit;

    /* Tunable CSS custom properties — merchants/themes can override at :root. */
    --gh-height-full: 100svh;
    --gh-height-large: 80svh;
    --gh-height-medium: 60svh;
    --gh-height-compact: 45svh;

    --gh-content-max: 720px;
    --gh-inline-pad: clamp(1.25rem, 4vw, 3.5rem);
    --gh-block-pad: clamp(2rem, 6vw, 5rem);

    --gh-headline-size: clamp(2.25rem, 6vw, 4.5rem);
    --gh-subtitle-size: clamp(1rem, 1.6vw, 1.25rem);
    --gh-eyebrow-size: clamp(0.75rem, 1vw, 0.875rem);

    --gh-radius: 14px;
    --gh-btn-radius: 999px;
    --gh-easing: cubic-bezier(0.22, 1, 0.36, 1);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* A fixed bar lives inside this shadow root, so the HOST is what has to sit
     above the sections that follow it in the page. Scoped to the fixed case so
     a normal hero keeps its default stacking. */
  :host([nav-fixed]) {
    position: relative;
    z-index: 60;
  }

  .hero {
    position: relative;
    width: 100%;
    overflow: hidden;
    isolation: isolate;
    color: #fff;
    background: #0b0b0f;
  }

  .hero[data-height="full"]    { min-height: var(--gh-height-full); }
  .hero[data-height="large"]   { min-height: var(--gh-height-large); }
  .hero[data-height="medium"]  { min-height: var(--gh-height-medium); }
  .hero[data-height="compact"] { min-height: var(--gh-height-compact); }

  .hero[data-text-theme="dark"] {
    color: #0b0b0f;
  }

  /* --- Background layer --- */
  .bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }
  /* Media fills .bg via absolute positioning so it works both as a full-bleed
     background (.bg is absolute) and as a split column (.bg is a grid cell),
     and never contributes its intrinsic size to grid row sizing. */
  .bg > img,
  .bg > picture,
  .bg > video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }
  .bg > img,
  .bg > picture > img,
  .bg > video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    will-change: transform;
  }
  .bg.is-ken-burns > img,
  .bg.is-ken-burns > picture > img {
    animation: kenBurns 24s ease-in-out infinite;
  }
  /* Stop compositing the 24s loop once the hero has scrolled away. */
  :host([out-of-view]) .bg.is-ken-burns > img,
  :host([out-of-view]) .bg.is-ken-burns > picture > img {
    animation-play-state: paused;
  }
  .bg.is-parallax > video,
  .bg.is-parallax > img,
  .bg.is-parallax > picture > img {
    transform: translate3d(0, var(--gh-parallax, 0), 0) scale(1.12);
    transition: transform 0.12s linear;
  }
  .bg.is-gradient {
    background: var(--gh-bg, linear-gradient(135deg, #1e1b4b, #7c3aed));
  }

  /* --- Overlay layer --- */
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
  }
  .overlay[data-style="dark-bottom"] {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, var(--gh-overlay-a, 0.7)) 0%,
      rgba(0, 0, 0, calc(var(--gh-overlay-a, 0.7) * 0.5)) 40%,
      rgba(0, 0, 0, 0) 75%
    );
  }
  .overlay[data-style="dark-full"] {
    background: rgba(0, 0, 0, var(--gh-overlay-a, 0.45));
  }
  .overlay[data-style="light-full"] {
    background: rgba(255, 255, 255, var(--gh-overlay-a, 0.55));
  }
  .overlay[data-style="vignette"] {
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, var(--gh-overlay-a, 0.65)) 100%
    );
  }

  /* --- Top navbar ---
     Default (nav_fixed off): absolute, so the bar scrolls away with the hero.
     position:sticky is not an option here — .hero is overflow:hidden, which
     makes it a scrollport, so sticky would pin to the hero box and never move.

     nav_fixed on: position:fixed pins it to the viewport instead. That works
     from inside this shadow root because nothing in the ancestor chain sets
     transform/filter/will-change, so the viewport really is the containing
     block — the mobile drawer below already relies on the same thing. --- */
  .nav {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    z-index: 3;
    padding-inline: var(--gh-inline-pad);
    padding-block: clamp(0.75rem, 1.8vw, 1.15rem);
    /* One transition list for the whole bar. The fixed variant used to declare
       its own, which would have replaced this one wholesale and killed the
       drop-in — "transition" is a single property, not a merge. */
    transition:
      transform 0.62s var(--gh-easing),
      opacity 0.5s var(--gh-easing),
      background-color 0.28s var(--gh-easing),
      color 0.28s var(--gh-easing),
      box-shadow 0.28s var(--gh-easing);
  }
  .nav[data-fixed="on"] { position: fixed; }
  /* The bar drops in from above the fold on load. Ends on "none" rather than
     translateY(0) so the fixed bar stops being a containing block once landed. */
  .nav[data-anim="ready"] {
    opacity: 0;
    transform: translateY(-100%);
  }
  .nav[data-anim="in"] {
    opacity: 1;
    transform: none;
  }
  /* Past the hero the bar has arbitrary sections behind it, so it stops being
     transparent and carries its own surface — otherwise the white-on-image
     links land on a light section and vanish. */
  .nav[data-fixed="on"][data-scrolled="on"] {
    background: var(--gh-nav-scrolled-bg, #ffffff);
    color: var(--gh-nav-scrolled-fg, #14181f);
    box-shadow: 0 4px 20px -8px rgba(0, 0, 0, 0.25);
  }
  .nav[data-border="on"] {
    border-block-end: 1px solid currentColor;
    /* currentColor at full strength is too loud for a hairline */
    border-block-end-color: color-mix(in srgb, currentColor 18%, transparent);
  }
  /* Three tracks so the links are centred on the BAR, not on the gap left over
     after the logo — the outer tracks stay equal whatever they hold. When the
     links are display:none (mobile) the other two still land in 1 and 3,
     because every child names its own column. */
  .nav-inner {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: clamp(1rem, 3vw, 2.5rem);
    margin-inline: auto;
    max-width: var(--gh-nav-max, 1280px);
  }
  .nav-logo {
    grid-column: 1;
    justify-self: start;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: inherit;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.0625rem;
    letter-spacing: -0.01em;
  }
  /* Logo-only bar, centred variant: the middle track is empty once the links
     are gone, so the logo just moves into it. Column 3 keeps whatever the
     actions hold (the CTA, or nothing), and the empty first track balances it. */
  .nav-inner[data-logo="center"] .nav-logo {
    grid-column: 2;
    justify-self: center;
  }
  .nav-logo img {
    display: block;
    height: var(--gh-nav-logo-h, 32px);
    width: auto;
    max-width: 180px;
    object-fit: contain;
  }

  .nav-links {
    display: none; /* mobile-first: the hamburger owns navigation */
    grid-column: 2;
    justify-content: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: clamp(1.25rem, 2.6vw, 2.75rem);
  }
  .nav-links a {
    position: relative;
    display: inline-block;
    color: inherit;
    text-decoration: none;
    font-size: clamp(0.95rem, 1.1vw, 1.0625rem);
    font-weight: 500;
    letter-spacing: 0.005em;
    opacity: 0.86;
    white-space: nowrap;
    transition:
      opacity 0.22s var(--gh-easing),
      transform 0.28s var(--gh-easing);
  }
  /* Grows from the middle out — a rule that unrolls from one end reads like a
     text cursor next to a centred set of links. */
  .nav-links a::after {
    content: "";
    position: absolute;
    inset-block-end: -5px;
    inset-inline: 0;
    height: 1.5px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.34s var(--gh-easing);
  }
  .nav-links a:hover { opacity: 1; transform: translateY(-1px); }
  .nav-links a:hover::after { transform: scaleX(1); }

  .nav-actions {
    grid-column: 3;
    justify-self: end;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .nav-cta {
    display: none; /* revealed on desktop; mobile keeps the bar uncluttered */
    padding: 0.5rem 1.15rem;
    font-size: 0.8125rem;
  }

  /* Hamburger */
  .nav-burger {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 40px;
    height: 40px;
    padding: 0 8px;
    background: none;
    border: 0;
    cursor: pointer;
    color: inherit;
  }
  .nav-burger span {
    display: block;
    height: 2px;
    width: 100%;
    background: currentColor;
    border-radius: 2px;
    transition: transform 0.3s var(--gh-easing), opacity 0.2s var(--gh-easing);
  }
  .nav-burger[aria-expanded="true"] span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  .nav-burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
  .nav-burger[aria-expanded="true"] span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  /* --- Mobile menu --- */
  .menu {
    position: fixed;
    inset: 0;
    z-index: 40;
    visibility: hidden;
    pointer-events: none;
  }
  .menu[data-open="true"] {
    visibility: visible;
    pointer-events: auto;
  }
  .menu-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(3px);
    opacity: 0;
    transition: opacity 0.36s var(--gh-easing);
  }
  .menu[data-open="true"] .menu-backdrop { opacity: 1; }

  /* A sheet dropping out of the top edge, not a drawer off the side: it arrives
     from the same place the bar lives, so the burger reads as opening the bar
     rather than summoning a panel from somewhere else. Height follows the
     content and is capped at the viewport, so a two-link menu is a shallow
     sheet instead of a mostly-empty full screen. */
  .menu-panel {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    max-height: 100%;
    padding: clamp(0.9rem, 3.5vw, 1.35rem) var(--gh-inline-pad)
      clamp(2rem, 8vw, 3rem);
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 5vw, 2.25rem);
    overflow-y: auto;
    background: var(--gh-menu-bg, rgba(11, 11, 15, 0.96));
    color: var(--gh-menu-fg, #fff);
    backdrop-filter: blur(20px) saturate(1.15);
    border-end-start-radius: clamp(18px, 5vw, 28px);
    border-end-end-radius: clamp(18px, 5vw, 28px);
    box-shadow: 0 26px 70px -28px rgba(0, 0, 0, 0.75);
    transform: translateY(-101%);
    transition: transform 0.52s var(--gh-easing);
  }
  .menu[data-open="true"] .menu-panel { transform: translateY(0); }

  /* Mirrors the bar's own row, so the sheet reads as the bar expanding. */
  .menu-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: var(--gh-nav-logo-h, 32px);
  }
  .menu-brand {
    display: inline-flex;
    align-items: center;
    font-weight: 700;
    font-size: 1.0625rem;
    letter-spacing: -0.01em;
  }
  .menu-brand img {
    display: block;
    height: var(--gh-nav-logo-h, 32px);
    width: auto;
    max-width: 180px;
    object-fit: contain;
  }
  .menu-close {
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, currentColor 10%, transparent);
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    border-radius: 50%;
    color: inherit;
    cursor: pointer;
    transition:
      background-color 0.24s var(--gh-easing),
      transform 0.24s var(--gh-easing);
  }
  .menu-close:hover {
    background: color-mix(in srgb, currentColor 20%, transparent);
    transform: rotate(90deg);
  }
  .menu-close svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
  }

  .menu-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(0.3rem, 1.4vw, 0.7rem);
  }
  /* Each link falls in behind the sheet, one after the next. The delay is
     driven by --i, set per row by the component. */
  .menu-links li,
  .menu-cta {
    opacity: 0;
    transform: translateY(-16px);
    transition:
      opacity 0.45s var(--gh-easing),
      transform 0.45s var(--gh-easing);
  }
  .menu[data-open="true"] .menu-links li,
  .menu[data-open="true"] .menu-cta {
    opacity: 1;
    transform: none;
    transition-delay: calc(0.16s + var(--i, 0) * 0.065s);
  }
  .menu-links a {
    position: relative;
    display: inline-block;
    padding: 0.45rem 0.3rem;
    color: inherit;
    text-decoration: none;
    font-size: clamp(1.6rem, 7.5vw, 2.25rem);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.02em;
    text-align: center;
  }
  .menu-links a::after {
    content: "";
    position: absolute;
    inset-block-end: 0.15rem;
    inset-inline: 0.3rem;
    height: 2px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.34s var(--gh-easing);
  }
  .menu-links a:hover::after { transform: scaleX(1); }

  .menu-cta { display: flex; justify-content: center; }
  .menu-cta .btn {
    min-width: min(280px, 70vw);
    justify-content: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-panel,
    .menu-backdrop,
    .menu-close,
    .nav,
    .nav-links a,
    .nav-links a::after,
    .menu-links a::after,
    .nav-burger span { transition: none; }
    .menu-links li,
    .menu-cta {
      opacity: 1;
      transform: none;
      transition: none;
    }
    .nav[data-anim="ready"] { opacity: 1; transform: none; }
  }

  /* Keep hero content clear of the bar. Only applied when a nav is rendered,
     so a hero without one keeps its original vertical rhythm. */
  .hero[data-has-nav="on"] .content-wrap {
    padding-block-start: calc(var(--gh-block-pad) + 3.5rem);
  }

  /* Desktop nav: links inline, hamburger gone. */
  @media (min-width: 768px) {
    .nav-links { display: flex; }
    .nav-cta { display: inline-flex; }
    .nav-burger { display: none; }
    .hero[data-has-nav="on"] .content-wrap {
      padding-block-start: calc(var(--gh-block-pad) + 4rem);
    }
  }

  /* --- Content layer --- */
  .content-wrap {
    position: relative;
    z-index: 2;
    display: flex;
    width: 100%;
    min-height: inherit;
    padding-inline: var(--gh-inline-pad);
    padding-block: var(--gh-block-pad);
  }
  .hero[data-align-v="top"]    .content-wrap { align-items: flex-start; }
  .hero[data-align-v="middle"] .content-wrap { align-items: center; }
  .hero[data-align-v="bottom"] .content-wrap { align-items: flex-end; }

  .hero[data-align-h="start"]  .content-wrap { justify-content: flex-start; text-align: start; }
  .hero[data-align-h="center"] .content-wrap { justify-content: center;    text-align: center; }
  .hero[data-align-h="end"]    .content-wrap { justify-content: flex-end;  text-align: end; }

  .content {
    max-width: var(--gh-content-max);
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 1.8vw, 1.5rem);
  }
  .hero[data-align-h="center"] .content { align-items: center; }
  .hero[data-align-h="end"]    .content { align-items: flex-end; }

  /* --- Typography --- */
  .eyebrow {
    font-size: var(--gh-eyebrow-size);
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.9;
    margin: 0;
    color: var(--gh-eyebrow-color, inherit);
    /* Arabic has no uppercase — respect script */
    &:dir(rtl) { letter-spacing: 0; text-transform: none; }
  }
  .headline {
    font-size: var(--gh-headline-size);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin: 0;
    text-wrap: balance;
    color: var(--gh-title-color, inherit);
  }
  .headline:dir(rtl) {
    letter-spacing: 0;
    line-height: 1.3;
  }
  .subtitle {
    font-size: var(--gh-subtitle-size);
    line-height: 1.6;
    opacity: 0.92;
    margin: 0;
    max-width: 54ch;
    text-wrap: pretty;
    color: var(--gh-subtitle-color, inherit);
  }

  /* --- CTAs --- */
  .ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.65rem 1.5rem;
    font-family: inherit;
    font-weight: 600;
    font-size: 0.875rem;
    text-decoration: none;
    border-radius: var(--gh-btn-radius);
    border: 1.5px solid transparent;
    cursor: pointer;
    transition:
      transform 0.25s var(--gh-easing),
      background-color 0.25s var(--gh-easing),
      border-color 0.25s var(--gh-easing),
      color 0.25s var(--gh-easing),
      box-shadow 0.25s var(--gh-easing);
    white-space: nowrap;
  }
  .btn-primary {
    background: var(--gh-btn-bg, #ffffff);
    color: var(--gh-btn-fg, #0b0b0f);
    box-shadow: 0 8px 24px -10px rgba(0, 0, 0, 0.45);
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.55);
  }
  .btn-outline {
    background: transparent;
    color: var(--gh-btn-fg, currentColor);
    border-color: var(--gh-btn-fg, currentColor);
    backdrop-filter: blur(6px);
  }
  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }
  .hero[data-text-theme="dark"] .btn-outline:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  /* --- Trust points --- */
  .trust {
    list-style: none;
    margin: 0.875rem 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
  }
  .hero[data-align-h="center"] .trust { justify-content: center; }
  .hero[data-align-h="end"]    .trust { justify-content: flex-end; }
  .trust-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.2;
    opacity: 0.92;
    white-space: nowrap;
    color: var(--gh-subtitle-color, inherit);
  }

  /* Custom-colours mode: show the chosen colours at full strength (drop the
     subtle auto-dimming used in the default theme-driven flow). */
  .hero[data-custom-colors="on"] .eyebrow,
  .hero[data-custom-colors="on"] .subtitle,
  .hero[data-custom-colors="on"] .trust-item {
    opacity: 1;
  }
  .trust-icon {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    opacity: 0.85;
  }

  /* --- Entrance motion --- */
  .content[data-anim="ready"] > * {
    opacity: 0;
    transform: translateY(14px);
  }
  .content[data-anim="in"] > * {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.7s var(--gh-easing),
      transform 0.7s var(--gh-easing);
  }
  .content[data-anim="in"] > *:nth-child(1) { transition-delay: 0.05s; }
  .content[data-anim="in"] > *:nth-child(2) { transition-delay: 0.15s; }
  .content[data-anim="in"] > *:nth-child(3) { transition-delay: 0.28s; }
  .content[data-anim="in"] > *:nth-child(4) { transition-delay: 0.40s; }
  .content[data-anim="in"] > *:nth-child(5) { transition-delay: 0.52s; }

  @media (prefers-reduced-motion: reduce) {
    .bg.is-ken-burns > img,
    .bg.is-ken-burns > picture > img { animation: none; }
    .bg.is-parallax > video,
    .bg.is-parallax > img,
    .bg.is-parallax > picture > img { transform: none; }
    .content[data-anim] > * { opacity: 1 !important; transform: none !important; transition: none !important; }
  }

  @keyframes kenBurns {
    0% {
      transform: scale(1.04) translate3d(0, 0, 0);
    }
    50% {
      transform: scale(1.14) translate3d(-2%, -1.5%, 0);
    }
    100% {
      transform: scale(1.04) translate3d(0, 0, 0);
    }
  }

  /* --- Split layout (desktop ≥768 px): media on one side, content on the other.
         On mobile this never applies — the media stays a full background. --- */
  @media (min-width: 768px) {
    .hero[data-layout="split"] {
      display: grid;
      grid-template-columns: var(--gh-split-start, 1fr) var(--gh-split-end, 1fr);
      align-items: stretch;
      align-content: stretch;
    }
    /* .bg leaves the absolute full-bleed flow and becomes a real grid column.
       Columns are line-based (line 1 = inline-start), so the component resolves
       the merchant's physical left/right choice into data-media-col for the
       current writing direction. */
    .hero[data-layout="split"] .bg {
      position: relative;
      inset: auto;
    }
    .hero[data-layout="split"][data-media-col="start"] .bg           { grid-column: 1; grid-row: 1; }
    .hero[data-layout="split"][data-media-col="start"] .content-wrap { grid-column: 2; grid-row: 1; }
    .hero[data-layout="split"][data-media-col="end"]   .bg           { grid-column: 2; grid-row: 1; }
    .hero[data-layout="split"][data-media-col="end"]   .content-wrap { grid-column: 1; grid-row: 1; }

    /* The content side gets its own backdrop — media no longer sits behind it. */
    .hero[data-layout="split"] .content-wrap {
      background: var(--gh-split-content-bg, #0b0b0f);
      color: #fff;
    }
    .hero[data-layout="split"][data-split-text-theme="dark"] .content-wrap {
      color: #0b0b0f;
    }
  }

  /* --- Mobile tuning --- */
  @media (max-width: 640px) {
    :host {
      --gh-headline-size: clamp(1.75rem, 8vw, 2.5rem);
    }
    .ctas { flex-direction: column; align-items: flex-start; }
    .hero[data-align-h="center"] .ctas { align-items: center; }
    .hero[data-align-h="end"]    .ctas { align-items: flex-end; }
  }
`;
var ee = Object.defineProperty, _ = (l, e, t, n) => {
  for (var a = void 0, i = l.length - 1, r; i >= 0; i--)
    (r = l[i]) && (a = r(e, t, a) || a);
  return a && ee(e, t, a), a;
};
const A = class A extends Q {
  constructor() {
    super(...arguments), this._videoFailed = !1, this._animState = "ready", this._isDesktop = !1, this._menuOpen = !1, this._prevBodyOverflow = null, this._videoEl = null, this._videoGeneration = 0, this._lastVideoSrc = "", this._fallbackTimer = null, this._autoplayCheckTimer = null, this._io = null, this._inView = !0, this._rafId = null, this._navPastHero = !1, this._navRafId = null, this._closeMenu = () => {
      this._menuOpen = !1;
    }, this._toggleMenu = () => {
      this._menuOpen = !this._menuOpen;
    };
  }
  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  /** Active video URL for the current device tier, falling back to mobile when desktop is unset. */
  _currentVideoUrl() {
    const e = this.config || {};
    return this._isDesktop && e.video_url_desktop ? e.video_url_desktop : e.video_url || "";
  }
  /** Active image URL for the current device tier, falling back to mobile when desktop is unset. */
  _currentImageUrl() {
    const e = this.config || {};
    return this._isDesktop && e.background_image_desktop ? e.background_image_desktop : e.background_image || "";
  }
  /** Returns true when smart_data_saver is ON and the connection is slow/data-restricted. */
  _shouldSkipVideo() {
    var t;
    if (((t = this.config) == null ? void 0 : t.smart_data_saver) === !1) return !1;
    const e = navigator.connection;
    return !!(e && (e.saveData === !0 || ["slow-2g", "2g"].includes(e.effectiveType)));
  }
  /**
   * Returns the video fallback timeout in ms.
   * On mobile without the Network Information API (e.g. Safari), we use a shorter
   * 3 s window since we have no signal to rely on and want to fail fast.
   */
  _pickVideoTimeout() {
    var n;
    if (((n = this.config) == null ? void 0 : n.smart_data_saver) === !1) return 12e3;
    const e = !window.matchMedia("(min-width: 768px)").matches, t = !!navigator.connection;
    return e && !t ? 1e4 : 12e3;
  }
  /** Which background mode should we render? */
  get _mode() {
    return this._currentVideoUrl() && !this._shouldSkipVideo() && !this._videoFailed ? "video" : this._currentImageUrl() ? "image" : "gradient";
  }
  /**
   * Build the CSS `background` value for the gradient mode.
   * Driven by the `bg_fill_type` dropdown (solid | gradient). For configs saved
   * before that field existed, we infer the mode from whether a "to" colour is
   * present, so existing gradients keep rendering.
   * - solid (or gradient with no "to") → the single colour.
   * - gradient with both stops         → gradient of the chosen type/angle.
   * - neither colour                   → null; CSS fallback in style.ts takes over.
   */
  _buildBackground() {
    const e = this.config || {}, t = (e.gradient_from || "").trim(), n = (e.gradient_to || "").trim();
    if (!t && !n) return null;
    if (this._pickValue(
      e.bg_fill_type,
      n ? "gradient" : "solid"
    ) !== "gradient" || !n) return t || n;
    const i = this._pickValue(e.gradient_type, "linear"), r = typeof e.gradient_angle == "number" ? e.gradient_angle : 135;
    switch (i) {
      case "radial":
        return `radial-gradient(circle at center, ${t} 0%, ${n} 100%)`;
      case "radial-corner":
        return `radial-gradient(circle at top left, ${t} 0%, ${n} 75%)`;
      case "conic":
        return `conic-gradient(from ${r}deg at 50% 50%, ${t}, ${n}, ${t})`;
      case "linear":
      default:
        return `linear-gradient(${r}deg, ${t}, ${n})`;
    }
  }
  // ------------------------------------------------------------
  // Navbar
  //
  // The merchant panel cannot enumerate the components a merchant dropped on
  // the page — there is no "page sections" picker source — so nav targets are
  // resolved through anchor ids instead. Each landing component publishes one
  // on its host element (see GrowthElement._syncAnchor); the `target` dropdown
  // here lists their default slugs, with `custom` for a renamed or duplicated
  // section and `link` for anything off-page.
  // ------------------------------------------------------------
  /** Unwrap a Salla `variable-list` value into a final URL. */
  _resolveLink(e) {
    if (!e) return "";
    const t = Array.isArray(e) ? e[0] : e;
    if (!t) return "";
    const a = (typeof t == "string" ? t : typeof t == "object" ? String(
      t.url ?? t.value ?? ""
    ) : "").trim();
    return a && a !== "#" ? a : "";
  }
  /** Resolve one nav row to a label + href, or null when it can't render. */
  _resolveNavItem(e) {
    const t = this.localizedString(e == null ? void 0 : e.label);
    if (!t) return null;
    const n = this._pickValue(e == null ? void 0 : e.target, "custom");
    if (n === "link") {
      const i = this._resolveLink(e == null ? void 0 : e.link);
      return i ? { localizedLabel: t, href: i } : null;
    }
    const a = n === "custom" ? this._slugify(e == null ? void 0 : e.section_custom, "") : this._slugify(n, "");
    return a ? { localizedLabel: t, href: `#${a}` } : null;
  }
  /**
   * Which of the three bar shapes the merchant picked.
   *
   * The fallback must stay in step with the `selected` value the field ships in
   * twilight-bundle.json — it is what an instance with no stored value renders,
   * so a divergence shows a bar the panel says is off.
   */
  _navLayout() {
    var e;
    return this._pickValue(
      (e = this.config) == null ? void 0 : e.nav_layout,
      "logo_only_center"
    );
  }
  /** Keep the rendered default aligned with the switch shown in the builder.
   * Some template-preview paths omit an untouched boolean `selected` value. */
  _navEnabled() {
    var e;
    return ((e = this.config) == null ? void 0 : e.enable_nav) !== !1;
  }
  /**
   * All renderable nav links, capped to keep the bar from wrapping.
   *
   * Empty in both "logo only" layouts — the single gate for the bar links, the
   * hamburger and the mobile drawer alike, since each is already conditional on
   * this being non-empty. `nav_items` is deliberately NOT cleared: a hidden
   * field keeps its value, which here is the point.
   */
  _navItems() {
    var t;
    if (this._navLayout() !== "logo_links") return [];
    const e = (t = this.config) == null ? void 0 : t.nav_items;
    return Array.isArray(e) ? e.map((n) => this._resolveNavItem(n)).filter((n) => n !== null).slice(0, 6) : [];
  }
  /** Nav link click: smooth-scroll in-page targets, close the drawer either way. */
  _onNavLinkClick(e, t) {
    this._scrollToAnchor(e, t), this._menuOpen = !1;
  }
  /**
   * Hold the page still while the drawer is open, and restore exactly what was
   * there before — themes sometimes set their own body overflow.
   */
  _syncScrollLock() {
    const e = this._prevBodyOverflow !== null;
    this._menuOpen !== e && (this._menuOpen ? (this._prevBodyOverflow = document.body.style.overflow, document.body.style.overflow = "hidden") : (document.body.style.overflow = this._prevBodyOverflow ?? "", this._prevBodyOverflow = null));
  }
  _overlayAlpha(e = "medium") {
    switch (e) {
      case "subtle":
        return 0.35;
      case "strong":
        return 0.85;
      case "medium":
      default:
        return 0.6;
    }
  }
  /** Resolved document direction; split placement maps physical sides to inline edges. */
  _dir() {
    const e = (document.documentElement.getAttribute("dir") || "").toLowerCase();
    return e === "rtl" || e === "ltr" ? e : getComputedStyle(this).direction === "ltr" ? "ltr" : "rtl";
  }
  /**
   * Resolve split-mode grid placement. Grid columns are line-based (line 1 =
   * inline-start), which flips with RTL — so we translate the merchant's PHYSICAL
   * left/right choice into an inline edge for the current direction, then assign
   * each column its width share (the bigger share goes to whatever the ratio names).
   */
  _resolveSplit(e, t) {
    const a = this._dir() === "ltr" ? e === "left" : e === "right", i = "1.25fr", r = "1fr", c = t === "media" ? i : r, s = t === "content" ? i : r;
    return {
      mediaCol: a ? "start" : "end",
      startFr: a ? c : s,
      endFr: a ? s : c
    };
  }
  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------
  connectedCallback() {
    super.connectedCallback(), requestAnimationFrame(() => {
      requestAnimationFrame(() => this._animState = "in");
    }), this._mql = window.matchMedia("(min-width: 768px)"), this._isDesktop = this._mql.matches, this._onMqlChange = () => {
      this._isDesktop = this._mql.matches, this._videoFailed = !1;
    }, this._mql.addEventListener("change", this._onMqlChange), this._onKeydown = (e) => {
      e.key === "Escape" && this._menuOpen && this._closeMenu();
    }, window.addEventListener("keydown", this._onKeydown), "IntersectionObserver" in window && (this._io = new IntersectionObserver(
      (e) => {
        const t = e[0];
        t && (this._inView = t.isIntersecting, this.toggleAttribute("out-of-view", !this._inView));
      },
      { threshold: 0 }
    ), this._io.observe(this));
  }
  firstUpdated() {
  }
  updated() {
    var n, a;
    this._syncParallax(), this._syncNavScroll(), this.toggleAttribute(
      "nav-fixed",
      this._navEnabled() && ((n = this.config) == null ? void 0 : n.nav_fixed) === !0
    ), this._syncAnchor((a = this.config) == null ? void 0 : a.anchor_id, "hero"), this._syncScrollLock();
    const e = this.renderRoot.querySelector("video");
    if (!e) {
      this._videoEl = null;
      return;
    }
    const t = this._currentVideoUrl();
    (e !== this._videoEl || t !== this._lastVideoSrc) && (this._fallbackTimer && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null), this._lastVideoSrc = t, this._videoEl = e, this._setupVideo());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._mql && this._onMqlChange && this._mql.removeEventListener("change", this._onMqlChange), this._onKeydown && window.removeEventListener("keydown", this._onKeydown), this._menuOpen = !1, this._syncScrollLock(), this._teardown();
  }
  // ------------------------------------------------------------
  // Video: autoplay + robust fallback
  // Generation counter ensures that stale abort/error callbacks from a previous src
  // (e.g. the browser firing abort when we swap to a desktop variant) are ignored.
  // ------------------------------------------------------------
  _setupVideo() {
    const e = this.renderRoot.querySelector("video");
    if (!e) return;
    this._videoEl = e;
    const t = ++this._videoGeneration;
    let n = !1;
    const a = () => {
      t === this._videoGeneration && (n || (n = !0, this._fallbackTimer && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null)));
    }, i = () => {
      t === this._videoGeneration && (a(), this._videoFailed = !0);
    };
    e.addEventListener("playing", a, { once: !0 }), e.addEventListener("canplaythrough", a, { once: !0 }), e.addEventListener("error", i, { once: !0 }), e.addEventListener("abort", i, { once: !0 });
    const r = () => {
      e.currentTime > 0 && (a(), e.removeEventListener("timeupdate", r));
    };
    e.addEventListener("timeupdate", r);
    const c = () => {
      var g;
      t === this._videoGeneration && (a(), ((g = this.config) == null ? void 0 : g.battery_saver_fallback) !== !1 && this._currentImageUrl() && (this._videoFailed = !0));
    };
    let s = 0;
    const m = () => {
      if (t === this._videoGeneration && !(!e.isConnected || !e.paused || e.currentTime > 0)) {
        if (e.readyState >= 2) {
          c();
          return;
        }
        ++s < 10 && (this._autoplayCheckTimer = window.setTimeout(m, 1500));
      }
    }, $ = () => {
      if (t !== this._videoGeneration) return;
      const g = e.play();
      g && typeof g.then == "function" && g.catch((y) => {
        (y == null ? void 0 : y.name) === "NotAllowedError" ? c() : i();
      }), this._autoplayCheckTimer && clearTimeout(this._autoplayCheckTimer), this._autoplayCheckTimer = window.setTimeout(m, 2e3);
    };
    e.readyState >= 1 ? $() : e.addEventListener("loadedmetadata", $, { once: !0 }), this._fallbackTimer = window.setTimeout(() => {
      t === this._videoGeneration && (n || i());
    }, this._pickVideoTimeout());
  }
  // ------------------------------------------------------------
  // Fixed navbar
  //
  // The bar is transparent while the hero is behind it and takes a solid
  // background once the hero has scrolled past, so its links stay readable over
  // whatever section is underneath. Watching the host's own rect (rather than a
  // fixed scrollY threshold) keeps the swap tied to the hero's real height,
  // whatever the merchant set it to.
  // ------------------------------------------------------------
  /** Idempotent wiring, called from updated() like _syncParallax(). */
  _syncNavScroll() {
    const e = this.config || {}, t = this._navEnabled() && e.nav_fixed === !0;
    t !== !!this._onNavScroll && (t ? this._setupNavScroll() : this._teardownNavScroll());
  }
  _teardownNavScroll() {
    this._onNavScroll && (window.removeEventListener("scroll", this._onNavScroll), document.removeEventListener("scroll", this._onNavScroll, !0)), this._onNavScroll = void 0, this._navRafId && (cancelAnimationFrame(this._navRafId), this._navRafId = null), this._navPastHero = !1, this._setScrollPadding(null);
  }
  /**
   * A fixed bar covers the top of any section an in-page nav link jumps to.
   * scroll-padding-top on the root fixes that for every target at once —
   * `_syncAnchor`'s per-element scroll-margin only budgets 24px, and the hero
   * cannot reach into the other components to raise it.
   */
  _setScrollPadding(e) {
    const t = document.documentElement;
    e === null ? t.style.scrollPaddingTop = "" : t.style.scrollPaddingTop = `${e}px`;
  }
  _setupNavScroll() {
    let e = !1;
    this._onNavScroll = () => {
      e || (e = !0, this._navRafId = requestAnimationFrame(() => {
        const t = this.renderRoot.querySelector(".nav"), n = (t == null ? void 0 : t.offsetHeight) || 64;
        this._navPastHero = this.getBoundingClientRect().bottom <= n, this._setScrollPadding(n + 16), e = !1;
      }));
    }, window.addEventListener("scroll", this._onNavScroll, { passive: !0 }), document.addEventListener("scroll", this._onNavScroll, {
      capture: !0,
      passive: !0
    }), this._onNavScroll();
  }
  // ------------------------------------------------------------
  // Parallax: subtle Y-transform tied to scroll, throttled via rAF.
  // ------------------------------------------------------------
  /**
   * Idempotent parallax wiring. Called from updated() so it survives a config
   * that arrives after the first render, and tears down if the toggle flips off.
   */
  _syncParallax() {
    var t;
    const e = !!((t = this.config) != null && t.enable_parallax) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    e !== !!this._onScroll && (e ? this._setupParallax() : this._teardownParallax());
  }
  _teardownParallax() {
    this._onScroll && window.removeEventListener("scroll", this._onScroll), this._onScroll = void 0, this._rafId && (cancelAnimationFrame(this._rafId), this._rafId = null);
  }
  _setupParallax() {
    const e = this.renderRoot.querySelector(".bg");
    if (!e) return;
    let t = !1;
    this._onScroll = () => {
      t || !this._inView || (t = !0, this._rafId = requestAnimationFrame(() => {
        const n = this.getBoundingClientRect(), a = window.innerHeight || 800, i = (n.top + n.height / 2 - a / 2) / a, r = Math.max(-1, Math.min(1, i)) * 80;
        e.style.setProperty("--gh-parallax", `${-r}px`), t = !1;
      }));
    }, window.addEventListener("scroll", this._onScroll, { passive: !0 }), this._onScroll();
  }
  _teardown() {
    var e;
    this._fallbackTimer && clearTimeout(this._fallbackTimer), this._autoplayCheckTimer && clearTimeout(this._autoplayCheckTimer), this._teardownParallax(), this._teardownNavScroll(), (e = this._io) == null || e.disconnect(), this._io = null, this._videoEl = null;
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  render() {
    const e = this.config || {}, t = this._pickValue(e.height_mobile, "medium"), n = this._pickValue(e.height_desktop, "inherit"), a = this._isDesktop && n !== "inherit" ? n : t, i = this._pickValue(e.align_h, "center"), r = this._pickValue(e.align_v, "bottom"), c = this._pickValue(e.text_theme, "light"), s = this._pickValue(e.overlay_style, "dark-bottom"), m = this._pickValue(e.overlay_intensity, "medium"), $ = this._overlayAlpha(m), g = e.enable_entrance_anim !== !1, y = !!e.enable_ken_burns, E = !!e.enable_parallax, V = this._pickValue(e.desktop_layout, "background"), F = this._pickValue(e.split_media_side, "left"), R = this._pickValue(e.split_ratio, "equal"), U = this._pickValue(
      e.split_text_theme,
      "light"
    ), p = V === "split" ? this._resolveSplit(F, R) : null, f = e.enable_custom_colors === !0, N = this.localizedString(e.eyebrow), I = this.localizedString(e.headline) || "Welcome", O = this.localizedString(e.subtitle), S = this.localizedString(e.primary_label), j = (Array.isArray(e.trust_points) ? e.trust_points : []).map((d) => this.localizedString(d == null ? void 0 : d.text)).filter(Boolean).slice(0, 3), C = this._mode, B = this._buildBackground(), Y = [
      `--gh-overlay-a: ${$}`,
      e.nav_scrolled_bg ? `--gh-nav-scrolled-bg: ${e.nav_scrolled_bg}` : "",
      e.nav_scrolled_color ? `--gh-nav-scrolled-fg: ${e.nav_scrolled_color}` : "",
      e.content_max_width ? `--gh-content-max: ${e.content_max_width}px` : "",
      B ? `--gh-bg: ${B}` : "",
      p ? `--gh-split-start: ${p.startFr}` : "",
      p ? `--gh-split-end: ${p.endFr}` : "",
      p && e.split_content_bg ? `--gh-split-content-bg: ${e.split_content_bg}` : "",
      f && e.title_color ? `--gh-title-color: ${e.title_color}` : "",
      f && e.eyebrow_color ? `--gh-eyebrow-color: ${e.eyebrow_color}` : "",
      f && e.subtitle_color ? `--gh-subtitle-color: ${e.subtitle_color}` : "",
      f && e.button_bg_color ? `--gh-btn-bg: ${e.button_bg_color}` : "",
      f && e.button_text_color ? `--gh-btn-fg: ${e.button_text_color}` : ""
    ].filter(Boolean).join("; "), H = [
      "bg",
      C === "gradient" ? "is-gradient" : "",
      C === "image" && y ? "is-ken-burns" : "",
      E ? "is-parallax" : ""
    ].filter(Boolean).join(" "), M = this._navEnabled(), G = this._navLayout(), v = M ? this._navItems() : [], w = (e.nav_logo || "").trim(), k = this.localizedString(e.nav_store_name), T = M && (v.length > 0 || !!w || !!k), L = T && e.nav_fixed === !0, b = T && e.nav_show_cta !== !1 && S ? { localizedLabel: S, href: e.primary_url || "#" } : null, P = (d) => o`
      <a
        href=${d.href}
        @click=${(z) => this._onNavLinkClick(z, d.href)}
        >${d.localizedLabel}</a
      >
    `;
    return o`
      <section
        class="hero"
        style=${Y}
        data-has-nav=${T ? "on" : "off"}
        data-nav-fixed=${L ? "on" : "off"}
        data-height=${a}
        data-layout=${V}
        data-media-col=${p ? p.mediaCol : "start"}
        data-split-text-theme=${U}
        data-custom-colors=${f ? "on" : "off"}
        data-align-h=${i}
        data-align-v=${r}
        data-text-theme=${c}
        aria-label=${I}
      >
        <div class=${H}>
          ${C === "video" ? o`
                <video
                  src=${this._currentVideoUrl()}
                  poster=${q(this._currentImageUrl() || void 0)}
                  ?autoplay=${e.video_autoplay !== !1}
                  ?loop=${e.video_loop !== !1}
                  ?muted=${e.video_muted !== !1}
                  muted
                  playsinline
                  webkit-playsinline
                  preload="auto"
                ></video>
              ` : C === "image" ? o`
                <picture>
                  ${e.background_image_desktop ? o`<source media="(min-width: 768px)" srcset=${e.background_image_desktop}>` : h}
                  <img
                    src=${q(
      e.background_image || e.background_image_desktop || void 0
    )}
                    alt=""
                    loading="eager"
                    fetchpriority="high"
                    decoding="async"
                  />
                </picture>
              ` : h}
          ${s !== "none" ? o`<div class="overlay" data-style=${s}></div>` : h}
        </div>

        ${T ? o`
              <nav
                class="nav"
                data-border=${e.nav_border ? "on" : "off"}
                data-fixed=${L ? "on" : "off"}
                data-scrolled=${L && this._navPastHero ? "on" : "off"}
                data-anim=${g ? this._animState : "in"}
              >
                <div
                  class="nav-inner"
                  data-logo=${G === "logo_only_center" ? "center" : "start"}
                >
                  <a class="nav-logo" href=${e.nav_home_url || "#"}>
                    ${w ? o`<img
                          src=${w}
                          alt=${k || "logo"}
                        />` : o`<span>${k}</span>`}
                  </a>

                  ${v.length ? o`
                        <ul class="nav-links">
                          ${v.map((d) => o`<li>${P(d)}</li>`)}
                        </ul>
                      ` : h}

                  <div class="nav-actions">
                    ${b ? o`<a class="btn btn-primary nav-cta" href=${b.href}
                          >${b.localizedLabel}</a
                        >` : h}
                    ${v.length ? o`
                          <button
                            class="nav-burger"
                            type="button"
                            aria-label=${this._lang() === "en" ? "Open menu" : "فتح القائمة"}
                            aria-expanded=${this._menuOpen ? "true" : "false"}
                            @click=${this._toggleMenu}
                          >
                            <span></span><span></span><span></span>
                          </button>
                        ` : h}
                  </div>
                </div>
              </nav>

              <div class="menu" data-open=${this._menuOpen ? "true" : "false"}>
                <div class="menu-backdrop" @click=${this._closeMenu}></div>
                <div
                  class="menu-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-hidden=${this._menuOpen ? "false" : "true"}
                >
                  <!-- The sheet mirrors the bar it drops out of, so the brand
                       stays put instead of being replaced by a bare list. -->
                  <div class="menu-head">
                    <span class="menu-brand">
                      ${w ? o`<img src=${w} alt=${k || "logo"} />` : o`<span>${k}</span>`}
                    </span>
                    <button
                      class="menu-close"
                      type="button"
                      aria-label=${this._lang() === "en" ? "Close" : "إغلاق"}
                      @click=${this._closeMenu}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                  <ul class="menu-links">
                    ${v.map(
      (d, z) => o`<li style=${`--i:${z}`}>${P(d)}</li>`
    )}
                  </ul>
                  ${b ? o`<div class="menu-cta" style=${`--i:${v.length}`}>
                        <a class="btn btn-primary" href=${b.href}
                          >${b.localizedLabel}</a
                        >
                      </div>` : h}
                </div>
              </div>
            ` : h}

        <div class="content-wrap">
          <div class="content" data-anim=${g ? this._animState : "in"}>
            ${N ? o`<p class="eyebrow">${N}</p>` : h}
            <h1 class="headline">${I}</h1>
            ${O ? o`<p class="subtitle">${O}</p>` : h}
            ${S ? o`
                  <div class="ctas">
                    <a
                      class="btn ${e.primary_outline ? "btn-outline" : "btn-primary"}"
                      href=${e.primary_url || "#"}
                    >
                      ${S}
                    </a>
                  </div>
                ` : h}
            ${j.length ? o`
                  <ul class="trust">
                    ${j.map(
      (d) => o`
                        <li class="trust-item">
                          <svg
                            class="trust-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M20 6 9 17l-5-5"
                              stroke="currentColor"
                              stroke-width="2.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                          <span>${d}</span>
                        </li>
                      `
    )}
                  </ul>
                ` : h}
          </div>
        </div>
      </section>
    `;
  }
};
A.styles = Z;
let u = A;
_([
  X({ type: Object })
], u.prototype, "config");
_([
  x()
], u.prototype, "_videoFailed");
_([
  x()
], u.prototype, "_animState");
_([
  x()
], u.prototype, "_isDesktop");
_([
  x()
], u.prototype, "_menuOpen");
_([
  x()
], u.prototype, "_navPastHero");
typeof u < "u" && u.registerSallaComponent("salla-hero");
export {
  u as default
};
