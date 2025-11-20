document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const loginForm = document.querySelector('form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email-login').value;
            const password = document.getElementById('password-login').value;

            const ADMIN_EMAIL = 'putri@teknokrat.ac.id';
            const ADMIN_PASSWORD = 'admin';
            const ADMIN_PAGE = '../admin/admin-dashboard.html';

            const USER_EMAIL = 'user@gmail.com';
            const USER_PASSWORD = 'user';
            const USER_PAGE = 'tampilan/index.html'; 

            if (email && password) {
                if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                    localStorage.setItem('isLoggedIn', 'true'); 
                    localStorage.setItem('userRole', 'admin'); 
                    window.location.href = ADMIN_PAGE; 
                } else if (email === USER_EMAIL && password === USER_PASSWORD) {
                    localStorage.setItem('isLoggedIn', 'true'); 
                    localStorage.setItem('userRole', 'user'); 
                    window.location.href = USER_PAGE; 
                } else {
                    alert('Email atau Password salah.');
                }
            } else {
                alert('Email dan Password harus diisi.');
            }
        });
    }
});