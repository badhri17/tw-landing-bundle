import { css } from "lit";

/**
 * Product Features styles — mobile-first, RTL-first.
 *
 * The overlay is the base layout, not a desktop enhancement: cards are
 * absolutely positioned inside .pf-stage, which hugs the product image's
 * natural box (the img is display:block; width:100%; height:auto). Card
 * placement uses the PHYSICAL left/top properties so a card stays on the edge
 * the merchant picked regardless of page direction — same convention as the
 * hotspots in interactive-product.
 *
 * The little feature image, in contrast, sits on the inline-start edge of its
 * card (right in Arabic, left in English) and overhangs it, so the composition
 * mirrors correctly for an LTR store.
 */
export const productFeaturesStyles = css`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    /* Width comes from the container, never from the contents. */
    min-width: 0;
    max-width: 100%;

    --pf-bg: #f5f4f2;
    --pf-title: #14181f;
    --pf-subtitle: #5b6573;
    --pf-card-bg: #ffffff;
    --pf-card-border: rgba(20, 24, 31, 0.06);
    --pf-card-title: #14181f;
    --pf-card-text: #6b7280;
    --pf-connector: #ffffff;

    /* Full-bleed on mobile: horizontal room is the scarce resource there, and
       every px of section padding is a px the cards and the product lose.
       Desktop restores the gutter in the breakpoint below. */
    --pf-pad-x: 0px;
    --pf-radius: 16px;
    --pf-card-w: 50%;
    --pf-stage-max: 560px;
    --pf-scale-m: 1;
    --pf-scale-d: 1;

    --pf-ease: cubic-bezier(0.22, 1, 0.36, 1);
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
     SECTION + HEADER
     ============================================================ */
  .pf {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--pf-bg);
    /* Extra room at the bottom: a low-placed card whose text wraps to several
       lines hangs past the image, and overflow:hidden would clip it. */
    padding: clamp(2rem, 6vw, 3.5rem) var(--pf-pad-x) clamp(3rem, 9vw, 4rem);
    overflow: hidden;

    /* These three DERIVE from --pf-scale-m/-d, so they have to be declared on
       the same element the component writes its inline overrides to. Declared
       on :host they would substitute the host's own (default) values and the
       merchant's size setting would silently do nothing. */
    --pf-scale: var(--pf-scale-m, 1);
    --pf-thumb: calc(46px * var(--pf-scale));
    /* How far the feature image overhangs its card. */
    --pf-thumb-out: calc(var(--pf-thumb) * 0.42);
  }

  .pf-header {
    max-width: 640px;
    margin: 0 auto clamp(1.25rem, 4vw, 2rem);
    /* The section is full-bleed on mobile, so the header carries its own gutter
       — only the stage should actually touch the screen edges. */
    padding-inline: clamp(1rem, 4vw, 2rem);
    text-align: center;
  }
  .pf-h2 {
    margin: 0;
    color: var(--pf-title);
    font-size: clamp(1.35rem, 5vw, 2.1rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .pf-sub {
    margin: 0.55rem 0 0;
    color: var(--pf-subtitle);
    font-size: clamp(0.9rem, 1.6vw, 1.02rem);
    line-height: 1.7;
  }

  /* ============================================================
     STAGE — the product shot, with the cards floating over it
     ============================================================ */
  .pf-stage {
    position: relative;
    width: 100%;
    max-width: var(--pf-stage-max);
    margin-inline: auto;
  }

  .pf-product {
    display: block;
    width: 100%;
    height: auto;
  }

  /* A fixed canvas shape guarantees the cards enough vertical room even when
     the merchant's product shot is square or landscape. The image fills that
     canvas: on a transparent cut-out the trimmed edges are empty pixels, so the
     product ends up bigger rather than floating in dead space. Merchants with a
     tightly cropped shot pick the natural-ratio option instead. */
  .pf-stage[data-ratio="on"] {
    aspect-ratio: var(--pf-ratio, 3 / 4);
  }
  .pf-stage[data-ratio="on"] .pf-product {
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .pf-pin {
    position: absolute;
    top: var(--top, 0%);
    width: var(--pf-card-w);
    z-index: 2;
  }
  /* Inset by the overhang so the feature image lands flush with the image edge
     instead of spilling into the section padding. */
  .pf-pin[data-side="right"] {
    right: var(--pf-thumb-out);
  }
  .pf-pin[data-side="left"] {
    left: var(--pf-thumb-out);
  }

  .pf-card {
    position: relative;
    z-index: 1;
    padding: calc(9px * var(--pf-scale)) calc(12px * var(--pf-scale));
    /* Room for the part of the feature image that sits inside the card. */
    padding-inline-start: calc(
      var(--pf-thumb) - var(--pf-thumb-out) + 8px * var(--pf-scale)
    );
    background: var(--pf-card-bg);
    border: 1px solid var(--pf-card-border);
    border-radius: var(--pf-radius);
    box-shadow:
      0 10px 24px rgba(20, 24, 31, 0.1),
      0 2px 6px rgba(20, 24, 31, 0.05);
  }
  .pf-card[data-thumb="off"] {
    padding-inline-start: calc(12px * var(--pf-scale));
  }

  /* ---- Glass surface -------------------------------------------------
     A translucent panel tinted by the merchant's card colour, frosting
     whatever it sits over and lit by a diagonal gloss sweep plus a top
     edge highlight. The product shot reads through it, which is the whole
     point of the treatment.

     The tint and the sheen both live in the background shorthand rather
     than a ::before, so they paint behind the text with no z-index
     interplay against the absolutely-positioned thumb. Browsers without
     backdrop-filter still get the translucent tint and the sweep. */
  .pf-stage[data-card="glass"] .pf-card {
    background:
      linear-gradient(
        155deg,
        rgba(255, 255, 255, 0.62) 0%,
        rgba(255, 255, 255, 0.22) 38%,
        rgba(255, 255, 255, 0) 62%
      ),
      var(--pf-card-glass, rgba(255, 255, 255, 0.72));
    -webkit-backdrop-filter: blur(12px) saturate(160%);
    backdrop-filter: blur(12px) saturate(160%);
    border-color: rgba(255, 255, 255, 0.75);
    box-shadow:
      0 12px 30px rgba(20, 24, 31, 0.13),
      0 2px 8px rgba(20, 24, 31, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.85);
  }

  /* ---- Feature image above the title ---------------------------------
     The thumb leaves the flow-out position and becomes a block in normal
     flow, so it lands on the inline-start edge (right in Arabic) directly
     above the title and the card gets its full width back for text. */
  .pf-stage[data-thumb-pos="top"] .pf-card,
  .pf-stage[data-thumb-pos="top"] .pf-card[data-thumb="on"] {
    padding-inline-start: calc(12px * var(--pf-scale));
  }
  .pf-stage[data-thumb-pos="top"] .pf-thumb {
    position: static;
    display: block;
    transform: none;
    margin-bottom: calc(7px * var(--pf-scale));
  }
  /* Nothing overhangs any more, so the card itself sits flush with the edge
     and every connector can start right at the card border. Declared on the
     pin, not the stage, to beat the per-side rules above — which sit on the
     pin itself and would otherwise win by proximity whatever their specificity. */
  .pf-stage[data-thumb-pos="top"] .pf-pin[data-side] {
    --pf-line-gap: 0px;
  }
  .pf-stage[data-thumb-pos="top"] .pf-pin[data-side="right"] {
    right: 0;
  }
  .pf-stage[data-thumb-pos="top"] .pf-pin[data-side="left"] {
    left: 0;
  }

  .pf-thumb {
    position: absolute;
    top: 50%;
    inset-inline-start: calc(-1 * var(--pf-thumb-out));
    transform: translateY(-50%);
    width: var(--pf-thumb);
    height: var(--pf-thumb);
    border-radius: 50%;
    overflow: hidden;
    background: var(--pf-card-border);
    box-shadow: 0 4px 12px rgba(20, 24, 31, 0.16);
    z-index: 2;
  }
  .pf-thumb[data-shape="rounded"] {
    border-radius: calc(var(--pf-radius) * 0.55);
  }
  .pf-thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pf-card-title {
    margin: 0;
    color: var(--pf-card-title);
    font-size: calc(0.88rem * var(--pf-scale));
    font-weight: 800;
    line-height: 1.3;
  }
  .pf-card-text {
    margin: calc(3px * var(--pf-scale)) 0 0;
    color: var(--pf-card-text);
    font-size: calc(0.7rem * var(--pf-scale));
    line-height: 1.55;
  }

  /* ============================================================
     CONNECTOR — hairline running from the card toward the product, with
     the dot anchored at the CARD end and the bare end pointing at the
     product.

     The line starts at the card's visible outer boundary, not at the card
     box: with the feature image beside the title it overhangs the card, so
     a line starting at the card border would emerge from underneath it and
     bury the dot. --pf-line-gap pushes the start out past that overhang,
     and drops to 0 when the image sits on top of the title and nothing
     overhangs any more.
     ============================================================ */
  /* The feature image overhangs ONE edge of the card — its inline-start. A
     connector leaving through that same edge has to clear the image or the dot
     ends up buried under it; a connector leaving through the opposite edge must
     not be offset at all, or it floats away from the card. Which physical side
     that is depends on text direction, so RTL is the base (Arabic is the
     default here) and :dir(ltr) mirrors it. Browsers without :dir() keep the
     RTL arrangement, which is the one that matters most. */
  .pf-pin {
    --pf-line-gap: 0px;
  }
  .pf-pin[data-side="left"] {
    --pf-line-gap: var(--pf-thumb-out);
  }
  :host(:dir(ltr)) .pf-pin[data-side="left"] {
    --pf-line-gap: 0px;
  }
  :host(:dir(ltr)) .pf-pin[data-side="right"] {
    --pf-line-gap: var(--pf-thumb-out);
  }

  .pf-line {
    position: absolute;
    top: 50%;
    z-index: 0;
    width: 22px;
    height: 1px;
    background: var(--pf-connector);
  }
  .pf-pin[data-side="left"] .pf-line {
    left: calc(100% + var(--pf-line-gap));
  }
  .pf-pin[data-side="right"] .pf-line {
    right: calc(100% + var(--pf-line-gap));
  }
  .pf-line::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 5px;
    height: 5px;
    margin-top: -2.5px;
    border-radius: 50%;
    background: var(--pf-connector);
  }
  /* The dot marks the card end. A left-hand card's line runs rightward, so
     its card end is the line's left edge — and vice versa. */
  .pf-pin[data-side="left"] .pf-line::after {
    left: 0;
  }
  .pf-pin[data-side="right"] .pf-line::after {
    right: 0;
  }

  /* ============================================================
     FALLBACK — no product image: a plain stacked list
     ============================================================ */
  .pf-stage[data-mode="stack"] {
    display: flex;
    flex-direction: column;
    gap: calc(12px * var(--pf-scale));
    max-width: 520px;
  }
  .pf-stage[data-mode="stack"] .pf-pin {
    position: static;
    width: 100%;
  }
  .pf-stage[data-mode="stack"] .pf-line {
    display: none;
  }

  .pf-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--pf-subtitle);
    font-size: 0.92rem;
  }

  /* ============================================================
     MOTION
     ============================================================ */
  .pf-pin {
    transition:
      opacity 0.55s var(--pf-ease),
      transform 0.55s var(--pf-ease);
    transition-delay: calc(var(--i, 0) * 90ms);
  }
  .pf-stage[data-anim="ready"] .pf-pin {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  .pf-stage[data-anim="in"] .pf-pin {
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .pf-pin {
      transition: none;
    }
    .pf-stage[data-anim="ready"] .pf-pin {
      opacity: 1;
      transform: none;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    :host {
      --pf-pad-x: clamp(1rem, 4vw, 2rem);
    }
    .pf {
      --pf-scale: var(--pf-scale-d, 1);
    }
    .pf-header {
      padding-inline: 0;
    }
  }
`;
