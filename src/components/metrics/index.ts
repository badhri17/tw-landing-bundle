import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { GrowthElement } from "../../shared/growth-element";
import { resolveSectionSpacing } from "../../shared/section-spacing";
import type {
  MetricsConfig,
  MetricItem,
  MetricsColumns,
  MetricsColumnsDesktop,
  MetricsCardStyle,
  MetricsCountSpeed,
  MetricsDigits,
  MetricsSize,
} from "./types";
import { metricsStyles } from "./style";

/** Head start between consecutive counters, so they don't tick in lockstep. */
const STAGGER_MS = 120;

/** Count-up duration per speed tier. */
const SPEED_MS: Record<MetricsCountSpeed, number> = {
  fast: 1000,
  normal: 1800,
  slow: 2600,
};

/** Number-size tiers → multiplier applied to the value and label font sizes. */
const SIZE_SCALE: Record<MetricsSize, number> = {
  sm: 0.85,
  md: 1,
  lg: 1.2,
};

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** A metric after parsing — `target` is null when the value isn't a number. */
interface ParsedMetric {
  raw: string;
  target: number | null;
  decimals: number;
  prefix: string;
  suffix: string;
  label: string;
}

/**
 * <salla-metrics> — Metrics (الأرقام)
 *
 * A row of proof numbers ("+9,750 زجاجة مباعة") that count up from zero the
 * first time the section scrolls into view. Four shapes (filled, outlined,
 * hairline-divided, bare), Latin or Arabic-Indic numerals, and thousands
 * separators.
 *
 * RTL-first and mobile-first; honours prefers-reduced-motion by skipping
 * straight to the final figures.
 */
export default class GrowthMetrics extends GrowthElement {
  static styles = metricsStyles;

  @property({ type: Object })
  config?: MetricsConfig;

  /** Entrance gate for the cards. */
  @state() private _animState: "ready" | "in" = "ready";
  /** Milliseconds into the count-up run; drives every counter. */
  @state() private _elapsed = 0;

  private _raf: number | null = null;
  private _io: IntersectionObserver | null = null;
  private _fallbackTimer: number | null = null;
  private _started = false;
  private _inView = false;
  /** Fingerprint of the animated values — a change restarts the count. */
  private _sig = "";

  // ------------------------------------------------------------
  // Value helpers
  // ------------------------------------------------------------

  /** Keep metrics that have something to show. */
  private _items(): MetricItem[] {
    const list = this.config?.items;
    if (!Array.isArray(list)) return [];
    return list.filter((it) => {
      if (!it || typeof it !== "object") return false;
      const value = it.value === undefined || it.value === null ? "" : String(it.value).trim();
      return !!(value || this.localizedString(it.label));
    });
  }

  /**
   * Split a merchant-typed value into a number we can animate plus the raw
   * text we fall back to. Accepts Arabic-Indic digits and either separator
   * style, so "٩٬٧٥٠" and "9,750" both animate.
   */
  private _parse(item: MetricItem): ParsedMetric {
    const rawValue =
      item.value === undefined || item.value === null ? "" : String(item.value).trim();

    const normalized = this._toLatinDigits(rawValue)
      .replace(/[٫]/g, ".")
      .replace(/[٬,\s_]/g, "");

    const isNumeric = /^-?\d+(\.\d+)?$/.test(normalized);
    const target = isNumeric ? Number(normalized) : null;
    const decimals = isNumeric ? (normalized.split(".")[1]?.length ?? 0) : 0;

    return {
      raw: rawValue,
      target,
      decimals,
      prefix: typeof item.prefix === "string" ? item.prefix.trim() : "",
      suffix: typeof item.suffix === "string" ? item.suffix.trim() : "",
      label: this.localizedString(item.label),
    };
  }

  /** Render a number the way the merchant asked for it. */
  private _format(
    n: number,
    decimals: number,
    separator: boolean,
    digits: MetricsDigits
  ): string {
    const negative = n < 0;
    const fixed = Math.abs(n).toFixed(decimals);
    let [int, frac] = fixed.split(".");

    if (separator) {
      int = int.replace(/\B(?=(\d{3})+(?!\d))/g, digits === "arabic" ? "٬" : ",");
    }

    let out = frac ? `${int}${digits === "arabic" ? "٫" : "."}${frac}` : int;
    if (negative) out = `-${out}`;
    if (digits === "arabic") {
      out = out.replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
    }
    return out;
  }

  private _speed(): number {
    return SPEED_MS[this._pickValue<MetricsCountSpeed>(this.config?.count_speed, "normal")];
  }

  /** 0 → 1 for a single counter, offset by its position in the row. */
  private _progress(index: number): number {
    const duration = this._speed();
    const p = (this._elapsed - index * STAGGER_MS) / duration;
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    return 1 - Math.pow(1 - p, 3); // easeOutCubic
  }

  private _reduceMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ------------------------------------------------------------
  // Count-up animation
  // ------------------------------------------------------------

  private _startCount() {
    if (this._started) return;
    this._started = true;

    const items = this._items();
    const total = this._speed() + Math.max(0, items.length - 1) * STAGGER_MS;
    const t0 = performance.now();

    const step = (now: number) => {
      const elapsed = now - t0;
      if (elapsed >= total) {
        this._elapsed = total;
        this._raf = null;
        return;
      }
      this._elapsed = elapsed;
      this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
  }

  private _stopCount() {
    if (this._raf !== null) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  /** Re-run the counters — used when the merchant edits values in the panel. */
  private _resetCount() {
    this._stopCount();
    this._started = false;
    this._elapsed = 0;
    if (this._inView) this._startCount();
  }

  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------

  /** Give up waiting for the observer and just show the numbers. */
  private _reveal = () => {
    this._inView = true;
    this._animState = "in";
    this._io?.disconnect();
    this._io = null;
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
    this._startCount();
  };

  connectedCallback() {
    super.connectedCallback();

    if (!("IntersectionObserver" in window)) {
      this._reveal();
      return;
    }

    this._io = new IntersectionObserver(
      (entries) => {
        // One-shot: the numbers should land, not replay on every scroll pass.
        if (entries[0]?.isIntersecting) this._reveal();
      },
      { threshold: 0.25 }
    );
    this._io.observe(this);

    // Safety net for contexts where the observer never reports an
    // intersection even though the section is on screen (zero-size ancestors,
    // odd preview roots) — better to show the figures than an empty section.
    // A section that is genuinely below the fold keeps waiting for the observer.
    this._fallbackTimer = window.setTimeout(() => {
      this._fallbackTimer = null;
      if (this._inView) return;
      const r = this.getBoundingClientRect();
      const onScreen = r.top < window.innerHeight && r.bottom > 0;
      if (r.height === 0 || onScreen) this._reveal();
    }, 3000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopCount();
    this._io?.disconnect();
    this._io = null;
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
  }

  updated() {
    // Publish this section as a link target for the hero navbar. Runs every
    // cycle because Salla may inject `config` after the first render.
    this._syncAnchor(this.config?.anchor_id, "metrics");

    // Editing a figure in the merchant panel should replay the count, so the
    // merchant sees the result of the change.
    const sig = this._items()
      .map((it) => `${it.value ?? ""}|${it.prefix ?? ""}|${it.suffix ?? ""}`)
      .join("~");
    if (sig !== this._sig) {
      this._sig = sig;
      this._resetCount();
    }
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  private _hostStyle(c: MetricsConfig, colsMobile: number, colsDesktop: number): string {
    const radius = this._num(c.card_radius, 18);
    const size = this._pickValue<MetricsSize>(c.number_size, "md");
    return [
      c.bg_color ? `--m-bg:${c.bg_color}` : "",
      c.card_bg ? `--m-card-bg:${c.card_bg}` : "",
      c.number_color ? `--m-number:${c.number_color}` : "",
      c.label_color ? `--m-label:${c.label_color}` : "",
      c.border_color ? `--m-border:${c.border_color}` : "",
      `--m-radius:${radius}px`,
      `--m-scale:${SIZE_SCALE[size] ?? 1}`,
      `--m-cols-mobile:${colsMobile}`,
      `--m-cols-desktop:${colsDesktop}`,
      ...resolveSectionSpacing(
        c,
        (v, f) => this._pickValue(v, f),
        "sm",
        "sm",
      ),
    ]
      .filter(Boolean)
      .join("; ");
  }

  /**
   * Length of the longest figure once it has finished counting. Every number
   * is sized off this one so the row stays visually uniform — and it is the
   * final length, not the current one, so the type doesn't shrink mid-count.
   */
  private _widest(
    items: MetricItem[],
    separator: boolean,
    digits: MetricsDigits
  ): number {
    let widest = 1;
    for (const item of items) {
      const m = this._parse(item);
      const final =
        m.target === null
          ? m.raw
          : this._format(m.target, m.decimals, separator, digits);
      widest = Math.max(widest, `${m.prefix}${final}${m.suffix}`.length);
    }
    return widest;
  }

  /** Mobile count is primary; desktop "inherit" reuses it. */
  private _columns(c: MetricsConfig): { mobile: number; desktop: number } {
    const mobile = this._num(this._pickValue<MetricsColumns>(c.columns_mobile, "3"), 3);
    const rawDesktop = this._pickValue<MetricsColumnsDesktop>(c.columns_desktop, "inherit");
    const desktop = rawDesktop === "inherit" ? mobile : this._num(rawDesktop, mobile);
    return {
      mobile: Math.max(1, Math.min(3, mobile)),
      desktop: Math.max(1, Math.min(6, desktop)),
    };
  }

  render() {
    const c: MetricsConfig = this.config || {};
    const items = this._items();

    const cardStyle = this._pickValue<MetricsCardStyle>(c.card_style, "soft");
    const digits = this._pickValue<MetricsDigits>(c.digits, "latin");
    const separator = c.thousands_separator !== false;
    const cols = this._columns(c);
    const hostStyle = this._hostStyle(c, cols.mobile, cols.desktop);

    // Counting is skipped — not just shortened — under reduced motion.
    const animate = c.enable_count !== false && !this._reduceMotion();
    const entrance = c.enable_entrance_anim !== false && !this._reduceMotion();

    const title = this.localizedString(c.section_title);
    const subtitle = this.localizedString(c.section_subtitle);

    if (items.length === 0) {
      return html`<section class="m-section" style=${hostStyle}>
        <p class="m-empty">
          ${this._lang() === "ar"
            ? "أضف رقمًا واحدًا على الأقل لعرض هذا القسم."
            : "Add at least one metric to display this section."}
        </p>
      </section>`;
    }

    const header =
      title || subtitle
        ? html`<header class="m-header">
            ${title ? html`<h2 class="m-title">${title}</h2>` : nothing}
            ${subtitle ? html`<p class="m-subtitle">${subtitle}</p>` : nothing}
          </header>`
        : nothing;

    return html`
      <section
        class="m-section"
        style=${hostStyle}
        data-style=${cardStyle}
        data-anim=${entrance ? this._animState : "in"}
      >
        ${header}
        <div class="m-grid" style="--m-chars:${this._widest(items, separator, digits)}">
          ${items.map((item, i) => {
            const m = this._parse(item);
            let shown: string;
            if (m.target === null) {
              shown = m.raw; // not a number — show exactly what was typed
            } else {
              const value = animate ? m.target * this._progress(i) : m.target;
              shown = this._format(value, m.decimals, separator, digits);
            }
            // One text node, and `dir="auto"` picks the base direction from the
            // first strong character. A pure figure ("+9,750", "+98%") has none,
            // so it lays out LTR and the "+" stays on the left — in RTL flow the
            // "+" is a bidi separator and would otherwise jump to the right.
            // A suffix written in Arabic ("9,750 ألف") is strong, so that case
            // still reads right-to-left.
            const text = `${m.prefix}${shown}${m.suffix}`;
            return html`<div class="m-card" style="--i:${i}">
              ${text
                ? html`<div class="m-value" dir="auto">${text}</div>`
                : nothing}
              ${m.label ? html`<div class="m-label">${m.label}</div>` : nothing}
            </div>`;
          })}
        </div>
      </section>
    `;
  }
}
