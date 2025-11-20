document.addEventListener('DOMContentLoaded', async () => {
    const API_PESANAN_DASHBOARD = 'http://localhost:3000/api/pesanan/dashboard';
    const API_ULASAN = 'http://localhost:3000/api/ulasan';

    const pendapatanHarianEl = document.getElementById('pendapatan-harian');
    const jumlahPesananHarianEl = document.getElementById('jumlah-pesanan-hari-ini');
    const totalUlasanEl = document.getElementById('total-ulasan');
    const ratingRataRataEl = document.getElementById('rating-rata-rata');
    const latestOrdersContainer = document.getElementById('latest-orders-container');
    const latestReviewsContainer = document.getElementById('latest-reviews-container');

    function formatCurrency(v) {
        return 'Rp ' + Number(v).toLocaleString('id-ID');
    }

    function getTodayDateString() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function getStarsHtml(rating) {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    }
    
    function renderLatestOrdersTable(orders) {
        if (orders.length === 0) {
            return `<p class="text-gray-500 p-4">Tidak ada data pesanan hari ini.</p>`;
        }

        let html = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead>
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pesanan</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
        `;

        orders.slice(0, 10).forEach(order => {
            const waktu = new Date(order.waktu_pesanan);
            const waktuFormat = waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            html += `
                <tr>
                    <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.id_pesanan}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${order.nama_pelanggan}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(order.jumlah_total)}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${waktuFormat}</td>
                    
                    <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-[#706442] hover:text-[#5a5136] view-order-btn" data-id="${order.id_pesanan}">Detail</button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        return html;
    }

    async function loadOrderMetrics() {
        if (!pendapatanHarianEl || !jumlahPesananHarianEl || !latestOrdersContainer) return;
        
        pendapatanHarianEl.textContent = 'Memuat...';
        jumlahPesananHarianEl.textContent = 'Memuat...';
        latestOrdersContainer.innerHTML = '<p class="text-gray-500 p-4">Memuat data pesanan...</p>';

        try {
            const response = await fetch(API_PESANAN_DASHBOARD); 
            if (!response.ok) {
                // Perbaikan: Mencantumkan status HTTP untuk diagnostik server
                const errorStatus = response.status;
                throw new Error(`Kesalahan API Pesanan. Status HTTP: ${errorStatus}. Cek server.js.`);
            }
            const result = await response.json();
            
            if (!result.success || !result.data) {
                pendapatanHarianEl.textContent = formatCurrency(0);
                jumlahPesananHarianEl.textContent = 0;
                latestOrdersContainer.innerHTML = `<p class="text-gray-500 p-4">${result.message || 'Gagal mengambil data pesanan.'}</p>`;
                return;
            }

            const { orders = [], todayMetrics = {} } = result.data; 
            
            const totalPendapatanHarian = todayMetrics.total_pendapatan || 0; 
            const jumlahPesananHariIni = todayMetrics.jumlah_pesanan || 0;
            
            pendapatanHarianEl.textContent = formatCurrency(totalPendapatanHarian);
            jumlahPesananHarianEl.textContent = Number(jumlahPesananHariIni).toLocaleString('id-ID'); 
            
            latestOrdersContainer.innerHTML = renderLatestOrdersTable(orders);

        } catch (error) {
            console.error('Error memuat order metrics:', error);
            pendapatanHarianEl.textContent = 'Gagal';
            jumlahPesananHarianEl.textContent = 'Gagal';
            latestOrdersContainer.innerHTML = `<p class="text-red-500 p-4">Gagal memuat data: ${error.message}</p>`;
        }
    }

    async function loadReviewMetrics() {
        if (!totalUlasanEl || !ratingRataRataEl || !latestReviewsContainer) return;
        
        totalUlasanEl.textContent = 'Memuat...';
        ratingRataRataEl.innerHTML = 'Memuat...';
        latestReviewsContainer.innerHTML = '<p class="text-gray-500 p-4">Memuat data ulasan...</p>';

        try {
            const response = await fetch(API_ULASAN); 
            if (!response.ok) {
                throw new Error('Gagal terhubung ke API Ulasan.');
            }
            const result = await response.json();
            
            if (!result.success || !result.stats || !result.data) {
                totalUlasanEl.textContent = 0;
                ratingRataRataEl.innerHTML = '0.0 <span class="text-gray-400 text-xl ml-1">★</span>';
                latestReviewsContainer.innerHTML = `<p class="text-gray-500 p-4">Tidak ada data ulasan.</p>`;
                return;
            }

            const { total_ulasan, rating_rata_rata } = result.stats;
            const reviews = result.data;

            totalUlasanEl.textContent = Number(total_ulasan).toLocaleString('id-ID');
            ratingRataRataEl.innerHTML = `${Number(rating_rata_rata).toFixed(1)} <span class="text-yellow-500 text-xl ml-1">★</span>`;

            if (reviews.length === 0) {
                latestReviewsContainer.innerHTML = '<p class="text-gray-500 p-4">Tidak ada ulasan terbaru.</p>';
                return;
            }
            
            const latestReviews = reviews.slice(0, 3);
            let reviewsHtml = '';

            latestReviews.forEach(review => {
                const stars = getStarsHtml(review.rating_bintang);

                reviewsHtml += `
                    <div class="border-b pb-3">
                        <p class="text-sm font-semibold">${review.nama_pengulas}
                            <span class="text-sm text-yellow-500 ml-2">${stars}</span>
                        </p>
                        <p class="text-sm text-gray-600 mt-1">${review.komentar}</p>
                    </div>
                `;
            });
            
            latestReviewsContainer.innerHTML = reviewsHtml;

        } catch (error) {
            console.error('Error memuat reviews data:', error);
            totalUlasanEl.textContent = 'Gagal';
            ratingRataRataEl.innerHTML = 'Gagal <span class="text-gray-400 text-xl ml-1">★</span>';
            latestReviewsContainer.innerHTML = `<p class="text-red-500 p-4 text-sm">Gagal memuat data ulasan: ${error.message}</p>`;
        }
    }

    await Promise.all([
        loadOrderMetrics(),
        loadReviewMetrics()
    ]);
});