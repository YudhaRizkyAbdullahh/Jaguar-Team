document.addEventListener('DOMContentLoaded', () => {
  // Form ulasan: rating bintang, penghitung karakter, validasi, dan kirim via WhatsApp
  const form = document.getElementById('review-form');
  if (!form) return;
  const status = document.getElementById('review-status');
  const ADMIN_WA = '6289692783848';
  const ratingInput = document.getElementById('r-rating');
  const stars = Array.from(document.querySelectorAll('.star-btn'));
  const messageEl = document.getElementById('r-message');
  const nameEl = document.getElementById('r-name');
  const submitBtn = document.getElementById('submit-review');
  // dukung markup spinner/label berbasis id atau kelas
  const submitLabel = (submitBtn && submitBtn.querySelector('.submit-label')) || document.getElementById('submit-label');
  const submitSpinner = (submitBtn && submitBtn.querySelector('.submit-spinner')) || document.getElementById('submit-spinner');
  const charCount = document.getElementById('char-count');
  const MAX_CH = parseInt(messageEl.getAttribute('maxlength') || '500', 10);

  function setStars(value){
    stars.forEach(s => {
      const v = Number(s.dataset.value);
      if (v <= value) { s.classList.remove('text-gray-300'); s.classList.add('text-yellow-400'); s.setAttribute('aria-checked','true'); }
      else { s.classList.remove('text-yellow-400'); s.classList.add('text-gray-300'); s.setAttribute('aria-checked','false'); }
    });
    ratingInput.value = value;
    validateForm();
  }

  stars.forEach(s => {
    s.addEventListener('click', () => setStars(Number(s.dataset.value)));
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStars(Number(s.dataset.value)); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); const v = Math.max(1, Number(ratingInput.value)-1); setStars(v); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); const v = Math.min(5, Number(ratingInput.value)+1); setStars(v); }
    });
    s.tabIndex = 0;
  });

  // Perbarui penghitung karakter dan jalankan validasi
  function updateCharCount(){ const len = messageEl.value.length; if(charCount) charCount.textContent = `${len} / ${MAX_CH}`; validateForm(); }
  messageEl.addEventListener('input', updateCharCount);
  nameEl.addEventListener('input', validateForm);

  // Aktif/nonaktifkan tombol kirim dan perbarui tampilan agar jelas
  function setSubmitState(enabled){
    if(!submitBtn) return;
    submitBtn.disabled = !enabled;
    submitBtn.setAttribute('aria-disabled', String(!enabled));
    if(enabled){
      // tampilan aktif
      submitBtn.classList.remove('bg-gray-100','bg-gray-200','text-gray-400','cursor-not-allowed');
      submitBtn.classList.add('bg-accent','text-gray-800');
    } else {
      // tampilan nonaktif
      submitBtn.classList.remove('bg-accent','text-gray-800');
      submitBtn.classList.add('bg-gray-100','text-gray-400','cursor-not-allowed');
    }
  }

  function validateForm(){
    const name = (nameEl && nameEl.value) ? nameEl.value.trim() : '';
    const rating = Number(ratingInput && ratingInput.value) || 0;
    const message = (messageEl && messageEl.value) ? messageEl.value.trim() : '';
    const ok = name.length > 0 && rating >= 1 && message.length > 5;
    setSubmitState(ok);
    return ok;
  }

  setStars(Number(ratingInput.value) || 5);
  updateCharCount();

  form.addEventListener('submit', (e) => {
    e.preventDefault(); const name = nameEl.value.trim(); const rating = ratingInput.value; const message = messageEl.value.trim(); if (!name || !rating || !message) { status.textContent = 'Mohon isi semua kolom.'; return; }
    submitSpinner.classList.remove('hidden'); submitLabel.textContent = 'Membuka WhatsApp…'; submitBtn.disabled = true;
    const text = `Ulasan dari ${name}%0ARating: ${rating}/5%0A%0A${message}`;
    const url = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setTimeout(()=>{ submitSpinner.classList.add('hidden'); submitLabel.textContent = 'Kirim via WhatsApp'; status.textContent = 'Jika WhatsApp tidak terbuka otomatis, coba klik tautan lagi.'; submitBtn.disabled = false; }, 1200);
  });
});
