import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

/**
 * CI gate enforcing D1 (docs/01): legacy Tailwind color aliases are retired once the
 * last legacy-styled page migrates — this script is the enforcement so they can never
 * silently creep back in. Run: npm run lint:tokens
 */

const SCAN_DIRS = ["app", "components", "lib", "data"];
const SCAN_EXTENSIONS = [".ts", ".tsx", ".mjs", ".js"];
const BANNED_TOKENS = ["temple-red", "sand-yellow", "warm-gold"];

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...walk(path));
    } else if (SCAN_EXTENSIONS.some((ext) => path.endsWith(ext))) {
      files.push(path);
    }
  }
  return files;
}

/** Root-level config files (tailwind.config.ts, next.config.mjs, ...) — where the
 *  aliases themselves used to be defined — aren't inside any of SCAN_DIRS, so they'd
 *  otherwise never be checked. Root is scanned non-recursively to skip node_modules,
 *  .next, and other generated/vendored trees living alongside them. */
function rootConfigFiles(): string[] {
  return readdirSync(".")
    .filter((entry) => SCAN_EXTENSIONS.some((ext) => entry.endsWith(ext)))
    .filter((entry) => statSync(entry).isFile());
}

const findings: { file: string; line: number; token: string }[] = [];

for (const file of [...SCAN_DIRS.flatMap(walk), ...rootConfigFiles()]) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const token of BANNED_TOKENS) {
      if (line.includes(token)) {
        findings.push({ file, line: i + 1, token });
      }
    }
  });
}

if (findings.length > 0) {
  for (const f of findings) {
    console.log(`[ERROR] ${f.file}:${f.line} · banned legacy token "${f.token}"`);
  }
  console.log(
    `\n${findings.length} legacy-token reference(s) found. These aliases were removed from ` +
      "tailwind.config.ts (D1) — use magenta/turmeric/saffron instead.",
  );
  process.exit(1);
}

console.log("No legacy color tokens found.");
