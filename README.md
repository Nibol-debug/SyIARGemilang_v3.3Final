# Syiar Gemilang — Sistem Informasi Akademik & ERP Sekolah

Sistem ERP terintegrasi untuk **Rumah Gemilang Indonesia** — mengelola siswa, pegawai, akademik, keuangan, aset, dan ujian online (±1300 siswa).

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | NestJS + Prisma ORM + MySQL |
| **Frontend** | Next.js 16 + React 19 + Tailwind CSS |
| **Auth** | JWT (Passport) + RBAC + Permission Guard |
| **Database** | MySQL 8 (`syiar_gemilang`) |
| **Maps** | Leaflet + LocationIQ API |
| **Orkestrasi** | PM2 (backend port `3001`, frontend port `3002`) |

---

## Prasyarat

- Node.js ≥ 18
- npm ≥ 9
- MySQL 8
- PM2 (`npm install -g pm2`)

---

## Cara Install & Jalankan (Panduan Lengkap)

### 1. Ekstrak Project

```bash
unzip delivery-package.zip -d /home/syiargemilang.web.id
cd /home/syiargemilang.web.id
```

### 2. Setup Backend

```bash
cd api
cp .env.example .env   # lalu edit isi .env-nya
nano .env
```

Isi file `.env`:
```env
DATABASE_URL="mysql://syiar_user:password@localhost:3306/syiar_gemilang"
PORT=3001
JWT_SECRET="ganti-dengan-string-acak-yang-aman"
LOCATIONIQ_API_KEY="isi-dari-locationiq"
```

Install dependencies:
```bash
npm install
```

### 3. Setup Frontend

```bash
cd ../public_html
cp .env.example .env.local   # lalu edit
nano .env.local
```

Isi file `.env.local`:
```env
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_LOCATIONIQ_API_KEY="isi-dari-locationiq"
```

Install dependencies:
```bash
npm install
```

### 4. Setup Database

Buat database MySQL:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS syiar_gemilang;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'syiar_user'@'localhost' IDENTIFIED BY 'password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON syiar_gemilang.* TO 'syiar_user'@'localhost'; FLUSH PRIVILEGES;"
```

Sinkronisasi schema Prisma ke database:
```bash
cd ../api
npx prisma db push
```

### 5. Seed Data Awal

```bash
npm run seed
```

Perintah ini akan mengisi:
- Role & Permission (Admin, Kepala Sekolah, Instruktur, Wali Kelas, Bendahara, Staf Sarpras, Siswa, Orang Tua)
- Akun admin default
- Branch (cabang sekolah)
- Jurusan (TKJ, DBS, DG, dll)
- Angkatan (batch)
- Kelas

### 6. Jalankan (Development)

**Terminal 1 — Backend:**
```bash
cd /home/syiargemilang.web.id/api
npm run start:dev
```
→ API berjalan di `http://localhost:3001/api/v1`

**Terminal 2 — Frontend:**
```bash
cd /home/syiargemilang.web.id/public_html
npm run dev
```
→ Web berjalan di `http://localhost:3000`

### 7. Jalankan (Production)

```bash
# Build backend
cd /home/syiargemilang.web.id/api
npm run build
pm2 start dist/main.js --name api

# Build frontend
cd /home/syiargemilang.web.id/public_html
npm run build
pm2 start npm --name frontend-syiar -- start -- -p 3002

# Simpan daftar PM2 biar auto-restart kalau server reboot
pm2 save
pm2 startup
```

### 8. Login

Buka `http://localhost:3000/login` (atau sesuai domain kamu).

**Akun default setelah seed:**
| Role | Username | Password |
|------|----------|----------|
| Admin Utama | `admin` | `admin123` |

> **Catatan:** Ganti password segera setelah pertama login!

---

## Cara Pakai (User Guide)

### Untuk Admin

1. **Login** sebagai admin
2. **Dashboard** → Lihat statistik ringkasan sekolah
3. **Manajemen User** → Tambah/atur role & permission pengguna
4. **Master Data** → Atur jurusan, angkatan, kelas, cabang

### Untuk Manajemen Siswa

1. Buka menu **Students**
2. **Tambah Siswa Baru** — isi form atau import dari Excel
3. **Bulk Promote** — naikkan kelas siswa massal
4. **Upload Foto** — upload foto profil per siswa
5. **Export Excel** — download data siswa

### Untuk Ujian Online (CBT)

1. Buka menu **CBT**
2. **Buat Ujian Baru** — atur judul, durasi, token, kelas peserta
3. **Tambah Soal** — dari bank soal atau buat manual (MCQ/Essay)
4. **Monitoring** — pantau siswa mengerjakan ujian secara real-time
5. **Lihat Pelanggaran** — cek siapa yang terkena warning/force-submit

### Untuk Penilaian & Rapor

1. Buka menu **Grading**
2. **Input Nilai** — pilih kelas & mapel, input nilai harian/UTS/UAS
3. **Finalisasi Nilai** — hitung nilai akhir berdasarkan bobot
4. **Cetak Rapor** — preview & download PDF E-Rapor

### Untuk PPDB Online

1. Buka halaman publik `/ppdb` — calon siswa daftar online
2. Admin buka **PPDB Admin** — verifikasi berkas, setujui/tolak
3. Calon siswa diterima → otomatis terdaftar sebagai siswa aktif

### Untuk Keuangan

1. Buka menu **Finance**
2. **Buat Tagihan (Fee)** — SPP bulanan/biaya lain
3. **Input Pembayaran** — catat pembayaran siswa (tunai/transfer)
4. **Kirim Pengingat** — notifikasi ke siswa yang belum bayar

### Untuk Inventaris

1. Buka menu **Assets**
2. **Tambah Aset** — isi data barang, cetak QR Code
3. **Peminjaman** — catat peminjaman & pengembalian
4. **Stock Opname** — update kondisi aset via scan QR

---

## Perintah Cepat (Cheat Sheet)

```bash
# Backend rebuild + restart
cd /home/syiargemilang.web.id/api && npm run build && pm2 restart api

# Frontend rebuild + restart
cd /home/syiargemilang.web.id/public_html && npm run build && pm2 restart frontend-syiar

# Sync database setelah ubah schema
cd /home/syiargemilang.web.id/api && npx prisma db push && pm2 restart api

# Melihat log
pm2 logs api
pm2 logs frontend-syiar

# Status PM2
pm2 status

# Reset ulang database (hati-hati! data hilang)
cd /home/syiargemilang.web.id/api && npx prisma db push --force-reset && npm run seed
```

---

## Struktur Direktori

```
/home/syiargemilang.web.id/
├── api/                      # Backend NestJS
│   ├── src/                  # Source code (35+ modules)
│   │   ├── auth/             # JWT auth, guards, strategies
│   │   ├── common/           # Decorators, filters, interceptors
│   │   └── .../              # Per-module: controller, service, dto
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (45 models)
│   │   └── seed.ts           # Data seeder
│   ├── uploads/              # File uploads
│   └── dist/                 # Build output
│
├── public_html/              # Frontend Next.js
│   ├── app/                  # Pages (App Router)
│   │   ├── (dashboard)/      # Dashboard pages (protected)
│   │   ├── login/            # Halaman login
│   │   └── ppdb/             # PPDB publik
│   ├── components/           # Shared React components
│   ├── lib/                  # Utilities, API client, hooks
│   └── .next/                # Build output
│
├── PROPOSAL.md               # Proposal pengembangan
├── STRUKTUR_APLIKASI.md      # Dokumentasi struktur aplikasi detail
└── README.md                 # File ini
```

---

## Modul & Route

| Modul | Route Prefix | Halaman |
|-------|-------------|---------|
| Auth | `/auth` | Login, logout, profile |
| Dashboard | `/dashboard` | Statistik ringkasan |
| Students | `/students` | CRUD siswa, import/export, upload foto |
| HRM | `/hrm` | Pegawai, presensi, cuti, payroll, PKG |
| Academic | `/academic` | Mapel, jadwal, absensi, jurnal, kalender |
| CBT | `/cbt` | Ujian online, bank soal, monitoring |
| Grading | `/grading` | Input nilai, analisis, remedial, rapor |
| PPDB | `/ppdb-admin`, `/ppdb` | Pendaftaran online & admin |
| Finance | `/finance` | Tagihan & pembayaran |
| Assets | `/assets` | Inventaris & peminjaman |
| Batches | `/batches` | Manajemen angkatan |
| Majors | `/majors` | Manajemen jurusan |
| Classes | `/classes` | Manajemen kelas |
| Users | `/users` | User, role, permission, audit log |
| Notifications | `/notifications` | Notifikasi sistem |
| Reports | `/reports` | Laporan akademik & keuangan |
| Settings | `/settings` | Pengaturan sistem |

---

## Troubleshooting

### "Terjadi kesalahan database" saat buat ujian
```bash
cd /home/syiargemilang.web.id/api
npx prisma db push
pm2 restart api
```

### Total pegawai/siswa tampil 0 padahal ada data
Pastikan versi terbaru `AnimatedCounter.tsx` digunakan (dengan `prevTarget` ref).

### Frontend error 500 setelah build baru
```bash
cd /home/syiargemilang.web.id/public_html
rm -rf .next
npm run build
pm2 restart frontend-syiar
```

### Login gagal terus
- Cek kredensial di database (bcrypt hash)
- Cek rate limit: tunggu 60 detik setelah 5 percobaan
- Cek log: `pm2 logs api`

### Port sudah dipakai
```bash
# Cek proses di port
lsof -i :3001
lsof -i :3002

# Kill proses
kill -9 <PID>
```

---

## Catatan Penting

- **Upload files** disimpan di `backend/uploads/` dan disajikan via `/uploads/`
- **Database migration** menggunakan `prisma db push`
- **Rate limit**: 10 request/60 detik global; 5 percobaan login/60 detik
- **LocationIQ API key** disimpan di backend `.env` (tidak bocor ke frontend)
- **Anti-Cheat CBT**: Fullscreen mode, tab switch detection, auto-submit on violation
