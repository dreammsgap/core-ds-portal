(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  // Split a heading into words that can slide up one by one
  function splitWords(el) {
    var i = 0;
    var out = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { out.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span');
          w.className = 'mw';
          var s = document.createElement('span');
          s.textContent = part;
          s.style.setProperty('--i', i++);
          w.appendChild(s);
          out.appendChild(w);
        });
      } else {
        out.appendChild(n);
      }
    });
    el.textContent = '';
    el.appendChild(out);
  }

  // Hero headline on load
  var h1 = $('.hero h1');
  if (h1) {
    splitWords(h1);
    h1.style.setProperty('--base', '300ms');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { h1.classList.add('m-in'); });
    });
  }

  // Section headings on scroll
  var headings = $$('.section h2, .discover h3').filter(function (h) { return !h.closest('.hero'); });
  var hio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('m-in');
      hio.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  headings.forEach(function (h) {
    if (h.hasAttribute('data-i18n')) return;
    h.classList.remove('reveal');
    splitWords(h);
    hio.observe(h);
  });

  // Scroll progress bar
  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var ticking = false;
  function updateBar() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  // Marquee strip under the hero
  var hero = $('.hero');
  if (hero) {
    var names = ['Button', 'Token', 'Pattern', 'Flow', 'DatePicker', 'Tour', 'FloatButton', 'Splitter', 'Masonry', 'Colour', 'Typography', 'Spacing', 'Radius', 'Motion', 'Accessibility', 'Templates', 'Changelog', 'MCP ready'];
    var m = document.createElement('div');
    m.className = 'marquee';
    m.setAttribute('aria-hidden', 'true');
    var track = document.createElement('div');
    track.className = 'marquee__track';
    for (var copy = 0; copy < 2; copy++) {
      names.forEach(function (n) {
        var s = document.createElement('span');
        s.textContent = n;
        track.appendChild(s);
      });
    }
    m.appendChild(track);
    hero.parentNode.insertBefore(m, hero.nextSibling);
  }

  // Demos that play by themselves until the visitor touches them
  function autoplay(el, fn, ms) {
    if (!el) return;
    var timer = null, touched = false;
    function stop() { clearInterval(timer); timer = null; }
    ['pointerdown', 'keydown', 'focusin'].forEach(function (t) {
      el.addEventListener(t, function () { touched = true; stop(); });
    });
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (touched) return;
        if (e.isIntersecting) { if (!timer) timer = setInterval(fn, ms); } else { stop(); }
      });
    }, { threshold: 0.4 }).observe(el);
  }

  var cal = $('.cal');
  if (cal) {
    var days = $$('[role="button"]', cal);
    var di = Math.max(0, days.findIndex(function (d) { return d.classList.contains('on'); }));
    autoplay(cal, function () {
      if (!days.length) return;
      di = (di + 1) % days.length;
      days.forEach(function (d, k) {
        d.classList.toggle('on', k === di);
        d.setAttribute('aria-pressed', String(k === di));
      });
    }, 1300);
  }

  var tour = $('.tour');
  if (tour) {
    var dots = $$('.dots b', tour);
    autoplay(tour, function () {
      if (!dots.length) return;
      var cur = dots.findIndex(function (d) { return d.classList.contains('on'); });
      dots[(cur + 1) % dots.length].click();
    }, 2800);
  }

  var sp = $('.splitter');
  if (sp && sp.children.length === 3) {
    var a = sp.children[0], b = sp.children[1], c = sp.children[2], t = 0;
    autoplay(sp, function () {
      t += 0.09;
      var p = 50 + 16 * Math.sin(t);
      a.style.flex = '0 0 ' + p + '%';
      c.style.flex = '1 1 0';
      a.textContent = Math.round(p) + '%';
      c.textContent = Math.round(100 - p) + '%';
      b.setAttribute('aria-valuenow', String(Math.round(p)));
    }, 50);
  }
})();
