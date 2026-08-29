import { html, nothing, svg } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import { resolveSectionSpacing } from "../../shared/section-spacing";
import {
  resolveSideElement,
  type SideElementResolved,
} from "../../shared/side-element";
import type {
  ComparisonColumnOrder,
  ComparisonConfig,
  ComparisonDensity,
  ComparisonDensityDesktop,
  ComparisonItem,
  ComparisonLogoSize,
  ComparisonLogoSizeDesktop,
  ComparisonMarkStyle,
  ComparisonTitlePosition,
} from "./types";
import { comparisonStyles } from "./style";

/**
 * Row density as a relative tier rather than a pixel value, resolved through
 * two tables so one tier means more room on desktop — the pattern documented
 * for CARD_SCALE_MOBILE / CARD_SCALE_DESKTOP in product-features. A shared
 * table would make every desktop tier look undersized and the desktop field a
 * no-op unless the merchant changed the tier.
 */
const DENSITY_MOBILE: Record<ComparisonDensity, { pad: number; fs: number }> = {
  compact: { pad: 10, fs: 0.78 },
  normal: { pad: 13, fs: 0.84 },
  spacious: { pad: 17, fs: 0.9 },
};

const DENSITY_DESKTOP: Record<ComparisonDensity, { pad: number; fs: number }> =
  {
    compact: { pad: 14, fs: 0.95 },
    normal: { pad: 19, fs: 1.02 },
    spacious: { pad: 26, fs: 1.1 },
  };

/** Same two-table treatment for the brand logo in the header cell. The mobile
    tiers stay modest: the logo's column sets its own floor, so every pixel here
    is one the feature text does not get on a 360px card. */
const LOGO_MOBILE: Record<ComparisonLogoSize, number> = {
  sm: 56,
  md: 72,
  lg: 92,
};

const LOGO_DESKTOP: Record<ComparisonLogoSize, number> = {
  sm: 92,
  md: 124,
  lg: 160,
};

/**
 * &lt;salla-comparison&gt; — جدول المقارنة
 *
 * A feature column and two compared columns: ours and everyone else's. The
 * shape answers three merchant questions — us against other brands, one plan
 * against another, and before against after — so the panel copy names all
 * three rather than letting the folder name narrow it.
 *
 * Each cell is a check or a cross by default, and a short written value when
 * the row measures something instead of answering yes or no. No links out and
 * no buttons: a landing page drives one conversion and the hero owns it.
 *
 * Also carries the reusable side design element (عنصر بصري جانبي) — the same
 * decorative transparent PNG that gallery and faq park against a section edge.
 * The resolver is shared; see src/shared/side-element.ts.
 *
 * RTL-first and mobile-first; honours prefers-reduced-motion.
 */
export default class GrowthComparison extends GrowthElement {
  static styles = comparisonStyles;

  @property({ type: Object })
  config?: ComparisonConfig;

  /** Entrance gate for the table. */
  @state() private _animState: "ready" | "in" = "ready";

  private _io: IntersectionObserver | null = null;
  private _fallbackTimer: number | null = null;

  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------

  /** A row with no feature text has nothing to compare; drop it. */
  private _items(): ComparisonItem[] {
    const list = this.config?.items;
    if (!Array.isArray(list)) return [];
    return list.filter(
      (it) => !!it && typeof it === "object" && !!this.localizedString(it.text),
    );
  }

  private _reduceMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** Mobile tier first, then desktop — "inherit" carries the TIER across, and
      it is resolved through the desktop table, not the mobile pixels. */
  private _density(c: ComparisonConfig) {
    const m = this._pickValue<ComparisonDensity>(c.density_mobile, "normal");
    const dRaw = this._pickValue<ComparisonDensityDesktop>(
      c.density_desktop,
      "inherit",
    );
    const d = dRaw === "inherit" ? m : dRaw;
    return {
      m: DENSITY_MOBILE[m] ?? DENSITY_MOBILE.normal,
      d: DENSITY_DESKTOP[d] ?? DENSITY_DESKTOP.normal,
    };
  }

  private _logo(c: ComparisonConfig) {
    const m = this._pickValue<ComparisonLogoSize>(c.logo_size_mobile, "md");
    const dRaw = this._pickValue<ComparisonLogoSizeDesktop>(
      c.logo_size_desktop,
      "inherit",
    );
    const d = dRaw === "inherit" ? m : dRaw;
    return {
      m: LOGO_MOBILE[m] ?? LOGO_MOBILE.md,
      d: LOGO_DESKTOP[d] ?? LOGO_DESKTOP.md,
    };
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
    this._syncAnchor(this.config?.anchor_id, "comparison");
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  private _hostStyle(c: ComparisonConfig, sideVars: string[]): string {
    const density = this._density(c);
    const logo = this._logo(c);
    return [
      c.bg_color ? `--cmp-bg:${c.bg_color}` : "",
      c.title_color ? `--cmp-title:${c.title_color}` : "",
      c.subtitle_color ? `--cmp-sub:${c.subtitle_color}` : "",
      c.card_bg ? `--cmp-card-bg:${c.card_bg}` : "",
      c.text_color ? `--cmp-text:${c.text_color}` : "",
      c.border_color ? `--cmp-border:${c.border_color}` : "",
      c.us_col_bg ? `--cmp-us-bg:${c.us_col_bg}` : "",
      c.us_col_border ? `--cmp-us-border:${c.us_col_border}` : "",
      c.others_color ? `--cmp-others:${c.others_color}` : "",
      c.check_color ? `--cmp-check:${c.check_color}` : "",
      c.cross_color ? `--cmp-cross:${c.cross_color}` : "",
      c.footnote_color ? `--cmp-note:${c.footnote_color}` : "",
      `--cmp-radius:${this._num(c.table_radius, 18)}px`,
      `--cmp-pad-m:${density.m.pad}px`,
      `--cmp-pad-d:${density.d.pad}px`,
      `--cmp-fs-m:${density.m.fs}rem`,
      `--cmp-fs-d:${density.d.fs}rem`,
      `--cmp-logo-m:${logo.m}px`,
      `--cmp-logo-d:${logo.d}px`,
      ...sideVars,
      ...resolveSectionSpacing(c, (v, f) => this._pickValue(v, f)),
    ]
      .filter(Boolean)
      .join("; ");
  }

  /** The yes/no glyph. The label is read out, so a screen reader gets the
      answer a sighted visitor gets from the colour and the shape.

      The paths come from lit's svg tag, never html: a nested template
      interpolated as a CHILD of an <svg> is parsed in the HTML namespace, so
      the browser builds an HTMLUnknownElement named PATH and paints nothing.
      Interpolating an attribute inside a literal <svg> is unaffected — only a
      template boundary that opens inside the element is. */
  private _mark(on: boolean, style: ComparisonMarkStyle) {
    const ar = this._lang() === "ar";
    const label = on
      ? ar
        ? "متوفر"
        : "Included"
      : ar
        ? "غير متوفر"
        : "Not included";
    return html`<span
      class="cmp-mark"
      data-on=${on ? "yes" : "no"}
      data-style=${style}
      role="img"
      aria-label=${label}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        ${
          on
            ? svg`<path d="M20 6 9 17l-5-5" />`
            : svg`<path d="M18 6 6 18" /> <path d="m6 6 12 12" />`
        }
      </svg>
    </span>`;
  }

  /**
   * One compared cell. A written override wins over the glyph, which is what
   * lets a yes/no table carry the occasional measured row without a mode
   * switch: leave the override empty and the mark comes back.
   */
  private _cell(
    kind: "us" | "others",
    item: ComparisonItem,
    style: ComparisonMarkStyle,
  ) {
    const override = this.localizedString(
      kind === "us" ? item.us_text : item.others_text,
    );
    if (override) return html`<span class="cmp-val">${override}</span>`;
    // Ours defaults to yes and theirs to no, so a merchant who fills in only
    // the text of each row already has the table the section is named for.
    const on = kind === "us" ? item.us !== false : item.others === true;
    return this._mark(on, style);
  }

  render() {
    const c: ComparisonConfig = this.config || {};
    // Keep decorative images behind the comparison table when a preview or
    // older saved template omits untouched dropdown defaults.
    const sideConfig: ComparisonConfig = {
      ...c,
      side_depth: c.side_depth ?? "behind",
      side2_depth: c.side2_depth ?? "behind",
    };
    const resolveSide = (slot: 1 | 2) =>
      resolveSideElement(
        sideConfig,
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
      (side) =>
        html`<img
          class="cmp-side"
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
      return html`<section class="cmp" style=${hostStyle}>
        ${sideEls}
        <p class="cmp-empty">
          ${
            this._lang() === "ar"
              ? "أضف صفًا واحدًا على الأقل لعرض جدول المقارنة."
              : "Add at least one row to display the comparison table."
          }
        </p>
      </section>`;
    }

    const titlePos = this._pickValue<ComparisonTitlePosition>(
      c.title_position,
      "in_table",
    );
    const title =
      titlePos === "hidden" ? "" : this.localizedString(c.section_title);
    const subtitle = this.localizedString(c.section_subtitle);
    const footnote = this.localizedString(c.footnote);

    const usLabel = this.localizedString(c.us_label);
    const usLogo = (c.us_logo || "").trim();
    const othersLabel = this.localizedString(c.others_label);

    const markStyle = this._pickValue<ComparisonMarkStyle>(
      c.mark_style,
      "plain",
    );
    const order = this._pickValue<ComparisonColumnOrder>(
      c.column_order,
      "us_first",
    );
    // Feature column always leads; these two follow in the merchant's order.
    const cols: Array<"us" | "others"> =
      order === "others_first" ? ["others", "us"] : ["us", "others"];

    const entrance = c.enable_entrance_anim !== false && !this._reduceMotion();
    const headerAbove = (titlePos === "above" && title) || subtitle;

    const headCell = (kind: "us" | "others") =>
      kind === "us"
        ? html`<th class="cmp-th" data-col="us" scope="col">
            <span class="cmp-in" style="--i:0">
              ${
                usLogo
                  ? html`<img
                      class="cmp-logo"
                      src=${usLogo}
                      alt=${usLabel}
                      decoding="async"
                    />`
                  : html`<span class="cmp-col-label">${usLabel}</span>`
              }
            </span>
          </th>`
        : html`<th class="cmp-th" data-col="others" scope="col">
            <span class="cmp-in" style="--i:0">
              <span class="cmp-col-label">${othersLabel}</span>
            </span>
          </th>`;

    return html`
      <section class="cmp" style=${hostStyle}>
        ${sideEls}
        ${
          headerAbove
            ? html`<header class="cmp-header">
                ${
                  titlePos === "above" && title
                    ? html`<h2 class="cmp-title">${title}</h2>`
                    : nothing
                }
                ${subtitle ? html`<p class="cmp-sub">${subtitle}</p>` : nothing}
              </header>`
            : nothing
        }

        <div class="cmp-card">
          <table
            class="cmp-table"
            data-anim=${entrance ? this._animState : "in"}
            data-logo=${usLogo ? "on" : "off"}
            data-highlight=${c.highlight_us === false ? "off" : "on"}
            data-stripes=${c.row_stripes === true ? "on" : "off"}
            data-grid=${c.grid_lines === false ? "off" : "on"}
          >
            <thead>
              <tr>
                <th class="cmp-th" data-col="feature" scope="col">
                  ${
                    titlePos === "in_table" && title
                      ? html`<span class="cmp-in" style="--i:0"
                          ><span class="cmp-table-title">${title}</span></span
                        >`
                      : nothing
                  }
                </th>
                ${cols.map((kind) => headCell(kind))}
              </tr>
            </thead>
            <tbody>
              ${items.map(
                (item, i) =>
                  html`<tr style=${`--i:${i + 1}`}>
                    <th class="cmp-cell" data-col="feature" scope="row">
                      <span class="cmp-in"
                        >${this.localizedString(item.text)}</span
                      >
                    </th>
                    ${cols.map(
                      (kind) =>
                        html`<td class="cmp-cell" data-col=${kind}>
                          <span class="cmp-in"
                            >${this._cell(kind, item, markStyle)}</span
                          >
                        </td>`,
                    )}
                  </tr>`,
              )}
            </tbody>
          </table>
        </div>

        ${footnote ? html`<p class="cmp-note">${footnote}</p>` : nothing}
      </section>
    `;
  }
}
