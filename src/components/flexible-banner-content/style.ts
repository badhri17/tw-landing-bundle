import { css } from "lit";

export const flexibleBannerContentStyles = css`
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

  .section {
    --fbc-bg: #f6f4f1;
    --fbc-text: #21150d;
    --fbc-button-bg: #3d230e;
    --fbc-button-text: #ffffff;
    --fbc-overlay: 0.4;
    --fbc-height-mobile: 320px;
    --fbc-height-desktop: 420px;
    --fbc-image-fit: contain;
    --fbc-image-position: center;
    --fbc-radius: 24px;
    --fbc-content-pad: clamp(1.8rem, 7vw, 3.75rem);
    --fbc-gap: 1rem;
    --fbc-max: 1280px;

    /* The band is the section itself: full-bleed, no outer gutter, and it owns
       the background colour so the fill reaches both viewport edges. Anything
       that needs to stay readable caps its own width instead (see .frame's
       "narrow" variant and .content). */
    width: 100%;
    background: var(--fbc-bg);
    color: var(--fbc-text);
  }

  .section[data-spacing="compact"] {
    --fbc-content-pad: clamp(1.25rem, 4vw, 2rem);
    --fbc-gap: 0.7rem;
  }

  .section[data-spacing="comfortable"] {
    --fbc-content-pad: clamp(1.8rem, 7vw, 3.75rem);
    --fbc-gap: 1rem;
  }

  .section[data-spacing="airy"] {
    --fbc-content-pad: clamp(2.5rem, 9vw, 5.5rem);
    --fbc-gap: 1.35rem;
  }

  .section[data-radius="none"] { --fbc-radius: 0px; }
  .section[data-radius="soft"] { --fbc-radius: 14px; }
  .section[data-radius="rounded"] { --fbc-radius: 26px; }

  .frame {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    width: 100%;
    border-radius: var(--fbc-radius);
    color: inherit;
  }

  /* image_full_width off: the image is held to the copy's max-width and the
     section's background fills the rest of the band. In the overlay layout the
     whole frame narrows (the image IS the frame's backdrop there); in the
     separate layout only .media does, so the copy below stays where it was. */
  .frame[data-media="narrow"] {
    width: min(100%, var(--fbc-max));
    margin-inline: auto;
  }

  .frame[data-layout="separate"][data-media="narrow"] {
    width: 100%;
  }

  .frame[data-layout="separate"][data-media="narrow"] .media {
    width: min(100%, var(--fbc-max));
    margin-inline: auto;
  }

  .media {
    overflow: hidden;
    background: var(--fbc-bg);
  }

  .media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: var(--fbc-image-fit);
    object-position: var(--fbc-image-position);
  }

  .frame[data-layout="separate"] .media {
    height: var(--fbc-height-mobile);
  }

  .frame[data-layout="overlay"] {
    min-height: var(--fbc-height-mobile);
    display: grid;
  }

  .frame[data-layout="overlay"] .media,
  .shade,
  .overlay-content {
    grid-area: 1 / 1;
  }

  .frame[data-layout="overlay"] .media {
    position: absolute;
    z-index: -2;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .shade {
    position: absolute;
    z-index: -1;
    inset: 0;
    background: rgba(0, 0, 0, var(--fbc-overlay));
    pointer-events: none;
  }

  /* The frame is edge to edge now, so the copy caps itself — otherwise a line of
     text would run the full width of a wide monitor. */
  .content {
    min-width: 0;
    width: min(100%, var(--fbc-max));
    margin-inline: auto;
    padding: var(--fbc-content-pad);
  }

  /* Copy sitting UNDER an image reads as one unit with it, so it gets no top
     padding — the tier only pads the sides and the bottom there. Gated on
     data-has-image because without an image .content is the whole section, and
     zero top padding would butt the title against the section's top edge.
     The overlay layout keeps its padding on all four sides: there the copy sits
     ON the image and the padding is what holds it off the frame's edges. */
  .frame[data-layout="separate"][data-has-image="on"] .content {
    padding-top: 0;
  }

  .overlay-content {
    min-height: var(--fbc-height-mobile);
    display: flex;
    flex-direction: column;
  }

  .overlay-content[data-vertical="top"] { justify-content: flex-start; }
  .overlay-content[data-vertical="center"] { justify-content: center; }
  .overlay-content[data-vertical="bottom"] { justify-content: flex-end; }

  .copy {
    width: min(100%, 720px);
    display: flex;
    flex-direction: column;
    gap: var(--fbc-gap);
  }

  .content[data-align="right"] .copy {
    margin-inline-end: auto;
    align-items: flex-start;
    text-align: right;
  }

  .content[data-align="center"] .copy {
    margin-inline: auto;
    align-items: center;
    text-align: center;
  }

  .content[data-align="left"] .copy {
    margin-inline-start: auto;
    align-items: flex-end;
    text-align: left;
  }

  .title {
    margin: 0;
    color: inherit;
    font-size: clamp(1.65rem, 5vw, 3.15rem);
    font-weight: 850;
    line-height: 1.18;
    letter-spacing: -0.025em;
    text-wrap: balance;
  }

  .description,
  .details {
    max-width: 66ch;
    margin: 0;
    color: inherit;
    white-space: pre-line;
    text-wrap: pretty;
  }

  .description {
    font-size: clamp(1rem, 2.4vw, 1.18rem);
    line-height: 1.8;
    opacity: 0.88;
  }

  .details {
    font-size: clamp(0.88rem, 2vw, 1rem);
    line-height: 1.75;
    opacity: 0.72;
  }

  .prices {
    display: inline-flex;
    direction: rtl;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.75rem;
    margin-top: 0.15rem;
  }

  .current-price {
    font-size: clamp(1.05rem, 2.7vw, 1.4rem);
    font-weight: 850;
  }

  .old-price {
    font-size: 0.92rem;
    opacity: 0.52;
    text-decoration: line-through;
    text-decoration-thickness: 1px;
  }

  .cta {
    min-width: 102px;
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.25rem;
    padding: 0.45rem 1.35rem;
    border: 1px solid var(--fbc-button-bg);
    border-radius: 6px;
    background: var(--fbc-button-bg);
    color: var(--fbc-button-text);
    font-size: 0.86rem;
    font-weight: 800;
    line-height: 1;
    text-decoration: none;
    transition:
      transform 0.24s ease,
      box-shadow 0.24s ease,
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .cta[data-style="outline"] {
    background: transparent;
    color: var(--fbc-button-bg);
  }

  .frame[data-layout="overlay"] .cta[data-style="outline"] {
    border-color: currentColor;
    color: inherit;
  }

  .cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px color-mix(in srgb, var(--fbc-button-bg) 24%, transparent);
  }

  .cta:focus-visible {
    outline: 3px solid color-mix(in srgb, currentColor 42%, transparent);
    outline-offset: 4px;
  }

  @media (min-width: 768px) {
    .frame[data-layout="separate"] .media {
      height: var(--fbc-height-desktop);
    }

    .frame[data-layout="overlay"],
    .overlay-content {
      min-height: var(--fbc-height-desktop);
    }
  }

  @media (max-width: 520px) {
    .section[data-radius="rounded"] { --fbc-radius: 20px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta { transition: none; }
  }
`;
