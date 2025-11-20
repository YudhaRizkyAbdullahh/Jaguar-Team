document.addEventListener('DOMContentLoaded', () => {
  // Umpan balik visual sederhana untuk tombol tambah ke keranjang pada kartu menu/index.html
  
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const orig = btn.textContent;
      btn.textContent = 'Ditambahkan ✓';
      btn.disabled = true;
      btn.classList.add('opacity-80');
      setTimeout(() => {
        btn.textContent = orig || 'Tambah ke Keranjang';
        btn.disabled = false;
        btn.classList.remove('opacity-80');
      }, 1200);
    });
  });
});