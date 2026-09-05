import { LitElement as B, css as N, html as i, nothing as d } from "lit";
import { property as A } from "lit/decorators.js";
import { ifDefined as _ } from "lit/directives/if-defined.js";
function V(o, t) {
  if (typeof o == "string") return o;
  if (!o || typeof o != "object") return "";
  const e = o[t] || o.ar || o.en || "";
  return typeof e == "string" ? e.trim() : "";
}
function w(o) {
  return o.replace(/[٠-٩]/g, (t) => String(t.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (t) => String(t.charCodeAt(0) - 1776));
}
class L extends B {
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
    const e = String(t || "").trim(), a = e.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), r = a.includes("-") ? a : `salla-${a || "component"}`, n = () => `${r}-${Math.random().toString(36).substring(2, 8)}`, l = () => {
      var p;
      const s = (p = window.Salla) == null ? void 0 : p.bundles;
      return s && typeof s.registerComponent == "function" ? (s.registerComponent(e, {
        component: this,
        dynamicTagName: n()
      }), !0) : !1;
    };
    if (l()) return;
    const c = window.setInterval(() => {
      l() && window.clearInterval(c);
    }, 100);
    window.setTimeout(() => window.clearInterval(c), 5e3);
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
  _pickValue(t, e) {
    if (typeof t == "string" && t) return t;
    if (Array.isArray(t) && t.length > 0) {
      const a = t[0];
      if (a && typeof a.value == "string" && a.value)
        return a.value;
    }
    return e;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(t) {
    return w(t);
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
    var n;
    return (typeof t == "string" ? t : Array.isArray(t) ? String(((n = t[0]) == null ? void 0 : n.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || e;
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
  _syncAnchor(t, e, a = 24) {
    const r = this._slugify(t, e);
    if (!r || r === this._anchorBase) return;
    this._anchorBase = r;
    let n = r;
    for (let c = 2; ; c++) {
      const s = document.getElementById(n);
      if (!s || s === this) break;
      n = `${r}-${c}`;
    }
    if (this.id = n, this.style.scrollMarginTop = `${a}px`, this._anchorDeepLinked) return;
    let l = "";
    try {
      l = decodeURIComponent(location.hash.slice(1));
    } catch {
      l = location.hash.slice(1);
    }
    l && l === n && (this._anchorDeepLinked = !0, requestAnimationFrame(
      () => this.scrollIntoView({ block: "start", behavior: "auto" })
    ));
  }
  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  _scrollToAnchor(t, e) {
    if (!e.startsWith("#") || e === "#") return;
    let a = e.slice(1);
    try {
      a = decodeURIComponent(a);
    } catch {
    }
    const r = document.getElementById(a);
    if (!r) return;
    t.preventDefault();
    const n = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    r.scrollIntoView({
      block: "start",
      behavior: n ? "auto" : "smooth"
    }), history.replaceState(null, "", `#${a}`);
  }
  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  _num(t, e) {
    if (typeof t == "number" && !Number.isNaN(t)) return t;
    if (typeof t == "string" && t.trim() !== "") {
      const a = Number(w(t.trim()));
      if (!Number.isNaN(a)) return a;
    }
    if (Array.isArray(t) && t.length > 0) {
      const a = t[0];
      if ((a == null ? void 0 : a.value) !== void 0) return this._num(a.value, e);
    }
    return e;
  }
}
const I = N`
  :host {
    --fcta-footer-overlap: clamp(34px, 6vw, 64px);

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

  .final-cta {
    --fcta-bg: #6b4024;
    --fcta-text: #ffffff;
    --fcta-button-bg: #ffffff;
    --fcta-button-text: #4b2a16;
    --fcta-padding-x: clamp(1.25rem, 5vw, 4rem);
    --fcta-overlay-alpha: 0.35;
    --fcta-overlay-soft-alpha: 0.2;
    --fcta-overlay-strong-alpha: 0.55;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100%;
    min-height: clamp(360px, 72vw, 680px);
    display: flex;
    align-items: stretch;
    justify-content: center;
    padding: clamp(2.4rem, 7vw, 5rem) var(--fcta-padding-x)
      calc(clamp(2.4rem, 7vw, 5rem) + var(--fcta-footer-overlap));
    background: var(--fcta-bg);
    color: var(--fcta-text);
    text-align: center;
  }

  .final-cta[data-has-image="false"] {
    min-height: 0;
    padding-block: clamp(3.5rem, 10vw, 7rem)
      calc(clamp(3.5rem, 10vw, 7rem) + var(--fcta-footer-overlap));
  }

  .final-cta::before,
  .final-cta::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .final-cta::before {
    z-index: -2;
    background:
      radial-gradient(
        circle at 50% 10%,
        color-mix(in srgb, var(--fcta-text) 14%, transparent),
        transparent 48%
      ),
      linear-gradient(
        135deg,
        transparent,
        color-mix(in srgb, var(--fcta-text) 6%, transparent)
      );
  }

  .final-cta[data-has-image="true"][data-overlay-style="dark-gradient"]::after {
    z-index: -1;
    background: linear-gradient(
      180deg,
      rgb(0 0 0 / var(--fcta-overlay-alpha)) 0%,
      rgb(0 0 0 / var(--fcta-overlay-soft-alpha)) 55%,
      rgb(0 0 0 / var(--fcta-overlay-strong-alpha)) 100%
    );
  }

  .final-cta[data-has-image="true"][data-overlay-style="light-gradient"]::after {
    z-index: -1;
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / var(--fcta-overlay-alpha)) 0%,
      rgb(255 255 255 / var(--fcta-overlay-soft-alpha)) 52%,
      rgb(255 255 255 / var(--fcta-overlay-strong-alpha)) 100%
    );
  }

  .final-cta[data-has-image="true"][data-overlay-style="light-gradient"] {
    color: var(--fcta-text);
  }

  .final-cta-image {
    position: absolute;
    z-index: -3;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
  }

  .final-cta-content {
    width: min(100%, 780px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .final-cta-panel {
    width: fit-content;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(0.8rem, 2.4vw, 1.4rem);
  }

  .final-cta[data-has-image="true"][data-overlay-style^="glass"]
    .final-cta-content {
    max-width: none;
  }

  .final-cta[data-has-image="true"][data-overlay-style^="glass"]
    .final-cta-panel {
    width: calc(100% + (var(--fcta-padding-x) * 2));
    max-width: none;
    margin-inline: calc(-1 * var(--fcta-padding-x));
    padding: clamp(1.1rem, 3.6vw, 2.2rem) var(--fcta-padding-x);
    border: 0;
    border-block: 1px solid rgb(255 255 255 / 0.16);
    border-radius: 0;
    background: linear-gradient(
      90deg,
      rgb(0 0 0 / var(--fcta-overlay-soft-alpha)) 0%,
      rgb(0 0 0 / var(--fcta-overlay-strong-alpha)) 50%,
      rgb(0 0 0 / var(--fcta-overlay-soft-alpha)) 100%
    );
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.1);
    backdrop-filter: blur(18px) saturate(145%);
    -webkit-backdrop-filter: blur(18px) saturate(145%);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"] {
    color: var(--fcta-text);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"]
    .final-cta-panel {
    border-block-color: rgb(255 255 255 / 0.42);
    background: linear-gradient(
      90deg,
      rgb(255 255 255 / var(--fcta-overlay-soft-alpha)) 0%,
      rgb(255 255 255 / var(--fcta-overlay-strong-alpha)) 50%,
      rgb(255 255 255 / var(--fcta-overlay-soft-alpha)) 100%
    );
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.34);
  }

  .final-cta[data-content-position="center"] .final-cta-content {
    justify-content: center;
  }

  .final-cta[data-content-position="bottom"] .final-cta-content {
    justify-content: flex-end;
  }

  .final-cta[data-has-image="false"] .final-cta-content {
    justify-content: center;
  }

  .final-cta-message {
    max-width: 20ch;
    margin: 0;
    color: inherit;
    font-size: clamp(1.65rem, 6.5vw, 4.25rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.035em;
    white-space: pre-line;
    text-wrap: balance;
    text-shadow: 0 2px 20px rgb(0 0 0 / 0.24);
  }

  .final-cta-button {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.62rem 1.35rem;
    border: 1px solid color-mix(in srgb, var(--fcta-button-bg) 82%, transparent);
    border-radius: 999px;
    background: var(--fcta-button-bg);
    color: var(--fcta-button-text);
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.18);
    font-size: 0.9rem;
    font-weight: 800;
    line-height: 1;
    text-decoration: none;
    transition:
      transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.25s ease;
  }

  .final-cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 34px rgb(0 0 0 / 0.24);
  }

  .final-cta-button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }

  .final-cta[data-button-style="outline"] .final-cta-button {
    border-color: var(--fcta-button-bg);
    background: color-mix(in srgb, var(--fcta-button-bg) 8%, transparent);
    color: var(--fcta-button-bg);
    box-shadow: none;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .final-cta[data-button-style="outline"] .final-cta-button:hover {
    background: color-mix(in srgb, var(--fcta-button-bg) 16%, transparent);
    box-shadow: 0 12px 30px rgb(0 0 0 / 0.16);
  }

  .final-cta[data-has-image="true"][data-overlay-style="light-gradient"]
    .final-cta-message {
    text-shadow: 0 2px 18px rgb(255 255 255 / 0.38);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"]
    .final-cta-message {
    text-shadow: 0 2px 18px rgb(255 255 255 / 0.38);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"]
    .final-cta-button {
    border-color: var(--fcta-button-bg);
    background: var(--fcta-button-bg);
    color: var(--fcta-button-text);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"][data-button-style="outline"]
    .final-cta-button {
    border-color: currentColor;
    background: color-mix(in srgb, currentColor 8%, transparent);
    color: currentColor;
  }

  .final-cta[data-has-image="true"][data-overlay-style="light-gradient"][data-button-style="outline"]
    .final-cta-button {
    border-color: currentColor;
    background: color-mix(in srgb, currentColor 8%, transparent);
    color: currentColor;
  }

  .footer {
    --f-bg: #050505;
    --f-text: #ffffff;
    --f-radius: clamp(24px, 5vw, 42px);
    --f-pad-y: clamp(3.5rem, 9vw, 6.5rem);

    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100%;
    padding: var(--f-pad-y) clamp(1.25rem, 5vw, 4rem)
      calc(var(--f-pad-y) * 0.82);
    border-radius: var(--f-radius) var(--f-radius) 0 0;
    background: var(--f-bg);
    color: var(--f-text);
    text-align: center;
  }

  .final-cta + .footer {
    z-index: 2;
    margin-top: calc(-1 * var(--fcta-footer-overlap));
    box-shadow: 0 -16px 38px rgb(0 0 0 / 0.1);
  }

  .footer::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        circle at 50% -35%,
        color-mix(in srgb, var(--f-text) 9%, transparent),
        transparent 43%
      ),
      linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--f-text) 5%, transparent),
        transparent
      );
  }

  .footer[data-radius="none"] {
    --f-radius: 0px;
  }
  .footer[data-radius="soft"] {
    --f-radius: clamp(14px, 3vw, 22px);
  }
  .footer[data-radius="rounded"] {
    --f-radius: clamp(24px, 5vw, 42px);
  }

  .footer[data-spacing="compact"] {
    --f-pad-y: clamp(2rem, 5vw, 3rem);
  }
  .footer[data-spacing="comfortable"] {
    --f-pad-y: clamp(3.5rem, 9vw, 6.5rem);
  }
  .footer[data-spacing="airy"] {
    --f-pad-y: clamp(4.75rem, 12vw, 8rem);
  }

  .inner {
    width: min(100%, 760px);
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .brand {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    text-decoration: none;
  }

  .logo {
    display: block;
    width: min(42%, 220px);
    height: auto;
    max-height: 92px;
    object-fit: contain;
  }

  .footer[data-logo-tone="light"] .logo {
    filter: brightness(0) invert(1);
  }

  .footer[data-spacing="compact"] .logo {
    width: min(30%, 150px);
    max-height: 70px;
  }

  .brand-name {
    margin: 0;
    padding-inline-start: 0.34em;
    color: inherit;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.9rem, 6.25vw, 3.15rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.34em;
    text-transform: uppercase;
  }

  .description {
    max-width: 680px;
    margin: clamp(1.8rem, 5vw, 3.1rem) 0 0;
    color: inherit;
    font-size: clamp(1rem, 2.7vw, 1.24rem);
    font-weight: 700;
    line-height: 1.75;
    white-space: pre-line;
    text-wrap: balance;
  }

  .footer[data-spacing="compact"] .description {
    margin-top: clamp(1rem, 3vw, 1.5rem);
    font-size: clamp(0.88rem, 2.3vw, 1rem);
    line-height: 1.65;
  }

  .socials {
    display: flex;
    direction: ltr;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: clamp(0.75rem, 2.4vw, 1rem);
    margin-top: clamp(2rem, 6vw, 3.35rem);
  }

  .footer[data-spacing="compact"] .socials {
    margin-top: clamp(1.25rem, 4vw, 2rem);
  }

  .social-link {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in srgb, var(--f-text) 28%, transparent);
    border-radius: 50%;
    background: var(--f-text);
    color: var(--f-bg);
    text-decoration: none;
    transition:
      transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .socials[data-style="outline"] .social-link {
    background: transparent;
    color: var(--f-text);
  }

  .social-link:hover {
    transform: translateY(-4px);
  }

  .social-link:focus-visible {
    outline: 2px solid var(--f-text);
    outline-offset: 4px;
  }

  .social-link svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  .copyright {
    width: 100%;
    margin: clamp(2.4rem, 7vw, 4rem) 0 0;
    padding-top: clamp(1.2rem, 3vw, 1.7rem);
    border-top: 1px solid color-mix(in srgb, var(--f-text) 14%, transparent);
    color: color-mix(in srgb, var(--f-text) 64%, transparent);
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    .final-cta {
      min-height: 430px;
      padding-top: 2.75rem;
    }

    .final-cta[data-has-image="false"] {
      min-height: 0;
      padding-block: 4rem calc(4rem + var(--fcta-footer-overlap));
    }

    .social-link {
      width: 32px;
      height: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .final-cta-button,
    .social-link {
      transition: none;
    }
  }
`;
var D = Object.defineProperty, M = (o, t, e, a) => {
  for (var r = void 0, n = o.length - 1, l; n >= 0; n--)
    (l = o[n]) && (r = l(t, e, r) || r);
  return r && D(t, e, r), r;
};
const h = class h extends L {
  _socials() {
    const t = this.config || {};
    return [
      this._social(
        "X",
        t.x_url,
        i`<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
          />
        </svg>`
      ),
      this._social(
        "Snapchat",
        t.snapchat_url,
        i`<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path
            d="M12.04 2.25c-3.3 0-5.35 2.54-5.35 5.7 0 .73.12 1.5.25 2.14-.39.22-1.04.45-1.65.22-.51-.2-.89-.04-1.02.29-.19.48.43 1.16 1.9 1.73-.42 1.03-1.23 2.32-2.54 2.78-.42.15-.62.47-.54.82.1.43.67.72 1.72.88.17.38.28.85.37 1.2.06.24.3.4.55.37.69-.09 1.36-.04 1.93.15.75.25 1.35.86 2.02 1.34.62.45 1.3.81 2.3.81h.12c1 0 1.69-.36 2.31-.81.67-.48 1.27-1.09 2.02-1.34.57-.19 1.24-.24 1.93-.15.25.03.49-.13.55-.37.09-.35.2-.82.37-1.2 1.05-.16 1.62-.45 1.72-.88.08-.35-.12-.67-.54-.82-1.31-.46-2.12-1.75-2.54-2.78 1.47-.57 2.09-1.25 1.9-1.73-.13-.33-.51-.49-1.02-.29-.61.23-1.26 0-1.65-.22.13-.64.25-1.41.25-2.14 0-3.16-2.05-5.7-5.35-5.7h-.04Z"
          />
        </svg>`
      ),
      this._social(
        "TikTok",
        t.tiktok_url,
        i`<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path
            d="M15.57 2.25h-3.39v13.18a3.05 3.05 0 1 1-2.63-3.02V8.98a6.44 6.44 0 1 0 6.02 6.42V8.7a8.04 8.04 0 0 0 4.7 1.5V6.81a4.7 4.7 0 0 1-4.7-4.56Z"
          />
        </svg>`
      ),
      this._social(
        "Instagram",
        t.instagram_url,
        i`<svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
        </svg>`
      )
    ].filter((a) => !!a);
  }
  _social(t, e, a) {
    const r = typeof e == "string" ? e.trim() : "";
    return r ? { networkName: t, href: r, icon: a } : null;
  }
  updated() {
    var t;
    this._syncAnchor((t = this.config) == null ? void 0 : t.anchor_id, "footer");
  }
  render() {
    const t = this.config || {}, e = t.final_cta_enabled !== !1, a = this.localizedString(t.final_cta_text), r = this.localizedString(t.final_cta_button_label), n = (t.final_cta_button_url || "").trim(), l = this._pickValue(
      t.final_cta_button_style,
      "outline"
    ), c = (t.final_cta_image || "").trim(), s = this._pickValue(
      t.final_cta_vertical_alignment,
      "top"
    ), p = this._pickValue(
      t.final_cta_overlay_style,
      "dark-gradient"
    ), m = Math.min(
      90,
      Math.max(
        0,
        typeof t.final_cta_overlay_darkness == "number" ? t.final_cta_overlay_darkness : 35
      )
    ), k = [
      t.final_cta_background_color ? `--fcta-bg: ${t.final_cta_background_color}` : "",
      t.final_cta_text_color ? `--fcta-text: ${t.final_cta_text_color}` : "",
      t.final_cta_button_background ? `--fcta-button-bg: ${t.final_cta_button_background}` : "",
      t.final_cta_button_text_color ? `--fcta-button-text: ${t.final_cta_button_text_color}` : "",
      `--fcta-overlay-alpha: ${m / 100}`,
      `--fcta-overlay-soft-alpha: ${Math.max(0, m - 15) / 100}`,
      `--fcta-overlay-strong-alpha: ${Math.min(100, m + 20) / 100}`
    ].filter(Boolean).join("; "), u = (t.logo || "").trim(), $ = this._pickValue(t.logo_tone, "original"), b = this.localizedString(t.brand_name) || "AUREN", x = this.localizedString(t.description), v = this.localizedString(t.copyright), y = this._socials(), C = this._pickValue(
      t.social_style,
      "filled"
    ), z = this._pickValue(t.corner_radius, "rounded"), S = this._pickValue(t.spacing, "comfortable"), j = [
      t.background_color ? `--f-bg: ${t.background_color}` : "",
      t.text_color ? `--f-text: ${t.text_color}` : ""
    ].filter(Boolean).join("; ");
    return i`
      ${e ? i`
              <section
                class="final-cta"
                style=${k}
                data-has-image=${c ? "true" : "false"}
                data-content-position=${s}
                data-overlay-style=${p}
                data-button-style=${l}
                aria-label=${a || "الدعوة الختامية"}
              >
                ${c ? i`
                      <img
                        class="final-cta-image"
                        src=${c}
                        alt=""
                        aria-hidden="true"
                      />
                    ` : d}
                <div class="final-cta-content">
                  <div class="final-cta-panel">
                    ${a ? i`<p class="final-cta-message">${a}</p>` : d}
                    ${r && n ? i`
                          <a class="final-cta-button" href=${n}>
                            ${r}
                          </a>
                        ` : d}
                  </div>
                </div>
              </section>
            ` : d}
      <footer
        class="footer"
        style=${j}
        data-radius=${z}
        data-spacing=${S}
        data-logo-tone=${$}
        aria-label="تذييل الصفحة"
      >
        <div class="inner">
          <div class="brand">
            ${u ? i`<img class="logo" src=${u} alt=${b} />` : i`<p class="brand-name">${b}</p>`}
          </div>

          ${x ? i`<p class="description">${x}</p>` : d}
          ${y.length ? i`
                  <div class="socials" data-style=${C}>
                    ${y.map(
      (f) => i`
                      <a
                        class="social-link"
                        href=${f.href}
                        target=${_(f.href === "#" ? void 0 : "_blank")}
                        rel=${_(
        f.href === "#" ? void 0 : "noopener noreferrer"
      )}
                        aria-label=${f.networkName}
                      >
                        ${f.icon}
                      </a>
                    `
    )}
                  </div>
                ` : d}
          ${v ? i`<p class="copyright">${v}</p>` : d}
        </div>
      </footer>
    `;
  }
};
h.styles = I;
let g = h;
M([
  A({ type: Object })
], g.prototype, "config");
typeof g < "u" && g.registerSallaComponent("salla-footer");
export {
  g as default
};
