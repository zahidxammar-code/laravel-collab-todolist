Kontrak API — To-Do List

Versi: 1.0
Backend: Laravel 12 + Laravel Sanctum Personal Access Token
Tujuan: Acuan bersama backend dan frontend. Implementasi frontend sebaiknya mengikuti path, field, dan response pada dokumen ini.

Konfigurasi umum

Base URL development dengan php artisan serve:

Plain Text


http://127.0.0.1:8000/api



Semua request mengirim header:

Plain Text


Accept: application/json



Request dengan body JSON juga mengirim:

Plain Text


Content-Type: application/json



Endpoint yang dilindungi autentikasi memerlukan:

Plain Text


Authorization: Bearer <access_token>



Token didapat dari register atau login. Kirim token pada setiap request terlindungi.

Format data

User

JSON


{
  "id": 1,
  "name": "Nama User",
  "email": "user@example.com",
  "created_at": "2026-11-03T02:45:00.000000Z"
}



Task

JSON


{
  "id": 1,
  "title": "Belajar Laravel Sanctum",
  "description": null,
  "deadline": "2026-11-10T00:00:00.000000Z",
  "status": "todo",
  "created_at": "2026-11-03T02:45:00.000000Z",
  "updated_at": "2026-11-03T02:45:00.000000Z"
}



deadline boleh null; saat dikirim sebagai tanggal saja, contohnya 2026-11-10, backend akan mengembalikannya sebagai tanggal-waktu ISO 8601 UTC. Nilai status hanya todo atau done. Task baru otomatis berstatus todo jika field status tidak dikirim.

1. Autentikasi

A. Register

Plain Text


POST /api/register



Request:

JSON


{
  "name": "Nama User",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}



password_confirmation wajib karena backend memakai validasi Laravel confirmed. Password minimum 8 karakter. Email harus unik.

Response 201 Created:

JSON


{
  "success": true,
  "message": "Akun berhasil dibuat.",
  "data": {
    "user": {
      "id": 1,
      "name": "Nama User",
      "email": "user@example.com",
      "created_at": "2026-11-03T02:45:00.000000Z"
    },
    "access_token": "1|sanctum-token-value",
    "token_type": "Bearer"
  }
}



B. Login

Plain Text


POST /api/login



Request:

JSON


{
  "email": "user@example.com",
  "password": "password123"
}



Response 200 OK:

JSON


{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": 1,
      "name": "Nama User",
      "email": "user@example.com",
      "created_at": "2026-11-03T02:45:00.000000Z"
    },
    "access_token": "2|sanctum-token-value",
    "token_type": "Bearer"
  }
}



Simpan token dari data.access_token. Jika menggunakan Axios, responsenya biasa dibaca sebagai response.data.data.access_token; jika menggunakan Fetch, parse JSON dahulu, lalu baca result.data.access_token.

Response 401 Unauthorized jika email/password salah:

JSON


{
  "success": false,
  "message": "Email atau password salah.",
  "errors": {
    "email": ["Email atau password salah."]
  }
}



C. Profil pengguna

Plain Text


GET /api/profile
Authorization: Bearer <access_token>



Response 200 OK:

JSON


{
  "success": true,
  "message": "Profil berhasil dimuat.",
  "data": {
    "id": 1,
    "name": "Nama User",
    "email": "user@example.com",
    "created_at": "2026-11-03T02:45:00.000000Z"
  }
}



D. Logout

Plain Text


POST /api/logout
Authorization: Bearer <access_token>



Logout menghapus token yang sedang digunakan.

Response 200 OK:

JSON


{
  "success": true,
  "message": "Logout berhasil.",
  "data": null
}



2. Manajemen task

Semua endpoint task memerlukan Bearer token. Pengguna hanya dapat mengakses task miliknya sendiri. Task milik pengguna lain akan dianggap tidak ditemukan (404).

A. Daftar task

Plain Text


GET /api/tasks



Query opsional:

Plain Text


?page=1&per_page=15&status=todo



per_page minimum 1, maksimum 100. status hanya menerima todo atau done.

Response 200 OK:

JSON


{
  "success": true,
  "message": "Daftar task berhasil dimuat.",
  "data": [
    {
      "id": 1,
      "title": "Belajar Laravel Sanctum",
      "description": null,
      "deadline": "2026-11-10T00:00:00.000000Z",
      "status": "todo",
      "created_at": "2026-11-03T02:45:00.000000Z",
      "updated_at": "2026-11-03T02:45:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}



B. Tambah task

Plain Text


POST /api/tasks



Request minimum:

JSON


{
  "title": "Membuat Tampilan Frontend",
  "deadline": "2026-11-11"
}



Request dengan semua field opsional:

JSON


{
  "title": "Membuat Tampilan Frontend",
  "description": "Menghubungkan halaman ke API",
  "deadline": "2026-11-11T17:00:00+07:00",
  "status": "todo"
}



Validasi: title wajib dan maksimal 150 karakter; description opsional, maksimal 5000 karakter; deadline opsional dan harus tanggal valid; status opsional dengan nilai todo atau done.

Response 201 Created:

JSON


{
  "success": true,
  "message": "Task berhasil dibuat.",
  "data": {
    "id": 2,
    "title": "Membuat Tampilan Frontend",
    "description": null,
    "deadline": "2026-11-11T00:00:00.000000Z",
    "status": "todo",
    "created_at": "2026-11-03T02:45:00.000000Z",
    "updated_at": "2026-11-03T02:45:00.000000Z"
  }
}



C. Detail task

Plain Text


GET /api/tasks/{id}



Response 200 OK memakai format item task pada bagian tambah task. Mengembalikan 404 Not Found jika task tidak ada atau bukan milik pengguna yang login.

D. Ubah task

Plain Text


PUT /api/tasks/{id}



atau:

Plain Text


PATCH /api/tasks/{id}



Body boleh hanya berisi field yang diubah, misalnya:

JSON


{
  "title": "Tampilan frontend selesai",
  "description": "Sudah terhubung ke backend",
  "deadline": "2026-11-12",
  "status": "done"
}



Response 200 OK berisi task terbaru pada data.

E. Ubah status saja

Plain Text


PATCH /api/tasks/{id}/status



Request:

JSON


{
  "status": "done"
}



Response 200 OK:

JSON


{
  "success": true,
  "message": "Status task berhasil diperbarui.",
  "data": {
    "id": 2,
    "title": "Membuat Tampilan Frontend",
    "description": null,
    "deadline": "2026-11-11T00:00:00.000000Z",
    "status": "done",
    "created_at": "2026-11-03T02:45:00.000000Z",
    "updated_at": "2026-11-03T03:00:00.000000Z"
  }
}



F. Hapus task

Plain Text


DELETE /api/tasks/{id}



Response 200 OK:

JSON


{
  "success": true,
  "message": "Task berhasil dihapus.",
  "data": null
}



3. Error dan status code

HTTP
Arti
200
Request berhasil
201
Data berhasil dibuat
401
Token tidak ada/tidak valid, atau kredensial login salah
404
Endpoint/task tidak ditemukan atau task bukan milik pengguna aktif
422
Validasi request gagal




Contoh validasi gagal:

JSON


{
  "message": "The title field is required.",
  "errors": {
    "title": ["The title field is required."]
  }
}



4. Perbedaan penting dari draft kontrak frontend sebelumnya

Agar frontend langsung kompatibel dengan implementasi backend ini:

1.
Gunakan /api/tasks, bukan /api/todos.

2.
Token login ada di data.access_token, bukan di root response token.

3.
Register harus menyertakan password_confirmation.

4.
Update status khusus menggunakan PATCH /api/tasks/{id}/status; atau ubah task melalui PATCH /api/tasks/{id}.

5.
Response task memiliki description, created_at, dan updated_at tambahan; frontend boleh mengabaikan field yang tidak dipakai.

6.
deadline dikembalikan dalam format ISO 8601 UTC. Format tanggal tampilan dapat dikonversi di frontend.

Kontrak OpenAPI untuk tool Swagger ada di docs/openapi.yaml.

