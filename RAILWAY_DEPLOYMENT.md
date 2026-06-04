# Deploy ke Railway

Project ini sebaiknya dibuat menjadi 3 service dalam 1 Railway project:

1. `mysql` - database MySQL Railway
2. `backend` - Go/Fiber API dari folder `BackEnd`
3. `frontend` - Next.js static frontend dari folder `FrontEnd`

## 1. Buat Project Railway

1. Login ke Railway.
2. Buat project baru dari repository GitHub project ini.
3. Tambahkan service database: `New` -> `Database` -> `MySQL`.

## 2. Deploy Backend

Tambahkan service baru dari repo yang sama, lalu atur:

- Root Directory: `/`
- Build Command: `go build -ldflags="-w -s" -o out ./BackEnd/cmd`
- Start Command: `./out`

Catatan: backend harus memakai root directory `/` karena file `go.mod` ada di root repository. Jika root directory diarahkan ke `BackEnd`, Railway bisa gagal membaca module Go.

Variables untuk backend:

```env
JWT_SECRET=isi-dengan-secret-yang-kuat
CORS_ALLOW_ORIGINS=https://url-frontend-railway.up.railway.app
FRONTEND_URL=https://url-frontend-railway.up.railway.app
```

Database MySQL Railway akan menyediakan variable berikut, tetapi variable ini harus tersedia juga di service backend:

```env
MYSQLHOST
MYSQLPORT
MYSQLUSER
MYSQLPASSWORD
MYSQLDATABASE
```

Jika tab `Variables` di service backend masih `0 Variables`, backend belum bisa konek database walaupun database sudah bisa dibuka lewat TablePlus. Tambahkan variable MySQL ke service backend, atau tambahkan satu variable URL:

```env
MYSQL_URL=mysql://user:password@host:port/database
```

Pastikan variable MySQL tersebut tersedia di service backend. Jika belum otomatis tersedia, tambahkan sebagai reference dari service MySQL Railway.

Setelah backend deploy, cek:

```txt
https://url-backend-railway.up.railway.app/health
```

Jika normal, hasilnya:

```json
{"status":"ok"}
```

## 3. Import Database

Gunakan file:

```txt
IMPORT_RAILWAY_TABLEPLUS.sql
```

File ini aman untuk import ke database Railway karena tidak menjalankan `CREATE DATABASE` dan `USE`.

Cara import dengan TablePlus:

1. Buka service MySQL di Railway.
2. Ambil variable `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, dan `MYSQLDATABASE`.
3. Buat koneksi baru di TablePlus dengan tipe `MySQL`.
4. Isi host, port, user, password, dan database dari variable Railway.
5. Setelah connect, pilih `File` -> `Import` -> `From SQL Dump`.
6. Pilih `IMPORT_RAILWAY_TABLEPLUS.sql`.

## 4. Deploy Frontend

Tambahkan service baru dari repo yang sama, lalu atur:

- Root Directory: `FrontEnd`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`

Service frontend boleh memakai root directory `FrontEnd` karena `package.json` dan `railway.json` frontend ada di folder tersebut.

Variables untuk frontend:

```env
NEXT_PUBLIC_API_ORIGIN=https://url-backend-railway.up.railway.app
NEXT_PUBLIC_BASE_PATH=
```

Jangan isi `/api` di belakang `NEXT_PUBLIC_API_ORIGIN`.

## 5. Setelah Frontend Punya URL

Kembali ke service backend dan update:

```env
CORS_ALLOW_ORIGINS=https://url-frontend-railway.up.railway.app
FRONTEND_URL=https://url-frontend-railway.up.railway.app
```

Redeploy backend setelah variable berubah.

## 6. Tes

1. Buka URL frontend.
2. Coba login.
3. Jika login gagal, cek:
   - `NEXT_PUBLIC_API_ORIGIN` di frontend
   - `CORS_ALLOW_ORIGINS` di backend
   - variable MySQL di backend
   - data user di database

## 7. Penyebab Error `no Go files in /app`

Error ini muncul ketika Railway menjalankan build Go default dari root `/app`, tetapi sebelumnya root repository tidak punya file Go langsung.

Project ini sekarang punya:

- `main.go` di root supaya build default Railway dari `/app` tetap jalan
- `railway.json` di root untuk service backend
- `FrontEnd/railway.json` untuk service frontend
- `BackEnd/railway.json` sebagai cadangan jika konfigurasi Railway diarahkan dari folder backend
