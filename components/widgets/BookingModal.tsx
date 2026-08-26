'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './BookingModal.module.css';

/**
 * "Book a Call" modal — ported from assets/booking-modal.js (Phase 02).
 * Intercepts any click on a calendly.com link and opens a branded in-page
 * scheduler dialog instead of navigating away. Progressive enhancement: the
 * anchors keep their real href + target="_blank", so without JS (or on a
 * modified click) they open Calendly natively. The legacy script is untouched.
 */
const CALENDLY_URL = 'https://calendly.com/j-zemene-remassistance/new-meeting';
const HOST_NAME = 'Johnathan Zemene (ASSIST)';
const EVENT_NAME = 'Rem - Outsourced teams (review & plan)';
const HIDE_DETAILS = true;
const EMBED = `${CALENDLY_URL}?hide_event_type_details=${HIDE_DETAILS ? '1' : '0'}`;

/** Route the site uses for its Calendly links (the one we intercept). */
function isCalendly(href: string | null | undefined): boolean {
  if (!href) return false;
  try {
    const host = new URL(href, window.location.origin).hostname;
    return /(^|\.)calendly\.com$/i.test(host);
  } catch {
    return false;
  }
}

export default function BookingModal() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: globalThis.MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || !isCalendly(a.href)) return;
      e.preventDefault();
      lastFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { doClose(); } };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  function doClose() {
    setVisible(false);
    window.setTimeout(() => setOpen(false), 280);
    lastFocus.current?.focus?.({ preventScroll: true });
  }

  return (
    <>
      {open && (
        <div className={`${styles.overlay} ${visible ? styles.visible : ''}`} role="dialog" aria-modal="true" aria-label={EVENT_NAME}>
          <div className={styles.backdrop} onMouseDown={doClose} />
          <div className={styles.dialog} ref={dialogRef}>
            <aside className={styles.brand}>
              <img src="/images/rem-logo.svg" alt="Rem Assist" className={styles.logo} />
              <div className={styles.divider} />
              <span className={styles.host}>{HOST_NAME}</span>
              <span className={styles.event}>{EVENT_NAME}</span>
              <div className={styles.isoRow}>
                {[
                  { src: '/images/ISO_9001-2015.svg', top: 'Certified', bottom: 'ISO 9001:2015' },
                  { src: '/images/ISO_27001-2022.svg', top: 'Certified', bottom: 'ISO 27001:2022' },
                ].map((c) => (
                  <span className={styles.iso} key={c.bottom}>
                    <span className={styles.isoTop}>{c.top}</span>
                    <img src={c.src} alt={c.bottom} />
                    <span className={styles.isoBot}>{c.bottom}</span>
                  </span>
                ))}
              </div>
            </aside>
            <div className={styles.body}>
              <iframe
                src={EMBED}
                title={EVENT_NAME}
                allow="camera; microphone; fullscreen"
                className={styles.frame}
              />
            </div>
            <button type="button" className={styles.close} aria-label="Close booking dialog" onClick={doClose}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}