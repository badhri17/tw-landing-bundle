# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**tw-landing-bundle** is a custom component bundle for the **Salla Themes Marketplace**, focused on **landing-page components** — Web Components (Lit + TypeScript) that merchants drop onto a page and configure from the Salla admin panel.

- **Platform:** Salla Twilight Engine
- **Language priority:** Arabic-first (RTL default), LTR as fallback
- **Planned:** 4 prefilled templates organized around **store verticals**. The bundle owner fills the template content themselves — do not invent vertical themes or prefill `templates/` unless explicitly asked.
- **Component source:** `hero`, `collection`, `interactive-product` and `testimonials` were ported from the sibling bundle `~/Desktop/tw-growth-kit` (see *Porting components* below); `metrics`, `product-features`, `gallery`, `ingredients` and `use-cases` were written here.
- **No storefront merchandising.** The ported components arrived with growth-kit features that only make sense on a storefront home or product page, and those have been stripped on purpose: `collection` lost its `use_case` mode switch (`home` vs `bundle`), its per-slide `variable-list` product link and its «تسوّق الآن» CTA; `testimonials` lost its shoppable product chip. A landing page drives one conversion, owned by the hero — sections must not sprout competing links or product cards. Re-porting either component wholesale from the growth kit will drag these back; diff against the current version instead of overwriting.

## Commands

```bash
pnpm dev              # Vite dev server + auto-generated demo page (hot reload)
pnpm build            # Production build → dist/ (one self-contained JS file per component)
pnpm preview          # Preview the production build
pnpm format           # prettier --write "src/**/*.{ts,html,css}"
npx tsc --noEmit      # Typecheck (strict); there is no `lint` or `test` script

pnpm tw-create-component <name>   # Scaffold a component (kebab-case) + twilight-bundle.json entry
pnpm tw-delete-component <name>   # Remove a component and its bundle entry
pnpm exec tw-preview              # Publish a shareable preview snapshot (run pnpm build first)
```

**There is no test runner and no lint config in this project.** `vitest` and `eslint` are installed as devDependencies but have no config file and no script — don't assume `pnpm test` exists. Verification for a change is `pnpm build` + `npx tsc --noEmit`.

To preview only some components during dev, uncomment the `components` array in `vite.config.ts`:
```ts
sallaDemoPlugin({ components: ['hero', 'collection'] })
```

## Architecture

### How components get built and registered

Three Vite plugins from `@salla.sa/twilight-bundles` drive the build:

| Plugin | Role |
|---|---|
| `sallaTransformPlugin` | Appends `<ClassName>.registerSallaComponent("salla-<folder>")` to each `src/components/*/index.ts` |
| `sallaBuildPlugin` | One multi-entry Rollup build → separate `dist/<folder>.js` per component; `lit` is external |
| `sallaDemoPlugin` | Generates the dev demo page |

The registration key is derived from the **folder name** (`src/components/hero/` → `salla-hero`), and `registerSallaComponent` calls `window.Salla.bundles.registerComponent(...)`. That static lives on the shared `GrowthElement` base class (statics inherit), with a polling fallback for contexts where `Salla` loads after the component file executes.

⚠️ The transform takes `<ClassName>` from the **first `class <word>` token in the file — comments included**. Never write the word "class" followed by another word anywhere above the component's class declaration, or registration silently targets the wrong name.

### Shared code — `src/shared/`

Cross-component code has a single source of truth in `src/shared/`:

- `growth-element.ts` — `GrowthElement` (extends `LitElement`), the base class every landing component extends: the registration bridge plus protected helpers `localizedString` (multilang), `_lang`, `_pickValue` (dropdowns), `_num` / `_toLatinDigits` (numbers, Arabic-Indic digit aware) and its inverse `_localeNum` (render a counter or a step badge in the store's own digits).
- `types.ts` — `MaybeMultiLang`.

`gallery` also carries `side-element.ts` — the reusable **عنصر بصري جانبي** (decorative transparent PNG parked against one edge, hanging partly outside the section). It is co-located rather than in `src/shared/` because only one component uses it so far; it takes `_pickValue`/`_num` as arguments instead of importing `GrowthElement`, so adopting it in the FAQ section later is a file move plus a copy of its ~14 bundle fields.

There is deliberately **no product plumbing** here. `product.ts` (`sallaGlobal`, `pickerSelection`, `fetchProductDetails`, `parseMoney`, `formatMoney`) came over with `testimonials` from the growth kit and was deleted when that component's shoppable product chip was dropped: on a landing page a testimonial sells trust, not a SKU. Don't port it back for a landing component without a concrete reason — if a component genuinely needs to resolve a real product, copy it fresh from `~/Desktop/tw-growth-kit/src/shared/product.ts`.

The `GrowthElement` name is kept deliberately (rather than renamed to something landing-specific) so components copied from `tw-growth-kit` stay drop-in with no rename diff.

`vite.config.ts` defines `duplicateSharedPerComponentPlugin`, which tags every `src/shared/*` import with the importing component (`?gk=<name>`) so Rollup inlines a private copy into each entry. **Do not remove it** — without it, the multi-entry build splits shared modules into hashed chunks (`dist/growth-element-<hash>.js`) and breaks Salla's one-self-contained-file-per-component contract. Corollary: module-level state in `src/shared/` is per-component at runtime, never shared across components.

### Media — `public/assets/` → `dist/assets/` → `/assets/…`

All bundle media (demo imagery, decorative PNGs, anything a field's default `value` points at) lives in **`public/assets/`** and is referenced by the **root-absolute path** `/assets/<…>`.

That single spelling works everywhere because of how the paths line up:

| context | resolves via |
|---|---|
| `pnpm dev` demo page + form builder | Vite serves `publicDir` at the dev-server root |
| `pnpm build` | Vite copies `publicDir` contents into `outDir` → `dist/assets/…` |
| `tw-preview` | walks `dist/assets/`, uploads each file, and the preview Worker rewrites `/assets/…` refs to the uploaded URLs |

**Never set `build.copyPublicDir: false`.** It looks tidy — `dist/` ends up holding only the per-component JS files Salla requires — but it strips every asset out of the preview payload. `tw-preview` reads `dist/*.js` through an `isFile()` filter, so a `dist/assets/` directory beside them is expected, not a contract violation. (This was set once and had to be reverted.)

Asset rules enforced by `tw-preview` (see `node_modules/@salla.sa/twilight-bundles/bin/tw-preview.js`):

- every path segment must match `^[A-Za-z0-9_+-][A-Za-z0-9._+-]*$` — no spaces, no Arabic filenames. Offenders are **skipped with a warning, not an error**, so a typo silently ships a broken image.
- 50 MB per file, also skipped with a warning.

### Publishing a preview — `tw-preview`

`pnpm exec tw-preview` uploads `twilight-bundle.json`, `templates/*.json`, every `dist/*.js` and `dist/assets/**` as a snapshot and prints a shareable URL. Re-running updates the same URL in place (state in `.salla-preview.json`). Auth comes from the Salla CLI login (`~/.salla/config.json`); no env vars needed interactively.

- **Run `pnpm build` first** — it hard-fails if a template references a component whose `dist/<name>.js` is missing.
- **Template count**: minimum 1. Setting `features: ["landing-page-templates"]` in `twilight-bundle.json` raises it to **min 2, max 4** — which is the intended shape for the 4 vertical templates, but do not set that flag until at least two exist or every run fails.
- **Template thumbnails are the one asset that does NOT go in `public/assets/`.** They live at the bundle root as `templates-thumbs/<template-name>.<png|jpg|jpeg|webp>`. After a successful publish `tw-preview` writes the resolved permanent CDN URL back into that template's `thumbnail` field in `twilight-bundle.json`, and writes `public_preview_url` for each template. This is a way to get a real CDN URL without touching the admin image picker.
- Content images referenced as `/assets/…` are rewritten **in the served snapshot only** — the on-disk JSON keeps the `/assets/…` path. Only thumbnails get promoted to a permanent URL on disk. Whether `/assets/…` survives marketplace publication is unverified; test with one template before building all four on that assumption.

### Page anchors — how the hero navbar reaches other sections

Salla has no picker that enumerates the components on a page, so in-page nav links run on an anchor-id convention that every landing component takes part in:

- Each component exposes an `anchor_id` text field (placeholder = its default slug: `hero`, `collection`, `interactive-product`, `testimonials`, `metrics`, `product-features`, `gallery`, `ingredients`, `use-cases`) and calls `this._syncAnchor(this.config?.anchor_id, "<slug>")` from `updated()` — every cycle, because Salla may inject `config` after the first render.
- ⚠️ **`_syncAnchor` overwrites whatever `id` the host element already had.** It runs on the first `updated()`, which is a microtask after the element upgrades — so any page that tags instances with its own ids (a test harness, a hand-written preview page) loses them before its next script runs, and `getElementById("my-id")` comes back `null`. Address instances by `querySelectorAll("<tag>")` and index instead.
- `_syncAnchor` (in `GrowthElement`) writes the id onto the **host element**, never inside the render root: every component renders into a shadow root, and neither `#hash` navigation nor `getElementById` can see an id inside someone else's shadow tree. It also de-duplicates (`collection`, `collection-2`, …), sets `scroll-margin-top`, and performs a one-shot self-scroll when the page was loaded with a matching `#hash` — the browser resolves the fragment long before the component upgrades.
- The hero's `nav_items[].target` dropdown lists every landing component by slug, plus `custom` (free-text id) and `link` (the off-page `variable-list` picker). **A new landing component must be added to that dropdown's `options`** as well as to `HeroNavTargetKind` in `src/components/hero/types.ts`.

### `twilight-bundle.json` — source of truth for the admin UI

Every component needs an entry here: `name` (must match the folder in `src/components/`), a UUID `key`, and a `fields` array that drives what the merchant panel renders. Field `type`s include `string`, `number`, `boolean`, `items` (dropdown), `collection`, and `static` (UI-only dividers/titles). All merchant-facing `label`, `placeholder`, `title` and `description` values must be **Arabic**.

The file currently holds two groups: the landing components (`hero`, `collection`, `interactive-product`, `testimonials`, `metrics`, `product-features`, `gallery`, `ingredients`, `use-cases`) at the top, and the starter-kit demo components below them (`getting-started-guide`, `basic-inputs`, `items-select-input`, `dropdown-list-source-input`, `advanced-inputs`, `product-card`) — kept as reference, to be cleaned up before publishing. `scroll-top` and `table-list` were the first two removed.

⚠️ **`tw-delete-component` does not touch `templates/`.** It deletes `src/components/<name>/` and the `twilight-bundle.json` entry, and stops there — so a component that also appears in a template file leaves an orphan behind, and `tw-preview` hard-fails on it later. Both removals above were in `templates/starter-template.json` and had to be pulled out by hand. Delete the stale `dist/<name>.js` too; the build does not prune it.

### Templates (`templates/`)

A template is a prefilled page: a set of component instances with their field values already filled in. Two files must agree:

1. `twilight-bundle.json` → `templates[]` entry: `{ id, path: "templates.<file>", category_id, primary_color, thumbnail, is_default }`. The `path` is dot-notation for `templates/<file>.json`.
2. `templates/<file>.json` → `{ id, components: [...] }`.

**Both `id`s must be identical**, and each component inside the template file mirrors its `twilight-bundle.json` entry — **including the same `key` UUID**. A template referencing a key that doesn't exist in `components[]` won't resolve. When adding a landing component to a template, copy its current key out of `twilight-bundle.json` rather than generating a new one.

### Component structure

Each component lives in `src/components/<kebab-name>/` with `index.ts` as the entry point, plus optional co-located `style.ts` and `types.ts`. Every component must:

1. Extend `GrowthElement` and export the class as **default**
2. Declare a single `@property({ type: Object }) config?` that receives all merchant settings
3. Have a matching entry in `twilight-bundle.json`

```ts
import { GrowthElement } from "../../shared/growth-element";

export default class MyComponent extends GrowthElement {
  @property({ type: Object })
  config?: { title?: string; /* ... */ };

  static styles = css`/* ... */`;

  render() {
    return html`<div>${this.localizedString(this.config?.title)}</div>`;
  }
}
```

### Reading config values

- **Multilanguage** — fields marked `multilanguage: true` arrive as `string | { ar?: string; en?: string } | null`. Always resolve with the inherited `this.localizedString(value)`; never re-implement it per component. The explicit helper name is what lets Salla's publication checks verify every rendered value is localized.
- **Dropdowns** — `items` fields arrive as a plain string **or** `[{ label, value }]`. Resolve with `this._pickValue(value, fallback)`.
- **Numbers** — may arrive as numbers, strings, Arabic-Indic digits, or dropdown arrays. Resolve with `this._num(value, fallback)`.

### ⚠️ CSS custom properties that derive from other custom properties

Components pass merchant settings to CSS as an inline `style` on the **rendered section element**, not on the host. Custom-property substitution happens on the element where the property is *declared*, so a variable declared on `:host` that references another variable resolves against the host's own values — it never sees the inline override on the descendant, and the setting silently does nothing.

Plain values (`--x: #fff`, `--cols: 3`) are fine on `:host`: the inline declaration on the section shadows them for everything inside. Only **derived** declarations are affected. Declare those on the same element the inline style targets:

```css
/* WRONG — --scale resolves against the host's --scale-m, always 1 */
:host { --scale-m: 1; --scale: var(--scale-m); --thumb: calc(46px * var(--scale)); }

/* RIGHT — declared where the component writes --scale-m */
:host { --scale-m: 1; --scale-d: 1; }
.section { --scale: var(--scale-m, 1); --thumb: calc(46px * var(--scale)); }
@media (min-width: 768px) { .section { --scale: var(--scale-d, 1); } }
```

See `product-features/style.ts`, which uses this to swap the mobile/desktop card scale.

### Radial placement without JS or CSS trig

`ingredients` has a `circle` layout — a ring orbiting the product with the ingredients sitting on it. Everything is placed with the rotate / counter-rotate **arm** trick rather than JS-computed coordinates: an arm is stretched over the whole stage (`position:absolute; inset:0`) and rotated to the item's angle, its single child is parked at `top: calc(50% - <radius>)`, then counter-rotated by `rotate(calc(-1 * var(--a)))` so it sits upright.

Why it matters: the stage is `aspect-ratio: 1`, so a **percentage** radius is the same length horizontally and vertically. Every measurement stays a percentage, which means the whole composition is responsive with no resize listener, no `ResizeObserver`, and no dependency on CSS `sin()`/`cos()` — and mobile/desktop differ by nothing more than redeclaring two custom properties in the media query.

Two consequences to remember:
- Anything appended **after** the counter-rotation lands in a screen-aligned frame (that is where the per-item vertical nudge and the entrance `scale()` go); anything before it is in the rotated frame.
- Items in this layout are absolutely positioned, so a lazy image that has not decoded collapses its box and jumps on arrival. Reserve the cell (`.ing-orbit .ing-media { aspect-ratio: 1 }` + `object-fit: contain`) rather than dropping `loading="lazy"`.

### Which card is in the middle of a bleeding strip

`use-cases` has a `row` layout — the same edge-to-edge scroll-snapping strip as `gallery`, but the frame nearest the middle is brought forward and the rest are dimmed and scaled down (`.uc-strip[data-focus="on"]`). Three things make that work:

- **Measure with rectangles, never `scrollLeft`.** In RTL, `scrollLeft` is the one number engines genuinely disagree on (0 at the right edge counting down in Chrome/Firefox, counting up elsewhere). `_syncActive()` compares each slide's `getBoundingClientRect()` centre against the strip's, which is identical in both directions; `_centerSlide()` likewise scrolls by a rect **delta** through `scrollBy`, not by assigning an absolute `scrollLeft`.
- **Scroll handling is rAF-coalesced** (`_onStripScroll` sets `_rafId`), and `_syncStrip()` rebinds by element identity in `updated()` rather than once in `firstUpdated()` — the layout dropdown can swap the strip in and out at any time.
- **The entrance transform and the focus transform must live on different elements**, or the second overwrites the first. `.uc-slide` carries the entrance `translateY`; the `.uc-frame` inside it carries the focus `scale`.

`.uc-frame` is also shared with the stack layout's "copy over the photo" mode — the two are the same object (a photo, a scrim, a caption), differing only in what sets `--uc-frame-ar`.

`text_position` decides whether the copy sits on the photo or clear of it, in **both** layouts (see conditional-field rule 4 below for why it has to be one shared field). The two arrangements need different DOM, not just different CSS: an overlaid caption has to be inside the element that clips to the frame's aspect ratio, and a caption underneath has to be outside it. Hence `_renderFrame`'s two branches and the `.uc-fig` wrapper, which exists only in the second so the photo and its caption move together under the focus transform.

### One component, three jobs — and the name that had to stay

`use-cases` is a photo + a line of copy, repeated. That shape answers three different merchant questions, and the panel copy names all three rather than letting the folder name narrow it: **أماكن أو لحظات الاستخدام**, **فوائد المنتج ومميزاته**, and **طريقة الاستخدام خطوة بخطوة**. So the merchant-facing title is «استخدامات وفوائد المنتج», the content note lists the three, `items.item_label` is the neutral «بطاقة», and every placeholder/description gives one example per job.

Two rules that came out of this and generalise to the rest of the bundle:

- **The code name and the merchant name are allowed to diverge, and after publication only one of them is still free.** `name` in `twilight-bundle.json` drives the tag, `dist/<name>.js`, the default anchor slug and the key that published merchant pages and templates resolve against — renaming it later breaks those. `title` is just a label. So broaden the title freely; leave `name` alone once anything ships. That is why this section reads «استخدامات وفوائد المنتج» in the panel while everything in the code still says `use-cases`.
- **Don't widen a claim without the feature that backs it.** "Step by step" is not real without step numbers, so `show_numbers` exists (default **off** — numbering an unordered set of benefits invents a sequence the merchant didn't mean). Its two colour fields are gated on `[{ id: "show_numbers", operation: "=", value: true }]` — a boolean condition takes a real `true`, not `"true"`.

## Porting components from `tw-growth-kit`

The landing components came from `~/Desktop/tw-growth-kit` (read that repo's `CLAUDE.md` for the fuller Salla field-schema notes). To bring over another one:

1. Copy `tw-growth-kit/src/components/<name>/` into `src/components/<kebab-name>/`.
2. Keep `src/shared/` verbatim — including the `GrowthElement` name.
3. Copy the component's entry from the growth kit's `twilight-bundle.json`, but **generate a fresh UUID `key`**; don't reuse the growth kit's.
4. Folder names here are kebab-case (`Hero/` was renamed to `hero/`). The bundle-json `name` must match the folder exactly.
5. Verify: `pnpm build` should emit one `dist/<name>.js` per component with **no hashed chunk files**, and `npx tsc --noEmit` should be clean.

## Design Principles

- **RTL-first** — Arabic is the default direction; all layouts, animations and slider configs must work RTL out of the box.
- **Mobile-first** — mobile is the primary canvas, desktop the optional enhancement. This must stay in sync in **three places**:
  1. **CSS** — mobile layout as the base rule, desktop overrides inside `@media (min-width: 768px)`. Never the reverse.
  2. **`twilight-bundle.json`** — the mobile field comes **first and is primary** (concrete default, no `inherit` option). The desktop field comes second, labeled `(اختياري)`, and offers `inherit` (`"نفس الجوال"`) as its default. Group desktop fields under a `static` divider titled `سطح المكتب — تخصيص اختياري`. See `hero.height_mobile`/`height_desktop` and `testimonials.columns_mobile`/`columns_desktop`.
  3. **Component logic** — resolve mobile first, then `desktop === "inherit" ? mobileValue : desktopValue`.

  For a field whose options are **relative tiers** rather than concrete values (`صغير/متوسط/كبير`, as opposed to a column count or a pixel height), `inherit` carries the mobile *tier* across, not the mobile *pixels* — the tier is then resolved through a separate, larger desktop scale table, so desktop `sm` is bigger than mobile `sm`. Desktop cards are far wider than mobile ones, so a shared table would make every desktop tier look undersized and the desktop field a no-op unless the merchant changed the tier. See `CARD_SCALE_MOBILE`/`CARD_SCALE_DESKTOP` in `product-features/index.ts`; label that option `نفس مستوى الجوال`, not `نفس الجوال`.
- **Section-header icons** — prefix `static` title/note dividers with a flat inline-SVG icon (feather/lucide style), **never an emoji**. Use `stroke='currentColor'` and `em`-based sizing. Copy an existing `<svg>` from a divider already in `twilight-bundle.json` rather than reinventing it: monitor → desktop, smartphone → mobile, palette → colours, gear → advanced, zap → flash, lightbulb → tip.
- **Component independence** — each component is self-contained, responsive, and cross-browser compatible.
- **Merchant configurability** — every visual decision a merchant might want to change becomes a field with a sensible default.
- **Premium feel & conversion focus** — motion and layout should read as premium, not like the built-in theme components; respect `prefers-reduced-motion` throughout.
- **Popup anti-pattern** — never show popups immediately on page load; always expose configurable delays.

## Naming Conventions

- All merchant-facing labels, titles, placeholders and descriptions in `twilight-bundle.json` → **Arabic**.
- Code identifiers (variables, CSS classes, TypeScript types, file names, field `id`s) → **English**, kebab-case for folders.

## ⚠️ Never put a backtick inside a `css` template literal

`style.ts` files are one big `` css`…` `` template. A backtick anywhere inside it — including in a CSS comment, e.g. explaining the `safe` keyword — **ends the template early**, and the file fails to parse with a misleading esbuild error like `Expected ";" but found "safe"`. The dev server then serves an HTML error page for the module and the component silently never registers, so the section renders blank.

This has bitten three times — most recently while rewriting the hero navbar, where two CSS comments quoted a property name and a keyword in backticks. Use plain quotes in CSS comments. Backticks in the JSDoc block **above** `export const … = css\`` are fine — that text is outside the literal.

Note `npx tsc --noEmit` does catch it, so run the typecheck after editing any `style.ts`; a blank component in the browser is the slower way to find out.

## ⚠️ Conditional-field gotchas

The ported components rely heavily on `conditions` (≈49 conditional fields across the four). Three hard rules:

1. **Conditions are single-value `=` only.** No OR, no array values, no `!=`, no `in`. A field can be shown for exactly **one** value of the controlling field. To show it for several values, **duplicate the field once per value**, each with its own `conditions` entry. If it's relevant for all values, give it no condition at all.
2. **Each duplicated copy MUST have a unique `id` — distinct `key`s are not enough.** Salla's admin form builder gates by `id`. When 2+ conditional fields share an `id`, gating silently breaks: the field renders zero times for one value and N times (stacked) for another. Name copies `bg_effect`, `bg_effect_floating`, `bg_effect_split`, … and resolve the active one in the component by reading the controlling value.
3. **`conditions` is an array but only ONE entry is honoured — there is no AND.** Two entries do not combine: a field gated `[layout=circle, ring_dot=true]` rendered while `layout` was `columns`, and one gated `[layout=columns, desktop_custom_width=true]` stayed hidden while `layout` *was* `columns` — i.e. the earlier entries are ignored, not ORed. **Give every field exactly one condition** and pick the gate that matters most. To express "A and B", gate the *controlling switch* on A and the field on the switch (`ingredients.circle_desktop_custom` is gated on `layout=circle`, and its three sliders on the switch), so the pair is unreachable from the wrong branch anyway.
4. **To express "A or B", stop asking two fields and add the one field that answers the question directly.** Duplicating per rule 1 is the fallback, not the first move — it multiplies the schema and, worse, **a hidden field keeps its stored value**, so a gate on a branch-local field fires from a branch the merchant has since left. `use-cases` hit this: copy sits on the photo when `layout=row` *or* when `layout=stack` and the stack's own text toggle says so. Gating on that stack-local toggle would have left the overlay settings showing in the row layout off a stale value. The fix was to delete the per-layout toggle and add `text_position` (`over` / `outside`) with **no** condition, shared by both layouts — one field, one honest `=` test, nothing stale. The price is that the shared field's other value has to mean the layout-appropriate thing in each branch (`outside` = beside the photo in the stack, under it in the row), which is real work in the component and a vaguer label in the panel. Worth it: the alternative leaks.

⚠️ **The panel caches the schema in `localStorage` under `form-builder::<component>`** and prefers it over the freshly generated page, so edits to `twilight-bundle.json` appear not to take effect. Clear the `form-builder::*` keys when testing a schema change. Note also that the generated `node_modules/.salla-temp/*.html` is only rebuilt when the dev server starts on a missing directory — `rm -rf node_modules/.salla-temp` and restart to pick up a `twilight-bundle.json` edit.

## Sliders — great at top level, ignored inside a collection

For a percentage that positions something (offsets, widths, opacity) prefer a slider over a number box; nudging beats typing:

```jsonc
{ "type": "number", "format": "slider", "inputType": "range",
  "minimum": -100, "maximum": 100, "step": 1, "value": 20 }
```

The panel renders it as a track with a live «القيمة: N» readout, RTL-correct (the handle runs right-to-left). See `gallery.side_x` / `side_y` / `side_width` / `side_opacity`.

**But `format: "slider"` only works on a top-level field.** Inside a `collection`'s `fields` the form builder ignores it and falls back to a plain number box — no crash, just dead config. That is why `product-features.items[].top` and `interactive-product.hotspots[].x`/`y` stay `format: "integer"` even though they are exactly the same kind of value. Verified side by side in the local form builder.

**A slider always carries a value**, so the "leave it blank to inherit mobile" trick stops working the moment a desktop field becomes one. Gate the desktop group behind a boolean switch instead and read that switch in the component — see `gallery.side_desktop_custom` and `resolveSideElement`.

### ⚠️ A signed horizontal slider drags backwards in the RTL panel

The merchant panel is RTL (`<html dir="rtl">`), and an RTL `<input type=range>` renders its **minimum at the RIGHT** end — verified in the local form builder: a `[-40, 40]` slider showing «القيمة: -30» puts its handle 86 % from the left. Meanwhile CSS `translateX(positive)` is *always* physically rightward, because `transform` is not direction-aware. The two axes therefore point opposite ways: **dragging the handle right lowers the number, which moves the element left.** Merchants read this as a bug.

Two ways out, both used in this bundle:

- **Preferred — make the value a direction-free magnitude.** `gallery.side_x` means "how far *outward* past its own edge", and `side-element.ts` applies `calc(-1 * var(--se-x))` for a left-anchored element and `var(--se-x)` for a right-anchored one. Positive always means "further out", so there is no left/right sign to get backwards.
- **When the value really is a signed left/right nudge, negate it in CSS so positive means LEFT.** That makes the element follow the handle on an RTL track. `ingredients.product_offset_x` does this; the negation lives in `style.ts` on `.ing-product` and is commented at both sites. Do not "correct" the sign back to the Cartesian convention without re-testing the drag direction in the panel.

Vertical sliders have no equivalent problem (the track is still horizontal, so neither end is inherently "up"); keep them on the existing `negative = up` convention, as `ingredients.items[].offset_y` and `product_offset_y` do.

## ⚠️ A dropdown value is ALWAYS an array of option objects

Wherever a `dropdown-list` value appears — a top-level field's `selected`, **and a `collection`'s default rows** — it must be an array of the field's own option objects, never a bare string:

```jsonc
// WRONG — kills the whole settings form
"value": [{ "title": "…", "side": "left" }]
// RIGHT
"value": [{ "title": "…", "side": [{ "label": "يسار الصورة", "value": "left", "key": "side-1" }] }]
```

Salla's form builder renders a dropdown's item list with `selection.some(o => o.value === item.value)`. A string has no `.some`, React throws `n.some is not a function` mid-render, and the **entire settings panel renders blank** — so the merchant can never submit it. The panel only surfaces the generic `خطأ في التحقق، يرجى مراجعة البيانات المدخلة`, which points nowhere near the real cause.

Nothing else in the bundle is affected: this only bites a dropdown *inside* a collection that ships default rows. Omitting the key from a default row is also safe, which is how the growth kit sidesteps it.

Components read it back with `this._pickValue(value, fallback)`, which already accepts both shapes, so widen the field's TS type to `T | Array<{ value?: string }> | string`.

**To reproduce panel bugs locally:** `pnpm dev` serves the real Salla form builder at `/node_modules/.salla-temp/index.html` (vite prints the port; the site root 404s). Open a component's settings there, watch the console, and submit — that is where this crash was caught. Values persist to `localStorage` under `form-builder::data_<component>`; clear the `form-builder::*` keys to test a first-ever open.

Also: any external preview image used inside a field's `value` HTML must be on a reliable CDN (e.g. `cdn.files.salla.network`) — a dead host renders as a broken image in the merchant panel. Verify the URL is live before adding it.

## Salla Documentation

Fetch docs directly — direct URLs return better structured content than search:

- **Index of all doc pages:** `https://docs.salla.dev/llms.txt`
- Append `.md` to any doc ID: `https://docs.salla.dev/421921m0.md` (twilight.json / bundle config), `422558m0.md` (Home Page), `422580m0.md` (Components overview), `422689m0.md` (Twilight Web Components), `422690m0.md` (Customize Web Components)
- **Field schema ground truth** — Salla's docs don't document every field property. theme-raed's `twilight.json` is the most complete real-world example: `https://raw.githubusercontent.com/SallaApp/theme-raed/master/twilight.json`. Conditional fields, picker `source`s (`products`, `categories`, `brands`, `pages`, `blog_articles`, …) and `format: "variable-list"` multi-source links are documented only there.

## Git Commits

Never add `Co-Authored-By: Claude` or any AI co-author trailer to commit messages.
