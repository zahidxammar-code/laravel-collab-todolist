 1. Autentikasi (Laravel Sanctum)
 
 A. RegisterEndpoint: /api/registerMethod: POSTRequest Body (JSON):JSON{
    "name": "Nama User",
    "email": "user@example.com",
    "password": "password123"}

Response Sukses (201 Created):JSON{
    "success": true,
    "message": "Registrasi berhasil",
    "data": {
        "id": 1,
        "name": "Nama User",
        "email": "user@example.com"
    }
}

B. LoginEndpoint: /api/loginMethod: POSTRequest Body (JSON):JSON{
    "email": "user@example.com",
    "password": "password123"
}

Response Sukses (200 OK):JSON{
    "success": true,
    "message": "Login berhasil",
    "token": "1|laravel_sanctum_token_string_here..."
}

C. LogoutEndpoint: /api/logoutMethod: POSTHeader: Authorization: Bearer <token>Response Sukses (200 OK):JSON{
    "success": true,
    "message": "Logout berhasil"
}

2. Manajemen Tugas (CRUD To-Do List)Sesuai instruksi minimal: data tugas mencakup id, title, deadline, dan status (todo / done). Setiap pengguna hanya boleh mengakses tugas miliknya sendiri.   

A. Lihat Daftar TugasEndpoint: /api/todosMethod: GETHeader: Authorization: Bearer <token>Response Sukses (200 OK):JSON{
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "Belajar Laravel Sanctum",
            "deadline": "2026-11-10",
            "status": "todo"
        }
    ]
}

B. Tambah TugasEndpoint: /api/todosMethod: POSTHeader: Authorization: Bearer <token>Request Body (JSON):JSON{
    "title": "Membuat Tampilan Frontend",
    "deadline": "2026-11-11"
}

Response Sukses (201 Created):JSON{
    "success": true,
    "message": "Tugas berhasil ditambahkan",
    "data": {
        "id": 2,
        "title": "Membuat Tampilan Frontend",
        "deadline": "2026-11-11",
        "status": "todo"
    }
}

C. Ubah Status Tugas (Selesai / Belum Selesai)Endpoint: /api/todos/{id}Method: PUT atau PATCHHeader: Authorization: Bearer <token>Request Body (JSON):JSON{
    "status": "done"
}

Response Sukses (200 OK):JSON{
    "success": true,
    "message": "Status tugas diperbarui"
}

D. Hapus TugasEndpoint: /api/todos/{id}Method: DELETEHeader: Authorization: Bearer <token>Response Sukses (200 OK):JSON{
    "success": true,
    "message": "Tugas berhasil dihapus"
}