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
  let editingId = null;

  const stateBox = document.getElementById('state');
  const listEl = document.getElementById('task-list');
  const pagEl = document.getElementById('pagination');
  const formCard = document.getElementById('task-form-card');
  const form = document.getElementById('task-form');
  const saveBtn = document.getElementById('save-btn');

  /* ===== Helper tampilan ===== */
  function showAlert(message, type = 'error') {
    const a = document.getElementById('alert');
    a.textContent = message;
    a.className = 'alert alert-' + type;
  }
  function clearAlert() {
    const a = document.getElementById('alert');
    a.className = 'alert hidden';
    a.textContent = '';
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

  /* ===== Form tambah/edit ===== */
  function clearFormErrors() {
    form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    form.querySelectorAll('input, textarea, select').forEach(i => i.classList.remove('invalid'));
  }
  function setFieldError(field, message) {
    const box = form.querySelector('[data-error-for="' + field + '"]');
    const input = form.querySelector('[name="' + field + '"]');
    if (box) box.textContent = message;
    if (input) input.classList.add('invalid');
  }

  function openForm(task) {
    clearFormErrors();
    clearAlert();
    editingId = task ? task.id : null;
    document.getElementById('form-title').textContent = task ? 'Edit Tugas' : 'Tambah Tugas';
    form.title.value = task ? task.title : '';
    form.description.value = task && task.description ? task.description : '';
    form.deadline.value = task && task.deadline ? task.deadline.slice(0, 10) : '';
    form.status.value = task ? task.status : 'todo';
    formCard.classList.remove('hidden');
    form.title.focus();
  }

  function closeForm() {
    formCard.classList.add('hidden');
    editingId = null;
  }

  document.getElementById('add-btn').addEventListener('click', () => openForm(null));
  document.getElementById('cancel-btn').addEventListener('click', closeForm);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearFormErrors();
    clearAlert();

    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const deadline = form.deadline.value;

    // Validasi sisi klien
    if (!title) { setFieldError('title', 'Judul wajib diisi.'); return; }
    if (title.length > 150) { setFieldError('title', 'Judul maksimal 150 karakter.'); return; }
    if (description.length > 5000) { setFieldError('description', 'Deskripsi maksimal 5000 karakter.'); return; }

    const payload = { title, status: form.status.value };
    if (editingId) {
      // Saat edit, kosong = hapus nilai lama
      payload.description = description || null;
      payload.deadline = deadline || null;
    } else {
      if (description) payload.description = description;
      if (deadline) payload.deadline = deadline;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Menyimpan...';
    try {
      const result = editingId
        ? await Api.updateTask(editingId, payload)
        : await Api.createTask(payload);
      closeForm();
      showAlert(result.message, 'success');
      if (!result.data || !editingId) page = 1; // tugas baru muncul di halaman pertama
      loadTasks();
    } catch (err) {
      if (err.status === 422) {
        Object.keys(err.errors).forEach(f => setFieldError(f, err.first(f)));
      } else {
        showAlert(err.message);
      }
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Simpan';
    }
  });

  /* ===== Aksi: selesai/belum, hapus ===== */
  async function toggleStatus(task, btn) {
    clearAlert();
    btn.disabled = true;
    try {
      const result = await Api.updateStatus(task.id, task.status === 'done' ? 'todo' : 'done');
      showAlert(result.message, 'success');
      loadTasks();
    } catch (err) {
      showAlert(err.message);
      btn.disabled = false;
    }
  }

  async function removeTask(task, btn) {
    if (!confirm('Hapus tugas "' + task.title + '"?')) return;
    clearAlert();
    btn.disabled = true;
    try {
      const result = await Api.deleteTask(task.id);
      showAlert(result.message, 'success');
      loadTasks();
    } catch (err) {
      showAlert(err.message);
      btn.disabled = false;
    }
  }

  /* ===== Tampilan daftar ===== */
  function renderTask(t) {
    const isDone = t.status === 'done';
    const li = el('li', 'task-item' + (isDone ? ' done' : ''));

    const main = el('div', 'task-main');
    main.appendChild(el('div', 'task-title', t.title));
    if (t.description) main.appendChild(el('div', 'task-desc', t.description));

    const meta = el('div', 'task-meta');
    meta.appendChild(el('span', 'badge ' + (isDone ? 'badge-done' : 'badge-todo'),
      isDone ? 'Selesai' : 'Belum selesai'));
    meta.appendChild(document.createTextNode('Deadline: ' + formatDate(t.deadline)));
    main.appendChild(meta);

    const actions = el('div', 'task-actions');

    const toggleBtn = el('button', isDone ? 'btn btn-outline btn-sm' : 'btn btn-success btn-sm',
      isDone ? 'Batal selesai' : 'Selesai');
    toggleBtn.addEventListener('click', () => toggleStatus(t, toggleBtn));

    const editBtn = el('button', 'btn btn-outline btn-sm', 'Edit');
    editBtn.addEventListener('click', () => {
      openForm(t);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const delBtn = el('button', 'btn btn-danger btn-sm', 'Hapus');
    delBtn.addEventListener('click', () => removeTask(t, delBtn));

    actions.append(toggleBtn, editBtn, delBtn);
    li.append(main, actions);
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