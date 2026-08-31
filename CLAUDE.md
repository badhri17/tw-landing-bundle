# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**tw-landing-bundle** is a custom component bundle for the **Salla Themes Marketplace**, focused on **landing-page components** — Web Components (Lit + TypeScript) that merchants drop onto a page and configure from the Salla admin panel.

- **Platform:** Salla Twilight Engine
- **Language priority:** Arabic-first (RTL default), LTR as fallback
- **Planned:** 4 prefilled templates organized around **store verticals**. The bundle owner fills the template content themselves — do not invent vertical themes or prefill `templates/` unless explicitly asked.
- **Component source:** `hero`, `collection` and `testimonials` were ported from the sibling bundle `~/Desktop/tw-growth-kit` (see *Porting components* below); `metrics`, `product-features`, `gallery`, `ingredients`, `use-cases`, `faq` and `comparison` were written here.
- **No storefront merchandising.** The ported components arrived with growth-kit features that only make sense on a storefront home or product page, and those have been stripped on purpose: `collection` lost its `use_case` mode switch (`home` vs `bundle`), its per-slide `variable-list` product link and its «تسوّق الآن» CTA; `testimonials` lost its shoppable product chip. A landing page drives one conversion, owned by the hero — sections must not sprout competing links or product cards. `collection` also lost its `display_mode` switch and the whole «وضع الشنطة» bag stage (a vertical stage where products rise out of a merchant-uploaded bag image) — that mode is reserved for the premium growth bundle, so this one stays the plain coverflow. Removing `display_mode` meant clearing the `display_mode = "carousel"` `conditions` off `slide_animation`, `aspect_ratio`, `desktop_layout`, `card_radius` and the sizes diagram: a condition pointing at a field that no longer exists can never be satisfied, so those would have vanished from the panel entirely. Re-porting either component wholesale from the growth kit will drag these back; diff against the current version instead of overwriting.

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
- `section-spacing.ts` — **المسافات حول القسم**, the page's vertical rhythm. Two `items` fields per section (`space_top` / `space_bottom`) on a shared tier scale (`none / xs / sm / md / lg / xl`), resolved through **two** tables so one tier means more room on desktop — the documented relative-tier pattern, so no `inherit` desktop duplicates are needed. Returns four *plain* custom properties (`--sp-top-m`, `--sp-bot-m`, `--sp-top-d`, `--sp-bot-d`), deliberately un-prefixed because each component has its own shadow root and the CSS is then identical everywhere. Wired into all ten content sections; `hero` (its padding is the navbar's, height is its own field) and `flexible-banner-content` (deliberately flush) stay out.
- `side-element.ts` — the reusable **عنصر بصري جانبي** (decorative transparent PNG parked against one edge, hanging partly outside the section), shared by `gallery`, `faq` and `comparison`. It takes `_pickValue`/`_num` as **arguments** rather than importing `GrowthElement`, so it stays free of any base-class dependency; each component owns the CSS that consumes the `--se*-…` properties it returns (`.gal-side`, `.faq-side`, `.cmp-side`) and decides how many of the ~15 bundle fields per decoration to expose. Adopting it in a fourth section is a copy of those fields plus one block of CSS — `comparison` was the third and cost exactly that, with its bundle block cloned out of `faq` by script rather than retyped.

- `wave-edges.ts` — **تموج الحواف**, the wavy top/bottom section edge, shared by `testimonials` and `gallery`. Same shape as `side-element.ts`: `_pickValue` as an argument, un-prefixed `--wv-*` properties, the CSS owned by each adopter. See the section on it below for why the mask rides a `::before` layer rather than the section.

**All three adopters use the same control, and a fourth should clone it rather than invent one:** a 3-way `side_visual_count` dropdown (`off` / `one` / `two`), with the slot-1 fields gated `!= "off"` and the slot-2 fields gated `= "two"`. Copy the block straight out of `gallery` (or `faq`, or `comparison`) — the field ids, labels and conditions are identical between them on purpose, so a merchant configuring two of these sections reads the same words twice. The one clause worth rewording per section is the side note's tail, which names what the decoration can sit behind (`faq` says «خلف الأسئلة», `comparison` says «خلف الجدول»).

`resolveSideElement` also accepts an older shape (`enable_side_visual` + `enable_second_side_visual` booleans, plus `side_desktop_custom` switches to reach the desktop values). **Don't build a new component on it.** The count path is the current one and needs no desktop-custom switch: it sets `custom = true` internally, so the desktop fields always apply.

One deliberate difference: `resolveSideElement` returns `depth` (`behind` / `front`) and both components write it to `data-depth`, but only `faq` and `comparison` expose a field for it and style it (`z-index` 0 vs 3, against a header at 2 and the list or card at 1). In `gallery` the attribute is inert.

There is deliberately **no product plumbing** here. `product.ts` (`sallaGlobal`, `pickerSelection`, `fetchProductDetails`, `parseMoney`, `formatMoney`) came over with `testimonials` from the growth kit and was deleted when that component's shoppable product chip was dropped: on a landing page a testimonial sells trust, not a SKU. Don't port it back for a landing component without a concrete reason — if a component genuinely needs to resolve a real product, copy it fresh from `~/Desktop/tw-growth-kit/src/shared/product.ts`.

The `GrowthElement` name is kept deliberately (rather than renamed to something landing-specific) so components copied from `tw-growth-kit` stay drop-in with no rename diff.

`vite.config.ts` defines `duplicateSharedPerComponentPlugin`, which tags every `src/shared/*` import with the importing component (`?gk=<name>`) so Rollup inlines a private copy into each entry. **Do not remove it** — without it, the multi-entry build splits shared modules into hashed chunks (`dist/growth-element-<hash>.js`) and breaks Salla's one-self-contained-file-per-component contract. ⚠️ **It compares paths normalised, and must stay that way.** Vite reports module ids with forward slashes, but `path.resolve()` returns backslashes on Windows — so an un-normalised `startsWith` matched nothing, no import got tagged, and every build on Windows silently fell back to hashed chunks while still reporting success. The check after any build is `ls dist/`: thirteen `<name>.js` files and no `<name>-<hash>.js` means it is working. Corollary: module-level state in `src/shared/` is per-component at runtime, never shared across components.

⚠️ **`dist/*.js` is COMMITTED — the marketplace releases from it.** Salla's "Twilight Check" GitHub App fails the commit with *"The `dist/` directory is missing or empty"* if the thirteen `dist/<name>.js` files are not in the repository, and it names every one it expects. So `.gitignore` ignores `dist/*` but re-includes `!dist/*.js`; `dist/assets/` stays ignored because it is only a copy of `public/assets/`, which is already tracked, and the check does not ask for it. **Re-run `pnpm build` and commit `dist/` whenever component source changes**, or the released bundle silently ships the previous build.

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
- **Template count**: minimum 1. Setting `features: ["landing-page-templates"]` in `twilight-bundle.json` raises it to **min 2, max 4** — which is the intended shape for the 4 vertical templates, but do not set that flag until at least two exist or every run fails. It was set once with `starter-template` + `perfumes` in place; deleting the starter template left one real template, so the flag came back out and `perfumes` was promoted to `is_default`. It is now back ON: `solara` landed as the second vertical template, so the min-2 floor is met. Two more verticals can still be added before the max of 4.
- **Template thumbnails are the one asset that does NOT go in `public/assets/`.** They live at the bundle root as `templates-thumbs/<template-name>.<png|jpg|jpeg|webp>`. After a successful publish `tw-preview` writes the resolved permanent CDN URL back into that template's `thumbnail` field in `twilight-bundle.json`, and writes `public_preview_url` for each template. This is a way to get a real CDN URL without touching the admin image picker. ⚠️ **But that writeback breaks the local demo page, and it comes back every time you publish.** The demo's thumbnail preview builds its URL as `` `/__salla_demo/${thumbnail}` `` (`dist/vite-plugins/_demo.js`) with no guard for an already-absolute URL, and the dev middleware only serves `/__salla_demo/templates-thumbs`. So a relative `templates-thumbs/solara.jpg` resolves, while the absolute URL tw-preview writes becomes `/__salla_demo/https://cdn…` and 404s — every template thumbnail renders broken in `pnpm dev`. Pointing the field at any other CDN does not help; the bug is the unconditional prefix. Fix by reverting the field to the relative `templates-thumbs/<name>.<ext>` (the shape the plugin's own UI writes), and re-revert after each `tw-preview` run — or just accept broken thumbs in dev, since the absolute URL is correct for the published preview and the marketplace.
- Content images referenced as `/assets/…` are rewritten **in the served snapshot only** — the on-disk JSON keeps the `/assets/…` path. Only thumbnails get promoted to a permanent URL on disk. Whether `/assets/…` survives marketplace publication is unverified; test with one template before building all four on that assumption.

### Page anchors — how the hero navbar reaches other sections

Salla has no picker that enumerates the components on a page, so in-page nav links run on an anchor-id convention that every landing component takes part in:

- Each component exposes an `anchor_id` text field (placeholder = its default slug: `hero`, `collection`, `testimonials`, `metrics`, `product-features`, `gallery`, `ingredients`, `use-cases`, `faq`, `comparison`, `footer`, `flexible-banner-content`, `image-badges`) and calls `this._syncAnchor(this.config?.anchor_id, "<slug>")` from `updated()` — every cycle, because Salla may inject `config` after the first render.
- ⚠️ **`_syncAnchor` overwrites whatever `id` the host element already had.** It runs on the first `updated()`, which is a microtask after the element upgrades — so any page that tags instances with its own ids (a test harness, a hand-written preview page) loses them before its next script runs, and `getElementById("my-id")` comes back `null`. Address instances by `querySelectorAll("<tag>")` and index instead.
- `_syncAnchor` (in `GrowthElement`) writes the id onto the **host element**, never inside the render root: every component renders into a shadow root, and neither `#hash` navigation nor `getElementById` can see an id inside someone else's shadow tree. It also de-duplicates (`collection`, `collection-2`, …), sets `scroll-margin-top`, and performs a one-shot self-scroll when the page was loaded with a matching `#hash` — the browser resolves the fragment long before the component upgrades.
- The hero's `nav_items[].target` dropdown lists every landing component by slug, plus `custom` (free-text id) and `link` (the off-page `variable-list` picker). **A new landing component must be added to that dropdown's `options`** as well as to `HeroNavTargetKind` in `src/components/hero/types.ts`.

### `twilight-bundle.json` — source of truth for the admin UI

Every component needs an entry here: `name` (must match the folder in `src/components/`), a UUID `key`, and a `fields` array that drives what the merchant panel renders. Field `type`s include `string`, `number`, `boolean`, `items` (dropdown), `collection`, and `static` (UI-only dividers/titles). All merchant-facing `label`, `placeholder`, `title` and `description` values must be **Arabic**.

The file holds exactly the thirteen landing components (`hero`, `collection`, `testimonials`, `metrics`, `product-features`, `gallery`, `ingredients`, `use-cases`, `faq`, `comparison`, `footer`, `flexible-banner-content`, `image-badges`) and nothing else. The starter-kit demo components it shipped with — `scroll-top`, `table-list`, then `getting-started-guide`, `basic-inputs`, `items-select-input`, `dropdown-list-source-input`, `advanced-inputs`, `product-card` — have all been removed. `interactive-product` (ported from the growth kit) was removed too — no template used it, and a landing page drives one conversion rather than an explorable product. Don't re-add one as a reference; read the field schemas off the landing components or off theme-raed's `twilight.json` (linked below) instead.

⚠️ **`tw-delete-component` does not touch `templates/`.** It deletes `src/components/<name>/` and the `twilight-bundle.json` entry, and stops there — so a component that also appears in a template file leaves an orphan behind, and `tw-preview` hard-fails on it later. Every removal so far hit this: `scroll-top` and `table-list` were in `templates/starter-template.json` and had to be pulled out by hand, and when the last six demo components went, that template — which held nothing else — was deleted outright along with its `templates[]` entry. Delete the stale `dist/<name>.js` too; the build does not prune it.

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

### Section spacing is padding, never margin

Three reasons, in order of how badly each bites:

1. **Every section paints its own background.** A margin puts the gap *outside* the paint, so it shows the merchant's theme colour — which would put a stripe of foreign colour at every boundary and undo the shared `#f5f5f5` page base. Padding keeps the gap inside the section.
2. **Vertical margins collapse.** 64px below + 40px above resolves to 64px, not 104px, so roughly half of any merchant's settings would silently do nothing and no field description could explain it. Padding never collapses.
3. **Salla wraps components in its own page containers**, so a margin can land outside a wrapper with its own background or `overflow`. Padding is local to the section element the component already writes its inline style to.

Plus a bundle-specific one: `gallery`'s bleeding strip, `faq`'s side element and `ingredients`' orbit all sit inside `overflow: clip visible`, where padding gives them room and a margin gives them none.

⚠️ **The visible gap between two stacked sections is the first one's `space_bottom` plus the second one's `space_top`.** That is why each edge is its own field — a merchant zeroes one side to pull two sections flush. The doubling is not new; it existed with the hard-coded values (≈8rem between sections, not 4rem).

Two traps when wiring a new section into it:

- **Find the real section rule, not the first `padding:` in the file.** `metrics` was already variable-driven (`padding: var(--m-pad-y) var(--m-pad-x)`), so grepping for a literal `clamp()` landed on `.m-card` instead — which silently moved the *card's* padding onto the section tiers. Confirm the rule you edit is the element that receives the component's inline `style`.
- **The desktop override must name the same selector as the base rule.** `collection`'s section is `.col-section`, not `.col`; a mismatched selector fails silently, leaving the mobile value at every width.

### A comparison table that is an actual `<table>`

`comparison` is a feature column plus two compared columns — ours and everyone
else's — with a check or a cross in each cell. Four decisions are worth keeping:

- **It is a real `<table>`, not a grid.** The alternative needed row/column
  semantics bolted back on through ARIA and column widths negotiated by hand;
  a table gives both for free and mirrors itself in RTL with no work. The
  feature cell is a `<th scope="row">`, the column heads are `<th scope="col">`,
  and every rule that could take a side uses a logical property, so nothing is
  flipped by hand. Width negotiation is the classic trick: `width: 100%` on the
  feature column, `min-width` on the other two.
- **The highlighted column is painted with inset box-shadows, never borders.**
  A border on a table cell is arbitrated against its neighbour's and loses half
  the time, which leaves gaps in the column outline; an inset shadow is drawn
  inside the cell's own box, so the outline runs unbroken from the header down
  to the last row. Only the first and last cells add the rounded corners.
- **The entrance transform rides an inner `<span>`, never the row or the cell.**
  A transform on a `<tr>` or `<td>` is the one place engines still disagree, and
  the column tint and stripes painted underneath must not fade with the text.
  Every cell therefore wraps its content in `.cmp-in`, which carries both the
  opacity and the `--i`-staggered delay.
- **A written value beats the glyph, with no mode switch to reach it.** Each row
  has optional `us_text` / `others_text`; non-empty, they replace the check or
  cross, so a mostly yes/no table can carry the occasional measured row
  («سنتان» vs «٣ أشهر») without a dropdown deciding which kind of table this is.
  Empty, the mark comes back. Same reasoning as `use-cases`' `text_position`: add
  the field that answers the question directly rather than gating one branch on
  another branch's stale value.

⚠️ **The feature column is the only one with `width: 100%`, so it absorbs
whatever the other two leave — which makes the compared columns' `min-width` the
number that decides how hard the Arabic feature text wraps on a phone.** That
floor is `--cmp-colw`: **58 px mobile, 108 px desktop**, declared on `.cmp` and
swapped in the media query.

**It is deliberately NOT a merchant field, and should not become one.** It was
one briefly — a `columns_width_mobile` / `columns_width_desktop` tier pair — and
the field was cut on the bundle owner's instruction: it asked the merchant to
solve a layout problem that has one right answer, which is the component's job,
not theirs. `table_max_width` («أقصى عرض للجدول») was cut for the same reason and
is now the fixed `--cmp-max: 880px` on `:host`, which the header, the card and
the footnote all measure against.

The lesson generalises past this section: *"every visual decision a merchant
might want to change becomes a field"* means decisions of **taste** — colours,
copy, which glyph, how much air — not consequences of the layout. A field whose
right answer is determined by the component's own geometry is a defect the
merchant is being asked to work around. When a default is wrong, fix the
default. The two guards in the render suite (`no column-width variable is
emitted`, `no table max-width variable is emitted`) exist so neither creeps back
in as an inline override.

Three things got the phone from a three-line row to a one-line row, measured in
Chrome via CDP at 393 px (feature text **133 px → 227 px, +71 %**; table
**28 % shorter**; every row now a single line):

1. **The logo reservation is gated on `data-logo="on"`.** The floor was
   `calc(var(--cmp-logo) + 1.5rem)` applied unconditionally, so ~116 px was held
   for a logo even when `us_logo` was empty and the column showed a text label.
   The general rule: **never reserve space for an optional element unless it is
   actually there** — emit an attribute for its presence and gate the
   reservation on it. The floor is now
   `calc(var(--cmp-logo) + var(--cmp-cell-x) * 2)`, tied to the real padding
   rather than a fixed guess that drifted out of sync.
2. **Mobile type is a tier smaller** — `DENSITY_MOBILE` fs is 0.78/0.84/0.90 rem
   (desktop untouched), `LOGO_MOBILE` is 56/72/92 px, and `.cmp-col-label` is
   sized off `--cmp-fs` so the whole table shrinks together instead of one part
   drifting.
3. **`--cmp-cell-x` is 0.5 rem on a phone.** It is worth more than it looks:
   every cell pays it twice, three times across the row, so it is six times its
   own value per row.

`title_position` (`in_table` / `above` / `hidden`) decides whether the headline
sits in the feature column's header cell — the arrangement the section is built
around, where the question and its answers share one frame — or above the table
as an ordinary section header. It carries no condition, and the subtitle always
renders above the table, so there is no gate to go stale.

⚠️ **A `boolean` inside a `collection` works.** Nothing in this bundle had used
one before `comparison`'s per-row `us` / `others` switches, and the rule about
dropdowns inside collections made it look risky. It is not the same case:
theme-raed ships `slides.without_overlay` as `type: "boolean"`, `format: "switch"`
inside its slider collection, with a plain `false` in the default row. Follow its
shape and carry **both** `selected` and `value` on the field. The dropdown crash
(`n.some is not a function`) is specific to a *dropdown* default row holding a
bare string, and does not generalise to booleans.

### Opening an answer of unknown height without JS

`faq` animates each answer by transitioning a one-row grid from `grid-template-rows: 0fr` to `1fr`, with `overflow: hidden` on the child. No JS measures anything, so an answer of any length animates, and a merchant editing the text in the panel needs no re-measure. Where the browser cannot interpolate `fr` (pre-2023 engines) the row snaps open instead — the panel still works, it just does not glide.

The part that is easy to get wrong: **a collapsed row is still in the accessibility tree.** `0fr` + `overflow: hidden` hides the answer visually but a screen reader keeps reading it, so `.faq-a` also carries `visibility: hidden` with `transition: visibility 0s linear var(--faq-dur)` — delayed on the way out so the text stays painted while the panel closes, instant on the way in. `display: none` would remove it from the tree too but kills the transition outright.

Two more notes:

- `first_open` cannot be seeded from `firstUpdated()` — Salla may inject `config` after the first render, so the default open row is seeded from `updated()` on the first cycle that actually has items, behind a `_seeded` flag that also stops the seed from fighting the visitor's clicks.
- The trigger's `aria-controls` and the panel's `id` only need to be unique **inside one shadow root**, so the item index is enough; a second instance on the page has its own root.

### تموج الحواف — a wavy section edge is a mask, not a shape laid on top

`src/shared/wave-edges.ts` cuts a section's top and/or bottom edge into a curve
(`wave_edges`: off / top / bottom / both). Adopted by `testimonials` and
`gallery`; a third section is a copy of the bundle block plus one block of CSS,
exactly like `side-element.ts`. The usual recipe for this look is an SVG divider
absolutely positioned over the edge, filled with the colour of whatever is next
to the section. This one is a **CSS mask over the section's background layer**,
and the three differences are the reason to keep it that way:

- The cut is genuinely transparent, so the wave works over any page background
  without the merchant naming a second colour, and a background photo on the
  same layer is cut by the same curve for free. A painted divider needs a colour
  before it can show anything — a field that goes wrong the moment the page
  behind it changes.
- **The mask rides a `::before` layer, never the section itself.** Masking the
  section erases everything outside its box, which would kill `gallery`'s side
  element and its edge-to-edge strip — both of which deliberately bleed out of
  `overflow: clip visible`. This was the whole reason the first cut (a mask on
  `.t-section`) had to be reworked when `gallery` adopted it.
- Because the section's own background is then free, `wave_behind_color` is
  simply that background and shows through the cut with no extra element. The
  layer is `z-index: -1` with `isolation: isolate` on the section, which puts it
  above the section's background and below every child, inside the section's own
  stacking context.

Three mask layers are unioned on the layer: the top curve, a solid
`linear-gradient(#000,#000)` filling the middle, and the bottom curve. The middle
is sized `calc(100% - top - bottom)` and offset by the top depth, so an edge that
is off contributes a zero-height layer and the middle simply covers what it
would have taken — no second rule, no `:not()` gymnastics.

One path per shape serves every viewport: it is drawn in a 1440x100 box with
`preserveAspectRatio="none"`, and the bottom edge is the same path turned 180
degrees (`rotate(180 720 50)`) rather than a second drawing to keep in sync.

⚠️ **The wave's depth is added to the section's padding, not taken out of it**
(`calc(var(--sp-top-m) + var(--wv-top))`). The curve eats into the section, so
without that the merchant's spacing tier would silently shrink by however deep
they made the wave. Both depths are `0px` on `:host`, so an un-waved section's
padding is byte-identical to what it was. Depth is a relative tier
(`HEIGHT_MOBILE` 22/34/50 px, `HEIGHT_DESKTOP` 44/68/100 px), so `inherit`
carries the mobile *tier* to the larger desktop table.

**Both adopters expose the same five fields — same ids, same labels, same
`wave_edges != "off"` gate — and a third should clone them rather than reword
them**, so a merchant configuring two of these sections reads the same words
twice. Only the `static` wrappers are namespaced per component
(`section-tst-wave` / `section-gal-wave`), and each clones its own component's
title and desktop-divider markup so it matches its neighbours' sizing.

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

## ⚠️ Inside an `<svg>`, interpolate with `svg` — never `html`

Lit parses a template by assigning it to a `<template>`'s `innerHTML`, and a
nested template is parsed **on its own**, with no memory of where it will be
inserted. So a child interpolated into an `<svg>` from an `html` template is
parsed in the **HTML** namespace: the browser builds an `HTMLUnknownElement`
named `PATH`, appends it happily, and paints **nothing**. No error, no warning —
the glyph is simply invisible, and `tsc`, the build and the demo page all pass.

```ts
// WRONG — the check mark never appears
html`<svg viewBox="0 0 24 24">${on ? html`<path d="M20 6 9 17l-5-5" />` : …}</svg>`
// RIGHT — svg`` parses its content in the SVG namespace
html`<svg viewBox="0 0 24 24">${on ? svg`<path d="M20 6 9 17l-5-5" />` : …}</svg>`
```

Only a **template boundary that opens inside the element** is affected. These
are fine and need no change:

- a complete `<svg>…</svg>` written literally in one `html` template — the HTML
  parser's foreign-content rules put its children in the SVG namespace;
- an **attribute** interpolated on a literal SVG child, `<path d=${d} />` — which
  is what `collection`'s chevrons and `testimonials`' stars do.

This shipped broken twice: `comparison`'s check/cross marks rendered as empty
cells, and `ingredients`' connector dot (`connector_dot`, default **on**) never
drew. Both were caught only by looking at the page.

⚠️ **Asserting on `tagName` does not catch it** — the element is genuinely named
`path`. `namespaceURI` is the ground truth (`http://www.w3.org/2000/svg` vs
`http://www.w3.org/1999/xhtml`); `instanceof SVGElement` also works, and is the
strongest class check jsdom can honour since it builds a generic `SVGElement`
for every SVG tag rather than `SVGPathElement`.

To sweep the bundle for the bug:

```bash
grep -rn 'html`[[:space:]]*<\(path\|circle\|rect\|line\|polyline\|polygon\|ellipse\|g \)' src/
```

## ⚠️ Conditional-field gotchas

The ported components rely heavily on `conditions` (≈49 conditional fields across the four). Three hard rules:

1. **Conditions are single-value, and the honoured operators are `=` and `!=`.** No OR, no array values, no `in`. A single `=` shows a field for exactly **one** value of the controlling field; `!=` shows it for every value *except* one, which is how a 3-way "off / one / two" control gates a whole group. To show a field for several values out of many, **duplicate it once per value**, each with its own `conditions` entry. If it's relevant for all values, give it no condition at all.

   ✅ **`!=` is verified working**, in the local form builder against `gallery.side_visual_count` (`off` → 33 fields rendered, `one` → 44, `two` → 55; the slot-1 group is gated `!= "off"` and the slot-2 group `= "two"`). An earlier version of this file claimed `!=` was ignored; it is not. Reproduce with the recipe at the end of this section rather than trusting either claim.
2. **Each duplicated copy MUST have a unique `id` — distinct `key`s are not enough.** Salla's admin form builder gates by `id`. When 2+ conditional fields share an `id`, gating silently breaks: the field renders zero times for one value and N times (stacked) for another. Name copies `bg_effect`, `bg_effect_floating`, `bg_effect_split`, … and resolve the active one in the component by reading the controlling value.
3. **`conditions` is an array but only ONE entry is honoured — there is no AND.** Two entries do not combine: a field gated `[layout=circle, ring_dot=true]` rendered while `layout` was `columns`, and one gated `[layout=columns, desktop_custom_width=true]` stayed hidden while `layout` *was* `columns` — i.e. the earlier entries are ignored, not ORed. **Give every field exactly one condition** and pick the gate that matters most. To express "A and B", gate the *controlling switch* on A and the field on the switch (`ingredients.circle_desktop_custom` is gated on `layout=circle`, and its three sliders on the switch), so the pair is unreachable from the wrong branch anyway.
4. **To express "A or B", stop asking two fields and add the one field that answers the question directly.** Duplicating per rule 1 is the fallback, not the first move — it multiplies the schema and, worse, **a hidden field keeps its stored value**, so a gate on a branch-local field fires from a branch the merchant has since left. `use-cases` hit this: copy sits on the photo when `layout=row` *or* when `layout=stack` and the stack's own text toggle says so. Gating on that stack-local toggle would have left the overlay settings showing in the row layout off a stale value. The fix was to delete the per-layout toggle and add `text_position` (`over` / `outside`) with **no** condition, shared by both layouts — one field, one honest `=` test, nothing stale. The price is that the shared field's other value has to mean the layout-appropriate thing in each branch (`outside` = beside the photo in the stack, under it in the row), which is real work in the component and a vaguer label in the panel. Worth it: the alternative leaks.

⚠️ **The panel caches the schema in `localStorage` under `form-builder::<component>`** and prefers it over the freshly generated page, so edits to `twilight-bundle.json` appear not to take effect. Clear the `form-builder::*` keys when testing a schema change. Note also that the generated `node_modules/.salla-temp/*.html` is only rebuilt when the dev server starts on a missing directory — `rm -rf node_modules/.salla-temp` and restart to pick up a `twilight-bundle.json` edit.

### How to actually test a gating rule

Every claim in this section is checkable in about a minute, and the claims here have been wrong before — check before you design around one:

```bash
rm -rf node_modules/.salla-temp && pnpm dev     # regenerate, note the port
```

Open `http://localhost:<port>/node_modules/.salla-temp/index.html`, then in the console:

```js
Object.keys(localStorage).filter(k => k.startsWith("form-builder"))
  .forEach(k => localStorage.removeItem(k));   // else you test a cached schema
openDrawer("gallery");                          // global on that page
```

The form renders inside a `<form-builder-N>` **shadow root**, so `document.querySelector` will not see it. Count the rendered fields through the shadow root and flip the controlling value:

```js
const root = document.querySelector("form-builder-3").shadowRoot;
const ids = () => [...root.querySelectorAll("label[for]")].map(l => l.getAttribute("for"));
ids().length;              // compare across values of the controlling field
ids().includes("side_image");
```

A field is present or absent from `label[for]` — that is the ground truth for whether a condition fired.

### How to measure a layout at a real phone viewport

jsdom has no layout engine, so it cannot answer "is this column too narrow" — it
will happily report widths of 0. And on Windows **Chrome clamps a headless
window to ~512 px**, so `--window-size=393,1400` silently gives you a 512 px
viewport and a layout that looks fine while the phone one does not.

The way through is CDP's `Emulation.setDeviceMetricsOverride`, which is not
clamped. Node 24 ships a `WebSocket` client, so this needs no dependencies and
no puppeteer:

```bash
chrome.exe --headless=new --disable-gpu --remote-debugging-port=9222 \
  --user-data-dir=<scratch>/cdp-profile about:blank &
# then: fetch http://127.0.0.1:9222/json/list -> page.webSocketDebuggerUrl
#       new WebSocket(...) -> Emulation.setDeviceMetricsOverride {width:393,...}
#       Page.navigate -> Runtime.evaluate (measure) -> Page.captureScreenshot
```

Serve the probe page **through the vite dev server**, not `file://`: `dist/*.js`
imports `lit` as a bare specifier (it is external in the build) and only vite
rewrites it. Importing `/src/components/<name>/index.ts` also tests the source
rather than the last build. Have the page stamp a done-marker
(`document.title = "probe-done"`) so the driver knows when to measure instead of
guessing at a timeout.

To compare against a previous geometry in the same run, push a `CSSStyleSheet`
with the old rules onto the component's `shadowRoot.adoptedStyleSheets`, measure,
then pop it — same engine, same fonts, same viewport, so the delta is real.

## Sliders — great at top level, ignored inside a collection

For a percentage that positions something (offsets, widths, opacity) prefer a slider over a number box; nudging beats typing:

```jsonc
{ "type": "number", "format": "slider", "inputType": "range",
  "minimum": -100, "maximum": 100, "step": 1, "value": 20 }
```

The panel renders it as a track with a live «القيمة: N» readout, RTL-correct (the handle runs right-to-left). See `gallery.side_x` / `side_y` / `side_width` / `side_opacity`.

**But `format: "slider"` only works on a top-level field.** Inside a `collection`'s `fields` the form builder ignores it and falls back to a plain number box — no crash, just dead config. That is why `product-features.items[].top` stays `format: "integer"` even though it is exactly the same kind of value. Verified side by side in the local form builder.

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
