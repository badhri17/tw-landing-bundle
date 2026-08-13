import { LitElement } from "lit";
import type { MaybeMultiLang } from "./types";

/** Resolve a Salla multilanguage field to one render-safe string. */
export function localizedString(
  val: MaybeMultiLang,
  language: "ar" | "en"
): string {
  if (typeof val === "string") return val;
  if (!val || typeof val !== "object") return "";

  const resolved = val[language] || val.ar || val.en || "";
  return typeof resolved === "string" ? resolved.trim() : "";
}

/** Convert Arabic-Indic / Eastern-Arabic digits to Latin for parsing. */
export function toLatinDigits(s: string): string {
  return s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Shared base for all Growth Kit components: the Salla registration bridge
 * plus the config-parsing helpers every component uses.
 *
 * ⚠️ sallaTransformPlugin appends `<Name>.registerSallaComponent('salla-…')`
 * to each `src/components/<dir>/index.ts`, taking `<Name>` from the FIRST
 * `class <word>` token in the file — comments included. In component files,
 * never write the word "class" followed by another word anywhere above the
 * component declaration, or registration silently targets the wrong name.
 */
export class GrowthElement extends LitElement {
  /**
   * Twilight transform injects `Component.registerSallaComponent(...)`.
   * Statics inherit, so `this` is the concrete component. The polling
   * fallback handles preview contexts where `Salla` loads after the
   * component file executes.
   */
  static registerSallaComponent(name: string) {
    const componentKey = String(name || "").trim();
    const normalizedBase = componentKey
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-");
    const safeBaseName = normalizedBase.includes("-")
      ? normalizedBase
      : `salla-${normalizedBase || "component"}`;
    const buildDynamicTagName = () =>
      `${safeBaseName}-${Math.random().toString(36).substring(2, 8)}`;

    const tryRegister = () => {
      const bundles = (
        window as Window & {
          Salla?: {
            bundles?: {
              registerComponent?: (
                key: string,
                payload: {
                  component: typeof HTMLElement;
                  dynamicTagName: string;
                }
              ) => void;
            };
          };
        }
      ).Salla?.bundles;

      if (bundles && typeof bundles.registerComponent === "function") {
        bundles.registerComponent(componentKey, {
          component: this as unknown as typeof HTMLElement,
          dynamicTagName: buildDynamicTagName(),
        });
        return true;
      }
      return false;
    };
    if (tryRegister()) return;
    const timer = window.setInterval(() => {
      if (tryRegister()) window.clearInterval(timer);
    }, 100);
    window.setTimeout(() => window.clearInterval(timer), 5000);
  }

  /** Resolved document language. */
  protected _lang(): "ar" | "en" {
    return (document.documentElement.lang || "ar")
      .toLowerCase()
      .startsWith("en")
      ? "en"
      : "ar";
  }

  /** Pull the store-language string out of a Salla multilanguage value. */
  protected localizedString(val: MaybeMultiLang): string {
    return localizedString(val, this._lang());
  }

  /** Dropdown-list values from settings may come as [{ label, value }]. */
  protected _pickValue<T extends string>(val: unknown, fallback: T): T {
    if (typeof val === "string" && val) return val as T;
    if (Array.isArray(val) && val.length > 0) {
      const first = val[0] as { value?: unknown } | undefined;
      if (first && typeof first.value === "string" && first.value)
        return first.value as T;
    }
    return fallback;
  }

  /** See module-level toLatinDigits; exposed for subclasses. */
  protected _toLatinDigits(s: string): string {
    return toLatinDigits(s);
  }

  // ------------------------------------------------------------
  // Page anchors — how hero nav links reach the other components
  // ------------------------------------------------------------

  /** Base slug last claimed, so _syncAnchor() is cheap and idempotent. */
  private _anchorBase = "";
  /** Guards the one-shot deep-link scroll. */
  private _anchorDeepLinked = false;

  /**
   * Normalise a merchant-typed anchor into an id. Deliberately permissive
   * about script — Arabic ids are valid HTML and resolve fine through
   * getElementById — so we only strip the leading `#`, collapse whitespace,
   * and drop the characters that would break a URL fragment or a selector.
   */
  protected _slugify(raw: unknown, fallback: string): string {
    const src =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? String((raw[0] as { value?: unknown } | undefined)?.value ?? "")
          : "";
    const cleaned = src
      .trim()
      .replace(/^#+/, "")
      .replace(/\s+/g, "-")
      .replace(/["'<>&#?/\\%]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return cleaned || fallback;
  }

  /**
   * Publish this component as a linkable page section.
   *
   * The id goes on the HOST element, never inside the render root: every
   * component here renders into a shadow root, and neither `#hash` fragment
   * navigation nor getElementById can see an id inside someone else's shadow
   * tree. The host is ordinary light DOM, so both work.
   *
   * Safe to call from `updated()` — Salla injects `config` as a property that
   * may land after the first render, so the anchor has to be able to change
   * once. Two instances of the same component on one page get `-2`, `-3`, …
   * appended rather than silently colliding.
   *
   * @param raw       merchant's `anchor_id` value (may be undefined)
   * @param fallback  component's default slug, e.g. "collection"
   * @param navOffset px of breathing room above the section when scrolled to
   */
  protected _syncAnchor(raw: unknown, fallback: string, navOffset = 24): void {
    const desired = this._slugify(raw, fallback);
    if (!desired || desired === this._anchorBase) return;
    this._anchorBase = desired;

    let slug = desired;
    for (let n = 2; ; n++) {
      const clash = document.getElementById(slug);
      if (!clash || clash === this) break;
      slug = `${desired}-${n}`;
    }
    this.id = slug;
    this.style.scrollMarginTop = `${navOffset}px`;

    // A visitor landing on /page#colors gets no scroll from the browser: the
    // fragment is resolved long before this component upgrades and claims the
    // id. Do it ourselves, once.
    if (this._anchorDeepLinked) return;
    let hash = "";
    try {
      hash = decodeURIComponent(location.hash.slice(1));
    } catch {
      hash = location.hash.slice(1);
    }
    if (hash && hash === slug) {
      this._anchorDeepLinked = true;
      requestAnimationFrame(() =>
        this.scrollIntoView({ block: "start", behavior: "auto" })
      );
    }
  }

  /**
   * Handle a click on an in-page anchor link. Returns nothing and leaves the
   * event alone for real URLs, so the same handler can sit on every nav link.
   */
  protected _scrollToAnchor(e: Event, href: string): void {
    if (!href.startsWith("#") || href === "#") return;
    let id = href.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      /* keep the raw form */
    }
    const target = document.getElementById(id);
    if (!target) return; // let the browser try; nothing worse than a no-op
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      block: "start",
      behavior: reduce ? "auto" : "smooth",
    });
    history.replaceState(null, "", `#${id}`);
  }

  /** Coerce a config number that may arrive as a string (Arabic-Indic
      digits included) or as a [{ value }] dropdown selection. */
  protected _num(val: unknown, fallback: number): number {
    if (typeof val === "number" && !Number.isNaN(val)) return val;
    if (typeof val === "string" && val.trim() !== "") {
      const n = Number(toLatinDigits(val.trim()));
      if (!Number.isNaN(n)) return n;
    }
    if (Array.isArray(val) && val.length > 0) {
      const first = val[0] as { value?: unknown } | undefined;
      if (first?.value !== undefined) return this._num(first.value, fallback);
    }
    return fallback;
  }
}
