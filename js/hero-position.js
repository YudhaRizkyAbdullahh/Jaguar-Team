(function(){
  // Menempatkan ulang tombol aksi pada hero di bawah heading hero yang sedang terlihat.
  // Cara kerja: cari elemen .hero-text yang memiliki opacity terbesar (paling terlihat), lalu
  // posisikan elemen .hero-actions-top tepat di bawahnya.

  function findActiveHeading() {
    const headings = Array.from(document.querySelectorAll('.hero-text'));
    if (!headings.length) return null;
  // Pilih heading dengan opacity > 0.15 (terlihat saat animasi); jika tidak ada, gunakan yang pertama
    for (const h of headings) {
      const st = getComputedStyle(h);
      const op = parseFloat(st.opacity || 0);
      if (op > 0.15) return h;
    }
  // Jika tidak ada yang melewati ambang, pilih yang memiliki opacity terbesar
    let best = headings[0];
    let bestOp = parseFloat(getComputedStyle(best).opacity || 0);
    for (const h of headings) {
      const op = parseFloat(getComputedStyle(h).opacity || 0);
      if (op > bestOp) { bestOp = op; best = h; }
    }
    return best;
  }

  function updatePosition() {
    const actions = document.querySelector('.hero-actions-top');
    const overlay = document.querySelector('.absolute.inset-0');
    if (!actions || !overlay) return;
    const active = findActiveHeading();
    if (!active) return;

    const aRect = active.getBoundingClientRect();
    const containerRect = overlay.getBoundingClientRect();

  // sejajarkan tepi kiri dengan tepi kiri heading (agar tombol rata kiri dengan teks hero)
  const left = aRect.left - containerRect.left;
  // tambahkan inset kecil agar tombol tidak menempel pada tepi teks
  const inset = 12; // px
  const leftWithInset = left + inset;
  // beri celah kecil di bawah heading
    const gap = Math.min(20, Math.max(10, Math.round(aRect.height * 0.12)));
    const top = aRect.bottom - containerRect.top + gap;

  // batasi posisi agar tidak keluar dari wadah
  const minLeft = 8;
  const maxLeft = Math.max(8, containerRect.width - actions.offsetWidth - 8);
  const clampedLeft = Math.min(maxLeft, Math.max(minLeft, leftWithInset));
  actions.style.left = clampedLeft + 'px';
  actions.style.top = top + 'px';
  // tidak ada translasi horizontal — tombol tetap sejajar dengan tepi kiri heading
  actions.style.transform = 'translateX(0)';
  }

  let rafId = null;
  function loop() {
    updatePosition();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (rafId) return;
    loop();
  }
  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  document.addEventListener('DOMContentLoaded', function(){
    // pembaruan awal setelah jeda singkat (menunggu font/gambar)
    setTimeout(updatePosition, 200);
    start();

    window.addEventListener('resize', updatePosition, { passive: true });

  // Jeda loop saat halaman disembunyikan untuk menghemat penggunaan CPU
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) stop(); else start();
    });
  });
})();