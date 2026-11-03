<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login & Register - To-Do List</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">

    <div class="max-w-md w-full bg-white rounded-xl shadow-md p-6">
        <h1 id="form-title" class="text-xl font-bold mb-4 text-center">Login To-Do List</h1>

        <!-- Form Autentikasi -->
        <form id="auth-form" class="space-y-4">
            <div id="name-field" style="display: none;">
                <label class="block text-sm font-medium text-gray-700">Nama</label>
                <input type="text" id="input-name" class="mt-1 w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="input-email" required class="mt-1 w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" id="input-password" required class="mt-1 w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
            <button type="submit" id="submit-btn" class="w-full bg-blue-500 text-white py-2 rounded text-sm font-medium hover:bg-blue-600">Login</button>
        </form>

        <!-- Toggle Mode Login / Register -->
        <p class="text-center text-sm text-gray-500 mt-4">
            <span id="toggle-text">Belum punya akun?</span>
            <button onclick="toggleMode()" id="toggle-btn" class="text-blue-500 font-medium hover:underline">Register</button>
        </p>

        <div id="status-message" class="text-center text-sm mt-3"></div>
    </div>

    <script>
        const USE_MOCK = true; // Ubah ke false jika Backend sudah siap[cite: 1]
        const API_URL = "http://127.0.0.1:8000/api";
        let isRegisterMode = false;

        function toggleMode() {
            isRegisterMode = !isRegisterMode;
            document.getElementById("form-title").innerText = isRegisterMode ? "Register To-Do List" : "Login To-Do List";
            document.getElementById("name-field").style.display = isRegisterMode ? "block" : "none";
            document.getElementById("submit-btn").innerText = isRegisterMode ? "Register" : "Login";
            document.getElementById("toggle-text").innerText = isRegisterMode ? "Sudah punya akun?" : "Belum punya akun?";
            document.getElementById("toggle-btn").innerText = isRegisterMode ? "Login" : "Register";
            document.getElementById("status-message").innerText = "";
        }

        document.getElementById("auth-form").addEventListener("submit", async function(e) {
            e.preventDefault();
            const email = document.getElementById("input-email").value;
            const password = document.getElementById("input-password").value;
            const name = document.getElementById("input-name").value;
            const msgEl = document.getElementById("status-message");

            msgEl.className = "text-center text-sm mt-3 text-gray-500";
            msgEl.innerText = "Memproses...";

            if (USE_MOCK) {
                // Simulasi Mock Response untuk Frontend Paralel[cite: 1]
                setTimeout(() => {
                    if (isRegisterMode) {
                        msgEl.className = "text-center text-sm mt-3 text-green-600";
                        msgEl.innerText = "Registrasi berhasil! Silakan login.";
                        toggleMode();
                    } else {
                        msgEl.className = "text-center text-sm mt-3 text-green-600";
                        msgEl.innerText = "Login berhasil! Mengarahkan...";
                        localStorage.setItem("token", "mock-bearer-token-123");
                        // setTimeout(() => window.location.href = '/todos', 1000);
                    }
                }, 500);
            } else {
                // Integrasi API Nyata (Tahap 4)[cite: 1]
                const endpoint = isRegisterMode ? "/register" : "/login";
                const payload = isRegisterMode ? { name, email, password } : { email, password };

                try {
                    const res = await fetch(`${API_URL}${endpoint}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();

                    if (res.ok) {
                        msgEl.className = "text-center text-sm mt-3 text-green-600";
                        msgEl.innerText = "Berhasil!";
                        if (!isRegisterMode) {
                            localStorage.setItem("token", data.token); // Kirim Bearer token pada endpoint terlindungi[cite: 1]
                        }
                    } else {
                        msgEl.className = "text-center text-sm mt-3 text-red-500";
                        msgEl.innerText = data.message || "Terjadi kesalahan.";
                    }
                } catch (err) {
                    msgEl.className = "text-center text-sm mt-3 text-red-500";
                    msgEl.innerText = "Gagal terhubung ke server.";
                }
            }
        });
    </script>
</body>
</html>