# Bubur Ayam Bang Jaka — Frontend

Situs statis sederhana yang dibangun dengan HTML, Tailwind CSS, dan JavaScript.

Quick start (Windows / PowerShell):

1. Install dependencies

# Bubur Ayam Bang Jaka — Frontend

Proyek ini adalah frontend statis untuk situs "Bubur Ayam Bang Jaka". Teknologi utama:

- HTML statis
- Tailwind CSS (dengan `src/input.css` sebagai sumber)
- Vanilla JavaScript untuk interaksi (folder `js/`)

## Prasyarat
- Node.js (versi modern, mis. v18+)
- npm (disertakan dengan Node)
- `npx` (disertakan dengan npm)
- (opsional) 7-Zip jika ingin membuat RAR/7z di Windows dengan mudah

## Langkah cepat (Windows / PowerShell)

1) Ekstrak repo

2) Pasang dependensi

```powershell
npm install
```

3) Bangun Tailwind CSS lokal

```powershell
npx tailwindcss -i ./src/input.css -o ./src/output.css --minify
```

4) Jalankan server statis untuk melihat halaman

```powershell
npm run start
# lalu buka http://localhost:8000/html/index.html
```

## Perintah npm yang sudah disediakan

- `npm run build:css` — membangun `src/output.css` dari `src/input.css`
- `npm run start` — menjalankan server statis di port 8000 (menggunakan `http-server` via npx)
- `npm run check` — jalankan pemeriksaan headless (butuh server berjalan): `node tools/run_headless_check.js`

## Menjalankan pemeriksaan headless (opsional)

1. Pastikan server berjalan (lihat langkah 4 di atas).
2. Jalankan:

```powershell
npm run check
```