import { css } from "lit";

export const imageBadgesStyles = css`
  :host {
    display: block;
    direction: inherit;
    font-family: inherit;
    min-width: 0;
    max-width: 100%;

    --ib-bg: #ffffff;
    --ib-title: #14181f;
    --ib-subtitle: #5b6472;
    --ib-item-title: #14181f;
    --ib-size-m: 164px;
    --ib-size-d: 220px;
    --ib-gap-m: 4px;
    --ib-gap-d: 8px;
    --ib-cols-m: 3;
    --ib-cols-d: 4;
    --ib-pad-x: clamp(1rem, 4vw, 2.5rem);
    --ib-ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .ib-section {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding-inline: var(--ib-pad-x);
    padding-block: var(--sp-top-m) var(--sp-bot-m);
    background: var(--ib-bg);
    --ib-size: var(--ib-size-m);
    --ib-gap: var(--ib-gap-m);
  }

  .ib-header {
    position: relative;
    z-index: 1;
    max-width: 680px;
    margin: 0 auto clamp(1.65rem, 6vw, 2.75rem);
    text-align: center;
  }

  .ib-title {
    margin: 0;
    color: var(--ib-title);
    font-size: clamp(1.65rem, 6vw, 2.25rem);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .ib-subtitle {
    margin: 0.6rem 0 0;
    color: var(--ib-subtitle);
    font-size: clamp(0.92rem, 2.8vw, 1.05rem);
    line-height: 1.75;
    white-space: pre-line;
    text-wrap: pretty;
  }

  .ib-grid {
    display: grid;
    grid-template-columns: repeat(var(--ib-cols-m), minmax(0, 1fr));
    align-items: start;
    justify-items: center;
    gap: var(--ib-gap);
    width: 100%;
    max-width: 960px;
    margin-inline: auto;
  }

  .ib-grid[data-layout="pyramid"] {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 680px;
  }

  .ib-grid[data-layout="pyramid"] .ib-item:first-child {
    grid-column: 1 / -1;
  }

  .ib-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0.7rem;
    width: 100%;
    min-width: 0;
    margin: 0;
    text-align: center;
    transition:
      opacity 0.55s var(--ib-ease),
      transform 0.55s var(--ib-ease);
    transition-delay: calc(var(--i, 0) * 75ms);
  }

  .ib-image {
    display: block;
    width: min(var(--ib-size), 100%);
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }

  .ib-item-title {
    max-width: var(--ib-size);
    color: var(--ib-item-title);
    font-size: clamp(0.82rem, 2.9vw, 1rem);
    font-weight: 700;
    line-height: 1.55;
    text-wrap: balance;
  }

  .ib-section[data-anim="ready"] .ib-item {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }

  .ib-section[data-anim="in"] .ib-item {
    opacity: 1;
    transform: none;
  }

  .ib-empty {
    margin: 0;
    padding: 1.5rem 1rem;
    color: var(--ib-subtitle);
    font-size: 0.92rem;
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .ib-item {
      transition: none;
    }

    .ib-section[data-anim="ready"] .ib-item {
      opacity: 1;
      transform: none;
    }
  }

  @media (min-width: 768px) {
    .ib-section {
      padding-block: var(--sp-top-d) var(--sp-bot-d);
      --ib-size: var(--ib-size-d);
      --ib-gap: var(--ib-gap-d);
    }

    .ib-grid:not([data-layout="pyramid"]) {
      grid-template-columns: repeat(var(--ib-cols-d), minmax(0, 1fr));
    }
  }
`;
