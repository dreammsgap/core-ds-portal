(function () {
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');

  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function () { setMenu(false); });

  // Language toggle (TH / EN) for key strings
  var TH = {
    'nav.live': 'โปรเจกต์จริง',
    'nav.start': 'เริ่มต้นใช้งาน',
    'nav.ai': 'ขับเคลื่อนด้วย AI',
    'nav.ds': 'ศูนย์รวม Design System',
    'nav.contact': 'ติดต่อเรา',
    'nav.login': 'เข้าสู่ระบบ',
    'hero.h1': 'ออกแบบครั้งเดียว<br>ใช้ได้ทุกที่',
    'hero.p': 'โทเคน คอมโพเนนต์ และเทมเพลตสำหรับเว็บไซต์ทุกผลิตภัณฑ์ของธนาคารกรุงเทพ ไม่มีกฎซ่อน',
    'hero.cta': 'เริ่มต้นใช้งาน',
    'hero.link': 'โปรเจกต์จริง →',
    'search.h2': 'คุณกำลังมองหาอะไรอยู่หรือเปล่า?',
    'search.btn': 'ค้นหา',
    'ai.h2': 'ขับเคลื่อนด้วย AI',
    'cta.h2': 'พร้อมปรับปรุง<br>การทำงานของคุณหรือยัง?',
    'cta.btn': 'เริ่มต้นใช้งาน'
  };
  var nodes = document.querySelectorAll('[data-i18n]');
  nodes.forEach(function (el) { el.dataset.en = el.innerHTML; });

  function setLang(lang) {
    document.documentElement.lang = lang;
    nodes.forEach(function (el) {
      el.innerHTML = lang === 'th' ? TH[el.dataset.i18n] : el.dataset.en;
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    try { localStorage.setItem('core-lang', lang); } catch (e) {}
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });
  try {
    var saved = localStorage.getItem('core-lang');
    if (saved === 'th') setLang('th');
  } catch (e) {}

  // Search: filters the component previews by name
  var form = document.getElementById('searchForm');
  var input = document.getElementById('q');
  var status = document.getElementById('searchStatus');
  var previews = Array.prototype.slice.call(document.querySelectorAll('.preview'));

  function runSearch(term) {
    term = term.trim().toLowerCase();
    var shown = 0;
    previews.forEach(function (p) {
      var match = !term || p.dataset.name.toLowerCase().indexOf(term) !== -1;
      p.hidden = !match;
      if (match) shown++;
    });
    if (!term) {
      status.textContent = '';
      return;
    }
    status.textContent = shown
      ? shown + ' matching component' + (shown > 1 ? 's' : '') + ' in the latest updates.'
      : 'No match in the latest updates. Try Button, DatePicker or Tour.';
    document.getElementById('components').scrollIntoView({ behavior: 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    runSearch(input.value);
  });
  input.addEventListener('input', function () { if (!input.value) runSearch(''); });
  document.querySelectorAll('[data-q]').forEach(function (b) {
    b.addEventListener('click', function () {
      input.value = b.dataset.q;
      runSearch(b.dataset.q);
    });
  });
})();
