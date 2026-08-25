import { css } from "lit";

/**
 * Growth Kit — Testimonials styles.
 *
 * Mobile-first, RTL-first. Every layout is authored as a single-column mobile
 * base; desktop enhancements live inside `@media (min-width: 768px)`.
 *
 * Colours are driven by CSS custom properties resolved in the component; the
 * values below are premium light-theme fallbacks. Card shapes are selected with
 * `[data-style]`; arrangements with `[data-layout]`.
 */
export const testimonialsStyles = css`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    /* Size containment: the host's width is taken from its container, never from
       its contents. This is what stops the carousel's wide track (or any other
       wide layout) from forcing an ancestor grid/flex item — e.g. Salla's
       component card — wider than the viewport and pushing other sections away.
       Width-only containment; height still grows with content. */
    container-type: inline-size;
    min-width: 0;
    max-width: 100%;

    --t-bg: #f6f4f0;
    --t-title: #14181f;
    --t-subtitle: #5b6573;
    --t-card-bg: #ffffff;
    --t-border: rgba(20, 24, 31, 0.09);
    --t-name: #14181f;
    --t-meta: #8a93a0;
    --t-text: #3f4754;
    --t-star: #ff9f1c;
    --t-star-empty: rgba(20, 24, 31, 0.14);
    --t-accent: #000000;

    --t-gap: clamp(12px, 2.6vw, 20px);
    --t-pad-x: clamp(1rem, 4vw, 2rem);
    --t-radius: 20px;
    --t-aspect: 4 / 5;
    --t-cols-mobile: 1;
    --t-cols-desktop: 3;
    /* تموج الحواف — nothing until the component writes a depth on the section.
       Plain values, so the inline declaration there shadows them.
       See src/shared/wave-edges.ts. */
    --wv-top-m: 0px;
    --wv-top-d: 0px;
    --wv-bot-m: 0px;
    --wv-bot-d: 0px;
    --t-ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* ============================================================
     SECTION + HEADER
     ============================================================ */
  /* The optional background photo and its scrim are two background LAYERS on
     the section itself, not a pseudo-element: nothing new joins the stacking
     order, so the cards and the carousel arrows keep the z-indexes
     they already had. Both default to "none", which leaves just the colour. */
  .t-section {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background-color: var(--t-bg);
    background-image: var(--t-bg-scrim, none), var(--t-bg-img, none);
    background-size: cover;
    background-position: var(--t-bg-pos, center);
    background-repeat: no-repeat;
    /* Derived from the two tiers above, so they are declared HERE — on the
       element the component writes its inline style to — and not on :host,
       where they would resolve against the host's own 0px and ignore it. */
    --wv-top: var(--wv-top-m);
    --wv-bot: var(--wv-bot-m);
    /* Vertical space is the merchant's, via shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts.
       The wave's depth is added on top of the tier rather than taken out of it:
       the curve eats into the section, so without this the merchant's spacing
       would shrink by however deep they made the wave. Both depths are 0px
       unless an edge is waved, so an ordinary section is untouched. */
    padding-inline: var(--t-pad-x);
    padding-block: calc(var(--sp-top-m) + var(--wv-top))
      calc(var(--sp-bot-m) + var(--wv-bot));
    overflow: hidden;
  }

  /* تموج الحواف — the wave is a MASK over a background LAYER, never over the
     section itself: masking the section would erase anything that deliberately
     bleeds outside its box. The layer carries the whole background stack the
     section normally paints (colour, photo, scrim), so the photo is cut by the
     same curve for free.

     Three mask layers, unioned: the top curve, a solid middle filling the rest,
     the bottom curve. The middle is sized and offset from the same two depths,
     so an edge that is off contributes a zero-height layer and the middle just
     covers what it would have taken.

     "isolation" keeps the z-index:-1 layer inside the section's own stacking
     context, where it paints above the section's background — which is now the
     colour showing through the cut — and below every child. */
  .t-section[data-wave="on"] {
    position: relative;
    isolation: isolate;
    background-color: var(--wv-behind, transparent);
    background-image: none;
  }
  .t-section[data-wave="on"]::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background-color: var(--t-bg);
    background-image: var(--t-bg-scrim, none), var(--t-bg-img, none);
    background-size: cover;
    background-position: var(--t-bg-pos, center);
    background-repeat: no-repeat;
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

  .t-header {
    max-width: 720px;
    margin: 0 auto clamp(1.75rem, 4vw, 2.75rem);
    text-align: center;
  }
  .t-eyebrow {
    margin: 0 0 0.5rem;
    color: var(--t-accent);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 1.6px;
    text-transform: uppercase;
  }
  .t-title {
    margin: 0;
    color: var(--t-title);
    font-size: clamp(1.5rem, 4vw, 2.3rem);
    font-weight: 800;
    line-height: 1.18;
    letter-spacing: -0.01em;
  }
  .t-subtitle {
    margin: 0.7rem 0 0;
    color: var(--t-subtitle);
    font-size: clamp(0.95rem, 1.6vw, 1.08rem);
    line-height: 1.7;
  }
  .t-summary {
    margin-top: 1.1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .t-summary-num {
    color: var(--t-title);
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
  }
  .t-summary .t-stars svg {
    width: 20px;
    height: 20px;
  }
  .t-summary-count {
    color: var(--t-meta);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .t-body-wrap {
    max-width: 1240px;
    margin-inline: auto;
    width: 100%;
  }

  .t-empty {
    text-align: center;
    color: var(--t-meta);
    padding: 3rem 1rem;
    margin: 0;
  }

  /* ============================================================
     STARS (two-layer clip → supports fractional ratings)
     ============================================================ */
  .t-stars {
    position: relative;
    display: inline-flex;
    direction: ltr; /* ratings always fill left→right */
    line-height: 0;
    order:-1;
  }
  .t-stars-bg,
  .t-stars-fg {
    display: inline-flex;
    gap: 2px;
  }
  .t-stars svg {
    width: 16px;
    height: 16px;
    display: block;
  }
  .t-stars-bg svg {
    fill: var(--t-star-empty);
  }
  .t-stars-fg-clip {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    width: var(--t-star-pct, 100%);
    overflow: hidden;
    transition: width 0.9s var(--t-ease) 0.2s;
  }
  .t-stars-fg {
    width: max-content;
  }
  .t-stars-fg svg {
    fill: var(--t-star);
  }

  /* Compact numeric rating pill. */
  .t-rating {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }
  .t-rating-text {
    color: var(--t-meta);
    font-size: 0.82rem;
    font-weight: 700;
  }
  .t-rating--num {
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    background: rgba(255, 159, 28, 0.16);
    background: color-mix(in srgb, var(--t-star) 16%, transparent);
    border-radius: 999px;
    align-self: flex-start;
    font-weight: 800;
    color: var(--t-title);
    font-size: 0.92rem;
  }
  .t-rating--num .t-rating-star {
    width: 15px;
    height: 15px;
    fill: var(--t-star);
  }

  /* ============================================================
     CARD — base + shared pieces
     ============================================================ */
  .t-card {
    position: relative;
    height: 100%;
    background: var(--t-card-bg);
    border: 1px solid transparent;
    border-radius: var(--t-radius);
    box-shadow: 0 20px 44px -30px rgba(15, 23, 42, 0.45);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-align: start;
  }
  .t-card[data-style="quote"] {
    padding: clamp(18px, 4vw, 26px);
    gap: 12px;
    /* Centred anatomy: the author leads (avatar above the name), the quote
       follows. align-items centres the flex children; text-align centres the
       text inside each of them. */
    align-items: center;
    text-align: center;
  }
  .t-card[data-style="quote"] .t-rating {
    justify-content: center;
  }

  /* Quote text */
  .t-quote {
    margin: 0;
    color: var(--t-text);
    font-size: 0.98rem;
    line-height: 1.72;
  }
  .t-card[data-style="quote"] .t-quote {
    font-size: 1.06rem;
    line-height: 1.65;
  }

  /* Decorative quotation mark */
  .t-quote-mark {
    line-height: 0;
    color: var(--t-accent);
    opacity: 0.9;
  }
  /* In the quote card the mark is decoration, not a row of content: take it out
     of the flow so it adds nothing to the card's height (in flow it pushed the
     avatar and everything under it down), and park it in the leading top corner.
     inset-inline-start puts that on the right in RTL and the left in LTR. */
  .t-card[data-style="quote"] .t-quote-mark {
    position: absolute;
    top: clamp(10px, 2.5vw, 16px);
    inset-inline-start: clamp(12px, 3vw, 18px);
    pointer-events: none;
  }
  .t-quote-mark svg {
    width: 34px;
    height: 34px;
  }

  /* Author block */
  .t-author {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .t-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    flex: none;
    background: var(--t-star-empty);
  }
  .t-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .t-author-meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  /* Stacked: avatar sits above the name, whole block centred */
  .t-author--stacked {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .t-author--stacked .t-avatar {
    width: 56px;
    height: 56px;
  }
  .t-author--stacked .t-author-meta {
    align-items: center;
  }
  .t-name {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--t-name);
    font-weight: 700;
    font-size: 0.95rem;
    line-height: 1.2;
  }
  .t-meta {
    color: var(--t-meta);
    font-size: 0.82rem;
  }

  /* The quote's text is what stretches in an equal-height card, not the author */
  .t-card[data-style="quote"] .t-quote {
    margin-bottom: auto;
  }

  /* ============================================================
     CARD — modern (photo-led with overlaid name chip)
     ============================================================ */
  .t-card[data-style="modern"] {
    padding: 0;
    gap: 0;
  }
  .t-photo {
    position: relative;
    width: 100%;
    aspect-ratio: var(--t-aspect);
    overflow: hidden;
  }
  .t-photo > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .t-photo-chip {
    position: absolute;
    top: 12px;
    inset-inline-start: 12px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(18, 22, 28, 0.62);
    -webkit-backdrop-filter: blur(7px);
    backdrop-filter: blur(7px);
    color: #fff;
    font-weight: 600;
    font-size: 0.82rem;
    padding: 5px;
    padding-inline-end: 12px;
    border-radius: 999px;
  }
  .t-photo-chip-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.15);
  }
  .t-photo-chip-text {
    white-space: nowrap;
  }
  .t-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 11px;
    padding: 15px 16px 17px;
  }

  /* ============================================================
     LAYOUT — carousel (scroll-snap)
     ============================================================ */
  .t-carousel {
    position: relative;
  }
  .t-carousel-track {
    display: flex;
    gap: var(--t-gap);
    align-items: stretch;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-block: 6px;
  }
  .t-carousel-track::-webkit-scrollbar {
    display: none;
  }
  @media (pointer: fine) {
    .t-carousel-track {
      cursor: grab;
    }
    .t-carousel-track.is-grabbing {
      cursor: grabbing;
      scroll-snap-type: none;
      scroll-behavior: auto;
    }
  }
  .t-carousel-cell {
    flex: 0 0
      calc(
        (100% - (var(--t-cols-mobile) - 1) * var(--t-gap)) /
          var(--t-cols-mobile)
      );
    scroll-snap-align: start;
  }
  /* Mobile: the strip bleeds past the section's inline padding and centres the
     active card, so a slice of both neighbours stays visible.

     The 12% inline padding does double duty. It shrinks the track's CONTENT box
     to 76% of the strip, so a cell at flex-basis:100% is 76% wide and leaves a
     12% gutter each side — no vw units, so a narrow Salla page container cannot
     desync the two halves. And it is what lets the first and last card reach
     the centre at all; without it they clamp against the scroll extremes. */
  @media (max-width: 767.98px) {
    .t-carousel {
      margin-inline: calc(-1 * var(--t-pad-x));
    }
    .t-carousel-track {
      padding-inline: 12%;
      scroll-padding-inline: 12%;
    }
    .t-carousel-cell {
      flex-basis: 100%;
      scroll-snap-align: center;
    }
  }

  .t-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 4;
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 50%;
    background: var(--t-arrow-bg, var(--t-title));
    color: var(--t-arrow-fg, #fff);
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.55);
    transition: transform 0.2s var(--t-ease), opacity 0.2s var(--t-ease);
  }
  .t-arrow:hover {
    transform: translateY(-50%) scale(1.07);
  }
  .t-arrow svg {
    width: 20px;
    height: 20px;
  }
  .t-arrow--prev {
    inset-inline-start: 4px;
  }
  .t-arrow--next {
    inset-inline-end: 4px;
  }
  /* Chevron points outward in the reading direction */
  .t-arrow--prev svg {
    transform: rotate(180deg);
  }
  .t-arrow--next svg {
    transform: rotate(0deg);
  }
  .t-arrow:dir(rtl).t-arrow--prev svg {
    transform: rotate(0deg);
  }
  .t-arrow:dir(rtl).t-arrow--next svg {
    transform: rotate(180deg);
  }

  .t-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: clamp(16px, 3vw, 24px);
  }
  .t-dot {
    width: 8px;
    height: 8px;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: var(--t-star-empty);
    cursor: pointer;
    transition: width 0.3s var(--t-ease), background 0.3s var(--t-ease);
  }
  .t-dot[aria-current="true"] {
    width: 22px;
    background: var(--t-accent);
  }

  /* ============================================================
     LAYOUT — grid
     ============================================================ */
  .t-grid {
    display: grid;
    grid-template-columns: repeat(var(--t-cols-mobile), minmax(0, 1fr));
    gap: var(--t-gap);
  }
  .t-grid-cell {
    min-width: 0;
  }

  /* ============================================================
     ENTRANCE ANIMATIONS
     ============================================================ */
  /* Header */
  .t-header[data-anim="ready"] > * {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(6px);
  }
  .t-header[data-anim="in"] > * {
    opacity: 1;
    transform: none;
    filter: blur(0);
    transition: opacity 0.7s var(--t-ease), transform 0.7s var(--t-ease),
      filter 0.7s var(--t-ease);
  }
  .t-header[data-anim="in"] > *:nth-child(2) {
    transition-delay: 0.08s;
  }
  .t-header[data-anim="in"] > *:nth-child(3) {
    transition-delay: 0.16s;
  }
  .t-header[data-anim="in"] > *:nth-child(4) {
    transition-delay: 0.24s;
  }

  /* Cards (grid / carousel) */
  .t-section[data-anim="ready"] .t-grid-cell,
  .t-section[data-anim="ready"] .t-carousel-cell {
    opacity: 0;
    transform: translateY(16px) scale(0.985);
  }
  .t-section[data-anim="in"] .t-grid-cell,
  .t-section[data-anim="in"] .t-carousel-cell {
    opacity: 1;
    transform: none;
    transition: opacity 0.6s var(--t-ease), transform 0.7s var(--t-ease);
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(2),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(2) {
    transition-delay: 0.07s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(3),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(3) {
    transition-delay: 0.14s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(4),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(4) {
    transition-delay: 0.21s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(5),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(5) {
    transition-delay: 0.28s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(6),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(6) {
    transition-delay: 0.35s;
  }
  .t-section[data-anim="in"] .t-grid-cell:nth-child(n + 7),
  .t-section[data-anim="in"] .t-carousel-cell:nth-child(n + 7) {
    transition-delay: 0.4s;
  }

  /* Star fill grows from 0 on entrance */
  .t-section[data-anim="ready"] .t-stars-fg-clip {
    width: 0;
  }

  /* ============================================================
     HOVER LIFT
     ============================================================ */
  .t-section[data-hover-lift="on"] .t-card {
    transition: transform 0.35s var(--t-ease), box-shadow 0.35s var(--t-ease);
  }
  @media (hover: hover) {
    .t-section[data-hover-lift="on"] .t-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 34px 64px -30px rgba(15, 23, 42, 0.5);
    }
    .t-section[data-hover-lift="on"] .t-card[data-style="modern"] .t-photo > img {
      transition: transform 0.7s var(--t-ease);
    }
    .t-section[data-hover-lift="on"]
      .t-card[data-style="modern"]:hover
      .t-photo
      > img {
      transform: scale(1.05);
    }
  }

  /* ============================================================
     DESKTOP ENHANCEMENTS (≥ 768px)
     ============================================================ */
  @media (min-width: 768px) {
    .t-section {
      --wv-top: var(--wv-top-d);
      --wv-bot: var(--wv-bot-d);
      padding-block: calc(var(--sp-top-d) + var(--wv-top))
        calc(var(--sp-bot-d) + var(--wv-bot));
    }
    .t-grid {
      grid-template-columns: repeat(var(--t-cols-desktop), minmax(0, 1fr));
    }
    .t-carousel-cell {
      flex-basis: calc(
        (100% - (var(--t-cols-desktop) - 1) * var(--t-gap)) /
          var(--t-cols-desktop)
      );
    }
    .t-arrow {
      width: 46px;
      height: 46px;
    }
  }

  /* ============================================================
     REDUCED MOTION
     ============================================================ */
  @media (prefers-reduced-motion: reduce) {
    .t-card,
    .t-photo > img,
    .t-grid-cell,
    .t-carousel-cell,
    .t-header > *,
    .t-stars-fg-clip,
    .t-arrow,
    .t-dot {
      transition: none !important;
      animation: none !important;
    }
    .t-section[data-anim] .t-grid-cell,
    .t-section[data-anim] .t-carousel-cell,
    .t-section[data-anim] .t-header > * {
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
    }
    .t-stars-fg-clip {
      width: var(--t-star-pct, 100%) !important;
    }
    .t-carousel-track {
      scroll-behavior: auto;
    }
  }
`;
