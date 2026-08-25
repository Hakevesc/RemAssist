'use client';

import styles from './HomeMarquee.module.css';

/**
 * HomeMarquee — the animated trust bar from index.html (Phase 02). Ported from
 * the DCLogic `heroMarqueeItems` array. Pure CSS ticker animation; no JS state.
 */
const ITEMS: { title: string; sub: string }[] = [
  { title: 'Excellent', sub: 'Based on 3 reviews' },
  { title: 'Trustpilot', sub: 'Rated Excellent' },
  { title: 'ISO 9001', sub: 'Certified' },
  { title: 'ISO 27001', sub: 'Certified' },
  { title: '2-week cycle', sub: 'Fully onboarded' },
  { title: '24/7 coverage', sub: 'any timezone' },
  { title: 'Highest ranked agents', sub: 'vetted every seat' },
  { title: 'Free consults', sub: 'always free' },
  { title: 'Our dedicated tech-stack', sub: 'proven & trusted' },
];

/** Icon glyph per item — the template engine escaped SVG, so it's keyed here. */
function itemIcon(title: string) {
  switch (title) {
    case 'Excellent':
      return (
        <span className={styles.stars} aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          ))}
        </span>
      );
    case 'Trustpilot':
      return <img src="/images/trustpilot-logo.svg" alt="Trustpilot" className={styles.trustpilot} />;
    case 'ISO 9001':
    case 'ISO 27001':
      return <img src={`/images/${title === 'ISO 9001' ? 'ISO_9001-2015' : 'ISO_27001-2022'}.svg`} alt="" className={styles.iso} />;
    case '24/7 coverage':
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>;
    case 'Free consults':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      );
    case 'Our dedicated tech-stack':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
      );
    default:
      return null;
  }
}

function Cell({ item }: { item: { title: string; sub: string } }) {
  return (
    <div className={styles.cell}>
      <span className={styles.icon}>{itemIcon(item.title)}</span>
      <span className={styles.text}>
        <span className={styles.title}>{item.title}</span>
        <span className={styles.sub}>{item.sub}</span>
      </span>
    </div>
  );
}

export default function HomeMarquee() {
  return (
    <div className={styles.bar}>
      <div className={styles.viewport}>
        <div className={styles.track}>
          <div className={styles.group}>
            {ITEMS.map((item) => <Cell key={item.title} item={item} />)}
          </div>
          <div className={styles.group} aria-hidden="true">
            {ITEMS.map((item) => <Cell key={item.title + '-dup'} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}