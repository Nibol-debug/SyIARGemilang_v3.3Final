# Syiar Gemilang — Sistem Informasi Akademik & ERP Sekolah

Sistem ERP terintegrasi untuk **Rumah Gemilang Indonesia (RGI)** yang dirancang untuk mengelola data siswa, pegawai, akademik, keuangan, aset, serta pelaksanaan ujian online (CBT) secara real-time.

---

## 🚀 Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| **Backend** | NestJS + Prisma ORM + MySQL |
| **Frontend** | Next.js 16 + React 19 + Tailwind CSS |
| **Auth** | JWT (Passport) + RBAC + Permission Guard |
| **Database** | MySQL 8 (`syiar_gemilang`) |
| **Maps** | Leaflet + LocationIQ API |
| **Process Manager** | PM2 (Backend port `3001`, Frontend port `3002`) |

---

## 📋 Prasyarat Sistem

Sebelum memulai, pastikan perangkat atau server Anda sudah terinstal:
* Node.js ≥ 18
* npm ≥ 9
* MySQL 8
* PM2 (`npm install -g pm2`) *[Opsional untuk Production]*

---

## 🛠️ Panduan Instalasi & Menjalankan Aplikasi

### 1. Clone & Masuk ke Direktori Project
```bash
git clone [https://github.com/Nibol-debug/SyIARGemilang_v3.3Final.git](https://github.com/Nibol-debug/SyIARGemilang_v3.3Final.git)
cd SyIARGemilang_v3.3Final

```

### 2. Setup Database (MySQL)

Masuk ke terminal MySQL Anda dan jalankan perintah berikut untuk membuat database beserta user barunya:

```sql
CREATE DATABASE IF NOT EXISTS syiar_gemilang;
CREATE USER IF NOT EXISTS 'syiar_user'@'localhost' IDENTIFIED BY 'password_kamu_di_sini';
GRANT ALL PRIVILEGES ON syiar_gemilang.* TO 'syiar_user'@'localhost';
FLUSH PRIVILEGES;

```

---

### 3. Konfigurasi & Menjalankan Backend (NestJS)

1. Masuk ke direktori backend:
```bash
cd "backend (NestJS)"

```


2. Salin file environment dan sesuaikan konfigurasinya:
```bash
cp .env.example .env

```


Buka file `.env` dan sesuaikan nilainya:
```env
DATABASE_URL="mysql://syiar_user:password_kamu_di_sini@localhost:3306/syiar_gemilang"
PORT=3001
JWT_SECRET="ganti-dengan-string-acak-yang-aman"
LOCATIONIQ_API_KEY="isi-dengan-api-key-locationiq-anda"

```


3. Install dependencies:
```bash
npm install

```


4. Sinkronisasi skema Prisma dan lakukan Seeding data awal:
```bash
npx prisma db push
npm run seed

```


5. Jalankan backend dalam mode development:
```bash
npm run start:dev

```


> 🖥️ **API URL:** `http://localhost:3001/api/v1`



---

### 4. Konfigurasi & Menjalankan Frontend (Next.js)

1. Buka terminal baru dan masuk ke direktori frontend dari akar project:
```bash
cd "frontend (next.js)"

```


2. Salin file environment:
```bash
cp .env.example .env.local

```


Buka file `.env.local` dan sesuaikan nilainya:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_LOCATIONIQ_API_KEY="isi-dengan-api-key-locationiq-anda"

```


3. Install dependencies:
```bash
npm install

```


4. Jalankan frontend dalam mode development:
```bash
npm run dev

```


> 🌐 **Web App URL:** `http://localhost:3000`



---

## 🔑 Akun Akses Default (Setelah Seeding)

Setelah proses `npm run seed` selesai dijalankan di backend, Anda dapat masuk menggunakan akun administrator berikut:

| Role | Username | Password |
| --- | --- | --- |
| **Admin Utama** | `admin` | `admin123` |

> ⚠️ **PENTING:** Demi keamanan, segera ganti password default ini pada halaman profil setelah Anda berhasil login untuk pertama kalinya.

---

## 🚀 Deployment ke Lingkungan Production (Menggunakan PM2)

Jika Anda ingin melakukan deploy aplikasi ini di server VPS menggunakan PM2, ikuti langkah-balik berikut:

### Build & Start Backend

```bash
cd "backend (NestJS)"
npm run build
pm2 start dist/main.js --name "syiar-backend"

```

### Build & Start Frontend

```bash
cd "../frontend (next.js)"
npm run build
pm2 start npm --name "syiar-frontend" -- start -- -p 3002

```

### Menyimpan Proses PM2

Agar aplikasi otomatis menyala kembali ketika server melakukan reboot/restart:

```bash
pm2 save
pm2 startup

```

---

## 💡 Perintah Cepat & Troubleshoot (Cheat Sheet)

* **Melihat Log Aplikasi via PM2:**
```bash
pm2 logs syiar-backend
pm2 logs syiar-frontend

```


* **Mengecek Status Proses PM2:**
```bash
pm2 status

```


* **Sinkronisasi Ulang Database (Jika Mengubah Skema Prisma):**
```bash
cd "backend (NestJS)"
npx prisma db push
pm2 restart syiar-backend

```


* **Reset Total Database (Hati-hati, Semua Data Akan Hilang):**
```bash
cd "backend (NestJS)"
npx prisma db push --force-reset
npm run seed

```


* **Mengatasi Port Bentrok (`3001` / `3002`):**
```bash
# Cek PID proses yang berjalan di port terkait
lsof -i :3001

# Matikan proses menggunakan PID-nya
kill -9 <PID_PROSES>

```



---

## 📁 Struktur Repositori

```text
SyIARGemilang_v3.3Final/
├── backend (NestJS)/         # Source code Backend API
│   ├── src/                  # Modul aplikasi (Auth, CBT, HRM, Finance, dll)
│   ├── prisma/               # Skema ORM & Script Seeder database
│   └── uploads/              # Penyimpanan file asset statis
├── frontend (next.js)/       # Source code Frontend (Next.js App Router)
│   ├── app/                  # Router Halaman (Dashboard, Login, PPDB)
│   ├── components/           # Komponen UI global reusable
│   └── lib/                  # State management, API Client & Hooks
├── PROPOSAL.md               # Proposal pengembangan sistem
└── STRUKTUR_APLIKASI.md      # Dokumentasi modul & arsitektur aplikasi rinci

```

---

## ⭐ Fitur Utama Sistem

1. **Computer Based Test (CBT):** Fitur anti-contek lengkap dengan deteksi pindah tab (*tab-switching detection*), mode *fullscreen* paksa, serta otomatis kumpul (*auto-submit*) jika terdeteksi pelanggaran berturut-turut.
2. **Manajemen Akademik & E-Rapor:** Pencatatan absensi, penulisan jurnal mengajar instruktur, penilaian berkala, hingga cetak rapor PDF.
3. **Modul Finansial:** Manajemen tagihan SPP bulanan, pencatatan transaksi kas masuk/keluar, dan laporan tunggakan.
4. **Inventaris Sarpras via QR-Code:** Pencatatan aset sekolah beserta fitur peminjaman serta pelacakan kondisi fisik menggunakan *scan* kode QR.
5. **PPDB Online:** Sistem pendaftaran siswa baru terintegrasi, seleksi berkala, dan automasi konversi data calon siswa menjadi siswa aktif setelah disetujui.


## 📸 Preview & Antarmuka Aplikasi

Berikut adalah dokumentasi visual dari modul-modul utama yang tersedia di dalam **Syiar Gemilang ERP**:

<div align="center">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td width="50%" align="center">
        <img src="screenshots/1.png" alt="Landing Page Publik" width="100%"/>
        <br/><sub><b>Landing Page Publik & Integrasi Fitur</b></sub>
      </td>
      <td width="50%" align="center">
        <img src="screenshots/2.png" alt="Portal Login" width="100%"/>
        <br/><sub><b>Gerbang Autentikasi Sistem (Secure Login)</b></sub>
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <img src="screenshots/3.png" alt="Formulir PPDB Online" width="100%"/>
        <br/><sub><b>Formulir Pendaftaran PPDB Online 2026</b></sub>
      </td>
      <td width="50%" align="center">
        <img src="screenshots/4.png" alt="Dashboard Utama ERP" width="100%"/>
        <br/><sub><b>Pusat Kendali Operasional & Statistik Utama Admin</b></sub>
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <img src="screenshots/5.png" alt="Manajemen Data Siswa" width="100%"/>
        <br/><sub><b>Panel Manajemen Data Induk & Status Siswa aktif</b></sub>
      </td>
      <td width="50%" align="center">
        <img src="screenshots/6.png" alt="Manajemen Kepegawaian HRM" width="100%"/>
        <br/><sub><b>Dashboard HRM, Presensi Staf, & Evaluasi Kinerja</b></sub>
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <img src="screenshots/7.png" alt="Manajemen Akademik" width="100%"/>
        <br/><sub><b>Manajemen Kurikulum, Jadwal, & Jurnal Mengajar</b></sub>
      </td>
      <td width="50%" align="center">
        <img src="screenshots/8.png" alt="Modul Ujian CBT" width="100%"/>
        <br/><sub><b>Pusat Pelaksanaan & Monitoring Ujian Online (CBT)</b></sub>
      </td>
    </tr>
  </table>
  <div style="margin-top: 10px; width: 100%;">
    <img src="screenshots/9.png" alt="Cetak Rapor Digital" width="100%"/>
    <br/><sub><b>Modul Penilaian & Cetak E-Rapor Kurikulum Merdeka (PDF)</b></sub>
  </div>
</div>

---
