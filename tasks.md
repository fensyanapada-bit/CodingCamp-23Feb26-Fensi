# Tasks: Expense Budget Visualizer

## Task List

- [x] 1. Setup Struktur Proyek
  - [x] 1.1 Buat folder struktur: `css/`, `js/`, dan file `index.html` di root proyek
  - [x] 1.2 Buat file `css/style.css` kosong
  - [x] 1.3 Buat file `js/app.js` kosong
  - **Requirements**: REQ-8 (Struktur File dan Kode)

- [x] 2. Buat Struktur HTML (index.html)
  - [x] 2.1 Buat kerangka HTML5 dasar dengan meta charset, viewport, dan title "Expense Budget Visualizer"
  - [x] 2.2 Tambahkan link ke `css/style.css` dan script Chart.js dari CDN (`https://cdn.jsdelivr.net/npm/chart.js`)
  - [x] 2.3 Buat section header dengan elemen tampilan total saldo (id: `total-balance`)
  - [x] 2.4 Buat section form input dengan field: Nama Item (id: `item-name`), Amount (id: `amount`), Kategori dropdown (id: `category`) dengan opsi Makanan/Transportasi/Hiburan, tombol Submit, dan area pesan error (id: `error-message`)
  - [x] 2.5 Buat section daftar transaksi dengan container scrollable (id: `transaction-list`)
  - [x] 2.6 Buat section chart dengan elemen `<canvas>` (id: `expense-chart`)
  - [x] 2.7 Tambahkan link ke `js/app.js` di bagian bawah body
  - **Requirements**: REQ-1, REQ-3, REQ-5, REQ-6 

- [x] 3. Implementasi StorageManager (js/app.js)
  - [x] 3.1 Implementasi `StorageManager.loadTransactions()` — baca dari LocalStorage key `"expense_transactions"`, parse JSON, return array kosong jika tidak ada atau error parse
  - [x] 3.2 Implementasi `StorageManager.saveTransactions(transactions)` — serialisasi array ke JSON dan simpan ke LocalStorage
  - [x] 3.3 Implementasi `StorageManager.addTransaction(transaction)` — load existing, push transaction baru, save kembali
  - [x] 3.4 Implementasi `StorageManager.removeTransaction(id)` — load existing, filter out item dengan id yang cocok, save kembali
  - [x] 3.5 Tambahkan try-catch pada semua operasi LocalStorage untuk menangani kasus storage tidak tersedia atau data korup
  - **Requirements**: REQ-7 (Persistensi Data)

- [x] 4. Implementasi TransactionManager (js/app.js)
  - [x] 4.1 Implementasi `TransactionManager.validateInput(name, amount, category)` — validasi semua field sesuai aturan (tidak kosong, amount > 0, kategori valid, nama max 100 karakter), return `{ valid, message }`
  - [x] 4.2 Implementasi `TransactionManager.createTransaction(name, amount, category)` — buat objek Transaction dengan id unik (`"txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)`), name, amount (parseFloat), category, createdAt (ISO string)
  - [x] 4.3 Implementasi `TransactionManager.calculateTotal(transactions)` — reduce array untuk menjumlahkan semua amount, return 0 untuk array kosong
  - [x] 4.4 Implementasi `TransactionManager.getCategoryTotals(transactions)` — reduce array menjadi objek `{ category: total }` untuk digunakan chart
  - [x] 4.5 Implementasi `TransactionManager.handleFormSubmit(event)` — preventDefault, ambil nilai form, validasi, buat transaksi, simpan, perbarui UI dan chart, bersihkan form
  - [x] 4.6 Implementasi `TransactionManager.handleDelete(id)` — hapus dari storage, perbarui UI dan chart
  - **Requirements**: REQ-1, REQ-2, REQ-4, REQ-5

- [x] 5. Implementasi UIRenderer (js/app.js)
  - [x] 5.1 Implementasi `UIRenderer.renderTransactionList(transactions)` — kosongkan container, tampilkan placeholder jika kosong, atau render setiap item menggunakan `createTransactionElement`
  - [x] 5.2 Implementasi `UIRenderer.createTransactionElement(transaction)` — buat elemen HTML untuk satu item transaksi (nama, jumlah terformat, kategori, tombol hapus) menggunakan `textContent` (bukan innerHTML) untuk mencegah XSS
  - [x] 5.3 Implementasi `UIRenderer.renderTotalBalance(total)` — perbarui elemen total saldo dengan format Rupiah (contoh: "Rp 110.000")
  - [x] 5.4 Implementasi `UIRenderer.showValidationError(message)` — tampilkan pesan error di elemen error-message
  - [x] 5.5 Implementasi `UIRenderer.hideValidationError()` — sembunyikan elemen error-message
  - [x] 5.6 Implementasi `UIRenderer.clearForm()` — reset semua field form ke nilai default
  - [x] 5.7 Tambahkan format mata uang Rupiah menggunakan `Intl.NumberFormat` atau format manual dengan pemisah ribuan
  - **Requirements**: REQ-1, REQ-2, REQ-3, REQ-5, REQ-9

- [x] 6. Implementasi ChartManager (js/app.js)
  - [x] 6.1 Implementasi `ChartManager.initChart(categoryTotals)` — inisialisasi instance Chart.js bertipe "pie" pada canvas `expense-chart`, dengan data awal dari categoryTotals
  - [x] 6.2 Implementasi `ChartManager.updateChart(categoryTotals)` — perbarui data labels, data values, dan warna pada instance chart yang ada, panggil `chart.update()`
  - [x] 6.3 Implementasi `ChartManager.getCategoryColors(categories)` — return array warna yang konsisten per kategori (Makanan: hijau, Transportasi: biru, Hiburan: ungu/merah muda)
  - [x] 6.4 Tangani kasus data kosong — tampilkan chart kosong atau pesan placeholder saat tidak ada transaksi
  - [x] 6.5 Tangani kasus Chart.js tidak tersedia (CDN gagal dimuat) — tampilkan pesan "Grafik tidak tersedia" di area chart
  - **Requirements**: REQ-6

- [x] 7. Inisialisasi Aplikasi (js/app.js)
  - [x] 7.1 Tambahkan event listener `DOMContentLoaded` yang memanggil: `StorageManager.loadTransactions()`, render UI awal, inisialisasi chart
  - [x] 7.2 Daftarkan event listener form submit ke `TransactionManager.handleFormSubmit`
  - [x] 7.3 Pastikan event delegation untuk tombol hapus di daftar transaksi (gunakan event listener pada container, bukan per-item)
  - **Requirements**: REQ-1, REQ-3, REQ-5, REQ-6, REQ-7

- [x] 8. Styling CSS (css/style.css)
  - [x] 8.1 Buat CSS reset/base dan definisikan variabel warna (CSS custom properties) untuk palet warna konsisten
  - [x] 8.2 Style layout utama — gunakan CSS Grid atau Flexbox untuk mengatur section form, total, daftar, dan chart
  - [x] 8.3 Style form input — field, label, tombol submit dengan tampilan bersih dan minimalis
  - [x] 8.4 Style tampilan total saldo — menonjol di bagian atas dengan tipografi besar dan jelas
  - [x] 8.5 Style daftar transaksi — scrollable container, setiap item dengan layout yang rapi, tombol hapus yang jelas
  - [x] 8.6 Style area chart — ukuran yang proporsional, terpusat
  - [x] 8.7 Style pesan error — warna merah/oranye yang jelas, mudah terlihat
  - [x] 8.8 Pastikan tipografi mudah dibaca (font-size, line-height, kontras warna yang cukup)
  - **Requirements**: REQ-10 (Tampilan dan UX)

- [ ] 9. Verifikasi dan Pengujian Manual
  - [ ] 9.1 Buka `index.html` di browser dan verifikasi semua komponen UI ter-render dengan benar
  - [ ] 9.2 Uji skenario tambah transaksi valid — verifikasi item muncul di daftar, total diperbarui, chart diperbarui, form dikosongkan
  - [ ] 9.3 Uji validasi form — coba submit dengan field kosong, amount negatif/nol, verifikasi pesan error muncul
  - [ ] 9.4 Uji hapus transaksi — verifikasi item hilang, total dan chart diperbarui
  - [ ] 9.5 Uji persistensi — tambah transaksi, refresh halaman, verifikasi data masih ada
  - [ ] 9.6 Uji keamanan XSS — masukkan `<script>alert('xss')</script>` sebagai nama item, verifikasi ditampilkan sebagai teks biasa
  - [ ] 9.7 Verifikasi tidak ada error di browser console
  - **Requirements**: REQ-1 s/d REQ-10
