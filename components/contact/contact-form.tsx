"use client";

import { useState } from "react";
import { Info, CheckCircle2 } from "lucide-react";

const FIELD =
  "w-full rounded-xl border border-line-strong bg-canvas px-4 py-3 text-ink placeholder:text-ink-subtle focus:border-temple-red focus-visible:outline-none";

const LABEL = "mb-2 block font-mono text-[0.66rem] uppercase tracking-label text-ink-muted";

// Transitional inline submit; the shared Button primitive is rebuilt in Phase 2.
const submitButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-temple-red px-6 py-3 font-mono text-[0.72rem] uppercase tracking-label text-canvas transition-colors hover:bg-temple-red-deep";

const PARTNERSHIP_TYPES = [
  "Temple trust / management",
  "Tourism board",
  "Travel operator",
  "Content / photography",
  "Something else",
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Intentionally not wired to any backend — this is a frontend prototype.
    // We surface an honest notice rather than faking a successful send.
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-card border border-line bg-canvas-soft p-6 md:p-8"
    >
      <p
        role="note"
        className="mb-8 flex items-start gap-3 rounded-xl border border-sand-yellow-deep/30 bg-sand-yellow-soft p-4 text-sm leading-relaxed text-ink/80"
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-temple-red" aria-hidden />
        This is a frontend prototype. The form isn&apos;t connected to a backend yet, so submitting
        it won&apos;t send anything anywhere — it&apos;s here to show the flow.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="name" className={LABEL}>
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
            placeholder="Priya Menon"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="organisation" className={LABEL}>
            Organisation
          </label>
          <input id="organisation" name="organisation" type="text" autoComplete="organization" className={FIELD} placeholder="e.g. Madurai Temple Trust" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={FIELD} placeholder="you@example.org" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="type" className={LABEL}>
            Partnership type
          </label>
          <select id="type" name="type" defaultValue={PARTNERSHIP_TYPES[0]} className={FIELD}>
            {PARTNERSHIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={LABEL}>
            Message
          </label>
          <textarea id="message" name="message" required rows={5} className={FIELD} placeholder="Tell us about the temples or collection you'd like to bring to CTemples." />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="submit" className={submitButton}>
          Send message
        </button>
        <span className="font-mono text-[0.62rem] uppercase tracking-label text-ink-subtle">
          Prototype · not connected
        </span>
      </div>

      {submitted ? (
        <p
          role="status"
          className="mt-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success-soft p-4 text-sm leading-relaxed text-ink/85"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
          <span>
            Thanks{name ? `, ${name}` : ""} — but a heads-up: this prototype isn&apos;t wired to a
            backend, so <strong className="text-ink">nothing was actually sent</strong>. Connecting
            this to a real inbox is a later step.
          </span>
        </p>
      ) : null}
    </form>
  );
}
