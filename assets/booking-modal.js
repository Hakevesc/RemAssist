/* Rem Assist — "Book a Call" modal.
   Intercepts any link pointing at Calendly and opens the scheduler in a large
   branded in-page dialog instead of navigating away / opening a new tab.

   Progressive enhancement: the anchors keep their real href + target="_blank",
   so if this script fails to load the links still work as before. */
(function () {
  'use strict';

  /* ---- Booking source -------------------------------------------------- */
  /* Single source of truth for the scheduler. Change the slug here only. */
  var CALENDLY_URL = 'https://calendly.com/j-zemene-remassistance/new-meeting';

  /* Shown in the branded header bar of the dialog. */
  var HOST_NAME  = 'Johnathan Zemene (ASSIST)';
  var EVENT_NAME = 'Rem - Outsourced teams (review & plan)';

  /* We render the host + event name ourselves, so Calendly's own duplicate
     detail panel is hidden to give the calendar the full width. */
  var HIDE_CALENDLY_DETAILS = true;

  var LOGO_SRC = 'assets/images/rem-logo.svg';
  var ISO_SRC = [
    { src: 'assets/images/ISO_9001-2015.svg',  alt: 'ISO 9001:2015 certified',
      top: 'Certified', bottom: 'ISO 9001:2015' },
    { src: 'assets/images/ISO_27001-2022.svg', alt: 'ISO 27001:2022 certified',
      top: 'Certified', bottom: 'ISO 27001:2022' }
  ];
  var BRAND = '079be0';

  /* The four ribbon paths of the Rem mark — same artwork the page loader
     animates. Used here as a looping watermark. */
  var MARK_PATHS = [
    'M173.5,13c7.6,0,15.2,0.6,22.7,2.1s9.7,3,9.4,8.3c-0.7,11.1-17.9,4.8-24.5,4.5C92.4,23.7,19.9,92.7,25.6,182.5 c0.5,8.8,4.8,20.8,5,28.1c0.1,4.5-3.7,8.5-8.3,8.1C12.2,217.9,9,176.9,10.6,157c5.6-64.1,55.2-121.9,117-138.5l15-3.1 c8-1.6,16.1-2.4,24.2-2.4H173.5L173.5,13z',
    'M236.8,178.8c-2.4-2.1-2.5-6-3.3-9.3c-1-5.1-1.9-11.2-3-15.7c-1.9-7.6-5.9-15-10.6-21.1 c-27.7-36.1-88.8-29.6-107.4,12c-26.3,58.8,33.1,108.4,87.1,116.6c5.8,1.3,10.4-2.8,16-3.7c6.1-0.9,10.5-0.1,16.3,0.2 c12.5,0.2,18.1,13.1,10.9,22.8c-3.7,4.5-10.2,5.1-15.6,5.4c-14.1,0.7-15.8,0.2-26.2-7.3s-12.7-2.7-18.7-4.2 c-53-12.9-106.3-62.7-90.7-121.3c21.1-87.8,150.3-76.8,159.1,11.9c0.4,4.2,0.5,7.8-1.6,11C246.7,180.1,240.5,181.8,236.8,178.8 L236.8,178.8z',
    'M155.4,37.3c24.2-2,47.4,1.1,69.6,10.8c7,3.1,24,9.6,19.4,19.1c-5.5,11.3-19.1-0.4-26.8-3.7 C121,22,22.6,115.5,58.9,214.2c2.1,5.6,10.5,19.6,10.8,23.3c0.5,7.1-5.1,11.5-11.8,8.7c-7.5-3.1-18-33.7-20-42 C19.5,125.9,74.3,44.2,155.4,37.3z',
    'M280.6,183c0.3-168-232.1-148.7-218.9-1.6c1.6,18.3,7.7,36,17.5,51.6c13.2,21,27.5,40.1,13.6,69.6 c-3.1,6.6-16.3,19.3-3.9,24.6c6.9,3,11.7-4.5,14.9-9.5c10.3-17,12.2-38.1,7.5-57.6c-2.5-10.4-7.2-20.1-13.2-28.9 c-28.8-42-26.6-78.7,2.1-119.5c44.6-53.5,133.9-36.6,156.7,28.5c6.9,19.7,3.8,37.2,11.2,56.8c2.2,5.8,15.6,30.7,14.4,34.4 c-0.8,2.3-12.2,2.9-15.6,4.4c-16.9,7.4-5.4,41.2-15.3,54.7c-5.9,8-18,4.7-26.5,5.5c-26.6,2.7-46.2,34.5-52.5,58 c-1.9,4.7-2.8,13.6,4,15.3c12.6,1.6,12.4-15.8,16.8-24c27-51.4,39.3-20.9,66.7-39.3c16.5-12.3,11.9-45.8,14.6-54.9 c29.3-3,27.8-18.4,20.8-35.3C291.4,206,280.7,183.2,280.6,183L280.6,183z'
  ];

  /* ---- Styles ---------------------------------------------------------- */
  /* Two columns: a navy brand panel on the left, the scheduler on the right.
     Collapses to a stacked layout on narrow screens. */
  var CSS = [
    '#rem-booking{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;padding:24px}',
    '#rem-booking.is-open{display:flex}',
    '#rem-booking-backdrop{position:absolute;inset:0;background:rgba(0,5,67,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .28s ease}',
    '#rem-booking.is-visible #rem-booking-backdrop{opacity:1}',
    '#rem-booking-dialog{position:relative;display:grid;grid-template-columns:minmax(300px,380px) 1fr;width:min(1180px,96vw);height:min(820px,92vh);background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 60px 120px -40px rgba(0,5,67,.6);opacity:0;transform:translateY(14px) scale(.985);transition:opacity .28s ease,transform .28s cubic-bezier(.2,.8,.2,1)}',
    '#rem-booking.is-visible #rem-booking-dialog{opacity:1;transform:none}',

    /* left: brand panel */
    '#rem-booking-brand{position:relative;display:flex;flex-direction:column;padding:78px 38px 44px;background:linear-gradient(160deg,#326dda,#000543 70%);color:#fff;overflow:hidden}',
    '#rem-booking-brand:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,.14) 1.3px,transparent 1.4px);background-size:13px 13px;opacity:.45}',
    '#rem-booking-brand>*{position:relative;z-index:1}',
    '#rem-booking-logo{align-self:flex-start;height:86px;width:auto;display:block;filter:brightness(0) invert(1)}',
    '#rem-booking-divider{width:44px;height:3px;border-radius:3px;background:#34bdf0;margin:30px 0 22px}',
    '#rem-booking-host{display:block;font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.72)}',
    '#rem-booking-event{display:block;margin-top:10px;font-size:20px;font-weight:700;line-height:1.35;color:#fff}',

    /* ISO badges, each captioned above and below */
    '#rem-booking-iso{margin-top:auto;padding-top:32px;display:flex;align-items:flex-start;gap:22px;flex-wrap:wrap}',
    '.rem-iso{display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center}',
    '.rem-iso img{height:62px;width:auto;display:block;filter:brightness(0) invert(1);opacity:.92}',
    '.rem-iso-top{font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.6)}',
    '.rem-iso-bot{font-size:11px;font-weight:700;letter-spacing:.04em;color:#fff;white-space:nowrap}',

    /* looping logo watermark, bottom-left behind the panel content */
    '#rem-booking-mark{position:absolute;left:-56px;bottom:-48px;width:300px;z-index:0;pointer-events:none;opacity:.12}',
    '#rem-booking-mark path{fill:#fff;stroke:#fff;stroke-width:3;stroke-dasharray:1;fill-opacity:0;animation:remMarkDraw 6.4s ease-in-out infinite}',
    '#rem-booking-mark path:nth-child(2){animation-delay:.12s}',
    '#rem-booking-mark path:nth-child(3){animation-delay:.24s}',
    '#rem-booking-mark path:nth-child(4){animation-delay:.36s}',
    '@keyframes remMarkDraw{',
    '0%{stroke-dashoffset:1;fill-opacity:0;stroke-opacity:.95}',
    '26%{stroke-dashoffset:0;fill-opacity:0;stroke-opacity:.95}',
    '46%{stroke-dashoffset:0;fill-opacity:1;stroke-opacity:.5}',
    '56%,84%{stroke-dashoffset:0;fill-opacity:1;stroke-opacity:0}',
    '100%{stroke-dashoffset:0;fill-opacity:0;stroke-opacity:0}',
    '}',

    /* right: scheduler */
    '#rem-booking-body{position:relative;min-width:0;background:#fff}',
    '#rem-booking-body iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}',
    '#rem-booking-spin{position:absolute;inset:0;display:grid;place-items:center;gap:14px;align-content:center;color:#667180;font-size:14px}',
    '#rem-booking-spin i{width:28px;height:28px;border-radius:50%;border:2.5px solid #e6eaf2;border-top-color:#' + BRAND + ';animation:remBookSpin .8s linear infinite;display:block}',
    '@keyframes remBookSpin{to{transform:rotate(360deg)}}',

    /* Sits over the navy panel, top-left. Calendly stamps a "Powered by
       Calendly" ribbon into the iframe's top-right corner, so a close button
       in the usual place would cover their branding. */
    '#rem-booking-close{position:absolute;top:18px;left:18px;z-index:4;width:40px;height:40px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);border-radius:50%;cursor:pointer;color:#fff;transition:background .15s,border-color .15s,transform .15s}',
    '#rem-booking-close:hover{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.5);transform:scale(1.06)}',
    '#rem-booking-close:focus-visible{outline:2px solid #34bdf0;outline-offset:2px}',
    'html.rem-booking-lock,body.rem-booking-lock{overflow:hidden}',

    /* stacked: brand panel becomes a compact banner above the scheduler */
    '@media (max-width:900px){',
    '#rem-booking{padding:0}',
    '#rem-booking-dialog{grid-template-columns:1fr;grid-template-rows:auto 1fr;width:100vw;height:100dvh;max-height:none;border-radius:0}',
    '#rem-booking-brand{padding:20px 22px}',
    '#rem-booking-close{top:14px;left:auto;right:14px}',
    '#rem-booking-logo{height:44px}',
    '#rem-booking-divider{display:none}',
    '#rem-booking-host{margin-top:14px;font-size:10px}',
    '#rem-booking-event{margin-top:5px;font-size:16px}',
    '#rem-booking-iso{margin-top:16px;padding-top:0;gap:16px}',
    '.rem-iso img{height:38px}',
    '.rem-iso-bot{font-size:10px}',
    '#rem-booking-mark{width:190px;left:-40px;bottom:-64px}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '#rem-booking-backdrop,#rem-booking-dialog{transition:none}',
    '#rem-booking-spin i{animation:none}',
    '#rem-booking-mark path{animation:none;fill-opacity:1;stroke-opacity:0}',
    '}'
  ].join('');

  /* ---- Build the embed URL --------------------------------------------- */
  function embedUrl() {
    var u;
    try { u = new URL(CALENDLY_URL); } catch (e) { return CALENDLY_URL; }
    var p = u.searchParams;
    p.set('embed_type', 'Inline');
    /* file:// has an empty hostname; Calendly tolerates the param being absent */
    if (location.hostname) p.set('embed_domain', location.hostname);
    p.set('hide_gdpr_banner', '1');
    p.set('primary_color', BRAND);
    if (HIDE_CALENDLY_DETAILS) {
      p.set('hide_event_type_details', '1');
      p.set('hide_landing_page_details', '1');
    }
    return u.toString();
  }

  /* ---- DOM ------------------------------------------------------------- */
  var overlay = null, dialog = null, bodyEl = null, closeBtn = null;
  var iframeLoaded = false, lastFocus = null, visTimer = null;

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = 'rem-booking';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', EVENT_NAME + ' — book a call');
    var isoHtml = ISO_SRC.map(function (c, i) {
      return '<span class="rem-iso">' +
               '<span class="rem-iso-top" data-i="' + i + '"></span>' +
               '<img src="' + c.src + '" alt="' + c.alt + '">' +
               '<span class="rem-iso-bot" data-i="' + i + '"></span>' +
             '</span>';
    }).join('');

    var markHtml =
      '<svg id="rem-booking-mark" viewBox="0 0 311.2 382" aria-hidden="true" focusable="false">' +
        MARK_PATHS.map(function (d) {
          return '<path pathLength="1" d="' + d + '"/>';
        }).join('') +
      '</svg>';

    overlay.innerHTML =
      '<div id="rem-booking-backdrop"></div>' +
      '<div id="rem-booking-dialog">' +
        '<aside id="rem-booking-brand">' +
          markHtml +
          '<img id="rem-booking-logo" src="' + LOGO_SRC + '" alt="Rem Assist">' +
          '<span id="rem-booking-divider"></span>' +
          '<span id="rem-booking-host"></span>' +
          '<span id="rem-booking-event"></span>' +
          '<div id="rem-booking-iso">' + isoHtml + '</div>' +
        '</aside>' +
        '<div id="rem-booking-body">' +
          '<div id="rem-booking-spin"><i></i><span>Loading available times…</span></div>' +
        '</div>' +
        '<button type="button" id="rem-booking-close" aria-label="Close booking dialog">' +
          '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>';
    document.body.appendChild(overlay);

    /* textContent, not innerHTML — the names are data, not markup */
    overlay.querySelector('#rem-booking-host').textContent = HOST_NAME;
    overlay.querySelector('#rem-booking-event').textContent = EVENT_NAME;
    overlay.querySelectorAll('.rem-iso-top').forEach(function (n) {
      n.textContent = ISO_SRC[+n.dataset.i].top;
    });
    overlay.querySelectorAll('.rem-iso-bot').forEach(function (n) {
      n.textContent = ISO_SRC[+n.dataset.i].bottom;
    });

    dialog = overlay.querySelector('#rem-booking-dialog');
    bodyEl = overlay.querySelector('#rem-booking-body');
    closeBtn = overlay.querySelector('#rem-booking-close');

    closeBtn.addEventListener('click', close);
    overlay.querySelector('#rem-booking-backdrop').addEventListener('click', close);
    overlay.addEventListener('keydown', onKeydown);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { close(); return; }
    /* Minimal focus trap: the close button is the only focusable chrome, so
       keep Tab on it rather than letting focus escape behind the overlay. */
    if (e.key === 'Tab' && document.activeElement === closeBtn) {
      e.preventDefault();
      closeBtn.focus();
    }
  }

  function open() {
    if (!overlay) build();
    lastFocus = document.activeElement;

    if (!iframeLoaded) {
      iframeLoaded = true;
      var f = document.createElement('iframe');
      f.title = EVENT_NAME;
      f.setAttribute('allow', 'camera; microphone; fullscreen');
      f.src = embedUrl();
      var spin = overlay.querySelector('#rem-booking-spin');
      f.addEventListener('load', function () { if (spin) spin.style.display = 'none'; });
      bodyEl.appendChild(f);
    }

    overlay.classList.add('is-open');
    document.documentElement.classList.add('rem-booking-lock');
    document.body.classList.add('rem-booking-lock');
    /* next frame so the transition actually runs */
    requestAnimationFrame(function () { overlay.classList.add('is-visible'); });
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!overlay || !overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-visible');
    clearTimeout(visTimer);
    visTimer = setTimeout(function () {
      overlay.classList.remove('is-open');
      document.documentElement.classList.remove('rem-booking-lock');
      document.body.classList.remove('rem-booking-lock');
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }, 280);
  }

  /* ---- Intercept ------------------------------------------------------- */
  /* Delegated so links rendered later by the template engine are covered too. */
  document.addEventListener('click', function (e) {
    /* let modified clicks (new tab / new window / download) behave natively */
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    if (!/(^|\.)calendly\.com$/i.test(a.hostname)) return;
    e.preventDefault();
    open();
  });

  window.remBooking = { open: open, close: close };
})();
