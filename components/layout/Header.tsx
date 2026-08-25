import Link from 'next/link';
import styles from './Header.module.css';

/**
 * Site header — ported from partials/header.html.
 * Server component: the mega-menus are pure CSS (:hover / :focus-within),
 * so no JavaScript is needed and the nav is reachable by Tab (no-JS a11y).
 *
 * Nav `href`s still point at the .dc.html artboards; they are rewritten to
 * clean slugs during Phase 01 (port) / Phase 05 (redirects).
 */
export default function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          boxSizing: 'border-box',
          margin: '0 auto',
          padding: '0 24px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          position: 'relative',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} aria-label="Rem Assist — home">
          <img src="/images/rem-logo.svg" alt="Rem Assist" style={{ height: 42, display: 'block' }} />
        </Link>

        <nav className={styles['nav-row']} aria-label="Main">
          {/* Services */}
          <span className={styles['nav-has-menu']}>
            <a className={styles['nav-link']} href="Extra Services.dc.html">
              Services
              <svg className={styles['nav-caret']} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </a>
            <span className={styles['nav-mega']}>
              <span className={styles['nav-mega-cols']}>
                <span className={styles['nav-box']}>
                  <a className={styles['nav-item']} href="Sales and Revenue.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 17 5-5 4 3 6-7" /><path d="M15 8h4v4" /></svg></span>
                    <span><b>Sales &amp; Revenue</b><small>SDRs, lead gen, cold calling, outreach</small></span>
                  </a>
                  <a className={styles['nav-item']} href="Customer Service Agents.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17v-5a8 8 0 0 1 16 0v5" /><path d="M20 18a2 2 0 0 1-2 2h-.8a1.8 1.8 0 0 1-1.8-1.8v-2.4A1.8 1.8 0 0 1 17.2 14H20zM4 18a2 2 0 0 0 2 2h.8a1.8 1.8 0 0 0 1.8-1.8v-2.4A1.8 1.8 0 0 0 6.8 14H4z" /></svg></span>
                    <span><b>Customer Experience</b><small>Voice, chat, email, technical support</small></span>
                  </a>
                  <a className={styles['nav-item']} href="Finance and Accounting.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18M6 6h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" /><path d="M9 15h4" /></svg></span>
                    <span><b>Finance &amp; Accounting</b><small>Bookkeeping, AP/AR, payroll</small></span>
                  </a>
                  <a className={styles['nav-item']} href="Virtual Back Office Team.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" /></svg></span>
                    <span><b>Back Office</b><small>Data entry, documents, claims, EAs</small></span>
                  </a>
                  <a className={styles['nav-item']} href="Managed IT.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></svg></span>
                    <span><b>Managed IT</b><small>Endpoints, help desk, security, cloud</small></span>
                  </a>
                </span>
                <span className={styles['nav-box']}>
                  <a className={styles['nav-item']} href="HR and Recruiting.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.4" /><path d="M3 20v-1.4A4.6 4.6 0 0 1 7.6 14h2.8a4.6 4.6 0 0 1 4.6 4.6V20" /><path d="M16.5 4.6a3.4 3.4 0 0 1 0 6.6M21 20v-1.4a4.6 4.6 0 0 0-3.2-4.4" /></svg></span>
                    <span><b>HR &amp; Recruiting</b><small>Sourcing, onboarding, records</small></span>
                  </a>
                  <a className={styles['nav-item']} href="Industry Specific.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></svg></span>
                    <span><b>Industry-Specific</b><small>Medical, insurance, legal, logistics</small></span>
                  </a>
                  <a className={styles['nav-item']} href="Marketing and Content.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4l12 5V5z" /><path d="M16 9a3 3 0 0 1 0 6" /></svg></span>
                    <span><b>Marketing &amp; Content</b><small>GTM pods, campaigns, content, research</small></span>
                  </a>
                  <a className={styles['nav-item']} href="AI and Automation.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.7 4.4 4.4 1.7-4.4 1.7L12 15.2l-1.7-4.4L5.9 9.1l4.4-1.7z" /><path d="m18.5 15.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg></span>
                    <span><b>AI &amp; Automation</b><small>Workflows, agents, integration</small></span>
                  </a>
                </span>
              </span>
              <span className={styles['nav-mega-foot']}>
                <a className={styles['nav-browse']} href="Extra Services.dc.html">
                  Browse every service
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </a>
                <span className={styles['nav-foot-note']}>One trained seat often covers several of these at once.</span>
                <a className={styles['nav-foot-cta']} href="Qualify.dc.html">
                  Qualify in two minutes
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </a>
              </span>
            </span>
          </span>
          <span className={styles['nav-has-menu']}>
            <a className={styles['nav-link']} href="FAQ.dc.html">
              Resources
              <svg className={styles['nav-caret']} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </a>
            <span className={`${styles['nav-mega']} ${styles['nav-mega--sm']}`}>
              <span className={styles['nav-mega-cols']}>
                <span className={styles['nav-box']}>
                  <span className={styles['nav-item']} aria-disabled="true" aria-label="Case Studies — coming soon">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 12h7M9 16h5" /></svg></span>
                    <span><b>Case Studies <i className={styles['nav-soon']}>soon</i></b><small>Engagements written up, with client sign-off</small></span>
                  </span>
                  <a className={styles['nav-item']} href="Reviews.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.8 6.4.7-4.8 4.3 1.3 6.2L12 17l-5.5 3 1.3-6.2L3 9.5l6.4-.7z" /></svg></span>
                    <span><b>Reviews</b><small>Live reviews on Trustpilot</small></span>
                  </a>
                </span>
                <span className={styles['nav-box']}>
                  <a className={styles['nav-item']} href="Blog.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V6a2 2 0 0 1 2-2h9l5 5v10.5" /><path d="M8 9h6M8 13h8M8 17h5" /></svg></span>
                    <span><b>Blog &amp; Guides</b><small>Playbooks on delegation and operations</small></span>
                  </a>
                  <a className={styles['nav-item']} href="FAQ.dc.html">
                    <span className={styles['nav-ico']}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.4" /><path d="M12 17h.01" /></svg></span>
                    <span><b>FAQ</b><small>Pricing, onboarding, and data handling</small></span>
                  </a>
                </span>
              </span>
              <span className={styles['nav-mega-foot']}>
                <a className={styles['nav-browse']} href="FAQ.dc.html">
                  Read the FAQ
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </a>
                <a className={styles['nav-foot-cta']} href="https://calendly.com/j-zemene-remassistance/new-meeting" target="_blank" rel="noopener">
                  Book a free consult
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </a>
              </span>
            </span>
          </span>

          <a className={`${styles['nav-link']} ${styles['nav-secondary']}`} href="How it Works.dc.html">How it Works</a>
          <a className={styles['nav-link']} href="Pricing.dc.html">Pricing</a>
          <a className={`${styles['nav-link']} ${styles['nav-secondary']}`} href="Qualify.dc.html">Qualify</a>
          <a className={styles['nav-cta']} href="https://calendly.com/j-zemene-remassistance/new-meeting" target="_blank" rel="noopener">Book a Call</a>
        </nav>
      </div>
    </header>
  );
}