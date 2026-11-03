/* ===== Helper tampilan ===== */
function showAlert(message, type = 'error') {
  const el = document.getElementById('alert');
  el.textContent = message;
  el.className = 'alert alert-' + type;
}
function clearAlert() {
  const el = document.getElementById('alert');
  el.className = 'alert hidden';
  el.textContent = '';
}
function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  form.querySelectorAll('input').forEach(i => i.classList.remove('invalid'));
}
function setFieldError(form, field, message) {
  const box = form.querySelector('[data-error-for="' + field + '"]');
  const input = form.querySelector('[name="' + field + '"]');
  if (box) box.textContent = message;
  if (input) input.classList.add('invalid');
}
function setLoading(btn, loading, text) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Memproses...' : text;
}

/* ===== Jika sudah login, langsung ke dashboard ===== */
if (Token.get()) {
  location.href = '/tasks';
}

/* ===== Penanganan form ===== */
function handleAuthForm(form, { buttonText, validate, submit }) {
  const btn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearAlert();
    clearFieldErrors(form);

    const values = Object.fromEntries(new FormData(form).entries());

    // Validasi sisi klien
    const errors = validate(values);
    const fields = Object.keys(errors);
    if (fields.length) {
      fields.forEach(f => setFieldError(form, f, errors[f]));
      return;
    }

    setLoading(btn, true, buttonText);
    try {
      const result = await submit(values);
      Token.set(result.data.access_token);
      location.href = '/tasks';
    } catch (err) {
      if (err.status === 422) {
        Object.keys(err.errors).forEach(f => setFieldError(form, f, err.first(f)));
      } else {
        showAlert(err.message);
      }
      setLoading(btn, false, buttonText);
    }
  });
}

/* ===== Login ===== */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  handleAuthForm(loginForm, {
    buttonText: 'Login',
    validate: (v) => {
      const e = {};
      if (!v.email.trim()) e.email = 'Email wajib diisi.';
      if (!v.password) e.password = 'Password wajib diisi.';
      return e;
    },
    submit: (v) => Api.login({ email: v.email.trim(), password: v.password })
  });
}

/* ===== Register ===== */
const registerForm = document.getElementById('register-form');
if (registerForm) {
  handleAuthForm(registerForm, {
    buttonText: 'Daftar',
    validate: (v) => {
      const e = {};
      if (!v.name.trim()) e.name = 'Nama wajib diisi.';
      if (!v.email.trim()) e.email = 'Email wajib diisi.';
      if (v.password.length < 8) e.password = 'Password minimal 8 karakter.';
      if (v.password !== v.password_confirmation) e.password_confirmation = 'Konfirmasi password tidak cocok.';
      return e;
    },
    submit: (v) => Api.register({
      name: v.name.trim(),
      email: v.email.trim(),
      password: v.password,
      password_confirmation: v.password_confirmation
    })
  });
}