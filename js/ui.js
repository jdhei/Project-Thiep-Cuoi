/* ============================================================
   ui.js — tương tác chung: ripple, nút nam châm, nav,
           scroll-reveal, cánh hoa, toast
   Được nạp trước invite.js; export vài hàm qua window.UI
   ============================================================ */
(function () {
  'use strict';

  /* ---------- ripple cho mọi .btn ---------- */
  function attachRipple(el) {
    el.addEventListener('pointerdown', function (e) {
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var r = document.createElement('span');
      r.className = 'ripple';
      r.style.width = r.style.height = size + 'px';
      r.style.left = (e.clientX - rect.left - size / 2) + 'px';
      r.style.top = (e.clientY - rect.top - size / 2) + 'px';
      el.appendChild(r);
      setTimeout(function () { r.remove(); }, 650);
    });
  }
  function initRipples(root) {
    (root || document).querySelectorAll('.btn').forEach(attachRipple);
  }

  /* ---------- nút "nam châm" (chỉ thiết bị có chuột) ---------- */
  function initMagnetic() {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    document.querySelectorAll('.btn:not(.small)').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = 'translate(' + (x * 8) + 'px,' + (y * 8 - 2) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- nav: scroll shadow + burger menu ---------- */
  function initNav() {
    var nav = document.getElementById('nav');
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    var burger = document.getElementById('burger');
    var navLinks = document.getElementById('navLinks');
    var scrim = document.getElementById('navScrim');
    function closeMenu() {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      if (scrim) scrim.classList.remove('show');
    }
    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      if (scrim) scrim.classList.toggle('show', open);
    });
    if (scrim) scrim.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a,button').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14 });
  function observeReveals(root) {
    (root || document).querySelectorAll('.reveal:not(.in)').forEach(function (el) { io.observe(el); });
  }

  /* ---------- cánh hoa rơi ---------- */
  var petalSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c3 4 6 6 6 10a6 6 0 1 1-12 0c0-4 3-6 6-10Z"/></svg>';
  var petalColors = ['#E6D3AC', '#C97A88', '#D9C39A'];
  function spawnPetal() {
    if (document.hidden) return;
    var p = document.createElement('div');
    p.className = 'petal';
    p.innerHTML = petalSvg;
    p.style.left = Math.random() * 100 + 'vw';
    var dur = 7 + Math.random() * 7;
    p.style.animationDuration = dur + 's';
    p.style.transform = 'scale(' + (0.5 + Math.random()) + ')';
    p.style.color = petalColors[Math.floor(Math.random() * petalColors.length)];
    document.body.appendChild(p);
    setTimeout(function () { p.remove(); }, dur * 1000);
  }

  /* ---------- toast ---------- */
  var toastEl, toastTimer;
  function showToast(msg) {
    toastEl = toastEl || document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------- confetti ---------- */
  var confColors = ['#B8935A', '#C9A96A', '#A8324A', '#C97A88', '#7C8B6F', '#E6D3AC'];
  function burstConfetti(rect) {
    var cx = rect.left + rect.width / 2;
    for (var n = 0; n < 60; n++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = cx + (Math.random() - 0.5) * rect.width + 'px';
      c.style.top = rect.top + 'px';
      c.style.width = (6 + Math.random() * 6) + 'px';
      c.style.height = (8 + Math.random() * 8) + 'px';
      c.style.background = confColors[Math.floor(Math.random() * confColors.length)];
      c.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
      c.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      if (Math.random() > 0.5) c.style.borderRadius = '50%';
      document.body.appendChild(c);
      setTimeout(function (el) { return function () { el.remove(); }; }(c), 4200);
    }
  }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initRipples();
    initMagnetic();
    initNav();
    observeReveals();
    if (!window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      setInterval(spawnPetal, 1400);
    }
  });

  /* ---------- export ---------- */
  window.UI = {
    initRipples: initRipples,
    observeReveals: observeReveals,
    showToast: showToast,
    burstConfetti: burstConfetti
  };
})();
