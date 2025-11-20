document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email-login').value;
            const password = document.getElementById('password-login').value;
            if (email && password) {
                window.location.href = '../index.html?loggedIn=true'; 
            } else {
                alert('Email dan Password harus diisi.');
            }
        });
    }
});