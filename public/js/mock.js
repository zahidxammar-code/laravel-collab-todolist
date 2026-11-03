/* Mock API: meniru respons kontrak. Data disimpan di localStorage
   supaya tidak hilang saat pindah halaman. */
const Mock = (() => {
  const DB_KEY = 'mock_db';
  const DELAY = 300; // ms, simulasi latensi

  const emptyDb = () => ({ users: [], tokens: {}, tasks: [], uid: 1, tid: 1, tokid: 1 });
  const load = () => {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || emptyDb(); }
    catch (e) { return emptyDb(); }
  };
  const save = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

  const now = () => new Date().toISOString().replace('.000Z', '.000000Z');
  const toIso = (v) => new Date(v).toISOString().replace('.000Z', '.000000Z');
  const validDate = (v) => !isNaN(new Date(v).getTime());

  const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, created_at: u.created_at });
  const publicTask = (t) => {
    const { user_id, ...rest } = t;
    return rest;
  };

  // Format sesuai kontrak
  const ok = (status, message, data, extra = {}) =>
    ({ status, data: { success: true, message, data, ...extra } });
  const fail401 = (message, errors) =>
    ({ status: 401, data: { success: false, message, ...(errors ? { errors } : {}) } });
  const unauth = () => ({ status: 401, data: { message: 'Unauthenticated.' } });
  const notFound = () => ({ status: 404, data: { message: 'Data tidak ditemukan.' } });
  // 422 di kontrak TIDAK punya field "success"
  const invalid = (errors) => {
    const first = Object.values(errors)[0][0];
    return { status: 422, data: { message: first, errors } };
  };

  const add = (errors, field, msg) => { (errors[field] = errors[field] || []).push(msg); };

  function validateTask(body, partial) {
    const e = {};
    const has = (k) => body[k] !== undefined;
    if (!partial || has('title')) {
      if (!body.title || !String(body.title).trim()) add(e, 'title', 'The title field is required.');
      else if (String(body.title).length > 150) add(e, 'title', 'The title field must not be greater than 150 characters.');
    }
    if (has('description') && body.description !== null && String(body.description).length > 5000)
      add(e, 'description', 'The description field must not be greater than 5000 characters.');
    if (has('deadline') && body.deadline !== null && body.deadline !== '' && !validDate(body.deadline))
      add(e, 'deadline', 'The deadline field must be a valid date.');
    if (has('status') && !['todo', 'done'].includes(body.status))
      add(e, 'status', 'The selected status is invalid.');
    return e;
  }

  function handle({ method, path, body = {}, query = {}, token }) {
    const db = load();
    let res;

    // ----- Endpoint publik -----
    if (method === 'POST' && path === '/register') {
      const e = {};
      if (!body.name) add(e, 'name', 'The name field is required.');
      if (!body.email) add(e, 'email', 'The email field is required.');
      else if (!/^\S+@\S+\.\S+$/.test(body.email)) add(e, 'email', 'The email field must be a valid email address.');
      else if (db.users.some(u => u.email === body.email)) add(e, 'email', 'The email has already been taken.');
      if (!body.password) add(e, 'password', 'The password field is required.');
      else if (body.password.length < 8) add(e, 'password', 'The password field must be at least 8 characters.');
      else if (body.password !== body.password_confirmation) add(e, 'password', 'The password field confirmation does not match.');
      if (Object.keys(e).length) return Promise.resolve(invalid(e)).then(delay);

      const user = { id: db.uid++, name: body.name, email: body.email, password: body.password, created_at: now() };
      db.users.push(user);
      const tok = (db.tokid++) + '|mock-' + Math.random().toString(36).slice(2, 12);
      db.tokens[tok] = user.id;
      save(db);
      res = ok(201, 'Akun berhasil dibuat.', { user: publicUser(user), access_token: tok, token_type: 'Bearer' });
      return delay(res);
    }

    if (method === 'POST' && path === '/login') {
      const user = db.users.find(u => u.email === body.email && u.password === body.password);
      if (!user) return delay(fail401('Email atau password salah.', { email: ['Email atau password salah.'] }));
      const tok = (db.tokid++) + '|mock-' + Math.random().toString(36).slice(2, 12);
      db.tokens[tok] = user.id;
      save(db);
      return delay(ok(200, 'Login berhasil.', { user: publicUser(user), access_token: tok, token_type: 'Bearer' }));
    }

    // ----- Endpoint terlindungi -----
    const userId = token ? db.tokens[token] : null;
    const user = userId ? db.users.find(u => u.id === userId) : null;
    if (!user) return delay(unauth());

    if (method === 'GET' && path === '/profile')
      return delay(ok(200, 'Profil berhasil dimuat.', publicUser(user)));

    if (method === 'POST' && path === '/logout') {
      delete db.tokens[token];
      save(db);
      return delay(ok(200, 'Logout berhasil.', null));
    }

    // ----- Tasks -----
    const mine = db.tasks.filter(t => t.user_id === user.id);

    if (method === 'GET' && path === '/tasks') {
      const e = {};
      let perPage = parseInt(query.per_page || 15, 10);
      let page = Math.max(parseInt(query.page || 1, 10), 1);
      if (query.status && !['todo', 'done'].includes(query.status)) add(e, 'status', 'The selected status is invalid.');
      if (isNaN(perPage) || perPage < 1 || perPage > 100) add(e, 'per_page', 'The per page field must be between 1 and 100.');
      if (Object.keys(e).length) return delay(invalid(e));

      let list = mine.slice().sort((a, b) => b.id - a.id);
      if (query.status) list = list.filter(t => t.status === query.status);
      const total = list.length;
      const last = Math.max(Math.ceil(total / perPage), 1);
      const items = list.slice((page - 1) * perPage, page * perPage).map(publicTask);
      return delay(ok(200, 'Daftar task berhasil dimuat.', items,
        { meta: { current_page: page, last_page: last, per_page: perPage, total } }));
    }

    if (method === 'POST' && path === '/tasks') {
      const e = validateTask(body, false);
      if (Object.keys(e).length) return delay(invalid(e));
      const t = {
        id: db.tid++, user_id: user.id,
        title: body.title.trim(),
        description: body.description || null,
        deadline: body.deadline ? toIso(body.deadline) : null,
        status: body.status || 'todo',
        created_at: now(), updated_at: now()
      };
      db.tasks.push(t);
      save(db);
      return delay(ok(201, 'Task berhasil dibuat.', publicTask(t)));
    }

    const m = path.match(/^\/tasks\/(\d+)(\/status)?$/);
    if (m) {
      const id = parseInt(m[1], 10);
      const t = mine.find(x => x.id === id);
      if (!t) return delay(notFound());

      if (method === 'GET' && !m[2]) return delay(ok(200, 'Task berhasil dimuat.', publicTask(t)));

      if ((method === 'PUT' || method === 'PATCH') && !m[2]) {
        const e = validateTask(body, true);
        if (Object.keys(e).length) return delay(invalid(e));
        ['title', 'description', 'status'].forEach(k => { if (body[k] !== undefined) t[k] = body[k]; });
        if (body.deadline !== undefined) t.deadline = body.deadline ? toIso(body.deadline) : null;
        t.updated_at = now();
        save(db);
        return delay(ok(200, 'Task berhasil diperbarui.', publicTask(t)));
      }

      if (method === 'PATCH' && m[2]) {
        const e = {};
        if (!['todo', 'done'].includes(body.status)) add(e, 'status', 'The selected status is invalid.');
        if (Object.keys(e).length) return delay(invalid(e));
        t.status = body.status;
        t.updated_at = now();
        save(db);
        return delay(ok(200, 'Status task berhasil diperbarui.', publicTask(t)));
      }

      if (method === 'DELETE' && !m[2]) {
        db.tasks = db.tasks.filter(x => x.id !== id);
        save(db);
        return delay(ok(200, 'Task berhasil dihapus.', null));
      }
    }

    return delay(notFound());
  }

  function delay(res) {
    return new Promise(resolve => setTimeout(() => resolve(res), DELAY));
  }

  return { handle, reset: () => localStorage.removeItem(DB_KEY) };
})();