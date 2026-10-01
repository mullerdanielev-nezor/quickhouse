/* Előtte–utána összehasonlító slider: húzással, érintéssel és billentyűvel is használható. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('[data-compare]'), function (root) {
    var range = root.querySelector('.ba-range'), raf = 0, stopped = false;
    function set(v) { root.style.setProperty('--pos', v + '%'); }
    function stop() { stopped = true; if (raf) cancelAnimationFrame(raf); }
    range.addEventListener('input', function () { stop(); set(range.value); });
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { root.addEventListener(ev, stop, { passive: true }); });
    set(50);
    if (reduce) return;
    /* figyelemfelhívó „pásztázás”: egyszer végigmegy a képen, hogy látszódjon, húzható */
    var t0 = null, DUR = 2800;
    function tick(ts) {
      if (stopped) return;
      if (t0 === null) t0 = ts;
      var t = Math.min((ts - t0) / DUR, 1);
      var v = 50 - 34 * Math.sin(t * 2 * Math.PI);
      set(v); range.value = v;
      if (t < 1) raf = requestAnimationFrame(tick); else { set(50); range.value = 50; }
    }
    setTimeout(function () { if (!stopped) raf = requestAnimationFrame(tick); }, 900);
  });
})();
