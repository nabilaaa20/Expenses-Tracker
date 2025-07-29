// File: login.js

document.addEventListener('DOMContentLoaded', () => {
    // Cek jika pengguna sudah login, langsung arahkan ke index.html
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Mencegah form refresh halaman

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Ganti 'user' dan 'password123' dengan username & password Anda
        if (username === 'admin' && password === 'admin') {
            // Jika berhasil, simpan status di localStorage
            localStorage.setItem('isLoggedIn', 'true');
            // Arahkan ke halaman utama
            window.location.href = 'index.html';
        } else {
            // Jika gagal, tampilkan pesan error menggunakan modal kustom DaisyUI
            // Memastikan window.showCustomAlert tersedia dari login.html
            if (typeof window.showCustomAlert === 'function') {
                window.showCustomAlert('Username atau password yang Anda masukkan salah!');
            } else {
                // Fallback jika showCustomAlert belum dimuat atau tidak ada
                alert('Username atau password yang Anda masukkan salah!');
            }
        }
    });
});
