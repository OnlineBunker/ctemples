/**
 * Interim notice shown when `?view=map` is requested (docs/05 §6 — the map is Phase 4).
 * A handful of existing links (the hero's "Explore by region" CTA, the state strip's
 * "See all states" tile — the two sanctioned map deep-links, docs/04 §2/§10) already
 * point at `?view=map`; rather than 404 or blank, list content still renders in full
 * below this notice so nothing breaks while the map itself is unbuilt.
 */
export function MapModeNotice() {
  return (
    <div
      role="status"
      className="mt-6 rounded-card border border-dashed border-line-strong bg-turmeric-soft px-5 py-4 text-sm text-plum"
    >
      Map view is on its way — browsing the list for now.
    </div>
  );
}
