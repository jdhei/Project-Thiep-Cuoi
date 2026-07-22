/* ============================================================
   invite.js — logic thiệp mẫu: mở overlay, phong bì, đếm ngược,
               RSVP, lời chúc, gallery lightbox, .ics, nhạc nền
   Phụ thuộc window.UI (ui.js)
   ============================================================ */
(function () {
  'use strict';

  var WEDDING_DATE = '2026-12-20T08:00:00+07:00';

  document.addEventListener('DOMContentLoaded', function () {
    var UI = window.UI;
    var overlay = document.getElementById('inviteOverlay');
    var envScene = document.getElementById('envScene');
    var envelope = document.getElementById('envelope');
    var cdTimer = null;

    /* ---------- mở / đóng overlay ---------- */
    function openInvite() {
      overlay.classList.add('open');
      document.body.classList.add('locked');
      envScene.classList.remove('gone');
      envelope.classList.remove('opening');
      overlay.scrollTop = 0;
      startCountdown();
    }
    function closeInvite() {
      overlay.classList.remove('open');
      document.body.classList.remove('locked');
      stopMusic();
    }
    document.querySelectorAll('[data-open-invite]').forEach(function (el) {
      el.addEventListener('click', openInvite);
    });
    document.getElementById('invClose').addEventListener('click', closeInvite);

    /* ---------- mở phong bì ---------- */
    function openEnvelope() {
      if (envelope.classList.contains('opening')) return;
      envelope.classList.add('opening');
      UI.burstConfetti(envelope.getBoundingClientRect());
      setTimeout(function () {
        envScene.classList.add('gone');
        UI.observeReveals(overlay);
      }, 1200);
    }
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
    });

    /* ---------- đếm ngược ---------- */
    function startCountdown() {
      var target = new Date(WEDDING_DATE).getTime();
      clearInterval(cdTimer);
      function set(id, v) {
        var el = document.getElementById(id);
        if (el) el.textContent = String(v).padStart(2, '0');
      }
      function tick() {
        var diff = Math.max(0, target - Date.now());
        var d = Math.floor(diff / 864e5); diff -= d * 864e5;
        var h = Math.floor(diff / 36e5); diff -= h * 36e5;
        var m = Math.floor(diff / 6e4); diff -= m * 6e4;
        var s = Math.floor(diff / 1e3);
        set('cd-d', d); set('cd-h', h); set('cd-m', m); set('cd-s', s);
      }
      tick();
      cdTimer = setInterval(tick, 1000);
    }

    /* ---------- RSVP: stepper + trạng thái tham dự ---------- */
    var ppl = 1;
    var pplVal = document.getElementById('pplVal');
    var peopleField = document.getElementById('peopleField');
    document.getElementById('plus').addEventListener('click', function () {
      ppl = Math.min(20, ppl + 1); pplVal.textContent = ppl;
    });
    document.getElementById('minus').addEventListener('click', function () {
      ppl = Math.max(1, ppl - 1); pplVal.textContent = ppl;
    });
    document.querySelectorAll('input[name="att"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var attend = document.querySelector('input[name="att"]:checked').value === 'yes';
        peopleField.style.opacity = attend ? '1' : '.45';
        peopleField.style.pointerEvents = attend ? 'auto' : 'none';
      });
    });

    /* ---------- RSVP submit ---------- */
    document.getElementById('rsvpForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target;
      form.style.transition = 'opacity .4s, transform .4s';
      form.style.opacity = '0';
      form.style.transform = 'translateY(-10px)';
      UI.burstConfetti({ left: window.innerWidth / 2 - 40, top: window.innerHeight / 3, width: 80, height: 20 });
      setTimeout(function () {
        form.style.display = 'none';
        document.getElementById('rsvpSuccess').classList.add('show');
      }, 400);
    });

    /* ---------- lời chúc ---------- */
    document.getElementById('wishForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      var name = f.wname.value.trim();
      var msg = f.wmsg.value.trim();
      if (!name || !msg) return;
      var w = document.createElement('div');
      w.className = 'wish new';
      w.innerHTML = '<div class="who"></div><div class="msg"></div>';
      w.querySelector('.who').textContent = name;
      w.querySelector('.msg').textContent = msg;
      document.getElementById('wishList').prepend(w);
      f.reset();
      UI.showToast('Cảm ơn lời chúc của bạn! Sẽ hiển thị sau khi được duyệt ♡');
    });

    /* ---------- gallery lightbox ---------- */
    var lightbox = document.getElementById('lightbox');
    var lbBox = document.getElementById('lightboxBox');
    document.querySelectorAll('.gallery .g').forEach(function (g) {
      g.addEventListener('click', function () {
        lbBox.textContent = g.querySelector('span').textContent;
        lbBox.style.background = getComputedStyle(g).background;
        lightbox.classList.add('open');
      });
    });
    lightbox.addEventListener('click', function () { lightbox.classList.remove('open'); });

    /* ---------- tải file .ics ---------- */
    document.getElementById('icsBtn').addEventListener('click', function () {
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
        'SUMMARY:Lễ cưới Quân & Linh',
        'DTSTART:20261220T010000Z', 'DTEND:20261220T060000Z',
        'LOCATION:Trung tâm tiệc cưới Sen Vàng, Hà Nội',
        'DESCRIPTION:Trân trọng kính mời!', 'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      var blob = new Blob([ics], { type: 'text/calendar' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'dam-cuoi-quan-linh.ics';
      a.click();
      URL.revokeObjectURL(url);
      UI.showToast('Đã tải file lịch .ics 📅');
    });

    /* ---------- nhạc nền (WebAudio, không cần file ngoài) ---------- */
    var audioCtx = null, musicOn = false, musicTimer = null, master = null;
    var musicFab = document.getElementById('musicFab');
    var notes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33];

    function startMusic() {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        master = audioCtx.createGain();
        master.gain.value = 0.12;
        master.connect(audioCtx.destination);
        var i = 0;
        musicOn = true;
        musicFab.classList.add('playing');
        (function play() {
          if (!musicOn) return;
          var o = audioCtx.createOscillator();
          var g = audioCtx.createGain();
          o.type = 'sine';
          o.frequency.value = notes[i % notes.length];
          g.gain.setValueAtTime(0, audioCtx.currentTime);
          g.gain.linearRampToValueAtTime(0.9, audioCtx.currentTime + 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
          o.connect(g); g.connect(master);
          o.start(); o.stop(audioCtx.currentTime + 1.3);
          i++;
          musicTimer = setTimeout(play, 650);
        })();
        UI.showToast('Đang phát nhạc nền 🎵');
      } catch (err) {
        UI.showToast('Trình duyệt không hỗ trợ nhạc nền');
      }
    }
    function stopMusic() {
      musicOn = false;
      musicFab.classList.remove('playing');
      if (musicTimer) clearTimeout(musicTimer);
      try { if (master) master.disconnect(); } catch (e) {}
    }
    musicFab.addEventListener('click', function () {
      if (musicOn) stopMusic(); else startMusic();
    });

    /* ---------- phím Esc ---------- */
    window.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (lightbox.classList.contains('open')) {
        lightbox.classList.remove('open');
      } else if (overlay.classList.contains('open')) {
        closeInvite();
      }
    });
  });
})();
