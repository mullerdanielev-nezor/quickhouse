/* Egyszerű, függőség nélküli slider a hero-változatokhoz: automata lapozás, nyilak, pontok, bélyegképek, húzás (swipe). */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('[data-slider]'), function (root) {
    var track = root.querySelector('.track');
    var slides = Array.prototype.slice.call(root.querySelectorAll(track ? '.tslide' : '.slide'));
    var n = slides.length, i = 0, timer = null, DUR = 5000;
    var dotsBox = root.querySelector('[data-dots]'), dots = [];
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-thumb]'));

    if (dotsBox) {
      slides.forEach(function (_, k) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', (k + 1) + '. kép');
        b.innerHTML = '<i></i>'; b.addEventListener('click', function () { go(k, true); });
        dotsBox.appendChild(b); dots.push(b);
      });
    }
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { go(k, true); }); });

    function go(k, user) {
      i = (k + n) % n;
      if (track) {
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        track.style.transform = 'translateX(' + (-i * (slides[0].getBoundingClientRect().width + gap)) + 'px)';
      } else {
        slides.forEach(function (s, j) { s.classList.toggle('on', j === i); });
      }
      dots.forEach(function (d, j) {
        d.classList.remove('on', 'done');
        if (j < i) d.classList.add('done');
        if (j === i) { void d.offsetWidth; d.classList.add('on'); }
      });
      thumbs.forEach(function (t, j) { t.classList.toggle('on', j === i); });
      if (user) restart();
    }
    function next() { go(i + 1); }
    function restart() { stop(); if (!reduce) timer = setInterval(next, DUR); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    var p = root.querySelector('[data-prev]'), q = root.querySelector('[data-next]');
    if (p) p.addEventListener('click', function () { go(i - 1, true); });
    if (q) q.addEventListener('click', function () { go(i + 1, true); });
    root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', restart);

    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 !== null) { var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), true); else restart(); }
      x0 = null;
    });
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(i + 1, true); if (e.key === 'ArrowLeft') go(i - 1, true); });
    window.addEventListener('resize', function () { go(i); });
    go(0); restart();
  });
})();
