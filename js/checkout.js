document.addEventListener('DOMContentLoaded', () => {
  // Mengatur tahun pada elemen dengan id 'year' jika ada
  const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuSelect = document.getElementById('menuItem');
  const preview = document.getElementById('menu-preview');
  const priceEl = document.getElementById('menu-price');
  const DEFAULT_QTY = 1;
  const addToCartBtn = document.getElementById('add-to-cart');
  const cartList = document.getElementById('cart-list');
  const cartEmpty = document.getElementById('cart-empty');
  const cartTotalEl = document.getElementById('cart-total');
  const form = document.getElementById('checkout-form');
  const submitBtn = document.getElementById('submit-btn');
  // Deteksi spinner: utamakan kelas di dalam tombol, jika tidak ada gunakan id di dalam tombol atau id global #submit-spinner
  const spinner = submitBtn ? (submitBtn.querySelector('.submit-spinner') || submitBtn.querySelector('#submit-spinner') || document.getElementById('submit-spinner')) : document.getElementById('submit-spinner');
  const ADMIN = '6289692783848';

  if (!form) return; // Tidak harus dijalankan jika formulir tidak ada

  const cart = [];

  function findCartIndexByName(name) { return cart.findIndex(i => i.name === name); }
  function calculateCartTotal() { return cart.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0); }

  function formatCurrency(v) { return 'Rp ' + Number(v).toLocaleString('id-ID'); }

  function renderCart() {
    cartList.innerHTML = '';
    if (cart.length === 0) { cartList.appendChild(cartEmpty); cartTotalEl.textContent = 'Rp 0'; return; }
    cart.forEach((it, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-md shadow-sm transform transition hover:scale-[1.01]';
      itemEl.innerHTML = `
        <div class="flex items-start sm:items-center gap-3">
          <img src="${it.image}" alt="${it.name}" class="w-16 h-16 object-cover rounded-md flex-shrink-0">
          <div>
            <div class="text-sm font-medium">${it.name}</div>
            <div class="text-xs text-gray-500">${formatCurrency(it.price)}</div>
          </div>
        </div>
        <div class="mt-3 sm:mt-0 flex items-center gap-3">
          <div class="inline-flex items-center rounded-md border border-gray-200 overflow-hidden">
            <button data-idx="${idx}" class="cart-dec px-2 py-1 bg-white text-gray-700" aria-label="Kurangi ${it.name}">−</button>
            <input data-idx-input="${idx}" value="${it.qty}" class="w-14 text-center border-l border-r border-transparent text-sm" aria-label="Jumlah ${it.name}" />
            <button data-idx="${idx}" class="cart-inc px-2 py-1 bg-white text-gray-700" aria-label="Tambah ${it.name}">＋</button>
          </div>
          <div class="text-sm text-gray-700">${formatCurrency(Number(it.price) * Number(it.qty))}</div>
          <button data-idx="${idx}" class="cart-remove text-sm text-red-500">Hapus</button>
        </div>
      `;
      cartList.appendChild(itemEl);
    });
    cartTotalEl.textContent = formatCurrency(calculateCartTotal());

    cartList.querySelectorAll('.cart-inc').forEach(btn => btn.addEventListener('click', () => { const idx = Number(btn.getAttribute('data-idx')); cart[idx].qty = Number(cart[idx].qty) + 1; renderCart(); }));
    cartList.querySelectorAll('.cart-dec').forEach(btn => btn.addEventListener('click', () => { const idx = Number(btn.getAttribute('data-idx')); cart[idx].qty = Math.max(1, Number(cart[idx].qty) - 1); renderCart(); }));
    cartList.querySelectorAll('input[data-idx-input]').forEach(inp => inp.addEventListener('change', () => { const idx = Number(inp.getAttribute('data-idx-input')); let v = Number(inp.value || 1); if (!Number.isFinite(v) || v < 1) v = 1; cart[idx].qty = v; renderCart(); }));
    cartList.querySelectorAll('.cart-remove').forEach(btn => btn.addEventListener('click', () => { const idx = Number(btn.getAttribute('data-idx')); cart.splice(idx,1); renderCart(); }));
    // tetapkan status formulir/tombol agar tetap sinkron setelah perenderan
    validateFormAndCart();
  }

  // toast bantuan sederhana
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  function showToast(text){ if(!toast||!toastMsg) return; toastMsg.textContent=text; toast.classList.remove('hidden'); toast.classList.add('opacity-100'); clearTimeout(window._toastTimer); window._toastTimer = setTimeout(()=>{ toast.classList.add('opacity-0'); setTimeout(()=>toast.classList.add('hidden'),300); },1400); }

  // status tombol kirim yang memperhatikan visual + aksesibilitas
  function setSubmitState(enabled){
    if(!submitBtn) return;
    if(enabled){
      submitBtn.removeAttribute('disabled');
      submitBtn.setAttribute('aria-disabled','false');
      submitBtn.classList.remove('bg-gray-100','text-gray-400','cursor-not-allowed');
      submitBtn.classList.add('bg-accent','text-gray-800');
    } else {
      submitBtn.setAttribute('disabled','');
      submitBtn.setAttribute('aria-disabled','true');
      submitBtn.classList.remove('bg-accent','text-gray-800');
      submitBtn.classList.add('bg-gray-100','text-gray-400','cursor-not-allowed');
    }
  }

  function validateFormAndCart(){
    // validitas HTML dasar
    const fieldsValid = form.checkValidity();
    // validasi telepon: permisif untuk nomor internasional (dimulai dengan '+')
    const phoneEl = document.getElementById('phone');
    const phoneHint = document.getElementById('phone-hint');
    const raw = phoneEl ? phoneEl.value.trim() : '';
    const digits = raw.replace(/[^0-9]/g, '');
    // Jumlah digit minimum default untuk nomor lokal (tanpa awalan +)
    let minDigits = 9;
    if (raw.startsWith('+')) {
      // Format internasional: izinkan nomor yang sedikit lebih pendek (kode negara bervariasi)
      // Asumsi: izinkan >=7 digit saat pengguna menyertakan awalan negara.
      minDigits = 7;
    }
    const phoneOk = digits.length >= minDigits;

    // tampilkan/sembunyikan petunjuk inline
    if (phoneHint) {
      if (!phoneOk && raw.length > 0) {
        phoneHint.textContent = `Nomor terlalu pendek untuk format ini (butuh minimal ${minDigits} digit).`;
        phoneHint.classList.remove('hidden');
      } else {
        phoneHint.textContent = '';
        phoneHint.classList.add('hidden');
      }
    }

    const ok = fieldsValid && phoneOk && cart.length>0;
    setSubmitState(ok);
    return ok;
  }

  function updatePreview(){ if(!menuSelect) return; const opt = menuSelect.selectedOptions[0]; const img = opt?.dataset?.image || ''; const price = opt?.dataset?.price || ''; if(img) preview.src = img; else preview.src = 'images/product/buburAyam.png'; if(price) priceEl.textContent = formatCurrency(price); else priceEl.textContent='—'; }

  if(menuSelect) menuSelect.addEventListener('change', updatePreview);
  ['name','phone','address'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('input', validateFormAndCart); });

  if(addToCartBtn) addToCartBtn.addEventListener('click', ()=>{
    const opt = menuSelect.selectedOptions[0]; const name = menuSelect.value; const price = Number(opt?.dataset?.price||0); const image = opt?.dataset?.image||'images/product/buburAyam.png'; const qty=DEFAULT_QTY; if(!name){ alert('Pilih menu terlebih dahulu.'); return; } const idx=findCartIndexByName(name);
    if(idx>=0) cart[idx].qty = Number(cart[idx].qty)+qty; else cart.push({ id: Date.now(), name, price, image, qty }); renderCart(); showToast(`${name} ×${qty} ditambahkan`); // validateFormAndCart called by renderCart
  });

  updatePreview();

  form.addEventListener('submit', (e)=>{
    e.preventDefault(); if(!form.checkValidity()){ form.reportValidity(); return; }
    const name = document.getElementById('name').value.trim(); const phone = document.getElementById('phone').value.trim(); const address = document.getElementById('address').value.trim(); const notes = document.getElementById('notes').value.trim(); if(cart.length===0){ alert('Keranjang kosong. Tambahkan setidaknya satu item sebelum mengirim pesanan.'); return; }
    let message = `Pesanan dari Bubur Ayam Bang Jaka\n`; message += `Nama: ${name}\n`; message += `No HP: ${phone}\n`; message += `Alamat: ${address}\n`; message += `\nDaftar Pesanan:\n`; cart.forEach(it=>{ message += `- ${it.name} x${it.qty} = Rp ${ (Number(it.price) * Number(it.qty)).toLocaleString('id-ID') }\n`; }); message += `\nTotal: Rp ${ calculateCartTotal().toLocaleString('id-ID') }\n`; if(notes) message += `Catatan: ${notes}\n`; const waUrl = `https://wa.me/${ADMIN}?text=${encodeURIComponent(message)}`;
  if (spinner) spinner.classList.remove('hidden'); setSubmitState(false);
  setTimeout(()=>{ window.open(waUrl,'_blank'); if (spinner) spinner.classList.add('hidden'); validateFormAndCart(); },500);
  });

  // cari indeks item keranjang berdasarkan nama
  function findCartIndexByName(name){ return cart.findIndex(i=>i.name===name); }
  validateFormAndCart();
});
