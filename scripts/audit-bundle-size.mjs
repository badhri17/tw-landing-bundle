import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import process from "node:process";

/**
 * Salla caps a public bundle's `theme.zip` at 1 MB (2 MB for a private one),
 * and the zip is built from what is COMMITTED — the rejection that introduced
 * this script quoted 6.17 MB, which is `git archive HEAD` to the byte. So the
 * only lever is what git tracks: `.gitignore`, not the Vite build.
 *
 * This estimates the released size by deflating every tracked file the way a
 * zip would, and breaks the total down by top-level path so the offender is
 * obvious. It is an estimate — zip adds ~100 bytes of header per entry — but
 * it landed within 0.5 % of the size Salla reported.
 */

const LIMIT_BYTES = 1024 * 1024;
const KB = 1024;

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const groups = new Map();
let total = 0;

for (const file of tracked) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  const compressed = zlib.deflateRawSync(fs.readFileSync(file), { level: 9 })
    .length;
  total += compressed;

  const parts = file.split(path.posix.sep);
  const group = parts.length > 1 ? `${parts[0]}/${parts[1] ?? ""}` : file;
  groups.set(group, (groups.get(group) || 0) + compressed);
}

const rows = [...groups].sort((a, b) => b[1] - a[1]);
for (const [group, bytes] of rows) {
  if (bytes < 2 * KB) continue;
  console.log(`${(bytes / KB).toFixed(1).padStart(9)} KB  ${group}`);
}

const over = total - LIMIT_BYTES;
console.log(
  `\n${(total / KB).toFixed(1)} KB estimated theme.zip across ${tracked.length} tracked files (public limit ${LIMIT_BYTES / KB} KB).`,
);

if (over > 0) {
  console.error(
    `Over the public-bundle limit by ${(over / KB).toFixed(1)} KB. Media belongs on a CDN, not in the repository — see "Bundle size" in CLAUDE.md.`,
  );
  process.exitCode = 1;
} else {
  console.log(`${(-over / KB).toFixed(1)} KB of headroom.`);
}
