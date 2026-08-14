import { css } from "lit";

/**
 * Ingredients styles — mobile-first, RTL-first.
 *
 * Both layouts — the three-column stage and the circle — ARE the mobile layout,
 * not a desktop enhancement: each reference composition already fits a phone,
 * and desktop only scales it up.
 *
 * ⚠️ .ing-stage and .ing-orbit are forced to direction:ltr so that grid column 1
 * (and a positive rotation) is always the PHYSICAL left/right. Ingredient sides
 * must not flip with store language (same rule as product-features' cards), and
 * grid line numbers follow writing direction otherwise. The label text inside
 * carries its own explicit `dir` attribute from the component, so forcing the
 * stage never leaks into copy.
 *
 * ⚠️ Never put a backtick inside this template — it ends the literal early and
 * the component silently fails to register.
 */
export const ingredientsStyles = css`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    /* Width comes from the container, never from the contents. */
    min-width: 0;
    max-width: 100%;

    --ing-bg: #f3f1ef;
    --ing-title: #14181f;
    --ing-subtitle: #5b6573;
    --ing-label: #14181f;
    --ing-connector: #9aa0a6;

    /* Full-bleed on mobile; the desktop breakpoint restores a gutter. */
    --ing-pad-x: 0px;
    --ing-stage-max: 560px;
    --ing-product-w: 30%;
    --ing-product-w-d: 30%;
    --ing-row-gap: 26px;
    --ing-col-gap: 10px;
    --ing-connector-w: 1px;
    --ing-scale-m: 1;
    --ing-scale-d: 1.28;

    /* Circle layout. Every measurement is a percentage of the square stage's
       own width, which is what lets the ring scale with the viewport without a
       resize listener or any CSS trig. */
    --ing-ring: #c2a284;
    --ing-ring-w: 1px;
    --ing-dot-size: 10px;
    --ing-circle-pw: 25%;
    --ing-circle-pw-d: 25%;
    --ing-ring-m: 70%;
    --ing-ring-d: 70%;
    --ing-orbit-m: 78%;
    --ing-orbit-d: 78%;

    --ing-ease: cubic-bezier(0.22, 1, 0.36, 1);
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
  .ing {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--ing-bg);
    padding: clamp(2rem, 6vw, 3.5rem) var(--ing-pad-x) clamp(2.5rem, 8vw, 4rem);
    overflow: hidden;

    /* These all DERIVE from --ing-scale-m / --ing-product-w, so they must be
       declared on the element the component writes its inline overrides to.
       Declared on :host they would resolve against the host's own defaults and
       every size setting would silently do nothing. */
    --ing-scale: var(--ing-scale-m, 1);
    --ing-pw: var(--ing-product-w, 30%);
    --ing-media: calc(96px * var(--ing-scale));
    --ing-label-fs: calc(0.78rem * var(--ing-scale));
    --ing-link-w: calc(40px * var(--ing-scale));
    --ing-link-h: calc(26px * var(--ing-scale));
    --ing-gap: calc(4px * var(--ing-scale));

    /* Circle layout. --ing-arm-top / --ing-dot-top are the vertical distance
       from the stage top to a point sitting at 12 o'clock on each radius; the
       arm rotation below carries that point around to its real angle. */
    --ing-cpw: var(--ing-circle-pw, 25%);
    --ing-ring-size: var(--ing-ring-m, 70%);
    --ing-orbit-size: var(--ing-orbit-m, 78%);
    --ing-arm-top: calc(50% - var(--ing-orbit-size) / 2);
    --ing-dot-top: calc(50% - var(--ing-ring-size) / 2);
  }

  .ing-header {
    max-width: 640px;
    margin: 0 auto clamp(1.25rem, 4vw, 2rem);
    /* The section is full-bleed on mobile, so the header carries its own
       gutter — only the stage should actually touch the screen edges. */
    padding-inline: clamp(1rem, 4vw, 2rem);
    text-align: center;
  }
  .ing-h2 {
    margin: 0;
    color: var(--ing-title);
    font-size: clamp(1.35rem, 5vw, 2.1rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .ing-sub {
    margin: 0.55rem 0 0;
    color: var(--ing-subtitle);
    font-size: clamp(0.9rem, 1.6vw, 1.02rem);
    line-height: 1.7;
  }

  /* ============================================================
     STAGE — ingredients | product | ingredients
     ============================================================ */
  .ing-stage {
    direction: ltr;
    display: grid;
    grid-template-columns: 1fr var(--ing-pw) 1fr;
    align-items: center;
    column-gap: var(--ing-col-gap);
    width: 100%;
    max-width: var(--ing-stage-max);
    margin-inline: auto;
    padding-inline: clamp(0.5rem, 3vw, 1rem);
  }

  .ing-product {
    grid-column: 2;
    align-self: center;
    min-width: 0;
    /* Optical centring: the component centres the image BOX, which is not the
       same as centring what the eye reads as the product when a shadow is baked
       into one side of the cut-out. Percentages here are of the image's own
       size, so the correction holds at any width setting or breakpoint.

       ⚠️ --ing-prod-dx is NEGATED: positive means LEFT. The merchant panel is
       RTL, and an RTL range input renders its minimum at the RIGHT end, so
       dragging the handle rightwards LOWERS the value. Negating here is what
       makes the product follow the handle instead of mirroring it. See the
       RTL slider note in CLAUDE.md before "fixing" this sign. */
    transform: translate(
      calc(-1 * var(--ing-prod-dx, 0%)),
      var(--ing-prod-dy, 0%)
    );
  }
  .ing-product img {
    display: block;
    width: 100%;
    height: auto;
  }

  .ing-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--ing-row-gap);
    min-width: 0;
  }
  .ing-col[data-side="left"] {
    grid-column: 1;
  }
  .ing-col[data-side="right"] {
    grid-column: 3;
  }

  /* ============================================================
     ONE INGREDIENT — name, hairline, cut-out
     ============================================================ */
  .ing-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ing-gap);
    margin: 0;
    min-width: 0;
    max-width: 100%;
    transform: translateY(var(--ing-offset, 0%));
  }
  /* The name under the picture: flip the stack, and the hairline with it, so
     the dot still lands at the name end. */
  .ing-item[data-label="below"] {
    flex-direction: column-reverse;
  }
  .ing-item[data-label="below"] .ing-link {
    transform: scaleY(-1);
  }
  .ing-item[data-label="below"][data-side="right"] .ing-link {
    transform: scale(-1, -1);
  }

  .ing-label {
    margin: 0;
    color: var(--ing-label);
    font-size: var(--ing-label-fs);
    font-weight: 700;
    line-height: 1.4;
    text-align: center;
    /* Long names must wrap inside the column rather than widen it. */
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  /* Nudge the name toward the product, which is what makes the hairline read
     as a leader line rather than a stray tick. */
  .ing-item[data-align="toward"][data-side="left"] .ing-label {
    transform: translateX(calc(var(--ing-media) * 0.16));
  }
  .ing-item[data-align="toward"][data-side="right"] .ing-label {
    transform: translateX(calc(var(--ing-media) * -0.16));
  }

  .ing-link {
    display: block;
    width: var(--ing-link-w);
    height: var(--ing-link-h);
    overflow: visible;
    color: var(--ing-connector);
    flex: 0 0 auto;
  }
  /* Drawn bending to the right, for an ingredient sitting LEFT of the product.
     The right-hand column is the same curve mirrored. */
  .ing-item[data-side="right"] .ing-link {
    transform: scaleX(-1);
  }
  .ing-link path {
    fill: none;
    stroke: currentColor;
    stroke-width: var(--ing-connector-w);
    stroke-linecap: round;
  }
  .ing-link circle {
    fill: currentColor;
    stroke: none;
  }

  .ing-media {
    display: block;
    width: calc(var(--ing-media) * var(--ing-iscale, 1));
    max-width: 100%;
  }
  .ing-media img {
    display: block;
    width: 100%;
    height: auto;
  }

  /* ============================================================
     FALLBACK — no product shot: a plain two-up grid
     ============================================================ */
  .ing-stage[data-mode="grid"] {
    direction: inherit;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ing-row-gap) var(--ing-col-gap);
    max-width: 520px;
  }
  .ing-stage[data-mode="grid"] .ing-col {
    display: contents;
  }
  /* Nothing to point at once the product is gone. */
  .ing-stage[data-mode="grid"] .ing-link {
    display: none;
  }
  .ing-stage[data-mode="grid"] .ing-item {
    transform: none;
  }
  .ing-stage[data-mode="grid"] .ing-label {
    transform: none;
  }

  .ing-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--ing-subtitle);
    font-size: 0.92rem;
  }

  /* ============================================================
     CIRCLE LAYOUT — a ring orbiting the product

     Placement uses the rotate / counter-rotate arm trick rather than JS
     coordinates or CSS trig: an arm is stretched over the whole square stage
     and rotated to the ingredient's angle, its child is parked at the top of
     that arm one orbit-radius up, then counter-rotated so it sits upright.
     Every input is a percentage, so the whole composition is responsive with
     no resize listener and no sin()/cos() support to worry about.
     ============================================================ */
  .ing-orbit {
    direction: ltr;
    position: relative;
    width: 100%;
    /* Square, so a percentage radius is the same length horizontally and
       vertically and the ring stays a circle. */
    aspect-ratio: 1;
    max-width: var(--ing-stage-max);
    margin-inline: auto;
  }

  .ing-ring-line {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--ing-ring-size);
    aspect-ratio: 1;
    margin: 0;
    border: var(--ing-ring-w) solid var(--ing-ring);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .ing-ring-line[data-ring="dashed"] {
    border-style: dashed;
  }
  .ing-ring-line[data-ring="dotted"] {
    border-style: dotted;
  }

  /* Rotated to its angle; stretched over the stage so its child can be placed
     with a percentage offset from the centre. */
  .ing-arm {
    position: absolute;
    inset: 0;
    transform: rotate(var(--a, 0deg));
    pointer-events: none;
  }
  .ing-arm > * {
    pointer-events: auto;
  }

  /* An outlined bead, not a filled dot — it reads as a station on the line
     rather than a blob, and stays legible at 1px stroke. Sits a few degrees
     around the arc from its ingredient, on the side the name is, so the cut-out
     never covers it. */
  .ing-dot {
    position: absolute;
    left: 50%;
    top: var(--ing-dot-top);
    width: var(--ing-dot-size);
    height: var(--ing-dot-size);
    border: var(--ing-ring-w) solid var(--ing-ring);
    border-radius: 50%;
    background: var(--ing-bg);
    transform: translate(-50%, -50%);
  }

  .ing-orbit .ing-product {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--ing-cpw);
    /* Same nudge, folded into the centring translate — and negated on X for the
       same RTL-slider reason. The ring stays centred on the section; only the
       product moves inside it. */
    transform: translate(
      calc(-50% - var(--ing-prod-dx, 0%)),
      calc(-50% + var(--ing-prod-dy, 0%))
    );
    z-index: 1;
  }

  .ing-orbit .ing-item {
    position: absolute;
    left: 50%;
    top: var(--ing-arm-top);
    /* Kept narrower than the gap to the centre so a long name wraps instead of
       running over the product. */
    max-width: 38%;
    z-index: 2;
    --ing-place: translate(-50%, -50%) rotate(calc(-1 * var(--a, 0deg)));
    transform: var(--ing-place) translateY(var(--ing-offset, 0%));
  }
  /* No hairline in this layout: the ring and its dot are the connector. */
  .ing-orbit .ing-link {
    display: none;
  }
  /* Reserve a square cell up front. The pictures are lazy-loaded, and an
     absolutely-positioned item whose image has not decoded yet collapses to
     label height and jumps once it does — very visible here, because the
     entrance animation can finish before the picture arrives. Equal square
     cells are also what the ring composition wants. */
  .ing-orbit .ing-media {
    aspect-ratio: 1;
  }
  .ing-orbit .ing-media img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  /* Nudge the name away from the product, out over open background. */
  .ing-item[data-align="outward"] .ing-label {
    transform: translateX(calc(var(--ing-media) * 0.18 * var(--ing-out, 1)));
  }

  /* ============================================================
     MOTION
     ============================================================ */
  .ing-item {
    transition:
      opacity 0.55s var(--ing-ease),
      transform 0.55s var(--ing-ease);
    transition-delay: calc(var(--i, 0) * 90ms);
  }
  .ing-stage[data-anim="ready"] .ing-item {
    opacity: 0;
    transform: translateY(calc(var(--ing-offset, 0%) + 10px)) scale(0.96);
  }
  .ing-stage[data-anim="in"] .ing-item {
    opacity: 1;
    transform: translateY(var(--ing-offset, 0%));
  }
  .ing-product {
    transition: opacity 0.6s var(--ing-ease);
  }
  .ing-stage[data-anim="ready"] .ing-product {
    opacity: 0;
  }
  .ing-stage[data-anim="in"] .ing-product {
    opacity: 1;
  }

  /* The orbit re-states the same two states, because its items carry the
     placement transform and cannot simply inherit the columns one. */
  .ing-orbit[data-anim="ready"] .ing-item {
    opacity: 0;
    transform: var(--ing-place) translateY(calc(var(--ing-offset, 0%) + 10px))
      scale(0.92);
  }
  .ing-orbit[data-anim="in"] .ing-item {
    opacity: 1;
    transform: var(--ing-place) translateY(var(--ing-offset, 0%));
  }
  .ing-ring-line,
  .ing-dot {
    transition:
      opacity 0.7s var(--ing-ease),
      transform 0.7s var(--ing-ease);
  }
  .ing-orbit[data-anim="ready"] .ing-ring-line {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.86);
  }
  .ing-orbit[data-anim="in"] .ing-ring-line {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  .ing-dot {
    transition-delay: 0.25s;
  }
  .ing-orbit[data-anim="ready"] .ing-dot {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
  }
  .ing-orbit[data-anim="in"] .ing-dot {
    opacity: 1;
    transform: translate(-50%, -50%);
  }

  @media (prefers-reduced-motion: reduce) {
    .ing-item,
    .ing-product,
    .ing-ring-line,
    .ing-dot {
      transition: none;
    }
    .ing-stage[data-anim="ready"] .ing-item {
      opacity: 1;
      transform: translateY(var(--ing-offset, 0%));
    }
    .ing-stage[data-anim="ready"] .ing-product {
      opacity: 1;
    }
    .ing-orbit[data-anim="ready"] .ing-item {
      opacity: 1;
      transform: var(--ing-place) translateY(var(--ing-offset, 0%));
    }
    .ing-orbit[data-anim="ready"] .ing-ring-line,
    .ing-orbit[data-anim="ready"] .ing-dot {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    :host {
      --ing-pad-x: clamp(1rem, 4vw, 2rem);
    }
    .ing {
      --ing-scale: var(--ing-scale-d, 1);
      --ing-pw: var(--ing-product-w-d, var(--ing-product-w, 30%));
      --ing-cpw: var(--ing-circle-pw-d, var(--ing-circle-pw, 25%));
      --ing-ring-size: var(--ing-ring-d, var(--ing-ring-m, 70%));
      --ing-orbit-size: var(--ing-orbit-d, var(--ing-orbit-m, 78%));
    }
    .ing-header {
      padding-inline: 0;
    }
    .ing-stage {
      padding-inline: 0;
    }
  }
`;
