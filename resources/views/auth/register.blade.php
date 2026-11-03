@extends('layouts.app')
@section('title', 'Register')
@section('container_class', 'narrow')

@section('content')
    <div class="card">
        <h1>Daftar Akun</h1>
        <p style="color:var(--muted)">Buat akun untuk mulai mencatat tugas.</p>

        <form id="register-form" novalidate>
            <div class="form-group">
                <label for="name">Nama</label>
                <input type="text" id="name" name="name">
                <div class="field-error" data-error-for="name"></div>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="user@example.com">
                <div class="field-error" data-error-for="email"></div>
            </div>
            <div class="form-group">
                <label for="password">Password (minimal 8 karakter)</label>
                <input type="password" id="password" name="password">
                <div class="field-error" data-error-for="password"></div>
            </div>
            <div class="form-group">
                <label for="password_confirmation">Konfirmasi Password</label>
                <input type="password" id="password_confirmation" name="password_confirmation">
                <div class="field-error" data-error-for="password_confirmation"></div>
            </div>
            <button type="submit" class="btn btn-block" id="submit-btn">Daftar</button>
        </form>

        <p class="form-footer">Sudah punya akun? <a href="/login">Login</a></p>
    </div>
@endsection

@section('scripts')
    <script src="{{ asset('js/auth.js') }}"></script>
@endsection