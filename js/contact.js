document.addEventListener('DOMContentLoaded', () => {
  const ADMIN = '6289692783848';
  const form = document.getElementById('contact-form');
  const sendBtn = document.getElementById('send-wa');
  const clearBtn = document.getElementById('clear-btn');
  // deteksi spinner/label: utamakan kelas di dalam tombol, jika tidak ada gunakan id di dalam tombol atau id global
  const btnSpinner = sendBtn ? (sendBtn.querySelector('.submit-spinner') || sendBtn.querySelector('#submit-spinner') || document.getElementById('submit-spinner')) : document.getElementById('submit-spinner');
  const btnLabel = sendBtn ? (sendBtn.querySelector('.submit-label') || sendBtn.querySelector('#submit-label') || document.getElementById('submit-label')) : document.getElementById('submit-label');
  const formMsg = document.getElementById('form-msg');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  function showToast(text, timeout = 2500) { const t = document.getElementById('toast'); if(!t) return; t.textContent = text; t.classList.remove('hidden'); clearTimeout(t._hideTimeout); t._hideTimeout = setTimeout(() => t.classList.add('hidden'), timeout); }

  function validateForm() { if(!form) return false; formMsg.textContent=''; const name = nameInput.value.trim(); const phone = phoneInput.value.trim(); const message = messageInput.value.trim(); if(!name||!phone||!message) return false; const digits = phone.replace(/[^0-9]/g,''); if(digits.length<9){ formMsg.textContent='Mohon masukkan nomor telepon yang valid.'; return false; } return true; }

  function setSubmitState(enabled){
    if(!sendBtn) return;
    sendBtn.disabled = !enabled;
    sendBtn.setAttribute('aria-disabled', String(!enabled));
    if(enabled){
      sendBtn.classList.remove('bg-gray-100','text-gray-400','cursor-not-allowed');
      sendBtn.classList.add('bg-accent','text-gray-800');
    } else {
      sendBtn.classList.remove('bg-accent','text-gray-800');
      sendBtn.classList.add('bg-gray-100','text-gray-400','cursor-not-allowed');
    }
  }

  function updateButtonState(){ setSubmitState(validateForm()); }

  [nameInput, phoneInput, messageInput, emailInput].forEach(el=>{ if(!el) return; el.addEventListener('input', ()=>{ formMsg.textContent=''; updateButtonState(); }); });

  clearBtn?.addEventListener('click', ()=>{ form.reset(); updateButtonState(); showToast('Form dibersihkan'); });

  sendBtn?.addEventListener('click', ()=>{
    if(!validateForm()){ showToast('Silakan lengkapi formulir dengan benar'); return; }
  if (btnSpinner) btnSpinner.classList.remove('hidden'); sendBtn.disabled = true;
    const name = nameInput.value.trim(); const phone = phoneInput.value.trim(); const email = emailInput.value.trim(); const message = messageInput.value.trim();
    let body = `Halo Bubur Ayam Bang Jaka 👋%0A`;
    body += `Nama: ${encodeURIComponent(name)}%0A`;
    body += `No HP: ${encodeURIComponent(phone)}%0A`;
    if(email) body += `Email: ${encodeURIComponent(email)}%0A`;
    body += `%0APesan:%0A${encodeURIComponent(message)}%0A`;
    body += `%0A(Kirim dari halaman kontak)`;
    const url = `https://wa.me/${ADMIN}?text=${body}`;
  setTimeout(()=>{ if (btnSpinner) btnSpinner.classList.add('hidden'); sendBtn.disabled=false; showToast('Membuka WhatsApp...'); window.open(url,'_blank'); },600);
  });

  updateButtonState();
});
