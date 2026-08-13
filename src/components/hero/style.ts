import { css } from "lit";

export const heroStyles = css`
  :host {
    /* Inherits from the theme so Arabic font, brand colours, and dir flow through. */
    display: block;
    font-family: inherit;
    direction: inherit;

    /* Tunable CSS custom properties — merchants/themes can override at :root. */
    --gh-height-full: 100svh;
    --gh-height-large: 80svh;
    --gh-height-medium: 60svh;
    --gh-height-compact: 45svh;

    --gh-content-max: 720px;
    --gh-inline-pad: clamp(1.25rem, 4vw, 3.5rem);
    --gh-block-pad: clamp(2rem, 6vw, 5rem);

    --gh-headline-size: clamp(2rem, 5.5vw, 4.5rem);
    --gh-subtitle-size: clamp(1rem, 1.6vw, 1.25rem);
    --gh-eyebrow-size: clamp(0.75rem, 1vw, 0.875rem);

    --gh-radius: 14px;
    --gh-btn-radius: 999px;
    --gh-easing: cubic-bezier(0.22, 1, 0.36, 1);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* A fixed bar lives inside this shadow root, so the HOST is what has to sit
     above the sections that follow it in the page. Scoped to the fixed case so
     a normal hero keeps its default stacking. */
  :host([nav-fixed]) {
    position: relative;
    z-index: 60;
  }

  .hero {
    position: relative;
    width: 100%;
    overflow: hidden;
    isolation: isolate;
    color: #fff;
    background: #0b0b0f;
  }

  .hero[data-height="full"]    { min-height: var(--gh-height-full); }
  .hero[data-height="large"]   { min-height: var(--gh-height-large); }
  .hero[data-height="medium"]  { min-height: var(--gh-height-medium); }
  .hero[data-height="compact"] { min-height: var(--gh-height-compact); }

  .hero[data-text-theme="dark"] {
    color: #0b0b0f;
  }

  /* --- Background layer --- */
  .bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }
  /* Media fills .bg via absolute positioning so it works both as a full-bleed
     background (.bg is absolute) and as a split column (.bg is a grid cell),
     and never contributes its intrinsic size to grid row sizing. */
  .bg > img,
  .bg > picture,
  .bg > video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }
  .bg > img,
  .bg > picture > img,
  .bg > video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    will-change: transform;
  }
  .bg.is-ken-burns > img,
  .bg.is-ken-burns > picture > img {
    animation: kenBurns 24s ease-in-out infinite;
  }
  /* Stop compositing the 24s loop once the hero has scrolled away. */
  :host([out-of-view]) .bg.is-ken-burns > img,
  :host([out-of-view]) .bg.is-ken-burns > picture > img {
    animation-play-state: paused;
  }
  .bg.is-parallax > video,
  .bg.is-parallax > img,
  .bg.is-parallax > picture > img {
    transform: translate3d(0, var(--gh-parallax, 0), 0) scale(1.12);
    transition: transform 0.12s linear;
  }
  .bg.is-gradient {
    background: var(--gh-bg, linear-gradient(135deg, #1e1b4b, #7c3aed));
  }

  /* --- Overlay layer --- */
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
  }
  .overlay[data-style="dark-bottom"] {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, var(--gh-overlay-a, 0.7)) 0%,
      rgba(0, 0, 0, calc(var(--gh-overlay-a, 0.7) * 0.5)) 40%,
      rgba(0, 0, 0, 0) 75%
    );
  }
  .overlay[data-style="dark-full"] {
    background: rgba(0, 0, 0, var(--gh-overlay-a, 0.45));
  }
  .overlay[data-style="light-full"] {
    background: rgba(255, 255, 255, var(--gh-overlay-a, 0.55));
  }
  .overlay[data-style="vignette"] {
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, var(--gh-overlay-a, 0.65)) 100%
    );
  }

  /* --- Top navbar ---
     Default (nav_fixed off): absolute, so the bar scrolls away with the hero.
     position:sticky is not an option here — .hero is overflow:hidden, which
     makes it a scrollport, so sticky would pin to the hero box and never move.

     nav_fixed on: position:fixed pins it to the viewport instead. That works
     from inside this shadow root because nothing in the ancestor chain sets
     transform/filter/will-change, so the viewport really is the containing
     block — the mobile drawer below already relies on the same thing. --- */
  .nav {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    z-index: 3;
    padding-inline: var(--gh-inline-pad);
    padding-block: clamp(0.75rem, 1.8vw, 1.15rem);
  }
  .nav[data-fixed="on"] {
    position: fixed;
    transition:
      background-color 0.28s var(--gh-easing),
      color 0.28s var(--gh-easing),
      box-shadow 0.28s var(--gh-easing);
  }
  /* Past the hero the bar has arbitrary sections behind it, so it stops being
     transparent and carries its own surface — otherwise the white-on-image
     links land on a light section and vanish. */
  .nav[data-fixed="on"][data-scrolled="on"] {
    background: var(--gh-nav-scrolled-bg, #ffffff);
    color: var(--gh-nav-scrolled-fg, #14181f);
    box-shadow: 0 4px 20px -8px rgba(0, 0, 0, 0.25);
  }
  .nav[data-border="on"] {
    border-block-end: 1px solid currentColor;
    /* currentColor at full strength is too loud for a hairline */
    border-block-end-color: color-mix(in srgb, currentColor 18%, transparent);
  }
  .nav-inner {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 3vw, 2.5rem);
    margin-inline: auto;
    max-width: var(--gh-nav-max, 1280px);
  }
  .nav-logo {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: inherit;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.0625rem;
    letter-spacing: -0.01em;
  }
  .nav-logo img {
    display: block;
    height: var(--gh-nav-logo-h, 32px);
    width: auto;
    max-width: 180px;
    object-fit: contain;
  }

  .nav-links {
    display: none; /* mobile-first: the hamburger owns navigation */
    list-style: none;
    margin: 0;
    padding: 0;
    gap: clamp(1rem, 2.2vw, 2rem);
    flex: 1 1 auto;
  }
  .nav-links a {
    position: relative;
    color: inherit;
    text-decoration: none;
    font-size: 0.9375rem;
    font-weight: 500;
    opacity: 0.88;
    white-space: nowrap;
    transition: opacity 0.2s var(--gh-easing);
  }
  .nav-links a::after {
    content: "";
    position: absolute;
    inset-block-end: -4px;
    inset-inline: 0;
    height: 1.5px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: inline-start;
    transition: transform 0.28s var(--gh-easing);
  }
  .nav-links a:hover { opacity: 1; }
  .nav-links a:hover::after { transform: scaleX(1); }

  .nav-actions {
    flex: 0 0 auto;
    margin-inline-start: auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .nav-cta {
    display: none; /* revealed on desktop; mobile keeps the bar uncluttered */
    padding: 0.5rem 1.15rem;
    font-size: 0.8125rem;
  }

  /* Hamburger */
  .nav-burger {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 40px;
    height: 40px;
    padding: 0 8px;
    background: none;
    border: 0;
    cursor: pointer;
    color: inherit;
  }
  .nav-burger span {
    display: block;
    height: 2px;
    width: 100%;
    background: currentColor;
    border-radius: 2px;
    transition: transform 0.3s var(--gh-easing), opacity 0.2s var(--gh-easing);
  }
  .nav-burger[aria-expanded="true"] span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  .nav-burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
  .nav-burger[aria-expanded="true"] span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  /* --- Mobile menu --- */
  .menu {
    position: fixed;
    inset: 0;
    z-index: 40;
    visibility: hidden;
    pointer-events: none;
  }
  .menu[data-open="true"] {
    visibility: visible;
    pointer-events: auto;
  }
  .menu-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s var(--gh-easing);
  }
  .menu[data-open="true"] .menu-backdrop { opacity: 1; }
  .menu-panel {
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0;
    width: min(84vw, 340px);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow-y: auto;
    background: var(--gh-menu-bg, #0b0b0f);
    color: var(--gh-menu-fg, #fff);
    transform: translateX(100%);
    transition: transform 0.34s var(--gh-easing);
  }
  .menu-panel:dir(rtl) { transform: translateX(-100%); }
  .menu[data-open="true"] .menu-panel { transform: translateX(0); }
  .menu-close {
    align-self: flex-end;
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
  }
  .menu-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .menu-links a {
    display: block;
    padding: 0.85rem 0.25rem;
    color: inherit;
    text-decoration: none;
    font-size: 1.125rem;
    font-weight: 600;
    border-block-end: 1px solid rgba(128, 128, 128, 0.22);
  }
  .menu-cta { margin-top: auto; }
  .menu-cta .btn { width: 100%; }

  @media (prefers-reduced-motion: reduce) {
    .menu-panel,
    .menu-backdrop,
    .nav,
    .nav-links a::after,
    .nav-burger span { transition: none; }
  }

  /* Keep hero content clear of the bar. Only applied when a nav is rendered,
     so a hero without one keeps its original vertical rhythm. */
  .hero[data-has-nav="on"] .content-wrap {
    padding-block-start: calc(var(--gh-block-pad) + 3.5rem);
  }

  /* Desktop nav: links inline, hamburger gone. */
  @media (min-width: 768px) {
    .nav-links { display: flex; }
    .nav-cta { display: inline-flex; }
    .nav-burger { display: none; }
    .hero[data-has-nav="on"] .content-wrap {
      padding-block-start: calc(var(--gh-block-pad) + 4rem);
    }
  }

  /* --- Content layer --- */
  .content-wrap {
    position: relative;
    z-index: 2;
    display: flex;
    width: 100%;
    min-height: inherit;
    padding-inline: var(--gh-inline-pad);
    padding-block: var(--gh-block-pad);
  }
  .hero[data-align-v="top"]    .content-wrap { align-items: flex-start; }
  .hero[data-align-v="middle"] .content-wrap { align-items: center; }
  .hero[data-align-v="bottom"] .content-wrap { align-items: flex-end; }

  .hero[data-align-h="start"]  .content-wrap { justify-content: flex-start; text-align: start; }
  .hero[data-align-h="center"] .content-wrap { justify-content: center;    text-align: center; }
  .hero[data-align-h="end"]    .content-wrap { justify-content: flex-end;  text-align: end; }

  .content {
    max-width: var(--gh-content-max);
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 1.8vw, 1.5rem);
  }
  .hero[data-align-h="center"] .content { align-items: center; }
  .hero[data-align-h="end"]    .content { align-items: flex-end; }

  /* --- Typography --- */
  .eyebrow {
    font-size: var(--gh-eyebrow-size);
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.9;
    margin: 0;
    color: var(--gh-eyebrow-color, inherit);
    /* Arabic has no uppercase — respect script */
    &:dir(rtl) { letter-spacing: 0; text-transform: none; }
  }
  .headline {
    font-size: var(--gh-headline-size);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin: 0;
    text-wrap: balance;
    color: var(--gh-title-color, inherit);
  }
  .headline:dir(rtl) {
    letter-spacing: 0;
    line-height: 1.3;
  }
  .subtitle {
    font-size: var(--gh-subtitle-size);
    line-height: 1.6;
    opacity: 0.92;
    margin: 0;
    max-width: 54ch;
    text-wrap: pretty;
    color: var(--gh-subtitle-color, inherit);
  }

  /* --- CTAs --- */
  .ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.65rem 1.5rem;
    font-family: inherit;
    font-weight: 600;
    font-size: 0.875rem;
    text-decoration: none;
    border-radius: var(--gh-btn-radius);
    border: 1.5px solid transparent;
    cursor: pointer;
    transition:
      transform 0.25s var(--gh-easing),
      background-color 0.25s var(--gh-easing),
      border-color 0.25s var(--gh-easing),
      color 0.25s var(--gh-easing),
      box-shadow 0.25s var(--gh-easing);
    white-space: nowrap;
  }
  .btn-primary {
    background: var(--gh-btn-bg, #ffffff);
    color: var(--gh-btn-fg, #0b0b0f);
    box-shadow: 0 8px 24px -10px rgba(0, 0, 0, 0.45);
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.55);
  }
  .btn-outline {
    background: transparent;
    color: var(--gh-btn-fg, currentColor);
    border-color: var(--gh-btn-fg, currentColor);
    backdrop-filter: blur(6px);
  }
  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }
  .hero[data-text-theme="dark"] .btn-outline:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  /* --- Trust points --- */
  .trust {
    list-style: none;
    margin: 0.875rem 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
  }
  .hero[data-align-h="center"] .trust { justify-content: center; }
  .hero[data-align-h="end"]    .trust { justify-content: flex-end; }
  .trust-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.2;
    opacity: 0.92;
    white-space: nowrap;
    color: var(--gh-subtitle-color, inherit);
  }

  /* Custom-colours mode: show the chosen colours at full strength (drop the
     subtle auto-dimming used in the default theme-driven flow). */
  .hero[data-custom-colors="on"] .eyebrow,
  .hero[data-custom-colors="on"] .subtitle,
  .hero[data-custom-colors="on"] .trust-item {
    opacity: 1;
  }
  .trust-icon {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    opacity: 0.85;
  }

  /* --- Entrance motion --- */
  .content[data-anim="ready"] > * {
    opacity: 0;
    transform: translateY(14px);
  }
  .content[data-anim="in"] > * {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.7s var(--gh-easing),
      transform 0.7s var(--gh-easing);
  }
  .content[data-anim="in"] > *:nth-child(1) { transition-delay: 0.05s; }
  .content[data-anim="in"] > *:nth-child(2) { transition-delay: 0.15s; }
  .content[data-anim="in"] > *:nth-child(3) { transition-delay: 0.28s; }
  .content[data-anim="in"] > *:nth-child(4) { transition-delay: 0.40s; }
  .content[data-anim="in"] > *:nth-child(5) { transition-delay: 0.52s; }

  @media (prefers-reduced-motion: reduce) {
    .bg.is-ken-burns > img,
    .bg.is-ken-burns > picture > img { animation: none; }
    .bg.is-parallax > video,
    .bg.is-parallax > img,
    .bg.is-parallax > picture > img { transform: none; }
    .content[data-anim] > * { opacity: 1 !important; transform: none !important; transition: none !important; }
  }

  @keyframes kenBurns {
    0% {
      transform: scale(1.04) translate3d(0, 0, 0);
    }
    50% {
      transform: scale(1.14) translate3d(-2%, -1.5%, 0);
    }
    100% {
      transform: scale(1.04) translate3d(0, 0, 0);
    }
  }

  /* --- Split layout (desktop ≥768 px): media on one side, content on the other.
         On mobile this never applies — the media stays a full background. --- */
  @media (min-width: 768px) {
    .hero[data-layout="split"] {
      display: grid;
      grid-template-columns: var(--gh-split-start, 1fr) var(--gh-split-end, 1fr);
      align-items: stretch;
      align-content: stretch;
    }
    /* .bg leaves the absolute full-bleed flow and becomes a real grid column.
       Columns are line-based (line 1 = inline-start), so the component resolves
       the merchant's physical left/right choice into data-media-col for the
       current writing direction. */
    .hero[data-layout="split"] .bg {
      position: relative;
      inset: auto;
    }
    .hero[data-layout="split"][data-media-col="start"] .bg           { grid-column: 1; grid-row: 1; }
    .hero[data-layout="split"][data-media-col="start"] .content-wrap { grid-column: 2; grid-row: 1; }
    .hero[data-layout="split"][data-media-col="end"]   .bg           { grid-column: 2; grid-row: 1; }
    .hero[data-layout="split"][data-media-col="end"]   .content-wrap { grid-column: 1; grid-row: 1; }

    /* The content side gets its own backdrop — media no longer sits behind it. */
    .hero[data-layout="split"] .content-wrap {
      background: var(--gh-split-content-bg, #0b0b0f);
      color: #fff;
    }
    .hero[data-layout="split"][data-split-text-theme="dark"] .content-wrap {
      color: #0b0b0f;
    }
  }

  /* --- Mobile tuning --- */
  @media (max-width: 640px) {
    :host {
      --gh-headline-size: clamp(1.75rem, 8vw, 2.5rem);
    }
    .ctas { flex-direction: column; align-items: flex-start; }
    .hero[data-align-h="center"] .ctas { align-items: center; }
    .hero[data-align-h="end"]    .ctas { align-items: flex-end; }
  }
`;
