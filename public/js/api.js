/* ===== Error khusus API ===== */
class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;   // 0 = gagal terhubung ke server
    this.errors = errors;   // { field: ["pesan", ...] } dari respons 422/401
  }
  // Ambil pesan error pertama untuk satu field, atau null
  first(field) {
    return this.errors && this.errors[field] ? this.errors[field][0] : null;
  }
}

/* ===== Penyimpanan token ===== */
const Token = {
  get()      { return localStorage.getItem(CONFIG.TOKEN_KEY); },
  set(token) { localStorage.setItem(CONFIG.TOKEN_KEY, token); },
  clear()    { localStorage.removeItem(CONFIG.TOKEN_KEY); }
};

/* ===== Pengirim request: API asli ===== */
function buildQuery(query) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const s = params.toString();
  return s ? '?' + s : '';
}

async function sendReal({ method, path, body, query, token }) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let res;
  try {
    res = await fetch(CONFIG.BASE_URL + path + buildQuery(query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
  }

  let data = null;
  try { data = await res.json(); } catch (e) { /* respons bukan JSON */ }
  return { status: res.status, data };
}

/* ===== Pengirim request: mock (diisi di Step 4) ===== */
async function sendMock(req) {
  if (typeof Mock === 'undefined' || typeof Mock.handle !== 'function') {
    throw new ApiError(0, 'Mock belum dibuat (Step 4).');
  }
  return Mock.handle(req); // harus mengembalikan { status, data }
}

/* ===== Satu pintu semua request ===== */
async function request(method, path, { body, query, auth = true } = {}) {
  const token = auth ? Token.get() : null;
  const req = { method, path, body, query, token };
  const { status, data } = CONFIG.USE_MOCK ? await sendMock(req) : await sendReal(req);

  // Sukses: 200 / 201
  if (status >= 200 && status < 300) return data;

  // Token tidak valid pada endpoint terlindungi -> keluar ke login
  if (status === 401 && auth) {
    Token.clear();
    if (!location.pathname.startsWith('/login')) location.href = '/login';
  }

  const fallback = {
    401: 'Sesi berakhir atau kredensial salah.',
    404: 'Data atau endpoint tidak ditemukan.',
    422: 'Data yang dikirim tidak valid.'
  };
  const message = (data && data.message) || fallback[status] || 'Terjadi kesalahan (kode ' + status + ').';
  throw new ApiError(status, message, (data && data.errors) || {});
}

/* ===== Fungsi yang dipakai halaman ===== */
const Api = {
  // --- Autentikasi ---
  register: (payload) => request('POST', '/register', { body: payload, auth: false }),
  login:    (payload) => request('POST', '/login',    { body: payload, auth: false }),
  getProfile: ()      => request('GET',  '/profile'),
  async logout() {
    try { await request('POST', '/logout'); }
    finally { Token.clear(); } // token tetap dihapus walau request gagal
  },

  // --- Tugas ---
  getTasks:     (query = {})    => request('GET',    '/tasks', { query }),   // { page, per_page, status }
  getTask:      (id)            => request('GET',    '/tasks/' + id),
  createTask:   (payload)       => request('POST',   '/tasks', { body: payload }),
  updateTask:   (id, payload)   => request('PUT',    '/tasks/' + id, { body: payload }),
  updateStatus: (id, status)    => request('PATCH',  '/tasks/' + id + '/status', { body: { status } }),
  deleteTask:   (id)            => request('DELETE', '/tasks/' + id)
};