# 📘 PROPOSAL PENGEMBANGAN SISTEM ERP SEKOLAH

## **Syiar Gemilang (Sistem Informasi Akademik Rumah Gemilang Indonesia)**

---

# 1. 🧾 Pendahuluan

Seiring dengan meningkatnya kebutuhan digitalisasi di lingkungan pendidikan, lembaga membutuhkan sistem yang mampu mengelola seluruh aktivitas akademik dan administrasi secara terintegrasi.

Proposal ini menawarkan solusi transformasi digital untuk institusi pendidikan dengan membangun ekosistem **Enterprise Resource Planning (ERP)** yang terintegrasi. Fokus utama tahap awal adalah implementasi **Modul Ujian Online (CBT)** yang aman, transparan, dan efisien.

---

# 2. 🎯 Tujuan Pengembangan

Tujuan utama sistem ini adalah:

- Meningkatkan efisiensi operasional sekolah
- Mengurangi penggunaan kertas (paperless system)
- Menjamin transparansi dan akurasi data
- Menyediakan sistem terpusat untuk ±1300 siswa
- Mendukung akses multi-perangkat (HP, laptop, dll)

---

# 3. 💡 Keuntungan Utama

| Manfaat | Deskripsi |
|---------|-----------|
| Efisiensi Biaya | Menghilangkan biaya penggandaan kertas, tinta, dan logistik ujian secara permanen (Paperless) |
| Integritas Tinggi | Fitur Anti-Cheat menjamin keaslian hasil ujian dengan deteksi aktivitas mencurigakan secara real-time |
| Sentralisasi Data | Data ±1300 siswa terkelola otomatis dari pendaftaran hingga rapor tanpa input manual berulang |
| Aksesibilitas | Mendukung strategi BYOD (Bring Your Own Device) dengan kompatibilitas di semua perangkat |
| Otomatisasi | Nilai, laporan, dan rekap dihitung otomatis |

---

# 4. 🧩 Cakupan Modul Sistem (Scope of Work)

Sistem ERP ini terdiri dari beberapa modul utama yang saling terintegrasi:

---

## 4.1 Modul Manajemen Siswa (Student Management)

Modul ini berfungsi sebagai pusat data (*Single Source of Truth*) bagi seluruh informasi siswa, yang dirancang untuk mengelola data ±1300 siswa secara sistematis dan terintegrasi.

### Fitur:

- **Profil Siswa Digital**: Pendataan lengkap biodata siswa mencakup NIS, NIK, alamat, riwayat kesehatan, dan foto profil yang terintegrasi dengan database pusat.
- **Database Orang Tua & Wali**: Penyimpanan data kontak dan informasi wali untuk mempermudah jalur komunikasi serta manajemen akses portal orang tua.
- **Sistem Mutasi & Alumni**: Pencatatan otomatis riwayat perpindahan siswa (masuk, pindah, atau keluar) serta pengelolaan data alumni.
- **Manajemen Jurusan & Rombel**: Fitur penempatan siswa ke dalam kelas secara massal dan riwayat kenaikan kelas setiap tahun ajaran. Mendukung multi jurusan: TKJ, DBS, DG, dan lainnya.
- **Kartu Pelajar + QR Code**: Sistem menghasilkan desain kartu pelajar secara instan yang dilengkapi QR Code untuk integrasi absensi dan peminjaman aset.
- **Import & Export Data Massal**: Unggah data dari file Excel untuk mempermudah migrasi data awal tanpa input manual satu per satu.
- **Dashboard Statistik Siswa**: Grafik visual yang menampilkan persebaran data siswa berdasarkan jenis kelamin, usia, wilayah tinggal, hingga status keaktifan secara real-time.

---

## 4.2 Modul Manajemen Pengguna & Hak Akses (ACL)

Pusat kendali keamanan sistem menggunakan metode **Role-Based Access Control (RBAC)**.

### Fitur:

- **Manajemen Akun Terpusat**: Pengelolaan username dan password untuk seluruh warga sekolah (1300 siswa + puluhan instruktur & staf) dalam satu pintu.
- **Role & Permission Mapping**: Pengaturan hak akses yang mendetail — staf keuangan hanya bisa melihat modul SPP tanpa bisa mengakses modul ujian.
- **Log Aktivitas (Audit Trail)**: Mencatat setiap aktivitas penting, seperti siapa yang mengubah nilai atau memvalidasi pembayaran, untuk menghindari manipulasi data.
- **Device Locking (Khusus Ujian)**: Mengunci akun agar hanya bisa digunakan pada satu perangkat saat ujian berlangsung.

---

## 4.3 Modul Kepegawaian (HRM)

Modul ini mengelola seluruh data personal dan profesional tenaga pendidik serta kependidikan secara digital.

### Fitur:

- **Profil Profesional Instruktur**: Pencatatan detail riwayat pendidikan (lulusan, gelar, tahun lulus) dan spesialisasi mata pelajaran yang diampu.
- **Manajemen Masa Kerja**: Pendataan tanggal bergabung, status kepegawaian, dan riwayat kenaikan pangkat atau golongan.
- **Dokumen Digital (E-Wallet)**: Penyimpanan scan ijazah, sertifikat pendidik, SK pengangkatan, dan dokumen penting lainnya dalam satu tempat yang aman.
- **Presensi & Kinerja**: Rekapitulasi kehadiran instruktur per bulan yang dapat dikaitkan dengan perhitungan honor atau tunjangan.
- **Dashboard Personalia**: Grafik statistik sebaran instruktur berdasarkan tingkat pendidikan dan status sertifikasi untuk kebutuhan laporan.

---

## 4.4 Modul Akademik (Academic Management)

Modul ini dirancang untuk mengotomatisasi tata kelola kurikulum dan penjadwalan agar proses KBM berjalan lebih terstruktur dan transparan.

### Fitur:

- **Manajemen Kurikulum & Mata Pelajaran**: Pengaturan daftar mata pelajaran, alokasi jam per minggu, dan pemetaan standar kompetensi berdasarkan Kurikulum Nasional.
- **Penjadwalan Pelajaran Otomatis**: Menyusun jadwal mingguan per kelas untuk menghindari bentrok (*collision*) antara instruktur atau ruangan.
- **Presensi Digital**: Pencatatan kehadiran siswa secara real-time oleh instruktur melalui gadget masing-masing, terhubung langsung ke laporan wali kelas.
- **Manajemen Rombel**: Pengaturan wali kelas, ketua kelas, dan daftar anggota kelas untuk setiap tahun ajaran baru.
- **Kalender Akademik Terintegrasi**: Sinkronisasi jadwal ujian, libur sekolah, dan kegiatan khusus yang dapat dipantau seluruh warga sekolah.
- **Jurnal Mengajar Instruktur**: Ruang bagi instruktur untuk mencatat ringkasan materi dan tugas yang diberikan dalam setiap sesi pertemuan.

---

## 4.5 Modul PPDB Online

Modul ini dirancang untuk menjaring calon siswa baru secara digital dari pendaftaran hingga daftar ulang.

### Fitur:

- **Landing Page Pendaftaran**: Halaman publik berisi informasi persyaratan, jalur pendaftaran, dan formulir pendaftaran online.
- **Sistem Verifikasi Berkas**: Panel admin untuk memvalidasi dokumen yang diunggah calon siswa (Diterima, Ditolak, atau Perlu Perbaikan).
- **Ujian Seleksi Masuk (Integrasi CBT)**: Calon siswa dapat mengikuti tes seleksi menggunakan mesin yang sama dengan Modul CBT.
- **Pengumuman Hasil Seleksi**: Notifikasi otomatis melalui portal kepada calon siswa mengenai status kelulusan.
- **Sistem Daftar Ulang**: Integrasi dengan modul keuangan untuk memantau kelunasan biaya masuk sebelum siswa resmi mendapatkan NIS.

---

## 4.6 Modul Ujian Online (CBT)

Sistem ujian digital sebagai *core system* yang menggantikan ujian berbasis kertas dengan sistem yang aman, efisien, dan otomatis.

### Fitur:

- **Bank Soal Terintegrasi**: Instruktur dapat mengelola ribuan soal berdasarkan mata pelajaran, tingkat kesulitan, dan kategori topik secara terpusat.
- **Fleksibilitas Tipe Soal**: Mendukung pilihan ganda, pilihan ganda kompleks, menjodohkan, jawaban singkat, hingga esai.
- **Anti-Contek Engine**:
  - **Focus Tracking**: Mendeteksi dan mencatat jika siswa membuka tab baru, aplikasi lain, atau meminimalkan jendela ujian.
  - **Auto-Submit & Warning**: Memberikan peringatan bertahap dan *force submit* jika melanggar batas toleransi kecurangan.
  - **Fullscreen Mode**: Memaksa browser masuk mode layar penuh untuk meminimalisir navigasi di luar halaman ujian.
  - **Shuffle Soal & Jawaban**: Setiap siswa mendapat urutan soal dan pilihan jawaban yang berbeda.
- **Manajemen Sesi & Token**: Ujian hanya dapat diakses menggunakan token unik yang dapat diatur durasi aktifnya oleh pengawas.
- **Monitoring Real-Time**: Panel bagi pengawas untuk melihat status pengerjaan siswa (Hadir, Mengerjakan, Selesai, atau Terdeteksi Melanggar).
- **Penilaian Otomatis & Analisis**: Nilai objektif langsung muncul setelah ujian, lengkap dengan analisis butir soal.
- **Sinkronisasi Nilai ke ERP**: Hasil ujian langsung diimpor ke Modul Penilaian tanpa input manual.

---

## 4.7 Modul Penilaian

Modul ini mengolah, menganalisis, dan menyajikan data nilai siswa secara akurat serta terintegrasi langsung dengan database ujian.

### Fitur:

- **Integrasi Otomatis CBT**: Nilai hasil ujian dari Modul CBT langsung ditarik ke buku nilai instruktur tanpa input manual.
- **Pengolahan Nilai Akhir (Weighted Scoring)**: Menghitung nilai akhir berdasarkan bobot yang ditentukan sekolah (misal: 30% Harian, 30% UTS, 40% UAS).
- **Analisis Butir Soal & Daya Pembeda**: Data statistik untuk melihat soal mana yang paling banyak dijawab salah.
- **KKM & Deskripsi Otomatis**: Indikator ketuntasan (Lulus/Remedial) dan teks deskripsi perkembangan kompetensi siswa.
- **Manajemen Remedial**: Mendata siswa yang belum tuntas dan memutakhirkan nilai setelah ujian remedial.
- **E-Rapor & Cetak PDF**: Rapor digital siap cetak (format Dapodik/Kurikulum Merdeka) dengan tanda tangan digital dan QR Code.
- **Portal Nilai Orang Tua**: Orang tua dapat memantau grafik perkembangan nilai anak secara real-time.

---

## 4.8 Modul Keuangan

Modul ini mengotomatisasi manajemen tagihan rutin dan pembangunan, serta memantau status pembayaran secara real-time.

### Fitur:

- **Tagihan Massal (Invoicing)**: Sistem otomatis menghasilkan tagihan bulanan (SPP) untuk seluruh siswa berdasarkan kelas atau tingkat.
- **Transaksi Multi-Channel**: Pencatatan pembayaran tunai maupun transfer bank, lengkap dengan unggah bukti bayar untuk validasi admin.
- **Laporan Tunggakan & Piutang**: Dashboard yang menampilkan daftar siswa yang belum melunasi tagihan, per kelas atau per angkatan.
- **Histori Pembayaran Siswa**: Portal transparan bagi orang tua untuk melihat riwayat pembayaran dan sisa tagihan.
- **Notifikasi Pengingat Otomatis**: Pengingat tagihan melalui dashboard atau email sebelum dan sesudah jatuh tempo.
- **Rekapitulasi Keuangan & Laporan Kas**: Laporan harian, bulanan, dan tahunan untuk pelaporan ke yayasan atau kepala sekolah.
- **Kuitansi Digital**: Bukti bayar resmi dalam format PDF dengan QR Code keamanan.

---

## 4.9 Modul Inventaris (Asset Management)

Modul ini melacak seluruh siklus hidup barang milik sekolah, dari pengadaan hingga penghapusan aset.

### Fitur:

- **Inventarisasi & Kategorisasi Aset**: Pendataan barang berdasarkan kategori (Elektronik, Mebeul, Buku) dan lokasi (Lab, Perpustakaan, Kelas).
- **QR Code Otomatis**: Sistem menghasilkan label QR Code unik untuk setiap aset yang dapat dicetak dan ditempel pada fisik barang.
- **Sistem Peminjaman & Pengembalian**: Pencatatan digital peminjaman barang oleh instruktur atau siswa, lengkap dengan tanggal dan identitas peminjam.
- **Pengecekan Kondisi Aset (Stock Opname)**: Petugas dapat memperbarui kondisi barang (Baik, Rusak Ringan, Rusak Berat) menggunakan pemindai QR Code di smartphone.
- **Penyusutan & Nilai Aset**: Estimasi nilai sisa aset setiap tahun untuk perencanaan peremajaan atau pengadaan baru.
- **Log Perawatan (Maintenance)**: Rekam jejak servis atau perbaikan aset, seperti jadwal servis proyektor atau AC.

---

## 4.10 Dashboard Multi-User

Portal yang dipersonalisasi berdasarkan hak akses masing-masing pengguna.

### Role & Hak Akses:

| Peran (Role) | Hak Akses Utama |
|---|---|
| Administrator Utama | Akses penuh ke seluruh modul, pengaturan server, manajemen user, dan backup database |
| Kepala Sekolah | Hak akses Read-Only untuk seluruh laporan statistik akademik, keuangan, dan aset |
| Instruktur | Manajemen bank soal, pelaksanaan ujian CBT, input nilai harian, dan absensi di kelas masing-masing |
| Wali Kelas | Memantau rekap absensi, grafik perkembangan nilai, dan mencetak E-Rapor untuk siswa di kelas perwaliannya |
| Bendahara / Staf TU | Manajemen tagihan SPP, validasi bukti bayar, dan laporan kas masuk sekolah |
| Staf Sarpras | Manajemen inventaris barang, cetak QR Code aset, dan input jadwal pemeliharaan barang |
| Siswa | Mengikuti ujian online, melihat jadwal pelajaran, cek histori absensi, dan melihat nilai hasil ujian |
| Orang Tua | Memantau kehadiran anak, melihat grafik nilai, dan mengecek sisa tagihan sekolah |

### Fitur:

- **Portal Admin Utama**: Kendali penuh atas seluruh modul, manajemen hak akses pengguna, serta pemantauan statistik sekolah secara menyeluruh.
- **Portal Instruktur**: Akses khusus untuk mengelola bank soal CBT, melakukan absensi kelas, menginput nilai harian, dan melihat jadwal mengajar pribadi.
- **Portal Siswa**: Antarmuka interaktif untuk mengikuti ujian CBT, melihat rekap kehadiran, memantau nilai rapor, serta mengecek status tagihan SPP.
- **Portal Orang Tua**: Akses monitoring untuk melihat perkembangan nilai anak, histori absensi, dan konfirmasi pembayaran biaya sekolah.
- **Sistem Notifikasi Real-Time**: Pemberitahuan otomatis mengenai jadwal ujian, pengumuman sekolah, serta pengingat jatuh tempo pembayaran.
- **Statistik & Analitik Visual**: Penyajian data dalam bentuk grafik dan diagram untuk mempermudah pengambilan keputusan.
- **Single Sign-On (SSO)**: Satu akun untuk semua layanan dengan fitur Device Locking untuk mencegah penyalahgunaan akun saat ujian.

---

# 5. 🛠️ Spesifikasi Teknis & Infrastruktur

- **Backend**: NestJS (Node.js)
- **Frontend**: Next.js
- **Database**: MySQL
- **Server**: Linux (Ubuntu LTS)
- **Web Server**: Nginx / OpenLiteSpeed
- **Realtime**: WebSocket
- **Kapasitas Server**: 4 vCPU, 8GB RAM, NVMe SSD — mampu menangani 500 koneksi ujian serentak

---

# 6. 🔐 Keamanan Sistem

- **JWT Authentication** — otentikasi amar berbasis token
- **Role-Based Access Control (RBAC)** — pengaturan hak akses per pengguna
- **Audit Log** — pencatatan setiap aktivitas penting dalam sistem
- **Enkripsi Password** — penyimpanan password dengan hash aman
- **Focus Tracking** — mendeteksi jika siswa membuka tab atau aplikasi lain saat ujian
- **Fullscreen Enforcement** — memaksa browser dalam mode layar penuh selama ujian
- **Auto-Submit on Violation** — force submit jika melanggar batas toleransi kecurangan
- **Shuffle Soal & Jawaban** — setiap siswa mendapat urutan soal dan opsi jawaban berbeda
- **Warning Bertahap** — peringatan sebelum tindakan auto-submit dijalankan
- **Device Locking** — mencegah login ganda dengan akun yang sama di perangkat berbeda

---

# 7. 🗺️ Roadmap Pengembangan

Tahapan pengembangan sistem:

1. Master Data & Manajemen User
2. Modul Siswa & Kepegawaian
3. Modul PPDB Online
4. Modul Akademik
5. Modul CBT (Core System)
6. Modul Penilaian
7. Modul Keuangan & Inventaris
8. Dashboard & Reporting

---

# 8. 📈 Penutup

Dengan adanya sistem ERP ini, diharapkan seluruh proses operasional sekolah dapat berjalan lebih efisien, transparan, dan terintegrasi dalam satu platform digital.

Sistem ini tidak hanya menjadi solusi jangka pendek, tetapi juga investasi jangka panjang dalam transformasi digital pendidikan di Rumah Gemilang Indonesia.
