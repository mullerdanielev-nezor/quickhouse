/* Folyamatábra-változatok: kattintható lépésváltó (05) és görgetésre kiemelő oldalsáv (10). */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (root) {
    var btns = Array.prototype.slice.call(root.querySelectorAll('.steps button'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.panel'));
    var i = 0, timer = null;
    function go(k, user) {
      i = (k + btns.length) % btns.length;
      btns.forEach(function (b, j) { b.classList.toggle('on', j === i); b.classList.toggle('done', j < i); });
      panels.forEach(function (p, j) { p.classList.toggle('on', j === i); });
      if (user && timer) { clearInterval(timer); timer = null; }
    }
    btns.forEach(function (b, j) { b.addEventListener('click', function () { go(j, true); }); });
    if (!reduce) timer = setInterval(function () { go(i + 1); }, 4000);
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-spy]'), function (root) {
    var items = Array.prototype.slice.call(root.querySelectorAll('.it'));
    var nav = Array.prototype.slice.call(root.querySelectorAll('.nav li'));
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = parseInt(e.target.getAttribute('data-i'), 10);
        items.forEach(function (it, j) { it.classList.toggle('on', j === k); });
        nav.forEach(function (n, j) { n.classList.toggle('on', j === k); });
      });
    }, { rootMargin: '-35% 0px -45% 0px' });
    items.forEach(function (it) { io.observe(it); });
  });
})();
