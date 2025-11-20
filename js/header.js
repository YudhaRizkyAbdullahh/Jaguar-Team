// Skrip header terpadu: toggle mobile, dropdown, perilaku scroll, penandaan tautan aktif
document.addEventListener('DOMContentLoaded', () => {
  // Elemen untuk toggle mobile (mendukung ID modern dan legacy)
  const toggleBtn = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburger = document.getElementById('hamburger') || document.getElementById('hamburger-open');
  const closeX = document.getElementById('close-x') || document.getElementById('hamburger-close');
  const hamburgerBtn = document.getElementById('hamburger-btn'); // legacy
  const MENU_ANIM_MS = 320;

  // Dropdowns & submenus
  const dropdownBtn = document.getElementById('menu-dropdown-btn');
  const dropdown = document.getElementById('menu-dropdown');
  const dropdownWrapper = document.getElementById('menu-dropdown-wrapper');

  const mobileSubBtn = document.getElementById('mobile-submenu-btn');
  const mobileSubmenu = document.getElementById('mobile-submenu');
  const mobileSubIcon = document.getElementById('mobile-submenu-icon');

  const header = document.querySelector('header');
  // Container di dalam header yang menyimpan tinggi (h-16 md:h-20)
  const headerContainer = header?.querySelector('.container');

  // Bantuan: tampilkan / sembunyikan menu mobile
  function showMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('hidden');
    // pemicu animasi kecil
    requestAnimationFrame(() => mobileMenu.classList.add('menu-open'));
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    if (hamburger) hamburger.classList.add('hidden');
    if (closeX) closeX.classList.remove('hidden');
  }

  function hideMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('menu-open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    // tambahkan hidden setelah animasi
    setTimeout(() => mobileMenu.classList.add('hidden'), MENU_ANIM_MS);
    if (hamburger) hamburger.classList.remove('hidden');
    if (closeX) closeX.classList.add('hidden');
  }

  // Toggle (klik tombol)
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', (e) => {
      const isOpen = mobileMenu.classList.contains('menu-open');
      if (!isOpen) showMobileMenu(); else hideMobileMenu();
    });
  }

  // Juga dukung pola hamburgerBtn lama (jika ada)
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('hidden')) showMobileMenu(); else hideMobileMenu();
    });
  }

  // Tutup menu mobile saat mengklik di luar
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!mobileMenu) return;
    if (mobileMenu.classList.contains('hidden')) return;
    // Jika klik pada toggle atau di dalam menu, jangan lakukan apa-apa
    if (toggleBtn && toggleBtn.contains(target)) return;
    if (hamburgerBtn && hamburgerBtn.contains(target)) return;
    if (mobileMenu.contains(target)) return;
    hideMobileMenu();
  });

  // tutup menu mobile dengan Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileMenu && mobileMenu.classList.contains('menu-open')) hideMobileMenu();
      if (dropdown && !dropdown.classList.contains('hidden')) dropdown.classList.add('hidden');
    }
  });

  // toggle submenu mobile (jika ada)
  if (mobileSubBtn && mobileSubmenu) {
    mobileSubBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (mobileSubmenu.classList.contains('hidden')) {
        mobileSubmenu.classList.remove('hidden');
        if (mobileSubIcon) mobileSubIcon.style.transform = 'rotate(180deg)';
        mobileSubBtn.setAttribute('aria-expanded', 'true');
      } else {
        mobileSubmenu.classList.add('hidden');
        if (mobileSubIcon) mobileSubIcon.style.transform = 'rotate(0deg)';
        mobileSubBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }


    //   Klik / hover dropdown
  function openDropdown() { if (dropdown) { dropdown.classList.remove('hidden'); dropdownBtn?.setAttribute('aria-expanded', 'true'); } }
  function closeDropdown() { if (dropdown) { dropdown.classList.add('hidden'); dropdownBtn?.setAttribute('aria-expanded', 'false'); } }
  if (dropdownWrapper) {
    dropdownWrapper.addEventListener('mouseenter', openDropdown);
    dropdownWrapper.addEventListener('mouseleave', closeDropdown);
    dropdownBtn?.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('hidden'); });
    document.addEventListener('click', (e) => { if (!dropdownWrapper.contains(e.target)) closeDropdown(); });
  }

  // Perilaku scroll untuk header
  
  function onScroll() {
    if (!header) return;
    // tambahkan shadow dan latar saat digulir
    if (window.scrollY > 40) {
      header.classList.add('shadow-md', 'bg-white/95');
      // ubah tinggi pada container (bukan elemen header) jika tersedia
      if (headerContainer) {
        headerContainer.classList.remove('md:h-20');
        headerContainer.classList.add('md:h-16');
      }
    } else {
      header.classList.remove('shadow-md', 'bg-white/95');
      if (headerContainer) {
        headerContainer.classList.remove('md:h-16');
        headerContainer.classList.add('md:h-20');
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Tandai tautan aktif (navigasi desktop + menu mobile)
  (function markActive() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('nav a, #mobile-menu a');
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.includes(path) || (path === '' && href.includes('index.html'))) {
        a.classList.add('text-[#706442]');
        a.classList.remove('text-gray-800');
      }
    });
  })();
});