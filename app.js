// ============================================================
// StorageManager
// Mengelola semua operasi baca/tulis ke LocalStorage browser.
// Jika LocalStorage tidak tersedia, fallback ke in-memory storage.
// ============================================================

const StorageManager = (() => {
  const STORAGE_KEY = "expense_transactions";

  // Deteksi ketersediaan LocalStorage saat modul diinisialisasi
  let _storageAvailable = false;
  let _inMemoryStore = [];

  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    _storageAvailable = true;
  } catch (e) {
    _storageAvailable = false;
    console.warn(
      "LocalStorage tidak tersedia. Aplikasi berjalan dalam mode in-memory. " +
      "Data tidak akan tersimpan setelah halaman ditutup."
    );
  }

  return {
    /**
     * Mengambil semua transaksi dari LocalStorage (atau in-memory store).
     * @returns {Array} Array transaksi, atau array kosong jika tidak ada / error parse.
     */
    loadTransactions() {
      if (!_storageAvailable) {
        return [..._inMemoryStore];
      }

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null || raw === undefined) {
          return [];
        }
        const parsed = JSON.parse(raw);
        // Pastikan hasilnya adalah array
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Data korup — reset storage dan kembalikan array kosong
        console.warn("Data LocalStorage tidak valid, mereset ke state kosong.", e);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (removeErr) {
          // Abaikan error saat mencoba menghapus
        }
        return [];
      }
    },

    /**
     * Menyimpan array transaksi ke LocalStorage (atau in-memory store).
     * @param {Array} transactions - Array transaksi yang akan disimpan.
     */
    saveTransactions(transactions) {
      if (!_storageAvailable) {
        _inMemoryStore = Array.isArray(transactions) ? [...transactions] : [];
        return;
      }

      try {
        const serialized = JSON.stringify(transactions);
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (e) {
        console.error("Gagal menyimpan transaksi ke LocalStorage.", e);
      }
    },

    /**
     * Menambah satu transaksi baru ke storage.
     * @param {Object} transaction - Objek transaksi yang akan ditambahkan.
     */
    addTransaction(transaction) {
      try {
        const transactions = this.loadTransactions();
        transactions.push(transaction);
        this.saveTransactions(transactions);
      } catch (e) {
        console.error("Gagal menambah transaksi.", e);
      }
    },

    /**
     * Menghapus transaksi berdasarkan ID dari storage.
     * Jika ID tidak ditemukan, tidak ada perubahan (idempotent).
     * @param {string} id - ID transaksi yang akan dihapus.
     */
    removeTransaction(id) {
      try {
        const transactions = this.loadTransactions();
        const filtered = transactions.filter((t) => t.id !== id);
        this.saveTransactions(filtered);
      } catch (e) {
        console.error("Gagal menghapus transaksi.", e);
      }
    },

    /**
     * Mengembalikan apakah LocalStorage tersedia.
     * @returns {boolean}
     */
    isStorageAvailable() {
      return _storageAvailable;
    }
  };
})();


// ============================================================
// TransactionManager
// Mengelola logika bisnis: validasi, pembuatan, penghapusan
// transaksi, serta koordinasi antara StorageManager, UIRenderer,
// dan ChartManager.
// ============================================================

const TransactionManager = (() => {
  const VALID_CATEGORIES = ["Makanan", "Transportasi", "Hiburan"];

  return {
    /**
     * Memvalidasi data form sebelum disimpan.
     * Memeriksa: nama tidak kosong, panjang maks 100 karakter,
     * amount > 0, dan kategori valid.
     *
     * @param {string} name     - Nama item pengeluaran.
     * @param {number} amount   - Jumlah pengeluaran.
     * @param {string} category - Kategori pengeluaran.
     * @returns {{ valid: boolean, message: string }}
     */
    validateInput(name, amount, category) {
      // Validasi nama: tidak boleh kosong
      if (!name || name.trim() === "") {
        return { valid: false, message: "Nama item tidak boleh kosong" };
      }

      // Validasi nama: maksimal 100 karakter
      if (name.trim().length > 100) {
        return { valid: false, message: "Nama item maksimal 100 karakter" };
      }

      // Validasi amount: harus angka positif
      if (isNaN(amount) || amount <= 0) {
        return { valid: false, message: "Jumlah harus berupa angka positif" };
      }

      // Validasi kategori: harus salah satu dari nilai yang valid
      if (!VALID_CATEGORIES.includes(category)) {
        return { valid: false, message: "Pilih kategori yang valid" };
      }

      return { valid: true, message: "" };
    },

    /**
     * Membuat objek transaksi baru dengan ID unik.
     *
     * @param {string} name     - Nama item pengeluaran (sudah tervalidasi).
     * @param {number} amount   - Jumlah pengeluaran (sudah tervalidasi).
     * @param {string} category - Kategori pengeluaran (sudah tervalidasi).
     * @returns {{ id: string, name: string, amount: number, category: string, createdAt: string }}
     */
    createTransaction(name, amount, category) {
      return {
        id: "txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        amount: parseFloat(amount),
        category: category,
        createdAt: new Date().toISOString()
      };
    },

    /**
     * Menghitung total semua pengeluaran dari array transaksi.
     *
     * @param {Array} transactions - Array objek transaksi.
     * @returns {number} Total jumlah pengeluaran, atau 0 jika array kosong.
     */
    calculateTotal(transactions) {
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return 0;
      }
      return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    },

    /**
     * Mengelompokkan total pengeluaran per kategori untuk digunakan chart.
     *
     * @param {Array} transactions - Array objek transaksi.
     * @returns {{ [category: string]: number }} Objek dengan total per kategori.
     */
    getCategoryTotals(transactions) {
      if (!Array.isArray(transactions)) {
        return {};
      }
      return transactions.reduce((totals, t) => {
        if (t.category) {
          totals[t.category] = (totals[t.category] || 0) + (t.amount || 0);
        }
        return totals;
      }, {});
    },

    /**
     * Handler untuk event submit form.
     * Melakukan: preventDefault, ambil nilai form, validasi, buat transaksi,
     * simpan ke storage, perbarui UI dan chart, bersihkan form.
     *
     * @param {Event} event - DOM submit event.
     */
    handleFormSubmit(event) {
      event.preventDefault();

      const name     = document.getElementById("item-name").value.trim();
      const amount   = parseFloat(document.getElementById("amount").value);
      const category = document.getElementById("category").value;

      const result = TransactionManager.validateInput(name, amount, category);

      if (!result.valid) {
        UIRenderer.showValidationError(result.message);
        return;
      }

      UIRenderer.hideValidationError();

      const transaction = TransactionManager.createTransaction(name, amount, category);
      StorageManager.addTransaction(transaction);

      const transactions   = StorageManager.loadTransactions();
      const total          = TransactionManager.calculateTotal(transactions);
      const categoryTotals = TransactionManager.getCategoryTotals(transactions);

      UIRenderer.renderTransactionList(transactions);
      UIRenderer.renderTotalBalance(total);
      ChartManager.updateChart(categoryTotals);

      UIRenderer.clearForm();
    },

    /**
     * Handler untuk menghapus transaksi berdasarkan ID.
     * Menghapus dari storage, lalu memperbarui UI dan chart.
     *
     * @param {string} id - ID transaksi yang akan dihapus.
     */
    handleDelete(id) {
      StorageManager.removeTransaction(id);

      const transactions   = StorageManager.loadTransactions();
      const total          = TransactionManager.calculateTotal(transactions);
      const categoryTotals = TransactionManager.getCategoryTotals(transactions);

      UIRenderer.renderTransactionList(transactions);
      UIRenderer.renderTotalBalance(total);
      ChartManager.updateChart(categoryTotals);
    }
  };
})();


// ============================================================
// UIRenderer
// Mengelola semua manipulasi DOM dan rendering tampilan.
// Menggunakan textContent (bukan innerHTML) untuk semua konten
// yang berasal dari input pengguna, guna mencegah XSS (REQ-9).
// ============================================================

const UIRenderer = (() => {
  /**
   * Memformat angka sebagai mata uang Rupiah.
   * Contoh: 110000 → "Rp 110.000"
   *
   * @param {number} amount - Jumlah yang akan diformat.
   * @returns {string} String mata uang Rupiah yang terformat.
   */
  function formatRupiah(amount) {
    // Gunakan Intl.NumberFormat untuk format angka dengan pemisah ribuan
    const formatted = new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return "Rp " + formatted;
  }

  return {
    /**
     * Merender ulang seluruh daftar transaksi ke DOM.
     * Jika array kosong, tampilkan pesan placeholder.
     *
     * @param {Array} transactions - Array objek transaksi.
     */
    renderTransactionList(transactions) {
      const listContainer = document.getElementById("transaction-list");
      if (!listContainer) return;

      // Kosongkan container
      listContainer.innerHTML = "";

      // Tampilkan placeholder jika tidak ada transaksi
      if (!Array.isArray(transactions) || transactions.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Belum ada transaksi";
        emptyMessage.className = "empty-placeholder";
        listContainer.appendChild(emptyMessage);
        return;
      }

      // Render setiap item transaksi
      transactions.forEach((transaction) => {
        const element = this.createTransactionElement(transaction);
        listContainer.appendChild(element);
      });
    },

    /**
     * Membuat elemen HTML untuk satu item transaksi.
     * Menggunakan textContent untuk semua konten pengguna (mencegah XSS).
     *
     * @param {Object} transaction - Objek transaksi.
     * @returns {HTMLElement} Elemen div yang merepresentasikan satu transaksi.
     */
    createTransactionElement(transaction) {
      // Container item
      const item = document.createElement("div");
      item.className = "transaction-item";
      item.setAttribute("role", "listitem");

      // Nama item — menggunakan textContent untuk mencegah XSS
      const nameEl = document.createElement("span");
      nameEl.className = "transaction-name";
      nameEl.textContent = transaction.name;

      // Jumlah terformat
      const amountEl = document.createElement("span");
      amountEl.className = "transaction-amount";
      amountEl.textContent = formatRupiah(transaction.amount);

      // Kategori
      const categoryEl = document.createElement("span");
      categoryEl.className = "transaction-category";
      categoryEl.textContent = transaction.category;

      // Tombol hapus
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-delete";
      deleteBtn.type = "button";
      deleteBtn.textContent = "Hapus";
      deleteBtn.setAttribute("aria-label", "Hapus transaksi " + transaction.name);
      deleteBtn.setAttribute("data-id", transaction.id);

      item.appendChild(nameEl);
      item.appendChild(amountEl);
      item.appendChild(categoryEl);
      item.appendChild(deleteBtn);

      return item;
    },

    /**
     * Memperbarui tampilan total saldo dengan format Rupiah.
     * Contoh: 110000 → "Rp 110.000"
     *
     * @param {number} total - Total saldo yang akan ditampilkan.
     */
    renderTotalBalance(total) {
      const balanceEl = document.getElementById("total-balance");
      if (!balanceEl) return;
      balanceEl.textContent = formatRupiah(total || 0);
    },

    /**
     * Menampilkan pesan error validasi di elemen error-message.
     *
     * @param {string} message - Pesan error yang akan ditampilkan.
     */
    showValidationError(message) {
      const errorEl = document.getElementById("error-message");
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.style.display = "block";
    },

    /**
     * Menyembunyikan elemen pesan error.
     */
    hideValidationError() {
      const errorEl = document.getElementById("error-message");
      if (!errorEl) return;
      errorEl.textContent = "";
      errorEl.style.display = "none";
    },

    /**
     * Mereset semua field form ke nilai default.
     * - Text/number fields: dikosongkan
     * - Dropdown: kembali ke pilihan pertama (nilai kosong)
     */
    clearForm() {
      const nameEl     = document.getElementById("item-name");
      const amountEl   = document.getElementById("amount");
      const categoryEl = document.getElementById("category");

      if (nameEl)     nameEl.value     = "";
      if (amountEl)   amountEl.value   = "";
      if (categoryEl) categoryEl.value = "";
    }
  };
})();


// ============================================================
// ChartManager
// Mengelola inisialisasi dan pembaruan pie chart menggunakan Chart.js.
// ============================================================

const ChartManager = (() => {
  // Instance Chart.js yang dibuat saat initChart dipanggil
  let chartInstance = null;

  /**
   * Menampilkan atau menyembunyikan overlay placeholder "Belum ada data"
   * di atas canvas chart.
   *
   * @param {boolean} show - true untuk menampilkan, false untuk menyembunyikan.
   */
  function setPlaceholderVisible(show) {
    // Cari atau buat elemen placeholder overlay
    let placeholder = document.getElementById("chart-placeholder");

    if (!placeholder) {
      // Buat elemen placeholder jika belum ada
      placeholder = document.createElement("p");
      placeholder.id = "chart-placeholder";
      placeholder.className = "chart-placeholder";
      placeholder.textContent = "Belum ada data";

      // Sisipkan ke dalam .chart-container (parent dari canvas)
      const canvas = document.getElementById("expense-chart");
      if (canvas && canvas.parentNode) {
        canvas.parentNode.appendChild(placeholder);
      }
    }

    placeholder.style.display = show ? "block" : "none";
  }

  return {
    /**
     * Menginisialisasi pie chart pertama kali pada canvas element.
     * Jika categoryTotals kosong, chart diinisialisasi dalam state kosong
     * dan placeholder "Belum ada data" ditampilkan.
     *
     * @param {{ [category: string]: number }} categoryTotals - Total per kategori.
     */
    initChart(categoryTotals) {
      const canvas = document.getElementById("expense-chart");
      if (!canvas) {
        return;
      }

      // Jika Chart.js tidak tersedia, tampilkan pesan fallback (task 6.5)
      if (typeof Chart === "undefined") {
        const container = canvas.parentNode;
        if (container) {
          const fallback = document.createElement("p");
          fallback.id = "chart-unavailable";
          fallback.className = "chart-placeholder";
          fallback.textContent = "Grafik tidak tersedia";
          container.appendChild(fallback);
        }
        return;
      }

      const labels = Object.keys(categoryTotals || {});
      const data   = Object.values(categoryTotals || {});
      const colors = this.getCategoryColors(labels);

      chartInstance = new Chart(canvas, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom"
            }
          }
        }
      });

      // Tampilkan placeholder jika tidak ada data awal
      setPlaceholderVisible(labels.length === 0);
    },

    /**
     * Memperbarui data chart (labels, values, warna) tanpa re-render penuh.
     * Memanggil chart.update() setelah memperbarui data.
     *
     * Jika categoryTotals kosong, chart ditampilkan dalam state kosong
     * dan overlay placeholder "Belum ada data" ditampilkan.
     *
     * @param {{ [category: string]: number }} categoryTotals - Total per kategori.
     */
    updateChart(categoryTotals) {
      // Jika chartInstance belum diinisialisasi, tidak ada yang bisa diperbarui
      if (!chartInstance) {
        return;
      }

      const labels = Object.keys(categoryTotals);
      const data   = Object.values(categoryTotals);
      const colors = this.getCategoryColors(labels);

      // Tangani kasus data kosong — tampilkan chart dalam state kosong + placeholder
      if (labels.length === 0) {
        chartInstance.data.labels              = [];
        chartInstance.data.datasets[0].data   = [];
        chartInstance.update();
        setPlaceholderVisible(true);
        return;
      }

      // Sembunyikan placeholder dan perbarui labels, data values, dan warna
      setPlaceholderVisible(false);
      chartInstance.data.labels                          = labels;
      chartInstance.data.datasets[0].data               = data;
      chartInstance.data.datasets[0].backgroundColor    = colors;
      chartInstance.update();
    },

    /**
     * Menghasilkan array warna yang konsisten per kategori.
     * Setiap kategori yang dikenal mendapat warna tetap; kategori tidak dikenal
     * mendapat warna fallback abu-abu.
     *
     * Peta warna:
     *   Makanan      → #4CAF50 (hijau)
     *   Transportasi → #2196F3 (biru)
     *   Hiburan      → #9C27B0 (ungu)
     *   (lainnya)    → #9E9E9E (abu-abu)
     *
     * @param {string[]} categories - Array nama kategori.
     * @returns {string[]} Array warna dalam format CSS, satu per kategori.
     */
    getCategoryColors(categories) {
      const COLOR_MAP = {
        "Makanan":      "#4CAF50",
        "Transportasi": "#2196F3",
        "Hiburan":      "#9C27B0"
      };
      const FALLBACK_COLOR = "#9E9E9E";

      if (!Array.isArray(categories)) {
        return [];
      }

      return categories.map((category) => COLOR_MAP[category] || FALLBACK_COLOR);
    }
  };
})();


// ============================================================
// Inisialisasi Aplikasi
// Dijalankan saat DOM selesai dimuat. Memuat data dari storage,
// merender UI awal, menginisialisasi chart, dan mendaftarkan
// semua event listener.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // 7.1 — Muat data dari storage dan render UI awal
  const transactions   = StorageManager.loadTransactions();
  const total          = TransactionManager.calculateTotal(transactions);
  const categoryTotals = TransactionManager.getCategoryTotals(transactions);

  UIRenderer.renderTransactionList(transactions);
  UIRenderer.renderTotalBalance(total);
  ChartManager.initChart(categoryTotals);

  // 7.2 — Daftarkan event listener form submit
  const form = document.getElementById("expense-form");
  if (form) {
    form.addEventListener("submit", TransactionManager.handleFormSubmit.bind(TransactionManager));
  }

  // 7.3 — Event delegation untuk tombol hapus pada container daftar transaksi
  const transactionList = document.getElementById("transaction-list");
  if (transactionList) {
    transactionList.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.classList.contains("btn-delete")) {
        const id = target.getAttribute("data-id");
        if (id) {
          TransactionManager.handleDelete(id);
        }
      }
    });
  }
});
