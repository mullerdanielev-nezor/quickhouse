/* Mobil folyamatábra-változatok: pontok (M2), számláló (M3), léptető (M7). */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* M2: pontok a húzható sorhoz */
  Array.prototype.forEach.call(document.querySelectorAll('[data-snap]'), function (w) {
    var sc = w.querySelector('.m2'), items = Array.prototype.slice.call(sc.children), box = w.querySelector('.dots');
    items.forEach(function () { box.appendChild(document.createElement('i')); });
    var dots = box.children;
    function upd() {
      var c = sc.scrollLeft + sc.clientWidth / 2, best = 0, bd = 1e9;
      items.forEach(function (li, k) { var d = Math.abs(li.offsetLeft + li.offsetWidth / 2 - c); if (d < bd) { bd = d; best = k; } });
      Array.prototype.forEach.call(dots, function (d, k) { d.classList.toggle('on', k === best); });
    }
    sc.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
    upd();
  });

  /* M3: „1 / 5” számláló */
  Array.prototype.forEach.call(document.querySelectorAll('[data-vsnap]'), function (w) {
    var sc = w.querySelector('.m3'), pill = w.querySelector('.pill'), n = sc.children.length;
    sc.addEventListener('scroll', function () {
      var k = Math.round(sc.scrollTop / sc.clientHeight) + 1; pill.textContent = Math.min(k, n) + ' / ' + n;
    }, { passive: true });
  });

  /* M7: léptető */
  Array.prototype.forEach.call(document.querySelectorAll('[data-stage]'), function (root) {
    var sl = Array.prototype.slice.call(root.querySelectorAll('.sl')), st = Array.prototype.slice.call(root.querySelectorAll('.st li'));
    var i = 0, timer = null, x0 = null;
    function go(k, user) {
      i = (k + sl.length) % sl.length;
      sl.forEach(function (s, j) { s.classList.toggle('on', j === i); });
      st.forEach(function (s, j) { s.classList.toggle('on', j === i); s.classList.toggle('done', j < i); });
      if (user && timer) { clearInterval(timer); timer = null; }
    }
    root.querySelector('.pv').addEventListener('click', function () { go(i - 1, true); });
    root.querySelector('.nx').addEventListener('click', function () { go(i + 1, true); });
    st.forEach(function (s, j) { s.addEventListener('click', function () { go(j, true); }); });
    var stage = root.querySelector('.stage');
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), true); x0 = null; });
    if (!reduce) timer = setInterval(function () { go(i + 1); }, 4500);
  });
})();
