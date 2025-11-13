/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./**/*.html',
		'./js/**/*.{js,ts}',
		'./src/**/*.{html,js}',
	],
	theme: {
		extend: {
				animation: {
					// marquee scroll: geser seluruh daftar dari 0 ke -50% (kita menggandakan item di markup)
					scroll: 'scroll 20s linear infinite',
				},
				keyframes: {
					scroll: {
						'0%': { transform: 'translate3d(0,0,0)' },
						'100%': { transform: 'translate3d(-50%,0,0)' },
					},
				},
			colors: {
				// Token warna proyek
				primary: '#faf1e6',
				secondary: '#fdfaf6',
				accent: '#E4EFE7',
				footer: '#064420',
				background: '#ffffff',
			},
		},
	},
	plugins: [
	// Utilitas aspect-ratio mungkin diperlukan oleh markup (aspect-w-16, aspect-h-9)
	// Jika paket @tailwindcss/aspect-ratio belum terpasang, jalankan:
	// npm install -D @tailwindcss/aspect-ratio
		require('@tailwindcss/aspect-ratio'),
	],
}
