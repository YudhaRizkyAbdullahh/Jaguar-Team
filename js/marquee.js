// Marquee halus tanpa jeda menggunakan requestAnimationFrame
// Bekerja dengan konten yang digandakan: mengasumsikan daftar berisi dua set item berturut-turut
(() => {
  const selector = '.marquee-list';
  const wrapperSelector = '.marquee-wrap';

  function init() {
    const list = document.querySelector(selector);
    const wrap = document.querySelector(wrapperSelector);
    if (!list || !wrap) return;
    let rafId = null;
    const pixelsPerSecond = 15; // kecepatan: px / detik
    let paused = false;

    // Atur hint tata letak agar perhitungan transform akurat
    wrap.style.overflow = 'hidden';
    list.style.display = 'flex';
    list.style.flexWrap = 'nowrap';
    list.style.willChange = 'transform';

    // Pastikan ada duplikasi item: gandakan set asli beberapa kali sebagai buffer
    (function ensureDuplication() {
      if (list.dataset.marqueeCloned === 'true') return;
      const children = Array.from(list.children);
      if (!children.length) return;

      // Anggap children saat ini sebagai "set asli"
      const original = children.slice();
      const origCount = original.length;

      // Cek apakah sudah ada duplikat
      let hasDuplicate = false;
      for (let i = 1; i < children.length; i++) {
        if (children[i].outerHTML === children[0].outerHTML) {
          hasDuplicate = true;
          break;
        }
      }

      // Jika belum ada duplikat, tambahkan dua klon (total set: asli + 2 klon)
      const cloneTimes = hasDuplicate ? 0 : 2;
      for (let t = 0; t < cloneTimes; t++) {
        original.forEach(node => {
          const clone = node.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.dataset.cloned = 'true';
          list.appendChild(clone);
        });
      }

      // Simpan metadata untuk perhitungan set
      list.dataset.marqueeCloned = 'true';
      list.dataset.marqueeOriginalCount = String(origCount);
      list.dataset.marqueeSets = String(Math.max(1, Math.round(list.children.length / origCount)));
    })();

    // Tunggu gambar di dalam daftar selesai dimuat supaya scrollWidth akurat
    function waitForImages(timeout = 800) {
      const imgs = Array.from(list.querySelectorAll('img'));
      if (!imgs.length) return Promise.resolve();
      const pending = imgs.filter(i => !i.complete);
      if (!pending.length) return Promise.resolve();

      return new Promise(resolve => {
        let finished = false;
        const onDone = () => {
          if (finished) return;
          finished = true;
          resolve();
        };
        pending.forEach(img => {
          img.addEventListener('load', onDone, { once: true });
          img.addEventListener('error', onDone, { once: true });
        });
        // fallback timeout
        setTimeout(onDone, timeout);
      });
    }

    // Ukur lebar satu set dengan membagi scrollWidth dengan jumlah set
    function measure() {
      // Hapus sementara transform agar pengukuran akurat
      const prevTransform = list.style.transform;
      list.style.transform = 'none';
      const total = list.scrollWidth || 0;
      const sets = parseInt(list.dataset.marqueeSets, 10) || 2;
      const setWidth = Math.max(1, Math.round(total / sets));
      // kembalikan transform
      list.style.transform = prevTransform;
      return setWidth;
    }

    let resetAt = 0;
    let x = 0;
    let lastTime = 0;

    function step(now) {
      if (!lastTime) lastTime = now;
      const dt = now - lastTime; // ms
      lastTime = now;
      if (!paused && resetAt > 0) {
        const dx = (pixelsPerSecond * dt) / 1000; // px yang berpindah pada frame ini
        x -= dx;
        // jaga x agar selalu di rentang [-resetAt, 0) untuk transform kontinu
        if (Math.abs(x) >= resetAt) {
          // normalisasi ke [0, resetAt)
          const m = ((x % resetAt) + resetAt) % resetAt;
          // ubah ke rentang negatif (-resetAt .. 0]
          x = m - resetAt;
        }
        list.style.transform = `translate3d(${x}px,0,0)`;
      }
      rafId = requestAnimationFrame(step);
    }

    function start() {
      if (!rafId) rafId = requestAnimationFrame(step);
    }
    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      lastTime = 0;
    }

    // Jeda saat hover / fokus
    wrap.addEventListener('mouseenter', () => (paused = true));
    wrap.addEventListener('mouseleave', () => (paused = false));
    wrap.addEventListener('focusin', () => (paused = true));
    wrap.addEventListener('focusout', () => (paused = false));

    // Hitung ulang pada resize dan setelah gambar dimuat
    let resizeTimer = null;
    function recalc() {
      const m = measure();
      if (m > 0) resetAt = m;
      // pastikan x tetap dalam batas
      if (resetAt > 0) x = x % resetAt;
    }
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recalc, 120);
    });

    // Mulai setelah gambar (jika ada) selesai dimuat agar pengukuran akurat
    waitForImages(1000).then(() => {
      recalc();
      start();
    });
  }

  // Inisialisasi saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();