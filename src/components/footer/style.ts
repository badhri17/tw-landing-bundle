import { css } from "lit";

export const footerStyles = css`
  :host {
    --fcta-footer-overlap: clamp(34px, 6vw, 64px);

    display: block;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    font-family: inherit;
    direction: inherit;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .final-cta {
    --fcta-bg: #6b4024;
    --fcta-text: #ffffff;
    --fcta-button-bg: #ffffff;
    --fcta-button-text: #4b2a16;
    --fcta-padding-x: clamp(1.25rem, 5vw, 4rem);
    --fcta-overlay-alpha: 0.35;
    --fcta-overlay-soft-alpha: 0.2;
    --fcta-overlay-strong-alpha: 0.55;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100%;
    min-height: clamp(360px, 72vw, 680px);
    display: flex;
    align-items: stretch;
    justify-content: center;
    padding: clamp(2.4rem, 7vw, 5rem) var(--fcta-padding-x)
      calc(clamp(2.4rem, 7vw, 5rem) + var(--fcta-footer-overlap));
    background: var(--fcta-bg);
    color: var(--fcta-text);
    text-align: center;
  }

  .final-cta[data-has-image="false"] {
    min-height: 0;
    padding-block: clamp(3.5rem, 10vw, 7rem)
      calc(clamp(3.5rem, 10vw, 7rem) + var(--fcta-footer-overlap));
  }

  .final-cta::before,
  .final-cta::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .final-cta::before {
    z-index: -2;
    background:
      radial-gradient(
        circle at 50% 10%,
        color-mix(in srgb, var(--fcta-text) 14%, transparent),
        transparent 48%
      ),
      linear-gradient(
        135deg,
        transparent,
        color-mix(in srgb, var(--fcta-text) 6%, transparent)
      );
  }

  .final-cta[data-has-image="true"][data-overlay-style="dark-gradient"]::after {
    z-index: -1;
    background: linear-gradient(
      180deg,
      rgb(0 0 0 / var(--fcta-overlay-alpha)) 0%,
      rgb(0 0 0 / var(--fcta-overlay-soft-alpha)) 55%,
      rgb(0 0 0 / var(--fcta-overlay-strong-alpha)) 100%
    );
  }

  .final-cta[data-has-image="true"][data-overlay-style="light-gradient"]::after {
    z-index: -1;
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / var(--fcta-overlay-alpha)) 0%,
      rgb(255 255 255 / var(--fcta-overlay-soft-alpha)) 52%,
      rgb(255 255 255 / var(--fcta-overlay-strong-alpha)) 100%
    );
  }

  .final-cta[data-has-image="true"][data-overlay-style="light-gradient"] {
    color: var(--fcta-text);
  }

  .final-cta-image {
    position: absolute;
    z-index: -3;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
  }

  .final-cta-content {
    width: min(100%, 780px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .final-cta-panel {
    width: fit-content;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(0.8rem, 2.4vw, 1.4rem);
  }

  .final-cta[data-has-image="true"][data-overlay-style^="glass"]
    .final-cta-content {
    max-width: none;
  }

  .final-cta[data-has-image="true"][data-overlay-style^="glass"]
    .final-cta-panel {
    width: calc(100% + (var(--fcta-padding-x) * 2));
    max-width: none;
    margin-inline: calc(-1 * var(--fcta-padding-x));
    padding: clamp(1.1rem, 3.6vw, 2.2rem) var(--fcta-padding-x);
    border: 0;
    border-block: 1px solid rgb(255 255 255 / 0.16);
    border-radius: 0;
    background: linear-gradient(
      90deg,
      rgb(0 0 0 / var(--fcta-overlay-soft-alpha)) 0%,
      rgb(0 0 0 / var(--fcta-overlay-strong-alpha)) 50%,
      rgb(0 0 0 / var(--fcta-overlay-soft-alpha)) 100%
    );
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.1);
    backdrop-filter: blur(18px) saturate(145%);
    -webkit-backdrop-filter: blur(18px) saturate(145%);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"] {
    color: var(--fcta-text);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"]
    .final-cta-panel {
    border-block-color: rgb(255 255 255 / 0.42);
    background: linear-gradient(
      90deg,
      rgb(255 255 255 / var(--fcta-overlay-soft-alpha)) 0%,
      rgb(255 255 255 / var(--fcta-overlay-strong-alpha)) 50%,
      rgb(255 255 255 / var(--fcta-overlay-soft-alpha)) 100%
    );
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.34);
  }

  .final-cta[data-content-position="center"] .final-cta-content {
    justify-content: center;
  }

  .final-cta[data-content-position="bottom"] .final-cta-content {
    justify-content: flex-end;
  }

  .final-cta[data-has-image="false"] .final-cta-content {
    justify-content: center;
  }

  .final-cta-message {
    max-width: 20ch;
    margin: 0;
    color: inherit;
    font-size: clamp(1.65rem, 6.5vw, 4.25rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.035em;
    white-space: pre-line;
    text-wrap: balance;
    text-shadow: 0 2px 20px rgb(0 0 0 / 0.24);
  }

  .final-cta-button {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.62rem 1.35rem;
    border: 1px solid color-mix(in srgb, var(--fcta-button-bg) 82%, transparent);
    border-radius: 999px;
    background: var(--fcta-button-bg);
    color: var(--fcta-button-text);
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.18);
    font-size: 0.9rem;
    font-weight: 800;
    line-height: 1;
    text-decoration: none;
    transition:
      transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.25s ease;
  }

  .final-cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 34px rgb(0 0 0 / 0.24);
  }

  .final-cta-button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }

  .final-cta[data-button-style="outline"] .final-cta-button {
    border-color: var(--fcta-button-bg);
    background: color-mix(in srgb, var(--fcta-button-bg) 8%, transparent);
    color: var(--fcta-button-bg);
    box-shadow: none;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .final-cta[data-button-style="outline"] .final-cta-button:hover {
    background: color-mix(in srgb, var(--fcta-button-bg) 16%, transparent);
    box-shadow: 0 12px 30px rgb(0 0 0 / 0.16);
  }

  .final-cta[data-has-image="true"][data-overlay-style="light-gradient"]
    .final-cta-message {
    text-shadow: 0 2px 18px rgb(255 255 255 / 0.38);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"]
    .final-cta-message {
    text-shadow: 0 2px 18px rgb(255 255 255 / 0.38);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"]
    .final-cta-button {
    border-color: var(--fcta-button-bg);
    background: var(--fcta-button-bg);
    color: var(--fcta-button-text);
  }

  .final-cta[data-has-image="true"][data-overlay-style="glass-light"][data-button-style="outline"]
    .final-cta-button {
    border-color: currentColor;
    background: color-mix(in srgb, currentColor 8%, transparent);
    color: currentColor;
  }

  .final-cta[data-has-image="true"][data-overlay-style="light-gradient"][data-button-style="outline"]
    .final-cta-button {
    border-color: currentColor;
    background: color-mix(in srgb, currentColor 8%, transparent);
    color: currentColor;
  }

  .footer {
    --f-bg: #050505;
    --f-text: #ffffff;
    --f-radius: clamp(24px, 5vw, 42px);
    --f-pad-y: clamp(3.5rem, 9vw, 6.5rem);

    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100%;
    padding: var(--f-pad-y) clamp(1.25rem, 5vw, 4rem)
      calc(var(--f-pad-y) * 0.82);
    border-radius: var(--f-radius) var(--f-radius) 0 0;
    background: var(--f-bg);
    color: var(--f-text);
    text-align: center;
  }

  .final-cta + .footer {
    z-index: 2;
    margin-top: calc(-1 * var(--fcta-footer-overlap));
    box-shadow: 0 -16px 38px rgb(0 0 0 / 0.1);
  }

  .footer::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        circle at 50% -35%,
        color-mix(in srgb, var(--f-text) 9%, transparent),
        transparent 43%
      ),
      linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--f-text) 5%, transparent),
        transparent
      );
  }

  .footer[data-radius="none"] {
    --f-radius: 0px;
  }
  .footer[data-radius="soft"] {
    --f-radius: clamp(14px, 3vw, 22px);
  }
  .footer[data-radius="rounded"] {
    --f-radius: clamp(24px, 5vw, 42px);
  }

  .footer[data-spacing="compact"] {
    --f-pad-y: clamp(2rem, 5vw, 3rem);
  }
  .footer[data-spacing="comfortable"] {
    --f-pad-y: clamp(3.5rem, 9vw, 6.5rem);
  }
  .footer[data-spacing="airy"] {
    --f-pad-y: clamp(4.75rem, 12vw, 8rem);
  }

  .inner {
    width: min(100%, 760px);
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .brand {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    text-decoration: none;
  }

  .logo {
    display: block;
    width: min(42%, 220px);
    height: auto;
    max-height: 92px;
    object-fit: contain;
  }

  .footer[data-logo-tone="light"] .logo {
    filter: brightness(0) invert(1);
  }

  .footer[data-spacing="compact"] .logo {
    width: min(30%, 150px);
    max-height: 70px;
  }

  .brand-name {
    margin: 0;
    padding-inline-start: 0.34em;
    color: inherit;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.9rem, 6.25vw, 3.15rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.34em;
    text-transform: uppercase;
  }

  .description {
    max-width: 680px;
    margin: clamp(1.8rem, 5vw, 3.1rem) 0 0;
    color: inherit;
    font-size: clamp(1rem, 2.7vw, 1.24rem);
    font-weight: 700;
    line-height: 1.75;
    white-space: pre-line;
    text-wrap: balance;
  }

  .footer[data-spacing="compact"] .description {
    margin-top: clamp(1rem, 3vw, 1.5rem);
    font-size: clamp(0.88rem, 2.3vw, 1rem);
    line-height: 1.65;
  }

  .socials {
    display: flex;
    direction: ltr;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: clamp(0.75rem, 2.4vw, 1rem);
    margin-top: clamp(2rem, 6vw, 3.35rem);
  }

  .footer[data-spacing="compact"] .socials {
    margin-top: clamp(1.25rem, 4vw, 2rem);
  }

  .social-link {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in srgb, var(--f-text) 28%, transparent);
    border-radius: 50%;
    background: var(--f-text);
    color: var(--f-bg);
    text-decoration: none;
    transition:
      transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .socials[data-style="outline"] .social-link {
    background: transparent;
    color: var(--f-text);
  }

  .social-link:hover {
    transform: translateY(-4px);
  }

  .social-link:focus-visible {
    outline: 2px solid var(--f-text);
    outline-offset: 4px;
  }

  .social-link svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  .copyright {
    width: 100%;
    margin: clamp(2.4rem, 7vw, 4rem) 0 0;
    padding-top: clamp(1.2rem, 3vw, 1.7rem);
    border-top: 1px solid color-mix(in srgb, var(--f-text) 14%, transparent);
    color: color-mix(in srgb, var(--f-text) 64%, transparent);
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    .final-cta {
      min-height: 430px;
      padding-top: 2.75rem;
    }

    .final-cta[data-has-image="false"] {
      min-height: 0;
      padding-block: 4rem calc(4rem + var(--fcta-footer-overlap));
    }

    .social-link {
      width: 32px;
      height: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .final-cta-button,
    .social-link {
      transition: none;
    }
  }
`;
