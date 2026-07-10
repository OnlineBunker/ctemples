# 14 — Claude Code Operating System

> **CTemples Master Specification, file 14 of 14.** Status: **normative**. Precedence per `01_PRODUCT_NORTH_STAR.md`.
> This file governs *how the AI team works on this repo*: model roles, session protocol, git rules, verification, and how this spec itself is amended. `CLAUDE.md` is the thin session-loaded digest of this file — if they diverge, this file wins and `CLAUDE.md` gets fixed.

---

## 1. Model roles

| Model | Role | Typical work |
|---|---|---|
| **Fable / Opus** (frontier) | Principal architect | Spec authorship & amendments; contradiction audits; phase plans (Plan Mode); adversarial review design; anything requiring a product judgment |
| **Sonnet** | Implementation engineer | Executing phases P3–P11 exactly as specced; writing tests; browser verification; refactors with defined outcomes |
| **Haiku** | Mechanical executor | Recolor sweeps, content data entry, banned-phrase fixes, batch renames — tasks with zero decisions and a checkable definition of done |

**The one law:** implementation models make **zero product decisions**. If the spec doesn't answer a question, stop and escalate (§6) — an improvised decision, even a good one, is a process failure because it's invisible.

## 2. Session protocol (every implementation session)

1. **Orient:** read `PROJECT_CONTEXT.md` §Build status (only source of "what exists"), then file 13 for the active phase, then the phase's normative files listed there. Never trust memory of the codebase across sessions.
2. **Plan Mode** for any phase-sized task: explore → plan → get approval. Skip only for single-file mechanical fixes.
3. **Implement** within phase scope. Out-of-scope discoveries: record (task/note), don't fix (file 13 §5).
4. **Gate:** run the file 13 §4 sequence (checks → browser verify → adversarial review → status update → commit).
5. **Report:** outcome-first summary; failures reported verbatim, never smoothed over.

## 3. Doc governance & amendments

- **Precedence:** `docs/01–14` > `CLAUDE.md` > legacy docs (banner-marked, historical only). Within `docs/`, lower number wins; any real conflict is a defect — fix it, don't interpret around it.
- **Amendment process:** (1) identify the D-ruling or section; (2) state the change + rationale + affected files; (3) get explicit user approval (frontier model prepares it); (4) edit the spec file(s) **in the same commit** as any code that depends on the change; (5) note it in the commit message ("Amends D17…").
- **Recording rulings:** when the user makes a product call in chat, the session must write it into the relevant spec file before implementing it. Unwritten decisions don't exist.
- **Status vs spec:** `PROJECT_CONTEXT.md` §Build status is updated every phase boundary (and at descopes) — it records *what is*, never *what should be*.

## 4. Git rules (learned the hard way — non-negotiable)

1. **Identity:** before any commit, `git config user.name` / `user.email` must resolve to the user's configured identity (`OnlineBunker <yash.dhankhar06@gmail.com>`). **Never** override with `-c user.*`, never invent an identity.
2. **No `Co-Authored-By: Claude` trailers.** Ever, on this repo.
3. **No force push.** History rewrites only with explicit, per-incident user approval.
4. Multiple `gh` accounts exist on this machine — before pushing, confirm the active account (`gh auth status`); switch with `gh auth switch --user OnlineBunker` + `gh auth setup-git` if needed.
5. Direct pushes to `master` are the established mode for this repo (user-approved); branch + PR only if the user asks.
6. Commit messages: what + why, spec references (phase, D-rulings), verification evidence. One phase = one commit where practical.

## 5. Adversarial review (the quality mechanism)

After implementing any phase (or any change touching ≥3 files): run a multi-reviewer pass — 3–4 independent reviewers over the diff, each with one lens (correctness/React, a11y, spec-adherence incl. token/URL contracts, locked-decision compliance), each finding then **adversarially verified** by a separate skeptic before it's accepted. Confirmed findings are fixed before commit; the review outcome is summarized in the commit/report. (Phase 2 ran exactly this and caught 6 real defects — it's the house method, not optional polish.)

## 6. Escalation

Stop and ask the user (with a concrete recommendation) when: a needed decision is missing from the spec; two spec files genuinely conflict; a gate can't pass without descoping; anything touches history rewrites, deletions of user content, or external publication. Otherwise: don't ask, execute.

## 7. Standing prohibitions (grep-able list)

- `npm audit fix --force` (breaks Next).
- New runtime dependencies (Radix Popover/Dialog is the only sanctioned addition — D19).
- WebGL/three.js in UI (D3). Autoplay anything (08 §6). Ambient animation loops.
- Hardcoded dataset counts in code or copy. Fabricated statistics (D12).
- Fixing legacy-styled pages outside their owning phase.
- Dynamic Tailwind class construction for data-driven colors (03 §10).
- Editing generated artifacts by hand (`lib/india-geo.ts`, `data/popularity.json` — rerun their scripts).

## 8. Tooling notes

- Gates: `npm run typecheck` · `test` (vitest, `lib/**` only) · `lint` · `build`. Dev: `npm run dev` (kill stray `next dev` processes before production builds — they corrupt `.next`).
- Browser verification uses the preview tooling (desktop + 375px minimum); a11y spot-checks with keyboard-only passes; contrast claims verified by computation, not eyeball.
- Vitest picks up `lib/**/*.test.ts` only — pure logic gets tests; components get browser verification.

## 9. Acceptance criteria
- A fresh Sonnet session, given only this repo, reaches the right context (build status → active phase → normative files) in ≤3 file reads and starts correct work without product questions.
- `CLAUDE.md` contains no product/design decisions — only operations + pointers.
- Every commit on `master` from AI sessions satisfies §4 (spot-checkable via `git log --format='%an %ae'` and trailer grep).

## 10. Anti-patterns
- "The spec is probably outdated, I'll do the sensible thing" — the spec is amended, not bypassed.
- Asking the user questions the spec already answers (read first).
- Marking work complete without gate evidence; describing failing states optimistically.
- Letting `CLAUDE.md`, `PROJECT_CONTEXT`, or this spec drift from reality rather than updating them in the same commit as the change.

## 11. What Sonnet does next
Adopt this protocol from the next session onward. First action of that session: §2.1 orientation, then P3 per file 13 §8.
