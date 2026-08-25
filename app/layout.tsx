import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Sora } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AskRemAssist from '@/components/widgets/AskRemAssist';
import '@/styles/globals.css';

/**
 * Sora is self-hosted + preloaded via next/font (no render-blocking Google
 * Fonts <link>). The variable aligns with the --font-sora name referenced by
 * the @theme font families in styles/globals.css.
 */
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Rem Assist — Remote Teams',
    template: '%s | Rem Assist',
  },
  description:
    'Remote teams that match your culture — results-driven, efficient, on target, thoroughly excellent.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sora.variable}>
      <body>
        <Header />
        {children}
        <Footer />
        <AskRemAssist />
      </body>
    </html>
  );
}