import { LitElement as j, css as F, nothing as y, html as u } from "lit";
import { property as P, state as R } from "lit/decorators.js";
function W(t, e) {
  if (typeof t == "string") return t;
  if (!t || typeof t != "object") return "";
  const i = t[e] || t.ar || t.en || "";
  return typeof i == "string" ? i.trim() : "";
}
function V(t) {
  return t.replace(/[٠-٩]/g, (e) => String(e.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (e) => String(e.charCodeAt(0) - 1776));
}
class K extends j {
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
    const i = String(e || "").trim(), a = i.toLowerCase().replace(/[^a-z0-9._-]/g, "-"), s = a.includes("-") ? a : `salla-${a || "component"}`, r = () => `${s}-${Math.random().toString(36).substring(2, 8)}`, n = () => {
      var c;
      const d = (c = window.Salla) == null ? void 0 : c.bundles;
      return d && typeof d.registerComponent == "function" ? (d.registerComponent(i, {
        component: this,
        dynamicTagName: r()
      }), !0) : !1;
    };
    if (n()) return;
    const o = window.setInterval(() => {
      n() && window.clearInterval(o);
    }, 100);
    window.setTimeout(() => window.clearInterval(o), 5e3);
  }
  /** Resolved document language. */
  _lang() {
    return (document.documentElement.lang || "ar").toLowerCase().startsWith("en") ? "en" : "ar";
  }
  /** Pull the store-language string out of a Salla multilanguage value. */
  localizedString(e) {
    return W(e, this._lang());
  }
  /** Dropdown-list values from settings may come as [{ label, value }]. */
  _pickValue(e, i) {
    if (typeof e == "string" && e) return e;
    if (Array.isArray(e) && e.length > 0) {
      const a = e[0];
      if (a && typeof a.value == "string" && a.value)
        return a.value;
    }
    return i;
  }
  /** See module-level toLatinDigits; exposed for subclasses. */
  _toLatinDigits(e) {
    return V(e);
  }
  /**
   * The inverse: render a number in the digits the store's language uses, so a
   * counter or a step badge matches the copy beside it. Latin digits outside
   * Arabic, Arabic-Indic inside it.
   */
  _localeNum(e) {
    return this._lang() !== "ar" ? String(e) : String(e).replace(
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
  _slugify(e, i) {
    var r;
    return (typeof e == "string" ? e : Array.isArray(e) ? String(((r = e[0]) == null ? void 0 : r.value) ?? "") : "").trim().replace(/^#+/, "").replace(/\s+/g, "-").replace(/["'<>&#?/\\%]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || i;
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
  _syncAnchor(e, i, a = 24) {
    const s = this._slugify(e, i);
    if (!s || s === this._anchorBase) return;
    this._anchorBase = s;
    let r = s;
    for (let o = 2; ; o++) {
      const d = document.getElementById(r);
      if (!d || d === this) break;
      r = `${s}-${o}`;
    }
    if (this.id = r, this.style.scrollMarginTop = `${a}px`, this._anchorDeepLinked) return;
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
  _scrollToAnchor(e, i) {
    if (!i.startsWith("#") || i === "#") return;
    let a = i.slice(1);
    try {
      a = decodeURIComponent(a);
    } catch {
    }
    const s = document.getElementById(a);
    if (!s) return;
    e.preventDefault();
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
  _num(e, i) {
    if (typeof e == "number" && !Number.isNaN(e)) return e;
    if (typeof e == "string" && e.trim() !== "") {
      const a = Number(V(e.trim()));
      if (!Number.isNaN(a)) return a;
    }
    if (Array.isArray(e) && e.length > 0) {
      const a = e[0];
      if ((a == null ? void 0 : a.value) !== void 0) return this._num(a.value, i);
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
}, g = {
  none: 0,
  xs: 20,
  sm: 32,
  md: 64,
  lg: 96,
  xl: 128
};
function q(t, e, i = "md", a = "md") {
  const s = e(t == null ? void 0 : t.space_top, i), r = e(t == null ? void 0 : t.space_bottom, a), n = $[s] ?? $.md, o = $[r] ?? $.md, d = g[s] ?? g.md, c = g[r] ?? g.md;
  return [
    `--sp-top-m:${n}px`,
    `--sp-bot-m:${o}px`,
    `--sp-top-d:${d}px`,
    `--sp-bot-d:${c}px`
  ];
}
const S = {
  top: { top: "0%", pull: "0%" },
  center: { top: "50%", pull: "-50%" },
  bottom: { top: "100%", pull: "-100%" }
};
function H(t, e, i, a = 1) {
  const s = t == null ? void 0 : t.side_visual_count, r = s == null ? void 0 : e(s, "off"), n = ((t == null ? void 0 : t.side_image) || "").trim(), o = r ? r !== "off" : (t == null ? void 0 : t.enable_side_visual) === !0 || (t == null ? void 0 : t.enable_side_visual) == null && !!n;
  if (!(a === 1 ? o : r ? r === "two" : o && (t == null ? void 0 : t.enable_second_side_visual) === !0)) return null;
  const c = (a === 1 ? (t == null ? void 0 : t.side_image) || "" : (t == null ? void 0 : t.side2_image) || "").trim();
  if (!c) return null;
  const p = e(
    a === 1 ? t == null ? void 0 : t.side_side : t == null ? void 0 : t.side2_side,
    a === 1 ? "right" : "left"
  ), _ = e(
    a === 1 ? t == null ? void 0 : t.side_depth : t == null ? void 0 : t.side2_depth,
    "front"
  ), m = (a === 1 ? [
    t == null ? void 0 : t.side_width_desktop,
    t == null ? void 0 : t.side_vpos_desktop,
    t == null ? void 0 : t.side_x_desktop,
    t == null ? void 0 : t.side_y_desktop
  ] : [
    t == null ? void 0 : t.side2_width_desktop,
    t == null ? void 0 : t.side2_vpos_desktop,
    t == null ? void 0 : t.side2_x_desktop,
    t == null ? void 0 : t.side2_y_desktop
  ]).some(
    (I) => I != null && I !== ""
  ), h = r ? !0 : (a === 1 ? t == null ? void 0 : t.side_desktop_custom : t == null ? void 0 : t.side2_desktop_custom) === !0 || m, w = e(
    a === 1 ? t == null ? void 0 : t.side_vpos : t == null ? void 0 : t.side2_vpos,
    a === 1 ? "top" : "bottom"
  ), k = e(
    a === 1 ? t == null ? void 0 : t.side_vpos_desktop : t == null ? void 0 : t.side2_vpos_desktop,
    "inherit"
  ), l = !h || k === "inherit" ? w : k, b = i(a === 1 ? t == null ? void 0 : t.side_width : t == null ? void 0 : t.side2_width, 45), x = h ? i(
    a === 1 ? t == null ? void 0 : t.side_width_desktop : t == null ? void 0 : t.side2_width_desktop,
    b
  ) : b, z = i(a === 1 ? t == null ? void 0 : t.side_x : t == null ? void 0 : t.side2_x, 20), B = h ? i(a === 1 ? t == null ? void 0 : t.side_x_desktop : t == null ? void 0 : t.side2_x_desktop, z) : z, E = i(a === 1 ? t == null ? void 0 : t.side_y : t == null ? void 0 : t.side2_y, 0), L = h ? i(a === 1 ? t == null ? void 0 : t.side_y_desktop : t == null ? void 0 : t.side2_y_desktop, E) : E, T = S[w] ?? S.top, C = S[l] ?? S.top;
  return {
    image: c,
    side: p,
    depth: _,
    slot: a,
    vars: [
      `--se${a}-w-m:${b}%`,
      `--se${a}-w-d:${x}%`,
      `--se${a}-x-m:${z}%`,
      `--se${a}-x-d:${B}%`,
      `--se${a}-y-m:${E}%`,
      `--se${a}-y-d:${L}%`,
      `--se${a}-top-m:${T.top}`,
      `--se${a}-top-d:${C.top}`,
      `--se${a}-pull-m:${T.pull}`,
      `--se${a}-pull-d:${C.pull}`,
      `--se${a}-op:${Math.max(
        0,
        Math.min(
          100,
          i(a === 1 ? t == null ? void 0 : t.side_opacity : t == null ? void 0 : t.side2_opacity, 100)
        )
      ) / 100}`
    ]
  };
}
const G = F`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    /* Width comes from the container, never from the contents. */
    min-width: 0;
    max-width: 100%;

    --uc-bg: #f5f5f5;
    --uc-title: #14181f;
    --uc-subtitle: #5b6270;
    --uc-card-bg: #ffffff;
    --uc-card-title: #14181f;
    --uc-card-text: #5b6270;
    --uc-ov-title: #ffffff;
    --uc-ov-text: rgba(255, 255, 255, 0.86);
    --uc-num-bg: #14181f;
    --uc-num-fg: #ffffff;

    --uc-radius: 18px;
    --uc-stack-max: 860px;
    --uc-pad-x: clamp(1rem, 4vw, 2.5rem);
    --uc-ease: cubic-bezier(0.22, 1, 0.36, 1);

    /* Overlaid copy. */
    --uc-scrim: 0.7;
    /* Row layout: how far the out-of-focus frames recede. */
    --uc-dim: 0.48;
    --uc-idle-scale: 0.94;

    /* Mobile values; the desktop pair is set alongside and swapped below. */
    --uc-gap-m: 16px;
    --uc-gap-d: 22px;
    --uc-share-m: 38%;
    --uc-share-d: 42%;
    --uc-item-m: 62vw;
    --uc-item-d: 22vw;
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
  .uc {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--uc-bg);
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts. */
    padding-block: var(--sp-top-m) var(--sp-bot-m);
    /* Not overflow:hidden — the row strip is meant to bleed off both edges.
       The horizontal clip lives on the strip itself instead. */
    overflow: clip visible;

    --uc-gap: var(--uc-gap-m);
    --uc-share: var(--uc-share-m);
    --uc-item: var(--uc-item-m);
  }

  .uc-header {
    max-width: 680px;
    margin: 0 auto clamp(1.5rem, 5vw, 2.5rem);
    padding-inline: var(--uc-pad-x);
    text-align: center;
  }
  .uc-h2 {
    margin: 0;
    color: var(--uc-title);
    font-size: clamp(1.6rem, 5.8vw, 2.2rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .uc-sub {
    margin: 0.6rem 0 0;
    color: var(--uc-subtitle);
    font-size: clamp(0.9rem, 3.4vw, 1.05rem);
    line-height: 1.8;
  }

  .uc-header,
  .uc-stack,
  .uc-strip,
  .uc-empty {
    position: relative;
    z-index: 2;
  }

  /* ============================================================
     SIDE DESIGN ELEMENT (عنصر بصري جانبي)
     Uses the same shared resolver and controls as FAQ and Gallery.
     ============================================================ */
  .uc-side {
    position: absolute;
    top: var(--se-top, 0%);
    width: var(--se-w, 45%);
    height: auto;
    opacity: var(--se-op, 1);
    pointer-events: none;
    user-select: none;
    max-width: none;
  }
  .uc-side[data-depth="behind"] {
    z-index: 0;
  }
  .uc-side[data-depth="front"] {
    z-index: 3;
  }
  .uc-side[data-slot="1"] {
    --se-w: var(--se1-w-m);
    --se-x: var(--se1-x-m);
    --se-y: var(--se1-y-m);
    --se-top: var(--se1-top-m);
    --se-pull: var(--se1-pull-m);
    --se-op: var(--se1-op);
  }
  .uc-side[data-slot="2"] {
    --se-w: var(--se2-w-m);
    --se-x: var(--se2-x-m);
    --se-y: var(--se2-y-m);
    --se-top: var(--se2-top-m);
    --se-pull: var(--se2-pull-m);
    --se-op: var(--se2-op);
  }
  .uc-side[data-side="left"] {
    left: 0;
    transform: translate(
      calc(-1 * var(--se-x, 0%)),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }
  .uc-side[data-side="center"] {
    left: 50%;
    transform: translate(
      calc(-50% + var(--se-x, 0%)),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }
  .uc-side[data-flow="true"][data-side="center"] {
    position: relative;
    top: auto;
    left: auto;
    display: block;
    margin: clamp(2.5rem, 10vw, 5rem) auto 0;
    transform: translate(var(--se-x, 0%), var(--se-y, 0%));
  }
  .uc-side[data-side="right"] {
    right: 0;
    transform: translate(
      var(--se-x, 0%),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }

  /* ============================================================
     FRAME — one photo with its copy laid over it.
     Shared by the row layout and by stack cards set to "text over photo".
     ============================================================ */
  .uc-frame {
    position: relative;
    margin: 0;
    overflow: hidden;
    border-radius: var(--uc-radius);
    background: rgba(0, 0, 0, 0.06);
    aspect-ratio: var(--uc-frame-ar, 4 / 5);
    transform-origin: center;
    transition: transform 0.45s var(--uc-ease);
  }
  .uc-frame > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  /* Scrim under the copy. Sized off the caption's own corner so a bottom
     caption gets a bottom-up wash and a centred one gets an even veil. */
  .uc-frame::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      to top,
      rgba(8, 8, 10, var(--uc-scrim)) 0%,
      rgba(8, 8, 10, calc(var(--uc-scrim) * 0.6)) 26%,
      rgba(8, 8, 10, 0) 62%
    );
  }
  .uc-frame[data-pos="center"]::before {
    background: linear-gradient(
      to top,
      rgba(8, 8, 10, calc(var(--uc-scrim) * 0.85)) 0%,
      rgba(8, 8, 10, calc(var(--uc-scrim) * 0.8)) 55%,
      rgba(8, 8, 10, calc(var(--uc-scrim) * 0.5)) 100%
    );
  }
  /* Nothing to wash out when the card carries no copy. */
  .uc-frame[data-bare="true"]::before {
    display: none;
  }

  .uc-cap {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: clamp(0.85rem, 3.4vw, 1.35rem);
    color: var(--uc-ov-title);
  }
  /* Laid ON the photo: absolutely placed inside the clipped frame. */
  .uc-cap[data-place="over"] {
    position: absolute;
    inset-inline: 0;
    z-index: 2;
  }
  .uc-cap[data-place="over"][data-pos="bottom"] {
    bottom: 0;
  }
  .uc-cap[data-place="over"][data-pos="center"] {
    top: 50%;
    transform: translateY(-50%);
  }
  /* Sitting UNDER the photo: normal flow, no scrim, so it takes the card's
     copy colours rather than the on-photo pair. */
  .uc-cap[data-place="outside"] {
    padding-inline: 0;
    padding-bottom: 0;
    color: var(--uc-card-title);
  }
  .uc-cap[data-place="outside"] .uc-cap-title {
    color: var(--uc-card-title);
    text-shadow: none;
  }
  .uc-cap[data-place="outside"] .uc-cap-text {
    color: var(--uc-card-text);
  }
  .uc-cap[data-align="center"] {
    text-align: center;
    align-items: center;
  }
  .uc-cap[data-align="start"] {
    text-align: start;
    align-items: stretch;
  }
  .uc-cap-title {
    font-size: clamp(0.95rem, 3.6vw, 1.2rem);
    font-weight: 700;
    line-height: 1.35;
    color: var(--uc-ov-title);
    text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35);
  }
  .uc-cap-text {
    font-size: clamp(0.78rem, 2.9vw, 0.92rem);
    line-height: 1.7;
    color: var(--uc-ov-text);
    max-width: 34ch;
  }
  .uc-cap[data-align="center"] .uc-cap-text {
    margin-inline: auto;
  }

  /* ============================================================
     STEP BADGE — only rendered when the merchant asks for numbering
     ============================================================ */
  .uc-num {
    flex: 0 0 auto;
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.85em;
    height: 1.85em;
    padding-inline: 0.4em;
    margin-bottom: 0.15rem;
    border-radius: 999px;
    background: var(--uc-num-bg);
    color: var(--uc-num-fg);
    font-size: clamp(0.72rem, 2.8vw, 0.85rem);
    font-weight: 700;
    line-height: 1;
    /* The badge reads as a figure, not as running copy — tabular digits keep a
       column of them the same width whatever the numeral system. */
    font-variant-numeric: tabular-nums;
  }
  [data-align="center"] > .uc-num {
    align-self: center;
  }
  /* Over a photo the merchant's badge colours would be fighting the scrim, so
     the badge takes a fixed translucent treatment that reads on any image. A
     badge under the photo has no scrim to fight and keeps the merchant's. */
  .uc-cap[data-place="over"] .uc-num {
    background: rgba(255, 255, 255, 0.18);
    color: var(--uc-ov-title);
    border: 1px solid rgba(255, 255, 255, 0.38);
    backdrop-filter: blur(4px);
  }

  /* ============================================================
     STACK — cards one above the other
     ============================================================ */
  .uc-stack {
    display: flex;
    flex-direction: column;
    gap: var(--uc-gap);
    width: 100%;
    max-width: var(--uc-stack-max);
    margin-inline: auto;
    padding-inline: var(--uc-pad-x);
  }

  .uc-card {
    /* Physical sides: flex-direction must not follow the store language. */
    direction: ltr;
    position: relative;
    display: flex;
    align-items: stretch;
    min-width: 0;
    background: var(--uc-card-bg);
    border-radius: var(--uc-radius);
    overflow: hidden;
  }
  .uc-card[data-side="left"] {
    flex-direction: row;
  }
  .uc-card[data-side="right"] {
    flex-direction: row-reverse;
  }

  .uc-media {
    position: relative;
    flex: 0 0 var(--uc-share);
    min-width: 0;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.05);
  }
  /* Gives the media its own height from the chosen frame shape. The photo is
     taken out of flow on top of it, so a card whose copy runs longer simply
     stretches the media instead of letting the photo dictate the card. */
  .uc-media::before {
    content: "";
    display: block;
    width: 100%;
    aspect-ratio: var(--uc-stack-ar, 1 / 1);
  }
  .uc-media img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .uc-body {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.45rem;
    padding: clamp(0.9rem, 4vw, 1.75rem);
  }
  .uc-body[data-align="center"] {
    text-align: center;
    align-items: center;
  }
  .uc-body[data-align="start"] {
    text-align: start;
    align-items: stretch;
  }
  .uc-card-title {
    margin: 0;
    color: var(--uc-card-title);
    font-size: clamp(1rem, 4vw, 1.25rem);
    font-weight: 700;
    line-height: 1.4;
  }
  .uc-card-text {
    margin: 0;
    color: var(--uc-card-text);
    font-size: clamp(0.85rem, 3.4vw, 1rem);
    line-height: 1.85;
  }

  /* Stack cards set to "copy over the photo" are just the shared frame at full
     card width — no card chrome of its own. */
  .uc-stack .uc-frame {
    --uc-frame-ar: var(--uc-stack-over-ar, 4 / 3);
  }

  /* ============================================================
     ROW — a scroll-snapping strip that bleeds off both edges
     ============================================================ */
  .uc-strip {
    display: flex;
    align-items: center;
    gap: var(--uc-gap);
    /* Safe centring: the strip sits centred while it fits and bleeds off BOTH
       edges once it does not, which is the look this layout is for. A plain
       "center" would put the overflowing start out of reach of scrolling; the
       safe keyword falls back to flex-start in exactly that case. */
    justify-content: safe center;
    padding-inline: var(--uc-pad-x);
    padding-block: 6px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .uc-strip::-webkit-scrollbar {
    display: none;
  }

  .uc-slide {
    flex: 0 0 var(--uc-item);
    min-width: 0;
    scroll-snap-align: center;
  }
  .uc-strip .uc-frame {
    --uc-frame-ar: var(--uc-aspect, 4 / 5);
  }
  /* Wrapper used only when the caption sits under the photo, so the two move
     as one under the focus transform. */
  .uc-fig {
    margin: 0;
    transform-origin: center;
    transition: transform 0.45s var(--uc-ease);
  }

  /* Focus: the frame nearest the middle comes forward, the rest recede. */
  .uc-strip[data-focus="on"] .uc-frame,
  .uc-strip[data-focus="on"] .uc-fig {
    transform: scale(var(--uc-idle-scale));
  }
  /* The wrapper already scales the photo inside it — don't compound the two. */
  .uc-strip[data-focus="on"] .uc-fig .uc-frame {
    transform: none;
  }
  .uc-strip[data-focus="on"] .uc-slide[data-active="true"] .uc-frame,
  .uc-strip[data-focus="on"] .uc-slide[data-active="true"] .uc-fig {
    transform: none;
  }
  /* Copy under a photo has no scrim to dim it, so it recedes on its own. */
  .uc-strip[data-focus="on"]
    .uc-slide:not([data-active="true"])
    .uc-cap[data-place="outside"] {
    opacity: 0.45;
    transition: opacity 0.45s var(--uc-ease);
  }
  .uc-strip[data-focus="on"] .uc-frame::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: rgba(10, 10, 12, var(--uc-dim));
    transition: opacity 0.45s var(--uc-ease);
  }
  .uc-strip[data-focus="on"] .uc-slide[data-active="true"] .uc-frame::after {
    opacity: 0;
  }

  .uc-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.92rem;
  }

  /* ============================================================
     MOTION
     ============================================================ */
  .uc-card,
  .uc-slide {
    transition:
      opacity 0.6s var(--uc-ease),
      transform 0.6s var(--uc-ease);
  }
  [data-anim="ready"] .uc-card,
  [data-anim="ready"] .uc-slide {
    opacity: 0;
    transform: translateY(14px);
  }
  [data-anim="in"] .uc-card,
  [data-anim="in"] .uc-slide {
    opacity: 1;
    transform: none;
  }
  [data-anim="ready"] .uc-card:nth-child(1),
  [data-anim="ready"] .uc-slide:nth-child(1) {
    transition-delay: 0.04s;
  }
  [data-anim="ready"] .uc-card:nth-child(2),
  [data-anim="ready"] .uc-slide:nth-child(2) {
    transition-delay: 0.12s;
  }
  [data-anim="ready"] .uc-card:nth-child(3),
  [data-anim="ready"] .uc-slide:nth-child(3) {
    transition-delay: 0.2s;
  }
  [data-anim="ready"] .uc-card:nth-child(4),
  [data-anim="ready"] .uc-slide:nth-child(4) {
    transition-delay: 0.28s;
  }
  [data-anim="ready"] .uc-card:nth-child(n + 5),
  [data-anim="ready"] .uc-slide:nth-child(n + 5) {
    transition-delay: 0.34s;
  }

  @media (prefers-reduced-motion: reduce) {
    .uc-card,
    .uc-slide,
    .uc-frame,
    .uc-fig,
    .uc-cap,
    .uc-frame::after {
      transition: none !important;
    }
    [data-anim="ready"] .uc-card,
    [data-anim="ready"] .uc-slide {
      opacity: 1;
      transform: none;
    }
    .uc-strip {
      scroll-behavior: auto;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    .uc {
      padding-block: var(--sp-top-d) var(--sp-bot-d);
    }
    .uc {
      --uc-gap: var(--uc-gap-d);
      --uc-share: var(--uc-share-d);
      --uc-item: var(--uc-item-d);
    }
    .uc-body {
      gap: 0.6rem;
      padding: clamp(1.5rem, 3vw, 2.75rem);
    }
    .uc-side[data-slot="1"] {
      --se-w: var(--se1-w-d);
      --se-x: var(--se1-x-d);
      --se-y: var(--se1-y-d);
      --se-top: var(--se1-top-d);
      --se-pull: var(--se1-pull-d);
    }
    .uc-side[data-slot="2"] {
      --se-w: var(--se2-w-d);
      --se-x: var(--se2-x-d);
      --se-y: var(--se2-y-d);
      --se-top: var(--se2-top-d);
      --se-pull: var(--se2-pull-d);
    }
    .uc-cap-title {
      font-size: clamp(1.05rem, 1.3vw, 1.3rem);
    }
  }
`;
var U = Object.defineProperty, A = (t, e, i, a) => {
  for (var s = void 0, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (s = n(e, i, s) || s);
  return s && U(e, i, s), s;
};
const Y = {
  small: "48vw",
  medium: "62vw",
  large: "76vw"
}, Q = {
  small: "17vw",
  medium: "22vw",
  large: "28vw"
}, J = {
  sm: "32%",
  md: "38%",
  lg: "46%"
}, X = {
  sm: "34%",
  md: "42%",
  lg: "50%"
}, D = {
  soft: 0.5,
  medium: 0.7,
  strong: 0.88
}, N = {
  soft: 0.28,
  medium: 0.48,
  strong: 0.66
}, O = (t, e, i) => Math.max(e, Math.min(i, t)), Z = (t) => t === "left" ? "right" : "left", M = class M extends K {
  constructor() {
    super(...arguments), this._animState = "ready", this._activeIndex = -1, this._io = null, this._fallbackTimer = null, this._strip = null, this._centered = !1, this._rafId = null, this._reveal = () => {
      var e;
      this._animState = "in", (e = this._io) == null || e.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null);
    }, this._onStripScroll = () => {
      this._rafId === null && (this._rafId = requestAnimationFrame(() => {
        this._rafId = null, this._syncActive();
      }));
    };
  }
  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------
  /** Only use cases that actually carry a photo can render. */
  _items() {
    var i;
    const e = (i = this.config) == null ? void 0 : i.items;
    return Array.isArray(e) ? e.filter(
      (a) => !!a && typeof a == "object" && !!(a.image || "").trim()
    ) : [];
  }
  _reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  _layout() {
    var e;
    return this._pickValue((e = this.config) == null ? void 0 : e.layout, "stack");
  }
  /**
   * Does the copy sit ON the photo? One question, one field, both layouts —
   * which is the whole reason `text_position` is not per-layout: the panel can
   * only hide the overlay settings behind a single `field = value` test.
   */
  _isOverlay() {
    var e;
    return this._pickValue(
      (e = this.config) == null ? void 0 : e.text_position,
      "outside"
    ) === "over";
  }
  _focusEnabled() {
    var e;
    return this._layout() === "row" && ((e = this.config) == null ? void 0 : e.focus_center) !== !1;
  }
  connectedCallback() {
    if (super.connectedCallback(), window.addEventListener("resize", this._onStripScroll, { passive: !0 }), !("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }
    this._io = new IntersectionObserver(
      (e) => {
        var i;
        (i = e[0]) != null && i.isIntersecting && this._reveal();
      },
      { threshold: 0.12 }
    ), this._io.observe(this), this._fallbackTimer = window.setTimeout(() => {
      if (this._fallbackTimer = null, this._animState === "in") return;
      const e = this.getBoundingClientRect();
      (e.height === 0 || e.top < window.innerHeight && e.bottom > 0) && this._reveal();
    }, 3e3);
  }
  disconnectedCallback() {
    var e, i;
    super.disconnectedCallback(), (e = this._io) == null || e.disconnect(), this._io = null, this._fallbackTimer !== null && (clearTimeout(this._fallbackTimer), this._fallbackTimer = null), this._rafId !== null && (cancelAnimationFrame(this._rafId), this._rafId = null), window.removeEventListener("resize", this._onStripScroll), (i = this._strip) == null || i.removeEventListener("scroll", this._onStripScroll), this._strip = null, this._centered = !1;
  }
  updated() {
    var e;
    this._syncAnchor((e = this.config) == null ? void 0 : e.anchor_id, "use-cases"), this._syncStrip();
  }
  // ------------------------------------------------------------
  // Row layout — which frame is in the middle
  // ------------------------------------------------------------
  /**
   * Wire (or unwire) the strip after a render. The layout dropdown can swap the
   * strip in and out at any time, so this runs every cycle and keys off the
   * element identity rather than a one-time flag.
   */
  _syncStrip() {
    var i;
    const e = this._focusEnabled() ? this.renderRoot.querySelector(".uc-strip") : null;
    e !== this._strip && ((i = this._strip) == null || i.removeEventListener("scroll", this._onStripScroll), this._strip = e, this._centered = !1, e == null || e.addEventListener("scroll", this._onStripScroll, { passive: !0 })), !(!e || this._centered) && (this._centered = !0, requestAnimationFrame(() => {
      const a = this._slides();
      a.length > 2 && this._centerSlide(Math.floor((a.length - 1) / 2)), this._syncActive();
    }));
  }
  _slides() {
    return this._strip ? Array.from(this._strip.querySelectorAll(".uc-slide")) : [];
  }
  /**
   * Measured in viewport coordinates rather than from `scrollLeft`, which is
   * the one number that genuinely differs between engines in RTL (0 at the
   * right edge and counting down in some, counting up in others). Rectangles
   * are the same everywhere.
   */
  _syncActive() {
    const e = this._strip, i = this._slides();
    if (!e || i.length === 0) return;
    const a = e.getBoundingClientRect(), s = a.left + a.width / 2;
    let r = 0, n = 1 / 0;
    i.forEach((o, d) => {
      const c = o.getBoundingClientRect(), p = Math.abs(c.left + c.width / 2 - s);
      p < n && (n = p, r = d);
    }), r !== this._activeIndex && (this._activeIndex = r);
  }
  /** Scroll the strip so one frame sits in its middle. Direction-agnostic. */
  _centerSlide(e) {
    const i = this._strip, a = this._slides()[e];
    if (!i || !a) return;
    const s = i.getBoundingClientRect(), r = a.getBoundingClientRect(), n = r.left + r.width / 2 - (s.left + s.width / 2);
    Math.abs(n) < 1 || i.scrollBy({ left: n, behavior: "auto" });
  }
  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  _hostStyle(e, i) {
    const a = this._pickValue(
      e.image_share,
      "md"
    ), s = this._pickValue(
      e.image_share_desktop,
      "inherit"
    ), r = s === "inherit" ? a : s, n = this._pickValue(e.item_size, "medium"), o = this._pickValue(
      e.item_size_desktop,
      "inherit"
    ), d = o === "inherit" ? n : o, c = Math.max(0, this._num(e.gap, 16)), p = D[this._pickValue(e.overlay_strength, "medium")] ?? D.medium, _ = N[this._pickValue(e.dim_strength, "medium")] ?? N.medium;
    return [
      e.bg_color ? `--uc-bg:${e.bg_color}` : "",
      e.title_color ? `--uc-title:${e.title_color}` : "",
      e.subtitle_color ? `--uc-subtitle:${e.subtitle_color}` : "",
      e.card_bg ? `--uc-card-bg:${e.card_bg}` : "",
      e.card_title_color ? `--uc-card-title:${e.card_title_color}` : "",
      e.card_text_color ? `--uc-card-text:${e.card_text_color}` : "",
      e.overlay_title_color ? `--uc-ov-title:${e.overlay_title_color}` : "",
      e.overlay_text_color ? `--uc-ov-text:${e.overlay_text_color}` : "",
      e.number_bg ? `--uc-num-bg:${e.number_bg}` : "",
      e.number_color ? `--uc-num-fg:${e.number_color}` : "",
      `--uc-radius:${O(this._num(e.card_radius, 18), 0, 48)}px`,
      `--uc-gap-m:${c}px`,
      `--uc-gap-d:${Math.round(c * 1.4)}px`,
      `--uc-share-m:${J[a] ?? "38%"}`,
      `--uc-share-d:${X[r] ?? "42%"}`,
      `--uc-item-m:${Y[n] ?? "62vw"}`,
      `--uc-item-d:${Q[d] ?? "22vw"}`,
      `--uc-aspect:${this._pickValue(e.aspect_ratio, "4/5")}`,
      `--uc-stack-ar:${this._pickValue(e.stack_aspect, "1/1")}`,
      `--uc-stack-over-ar:${this._pickValue(e.stack_over_aspect, "4/3")}`,
      `--uc-stack-max:${O(this._num(e.stack_max_width, 860), 480, 1400)}px`,
      `--uc-scrim:${p}`,
      `--uc-dim:${_}`,
      ...i,
      ...q(
        e,
        (v, m) => this._pickValue(v, m)
      )
    ].filter(Boolean).join("; ");
  }
  /** Alt text: the merchant's own, else the visible title, else decorative. */
  _alt(e) {
    return this.localizedString(e.alt) || this.localizedString(e.title) || "";
  }
  /**
   * The step badge. Rendered only when the merchant asked for numbering, which
   * is what turns an unordered set of use cases into a "how to use it" list.
   * `aria-hidden` because the order is already carried by the DOM.
   */
  _renderNumber(e) {
    return e ? u`<span class="uc-num" aria-hidden="true"
      >${this._localeNum(e)}</span
    >` : y;
  }
  /**
   * A captioned photo, in one of two arrangements.
   *
   * - `over`    — the caption is absolutely positioned inside the frame, on a
   *   scrim. Used by the row layout and by a stack card set to "copy over the
   *   photo".
   * - `outside` — the caption is a sibling of the photo box in normal flow, so
   *   it lands underneath with no scrim. Row layout only: the stack puts its
   *   copy BESIDE the photo instead, which is `_renderSplitCard`.
   *
   * The two need different DOM rather than just different CSS — an overlaid
   * caption has to sit inside the element that clips to the frame's aspect
   * ratio, and a caption underneath has to sit outside it.
   */
  _renderFrame(e, i) {
    const a = this.localizedString(e.title), s = this.localizedString(e.text), r = !a && !s && !i.step, n = u`<img
      src=${e.image || ""}
      alt=${this._alt(e)}
      loading="lazy"
      decoding="async"
    />`, o = r ? y : u`<figcaption
          class="uc-cap"
          data-place=${i.place}
          data-pos=${i.pos}
          data-align=${i.align}
          dir=${i.dir}
        >
          ${this._renderNumber(i.step)}
          ${a ? u`<span class="uc-cap-title">${a}</span>` : y}
          ${s ? u`<span class="uc-cap-text">${s}</span>` : y}
        </figcaption>`;
    return i.place === "outside" ? u`<figure class="uc-fig">
        <div class="uc-frame" data-bare="true">${n}</div>
        ${o}
      </figure>` : u`<figure
      class="uc-frame"
      data-pos=${i.pos}
      data-bare=${r ? "true" : "false"}
    >
      ${n}${o}
    </figure>`;
  }
  /** A stack card: the photo on one physical side, the copy on the other. */
  _renderSplitCard(e, i) {
    const a = this.localizedString(e.title), s = this.localizedString(e.text), r = e.background_color ? `--uc-card-bg:${e.background_color}` : "";
    return u`<article
      class="uc-card"
      data-side=${i.side}
      style=${r}
    >
      <div class="uc-media">
        <img
          src=${e.image || ""}
          alt=${this._alt(e)}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="uc-body" data-align=${i.align} dir=${i.dir}>
        ${this._renderNumber(i.step)}
        ${a ? u`<h3 class="uc-card-title">${a}</h3>` : y}
        ${s ? u`<p class="uc-card-text">${s}</p>` : y}
      </div>
    </article>`;
  }
  render() {
    const e = this.config || {}, i = this._items(), a = {
      ...e,
      side_visual_count: e.side_visual_count ?? "off",
      side_depth: e.side_depth ?? "front",
      side2_depth: e.side2_depth ?? "front"
    }, s = (l) => H(
      a,
      (b, x) => this._pickValue(b, x),
      (b, x) => this._num(b, x),
      l
    ), r = [s(1), s(2)].filter(
      (l) => !!l
    ), n = this._hostStyle(
      e,
      r.flatMap((l) => l.vars)
    ), o = (l, b = !1) => u`<img
        class="uc-side"
        src=${l.image}
        alt=""
        aria-hidden="true"
        data-slot=${l.slot}
        data-side=${l.side}
        data-depth=${l.depth}
        data-flow=${b ? "true" : "false"}
        decoding="async"
        loading="lazy"
      />`, d = r.filter((l) => l.side !== "center").map((l) => o(l)), c = r.filter((l) => l.side === "center").map((l) => o(l, !0));
    if (i.length === 0)
      return u`<section class="uc" style=${n}>
        ${d}
        <p class="uc-empty">
          ${this._lang() === "ar" ? "أضف بطاقة واحدة على الأقل مع صورتها لعرض هذا القسم." : "Add at least one card with a photo to display this section."}
        </p>
        ${c}
      </section>`;
    const p = this.localizedString(e.section_title), _ = this.localizedString(e.section_subtitle), m = e.enable_entrance_anim !== !1 && !this._reduceMotion() ? this._animState : "in", h = this._lang() === "ar" ? "rtl" : "ltr", w = p || _ ? u`<header class="uc-header">
            ${p ? u`<h2 class="uc-h2">${p}</h2>` : y}
            ${_ ? u`<p class="uc-sub">${_}</p>` : y}
          </header>` : y, k = this._layout() === "row" ? this._renderRow(e, i, m, h) : this._renderStack(e, i, m, h);
    return u`<section class="uc" style=${n}>
      ${d}${w}${k}${c}
    </section>`;
  }
  /** Cards one above the other — the default layout. */
  _renderStack(e, i, a, s) {
    const r = this._isOverlay(), n = this._pickValue(e.first_image_side, "right"), o = e.alternate_sides !== !1, d = this._pickValue(e.text_align, "center"), c = this._pickValue(
      e.overlay_position,
      "bottom"
    ), p = this._pickValue(
      e.overlay_align,
      "center"
    ), _ = (m, h) => {
      const w = this._pickValue(m.side, "auto");
      return w === "left" || w === "right" ? w : o ? h % 2 === 0 ? n : Z(n) : n;
    }, v = e.show_numbers === !0;
    return u`<div class="uc-stack" data-anim=${a}>
      ${i.map(
      (m, h) => r ? this._renderFrame(m, {
        pos: c,
        align: p,
        dir: s,
        step: v ? h + 1 : 0,
        place: "over"
      }) : this._renderSplitCard(m, {
        side: _(m, h),
        align: d,
        dir: s,
        step: v ? h + 1 : 0
      })
    )}
    </div>`;
  }
  /** A strip of captioned photos bleeding off both edges of the section. */
  _renderRow(e, i, a, s) {
    const r = this._pickValue(
      e.overlay_position,
      "bottom"
    ), n = this._focusEnabled(), o = e.show_numbers === !0, d = this._isOverlay() ? "over" : "outside", c = d === "over" ? this._pickValue(e.overlay_align, "center") : "center", p = this._activeIndex >= 0 ? this._activeIndex : Math.floor((i.length - 1) / 2);
    return u`<div
      class="uc-strip"
      data-anim=${a}
      data-focus=${n ? "on" : "off"}
    >
      ${i.map(
      (_, v) => u`<div
            class="uc-slide"
            data-active=${n && v === p ? "true" : "false"}
          >
            ${this._renderFrame(_, {
        pos: r,
        align: c,
        dir: s,
        step: o ? v + 1 : 0,
        place: d
      })}
          </div>`
    )}
    </div>`;
  }
};
M.styles = G;
let f = M;
A([
  P({ type: Object })
], f.prototype, "config");
A([
  R()
], f.prototype, "_animState");
A([
  R()
], f.prototype, "_activeIndex");
typeof f < "u" && f.registerSallaComponent("salla-use-cases");
export {
  f as default
};
