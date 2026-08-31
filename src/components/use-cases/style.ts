import { css } from "lit";

/**
 * Product Use Cases styles — mobile-first, RTL-first.
 *
 * Both layouts ARE the mobile layout rather than a desktop enhancement: the
 * stack of cards and the bleeding strip each already work on a phone, and
 * desktop only widens them.
 *
 * ⚠️ .uc-card is forced to direction:ltr so that flex-direction row /
 * row-reverse always means the PHYSICAL left/right (same rule as the ingredient
 * columns). A card's photo must stay on the side the merchant put it on
 * whatever the store language is. The copy inside carries its own explicit
 * "dir" attribute from the component, so forcing the card never leaks into it.
 *
 * ⚠️ Every measurement that differs between breakpoints is a custom property
 * with an "-m" and a "-d" variant, resolved on .uc — the element the component
 * writes its inline style to. Declaring the derived value on :host instead
 * would resolve it against the host's own defaults and silently ignore the
 * merchant's settings.
 *
 * ⚠️ Never put a backtick inside this template — it ends the literal early and
 * the component silently fails to register.
 */
export const useCasesStyles = css`
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
