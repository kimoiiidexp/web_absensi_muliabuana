# Rekap Sesi 1 - Railway Build dan Redirect Menu Guru

Tanggal: 6 Juni 2026

## Tujuan Sesi

1. Mencari penyebab menu guru terasa kembali ke login.
2. Memverifikasi route frontend:
   - `/kehadiran-siswa`
   - `/riwayat-absen`
   - `/absen-guru`
3. Memverifikasi request yang berpotensi menghasilkan `401` atau gagal.
4. Memperbaiki error TypeScript pada `FrontEnd/app/absen-keluar/page.tsx`.
5. Memastikan build frontend berhasil agar Railway bisa deploy ulang.

## Kondisi Awal

Repository lokal tertinggal 10 commit dari `origin/main`. Karena itu, beberapa route yang ada di GitHub/Railway belum terlihat di lokal, termasuk:

- `FrontEnd/app/absen-keluar/page.tsx`
- `FrontEnd/app/absen-masuk/page.tsx`
- `FrontEnd/app/absen/page.tsx`
- `FrontEnd/app/kehadiran-siswa/page.tsx`
- `FrontEnd/app/riwayat-absen/page.tsx`
- `FrontEnd/app/rekap-absensi-guru/page.tsx`
- `FrontEnd/app/rekap-absensi-siswa/page.tsx`

Lokal kemudian disinkronkan ke `origin/main` dengan tetap menjaga perubahan lokal yang belum dicommit.

## Masalah yang Ditemukan

### 1. Build Frontend Railway Gagal

Error utama:

```txt
./app/absen-keluar/page.tsx:45:11
Type error: No overload matches this call.
Argument of type '{ onDecodeError: () => void; preferredCamera: string; highlightCodeOutlineColor: string; }'
is not assignable to parameter of type 'number'.
```

Penyebab:

- Package `qr-scanner` yang terpasang adalah versi `1.4.2`.
- Opsi `highlightCodeOutlineColor` tidak cocok dengan type definition versi tersebut.
- Error yang sama juga ada di halaman scanner lain, sehingga tidak cukup hanya memperbaiki `absen-keluar`.

### 2. Route Menu Guru

Route berikut sudah ada setelah lokal disinkronkan dengan GitHub:

- `/kehadiran-siswa`
- `/riwayat-absen`
- `/absen-guru`

Namun ada link dashboard guru yang salah:

- Kartu `Rekap Absen` guru mengarah ke `/rekap-absensi-siswa`.
- Kartu `Riwayat` guru mengarah ke `/riwayat`, padahal route yang tersedia adalah `/riwayat-absen`.

### 3. Endpoint Backend Belum Lengkap untuk Beberapa Halaman

Endpoint yang dipanggil frontend tetapi belum terlihat terdaftar di backend:

- `GET /api/attendance/students` dari halaman `/kehadiran-siswa`
- `GET /api/siswa/riwayat` dari halaman `/riwayat-absen`

Endpoint guru yang sudah terdaftar:

- `GET /api/guru/cek-absen`
- `POST /api/guru/absen`
- `GET /api/guru/mapel-kelas`
- `GET /api/guru/students`

Jika endpoint guru menghasilkan error:

- `401` berarti token kosong, format salah, atau token invalid.
- `403` berarti token valid tetapi role tidak sesuai, misalnya bukan `guru`.

## Perubahan yang Diupdate

### Frontend

File yang diperbaiki:

- `FrontEnd/app/absen-keluar/page.tsx`
- `FrontEnd/app/absen-masuk/page.tsx`
- `FrontEnd/app/absen/page.tsx`

Perubahan:

```ts
highlightCodeOutlineColor: "rgb(65, 135, 179)"
```

diganti menjadi:

```ts
highlightScanRegion: true
```

Alasan:

- `highlightScanRegion` valid untuk `qr-scanner@1.4.2`.
- Build TypeScript menjadi berhasil.

File dashboard yang diperbaiki:

- `FrontEnd/app/my-activity/page.tsx`

Perubahan:

- Link guru `Rekap Absen`: `/rekap-absensi-siswa` -> `/rekap-absensi-guru`
- Link guru `Riwayat`: `/riwayat` -> `/riwayat-absen`

### Backend dan Dokumentasi yang Sudah Ada di Working Tree

Masih ada perubahan lokal sebelum sesi ini di:

- `BackEnd/app/app.go`
- `RAILWAY_DEPLOYMENT.md`

Isi perubahan tersebut antara lain:

- Normalisasi CORS origin.
- Penambahan root endpoint `/`.
- Catatan dokumentasi tentang generate domain frontend Railway.

Perubahan ini belum dipush juga, jadi akan ikut masuk jika semua file dicommit.

## Verifikasi yang Dilakukan

Frontend:

```txt
npm run build
```

Hasil:

```txt
Compiled successfully
Finished TypeScript
Generated static pages successfully
```

Backend:

```txt
go test ./...
```

Hasil:

```txt
Berhasil, tidak ada test failure.
```

## Status Solved

Solved:

- Error TypeScript `qr-scanner` pada `absen-keluar`.
- Error serupa pada `absen-masuk` dan `absen`.
- Build frontend lokal sudah berhasil.
- Route `/kehadiran-siswa`, `/riwayat-absen`, dan `/absen-guru` sudah terverifikasi ada di frontend terbaru.
- Link dashboard guru untuk `Rekap Absen` dan `Riwayat` sudah diarahkan ke route yang benar.
- Backend berhasil dikompilasi lewat `go test ./...`.

Belum solved / perlu sesi lanjutan:

- Endpoint `GET /api/attendance/students` belum tersedia di backend.
- Endpoint `GET /api/siswa/riwayat` belum tersedia di backend.
- Jika halaman tersebut perlu data asli, backend perlu ditambah endpoint atau frontend diarahkan ke endpoint yang sudah ada.
- Perlu test langsung di Railway setelah push untuk memastikan environment variable `NEXT_PUBLIC_API_ORIGIN`, CORS, dan domain frontend/backend sudah benar.

## Apakah Bisa Push ke GitHub?

Bisa. Setelah perubahan ini dipush ke GitHub, Railway seharusnya otomatis deploy ulang jika service Railway tersambung ke branch `main`.

Sebelum push, disarankan cek ulang file yang akan dicommit:

```txt
git status
git diff --stat
```

Jika semua perubahan memang ingin ikut dipush:

```txt
git add .
git commit -m "Fix frontend Railway build and guru dashboard routes"
git push origin main
```

Catatan:

- Push akan memasukkan fix frontend.
- Push juga akan memasukkan perubahan lokal di backend dan dokumentasi jika ikut di-`git add`.
- Jika ingin hanya push fix frontend, commit hanya file frontend yang berubah.

