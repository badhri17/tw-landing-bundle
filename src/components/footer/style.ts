import { css } from "lit";

export const footerStyles = css`
  :host {
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

  .footer::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 50% -35%, color-mix(in srgb, var(--f-text) 9%, transparent), transparent 43%),
      linear-gradient(90deg, transparent, color-mix(in srgb, var(--f-text) 5%, transparent), transparent);
  }

  .footer[data-radius="none"] { --f-radius: 0px; }
  .footer[data-radius="soft"] { --f-radius: clamp(14px, 3vw, 22px); }
  .footer[data-radius="rounded"] { --f-radius: clamp(24px, 5vw, 42px); }

  .footer[data-spacing="compact"] { --f-pad-y: clamp(2.5rem, 6vw, 4rem); }
  .footer[data-spacing="comfortable"] { --f-pad-y: clamp(3.5rem, 9vw, 6.5rem); }
  .footer[data-spacing="airy"] { --f-pad-y: clamp(4.75rem, 12vw, 8rem); }

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

  .brand-name {
    margin: 0;
    padding-inline-start: 0.34em;
    color: inherit;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.75rem, 6vw, 3.15rem);
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

  .socials {
    display: flex;
    direction: ltr;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: clamp(0.75rem, 2.4vw, 1rem);
    margin-top: clamp(2rem, 6vw, 3.35rem);
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
    .social-link {
      width: 32px;
      height: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .social-link { transition: none; }
  }
`;
