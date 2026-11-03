/* ===== Penjaga halaman: tanpa token -> login ===== */
if (!Token.get()) {
  location.href = '/login';
}