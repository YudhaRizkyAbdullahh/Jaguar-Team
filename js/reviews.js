const API_BASE_URL = 'http://localhost:3000/api';
const API_ULASAN = `${API_BASE_URL}/ulasan`;

// Kunci Local Storage untuk melacak ulasan terakhir yang dibuat user
const LOCAL_LAST_REVIEW_ID = 'last_submitted_review_id';
const LOCAL_LAST_REVIEW_NAME = 'last_submitted_review_name';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('review-form');
    if (!form) return;
    const status = document.getElementById('review-status');
    const ratingInput = document.getElementById('r-rating');
    const stars = Array.from(document.querySelectorAll('.star-btn'));
    const messageEl = document.getElementById('r-message');
    const nameEl = document.getElementById('r-name');
    const submitBtn = document.getElementById('submit-review');
    const submitLabel = (submitBtn && submitBtn.querySelector('#submit-label')) || document.getElementById('submit-label');
    const submitSpinner = (submitBtn && submitBtn.querySelector('#submit-spinner')) || document.getElementById('submit-spinner');
    const charCount = document.getElementById('char-count');
    const MAX_CH = parseInt(messageEl.getAttribute('maxlength') || '500', 10);

    const reviewsContainer = document.getElementById('reviews-container');

    function setStars(value) {
        ratingInput.value = value;
        stars.forEach(s => {
            const v = Number(s.dataset.value);
            if (v <= value) { s.classList.remove('text-gray-300'); s.classList.add('text-yellow-400'); s.setAttribute('aria-checked', 'true'); }
            else { s.classList.remove('text-yellow-400'); s.classList.add('text-gray-300'); s.setAttribute('aria-checked', 'false'); }
        });
        validateForm();
    }

    stars.forEach(s => {
        s.addEventListener('click', () => setStars(Number(s.dataset.value)));
    });

    function updateCharCount() {
        if (charCount) {
            charCount.textContent = `${messageEl.value.length}/${MAX_CH}`;
        }
    }

    messageEl.addEventListener('input', updateCharCount);

    function validateForm() {
        const name = nameEl.value.trim();
        const message = messageEl.value.trim();
        const rating = ratingInput.value;

        if (name && message.length >= 10 && rating >= 1) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }
    
    nameEl.addEventListener('input', validateForm);
    messageEl.addEventListener('input', validateForm);


    // Helper: Mengubah rating angka menjadi string bintang HTML (menggunakan SVG)
    function renderStars(rating) {
        let starsHtml = '';
        const maxStars = 5;
        const starIcon = `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27l6.18 3.73-1.64-7.03 5.46-4.73-7.19-.61L12 2 8.19 8.63l-7.19.61 5.46 4.73-1.64 7.03z"/></svg>`;
        
        for (let i = 1; i <= rating; i++) {
            starsHtml += `<span class="text-yellow-400">${starIcon}</span>`;
        }
        for (let i = rating + 1; i <= maxStars; i++) {
            starsHtml += `<span class="text-gray-300">${starIcon}</span>`;
        }
        return `<div class="flex items-center space-x-0.5">${starsHtml}</div>`;
    }

    // Fungsi untuk merender satu ulasan ke dalam elemen HTML
    function renderReview(review, isCurrentUsersReview = false) { 
        const reviewEl = document.createElement('div');
        reviewEl.id = `review-${review.id_ulasan}`; 
        reviewEl.className = 'p-6 bg-white border border-gray-200 rounded-lg shadow-sm';
        
        const date = new Date(review.waktu_ulasan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

        let adminReplyHtml = '';
        if (review.balasan_admin) {
            adminReplyHtml = `
                <div class="mt-4 p-4 bg-gray-50 border-l-4 border-[#706442] rounded-r-md">
                    <p class="text-sm font-semibold text-[#706442]">Balasan dari Admin:</p>
                    <p class="text-sm text-gray-700 mt-1">${review.balasan_admin}</p>
                </div>
            `;
        }

        let actionButtons = '';
        let editableContent = `<p id="review-comment-${review.id_ulasan}" class="mt-3 text-gray-700">${review.komentar}</p>`;

        if (isCurrentUsersReview) {
            actionButtons = `
                <div class="flex space-x-3 mt-4" id="review-actions-${review.id_ulasan}">
                    <button type="button" data-id="${review.id_ulasan}" data-comment="${review.komentar}" class="edit-review-btn text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50">
                        <span class="edit-label">Edit</span>
                    </button>
                    <button type="button" data-id="${review.id_ulasan}" class="delete-review-btn text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50">
                        Hapus
                    </button>
                </div>
            `;
        }

        reviewEl.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-lg font-semibold text-gray-900">${review.nama_pengulas}</p>
                    <div class="flex items-center mt-1">
                        <div id="review-stars-${review.id_ulasan}">${renderStars(review.rating_bintang)}</div>
                        <span class="text-sm text-gray-500 ml-2" id="review-rating-text-${review.id_ulasan}">${review.rating_bintang}/5</span>
                    </div>
                </div>
                <p class="text-sm text-gray-500">${date}</p>
            </div>
            ${editableContent}
            ${adminReplyHtml}
            ${actionButtons}
        `;
        return reviewEl;
    }

    // Fungsi untuk memuat semua ulasan dari API
    async function loadReviews() {
        if (!reviewsContainer) return;

        reviewsContainer.innerHTML = '<p class="text-center text-gray-500">Memuat ulasan...</p>';
        
        // Cek ulasan terakhir yang dibuat user
        const lastSubmittedId = localStorage.getItem(LOCAL_LAST_REVIEW_ID);
        const lastSubmittedName = localStorage.getItem(LOCAL_LAST_REVIEW_NAME);


        try {
            const response = await fetch(API_ULASAN);
            if (!response.ok) throw new Error('Gagal mengambil data ulasan dari server.');
            
            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                reviewsContainer.innerHTML = ''; 
                // Tampilkan ulasan terbaru di paling atas
                result.data.forEach(review => {
                    const isUsersReview = review.id_ulasan == lastSubmittedId && review.nama_pengulas === lastSubmittedName;
                    const reviewElement = renderReview(review, isUsersReview);
                    reviewsContainer.appendChild(reviewElement);
                });
                attachReviewActionListeners();

            } else {
                reviewsContainer.innerHTML = '<p class="text-center text-gray-500">Belum ada ulasan yang tersedia. Jadilah yang pertama!</p>';
                localStorage.removeItem(LOCAL_LAST_REVIEW_ID);
                localStorage.removeItem(LOCAL_LAST_REVIEW_NAME);
            }

        } catch (error) {
            console.error('Error saat memuat ulasan:', error);
            reviewsContainer.innerHTML = `<p class="text-center text-red-500">Gagal memuat ulasan. Pastikan server API berjalan di ${API_BASE_URL}.</p>`;
        }
    }

    const handleEdit = (id, originalComment, reviewEl) => {
        const commentContainer = reviewEl.querySelector(`#review-comment-${id}`);
        const actionsEl = reviewEl.querySelector(`#review-actions-${id}`);
        const originalHtml = actionsEl.innerHTML;
        
        // 1. Ganti komentar dengan textarea untuk edit
        commentContainer.outerHTML = `<textarea id="edit-comment-${id}" rows="4" maxlength="500" class="mt-3 block w-full rounded-md border border-gray-300 p-2 text-gray-700">${originalComment}</textarea>`;
        const textareaEl = document.getElementById(`edit-comment-${id}`);

        // 2. Ganti tombol Edit/Hapus dengan Simpan/Batal
        actionsEl.innerHTML = `
            <button type="button" data-id="${id}" class="save-review-btn text-sm text-green-600 hover:text-green-800 font-medium">Simpan</button>
            <button type="button" data-id="${id}" class="cancel-edit-btn text-sm text-gray-600 hover:text-gray-800 font-medium">Batal</button>
        `;
        
        const saveBtn = actionsEl.querySelector('.save-review-btn');
        const cancelBtn = actionsEl.querySelector('.cancel-edit-btn');
        
        const restoreUI = (newComment = originalComment) => {
            textareaEl.outerHTML = `<p id="review-comment-${id}" class="mt-3 text-gray-700">${newComment}</p>`;
            actionsEl.innerHTML = originalHtml;
            attachReviewActionListeners();
        };

        // Batal Edit
        cancelBtn.onclick = () => restoreUI();

        // Simpan Edit
        saveBtn.onclick = async () => {
            const newComment = textareaEl.value.trim();
            if (newComment.length < 10) {
                 alert('Komentar minimal 10 karakter.');
                 return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Menyimpan...';

            try {
                const response = await fetch(`${API_ULASAN}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    // Hanya izinkan edit komentar dan rating. Untuk kasus ini, hanya komentar.
                    body: JSON.stringify({ komentar: newComment }) 
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    alert('Ulasan berhasil diperbarui.');
                    restoreUI(newComment);
                } else {
                    alert(`Gagal memperbarui ulasan: ${result.message || 'Error tidak diketahui'}`);
                    restoreUI();
                }
            } catch (error) {
                console.error('Error saat menyimpan edit:', error);
                alert('Koneksi server gagal saat menyimpan. Silakan coba lagi.');
                restoreUI();
            }
        };
    };

    const handleDelete = async (id, reviewEl) => {
        if (!confirm('Anda yakin ingin menghapus ulasan ini? Aksi ini tidak bisa dibatalkan.')) return;

        reviewEl.classList.add('opacity-50', 'pointer-events-none');
        
        try {
            const response = await fetch(`${API_ULASAN}/${id}`, { method: 'DELETE' });
            const result = await response.json();

            if (response.ok && result.success) {
                reviewEl.remove();
                localStorage.removeItem(LOCAL_LAST_REVIEW_ID);
                localStorage.removeItem(LOCAL_LAST_REVIEW_NAME);
                alert('Ulasan berhasil dihapus.');
            } else {
                reviewEl.classList.remove('opacity-50', 'pointer-events-none');
                alert(`Gagal menghapus ulasan: ${result.message || 'Error tidak diketahui'}`);
            }
        } catch (error) {
            console.error('Error saat menghapus:', error);
            reviewEl.classList.remove('opacity-50', 'pointer-events-none');
            alert('Koneksi server gagal saat menghapus. Silakan coba lagi.');
        }
    };

    function attachReviewActionListeners() {
        document.querySelectorAll('.edit-review-btn').forEach(button => {
            // Menghindari duplikasi listener jika loadReviews() dipanggil beberapa kali
            if (button.dataset.listenerAdded) return; 

            button.onclick = (e) => {
                e.preventDefault();
                const id = button.dataset.id;
                const originalComment = button.dataset.comment;
                const reviewEl = document.getElementById(`review-${id}`);
                handleEdit(id, originalComment, reviewEl);
            };
            button.dataset.listenerAdded = 'true';
        });

        document.querySelectorAll('.delete-review-btn').forEach(button => {
             // Menghindari duplikasi listener jika loadReviews() dipanggil beberapa kali
            if (button.dataset.listenerAdded) return; 
            
            button.onclick = (e) => {
                e.preventDefault();
                const id = button.dataset.id;
                const reviewEl = document.getElementById(`review-${id}`);
                handleDelete(id, reviewEl);
            };
            button.dataset.listenerAdded = 'true';
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameEl.value.trim();
        const rating = ratingInput.value;
        const message = messageEl.value.trim();

        if (!name || !rating || !message) return; 

        submitBtn.disabled = true;
        if (submitSpinner) submitSpinner.classList.remove('hidden');
        if (submitLabel) submitLabel.textContent = 'Mengirim...';
        status.textContent = ''; 

        try {
            const response = await fetch(API_ULASAN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama_pengulas: name,
                    rating_bintang: rating,
                    komentar: message
                })
            });

            const apiResult = await response.json();

            if (!response.ok || !apiResult.success) {
                throw new Error(apiResult.message || 'Error tidak diketahui');
            }

            status.textContent = 'Ulasan berhasil dikirim. Anda dapat Edit atau Hapus ulasan ini.';
            status.classList.remove('text-red-600');
            status.classList.add('text-green-600');
            
            // --- Penyelesaian Masalah: Tambahkan Ulasan Secara Langsung ---
            const newReviewId = apiResult.id_ulasan;
            localStorage.setItem(LOCAL_LAST_REVIEW_ID, newReviewId);
            localStorage.setItem(LOCAL_LAST_REVIEW_NAME, name); 
            
            // 1. Buat objek data ulasan baru untuk rendering lokal
            const newReviewData = {
                id_ulasan: newReviewId,
                nama_pengulas: name,
                // Pastikan rating adalah number untuk renderStars
                rating_bintang: Number(rating), 
                komentar: message,
                // Gunakan waktu saat ini
                waktu_ulasan: new Date().toISOString(), 
                balasan_admin: null
            };
            
            // 2. Render dan masukkan ulasan baru ke bagian atas daftar
            const newReviewEl = renderReview(newReviewData, true); // true agar tombol edit/hapus muncul
            reviewsContainer.prepend(newReviewEl); 
            
            // 3. Pasang listener untuk tombol Edit/Hapus yang baru
            attachReviewActionListeners();
            
            // HAPUS loadReviews() karena sudah diganti dengan penambahan elemen manual di atas.

        } catch (error) {
            console.error('Kesalahan koneksi/server:', error);
            status.textContent = `Gagal mengirim ulasan. Error: ${error.message}`;
            status.classList.add('text-red-600');
            status.classList.remove('text-green-600');
        } finally {
            if (submitSpinner) submitSpinner.classList.add('hidden'); 
            if (submitLabel) submitLabel.textContent = 'Kirim Ulasan'; 
            submitBtn.disabled = false; 
            
            form.reset(); 
            setStars(5); 
            updateCharCount(); 
            validateForm(); 
        }
    });

    setStars(5);
    updateCharCount();

    // Panggil fungsi utama untuk memuat semua ulasan saat halaman dibuka
    loadReviews();
});