import { temples } from "../data/temples";
import { runAntiSlopChecks, type ProseRecord } from "../lib/anti-slop";

/**
 * CI gate over prose (docs/09 §7, D15). Run: npm run lint:content
 * Exits non-zero only on error-level findings; warn-level findings print but don't
 * fail the build (docs/09 §7: opener-cap and voice-contract are "warn→error at scale").
 */

const PROSE_FIELDS = [
  "tagline",
  "overview",
  "whyVisit",
  "history",
  "legendsAndMythology",
  "architecture",
  "spiritualSignificance",
] as const;

const records: ProseRecord[] = temples.map((t) => ({
  id: t.id,
  fields: Object.fromEntries(PROSE_FIELDS.map((f) => [f, (t[f] as string | undefined) ?? ""])),
}));

const findings = runAntiSlopChecks(records);
const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warn");

for (const f of [...errors, ...warnings]) {
  const tag = f.severity === "error" ? "ERROR" : "WARN ";
  console.log(`[${tag}] ${f.templeId} · ${f.field} · ${f.rule}: ${f.detail}`);
}

console.log(
  `\n${records.length} records checked — ${errors.length} error(s), ${warnings.length} warning(s).`,
);

if (errors.length > 0) {
  process.exit(1);
}
