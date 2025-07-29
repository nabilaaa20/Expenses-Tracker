let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let myCategoryChart;

// Inisialisasi modal untuk alert dan confirm
let customAlertDialog;
let customConfirmDialog;

window.onload = () => {
    loadData();
    // Inisialisasi modal setelah DOM dimuat
    customAlertDialog = document.getElementById('custom_alert_modal');
    customConfirmDialog = document.getElementById('custom_confirm_modal');
};

document.getElementById('expenseForm').addEventListener('submit', handleFormSubmit);

/**
 * Memuat data pengeluaran dari localStorage dan merender ulang tampilan.
 */
function loadData() {
    expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    renderExpenses();
}

/**
 * Merender daftar pengeluaran ke dalam DOM.
 * Menggunakan kelas DaisyUI untuk styling.
 */
function renderExpenses() {
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = '';

    // Hanya menampilkan 5 pengeluaran terakhir di halaman utama
    expenses.slice(0, 5).forEach((expense, index) => {
        const li = document.createElement('li');
        // Menggunakan kelas DaisyUI 'card' dan 'bg-base-200' untuk item daftar
        li.className = 'card card-compact bg-base-200 shadow-sm rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center';

        li.innerHTML = `
            <div class="flex-grow">
                <p class="font-semibold text-lg text-base-content">${expense.description}</p>
                <p class="text-sm text-gray-500">${expense.date} • <em class="text-gray-600">${expense.category}</em></p>
            </div>
            <div class="flex items-center gap-2 mt-3 md:mt-0">
                <span class="font-bold text-success text-xl">Rp${expense.amount.toLocaleString('id-ID')}</span>
                <button class="btn btn-sm btn-warning rounded-lg" onclick="editExpense(${index})">Edit</button>
                <button class="btn btn-sm btn-error rounded-lg" onclick="showConfirmDelete(${index})">Hapus</button>
            </div>
        `;
        expensesList.appendChild(li);
    });
    updateTotals();
}

/**
 * Menangani pengiriman form untuk menambah atau mengedit pengeluaran.
 * @param {Event} e - Objek event submit.
 */
function handleFormSubmit(e) {
    e.preventDefault();
    const editIndex = document.getElementById('editIndex').value;

    const newExpense = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    // Validasi input
    if (!newExpense.description || isNaN(newExpense.amount) || !newExpense.date || !newExpense.category) {
        showCustomAlert("Harap isi semua kolom dengan benar.");
        return;
    }

    if (editIndex !== '') {
        // Mode edit
        expenses[editIndex] = newExpense;
        showCustomAlert("Pengeluaran berhasil diperbarui!");
    } else {
        // Mode tambah baru
        expenses.unshift(newExpense); // Tambahkan ke awal array
        showCustomAlert("Pengeluaran baru berhasil ditambahkan!");
    }

    // Reset form
    document.getElementById('submitBtn').textContent = 'Tambah Pengeluaran';
    document.getElementById('editIndex').value = '';
    document.getElementById('expenseForm').reset();

    saveData();
    renderExpenses();
}

/**
 * Mengisi form dengan data pengeluaran yang akan diedit.
 * @param {number} index - Indeks pengeluaran dalam array expenses.
 */
function editExpense(index) {
    const expense = expenses[index];
    document.getElementById('description').value = expense.description;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('date').value = expense.date;
    document.getElementById('category').value = expense.category;
    document.getElementById('editIndex').value = index;
    document.getElementById('submitBtn').textContent = 'Simpan Perubahan';
    window.scrollTo(0, 0); // Gulir ke atas untuk melihat form
}

/**
 * Menampilkan modal konfirmasi sebelum menghapus pengeluaran.
 * @param {number} index - Indeks pengeluaran yang akan dihapus.
 */
function showConfirmDelete(index) {
    document.getElementById('confirm_message').textContent = 'Yakin ingin menghapus pengeluaran ini?';
    document.getElementById('confirm_yes_button').onclick = () => {
        customConfirmDialog.close();
        deleteExpense(index);
    };
    customConfirmDialog.showModal();
}

/**
 * Menghapus pengeluaran dari array dan localStorage.
 * @param {number} index - Indeks pengeluaran yang akan dihapus.
 */
function deleteExpense(index) {
    expenses.splice(index, 1);
    saveData();
    renderExpenses();
    showCustomAlert("Pengeluaran berhasil dihapus.");
}

/**
 * Menyimpan array expenses ke localStorage.
 */
function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

/**
 * Memperbarui total pengeluaran dan rincian kategori.
 */
function updateTotals() {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById('totalAmount').textContent = `Rp${totalAmount.toLocaleString('id-ID')}`;

    const categoryTotals = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Lainnya'; // Pastikan ada kategori default
        categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
    });

    const breakdown = document.getElementById('categoryBreakdown');
    breakdown.innerHTML = '';
    for (const cat in categoryTotals) {
        const li = document.createElement('li');
        // Menggunakan kelas DaisyUI untuk rincian kategori
        li.className = 'flex justify-between items-center bg-base-100 p-2 rounded-lg shadow-xs';
        li.innerHTML = `<span class="font-medium text-base-content">${cat}:</span> <span class="font-bold text-info">Rp${categoryTotals[cat].toLocaleString('id-ID')}</span>`;
        breakdown.appendChild(li);
    }
    renderChart();
}

/**
 * Mengekspor data pengeluaran ke file Excel.
 */
function exportToExcel() {
    const dataToExport = expenses;

    if (dataToExport.length === 0) {
        showCustomAlert("Tidak ada data untuk diekspor!");
        return;
    }

    const formattedData = dataToExport.map(expense => ({
        "Deskripsi": expense.description,
        "Jumlah (Rp)": expense.amount,
        "Tanggal": expense.date,
        "Kategori": expense.category
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pengeluaran");
    worksheet["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
    XLSX.writeFile(workbook, `Laporan_Pengeluaran_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Merender grafik kategori pengeluaran menggunakan Chart.js.
 */
function renderChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    const categoryTotals = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Lainnya';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
    });

    const labels = Object.keys(categoryTotals);
    const dataValues = Object.values(categoryTotals);

    if (myCategoryChart) {
        myCategoryChart.destroy(); // Hancurkan grafik lama sebelum menggambar yang baru
    }

    myCategoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pengeluaran',
                data: dataValues,
                backgroundColor: [ // Sediakan warna-warni agar menarik
                    '#4ade80', '#facc15', '#fb923c', '#f87171',
                    '#60a5fa', '#a78bfa', '#f472b6', '#34d399',
                    '#8b5cf6', '#ef4444', '#10b981', '#6366f1' // Tambahan warna
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'hsl(var(--bc))' // Menggunakan warna teks dari tema DaisyUI
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += 'Rp' + context.parsed.toLocaleString('id-ID');
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Mengganti fungsi alert() bawaan dengan modal DaisyUI.
 * @param {string} message - Pesan yang akan ditampilkan.
 */
function showCustomAlert(message) {
    document.getElementById('alert_message').textContent = message;
    customAlertDialog.showModal();
}

/**
 * Fungsi logout.
 */
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// --- Tambahkan Modal DaisyUI ke DOM (Ini harus ada di index.html atau di-append oleh JS) ---
// Karena ini adalah main.js, saya akan menyertakan struktur HTML modal di sini
// sebagai catatan, namun Anda harus menempatkannya di index.html di luar script
// atau pastikan main.js meng-append-nya ke body saat load.
// Untuk kemudahan, saya akan tambahkan di sini sebagai string,
// tetapi cara terbaik adalah menambahkannya langsung ke index.html
// di bagian akhir body.

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // Modal untuk alert kustom
    const customAlertModalHTML = `
        <dialog id="custom_alert_modal" class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg text-primary">Informasi</h3>
                <p id="alert_message" class="py-4"></p>
                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn btn-primary rounded-lg">Oke</button>
                    </form>
                </div>
            </div>
        </dialog>
    `;
    body.insertAdjacentHTML('beforeend', customAlertModalHTML);

    // Modal untuk konfirmasi kustom
    const customConfirmModalHTML = `
        <dialog id="custom_confirm_modal" class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg text-warning">Konfirmasi</h3>
                <p id="confirm_message" class="py-4"></p>
                <div class="modal-action">
                    <form method="dialog" class="flex gap-2">
                        <button id="confirm_yes_button" class="btn btn-error rounded-lg">Ya</button>
                        <button class="btn btn-ghost rounded-lg">Tidak</button>
                    </form>
                </div>
            </div>
        </dialog>
    `;
    body.insertAdjacentHTML('beforeend', customConfirmModalHTML);

    // Pastikan referensi modal diperbarui setelah ditambahkan ke DOM
    customAlertDialog = document.getElementById('custom_alert_modal');
    customConfirmDialog = document.getElementById('custom_confirm_modal');
});
