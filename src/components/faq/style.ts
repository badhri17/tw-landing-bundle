import { css } from "lit";

/**
 * FAQ styles — mobile-first, RTL-first.
 *
 * Two things drive the shape of this file:
 *
 * 1. The open/close animation is a grid-row trick, not a max-height one. The
 *    answer wrapper is a one-row grid going from "0fr" to "1fr", so an answer of
 *    any length animates without JS measuring it. Where the browser cannot
 *    interpolate that (pre-2023 engines) the row simply snaps open — the panel
 *    still works, it just does not glide.
 *
 * 2. Every value that differs between breakpoints is a custom property with an
 *    "-m" and a "-d" variant, resolved on the element the component writes its
 *    inline style to and swapped in the desktop media query. Declaring a derived
 *    value on :host instead would resolve it against the host's own defaults and
 *    silently ignore the merchant's setting.
 *
 * The section must not clip horizontally the way a card would: the side design
 * element hangs past its edge on purpose. It uses "overflow: clip visible" so
 * the element is cut by the section's own edge (no page-wide horizontal scroll)
 * while still being free to spill above and below.
 */
export const faqStyles = css`
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
    font-size: clamp(1.5rem, 4.6vw, 2.25rem);
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
