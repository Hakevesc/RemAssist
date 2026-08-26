'use client';

import { useRef, useState } from 'react';
import styles from './HomeHero.module.css';

/**
 * HomeHero — the interactive hero from index.html (Phase 02).
 * Static decoration (eyebrow, rotating word, gradient) is markup/CSS; this adds
 * the DCLogic behaviour: play/pause the hero video, toggle sound, and hover an
 * orbiting chip to reveal its tip popover. The marquee + lower sections stay in
 * app/page.tsx.
 */
/* pop: '' default (down, centered) | 'popRight' (chip on the right) |
   'popUpRight' (chip on the right, popover opens upward). Mirrors the
   dc-hero-pop--right / dc-hero-pop--up modifiers in index.html so the
   popovers don't get clipped by the hero edges. */
const CHIPS = [
  { top: 10, left: 10, label: 'Watch Customer Service', tipTitle: 'Hear what Customer Service is', tip: 'Meet our CS agents and see how 24/7 voice, chat, and email coverage runs day to day.', delay: 0, pop: '' },
  { top: 380, left: 390, label: 'Watch GTM Teams', tipTitle: 'Hear what GTM Teams are', tip: 'Inside a GTM pod — outbound, marketing ops, and CRM admin working as one unit.', delay: 1.6, pop: 'popRight' },
  { top: 360, left: -40, label: 'Watch SDR explainer', tipTitle: 'Hear what SDR as a Service is', tip: 'From list building to booked meetings — the full outbound engine, end to end.', delay: 2.4, pop: '' },
  { top: 20, left: 380, label: 'Watch Extra Services', tipTitle: 'Hear what Extra Services are', tip: 'IT helpdesk, AI automations, and back-office support — the rest of the bench at work.', delay: 0.8, pop: 'popUpRight' },
];

const BOOK = 'https://calendly.com/j-zemene-remassistance/new-meeting';
const WORDS = ['customer service', 'go-to-market', 'outbound sales', 'IT staff', 'back office', 'specialized roles'];

export default function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hover, setHover] = useState(-1);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { void v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  return (
    <section
      style={{
        background: '#518de0',
        backgroundImage:
          'radial-gradient(ellipse 1100px 650px at 78% 18%, rgba(190,220,255,0.30), transparent 62%), radial-gradient(ellipse 600px 300px at 45% 0%, rgba(255,255,255,0.12), transparent 70%), linear-gradient(160deg,#518de0,#0047b3 82%)',
        overflow: 'hidden',
        position: 'relative',
        height: 'calc(100svh - 72px)',
        minHeight: 520,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className={styles.grid}>
        <div>
          <div className={styles.eyebrow}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 20v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.7A3.7 3.7 0 0 0 3 18.2V20"></path><circle cx="9.5" cy="7.5" r="3.6"></circle><path d="M21 20v-1.8a3.7 3.7 0 0 0-2.8-3.6"></path><path d="M15.5 4.1a3.7 3.7 0 0 1 0 7"></path></svg>
            <span className={styles.eyebrowText}>Expert teams. Built around your goals.</span>
          </div>
          <h1 className={styles.h1}>
            Remote teams for<span className={styles.srOnly}> specialized roles</span>
          </h1>
          <div className={styles.rot} aria-hidden="true">
            <div className={styles.rotTrack}>
              {WORDS.map((w) => (
                <span key={w} className={styles.word}>{w}</span>
              ))}
              <span className={styles.word}>{WORDS[0]} </span>
            </div>
          </div>
          <p className={styles.lead}>
            A hyper-efficient outsourcing team, delivered in pods and <br />built to the exact shape of your operation.
          </p>
          <div className={styles.cta}>
            <a className={styles.ctaPrimary} href={BOOK} target="_blank" rel="noopener">Book a call</a>
            <a className={styles.ctaGhost} href="/pricing">See pricing</a>
          </div>
        </div>
        <div className={styles.stage}>
          <div className={styles.orbit} aria-hidden="true">
            <div className={styles.orbitRing} />
          </div>
          {CHIPS.map((c, i) => (
            <div
              key={c.label}
              className={styles.chip}
              style={{ top: c.top, left: c.left, animation: `floatY 5.5s cubic-bezier(0.2,0.8,0.2,1) ${c.delay}s infinite` }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
            >
              <a className={styles.chipCard} href={BOOK} target="_blank" rel="noopener">
                <span className={styles.chipPlay}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg></span>
                <span className={styles.chipLabel}>{c.label}</span>
              </a>
              {hover === i && (
                <div className={`${styles.pop} ${c.pop ? styles[c.pop] : ''}`}>
                  <div className={styles.popT}>{c.tipTitle}</div>
                  <p className={styles.popB}>{c.tip}</p>
                  <div className={styles.popRow}>
                    <a className={styles.popBtn} href={BOOK} target="_blank" rel="noopener">Click to play</a>
                    <span className={styles.popWave} aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className={styles.visual}>
            <video
              ref={videoRef}
              src="/uploads/20260521_174353000_iOS.MP4"
              loop
              playsInline
              muted
              onClick={togglePlay}
            />
            <button type="button" className={styles.playBtn} aria-label="Play or pause video" onClick={togglePlay}>
              <span className={styles.playDisc}>
                {playing ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--brand-navy)"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--brand-navy)" style={{ marginLeft: 3 }}><path d="M7 4.5v15l13-7.5-13-7.5Z"></path></svg>
                )}
              </span>
            </button>
          </div>

          <button type="button" className={styles.sound} onClick={toggleSound}>
            <span className={styles.soundIcon}>
              <span className={styles.soundRing}></span>
              {muted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"></path><path d="M22 9l-6 6M16 9l6 6"></path></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"></path><path d="M16 9a4 4 0 0 1 0 6"></path><path d="M19 6.5a8 8 0 0 1 0 11"></path></svg>
              )}
            </span>
            <span>{muted ? 'Sound off' : 'Sound on'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}