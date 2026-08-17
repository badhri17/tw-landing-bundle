import { css } from "lit";

/**
 * Metrics styles — mobile-first, RTL-first.
 *
 * Mobile is the base rule; the only desktop override is the column count and a
 * slightly wider gap, inside `@media (min-width: 768px)`. Colours come from CSS
 * custom properties the component resolves from merchant settings; the values
 * here are the light-theme fallbacks.
 *
 * Card shapes are selected with `[data-style]` on the section.
 */
export const metricsStyles = css`
  :host {
    display: block;
    font-family: inherit;
    direction: inherit;
    /* Width comes from the container, never from the contents — keeps a long
       label from widening the Salla component card. */
    min-width: 0;
    max-width: 100%;

    --m-bg: #ffffff;
    --m-card-bg: #f4f3f1;
    --m-number: #3d230e;
    --m-label: #6b7280;
    --m-border: rgba(20, 24, 31, 0.1);

    --m-gap: clamp(10px, 2.4vw, 16px);
    --m-pad-x: clamp(1rem, 4vw, 2rem);
    --m-pad-y: clamp(1.25rem, 4vw, 2.5rem);
    --m-radius: 18px;
    --m-cols-mobile: 3;
    --m-cols-desktop: 3;
    /* Scaled by the number-size setting. */
    --m-scale: 1;
    --m-ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .m-section {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    background: var(--m-bg);
    padding: var(--m-pad-y) var(--m-pad-x);
  }

  /* ============================================================
     HEADER (optional)
     ============================================================ */
  .m-header {
    max-width: 640px;
    margin: 0 auto clamp(1.1rem, 3vw, 1.75rem);
    text-align: center;
  }
  .m-title {
    margin: 0;
    color: var(--m-number);
    font-size: clamp(1.3rem, 3.6vw, 2rem);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }
  .m-subtitle {
    margin: 0.55rem 0 0;
    color: var(--m-label);
    font-size: clamp(0.9rem, 1.6vw, 1.02rem);
    line-height: 1.7;
  }

  /* ============================================================
     GRID
     ============================================================ */
  .m-grid {
    display: grid;
    grid-template-columns: repeat(var(--m-cols-mobile), minmax(0, 1fr));
    gap: var(--m-gap);
    align-items: stretch;
  }

  .m-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    min-width: 0;
    text-align: center;
    padding: clamp(0.85rem, 2.6vw, 1.35rem) clamp(0.5rem, 2vw, 1rem);
    border-radius: var(--m-radius);
    border: 1px solid transparent;
    background: transparent;
    /* Sizing context for the number: the cqw unit below is 1% of THIS card's
       content box, which is what decides whether a long figure fits. */
    container-type: inline-size;
  }

  .m-value {
    color: var(--m-number);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    /* Fixed-width digits so the counter doesn't jitter while it runs. */
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1;
    /* A number must never break mid-digit ("9,7" / "50"). */
    white-space: nowrap;

    /* Preferred size — also the fallback wherever container queries are
       unsupported and the min() below is dropped as invalid. */
    font-size: calc(clamp(1.25rem, 5.2vw, 2.05rem) * var(--m-scale));
    /* …capped at whatever actually fits on one line. --m-chars is the rendered
       length; 0.62em is the average advance of a bold tabular digit. */
    font-size: min(
      calc(clamp(1.25rem, 5.2vw, 2.05rem) * var(--m-scale)),
      calc(100cqw / (var(--m-chars, 4) * 0.62))
    );
  }

  .m-label {
    color: var(--m-label);
    font-size: calc(clamp(0.72rem, 2.5vw, 0.9rem) * var(--m-scale));
    font-weight: 600;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  /* ============================================================
     CARD STYLES
     ============================================================ */
  .m-section[data-style="soft"] .m-card {
    background: var(--m-card-bg);
  }

  .m-section[data-style="outline"] .m-card {
    border-color: var(--m-border);
  }

  /* Hairline cells: the grid paints the lines and 1px gaps reveal them, so the
     separators stay correct however many rows the cards wrap onto. */
  .m-section[data-style="divided"] .m-grid {
    gap: 1px;
    background: var(--m-border);
    border-radius: var(--m-radius);
    overflow: hidden;
  }
  .m-section[data-style="divided"] .m-card {
    background: var(--m-bg);
    border-radius: 0;
  }

  .m-section[data-style="plain"] .m-card {
    padding-inline: 0.25rem;
  }

  /* ============================================================
     MOTION — entrance rise, staggered per card
     ============================================================ */
  .m-card {
    transition:
      opacity 0.5s var(--m-ease),
      transform 0.5s var(--m-ease);
    transition-delay: calc(var(--i, 0) * 70ms);
  }
  .m-section[data-anim="ready"] .m-card {
    opacity: 0;
    transform: translateY(10px);
  }
  .m-section[data-anim="in"] .m-card {
    opacity: 1;
    transform: none;
  }

  .m-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--m-label);
    font-size: 0.92rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .m-card {
      transition: none;
    }
    .m-section[data-anim="ready"] .m-card {
      opacity: 1;
      transform: none;
    }
  }

  /* ============================================================
     DESKTOP
     ============================================================ */
  @media (min-width: 768px) {
    :host {
      --m-gap: clamp(14px, 1.6vw, 22px);
    }
    .m-grid {
      grid-template-columns: repeat(var(--m-cols-desktop), minmax(0, 1fr));
    }
  }
`;
