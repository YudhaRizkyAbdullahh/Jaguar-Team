function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Desktop elements
    const desktopLoginBtn = document.getElementById('desktop-login-btn');
    const desktopProfileBtn = document.getElementById('desktop-profile-btn');
    const desktopProfileMenu = document.getElementById('desktop-profile-menu');
    
    // Mobile elements
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileProfileContainer = document.getElementById('mobile-profile-container');

    if (isLoggedIn) {
        // --- KONDISI SUDAH LOGIN ---
        
        // Desktop: Sembunyikan Masuk, Tampilkan P
        if (desktopLoginBtn) desktopLoginBtn.classList.add('hidden'); // Sembunyikan Tombol Masuk
        if (desktopProfileBtn) {
            desktopProfileBtn.classList.remove('hidden'); // Tampilkan Tombol P
            desktopProfileBtn.classList.add('inline-flex'); // Pastikan Display Type benar
        }
        
        // Mobile: Sembunyikan Masuk, Tampilkan P/Logout Container
        if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden'); // Sembunyikan Tombol Masuk Mobile
        if (mobileProfileContainer) mobileProfileContainer.classList.remove('hidden'); // Tampilkan Kontainer Profil Mobile
    } 
    else {
        // --- KONDISI BELUM LOGIN (DEFAULT) ---
        
        // Desktop: Tampilkan Masuk, Sembunyikan P
        if (desktopLoginBtn) desktopLoginBtn.classList.remove('hidden'); // Tampilkan Tombol Masuk
        if (desktopProfileBtn) {
            desktopProfileBtn.classList.add('hidden'); // Sembunyikan Tombol P
            desktopProfileBtn.classList.remove('inline-flex'); // Hapus Display Type
            if (desktopProfileMenu) desktopProfileMenu.classList.add('hidden'); // Pastikan dropdown tertutup
        }
        
        // Mobile: Tampilkan Masuk, Sembunyikan P/Logout Container
        if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden'); // Tampilkan Tombol Masuk Mobile
        if (mobileProfileContainer) mobileProfileContainer.classList.add('hidden'); // Sembunyikan Kontainer Profil Mobile
    }
}

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    // Arahkan kembali ke halaman index setelah logout
    window.location.href = 'tampilan/index.html'; 
}


document.addEventListener('DOMContentLoaded', () => {
    // Jalankan pengecekan status saat DOM selesai dimuat
    checkLoginStatus(); 

    // Logika Logout
    const desktopLogoutBtn = document.getElementById('desktop-logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    if (desktopLogoutBtn) {
        desktopLogoutBtn.addEventListener('click', handleLogout);
    }
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    // Logika Dropdown Profil Desktop
    const desktopProfileBtn = document.getElementById('desktop-profile-btn');
    const desktopProfileMenu = document.getElementById('desktop-profile-menu');

    if (desktopProfileBtn && desktopProfileMenu) {
        desktopProfileBtn.addEventListener('click', () => {
            const isExpanded = desktopProfileBtn.getAttribute('aria-expanded') === 'true' || false;
            desktopProfileBtn.setAttribute('aria-expanded', !isExpanded);
            desktopProfileMenu.classList.toggle('hidden');
        });
        
        // Sembunyikan dropdown jika klik di luar
        document.addEventListener('click', (event) => {
            if (desktopProfileBtn && desktopProfileMenu && 
                !desktopProfileBtn.contains(event.target) && 
                !desktopProfileMenu.contains(event.target)) {
                
                desktopProfileMenu.classList.add('hidden');
                desktopProfileBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
});