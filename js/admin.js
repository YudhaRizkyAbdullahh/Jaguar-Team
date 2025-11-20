const sidebar = document.getElementById('sidebar-menu');
const toggleButton = document.getElementById('toggle-sidebar'); 
const toggleButtonMobile = document.getElementById('toggle-sidebar-mobile'); 
const closeButtonMobile = document.getElementById('close-sidebar-mobile'); 
const mainContent = document.getElementById('main-content');
const sidebarTitle = document.getElementById('sidebar-title');
const currentYear = new Date().getFullYear();

const yearElements = document.querySelectorAll('[id^="year-"]');
yearElements.forEach(el => {
    el.textContent = currentYear;
});

function isDesktop() {
    return window.innerWidth >= 768;
}

function initializeSidebar() {
    if (!sidebar || !mainContent) return;

    if (isDesktop()) {
        // Desktop: Paksa Mini Mode (Tertutup) saat load
        sidebar.classList.remove('open'); 
        mainContent.classList.remove('open-margin');
        // Judul tersembunyi sepenuhnya diatasi oleh CSS :not(.open) di atas
        
        mainContent.classList.remove('opacity-50', 'pointer-events-none');

    } else {
        // Mobile: Selalu tertutup saat load/reset
        sidebar.classList.remove('open');
        mainContent.classList.remove('open-margin', 'opacity-50', 'pointer-events-none');
        if (sidebarTitle) sidebarTitle.classList.remove('hidden'); 
    }
}

if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        if (isDesktop()) {
            sidebar.classList.toggle('open');
            mainContent.classList.toggle('open-margin');
            if (sidebarTitle) {
                if (sidebar.classList.contains('open')) {
                    sidebarTitle.classList.remove('hidden');
                } else {
                    sidebarTitle.classList.add('hidden');
                }
            }
        }
    });
}

if (toggleButtonMobile) {
    toggleButtonMobile.addEventListener('click', () => {
        if (!isDesktop()) {
            sidebar.classList.add('open');
            mainContent.classList.add('opacity-50', 'pointer-events-none'); 
        }
    });
}

if (closeButtonMobile) {
    closeButtonMobile.addEventListener('click', () => {
        if (!isDesktop()) {
            sidebar.classList.remove('open');
            mainContent.classList.remove('opacity-50', 'pointer-events-none');
        }
    });
}

if (mainContent) {
    mainContent.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !isDesktop()) {
            if (!sidebar.contains(e.target) && e.target === mainContent) {
                sidebar.classList.remove('open');
                mainContent.classList.remove('opacity-50', 'pointer-events-none');
            }
        }
    });
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initializeSidebar, 100);
});

initializeSidebar();