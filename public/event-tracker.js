/*!
 * SODI GA4 standard events (Tarea medicion-marcas-6634).
 * One delegated tracker: cta_click, outbound_click, whatsapp_click, form_start,
 * form_submit, file_download, scroll_depth. Names and params follow the Vortex tracker.
 * Loaded only by ProductionAnalytics (production hosts, never private routes), and it
 * re-checks the private path itself. It only calls window.gtag when it exists, so it is
 * a no-op without GA4. It never reads field values, so no personal data leaves the page.
 * GA4 Enhanced Measurement may also send its own scroll / click / file_download events;
 * ours use different or explicit names and do not depend on them.
 */
(function () {
  'use strict';
  if (window.__sodiEventTracker) return;
  window.__sodiEventTracker = { version: 1 };

  var doc = document;
  var loc = window.location;

  function isPrivatePath() {
    var p = (loc.pathname || '/').replace(/\/+$/, '') || '/';
    if (/^\/(?:invitacion|api)(?:\/|$)/.test(p)) return true;
    if (p.indexOf('/boda/') === 0 && p !== '/boda/prueba' && p !== '/boda/prueba/panel') return true;
    return /(?:^|[?&])(?:i|code|token|email|nombre|phone|telefono|password)=/i.test(loc.search || '') ||
      /(?:token|invite|code)=/i.test(loc.hash || '');
  }

  function send(name, params) {
    try {
      if (isPrivatePath()) return;
      if (typeof window.gtag !== 'function') return;
      window.gtag('event', name, params || {});
    } catch (e) { /* analytics must never break the page */ }
  }

  function str(v, n) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n || 100); }
  function slug(v) { return str(v, 80).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function bareHost(h) { return String(h || '').toLowerCase().replace(/^www\./, ''); }

  function parseUrl(href) {
    try { return new URL(href, loc.href); } catch (e) { return null; }
  }
  // Never forward query or hash (they can carry tokens or WhatsApp message text).
  function cleanUrl(u) { return u.origin + u.pathname; }

  var WA_HOSTS = { 'wa.me': 1, 'api.whatsapp.com': 1, 'web.whatsapp.com': 1, 'chat.whatsapp.com': 1 };
  var FILE_RE = /\.(pdf|zip|rar|7z|docx?|xlsx?|csv|pptx?|txt|epub|mp3|mp4|dmg|exe|apk)$/i;

  function isWhatsApp(u) {
    return u.protocol === 'whatsapp:' || !!WA_HOSTS[u.hostname.toLowerCase()];
  }

  function ctaIdOf(el, u) {
    var id = el.getAttribute('data-cta-id') || el.getAttribute('data-cta') || '';
    if (id) return slug(id);
    if (el.id && !/^[:_«]/.test(el.id)) return slug(el.id);
    var txt = slug(el.getAttribute('aria-label') || el.textContent);
    if (txt) return txt;
    if (u) return slug((u.pathname || '/') + ' ' + u.hostname) || 'link';
    return 'cta';
  }

  function isCta(el) {
    if (el.hasAttribute('data-cta-id') || el.hasAttribute('data-cta')) return true;
    var cls = typeof el.className === 'string' ? el.className : '';
    return /(?:^|\s)(?:btn-primary|btn-secondary|proposal-cta)(?:\s|$)|(?:^|[\s_-])cta(?:[\s_-]|$)/i.test(cls);
  }

  function pagePath() { return loc.pathname || '/'; }

  function onClick(ev) {
    try {
      if (ev.button && ev.button !== 0 && ev.type === 'click') return;
      var t = ev.target;
      if (!t || !t.closest) return;
      var el = t.closest('a[href], [data-cta-id], [data-cta], button, .btn-primary, .btn-secondary, .proposal-cta');
      if (!el) return;
      var isLink = el.tagName === 'A' && el.hasAttribute('href');
      var u = isLink ? parseUrl(el.getAttribute('href')) : null;
      var common = { page_path: pagePath() };

      if (isLink && u) {
        if (isWhatsApp(u)) {
          // Two existing React handlers already send a richer whatsapp_click; do not double count.
          if (el.getAttribute('data-wa-tracked') === '1') return;
          send('whatsapp_click', { link_url: cleanUrl(u), link_domain: u.protocol === 'whatsapp:' ? 'whatsapp' : u.hostname, cta_id: ctaIdOf(el, u), page_path: common.page_path });
          return;
        }
        var isHttp = u.protocol === 'http:' || u.protocol === 'https:';
        var ext = (u.pathname.match(FILE_RE) || [])[1];
        if (isHttp && (ext || el.hasAttribute('download'))) {
          var fname = decodeURIComponent((u.pathname.split('/').pop() || '')).slice(0, 100);
          var fext = (ext || (fname.split('.').pop() || '')).toLowerCase();
          send('file_download', { file_name: fname, file_extension: fext, link_url: cleanUrl(u), page_path: common.page_path });
          return;
        }
        if (isHttp && bareHost(u.hostname) !== bareHost(loc.hostname)) {
          send('outbound_click', { link_url: cleanUrl(u), link_domain: u.hostname.toLowerCase(), page_path: common.page_path });
        }
      }
      if (isCta(el)) {
        send('cta_click', {
          cta_id: ctaIdOf(el, u),
          cta_text: str(el.getAttribute('aria-label') || el.textContent, 80),
          link_url: u && (u.protocol === 'http:' || u.protocol === 'https:') ? cleanUrl(u) : undefined,
          page_path: common.page_path
        });
      }
    } catch (e) { /* ignore */ }
  }

  // Forms
  var started = typeof WeakSet === 'function' ? new WeakSet() : null;
  var formCount = 0;
  var formIds = typeof WeakMap === 'function' ? new WeakMap() : null;
  function formIdOf(form) {
    var explicit = form.getAttribute('data-form-id') || form.getAttribute('name') || (form.id && !/^[:_«]/.test(form.id) ? form.id : '');
    if (explicit) return slug(explicit);
    var known = formIds && formIds.get(form);
    if (known) return known;
    var idx = Array.prototype.indexOf.call(doc.forms, form) + 1 || ++formCount;
    var id = (slug(pagePath()) || 'home') + '-form-' + idx;
    if (formIds) formIds.set(form, id);
    return id;
  }
  function onFormStart(ev) {
    try {
      var t = ev.target;
      var form = t && t.closest ? t.closest('form') : null;
      if (!form || !started || started.has(form)) return;
      started.add(form);
      send('form_start', { form_id: formIdOf(form), page_path: pagePath() });
    } catch (e) { /* ignore */ }
  }
  function onSubmit(ev) {
    try {
      var form = ev.target;
      if (!form || form.tagName !== 'FORM') return;
      send('form_submit', { form_id: formIdOf(form), page_path: pagePath() });
    } catch (e) { /* ignore */ }
  }

  // Scroll depth: each threshold once per page (reset on client-side navigation).
  var THRESHOLDS = [25, 50, 75, 90];
  var fired = {};
  var firedPath = pagePath();
  var ticking = false;
  function checkScroll() {
    ticking = false;
    try {
      if (pagePath() !== firedPath) { firedPath = pagePath(); fired = {}; }
      var de = doc.documentElement;
      var vh = window.innerHeight || de.clientHeight || 0;
      var total = Math.max(de.scrollHeight, doc.body ? doc.body.scrollHeight : 0);
      if (!total) return;
      var top = window.pageYOffset || de.scrollTop || 0;
      var pct = Math.min(100, Math.floor(((top + vh) / total) * 100));
      for (var i = 0; i < THRESHOLDS.length; i++) {
        var n = THRESHOLDS[i];
        if (pct >= n && !fired[n]) {
          fired[n] = true;
          send('scroll_depth', { percent: n, scroll_depth: n, page_path: firedPath });
        }
      }
    } catch (e) { /* ignore */ }
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    if (window.requestAnimationFrame) window.requestAnimationFrame(checkScroll); else setTimeout(checkScroll, 100);
  }

  doc.addEventListener('click', onClick, true);
  doc.addEventListener('auxclick', function (ev) { if (ev.button === 1) onClick(ev); }, true);
  doc.addEventListener('focusin', onFormStart, true);
  doc.addEventListener('input', onFormStart, true);
  doc.addEventListener('submit', onSubmit, true);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
