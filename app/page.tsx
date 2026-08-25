import type { Metadata } from 'next';
import HomeHero from '@/components/home/HomeHero';
import HomeMarquee from '@/components/home/HomeMarquee';

export const metadata: Metadata = {
  title: 'Remote Teams | Rem Assist',
  description:
    'Remote teams that match your culture — results-driven, efficient, on target, thoroughly excellent. Expert teams built around your goals.',
};

export default function Home() {
  return (
    <main>
      <HomeHero />
      <HomeMarquee />
      <section style={{ background: 'var(--bg-marketing-paper)', color: 'var(--ink-900)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'var(--brand-navy)' }}>
            Teams that match your culture
          </h2>
          <p style={{ maxWidth: '52ch', margin: '14px auto 0', fontSize: 17, lineHeight: 1.7, color: 'var(--ink-600)' }}>
            Dedicated remote hires trained on your stack — never a shared pool.
          </p>
          {/* Trust bar + service grid are ported in a later slice; this stub keeps
              the page building while the hero ships. */}
        </div>
      </section>
    </main>
  );
}