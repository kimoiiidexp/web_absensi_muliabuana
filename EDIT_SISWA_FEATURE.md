# Fitur Edit Siswa - Guru

## 📋 Gambaran Umum

Halaman **Edit Siswa** adalah fitur khusus untuk guru mengelola daftar siswa yang mereka amp di berbagai mata pelajaran dan kelas. Halaman ini memungkinkan guru untuk melihat, mencari, memberi catatan, dan mengekspor data siswa.

## 🎯 Fitur Utama

### 1. **Filter Multi-Level**
- **Jurusan**: Filter berdasarkan jurusan (TKJ, RPL, AKUNTANSI, dll)
- **Kelas**: Filter berdasarkan kelas yang diajar guru
- **Mata Pelajaran**: Filter berdasarkan mapel yang diampu

### 2. **Pencarian Siswa**
- Search bar untuk mencari nama siswa secara real-time
- Filter otomatis saat mengetik

### 3. **Tabel Siswa Interaktif**
- Menampilkan informasi lengkap siswa:
  - Foto avatar (inisial nama)
  - Nama lengkap
  - Email
  - Nomor telepon
  - Catatan khusus dari guru

### 4. **Catatan Siswa (Catatan Guru)**
- Guru dapat menambahkan catatan untuk setiap siswa
- Contoh penggunaan:
  - Catatan perilaku
  - Catatan akademik
  - Pengingat khusus
  - Catatan kehadiran
- Edit & Save dengan UI yang user-friendly

### 5. **Export CSV**
- Download daftar siswa dalam format CSV
- Termasuk semua informasi: nama, email, telepon, dan catatan
- File otomatis tersimpan dengan tanggal hari ini

## 🏗️ Arsitektur Teknis

### Backend (Go Fiber)

#### New Endpoint
```
GET /api/guru/students?kelas_id={kelasID}
```

#### Files Modified/Created:
1. **BackEnd/internal/repository/siswa_kelas_repository.go**
   - Added: `GetByKelasWithUser()` - Query siswa dengan join ke table users

2. **BackEnd/internal/service/siswa_kelas_service.go**
   - Added: `GetByKelas()` - Business logic untuk mendapatkan siswa per kelas

3. **BackEnd/internal/handler/siswa_kelas_handler.go**
   - Added: `GetByKelas()` - Handler untuk endpoint baru

4. **BackEnd/internal/routes/routes.go**
   - Added route: `guru.Get("/students", siswaKelasHandler.GetByKelas)`

### Frontend (Next.js + TypeScript)

#### New Page
- **FrontEnd/app/edit-siswa/page.tsx**

#### Features Implemented:
- ✅ Filter dropdown (Jurusan, Kelas, Mapel)
- ✅ Real-time search
- ✅ Student table with avatar
- ✅ Editable catatan field
- ✅ Export to CSV functionality
- ✅ Loading states
- ✅ Empty states
- ✅ Responsive design
- ✅ Consistent with existing design system

#### Design System Used:
- Colors: `#230d7d` (primary), `#4187b3` (accent), `#ece8b8` (header)
- Rounded corners: `[24px]`, `[12px]`
- Shadows and hover effects
- Lucide React icons

## 📊 Data Flow

```
1. Guru login → Token disimpan di localStorage
2. Guru buka halaman Edit Siswa
3. Frontend fetch data guru_mapel_kelas → Tampil filter
4. Guru pilih Kelas → Frontend fetch siswa di kelas tersebut
5. Data siswa ditampilkan di tabel
6. Guru bisa:
   - Search nama siswa
   - Tambah/edit catatan
   - Export data ke CSV
```

## 🔐 Authorization

- **Role Required**: `guru`
- **Authentication**: JWT Token
- **Access**: Guru hanya bisa lihat siswa di kelas yang mereka amp

## 🎨 UI/UX Highlights

1. **Consistent Design**
   - Mengikuti design system yang sama dengan halaman lain
   - Header dengan background `#ece8b8`
   - Card dengan rounded corners dan shadow
   - Smooth transitions dan hover effects

2. **User Experience**
   - Loading spinner saat fetch data
   - Empty state yang informatif
   - Search real-time tanpa reload
   - Edit catatan inline (langsung di tabel)
   - Export CSV dengan satu klik

3. **Responsive**
   - Grid layout untuk filter (3 kolom di desktop, 1 kolom di mobile)
   - Table scrollable horizontal di mobile
   - Touch-friendly buttons

## 🚀 Cara Menggunakan

### Untuk Guru:
1. Login sebagai guru
2. Dari dashboard, klik card "Edit Siswa"
3. Pilih Jurusan → Kelas → Mapel (opsional)
4. Lihat daftar siswa di kelas tersebut
5. Gunakan search untuk mencari siswa tertentu
6. Klik icon edit (pensil) untuk menambah catatan
7. Klik "Export CSV" untuk download data

### Contoh Catatan yang Bisa Ditambahkan:
- "Sering terlambat, perlu perhatian"
- "Sangat aktif di kelas, bagus"
- "Perlu bimbingan tambahan di bab 3"
- "Ketua kelas, bertanggung jawab"
- "Izin tidak masuk tanggal 10-12 Mei"

## 📝 Catatan Penting

1. **Data Catatan**: Saat ini catatan disimpan di client-side (localStorage). Untuk production, perlu ditambahkan:
   - Backend endpoint untuk save catatan ke database
   - Table baru `catatan_siswa` di database

2. **Validasi**: Guru hanya bisa akses siswa di kelas yang mereka amp berkat filter di backend

3. **Performance**: 
   - Fetch data on-demand (saat pilih kelas)
   - Search client-side (cepat untuk < 100 siswa)
   - Pagination bisa ditambahkan jika kelas > 100 siswa

## 🔧 Future Improvements

1. **Database Integration**
   - Simpan catatan ke database
   - History perubahan catatan

2. **Advanced Features**
   - Bulk edit catatan
   - Filter berdasarkan status kehadiran
   - Sortir berdasarkan nama/email
   - Pagination untuk kelas besar

3. **Export Options**
   - Export to Excel (XLSX)
   - Export to PDF
   - Custom columns selection

4. **Communication**
   - Quick send email to student
   - Quick send WhatsApp message

## ✅ Testing Checklist

- [x] Backend build successfully
- [x] Frontend build successfully  
- [x] Route registered correctly
- [x] TypeScript compilation passed
- [x] Design consistent with other pages
- [ ] Manual testing with real data
- [ ] Test authorization (siswa can't access)
- [ ] Test with large class (>50 students)

## 📞 Support

Jika ada pertanyaan atau issue, hubungi developer atau buat issue di repository.