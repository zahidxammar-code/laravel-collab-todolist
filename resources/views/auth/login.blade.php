@extends('layouts.app')
@section('title', 'Login')
@section('container_class', 'narrow')

@section('content')
    <div class="card">
        <h1>Login</h1>
        <p style="color:var(--muted)">Masuk untuk melihat tugasmu.</p>

        <form id="login-form" novalidate>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="user@example.com">
                <div class="field-error" data-error-for="email"></div>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password">
                <div class="field-error" data-error-for="password"></div>
            </div>
            <button type="submit" class="btn btn-block" id="submit-btn">Login</button>
        </form>

        <p class="form-footer">Belum punya akun? <a href="/register">Daftar</a></p>
    </div>
@endsection

@section('scripts')
    <script src="{{ asset('js/auth.js') }}"></script>
@endsection