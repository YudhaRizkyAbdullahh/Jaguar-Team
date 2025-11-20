// admin-reviews.js

// Asumsi fungsi getReviews() dan saveAdminReply(id_ulasan, replyText) tersedia di db_jaguar.js

document.addEventListener('DOMContentLoaded', () => {
    const reviewsListContainer = document.getElementById('reviews-container'); 
    
    if (!reviewsListContainer) return;

    // --- UTILITY FUNCTIONS ---

    function renderStars(rating) {
        let starsHtml = '';
        // Menggunakan ikon SVG yang sama dengan kode Anda
        const starIcon = `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27l6.18 3.73-1.64-7.03 5.46-4.73-7.19-.61L12 2 8.19 8.63l-7.19.61 5.46 4.73-1.64 7.03z"/></svg>`;
        for (let i = 1; i <= 5; i++) {
            // Menggunakan warna yang sama dengan kode Anda
            const colorClass = i <= rating ? 'text-yellow-400' : 'text-gray-300'; 
            starsHtml += `<span class="${colorClass} ml-0.5">${starIcon}</span>`;
        }
        return `<div class="flex items-center">${starsHtml}</div>`;
    }

    // Fungsi utama untuk merender satu kartu ulasan
    function renderReviewCard(review) {
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const date = new Date(review.waktu_ulasan).toLocaleDateString('id-ID', dateOptions);
        
        const hasReply = !!review.balasan_admin;
        
        let adminReplyHtml = '';
        if (hasReply) {
            // Tampilan Balasan Admin (dengan tombol Edit dan Hapus)
            adminReplyHtml = `
                <div class="mt-4 p-4 bg-gray-50 border-l-4 border-[#706442] rounded-r-md" id="reply-display-${review.id_ulasan}">
                    <p class="text-sm font-semibold text-[#706442]">Balasan dari Admin:</p>
                    <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap">${review.balasan_admin}</p>
                    <div class="mt-2 text-right space-x-3">
                        <button type="button" class="text-sm font-medium text-blue-600 hover:text-blue-800 edit-reply-btn" data-id="${review.id_ulasan}" data-original-reply="${review.balasan_admin}">Edit</button>
                        <button type="button" class="text-sm font-medium text-red-600 hover:text-red-800 delete-reply-btn" data-id="${review.id_ulasan}">Hapus</button>
                    </div>
                </div>
            `;
        }

        // Tombol aksi utama (hanya Balas Komentar jika belum ada balasan)
        const actionButtonHtml = !hasReply ? `
            <div class="mt-4 flex justify-end" id="action-btn-wrapper-${review.id_ulasan}">
                <button type="button" class="btn-reply px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition" data-id="${review.id_ulasan}">Balas Komentar</button>
            </div>
        ` : `<div id="action-btn-wrapper-${review.id_ulasan}" class="hidden"></div>`; // Wrapper kosong jika sudah ada balasan

        // Form Balasan (tersembunyi secara default)
        const replyFormHtml = `
            <div id="reply-form-wrapper-${review.id_ulasan}" class="mt-4 hidden">
                <form class="reply-form" data-review-id="${review.id_ulasan}">
                    <label for="textarea-${review.id_ulasan}" class="sr-only">Balasan Admin</label>
                    <textarea id="textarea-${review.id_ulasan}" rows="3" maxlength="500" class="reply-textarea w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                        placeholder="Tulis balasan Anda di sini..." required>${review.balasan_admin || ''}</textarea>
                    <div class="flex justify-end space-x-2 mt-2">
                        <button type="button" class="cancel-reply-btn px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100" data-id="${review.id_ulasan}">Batal</button>
                        <button type="submit" class="submit-reply-btn px-4 py-2 text-sm font-medium text-white bg-[#706442] border border-[#706442] rounded-md hover:bg-[#5b5134]">Kirim Balasan</button>
                    </div>
                </form>
            </div>
        `;

        return `
            <div id="review-${review.id_ulasan}" data-review-id="${review.id_ulasan}" class="mb-6 p-4 bg-white rounded-lg shadow border border-gray-100">
                <div class="flex justify-between items-start border-b pb-3 mb-3">
                    <div>
                        <p class="text-lg font-semibold text-gray-900">${review.nama_pengulas}</p>
                        <div class="flex items-center mt-1">
                            ${renderStars(review.rating_bintang)}
                            <span class="text-sm text-gray-500 ml-2">${review.rating_bintang}/5</span>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 text-right">${date}</p>
                </div>
                
                <p class="text-gray-700 whitespace-pre-wrap">${review.komentar}</p>
                
                ${adminReplyHtml}

                ${actionButtonHtml}
                
                ${replyFormHtml}
            </div>
        `;
    }

    // --- ASYNCHRONOUS DATA LOADING ---

    async function getReviews() {
        const response = await fetch('http://localhost:3000/api/ulasan');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async function saveAdminReply(id, replyText) {
        const response = await fetch(`http://localhost:3000/api/ulasan/${id}/reply`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ balasan_admin: replyText })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true; // Return true on success
    }

    async function loadReviewsTable() {
        reviewsListContainer.innerHTML = '<p class="text-center text-gray-500 py-10">Memuat data ulasan...</p>';

        try {
            // Asumsi getReviews() tersedia di db_jaguar.js
            const { data: reviews } = await getReviews(); 

            if (reviews && reviews.length > 0) {
                reviewsListContainer.innerHTML = ''; 
                reviews.sort((a, b) => new Date(b.waktu_ulasan) - new Date(a.waktu_ulasan)); 

                reviews.forEach(review => {
                    reviewsListContainer.innerHTML += renderReviewCard(review);
                });
                
                attachEventListeners(); 

            } else {
                reviewsListContainer.innerHTML = '<p class="text-center text-gray-500 py-10">Belum ada ulasan yang masuk.</p>';
            }

        } catch (error) {
            console.error('Error saat memuat ulasan untuk Admin:', error);
            reviewsListContainer.innerHTML = `<p class="text-center text-red-500 py-10">Gagal memuat ulasan. Pastikan server API berjalan.</p>`;
        }
    }
    
    // --- EVENT HANDLERS ---
    
    // Fungsi untuk menampilkan atau menyembunyikan form
    function toggleReplyForm(id, isEdit = false, originalReply = '') {
        const formWrapper = document.getElementById(`reply-form-wrapper-${id}`);
        const textArea = document.getElementById(`textarea-${id}`);
        const actionBtnWrapper = document.getElementById(`action-btn-wrapper-${id}`);
        const replyDisplay = document.getElementById(`reply-display-${id}`);
        const submitBtn = formWrapper?.querySelector('.submit-reply-btn');
        
        if (!formWrapper || !textArea || !submitBtn) return;
        
        const isVisible = !formWrapper.classList.contains('hidden');

        // Close all other forms and re-show their displays
        document.querySelectorAll('[id^="reply-form-wrapper-"]').forEach(wrapper => {
            if (wrapper.id !== `reply-form-wrapper-${id}`) {
                wrapper.classList.add('hidden');
                const otherId = wrapper.id.replace('reply-form-wrapper-', '');
                const otherReplyDisplay = document.getElementById(`reply-display-${otherId}`);
                const otherActionBtnWrapper = document.getElementById(`action-btn-wrapper-${otherId}`);
                if (otherReplyDisplay) otherReplyDisplay.classList.remove('hidden');
                if (otherActionBtnWrapper) otherActionBtnWrapper.classList.remove('hidden'); 
            }
        });

        // Toggle visibility for the current card
        formWrapper.classList.toggle('hidden');
        if (replyDisplay) replyDisplay.classList.toggle('hidden', !isVisible); // Hide display when form opens, re-show when form closes
        if (actionBtnWrapper) actionBtnWrapper.classList.toggle('hidden', !isVisible); // Hide Balas button when form opens
        
        if (!isVisible) {
            // Form is opening
            textArea.value = originalReply;
            textArea.focus();
            submitBtn.textContent = isEdit ? 'Simpan Perubahan' : 'Kirim Balasan';
        } 
    }

    // Handler untuk tombol Hapus (Mengosongkan balasan)
    async function handleDeleteReply(event) {
        const id = event.target.dataset.id;
        if (!confirm('Anda yakin ingin menghapus balasan admin ini? Balasan akan hilang dari database.')) return;
        
        event.target.disabled = true;
        event.target.textContent = 'Menghapus...';

        try {
            // Menggunakan fungsi saveAdminReply dengan teks kosong ('') untuk menghapus balasan
            // Asumsi fungsi saveAdminReply(id_ulasan, replyText) tersedia di db_jaguar.js
            const success = await saveAdminReply(id, ''); 
            
            if (success) {
                alert('Balasan berhasil dihapus!');
                await loadReviewsTable(); // Muat ulang tabel untuk update tampilan UI
            } else {
                alert('Gagal menghapus balasan.');
            }
        } catch (error) {
            console.error('Error menghapus balasan:', error);
            alert('Koneksi ke server gagal saat menghapus balasan.');
        }
    }
    
    // Handler untuk pengiriman form Balasan/Edit
    async function handleAdminReplySubmit(e) {
        e.preventDefault();
        const form = e.target;
        const id = form.dataset.reviewId;
        const textarea = document.getElementById(`textarea-${id}`);
        const replyText = textarea.value.trim();
        const submitBtn = form.querySelector('.submit-reply-btn');
        
        if (replyText.length < 5) {
            alert('Balasan minimal 5 karakter.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';

        try {
            // Asumsi fungsi saveAdminReply(id_ulasan, replyText) tersedia di db_jaguar.js
            const success = await saveAdminReply(id, replyText); 

            if (success) {
                alert('Balasan admin berhasil disimpan!');
                await loadReviewsTable(); // Muat ulang tabel untuk update UI sepenuhnya
            } else {
                alert('Gagal menyimpan balasan. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Error saat menyimpan balasan:', error);
            alert('Koneksi server gagal saat menyimpan balasan. Pastikan API berfungsi.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Kirim Balasan';
        }
    }

    // Fungsi untuk melampirkan semua event listener
    function attachEventListeners() {
        // Balas Komentar
        document.querySelectorAll('.btn-reply').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                toggleReplyForm(id, false, ''); // Balas baru: isEdit=false, originalReply=''
            };
        });
        
        // Edit Balasan
        document.querySelectorAll('.edit-reply-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const originalReply = btn.dataset.originalReply || '';
                toggleReplyForm(id, true, originalReply); // Edit: isEdit=true, kirim balasan asli
            };
        });

        // Batal
        document.querySelectorAll('.cancel-reply-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                
                document.getElementById(`reply-form-wrapper-${id}`)?.classList.add('hidden');
                // Tampilkan kembali elemen yang disembunyikan
                document.getElementById(`reply-display-${id}`)?.classList.remove('hidden');
                document.getElementById(`action-btn-wrapper-${id}`)?.classList.remove('hidden'); 
            };
        });
        
        // Hapus
        document.querySelectorAll('.delete-reply-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteReply);
        });

        // Submit Form
        document.querySelectorAll('.reply-form').forEach(form => {
            form.onsubmit = handleAdminReplySubmit;
        });
    }

    // Mulai memuat data saat halaman selesai dimuat
    loadReviewsTable();
});