/**
 * Home — Phase 00 placeholder shell.
 * Renders the ported Header + Footer and exercises both styling paths:
 * raw brand var() references (inline style) and Tailwind theme utilities
 * (bg-blue-600, bg-sidebar). The real homepage is ported from index.html
 * during Phase 01.
 */
export default function Home() {
  return (
    <main style={{ background: 'var(--bg-marketing-paper)', minHeight: '60vh' }}>
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
        <p className="t-eyebrow" style={{ marginBottom: 12 }}>
          Rem Assist
        </p>
        <h1 className="t-h1" style={{ maxWidth: '18ch' }}>
          Remote teams that match your culture
        </h1>
        <p className="t-body-lg" style={{ maxWidth: '46ch', marginTop: 16 }}>
          Results-driven, efficient, on target, thoroughly excellent. Every time.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <a
            href="https://calendly.com/j-zemene-remassistance/new-meeting"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-blue-700"
          >
            Book a Call
          </a>
          <a
            href="#"
            aria-disabled="true"
            className="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-[15px] font-semibold no-underline"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-primary)' }}
          >
            Get a quote
          </a>
        </div>

        {/* Token smoke tests — raw var() plumbing vs. Tailwind utilities */}
        <div className="mt-10 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
          <div className="rounded-md p-4 text-white" style={{ background: 'var(--navy-800)' }}>
            bg via var(--navy-800)
          </div>
          <div className="rounded-md bg-sidebar p-4 text-white">bg via `bg-sidebar` utility</div>
          <div className="rounded-md p-4" style={{ background: 'var(--paper)', boxShadow: 'var(--shadow-sm)' }}>
            card + shadow-sm (var)
          </div>
        </div>
      </section>
    </main>
  );
}