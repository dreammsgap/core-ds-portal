(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function onKey(el, fn) {
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); }
    });
  }

  // Toast
  var toastEl = document.createElement('div');
  toastEl.className = 'toast';
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }

  // Back to top + header shadow
  var header = $('.header');
  var backTop = document.createElement('button');
  backTop.type = 'button';
  backTop.className = 'back-top';
  backTop.setAttribute('aria-label', 'Back to top');
  backTop.innerHTML = '&uarr;';
  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  document.body.appendChild(backTop);
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    backTop.classList.toggle('is-on', window.scrollY > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scrollspy for the nav
  var spyMap = $$('.nav a').map(function (a) {
    return { a: a, t: document.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (m) { return m.t; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        spyMap.forEach(function (m) {
          var on = m.t === e.target;
          m.a.classList.toggle('is-active', on);
          if (on) m.a.setAttribute('aria-current', 'true'); else m.a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyMap.forEach(function (m) { spy.observe(m.t); });
  }

  // Scroll reveal (only for content below the fold, so nothing flashes)
  if (!reduce && 'IntersectionObserver' in window) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('is-in');
        reveal.unobserve(el);
        setTimeout(function () {
          el.classList.remove('reveal', 'is-in');
          el.style.removeProperty('--d');
        }, 1000);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.section h2, .section h3, .lead, .search, .card, .preview, .ai__img, .ai__copy, .cta, .footer__main > *, .actions').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', Math.min(idx, 5) * 70 + 'ms');
      el.classList.add('reveal');
      reveal.observe(el);
    });
  }

  // Count-up numbers
  $$('.card h4').forEach(function (h) {
    var m = h.textContent.match(/^(\d+)(.*)$/);
    if (m) h.innerHTML = '<span data-count="' + m[1] + '">' + m[1] + '</span>' + m[2];
  });
  var fc = $('.float-card strong');
  if (fc) fc.setAttribute('data-count', fc.textContent.trim());
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    var t0 = performance.now();
    (function step(t) {
      var p = Math.min((t - t0) / 900, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var counters = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        counters.unobserve(e.target);
        countUp(e.target);
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { el.textContent = '0'; counters.observe(el); });
  }

  // Hero pointer parallax
  var art = $('.hero__art');
  if (art && !reduce && window.matchMedia('(hover: hover)').matches) {
    art.addEventListener('pointermove', function (e) {
      var r = art.getBoundingClientRect();
      art.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * 14 + 'px');
      art.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5) * 10 + 'px');
    });
    art.addEventListener('pointerleave', function () {
      art.style.setProperty('--mx', '0px');
      art.style.setProperty('--my', '0px');
    });
  }

  // Live search: filters components and foundation cards while typing
  var q = $('#q');
  var status = $('#searchStatus');
  if (q) {
    var previews = $$('.preview');
    var found = $$('.cards .card');
    q.addEventListener('input', function () {
      var term = q.value.trim().toLowerCase();
      var np = 0, nc = 0;
      previews.forEach(function (p) {
        var hide = !!term && p.dataset.name.toLowerCase().indexOf(term) === -1;
        p.hidden = hide;
        if (!hide) np++;
      });
      found.forEach(function (c) {
        var hide = !!term && c.textContent.toLowerCase().indexOf(term) === -1;
        c.hidden = hide;
        if (!hide) nc++;
      });
      status.textContent = term ? np + ' component' + (np === 1 ? '' : 's') + ' and ' + nc + ' foundation' + (nc === 1 ? '' : 's') + ' match.' : '';
    });
  }

  // DatePicker: pick a day
  var cal = $('.cal');
  if (cal) {
    cal.removeAttribute('aria-hidden');
    cal.setAttribute('role', 'group');
    cal.setAttribute('aria-label', 'Pick a date');
    var days = $$('span', cal).filter(function (s) { return /^\d+$/.test(s.textContent); });
    days.forEach(function (d) {
      d.setAttribute('role', 'button');
      d.tabIndex = 0;
      d.setAttribute('aria-pressed', String(d.classList.contains('on')));
      d.addEventListener('click', function () { pick(d); });
      onKey(d, function () { pick(d); });
    });
    var pick = function (sel) {
      days.forEach(function (d) {
        var on = d === sel;
        d.classList.toggle('on', on);
        d.setAttribute('aria-pressed', String(on));
      });
    };
  }

  // Tour: step through
  var tour = $('.tour');
  if (tour) {
    var steps = [
      ['Add your first transfer', 'Tap here to send money between your own accounts.'],
      ['Check your balance', 'Your balance and recent activity live right here.'],
      ['Pay a bill', 'Pick a saved biller and pay in a few taps.']
    ];
    var title = $('strong', tour), body = $('p', tour), next = $('footer a', tour), dots = $$('.dots b', tour), step = 0;
    var render = function () {
      title.textContent = steps[step][0];
      body.textContent = steps[step][1];
      dots.forEach(function (d, k) { d.classList.toggle('on', k === step); });
      next.innerHTML = step === steps.length - 1 ? 'Done &#10003;' : 'Next &rarr;';
      tour.classList.remove('swap');
      void tour.offsetWidth;
      tour.classList.add('swap');
    };
    tour.setAttribute('aria-live', 'polite');
    next.addEventListener('click', function (e) {
      e.preventDefault();
      if (step === steps.length - 1) { step = 0; toast('Tour complete'); } else { step++; }
      render();
    });
    dots.forEach(function (d, k) {
      d.setAttribute('role', 'button');
      d.tabIndex = 0;
      d.setAttribute('aria-label', 'Step ' + (k + 1));
      d.addEventListener('click', function () { step = k; render(); });
      onKey(d, function () { step = k; render(); });
    });
  }

  // FloatButton: speed dial
  var oldFab = $('.fab');
  if (oldFab) {
    var wrap = document.createElement('div');
    wrap.className = 'fab-wrap';
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'fab';
    fab.setAttribute('aria-label', 'Quick actions');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<span aria-hidden="true">+</span>';
    var acts = document.createElement('div');
    acts.className = 'fab-actions';
    [['Transfer', '⇄'], ['Pay', '฿'], ['Scan', '▣']].forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.title = a[0];
      b.setAttribute('aria-label', a[0]);
      b.textContent = a[1];
      b.addEventListener('click', function () { toast(a[0] + ' opened (demo)'); setOpen(false); });
      acts.appendChild(b);
    });
    wrap.appendChild(acts);
    wrap.appendChild(fab);
    oldFab.replaceWith(wrap);
    var setOpen = function (open) {
      wrap.classList.toggle('is-open', open);
      fab.setAttribute('aria-expanded', String(open));
    };
    fab.addEventListener('click', function () { setOpen(!wrap.classList.contains('is-open')); });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // Splitter: drag or use arrow keys
  var sp = $('.splitter');
  if (sp) {
    sp.removeAttribute('aria-hidden');
    var left = sp.children[0], bar = sp.children[1], right = sp.children[2], pct = 50;
    var setPct = function (v) {
      pct = Math.max(15, Math.min(85, v));
      left.style.flex = '0 0 ' + pct + '%';
      right.style.flex = '1 1 0';
      left.textContent = Math.round(pct) + '%';
      right.textContent = Math.round(100 - pct) + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    };
    bar.setAttribute('role', 'separator');
    bar.setAttribute('aria-orientation', 'vertical');
    bar.setAttribute('aria-label', 'Resize panels');
    bar.setAttribute('aria-valuemin', '15');
    bar.setAttribute('aria-valuemax', '85');
    bar.tabIndex = 0;
    bar.addEventListener('pointerdown', function (e) {
      bar.setPointerCapture(e.pointerId);
      sp.classList.add('is-drag');
    });
    bar.addEventListener('pointermove', function (e) {
      if (!bar.hasPointerCapture(e.pointerId)) return;
      var r = sp.getBoundingClientRect();
      setPct((e.clientX - r.left) / r.width * 100);
    });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      bar.addEventListener(t, function () { sp.classList.remove('is-drag'); });
    });
    bar.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); setPct(pct - 5); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setPct(pct + 5); }
    });
    setPct(50);
  }

  // Masonry tiles: pin / unpin
  var mas = $('.masonry');
  if (mas) {
    mas.removeAttribute('aria-hidden');
    $$('i', mas).forEach(function (t) {
      t.setAttribute('role', 'button');
      t.setAttribute('aria-pressed', 'false');
      t.tabIndex = 0;
      var toggle = function () {
        var on = !t.classList.contains('on');
        t.classList.toggle('on', on);
        t.setAttribute('aria-pressed', String(on));
      };
      t.addEventListener('click', toggle);
      onKey(t, toggle);
    });
  }

  // Footer registry links copy their path
  $$('.footer li a').forEach(function (a) {
    var txt = a.textContent.trim();
    if (txt.charAt(0) !== '/') return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var done = function () { toast('Copied ' + txt); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, done);
      } else {
        done();
      }
    });
  });
})();
