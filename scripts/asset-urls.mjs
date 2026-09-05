import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Moves the bundle's media references between the local `/assets/…` spelling
 * and absolute CDN URLs.
 *
 * Salla's 1 MB cap applies to the committed repository (see
 * scripts/audit-bundle-size.mjs), so a bundle cannot carry its own imagery.
 * The sibling tw-growth-kit never did: every image there is an absolute CDN
 * URL and it zips to 364 KB. This script performs that migration for the
 * ~120 `/assets/…` references spread across twilight-bundle.json and
 * templates/*.json, and reverses it if a local round-trip is ever needed.
 *
 *   node scripts/asset-urls.mjs --list
 *       Print every distinct asset path the bundle references, with the local
 *       file's size, and write assets-map.json as a skeleton to fill in.
 *
 *   node scripts/asset-urls.mjs --base https://cdn.example.com/landing
 *       Rewrite /assets/demo/hero/x.webp → <base>/demo/hero/x.webp. Use when
 *       the host preserves the directory layout (an S3/OSS prefix, a static
 *       site, the preview snapshot store).
 *
 *   node scripts/asset-urls.mjs --map assets-map.json
 *       Rewrite from an explicit {"/assets/…": "https://…"} mapping. Use when
 *       the host mints an opaque URL per file, as the Salla admin image picker
 *       does.
 *
 *   node scripts/asset-urls.mjs --to-local --base https://cdn.example.com/landing
 *       The inverse, for editing against local files again.
 *
 * `assetsUrlStyle: "hashed"` switches the URL shape from `<base>/<relPath>` to
 * `<base>/<sha256-of-file>/<relPath>`, which is how the tw-preview snapshot
 * store addresses its objects — verified against the two thumbnail URLs
 * tw-preview itself wrote back into twilight-bundle.json, whose hashes are the
 * sha256 of those files byte for byte. In that mode the hash is read from
 * `dist/assets/<relPath>`, not `public/assets/`, because dist is what
 * tw-preview uploads: a stale dist would otherwise mint a URL for an object
 * that was never pushed.
 *
 * `assetsBaseUrl` in package.json supplies --base when it is not passed, which
 * is what makes `pnpm assets:local` / `pnpm assets:remote` a two-command
 * authoring loop: work in the /assets/… spelling, flip to URLs before
 * committing. The committed form is always the remote one — `pnpm audit:size`
 * fails if the media is tracked again.
 *
 * A template's `thumbnail` is a bundle-root relative path
 * (`templates-thumbs/<name>.<ext>`), not an `/assets/…` reference, and
 * tw-preview rewrites it on its own — so it is only touched when a mapping
 * names it explicitly.
 */

const TARGETS = [
  "twilight-bundle.json",
  ...(fs.existsSync("templates")
    ? fs
        .readdirSync("templates")
        .filter((name) => name.endsWith(".json"))
        .map((name) => path.join("templates", name))
    : []),
];

const ASSET_REF = /\/assets\/[A-Za-z0-9_+\-./]+\.[A-Za-z0-9]+/g;
const MAP_FILE = "assets-map.json";

const args = process.argv.slice(2);
const flag = (name) => {
  const at = args.indexOf(name);
  return at === -1 ? null : (args[at + 1] ?? "");
};
const has = (name) => args.includes(name);

const configuredBase = (() => {
  try {
    return JSON.parse(fs.readFileSync("package.json", "utf8")).assetsBaseUrl || "";
  } catch {
    return "";
  }
})();
const base = (flag("--base") ?? configuredBase).replace(/\/+$/, "");
const hashed =
  has("--hashed") ||
  (() => {
    try {
      return (
        JSON.parse(fs.readFileSync("package.json", "utf8")).assetsUrlStyle ===
        "hashed"
      );
    } catch {
      return false;
    }
  })();

/**
 * sha256 of the copy tw-preview would upload. dist/assets is the source of
 * truth for the hash; public/assets only becomes it after a build.
 */
function uploadedHash(relPath) {
  const fromDist = path.join("dist", "assets", relPath);
  const fromRoot = relPath.startsWith("templates-thumbs/") ? relPath : null;
  const file = fs.existsSync(fromDist)
    ? fromDist
    : fromRoot && fs.existsSync(fromRoot)
      ? fromRoot
      : null;
  if (!file) {
    throw new Error(
      `${relPath} is not in dist/assets — run \`pnpm build\` then \`pnpm exec tw-preview\` before generating hashed URLs.`,
    );
  }
  const source = path.join("public", "assets", relPath);
  if (
    fs.existsSync(source) &&
    !fs.readFileSync(source).equals(fs.readFileSync(file))
  ) {
    throw new Error(
      `${relPath} differs between public/assets and dist/assets — run \`pnpm build\` so the hash matches what tw-preview uploads.`,
    );
  }
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
const mapPath = flag("--map");
const toLocal = has("--to-local");

function referencedPaths() {
  const found = new Set();
  for (const file of TARGETS) {
    for (const ref of fs.readFileSync(file, "utf8").match(ASSET_REF) || []) {
      found.add(ref);
    }
  }
  return [...found].sort();
}

if (has("--list")) {
  const refs = referencedPaths();
  let missing = 0;
  let bytes = 0;
  const skeleton = {};
  for (const ref of refs) {
    const local = path.join("public", ref.replace(/^\//, ""));
    const exists = fs.existsSync(local);
    const size = exists ? fs.statSync(local).size : 0;
    if (!exists) missing++;
    bytes += size;
    skeleton[ref] = "";
    console.log(
      `${exists ? `${(size / 1024).toFixed(0).padStart(6)} KB` : "   MISSING"}  ${ref}`,
    );
  }
  const manifest = JSON.parse(fs.readFileSync("twilight-bundle.json", "utf8"));
  for (const entry of manifest.templates || []) {
    const name = (entry.path || "").replace(/^templates\./, "");
    for (const ext of ["png", "jpg", "jpeg", "webp"]) {
      const thumb = `templates-thumbs/${name}.${ext}`;
      if (!fs.existsSync(thumb)) continue;
      const size = fs.statSync(thumb).size;
      bytes += size;
      skeleton[thumb] = "";
      console.log(`${(size / 1024).toFixed(0).padStart(6)} KB  ${thumb}`);
    }
  }
  fs.writeFileSync(MAP_FILE, JSON.stringify(skeleton, null, 2) + "\n");
  console.log(
    `\n${refs.length} asset reference(s), ${(bytes / 1024 / 1024).toFixed(2)} MB on disk${missing ? `, ${missing} with no local file` : ""}.`,
  );
  console.log(
    `Skeleton written to ${MAP_FILE} — fill in each URL, then re-run with --map ${MAP_FILE}.`,
  );
  process.exit(0);
}

if (!base && !mapPath) {
  console.error(
    'No base URL. Pass --base <url> or --map <file.json>, or set "assetsBaseUrl" in package.json (add --to-local to reverse). --list writes the map skeleton.',
  );
  process.exit(1);
}

const mapping = mapPath ? JSON.parse(fs.readFileSync(mapPath, "utf8")) : null;
if (mapping && !toLocal) {
  const blank = Object.entries(mapping).filter(([, url]) => !url);
  if (blank.length) {
    console.error(
      `${mapPath} still has ${blank.length} empty URL(s): ${blank
        .slice(0, 3)
        .map(([key]) => key)
        .join(", ")}${blank.length > 3 ? ", …" : ""}`,
    );
    process.exit(1);
  }
}

/** "/assets/demo/x.png" → the absolute URL it should become, or null. */
function toRemote(ref) {
  if (mapping) return mapping[ref] || null;
  const relPath = ref.replace(/^\/assets\//, "");
  return hashed
    ? `${base}/${uploadedHash(relPath)}/${relPath}`
    : `${base}/${relPath}`;
}

let rewritten = 0;
for (const file of TARGETS) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  if (toLocal) {
    if (mapping) {
      for (const [ref, url] of Object.entries(mapping)) {
        if (url) after = after.split(url).join(ref);
      }
    } else {
      const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      after = after.replace(
        new RegExp(
          hashed
            ? `${escaped}/[0-9a-f]{64}(/[A-Za-z0-9_+\\-./]+)`
            : `${escaped}(/[A-Za-z0-9_+\\-./]+)`,
          "g",
        ),
        (_, rest) =>
          rest.startsWith("/templates-thumbs/") ? rest.slice(1) : `/assets${rest}`,
      );
    }
  } else {
    after = after.replace(ASSET_REF, (ref) => toRemote(ref) ?? ref);
  }

  if (after === before) continue;
  fs.writeFileSync(file, after);
  rewritten++;
  console.log(`rewrote ${file}`);
}

if (!toLocal) {
  // Rewritten as text, never via JSON.parse + stringify: twilight-bundle.json
  // is 4-space indented and re-serializing it churns all 15k lines.
  const file = "twilight-bundle.json";
  const raw = fs.readFileSync(file, "utf8");
  let next = raw;
  for (const entry of JSON.parse(raw).templates || []) {
    const thumb = entry.thumbnail;
    if (typeof thumb !== "string" || !thumb.startsWith("templates-thumbs/")) {
      continue;
    }
    const url = mapping
      ? mapping[thumb]
      : hashed
        ? `${base}/${uploadedHash(thumb)}/${thumb}`
        : `${base}/${thumb}`;
    if (!url) continue;
    next = next.split(`"${thumb}"`).join(`"${url}"`);
  }
  if (next !== raw) {
    fs.writeFileSync(file, next);
    console.log("rewrote template thumbnails in twilight-bundle.json");
  }
}

console.log(
  rewritten === 0
    ? "No references changed."
    : `Done — ${rewritten} file(s) rewritten. Re-run: node scripts/audit-bundle-size.mjs`,
);
