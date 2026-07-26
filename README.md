# FinansialKu

Aplikasi pencatatan keuangan pribadi *offline* berbasis web — bisa diinstal sebagai PWA atau APK Android. Dibangun dengan Next.js + Capacitor.

## Fitur

- **Multi Akun** — Tunai, Bank, Kartu, E-Wallet, Investasi, Tabungan, dan lainnya
- **Catat Pemasukan & Pengeluaran** — Setiap transaksi bisa dikategorikan dengan sub-kategori
- **Anggaran (Budget)** — Atur anggaran mingguan/bulanan/tahunan dengan progress tracker
- **Transaksi Berulang** — Harian, mingguan, bulanan, tahunan dengan interval
- **Transfer Antar Akun** — Saldo otomatis menyesuaikan
- **Laporan** — Ringkasan Bulanan, Mingguan, Tahunan + Tampilan Kalender
- **Ekspor/Impor** — Backup JSON atau ekspor CSV dengan mode gabung/ganti
- **Mode Gelap** — Tema Terang, Gelap, atau Ikuti Sistem
- **Multi Mata Uang** — IDR, USD, EUR, MYR, SGD, JPY, KRW
- **Kalkulator Bawaan** — Di form transaksi
- **Notifikasi Toast** — Feedback sukses/error di semua aksi
- **Skeleton Loading** — Placeholder halus di semua halaman
- **Responsif** — Dioptimalkan untuk mobile dengan target sentuh yang nyaman
- **Indikasi Saldo Negatif** — Warna merah saat saldo minus
- **Transaksi per Akun** — Klik kartu akun untuk lihat transaksinya
- **Offline-First** — Semua data di `localStorage`, tanpa server

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Framework | Next.js 16 (static export) |
| UI | React 19, Tailwind CSS v4 |
| Bahasa | TypeScript |
| Ikon | Material Symbols |
| Grafik | Custom SVG |
| Mobile | Capacitor 8 |

## Mulai

```bash
bun install
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Build

```bash
bun run build
```

Output statis ada di folder `out/`.

## Build Android (Capacitor)

```bash
bun run build
npx cap sync
cd android
./gradlew assembleDebug
```

Output APK: `android/app/build/outputs/apk/debug/app-debug.apk`

> Sudah punya APK? Download rilis terbaru [di sini](https://github.com/codebytrisno/finansialku/releases).
