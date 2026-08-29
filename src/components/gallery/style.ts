import { css } from "lit";

/**
 * Gallery styles — mobile-first, RTL-first.
 *
 * The row is a scroll-snapping flex strip that deliberately runs past both edges
 * of the section: the photos are meant to look cropped by the viewport, not
 * boxed inside a container. Because of that the section itself must NOT clip
 * horizontally — the side design element also hangs outside it.
 *
 * Every size that differs between breakpoints is a custom property with an `-m`
 * and a `-d` variant, resolved on `.gal` (the element the component writes its
 * inline style to) and swapped inside the desktop media query. Declaring the
 * derived values on :host instead would resolve them against the host's own
 * defaults and silently ignore the merchant's settings.
 */
export const galleryStyles = css`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    min-width: 0;
    max-width: 100%;

    --gal-bg: #ffffff;
    --gal-title: #14181f;
    --gal-lightbox-bg: rgba(12, 12, 14, 0.94);

    --gal-radius: 14px;
    --gal-pad-x: clamp(1rem, 4vw, 2.5rem);
    --gal-ease: cubic-bezier(0.22, 1, 0.36, 1);

    /* Mobile values; the desktop pair is set alongside and swapped below. */
    --gal-item-m: 62vw;
    --gal-item-d: 22vw;
    --gal-gap-m: 12px;
    --gal-gap-d: 18px;

    /* تموج الحواف — nothing until the component writes a depth on the section.
       Plain values, so the inline declaration there shadows them.
       See src/shared/wave-edges.ts. */
    --wv-top-m: 0px;
    --wv-top-d: 0px;
    --wv-bot-m: 0px;
    --wv-bot-d: 0px;
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
  .gal {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--gal-bg);
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts.
       The wave's depth is added on top of the tier rather than taken out of it:
       the curve eats into the section, so without this the merchant's spacing
       would shrink by however deep they made the wave. Both depths are 0px
       unless an edge is waved, so an ordinary section is untouched. */
    padding-block: calc(var(--sp-top-m) + var(--wv-top))
      calc(var(--sp-bot-m) + var(--wv-bot));
    /* Not overflow:hidden — the strip and the side element both need to bleed.
       overflow-x is clipped on the strip itself instead. */
    overflow: clip visible;

    --gal-item: var(--gal-item-m);
    --gal-gap: var(--gal-gap-m);
    /* Derived from the two tiers, so they are declared HERE — on the element
       the component writes its inline style to — and not on :host, where they
       would resolve against the host's own 0px and ignore it. */
    --wv-top: var(--wv-top-m);
    --wv-bot: var(--wv-bot-m);
  }

  /* تموج الحواف — the wave is a MASK over a background LAYER, never over the
     section itself: this section deliberately bleeds (the strip past both
     inline edges, the side element past the block edges) and masking .gal would
     erase all of it.

     Three mask layers, unioned: the top curve, a solid middle filling the rest,
     the bottom curve. The middle is sized and offset from the same two depths,
     so an edge that is off contributes a zero-height layer and the middle just
     covers what it would have taken.

     "isolation" keeps the z-index:-1 layer inside .gal's own stacking context,
     where it paints above .gal's background — which is now the colour showing
     through the cut — and below the header (z-index 2), the strip and the side
     element (both 1). See src/shared/wave-edges.ts. */
  .gal[data-wave="on"] {
    isolation: isolate;
    background: var(--wv-behind, transparent);
  }
  .gal[data-wave="on"]::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: var(--gal-bg);
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

  .gal-header {
    max-width: 680px;
    margin: 0 auto clamp(1.25rem, 4vw, 2.25rem);
    padding-inline: var(--gal-pad-x);
    text-align: center;
    position: relative;
    z-index: 2;
  }
  .gal-h2 {
    margin: 0;
    color: var(--gal-title);
    font-size: clamp(1.6rem, 5.5vw, 2.1rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  /* ============================================================
     ROW — a scroll-snapping strip that bleeds off both edges
     ============================================================ */
  .gal-strip {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: var(--gal-gap);
    /* Safe centring: the row sits centred when it fits, and bleeds off BOTH
       edges once it doesn't — which is the look this section is for. A plain
       "center" would make the overflowing start unreachable by scrolling; the
       safe keyword falls back to flex-start in exactly that case. */
    justify-content: safe center;
    padding-inline: var(--gal-pad-x);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .gal-strip::-webkit-scrollbar {
    display: none;
  }

  .gal-item {
    flex: 0 0 var(--gal-item);
    scroll-snap-align: center;
    scroll-margin-inline-start: calc(var(--gal-gap) * 2);
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
    border-radius: var(--gal-radius);
    overflow: hidden;
    aspect-ratio: var(--gal-aspect, 3 / 4);
    transition:
      transform 0.4s var(--gal-ease),
      flex-basis 0.4s var(--gal-ease);
  }
  .gal-item[data-static="on"] {
    cursor: default;
  }
  .gal-strip[data-row="grid"] {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
    justify-content: initial;
    overflow: visible;
    overscroll-behavior-x: auto;
    scroll-snap-type: none;
  }
  .gal-strip[data-row="grid"] .gal-item {
    width: 100%;
    min-width: 0;
  }
  .gal-item img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .gal-item:not([data-static="on"]):hover img {
    transform: scale(1.03);
  }
  .gal-item img {
    transition: transform 0.5s var(--gal-ease);
  }
  .gal-item:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }

  /* ============================================================
     SIDE DESIGN ELEMENT (عنصر بصري جانبي)
     ============================================================ */
  .gal-side {
    position: absolute;
    z-index: 1;
    top: var(--se-top, 0%);
    width: var(--se-w, 45%);
    height: auto;
    opacity: var(--se-op, 1);
    pointer-events: none;
    user-select: none;
    max-width: none;
  }
  .gal-side[data-slot="1"] {
    --se-w: var(--se1-w-m);
    --se-x: var(--se1-x-m);
    --se-y: var(--se1-y-m);
    --se-top: var(--se1-top-m);
    --se-pull: var(--se1-pull-m);
    --se-op: var(--se1-op);
  }
  .gal-side[data-slot="2"] {
    --se-w: var(--se2-w-m);
    --se-x: var(--se2-x-m);
    --se-y: var(--se2-y-m);
    --se-top: var(--se2-top-m);
    --se-pull: var(--se2-pull-m);
    --se-op: var(--se2-op);
  }
  /* A positive X pushes the element further OUT of the section on whichever
     edge it is parked, so the merchant's slider means the same thing on both
     sides. */
  .gal-side[data-side="left"] {
    left: 0;
    transform: translate(
      calc(-1 * var(--se-x, 0%)),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }
  .gal-side[data-side="right"] {
    right: 0;
    transform: translate(
      var(--se-x, 0%),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  .lb {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    background: var(--gal-lightbox-bg);
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.28s var(--gal-ease),
      visibility 0s linear 0.28s;
  }
  .lb[data-open="true"] {
    visibility: visible;
    opacity: 1;
    transition:
      opacity 0.28s var(--gal-ease),
      visibility 0s;
  }

  .lb-stage {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(3rem, 8vw, 4.5rem) clamp(0.75rem, 4vw, 3.5rem)
      clamp(1rem, 3vw, 1.5rem);
  }
  .lb-figure {
    margin: 0;
    max-width: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  .lb-figure img {
    max-width: 100%;
    max-height: 68vh;
    object-fit: contain;
    border-radius: 10px;
  }
  .lb-caption {
    color: rgba(255, 255, 255, 0.82);
    font-size: 0.9rem;
    text-align: center;
    margin: 0;
  }

  .lb-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    cursor: pointer;
    transition: background 0.2s var(--gal-ease);
  }
  .lb-btn:hover {
    background: rgba(255, 255, 255, 0.28);
  }
  .lb-btn svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  /* Physical sides: "previous" is always the arrow pointing to the start of the
     reading direction, so the glyph flips rather than the button. */
  .lb-prev {
    inset-inline-start: clamp(0.5rem, 2vw, 1.5rem);
  }
  .lb-next {
    inset-inline-end: clamp(0.5rem, 2vw, 1.5rem);
  }
  .lb-prev svg,
  .lb-next svg {
    transform: rotate(180deg);
  }
  .lb-next svg {
    transform: none;
  }
  :host(:dir(rtl)) .lb-prev svg {
    transform: none;
  }
  :host(:dir(rtl)) .lb-next svg {
    transform: rotate(180deg);
  }

  .lb-close {
    position: absolute;
    top: clamp(0.75rem, 2vw, 1.25rem);
    inset-inline-end: clamp(0.75rem, 2vw, 1.25rem);
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 1.35rem;
    line-height: 1;
    cursor: pointer;
    z-index: 2;
  }
  .lb-close:hover {
    background: rgba(255, 255, 255, 0.28);
  }

  .lb-counter {
    position: absolute;
    top: clamp(0.9rem, 2vw, 1.4rem);
    inset-inline-start: clamp(0.9rem, 2vw, 1.5rem);
    color: rgba(255, 255, 255, 0.78);
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }

  /* Thumbnail rail — the "scroll between the images from the inside" affordance. */
  .lb-thumbs {
    flex: 0 0 auto;
    display: flex;
    gap: 8px;
    justify-content: flex-start;
    padding: 0 clamp(0.75rem, 4vw, 2rem) clamp(1rem, 3vw, 1.75rem);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .lb-thumbs::-webkit-scrollbar {
    display: none;
  }
  .lb-thumb {
    flex: 0 0 auto;
    width: 56px;
    height: 56px;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    background: none;
    cursor: pointer;
    opacity: 0.5;
    transition:
      opacity 0.2s var(--gal-ease),
      border-color 0.2s var(--gal-ease);
  }
  .lb-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .lb-thumb[aria-current="true"] {
    opacity: 1;
    border-color: #fff;
  }
  .lb-thumb:hover {
    opacity: 0.85;
  }

  .gal-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.92rem;
  }

  /* ============================================================
     MOTION
     ============================================================ */
  .gal-item,
  .gal-header {
    transition:
      opacity 0.55s var(--gal-ease),
      transform 0.55s var(--gal-ease);
  }
  .gal-strip[data-anim="ready"] .gal-item {
    opacity: 0;
    transform: translateY(10px);
  }
  .gal-strip[data-anim="ready"] .gal-item:nth-child(1) {
    transition-delay: 0.05s;
  }
  .gal-strip[data-anim="ready"] .gal-item:nth-child(2) {
    transition-delay: 0.12s;
  }
  .gal-strip[data-anim="ready"] .gal-item:nth-child(3) {
    transition-delay: 0.19s;
  }
  .gal-strip[data-anim="in"] .gal-item {
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .gal-item,
    .gal-item img,
    .gal-header,
    .lb,
    .lb-btn,
    .lb-thumb {
      transition: none !important;
    }
    .gal-strip[data-anim="ready"] .gal-item {
      opacity: 1;
      transform: none;
    }
    .gal-strip {
      scroll-behavior: auto;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    .gal {
      padding-block: calc(var(--sp-top-d) + var(--wv-top))
        calc(var(--sp-bot-d) + var(--wv-bot));
      --wv-top: var(--wv-top-d);
      --wv-bot: var(--wv-bot-d);
    }
    .gal {
      --gal-item: var(--gal-item-d);
      --gal-gap: var(--gal-gap-d);
    }
    .gal-strip[data-row="grid"] {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .gal-side[data-slot="1"] {
      --se-w: var(--se1-w-d);
      --se-x: var(--se1-x-d);
      --se-y: var(--se1-y-d);
      --se-top: var(--se1-top-d);
      --se-pull: var(--se1-pull-d);
    }
    .gal-side[data-slot="2"] {
      --se-w: var(--se2-w-d);
      --se-x: var(--se2-x-d);
      --se-y: var(--se2-y-d);
      --se-top: var(--se2-top-d);
      --se-pull: var(--se2-pull-d);
    }
    .lb-thumbs {
      justify-content: center;
    }
    .lb-thumb {
      width: 68px;
      height: 68px;
    }
  }
`;
