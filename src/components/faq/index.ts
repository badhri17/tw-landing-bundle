import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import { resolveSectionSpacing } from "../../shared/section-spacing";
import {
  resolveSideElement,
  type SideElementResolved,
} from "../../shared/side-element";
import type { FaqConfig, FaqIconStyle, FaqItem, FaqOpenMode } from "./types";
import { faqStyles } from "./style";

/**
 * &lt;salla-faq&gt; — الأسئلة الشائعة (FAQ)
 *
 * A stack of expanding question rows: the last objection-handling block before a
 * landing page's call to action. Deliberately plain — one column, no links out,
 * nothing competing with the hero's single conversion.
 *
 * Also carries the reusable side design element (عنصر بصري جانبي): a decorative
 * transparent PNG parked against one edge and free to hang outside the section.
 * The resolver is shared with the gallery — see src/shared/side-element.ts.
 *
 * RTL-first and mobile-first; honours prefers-reduced-motion.
 */
export default class GrowthFaq extends GrowthElement {
  static styles = faqStyles;

  @property({ type: Object })
  config?: FaqConfig;

  /** Indices whose answer is expanded. */
  @state() private _open: number[] = [];
  /** Entrance gate for the list. */
  @state() private _animState: "ready" | "in" = "ready";

  /**
   * Whether `first_open` has been applied. Salla may inject `config` after the
   * first render, so the default open row cannot be seeded in firstUpdated — it
   * is seeded from updated() the first cycle that actually has items.
   */
  private _seeded = false;
  private _io: IntersectionObserver | null = null;
  private _fallbackTimer: number | null = null;

  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------

  /** Only rows carrying a question can render; an answer alone has no trigger. */
  private _items(): FaqItem[] {
    const list = this.config?.items;
    if (!Array.isArray(list)) return [];
    return list.filter(
      (it) => !!it && typeof it === "object" && !!this.localizedString(it.question),
    );
  }

  private _openMode(): FaqOpenMode {
    return this._pickValue<FaqOpenMode>(this.config?.open_mode, "single");
  }

  private _reduceMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------

  private _reveal = () => {
    this._animState = "in";
    this._io?.disconnect();
    this._io = null;
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
  };

  connectedCallback() {
    super.connectedCallback();

    if (!("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }

    this._io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) this._reveal();
      },
      { threshold: 0.12 },
    );
    this._io.observe(this);

    // Safety net for contexts where the observer never reports an intersection
    // even though the section is on screen.
    this._fallbackTimer = window.setTimeout(() => {
      this._fallbackTimer = null;
      if (this._animState === "in") return;
      const r = this.getBoundingClientRect();
      if (r.height === 0 || (r.top < window.innerHeight && r.bottom > 0))
        this._reveal();
    }, 3000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._io?.disconnect();
    this._io = null;
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
  }

  protected updated() {
    // Every cycle: Salla may inject config after the first render.
    this._syncAnchor(this.config?.anchor_id, "faq");

    if (this._seeded) return;
    const items = this._items();
    if (items.length === 0) return;
    this._seeded = true;
    if (this.config?.first_open !== false) this._open = [0];
  }

  // ------------------------------------------------------------
  // Interaction
  // ------------------------------------------------------------

  private _toggle(i: number) {
    const isOpen = this._open.includes(i);
    if (isOpen) {
      this._open = this._open.filter((n) => n !== i);
      return;
    }
    // "single" keeps one answer visible at a time, so the stack never grows
    // taller than a screen while the visitor reads.
    this._open = this._openMode() === "multi" ? [...this._open, i] : [i];
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  private _hostStyle(c: FaqConfig, sideVars: string[]): string {
    return [
      c.bg_color ? `--faq-bg:${c.bg_color}` : "",
      c.title_color ? `--faq-title:${c.title_color}` : "",
      c.subtitle_color ? `--faq-sub:${c.subtitle_color}` : "",
      c.card_bg ? `--faq-card-bg:${c.card_bg}` : "",
      c.question_color ? `--faq-q:${c.question_color}` : "",
      c.answer_color ? `--faq-a:${c.answer_color}` : "",
      c.border_color ? `--faq-border:${c.border_color}` : "",
      c.icon_color ? `--faq-icon:${c.icon_color}` : "",
      `--faq-radius:${this._num(c.card_radius, 14)}px`,
      ...sideVars,
      ...resolveSectionSpacing(
        c,
        (v, f) => this._pickValue(v, f),
      ),
    ]
      .filter(Boolean)
      .join("; ");
  }

  private _icon(style: FaqIconStyle) {
    return html`<span class="faq-icon" data-icon=${style} aria-hidden="true">
      ${style === "plus"
        ? html`<svg viewBox="0 0 24 24">
            <path d="M5 12h14" />
            <path class="faq-plus-v" d="M12 5v14" />
          </svg>`
        : html`<svg viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>`}
    </span>`;
  }

  render() {
    const c: FaqConfig = this.config || {};
    const resolveSide = (slot: 1 | 2) =>
      resolveSideElement(
        c,
        (v, f) => this._pickValue(v, f),
        (v, f) => this._num(v, f),
        slot,
      );
    const sides = [resolveSide(1), resolveSide(2)].filter(
      (side): side is SideElementResolved => !!side,
    );
    const hostStyle = this._hostStyle(
      c,
      sides.flatMap((side) => side.vars),
    );

    const sideEls = sides.map(
      (side) => html`<img
        class="faq-side"
        src=${side.image}
        alt=""
        aria-hidden="true"
        data-slot=${side.slot}
        data-side=${side.side}
        data-depth=${side.depth}
        decoding="async"
        loading="lazy"
      />`,
    );

    const items = this._items();
    if (items.length === 0) {
      return html`<section class="faq" style=${hostStyle}>
        ${sideEls}
        <p class="faq-empty">
          ${this._lang() === "ar"
            ? "أضف سؤالًا واحدًا على الأقل لعرض هذا القسم."
            : "Add at least one question to display this section."}
        </p>
      </section>`;
    }

    const title = this.localizedString(c.section_title);
    const subtitle = this.localizedString(c.section_subtitle);
    const iconStyle = this._pickValue<FaqIconStyle>(c.icon_style, "chevron");
    const entrance = c.enable_entrance_anim !== false && !this._reduceMotion();

    return html`
      <section class="faq" style=${hostStyle}>
        ${sideEls}
        ${title || subtitle
          ? html`<header class="faq-header">
              ${title ? html`<h2 class="faq-title">${title}</h2>` : nothing}
              ${subtitle ? html`<p class="faq-sub">${subtitle}</p>` : nothing}
            </header>`
          : nothing}

        <div class="faq-list" data-anim=${entrance ? this._animState : "in"}>
          ${items.map((item, i) => {
            const open = this._open.includes(i);
            // Ids only need to be unique inside this shadow root, so the index
            // is enough — a second instance on the page has its own root.
            const qId = `faq-q-${i}`;
            const aId = `faq-a-${i}`;
            return html`<div
              class="faq-item"
              data-open=${open ? "true" : "false"}
              style=${`--i:${i}`}
            >
              <h3 class="faq-q-wrap">
                <button
                  class="faq-q"
                  id=${qId}
                  type="button"
                  aria-expanded=${open ? "true" : "false"}
                  aria-controls=${aId}
                  @click=${() => this._toggle(i)}
                >
                  <span class="faq-q-text"
                    >${this.localizedString(item.question)}</span
                  >
                  ${this._icon(iconStyle)}
                </button>
              </h3>
              <div class="faq-a-wrap" id=${aId} role="region" aria-labelledby=${qId}>
                <div class="faq-a">
                  <div class="faq-a-inner">
                    ${this.localizedString(item.answer)}
                  </div>
                </div>
              </div>
            </div>`;
          })}
        </div>
      </section>
    `;
  }
}
