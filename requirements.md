# Requirements Document: Expense Budget Visualizer

## Introduction

Dokumen ini mendefinisikan kebutuhan fungsional dan non-fungsional untuk Aplikasi Visualisasi Pengeluaran & Anggaran. Aplikasi ini adalah single-page web application berbasis vanilla JavaScript yang memungkinkan pengguna mencatat pengeluaran, melihat daftar transaksi, memantau total saldo, dan memvisualisasikan distribusi pengeluaran per kategori melalui pie chart — semuanya tanpa backend, menggunakan LocalStorage browser.

## Requirements

### Requirement 1: Form Input Transaksi

**User Story**: Sebagai pengguna, saya ingin mengisi form dengan nama item, jumlah, dan kategori pengeluaran, agar saya bisa mencatat transaksi baru dengan mudah.

#### Acceptance Criteria

1. GIVEN pengguna membuka aplikasi, WHEN halaman dimuat, THEN form input ditampilkan dengan tiga field: Nama Item (text), Jumlah/Amount (number), dan Kategori (dropdown).
2. GIVEN dropdown Kategori, WHEN pengguna membuka dropdown, THEN tersedia tepat tiga pilihan: "Makanan", "Transportasi", dan "Hiburan".
3. GIVEN pengguna mengisi semua field dengan data valid, WHEN pengguna mengklik tombol Submit, THEN transaksi baru ditambahkan ke daftar dan form dikosongkan.
4. GIVEN transaksi berhasil ditambahkan, WHEN form dikosongkan, THEN semua field kembali ke nilai default (kosong untuk text/number, pilihan pertama untuk dropdown).

---

### Requirement 2: Validasi Form

**User Story**: Sebagai pengguna, saya ingin mendapat umpan balik yang jelas saat input saya tidak valid, agar saya tahu apa yang perlu diperbaiki.

#### Acceptance Criteria

1. GIVEN pengguna mengosongkan field Nama Item, WHEN pengguna mengklik Submit, THEN pesan error "Nama item tidak boleh kosong" ditampilkan dan transaksi tidak disimpan.
2. GIVEN pengguna mengisi Amount dengan nilai 0 atau negatif, WHEN pengguna mengklik Submit, THEN pesan error "Jumlah harus berupa angka positif" ditampilkan dan transaksi tidak disimpan.
3. GIVEN pengguna tidak memilih kategori yang valid, WHEN pengguna mengklik Submit, THEN pesan error "Pilih kategori yang valid" ditampilkan dan transaksi tidak disimpan.
4. GIVEN pesan error sedang ditampilkan, WHEN pengguna berhasil submit form yang valid, THEN pesan error disembunyikan.
5. GIVEN field Nama Item, WHEN pengguna memasukkan lebih dari 100 karakter, THEN pesan error ditampilkan dan transaksi tidak disimpan.

---

### Requirement 3: Daftar Transaksi

**User Story**: Sebagai pengguna, saya ingin melihat semua transaksi yang sudah saya catat dalam sebuah daftar, agar saya bisa memantau riwayat pengeluaran saya.

#### Acceptance Criteria

1. GIVEN ada transaksi tersimpan, WHEN halaman dimuat atau transaksi baru ditambahkan, THEN daftar menampilkan semua transaksi dengan informasi: Nama Item, Jumlah (diformat sebagai mata uang), dan Kategori.
2. GIVEN daftar transaksi, WHEN jumlah item melebihi tinggi area daftar, THEN daftar dapat di-scroll secara vertikal.
3. GIVEN tidak ada transaksi tersimpan, WHEN halaman dimuat, THEN pesan placeholder "Belum ada transaksi" ditampilkan di area daftar.
4. GIVEN setiap item di daftar, WHEN ditampilkan, THEN setiap item memiliki tombol hapus yang dapat diklik.

---

### Requirement 4: Hapus Transaksi

**User Story**: Sebagai pengguna, saya ingin menghapus transaksi yang salah dari daftar, agar data pengeluaran saya tetap akurat.

#### Acceptance Criteria

1. GIVEN pengguna mengklik tombol hapus pada sebuah item, WHEN aksi hapus diproses, THEN item tersebut dihapus dari daftar transaksi secara permanen.
2. GIVEN sebuah transaksi dihapus, WHEN penghapusan selesai, THEN total saldo diperbarui secara otomatis untuk mencerminkan penghapusan tersebut.
3. GIVEN sebuah transaksi dihapus, WHEN penghapusan selesai, THEN pie chart diperbarui secara otomatis untuk mencerminkan distribusi kategori yang baru.
4. GIVEN pengguna menghapus semua transaksi, WHEN daftar menjadi kosong, THEN pesan placeholder "Belum ada transaksi" kembali ditampilkan.

---

### Requirement 5: Total Saldo

**User Story**: Sebagai pengguna, saya ingin melihat total keseluruhan pengeluaran saya di bagian atas halaman, agar saya bisa langsung mengetahui berapa total yang sudah saya keluarkan.

#### Acceptance Criteria

1. GIVEN aplikasi dimuat, WHEN halaman pertama kali dibuka, THEN total saldo ditampilkan di bagian atas halaman, mencerminkan jumlah semua transaksi yang tersimpan.
2. GIVEN pengguna menambah transaksi baru, WHEN transaksi berhasil disimpan, THEN total saldo diperbarui secara otomatis tanpa perlu refresh halaman.
3. GIVEN pengguna menghapus transaksi, WHEN penghapusan selesai, THEN total saldo diperbarui secara otomatis.
4. GIVEN tidak ada transaksi, WHEN halaman dimuat, THEN total saldo ditampilkan sebagai Rp 0.
5. GIVEN total saldo, WHEN ditampilkan, THEN nilai diformat sebagai mata uang Rupiah (contoh: "Rp 110.000").

---

### Requirement 6: Pie Chart Distribusi Kategori

**User Story**: Sebagai pengguna, saya ingin melihat pie chart yang menampilkan distribusi pengeluaran per kategori, agar saya bisa memahami pola pengeluaran saya secara visual.

#### Acceptance Criteria

1. GIVEN ada transaksi tersimpan, WHEN halaman dimuat, THEN pie chart ditampilkan dengan segmen untuk setiap kategori yang memiliki transaksi.
2. GIVEN pengguna menambah atau menghapus transaksi, WHEN perubahan terjadi, THEN pie chart diperbarui secara otomatis tanpa refresh halaman.
3. GIVEN pie chart, WHEN ditampilkan, THEN setiap segmen memiliki warna yang berbeda dan konsisten per kategori.
4. GIVEN pie chart, WHEN pengguna mengarahkan kursor ke segmen, THEN tooltip menampilkan nama kategori dan jumlah total pengeluaran untuk kategori tersebut.
5. GIVEN tidak ada transaksi, WHEN halaman dimuat atau semua transaksi dihapus, THEN area chart menampilkan state kosong atau pesan placeholder.

---

### Requirement 7: Persistensi Data

**User Story**: Sebagai pengguna, saya ingin data pengeluaran saya tetap tersimpan meskipun saya menutup atau me-refresh browser, agar saya tidak kehilangan riwayat pengeluaran saya.

#### Acceptance Criteria

1. GIVEN pengguna menambah transaksi, WHEN pengguna me-refresh halaman, THEN semua transaksi yang sebelumnya ditambahkan masih ditampilkan.
2. GIVEN pengguna menghapus transaksi, WHEN pengguna me-refresh halaman, THEN transaksi yang dihapus tidak muncul kembali.
3. GIVEN data di LocalStorage, WHEN data tidak dapat di-parse sebagai JSON valid, THEN aplikasi mereset ke state kosong tanpa crash dan menampilkan daftar kosong.
4. GIVEN LocalStorage tidak tersedia, WHEN aplikasi diinisialisasi, THEN aplikasi tetap berjalan (dalam mode in-memory) dan menampilkan pesan informatif kepada pengguna.

---

### Requirement 8: Struktur File dan Kode

**User Story**: Sebagai developer, saya ingin kode terorganisir dengan baik dalam struktur file yang jelas, agar mudah dipahami dan dipelihara.

#### Acceptance Criteria

1. GIVEN proyek aplikasi, WHEN diperiksa, THEN terdapat tepat satu file CSS di dalam folder `css/` (yaitu `css/style.css`).
2. GIVEN proyek aplikasi, WHEN diperiksa, THEN terdapat tepat satu file JavaScript di dalam folder `js/` (yaitu `js/app.js`).
3. GIVEN file `index.html`, WHEN dibuka di browser modern (Chrome, Firefox, Edge, Safari), THEN aplikasi berjalan dengan benar tanpa error di console.
4. GIVEN kode JavaScript, WHEN diperiksa, THEN kode menggunakan vanilla JavaScript murni tanpa framework eksternal (kecuali Chart.js untuk chart).

---

### Requirement 9: Keamanan dan Keandalan

**User Story**: Sebagai pengguna, saya ingin aplikasi aman dari injeksi konten berbahaya dan andal dalam menangani input yang tidak terduga.

#### Acceptance Criteria

1. GIVEN pengguna memasukkan karakter HTML atau script di field Nama Item (contoh: `<script>alert('xss')</script>`), WHEN item ditampilkan di daftar, THEN karakter tersebut ditampilkan sebagai teks biasa (tidak dieksekusi sebagai HTML/script).
2. GIVEN pengguna memasukkan karakter khusus seperti `&`, `<`, `>`, `"` di field Nama Item, WHEN item ditampilkan, THEN karakter tersebut ditampilkan dengan benar sebagai teks.

---

### Requirement 10: Tampilan dan Pengalaman Pengguna

**User Story**: Sebagai pengguna, saya ingin tampilan aplikasi bersih, minimalis, dan mudah digunakan, agar pengalaman mencatat pengeluaran terasa menyenangkan.

#### Acceptance Criteria

1. GIVEN aplikasi dibuka, WHEN halaman dimuat, THEN layout menampilkan semua komponen utama (form, total saldo, daftar transaksi, pie chart) dalam satu tampilan yang terorganisir.
2. GIVEN aplikasi dibuka di perangkat dengan layar berbeda, WHEN halaman ditampilkan, THEN layout tetap dapat digunakan dan terbaca dengan baik.
3. GIVEN semua elemen UI, WHEN ditampilkan, THEN tipografi mudah dibaca dengan kontras warna yang cukup.
4. GIVEN interaksi pengguna (tambah/hapus transaksi), WHEN aksi dilakukan, THEN UI merespons secara instan tanpa lag yang terasa.
