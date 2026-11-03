<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>To-Do List</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-6">

    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 class="text-xl font-bold mb-4">To-Do List</h1>

        <!-- Form Tambah -->
        <form id="form-todo" class="mb-4 flex gap-2">
            <input type="text" id="input-title" placeholder="Judul tugas..." required class="flex-1 border rounded px-3 py-2 text-sm">
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded text-sm">Tambah</button>
        </form>

        <!-- Loading / Kosong -->
        <div id="status-text" class="text-gray-500 text-sm mb-2">Memuat...</div>

        <!-- List Tugas -->
        <div id="list-todo" class="space-y-2"></div>
    </div>

    <script>
        // Konfigurasi: True pakai mock, False pakai API Laravel asli nantinya
        const USE_MOCK = true; 
        const API_URL = "http://127.0.0.1:8000/api/todos";

        // Mock Data Sederhana (Sesuai instruksi: "Gunakan mock JSON")
        let mockData = [
            { id: 1, title: "Tugas Pertama", status: "todo" }
        ];

        async function fetchTodos() {
            const statusEl = document.getElementById("status-text");
            const listEl = document.getElementById("list-todo");
            statusEl.style.display = "block";
            statusEl.innerText = "Memuat data...";
            listEl.innerHTML = "";

            let todos = [];

            if (USE_MOCK) {
                todos = mockData;
            } else {
                // Nanti digunakan saat Backend sudah siap (Tahap 4)
                const res = await fetch(API_URL, {
                    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
                });
                const json = await res.json();
                todos = json.data;
            }

            statusEl.style.display = "none";
            if (todos.length === 0) {
                listEl.innerHTML = "<p class='text-gray-400 text-sm'>Belum ada tugas.</p>";
                return;
            }

            todos.forEach(t => {
                listEl.innerHTML += `
                    <div class="flex justify-between items-center border p-2 rounded">
                        <span class="${t.status === 'done' ? 'line-through text-gray-400' : ''}">${t.title}</span>
                        <button onclick="hapus(${t.id})" class="bg-red-500 text-white px-2 py-1 rounded text-xs">Hapus</button>
                    </div>
                `;
            });
        }

        document.getElementById("form-todo").addEventListener("submit", function(e) {
            e.preventDefault();
            const title = document.getElementById("input-title").value;

            if (USE_MOCK) {
                mockData.push({ id: Date.now(), title, status: "todo" });
                document.getElementById("input-title").value = "";
                fetchTodos();
            } else {
                // Kirim ke API asli nantinya
            }
        });

        function hapus(id) {
            if (USE_MOCK) {
                mockData = mockData.filter(t => t.id !== id);
                fetchTodos();
            }
        }

        // Jalankan saat halaman dibuka
        fetchTodos();
    </script>
</body>
</html>