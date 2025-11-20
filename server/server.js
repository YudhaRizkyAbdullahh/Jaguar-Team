const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_NAME = 'db_jaguar';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log(`Database pool berhasil dibuat. Terhubung ke: ${DATABASE_NAME}`);
} catch (error) {
    console.error('Gagal membuat database pool:', error.message);
    process.exit(1);
}

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

//menjalankan file static dari root direktori
app.use(express.static(path.join(__dirname, '..')));

// API 
app.get('/api/pesanan/dashboard', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const [metricResults] = await pool.query(
            `SELECT 
                COALESCE(SUM(jumlah_total), 0) AS total_pendapatan,
                COUNT(id_pesanan) AS jumlah_pesanan
             FROM pesanan 
             WHERE tanggal_pesanan = ? AND status_pesanan = 'Selesai'`,
            [today]
        );
        
        const todayMetrics = metricResults[0];

        const [latestOrders] = await pool.query(
            `SELECT id_pesanan, nama_pelanggan, jumlah_total, waktu_pesanan 
             FROM pesanan 
             ORDER BY waktu_pesanan DESC 
             LIMIT 10`
        );

        res.status(200).json({
            success: true,
            message: 'Data dashboard pesanan berhasil diambil.',
            data: {
                todayMetrics: {
                    total_pendapatan: Number(todayMetrics.total_pendapatan),
                    jumlah_pesanan: Number(todayMetrics.jumlah_pesanan)
                },
                orders: latestOrders
            }
        });
    } catch (error) {
        console.error('Error saat mengambil data dashboard pesanan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard pesanan dari database.', error: error.message });
    }
});

app.post('/api/pesanan', async (req, res) => {
    const {
        id_pesanan,
        nama_pelanggan,
        nomor_whatsapp,
        jumlah_total,
        detail_pesanan
    } = req.body;

    const current_id = id_pesanan || 'WA-' + Date.now().toString().slice(-6);
    const tanggal_pesanan = new Date().toISOString().split('T')[0];
    const waktu_pesanan = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const status_pesanan_default = 'Menunggu Konfirmasi';

    if (!nama_pelanggan || !nomor_whatsapp || !jumlah_total || !detail_pesanan) {
        return res.status(400).json({ success: false, message: 'Data pesanan tidak lengkap.' });
    }

    try {
        const query = 'INSERT INTO pesanan (id_pesanan, tanggal_pesanan, waktu_pesanan, nama_pelanggan, nomor_whatsapp, jumlah_total, detail_pesanan, status_pesanan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [current_id, tanggal_pesanan, waktu_pesanan, nama_pelanggan, nomor_whatsapp, jumlah_total, JSON.stringify(detail_pesanan), status_pesanan_default]);

        if (result.affectedRows > 0) {
            res.status(201).json({ success: true, message: 'Pesanan berhasil disimpan.', id_pesanan: current_id });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menyimpan data pesanan.' });
        }
    } catch (error) {
        console.error('Error saat menyimpan data pesanan:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data pesanan ke database.', error: error.message });
    }
});

app.get('/api/pesanan', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT id_pesanan, tanggal_pesanan, waktu_pesanan, nama_pelanggan, nomor_whatsapp, jumlah_total, status_pesanan FROM pesanan ORDER BY waktu_pesanan DESC');

        res.status(200).json({
            success: true,
            message: 'Data pesanan berhasil diambil.',
            data: orders
        });
    } catch (error) {
        console.error('Error saat mengambil data pesanan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pesanan dari database.', error: error.message });
    }
});

app.put('/api/pesanan/:id/status', async (req, res) => {
    const id_pesanan = req.params.id;
    const { status_pesanan } = req.body;

    if (!status_pesanan) {
        return res.status(400).json({ success: false, message: 'Status pesanan tidak boleh kosong.' });
    }

    try {
        const [result] = await pool.query('UPDATE pesanan SET status_pesanan = ? WHERE id_pesanan = ?', [status_pesanan, id_pesanan]);

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Status pesanan berhasil diperbarui.' });
        } else {
            res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan atau status sudah sama.' });
        }
    } catch (error) {
        console.error('Error saat memperbarui status pesanan:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui status pesanan.', error: error.message });
    }
});

app.get('/api/konten', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT tentang_kami, visi, keunggulan, slogan, last_updated FROM konten LIMIT 1');
        
        if (results.length > 0) {
            res.status(200).json({ success: true, message: 'Data konten berhasil diambil.', data: results[0] });
        } else {
            res.status(404).json({ success: false, message: 'Data konten tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error saat mengambil data konten:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data konten dari database.', error: error.message });
    }
});

app.put('/api/konten', async (req, res) => {
    const { tentang_kami, visi, keunggulan, slogan } = req.body;

    if (!tentang_kami || !visi || !keunggulan || !slogan) {
        return res.status(400).json({ success: false, message: 'Semua kolom konten harus diisi.' });
    }

    try {
        const query = 'UPDATE konten SET tentang_kami = ?, visi = ?, keunggulan = ?, slogan = ?';
        const [result] = await pool.query(query, [tentang_kami, visi, keunggulan, slogan]);

        if (result.affectedRows >= 0) {
            res.status(200).json({ success: true, message: 'Data konten berhasil diperbarui.' });
        } else {
            res.status(500).json({ success: false, message: 'Gagal memperbarui data konten.' });
        }
    } catch (error) {
        console.error('Error saat memperbarui data konten:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui data konten di database.', error: error.message });
    }
});

app.post('/api/ulasan', async (req, res) => {
    const { nama_pengulas, rating_bintang, komentar } = req.body;

    const tanggal_ulasan = new Date().toISOString().split('T')[0];
    const waktu_ulasan = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!nama_pengulas || !rating_bintang || !komentar) {
        return res.status(400).json({ success: false, message: 'Data ulasan tidak lengkap.' });
    }

    try {
        const query = 'INSERT INTO ulasan (nama_pengulas, rating_bintang, komentar, tanggal_ulasan, waktu_ulasan, balasan_admin) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [nama_pengulas, rating_bintang, komentar, tanggal_ulasan, waktu_ulasan, null]);

        if (result.affectedRows > 0) {
            res.status(201).json({ success: true, message: 'Ulasan berhasil disimpan.', id_ulasan: result.insertId });
        } else {
            res.status(500).json({ success: false, message: 'Gagal menyimpan data ulasan.' });
        }
    } catch (error) {
        console.error('Error saat menyimpan data ulasan:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data ulasan ke database.', error: error.message });
    }
});

app.get('/api/ulasan', async (req, res) => {
    try {
        const [reviews] = await pool.query('SELECT id_ulasan, rating_bintang, komentar, nama_pengulas, waktu_ulasan, balasan_admin FROM ulasan ORDER BY waktu_ulasan DESC');
        const [stats] = await pool.query('SELECT COUNT(*) AS total_ulasan, AVG(rating_bintang) AS rating_rata_rata FROM ulasan');

        const totalUlasan = stats[0].total_ulasan || 0;
        const ratingRataRata = parseFloat(stats[0].rating_rata_rata || 0).toFixed(1);

        res.status(200).json({
            success: true,
            message: 'Data ulasan dan statistik berhasil diambil.',
            data: reviews,
            stats: {
                total_ulasan: Number(totalUlasan),
                rating_rata_rata: Number(ratingRataRata)
            }
        });
    } catch (error) {
        console.error('Error saat mengambil data ulasan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data ulasan dan statistik.', error: error.message });
    }
});

app.put('/api/ulasan/:id/reply', async (req, res) => {
    const id_ulasan = req.params.id;
    const { balasan_admin } = req.body;

    if (balasan_admin === undefined) {
        return res.status(400).json({ success: false, message: 'Data balasan admin tidak lengkap.' });
    }

    try {
        const [result] = await pool.query('UPDATE ulasan SET balasan_admin = ? WHERE id_ulasan = ?', [balasan_admin, id_ulasan]);

        if (result.affectedRows > 0) {
            const [updatedReview] = await pool.query('SELECT id_ulasan, balasan_admin FROM ulasan WHERE id_ulasan = ?', [id_ulasan]);
            res.status(200).json({ success: true, message: 'Balasan admin berhasil disimpan.', data: updatedReview[0] });
        } else {
            res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error saat menyimpan balasan admin:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan balasan admin.', error: error.message });
    }
});

// Handle root URL untuk menjalankan file HTML utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/tampilan/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Frontend dapat diakses di http://localhost:${PORT}/html/tampilan/index.html`);
});