import Link from 'next/link';
import styles from './HomeSections.module.css';

/**
 * ServiceGrid — "We extend your team!" section (index.html, Phase 02).
 * Server component: the three flagship service cards link to the ported
 * /services/* routes.
 */
const BOOK = 'https://calendly.com/j-zemene-remassistance/new-meeting';

const SERVICES = [
  {
    href: '/services/sales-and-revenue',
    num: '01',
    title: 'Sales & Revenue',
    desc: 'Outbound SDRs, list builders and data researchers, cold callers, appointment setters, and email campaign managers — the full pipeline engine from ICP to booked meeting.',
    faces: ['/images/Agents/sdr-1.jpg', '/images/Agents/sdr-2.jpg', '/images/Agents/sdr-3.jpg'],
    checks: ['Meetings booked, not dials', 'Email · Phone · LinkedIn', 'Working in your CRM'],
    icon: <><path d="m4 17 5-5 4 3 6-7" /><path d="M15 8h4v4" /></>,
  },
  {
    href: '/services/customer-service-agents',
    num: '02',
    title: 'Customer Experience',
    desc: 'Inbound voice, chat and email, product-trained technical support that resolves instead of escalating, and order and fulfilment cover — your front line staffed across your hours.',
    faces: ['/images/Agents/cs-1.jpg', '/images/Agents/cs-2.jpg', '/images/Agents/cs-3.jpg'],
    checks: ['24/7 coverage', 'Any helpdesk', 'QA on every ticket'],
    icon: <><path d="M4 17v-5a8 8 0 0 1 16 0v5" /><path d="M20 18a2 2 0 0 1-2 2h-.8a1.8 1.8 0 0 1-1.8-1.8v-2.4A1.8 1.8 0 0 1 17.2 14H20zM4 18a2 2 0 0 0 2 2h.8a1.8 1.8 0 0 0 1.8-1.8v-2.4A1.8 1.8 0 0 0 6.8 14H4z" /></>,
  },
  {
    href: '/services/finance-and-accounting',
    num: '03',
    title: 'Finance & Accounting',
    desc: 'Bookkeepers, accounts payable and receivable clerks, and payroll specialists — daily reconciliation, month-end close, and books that stay audit-ready.',
    faces: ['/images/Agents/gtm-1.jpg', '/images/Agents/gtm-2.jpg', '/images/Agents/gtm-3.jpg'],
    checks: ['Month-end close', 'AP & AR', 'ISO-audited controls'],
    icon: <><path d="M3 10h18M6 6h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" /><path d="M9 15h4" /></>,
  },
];

const CHECK_ICON =
  <><circle cx="12" cy="12" r="9" /><path d="m8.4 12.2 2.4 2.4 4.8-5" /></>;

export default function ServiceGrid() {
  return (
    <section className={styles.section} style={{ background: 'var(--blue-100)' }}>
      <div className={styles.wrap}>
        <span className={styles.eyebrow}>Our Services</span>
        <div className={styles.head}>
          <h2 className={styles.title}>We extend <span>your team!</span></h2>
          <div className={styles.aside}>
            <p className={styles.desc}>
              Plug into expert teams that keep your operations running, your customers happy, and
              your goals within reach.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
              <a href={BOOK} target="_blank" rel="noopener" className={styles.cta}>Book a Call</a>
              <Link href="/pricing" className={styles.cta}
                style={{ background: '#fff', color: 'var(--brand-blue)', border: '1px solid rgba(81,141,224,0.45)' }}>
                See pricing
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.teamList}>
          {SERVICES.map((s) => (
            <Link key={s.num} href={s.href} className={styles.teamCard}>
              <span className={styles.teamTile}><svg viewBox="0 0 24 24" aria-hidden="true">{s.icon}</svg></span>
              <span className={styles.teamRail} />
              <span className={styles.teamNum}>{s.num}</span>
              <span className={styles.teamRail} />
              <span className={styles.teamFaces}>
                {s.faces.map((f) => (
                  <span className={styles.teamFace} key={f}><img src={f} alt="" loading="lazy" decoding="async" /></span>
                ))}
              </span>
              <span>
                <span className={styles.teamTitle}>{s.title}</span>
                <span className={styles.teamDesc}>{s.desc}</span>
                <span className={styles.teamChecks}>
                  {s.checks.map((c) => (
                    <span className={styles.teamCheck} key={c}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">{CHECK_ICON}</svg>{c}
                    </span>
                  ))}
                </span>
              </span>
              <span className={styles.teamGo}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></span>
            </Link>
          ))}
        </div>

        <div className={styles.ctaRow}>
          <Link href="/services/extra-services" className={styles.cta}>
            More services
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}