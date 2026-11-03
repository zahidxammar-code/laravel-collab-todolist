/* ===== Penjaga halaman: tanpa token -> login ===== */
if (!Token.get()) {
  location.href = '/login';
} else {
  initDashboard();
}

function initDashboard() {
  const PER_PAGE = 5;
  let page = 1;
  let status = '';

  const stateBox = document.getElementById('state');
  const listEl = document.getElementById('task-list');
  const pagEl = document.getElementById('pagination');

  /* ===== Helper tampilan ===== */
  function showAlert(message, type = 'error') {
    const el = document.getElementById('alert');
    el.textContent = message;
    el.className = 'alert alert-' + type;
  }

  function formatDate(iso) {
    if (!iso) return 'Tanpa deadline';
    // timeZone UTC supaya tanggal tidak bergeser sehari
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
    });
  }

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ===== 4 kondisi tampilan ===== */
  function showLoading() {
    listEl.innerHTML = '';
    pagEl.classList.add('hidden');
    stateBox.className = 'state-box';
    stateBox.innerHTML = '<div class="spinner"></div>Memuat tugas...';
  }

  function showEmpty() {
    listEl.innerHTML = '';
    pagEl.classList.add('hidden');
    stateBox.className = 'state-box';
    stateBox.textContent = status ? 'Tidak ada tugas dengan status ini.' : 'Belum ada tugas.';
  }

  function showError(message) {
    listEl.innerHTML = '';
    pagEl.classList.add('hidden');
    stateBox.className = 'state-box error';
    stateBox.textContent = message + ' ';
    const retry = el('button', 'btn btn-outline btn-sm', 'Coba lagi');
    retry.addEventListener('click', loadTasks);
    stateBox.appendChild(retry);
  }

  /* ===== Tampilan daftar ===== */
  function renderTask(t) {
    const li = el('li', 'task-item' + (t.status === 'done' ? ' done' : ''));
    const main = el('div', 'task-main');
    main.appendChild(el('div', 'task-title', t.title));
    if (t.description) main.appendChild(el('div', 'task-desc', t.description));

    const meta = el('div', 'task-meta');
    const isDone = t.status === 'done';
    meta.appendChild(el('span', 'badge ' + (isDone ? 'badge-done' : 'badge-todo'),
      isDone ? 'Selesai' : 'Belum selesai'));
    meta.appendChild(document.createTextNode('Deadline: ' + formatDate(t.deadline)));
    main.appendChild(meta);

    li.appendChild(main);
    return li;
  }

  function renderPagination(meta) {
    pagEl.innerHTML = '';
    if (meta.last_page <= 1) {
      pagEl.classList.add('hidden');
      return;
    }
    pagEl.classList.remove('hidden');

    const prev = el('button', 'btn btn-outline btn-sm', '← Sebelumnya');
    prev.disabled = meta.current_page <= 1;
    prev.addEventListener('click', () => { page--; loadTasks(); });

    const next = el('button', 'btn btn-outline btn-sm', 'Berikutnya →');
    next.disabled = meta.current_page >= meta.last_page;
    next.addEventListener('click', () => { page++; loadTasks(); });

    pagEl.append(prev,
      el('span', '', 'Halaman ' + meta.current_page + ' dari ' + meta.last_page),
      next);
  }

  /* ===== Muat data ===== */
  async function loadTasks() {
    showLoading();
    try {
      const result = await Api.getTasks({ page, per_page: PER_PAGE, status });

      // Halaman sudah kosong (mis. setelah hapus) -> mundur ke halaman terakhir
      if (result.data.length === 0 && page > 1) {
        page = result.meta.last_page;
        return loadTasks();
      }

      if (result.data.length === 0) {
        showEmpty();
        return;
      }

      stateBox.className = 'state-box hidden';
      listEl.innerHTML = '';
      result.data.forEach(t => listEl.appendChild(renderTask(t)));
      renderPagination(result.meta);
    } catch (err) {
      showError(err.message);
    }
  }

  async function loadProfile() {
    try {
      const result = await Api.getProfile();
      document.getElementById('nav-user').textContent = result.data.name;
    } catch (err) { /* 401 sudah ditangani di api.js */ }
  }

  /* ===== Filter ===== */
  document.getElementById('filter-status').addEventListener('change', (ev) => {
    status = ev.target.value;
    page = 1;
    loadTasks();
  });

  loadProfile();
  loadTasks();
}