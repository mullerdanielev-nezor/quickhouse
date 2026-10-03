/* Quickhouse – menü, galéria (lightbox) és süti-hozzájárulás kezelése. Külső függőség nincs. */
(function () {
  'use strict';

  /* ---------- ragadós fejléc: árnyék görgetéskor ---------- */
  var bar = document.getElementById('topbar');
  if (bar) {
    var onScroll = function () { bar.classList.toggle('scrolled', (window.pageYOffset || document.documentElement.scrollTop) > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---------- mobil menü + almenü ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.sub-toggle'), function (b) {
    b.addEventListener('click', function () {
      var li = b.parentNode, open = li.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') Array.prototype.forEach.call(document.querySelectorAll('.has-sub.open'), function (li) { li.classList.remove('open'); });
  });


  /* ---------- számozott menü: bezárás, aktuális szekció ---------- */
  (function () {
    var m = document.getElementById('menu'), b = document.querySelector('.burger'); if (!m || !b) return;
    var close = function () { m.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); };
    Array.prototype.forEach.call(m.querySelectorAll('a'), function (a) { a.addEventListener('click', close); });
    document.addEventListener('click', function (e) { if (!m.contains(e.target) && !b.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    var links = Array.prototype.slice.call(m.querySelectorAll('a')), secs = links.map(function (a) { var h = a.getAttribute('href'); return document.getElementById(h.substring(h.indexOf('#') + 1)); });
    if (!secs.some(Boolean)) return;
    var spy = function () {
      var cur = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < 140) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('cur', i === cur); });
    };
    window.addEventListener('scroll', spy, { passive: true }); spy();
  })();


  /* ---------- 01: lapozható csúszka ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-acs]'), function (root) {
    var sl = Array.prototype.slice.call(root.querySelectorAll('.acs-slide')), box = root.querySelector('.acs-dots'), dots = [], i = 0, x0 = null;
    sl.forEach(function (_, k) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', (k + 1) + '. dia');
      b.addEventListener('click', function () { go(k); }); box.appendChild(b); dots.push(b);
    });
    function go(k) {
      i = (k + sl.length) % sl.length;
      sl.forEach(function (s, j) { s.classList.toggle('on', j === i); s.setAttribute('aria-hidden', j === i ? 'false' : 'true'); });
      dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
    }
    root.querySelector('[data-aprev]').addEventListener('click', function () { go(i - 1); });
    root.querySelector('[data-anext]').addEventListener('click', function () { go(i + 1); });
    var stage = root.querySelector('.acs-stage');
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
    go(0);
  });


  /* ---------- videó: állandóan fut (némítva, ismétlődik), nem vezérelhető ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.vid video'), function (v) {
    v.muted = true; v.loop = true; v.removeAttribute('controls');
    var go = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    v.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    v.addEventListener('pause', function () { if (!document.hidden) go(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) go(); });
    ['touchstart', 'click', 'scroll'].forEach(function (ev) { window.addEventListener(ev, go, { once: true, passive: true }); });
    go();
  });

  /* ---------- galéria ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.gallery a'));
  if (links.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Képnézegető');
    lb.innerHTML = '<button class="x" aria-label="Bezárás">&times;</button><button class="p" aria-label="Előző kép">&#8249;</button><img alt=""><button class="n" aria-label="Következő kép">&#8250;</button>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img'), idx = 0, opener = null;
    var show = function (i) {
      idx = (i + links.length) % links.length;
      img.src = links[idx].getAttribute('href');
      img.alt = (links[idx].querySelector('img') || {}).alt || '';
    };
    var close = function () { lb.classList.remove('open'); if (opener) opener.focus(); };
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); opener = a; show(i); lb.classList.add('open'); lb.querySelector('.x').focus(); });
    });
    lb.querySelector('.x').addEventListener('click', close);
    lb.querySelector('.p').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.n').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }


  /* ---------- ajánlatkérő űrlap ---------- */
  var form = document.getElementById('quote');
  if (form) {
    var box = document.getElementById('fmsg'), tsf = document.getElementById('ts'), btn = form.querySelector('button[type=submit]');
    tsf.value = Date.now();
    var say = function (t, err) { box.textContent = t; box.className = 'msg-box show' + (err ? ' err' : ''); box.scrollIntoView({ block: 'nearest' }); };
    if (/[?&]kuldes=ok/.test(location.search)) say('Köszönjük, megkaptuk az ajánlatkérését. Hamarosan jelentkezünk.', false);
    if (/[?&]kuldes=hiba/.test(location.search)) say('A küldés most nem sikerült. Kérjük, hívjon minket telefonon, vagy írjon az info@quickhouse.hu címre.', true);
    form.addEventListener('submit', function (e) {
      var name = form.elements.name, phone = form.elements.phone, mail = form.elements.email, msg = form.elements.msg, consent = form.elements.consent, bad = null;
      [name, phone, mail, msg].forEach(function (f) { f.classList.remove('invalid'); });
      if (!name.value.trim()) { name.classList.add('invalid'); bad = bad || name; }
      if (!phone.value.trim()) { phone.classList.add('invalid'); bad = bad || phone; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.value.trim())) { mail.classList.add('invalid'); bad = bad || mail; }
      if (!msg.value.trim()) { msg.classList.add('invalid'); bad = bad || msg; }
      if (!consent.checked) bad = bad || consent;
      if (bad) { e.preventDefault(); bad.focus(); say(bad === consent ? 'Kérjük, fogadja el az adatkezelési tájékoztatót.' : 'Kérjük, töltsd ki az összes mezőt (minden kötelező).', true); return; }
      if (!window.fetch || !window.FormData) return; /* régi böngésző: hagyományos beküldés */
      e.preventDefault();
      btn.disabled = true; btn.textContent = 'Küldés…';
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (d) {
          if (d.ok || d.success === true || d.success === 'true') { if (window.fbq) fbq('track', 'Lead'); form.reset(); tsf.value = Date.now(); say('Köszönjük, megkaptuk az ajánlatkérését. Hamarosan jelentkezünk.', false); }
          else say('A küldés most nem sikerült. Kérjük, hívjon minket telefonon, vagy írjon az info@quickhouse.hu címre.', true);
        })
        .catch(function () { say('A küldés most nem sikerült. Kérjük, hívjon minket telefonon, vagy írjon az info@quickhouse.hu címre.', true); })
        .then(function () { btn.disabled = false; btn.textContent = 'Ajánlatot kérek'; });
    });
  }


  /* ---------- ár-kalkulátor ---------- */
  var calc = document.getElementById('calc');
  if (calc) {
    var size = document.getElementById('csize'), fmt = function (n) { return n.toLocaleString('hu-HU').replace(/\u00a0/g, ' '); };
    var render = function () {
      var m2 = parseInt(size.value, 10), unit = 510000, tname = 'Acélszerkezetes ház';
      document.getElementById('csize-out').textContent = m2 + ' m²';
      document.getElementById('cprice').textContent = fmt(m2 * unit) + ' Ft';
      document.getElementById('cdetail').textContent = m2 + ' m² × ' + fmt(unit) + ' Ft';
      var msg = document.getElementById('msg');
      if (msg && (!msg.value || msg.dataset.auto === '1')) { msg.value = 'Érdekel: ' + tname + ', kb. ' + m2 + ' m². Kérem az erre vonatkozó pontos ajánlatot.'; msg.dataset.auto = '1'; }
    };
    calc.addEventListener('input', render); calc.addEventListener('change', render); render();
  }

  /* ---------- az űrlap előtöltése a kalkulátorból ---------- */
  (function () {
    var f = document.getElementById('quote'); if (!f) return;
    if (f.elements.msg) f.elements.msg.addEventListener('input', function () { this.dataset.auto = ''; });
    var q = {}; location.search.replace(/[?&]([^=&]+)=([^&]*)/g, function (_, k, v) { q[k] = decodeURIComponent(v.replace(/\+/g, ' ')); });
    if (q.tipus && q.meret && /^\d{2,3}$/.test(q.meret)) {
      var m = f.elements.msg;
      if (m && !m.value) m.value = 'Érdekel: ' + q.tipus + ', kb. ' + q.meret + ' m². Kérem az erre vonatkozó pontos ajánlatot.';
    }
  })();


  /* ---------- lapozható sorok (referenciák, kártyák) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-scroll]'), function (row) {
    var sc = row.querySelector('.refscroll, .pscroll'), cards = Array.prototype.slice.call(sc.children);
    var step = function () { var f = cards[0]; return (f ? f.getBoundingClientRect().width : 300) + 14; };
    var bp = row.querySelector('[data-sprev]'), bn = row.querySelector('[data-snext]');
    if (bp) bp.addEventListener('click', function () { sc.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (bn) bn.addEventListener('click', function () {
      var end = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4;
      if (end) sc.scrollTo({ left: 0, behavior: 'smooth' }); else sc.scrollBy({ left: step(), behavior: 'smooth' });
    });
    var chk = function () { row.classList.toggle('static', !row.classList.contains('promo') && sc.scrollWidth <= sc.clientWidth + 4); };
    chk(); window.addEventListener('resize', chk);
    var dots = row.nextElementSibling && row.nextElementSibling.classList.contains('pdots') ? row.nextElementSibling : null;
    if (dots) {
      cards.forEach(function () { dots.appendChild(document.createElement('i')); });
      var upd = function () {
        var c = sc.scrollLeft + sc.clientWidth / 2, best = 0, bd = 1e9;
        cards.forEach(function (el, k) { var d = Math.abs(el.offsetLeft - sc.offsetLeft + el.offsetWidth / 2 - c); if (d < bd) { bd = d; best = k; } });
        if (sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4) best = cards.length - 1;
        Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === best); });
      };
      sc.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true }); upd();
    }
  });

  /* ---------- folyamat: részletek felugró ablakban ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-flow]'), function (ol) {
    var dlg = document.querySelector('.fdialog'); if (!dlg || !dlg.showModal) return;
    var items = Array.prototype.slice.call(ol.children), cur = 0, opener = null;
    var img = dlg.querySelector('.fd-img'), step = dlg.querySelector('.fd-step'), title = dlg.querySelector('#fd-title'), text = dlg.querySelector('.fd-text');
    var prev = dlg.querySelector('.fd-prev'), next = dlg.querySelector('.fd-next'), card = dlg.querySelector('.fd-card');
    function fill(k) {
      cur = (k + items.length) % items.length; var li = items[cur];
      var im = li.querySelector('.pic img');
      img.innerHTML = '<img src="' + im.getAttribute('src') + '" alt="' + (im.getAttribute('alt') || '') + '">';
      step.textContent = (cur + 1) + '. lépés';
      title.textContent = li.querySelector('h3').textContent;
      text.innerHTML = li.querySelector('.fdetail').innerHTML;
      prev.hidden = cur === 0; next.hidden = cur === items.length - 1;
      card.scrollTop = 0;
    }
    function open(k, btn) { opener = btn || opener; fill(k); if (!dlg.open) { dlg.showModal(); document.documentElement.classList.add('noscroll'); } }
    items.forEach(function (li, k) { li.querySelector('.more').addEventListener('click', function () { open(k, this); }); });
    prev.addEventListener('click', function () { fill(cur - 1); });
    next.addEventListener('click', function () { fill(cur + 1); });
    dlg.querySelector('.fd-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); if (e.target.closest && e.target.closest('.fp-link')) dlg.close(); });
    dlg.addEventListener('close', function () { document.documentElement.classList.remove('noscroll'); if (opener) opener.focus(); });
  });

  /* ---------- süti-hozzájárulás ---------- */
  var KEY = 'qh_consent', VERSION = 1;
  function read() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (!raw) { var m = document.cookie.match(new RegExp('(?:^|; )' + KEY + '=([^;]*)')); if (m) raw = decodeURIComponent(m[1]); }
    if (!raw) return null;
    try { var c = JSON.parse(raw); return c && c.v === VERSION ? c : null; } catch (e) { return null; }
  }
  function write(stat, mkt) {
    var c = { v: VERSION, necessary: true, statistics: !!stat, marketing: !!mkt, ts: new Date().toISOString() };
    var raw = JSON.stringify(c);
    try { localStorage.setItem(KEY, raw); } catch (e) {}
    document.cookie = KEY + '=' + encodeURIComponent(raw) + '; max-age=' + 60 * 60 * 24 * 365 + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    window.qhConsent.current = c;
    document.dispatchEvent(new CustomEvent('qh:consent', { detail: c }));
    return c;
  }
  /* Más szkriptek (pl. statisztika) csak akkor induljanak, ha:
     window.qhConsent.current && window.qhConsent.current.statistics  — vagy a 'qh:consent' eseményre várva. */
  window.qhConsent = { current: read(), open: function () { openBanner(true); } };

  var root = null;
  function build() {
    if (root) return root;
    var base = document.documentElement.getAttribute('data-root') || '';
    root = document.createElement('div');
    root.className = 'cc'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-labelledby', 'cc-title'); root.setAttribute('aria-live', 'polite');
    root.innerHTML =
      '<div class="cc-box">' +
      '<h2 id="cc-title">Sütik és adatvédelem</h2>' +
      '<p>Az oldal működéséhez szükséges sütiket használunk. Statisztikai és marketing sütiket csak a hozzájárulásoddal helyezhetünk el, ezt bármikor módosíthatod vagy visszavonhatod. Részletek: <a href="' + base + 'suti-tajekoztato.html">Süti tájékoztató</a> és <a href="' + base + 'adatvedelem.html">Adatkezelési tájékoztató</a>.</p>' +
      '<div class="cc-prefs" id="cc-prefs">' +
      '<label><input type="checkbox" checked disabled><span><strong>Szükséges</strong>Az oldal alapműködéséhez és a hozzájárulásod megjegyzéséhez kell. Nem kapcsolható ki.</span></label>' +
      '<label><input type="checkbox" id="cc-stat"><span><strong>Statisztikai</strong>Névtelen látogatottsági adatok az oldal fejlesztéséhez.</span></label>' +
      '<label><input type="checkbox" id="cc-mkt"><span><strong>Marketing</strong>Személyre szabott hirdetések és remarketing.</span></label>' +
      '</div>' +
      '<div class="cc-actions">' +
      '<button type="button" class="btn" id="cc-all">Mindet elfogadom</button>' +
      '<button type="button" class="btn alt" id="cc-nec">Csak a szükségesek</button>' +
      '<button type="button" class="btn alt" id="cc-cfg" aria-expanded="false" aria-controls="cc-prefs">Beállítások</button>' +
      '</div></div>';
    document.body.appendChild(root);
    var prefs = root.querySelector('#cc-prefs'), cfg = root.querySelector('#cc-cfg');
    root.setPrefs = setPrefs;
    function setPrefs(open) {
      prefs.classList.toggle('open', open);
      cfg.setAttribute('aria-expanded', open ? 'true' : 'false');
      cfg.textContent = open ? 'Kiválasztottak mentése' : 'Beállítások';
    }
    var hide = function () { root.classList.remove('show'); };
    root.querySelector('#cc-all').addEventListener('click', function () { write(true, true); hide(); });
    root.querySelector('#cc-nec').addEventListener('click', function () { write(false, false); hide(); });
    cfg.addEventListener('click', function () {
      if (!prefs.classList.contains('open')) { setPrefs(true); return; }
      write(root.querySelector('#cc-stat').checked, root.querySelector('#cc-mkt').checked); hide();
    });
    return root;
  }
  function openBanner(manual) {
    build();
    var c = window.qhConsent.current;
    if (manual) {
      root.querySelector('#cc-stat').checked = !!(c && c.statistics);
      root.querySelector('#cc-mkt').checked = !!(c && c.marketing);
      root.setPrefs(true);
    }
    root.classList.add('show');
    var first = root.querySelector('#cc-all'); if (first) first.focus({ preventScroll: true });
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-cc-open]'), function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openBanner(true); });
  });

  /* ---------- Meta Pixel: csak a „Marketing” süti-hozzájárulás után töltődik be ---------- */
  var PIXEL_ID = '1419425487034774', pixelOn = false;
  function loadPixel() {
    if (pixelOn) return; pixelOn = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID); fbq('track', 'PageView');
  }
  function pixelCheck() { var c = window.qhConsent.current; if (c && c.marketing) loadPixel(); }
  document.addEventListener('qh:consent', pixelCheck);
  pixelCheck();

  if (!window.qhConsent.current) openBanner(false);
})();
