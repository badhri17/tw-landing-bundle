import { css } from "lit";

/**
 * Comparison-table styles — mobile-first, RTL-first.
 *
 * Three decisions shape this file:
 *
 * 1. It is a real <table>. A CSS grid would have needed row/column semantics
 *    bolted back on through ARIA, and column widths negotiated by hand; a
 *    table gives both for free and mirrors itself in RTL with no work. Every
 *    rule that could take a side uses a logical property, so nothing has to be
 *    flipped by hand.
 *
 * 2. The highlighted column is painted with inset box-shadows rather than
 *    borders. A border on a table cell is arbitrated against the neighbouring
 *    cell's border and loses half the time; an inset shadow is drawn inside
 *    the cell's own box, so the column outline stays continuous from the
 *    header down to the last row.
 *
 * 3. Every value that differs between breakpoints is a custom property with an
 *    "-m" and a "-d" variant, resolved on the SECTION element the component
 *    writes its inline style to — never on :host. A derived declaration on
 *    :host resolves against the host's own values and would silently ignore
 *    the merchant's setting.
 *
 * The section uses "overflow: clip visible" for the same reason faq does: the
 * side design element hangs past the section edge on purpose, and that pair
 * clips it horizontally without creating a scroll container.
 */
export const comparisonStyles = css`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    min-width: 0;
    max-width: 100%;

    --cmp-bg: #f5f5f5;
    --cmp-title: #14181f;
    --cmp-sub: #5b6472;
    --cmp-card-bg: #ffffff;
    --cmp-text: #14181f;
    --cmp-border: #e6e8ec;
    --cmp-us-bg: #f7fbf9;
    --cmp-us-border: #cfe7dc;
    --cmp-others: #8b95a3;
    --cmp-check: #1f9d63;
    --cmp-cross: #e0555a;
    --cmp-note: #8b95a3;

    --cmp-radius: 18px;
    /* Fixed, not a merchant field: the header, the card and the footnote all
       measure against it, so it is one number holding three rules in line
       rather than a decision worth asking about. */
    --cmp-max: 880px;

    /* Mobile is primary; the desktop twin is swapped in the media query. */
    --cmp-pad-m: 13px;
    --cmp-pad-d: 19px;
    --cmp-fs-m: 0.92rem;
    --cmp-fs-d: 1.02rem;
    --cmp-logo-m: 92px;
    --cmp-logo-d: 124px;
    --cmp-side-clearance-m: 0px;
    --cmp-side-clearance-d: 0px;

    --cmp-pad-x: clamp(1rem, 4vw, 2.5rem);
    --cmp-ease: cubic-bezier(0.22, 1, 0.36, 1);
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
  .cmp {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--cmp-bg);
    /* Vertical space is the merchant's, via the shared tiers; the horizontal
       padding stays the section's own. See src/shared/section-spacing.ts. */
    padding-block: max(var(--sp-top-m), var(--cmp-side-clearance-m))
      var(--sp-bot-m);
    padding-inline: var(--cmp-pad-x);
    overflow: clip visible;

    /* Derived values live here, on the element that receives the inline
       style — see the file header. */
    --cmp-pad: var(--cmp-pad-m);
    --cmp-fs: var(--cmp-fs-m);
    --cmp-logo: var(--cmp-logo-m);
    --cmp-radius-in: max(0px, calc(var(--cmp-radius) - 5px));

    /* Floor width of the two compared columns. The feature column is the only
       one declared "width: 100%", so it absorbs whatever these two leave —
       which makes this the number that decides how hard the Arabic feature
       text wraps. A mark plus its padding needs ~42px, so 58 is the honest
       floor on a phone. Deliberately not a merchant field: it is a
       consequence of the layout, not a decision worth asking about. */
    --cmp-colw: 58px;

    /* Every cell pays this twice, three times across the row, so on a phone it
       is worth more to the feature text than it looks. */
    --cmp-cell-x: 0.5rem;

    /* Glyph sizing, smaller on a phone so the columns can be narrower. */
    --cmp-mark: 1.15rem;
    --cmp-mark-box: 1.65rem;
    --cmp-mark-in: 0.95rem;
  }

  .cmp-header {
    position: relative;
    z-index: 2;
    max-width: var(--cmp-max);
    margin: 0 auto clamp(1.5rem, 4vw, 2.25rem);
    text-align: center;
  }

  .cmp-title {
    margin: 0;
    color: var(--cmp-title);
    font-size: clamp(1.7rem, 5vw, 2.25rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .cmp-sub {
    margin: 0.6rem 0 0;
    color: var(--cmp-sub);
    font-size: clamp(0.95rem, 2.4vw, 1.0625rem);
    line-height: 1.8;
    white-space: pre-line;
    text-wrap: pretty;
  }

  .cmp-empty {
    margin: 0;
    color: var(--cmp-sub);
    text-align: center;
    font-size: 0.95rem;
  }

  /* ============================================================
     CARD
     The scroll container of last resort: three columns fit a phone, but a
     merchant writing long override values can still overflow, and a table
     that pushes the whole page sideways is worse than one that scrolls
     inside its own frame.
     ============================================================ */
  .cmp-card {
    position: relative;
    z-index: 1;
    max-width: var(--cmp-max);
    margin-inline: auto;
    background: var(--cmp-card-bg);
    border: 1px solid var(--cmp-border);
    border-radius: var(--cmp-radius);
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }

  .cmp-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    /* Below this the Arabic feature text wraps to about a word per line. */
    min-width: 19rem;
  }

  /* Let the card bleed to both mobile viewport edges when requested. */
  .cmp[data-full-mobile="on"] {
    padding-inline: 0;
  }

  /* ============================================================
     CELLS
     ============================================================ */
  .cmp-th,
  .cmp-cell {
    margin: 0;
    padding: var(--cmp-pad) var(--cmp-cell-x);
    font-weight: 400;
    vertical-align: middle;
    background-clip: padding-box;
  }

  /* The feature column absorbs whatever the two compared columns leave, so
     those two floors are what decide how hard the Arabic text wraps. */
  .cmp-th[data-col="feature"],
  .cmp-cell[data-col="feature"] {
    width: 100%;
    text-align: start;
  }

  .cmp-th[data-col="us"],
  .cmp-cell[data-col="us"],
  .cmp-th[data-col="others"],
  .cmp-cell[data-col="others"] {
    min-width: var(--cmp-colw);
    text-align: center;
  }

  /* Only reserve room for the logo when there IS one. Keying this off
     --cmp-logo unconditionally held ~116px for an image that was never there,
     and the feature text paid for it in wrapped lines. */
  .cmp-table[data-logo="on"] .cmp-th[data-col="us"],
  .cmp-table[data-logo="on"] .cmp-cell[data-col="us"] {
    min-width: max(
      var(--cmp-colw),
      calc(var(--cmp-logo) + var(--cmp-cell-x) * 2)
    );
  }

  .cmp-cell[data-col="feature"] {
    color: var(--cmp-text);
    font-size: var(--cmp-fs);
    font-weight: 600;
    line-height: 1.7;
    text-wrap: pretty;
  }

  /* ============================================================
     HEADER ROW
     ============================================================ */
  .cmp-th {
    padding-block: clamp(1rem, 3.4vw, 1.5rem);
    vertical-align: bottom;
  }

  .cmp-table-title {
    display: block;
    color: var(--cmp-title);
    font-size: clamp(1.15rem, 3.6vw, 1.6rem);
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .cmp-logo {
    display: block;
    width: var(--cmp-logo);
    max-width: 100%;
    height: auto;
    margin-inline: auto;
    object-fit: contain;
  }

  .cmp-col-label {
    display: block;
    color: var(--cmp-others);
    /* Sized off the row text so the whole table shrinks together on a phone. */
    font-size: calc(var(--cmp-fs) * 0.86);
    font-weight: 600;
    line-height: 1.5;
    text-wrap: balance;
  }

  /* Our own column keeps the ink of the section when it has no logo, so it
     still reads as the answer rather than as the runner-up. */
  .cmp-th[data-col="us"] .cmp-col-label {
    color: var(--cmp-title);
    font-weight: 800;
  }

  /* ============================================================
     GRID LINES
     Logical sides, so one rule draws the correct edge in both directions: a
     start-side line separates a cell from the one before it.
     ============================================================ */
  .cmp-table[data-grid="on"] tbody .cmp-cell {
    border-block-start: 1px solid var(--cmp-border);
  }

  .cmp-table[data-grid="on"] .cmp-th:not([data-col="feature"]),
  .cmp-table[data-grid="on"] .cmp-cell:not([data-col="feature"]) {
    border-inline-start: 1px solid var(--cmp-border);
  }

  /* ============================================================
     STRIPES
     Skipped on the highlighted column, which paints its own tint and must not
     be striped over.
     ============================================================ */
  .cmp-table[data-stripes="on"]
    tbody
    tr:nth-child(even)
    .cmp-cell:not([data-col="us"]) {
    background: color-mix(in srgb, var(--cmp-border) 26%, transparent);
  }

  /* ============================================================
     HIGHLIGHTED COLUMN
     See the file header for why this is an inset shadow and not a border.
     ============================================================ */
  .cmp-table[data-highlight="on"] [data-col="us"] {
    background: var(--cmp-us-bg);
    box-shadow:
      inset 1px 0 0 var(--cmp-us-border),
      inset -1px 0 0 var(--cmp-us-border);
  }

  .cmp-table[data-highlight="on"] thead [data-col="us"] {
    box-shadow:
      inset 1px 0 0 var(--cmp-us-border),
      inset -1px 0 0 var(--cmp-us-border),
      inset 0 1px 0 var(--cmp-us-border);
    border-start-start-radius: var(--cmp-radius-in);
    border-start-end-radius: var(--cmp-radius-in);
  }

  .cmp-table[data-highlight="on"] tbody tr:last-child [data-col="us"] {
    box-shadow:
      inset 1px 0 0 var(--cmp-us-border),
      inset -1px 0 0 var(--cmp-us-border),
      inset 0 -1px 0 var(--cmp-us-border);
    border-end-start-radius: var(--cmp-radius-in);
    border-end-end-radius: var(--cmp-radius-in);
  }

  /* ============================================================
     MARKS
     currentColor carries the yes/no decision, so one set of rules dresses
     both glyphs and the tinted and filled variants come for free.
     ============================================================ */
  .cmp-mark {
    display: inline-grid;
    place-items: center;
    color: var(--cmp-cross);
  }

  .cmp-mark[data-on="yes"] {
    color: var(--cmp-check);
  }

  .cmp-mark svg {
    display: block;
    width: var(--cmp-mark);
    height: var(--cmp-mark);
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .cmp-mark[data-style="circle"],
  .cmp-mark[data-style="solid"] {
    width: var(--cmp-mark-box);
    height: var(--cmp-mark-box);
    border-radius: 50%;
  }

  .cmp-mark[data-style="circle"] {
    background: color-mix(in srgb, currentColor 13%, transparent);
  }

  .cmp-mark[data-style="solid"] {
    background: currentColor;
  }

  .cmp-mark[data-style="circle"] svg,
  .cmp-mark[data-style="solid"] svg {
    width: var(--cmp-mark-in);
    height: var(--cmp-mark-in);
    stroke-width: 2.6;
  }

  .cmp-mark[data-style="solid"] svg {
    stroke: var(--cmp-card-bg);
  }

  /* A short value in place of the glyph, for rows that measure rather than
     answer yes or no. */
  .cmp-val {
    display: block;
    color: var(--cmp-text);
    font-size: calc(var(--cmp-fs) * 0.94);
    font-weight: 700;
    line-height: 1.5;
    text-wrap: balance;
  }

  .cmp-cell[data-col="others"] .cmp-val {
    color: var(--cmp-others);
    font-weight: 600;
  }

  /* ============================================================
     FOOTNOTE
     ============================================================ */
  .cmp-note {
    position: relative;
    z-index: 1;
    max-width: var(--cmp-max);
    margin: 0.9rem auto 0;
    color: var(--cmp-note);
    font-size: clamp(0.75rem, 2vw, 0.83rem);
    line-height: 1.7;
    text-align: center;
    white-space: pre-line;
    text-wrap: pretty;
  }

  /* ============================================================
     ENTRANCE
     The transform rides an inner span, never the row or the cell: a transform
     on a table row or a table cell is the one place engines still disagree,
     and the backgrounds painted above must not fade with the content.
     ============================================================ */
  .cmp-in {
    display: block;
    transition:
      opacity 0.5s var(--cmp-ease),
      transform 0.5s var(--cmp-ease);
    transition-delay: calc(var(--i, 0) * 60ms);
  }

  .cmp-table[data-anim="ready"] .cmp-in {
    opacity: 0;
    transform: translateY(10px);
  }

  .cmp-table[data-anim="in"] .cmp-in {
    opacity: 1;
    transform: none;
  }

  /* ============================================================
     SIDE DESIGN ELEMENT (عنصر بصري جانبي)
     Shared resolver in src/shared/side-element.ts; the properties below are
     the ones it returns. Depth is honoured as it is in faq: the header sits
     at 2 and the card at 1, so "behind" tucks under both and "front" floats
     over them.
     ============================================================ */
  .cmp-side {
    position: absolute;
    top: var(--se-top, 0%);
    width: var(--se-w, 45%);
    height: auto;
    opacity: var(--se-op, 1);
    pointer-events: none;
    user-select: none;
    max-width: none;
  }

  .cmp-side[data-depth="behind"] {
    z-index: 0;
  }

  .cmp-side[data-depth="front"] {
    z-index: 3;
  }

  .cmp-side[data-slot="1"] {
    --se-w: var(--se1-w-m);
    --se-x: var(--se1-x-m);
    --se-y: var(--se1-y-m);
    --se-top: var(--se1-top-m);
    --se-pull: var(--se1-pull-m);
    --se-op: var(--se1-op);
  }

  .cmp-side[data-slot="2"] {
    --se-w: var(--se2-w-m);
    --se-x: var(--se2-x-m);
    --se-y: var(--se2-y-m);
    --se-top: var(--se2-top-m);
    --se-pull: var(--se2-pull-m);
    --se-op: var(--se2-op);
  }

  /* A positive X always pushes the element further OUT of the section,
     whichever edge it is parked on, so the merchant's slider means one thing
     on both sides. The value is a magnitude and not a signed nudge because an
     RTL range input runs its minimum at the right while CSS translateX with a
     positive argument is always physically rightward — a signed value would
     drag backwards. */
  .cmp-side[data-side="left"] {
    left: 0;
    transform: translate(
      calc(-1 * var(--se-x, 0%)),
      calc(var(--se-pull, 0%) + var(--se-y, 0%))
    );
  }

  .cmp-side[data-side="right"] {
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
    .cmp-in {
      transition: none;
    }
    .cmp-table[data-anim="ready"] .cmp-in {
      opacity: 1;
      transform: none;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    .cmp[data-full-mobile="on"] {
      padding-inline: var(--cmp-pad-x);
    }

    .cmp {
      padding-block: max(var(--sp-top-d), var(--cmp-side-clearance-d))
        var(--sp-bot-d);
      --cmp-pad: var(--cmp-pad-d);
      --cmp-fs: var(--cmp-fs-d);
      --cmp-logo: var(--cmp-logo-d);
      --cmp-colw: 108px;
      --cmp-cell-x: clamp(1rem, 2.2vw, 1.5rem);
      --cmp-mark: 1.35rem;
      --cmp-mark-box: 1.9rem;
      --cmp-mark-in: 1.05rem;
    }
    .cmp-side[data-slot="1"] {
      --se-w: var(--se1-w-d);
      --se-x: var(--se1-x-d);
      --se-y: var(--se1-y-d);
      --se-top: var(--se1-top-d);
      --se-pull: var(--se1-pull-d);
    }
    .cmp-side[data-slot="2"] {
      --se-w: var(--se2-w-d);
      --se-x: var(--se2-x-d);
      --se-y: var(--se2-y-d);
      --se-top: var(--se2-top-d);
      --se-pull: var(--se2-pull-d);
    }
  }
`;
