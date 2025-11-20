-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 20 Nov 2025 pada 06.25
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_jaguar`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `detail_pesanan`
--

CREATE TABLE `detail_pesanan` (
  `id_detail` int(11) NOT NULL,
  `id_pesanan` varchar(50) NOT NULL,
  `nama_menu` varchar(255) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `harga_satuan` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `konten`
--

CREATE TABLE `konten` (
  `tentang_kami` text DEFAULT NULL,
  `visi` varchar(255) DEFAULT NULL,
  `keunggulan` text DEFAULT NULL,
  `slogan` varchar(255) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabel konten tunggal tanpa kunci';

--
-- Dumping data untuk tabel `konten`
--

INSERT INTO `konten` (`tentang_kami`, `visi`, `keunggulan`, `slogan`, `last_updated`) VALUES
('Bubur Ayam Bang Jaka telah berdiri sejak 1998 dan berdedikasi menyajikan cita rasa otentik yang tak lekang oleh waktu.', 'Menjadi bubur ayam terfavorit yang selalu menjadi pilihan utama keluarga.', 'Resep keluarga turun-temurun\nBahan baku selalu segar\nPelayanan ramah dan cepat', 'Kehangatan semangkuk bubur yang tak tertandingi.', '2025-11-20 01:56:28');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pesanan`
--

CREATE TABLE `pesanan` (
  `id_pesanan` varchar(50) NOT NULL,
  `tanggal_pesanan` date NOT NULL DEFAULT curdate(),
  `waktu_pesanan` datetime NOT NULL DEFAULT current_timestamp(),
  `nama_pelanggan` varchar(255) NOT NULL,
  `nomor_whatsapp` varchar(20) DEFAULT NULL,
  `jumlah_total` decimal(10,2) NOT NULL,
  `detail_pesanan` text DEFAULT NULL,
  `status_pesanan` varchar(50) NOT NULL DEFAULT 'Menunggu Konfirmasi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pesanan`
--

INSERT INTO `pesanan` (`id_pesanan`, `tanggal_pesanan`, `waktu_pesanan`, `nama_pelanggan`, `nomor_whatsapp`, `jumlah_total`, `detail_pesanan`, `status_pesanan`) VALUES
('WA-344642', '2025-11-20', '2025-11-20 05:45:44', 'putri', '082281809899', 4000.00, NULL, 'Menunggu Konfirmasi');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ulasan`
--

CREATE TABLE `ulasan` (
  `id_ulasan` int(11) NOT NULL,
  `tanggal_ulasan` date NOT NULL,
  `waktu_ulasan` datetime NOT NULL,
  `nama_pengulas` varchar(255) NOT NULL,
  `rating_bintang` tinyint(4) NOT NULL CHECK (`rating_bintang` >= 1 and `rating_bintang` <= 5),
  `komentar` text DEFAULT NULL,
  `balasan_admin` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ulasan`
--

INSERT INTO `ulasan` (`id_ulasan`, `tanggal_ulasan`, `waktu_ulasan`, `nama_pengulas`, `rating_bintang`, `komentar`, `balasan_admin`) VALUES
(101, '2025-11-17', '2025-11-17 08:00:00', 'Siti', 5, 'Buburnya selalu enak dan toppingnya melimpah! Favorit keluarga.', 'Terima kasih banyak, Kak Siti! Kami senang bubur kami menjadi favorit keluarga Anda. Ditunggu pesanan berikutnya!'),
(102, '2025-11-19', '2025-11-19 11:30:00', 'Deny', 4, 'Pelayanan cepat. Cuma agak antri kalau pagi. Mungkin bisa ditambah kursi?', NULL),
(103, '2025-11-20', '2025-11-20 15:00:00', 'Budi Hartono', 5, 'Rasa autentik, tidak ada duanya! Selalu fresh.', NULL),
(104, '2025-11-20', '2025-11-20 05:05:41', 'putri', 5, 'wenak polll', NULL),
(105, '2025-11-20', '2025-11-20 05:17:26', 'putri ajah', 5, 'masakan siapa sih enak bener gelo', NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `fk_detail_pesanan` (`id_pesanan`);

--
-- Indeks untuk tabel `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id_pesanan`);

--
-- Indeks untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  ADD PRIMARY KEY (`id_ulasan`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  MODIFY `id_ulasan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD CONSTRAINT `fk_detail_pesanan` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan` (`id_pesanan`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
