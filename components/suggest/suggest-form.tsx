"use client";

import { useState } from "react";
import { Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FIELD =
  "w-full rounded-xl border border-line-strong bg-canvas px-4 py-3 text-ink placeholder:text-ink-muted focus:border-magenta focus-visible:outline-none";

const LABEL = "mb-2 block font-mono text-[0.66rem] uppercase tracking-label text-ink-muted";


export function SuggestForm({ defaultLocation = "" }: { defaultLocation?: string }) {
  const [templeName, setTempleName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Intentionally not wired to any backend — this is a frontend prototype (docs/02 §1.1:
    // forms never submit anywhere). We surface an honest notice rather than faking a send.
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
        className="mb-8 flex items-start gap-3 rounded-xl border border-turmeric-deep/30 bg-turmeric-soft p-4 text-sm leading-relaxed text-ink/80"
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-magenta" aria-hidden />
        This is a frontend prototype. The form isn&apos;t connected to a backend yet, so submitting
        it won&apos;t send anything anywhere — it&apos;s here to show the flow.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="temple-name" className={LABEL}>
            Temple name
          </label>
          <input
            id="temple-name"
            name="temple-name"
            type="text"
            required
            value={templeName}
            onChange={(e) => setTempleName(e.target.value)}
            className={FIELD}
            placeholder="e.g. Ramanathaswamy Temple"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="location" className={LABEL}>
            City / State
          </label>
          {/* Prefilled when the visitor arrived from a state with nothing documented yet, so
              they don't retype the place they just came from. `key` forces React to adopt a new
              default if the prop changes between renders (an uncontrolled input otherwise keeps
              its first value forever). */}
          <input
            key={defaultLocation}
            id="location"
            name="location"
            type="text"
            required
            defaultValue={defaultLocation}
            className={FIELD}
            placeholder="e.g. Rameswaram, Tamil Nadu"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="email" className={LABEL}>
            Your email <span className="normal-case text-ink-muted">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={FIELD}
            placeholder="you@example.org"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="why" className={LABEL}>
            Why does it belong here?
          </label>
          <textarea
            id="why"
            name="why"
            required
            rows={5}
            className={FIELD}
            placeholder="What makes this temple worth a page — history, architecture, a festival, a view?"
          />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        {/* Shared primitive — was a hand-rolled mono pill whose comment claimed the primitive
            "is rebuilt in Phase 2"; Phase 2 shipped long ago and Button has existed since. */}
        <Button type="submit" variant="primary" size="md">
          Suggest this temple
        </Button>
        <span className="font-mono text-[0.62rem] uppercase tracking-label text-ink-muted">
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
            Thanks{templeName ? ` for the note on ${templeName}` : ""} — but a heads-up: this
            prototype isn&apos;t wired to a backend, so{" "}
            <strong className="text-ink">nothing was actually sent</strong>. Connecting this to a
            real inbox is a later step.
          </span>
        </p>
      ) : null}
    </form>
  );
}
