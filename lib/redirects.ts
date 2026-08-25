/**
 * Redirect map — §11.3 of MIGRATION-PLAN.md.
 *
 * This is the single source of truth for legacy → new path mappings. It is
 * consumed by the Next.js redirects() config (next.config.ts) and asserted in
 * CI (§13.3): every `source` must resolve to a live destination, and no entry
 * may point at a page that 404s.
 *
 * Rules (from §11.3):
 * - `permanent: true` (301). These stay indefinitely — external links and
 *   search results point at them, and there is no expiry date on that.
 * - If any legacy URL contains spaces, match the **encoded** form (`%20`).
 * - Where a legacy page has no equivalent, redirect to the nearest relevant
 *   parent — never blanket-everything to `/`, which reads as a soft-404.
 * - The inventory of legacy URLs is docs/url-audit.md (§3.1).
 *
 * Phase 00: scaffold only — empty. Phase 05 fills the entries from the audit.
 */

export interface Redirect {
  /** Legacy path, starting with `/`. Encoded form (%20) if it has spaces. */
  source: string;
  /** Live destination path within this app (or full URL with protocol). */
  destination: string;
  /** true for 301 (permanent), false for 302 (temporary). */
  permanent: boolean;
}

export const redirects: Redirect[] = [];