import type { Metadata } from 'next';
import HomeHero from '@/components/home/HomeHero';
import HomeMarquee from '@/components/home/HomeMarquee';
import StepsSection from '@/components/home/StepsSection';
import ServiceGrid from '@/components/home/ServiceGrid';
import TiersSection from '@/components/home/TiersSection';

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
      <StepsSection />
      <ServiceGrid />
      <TiersSection />
    </main>
  );
}