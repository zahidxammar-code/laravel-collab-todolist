<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'To-Do List')</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>
    <header class="topbar">
        <div class="topbar-inner">
            <a href="/" class="brand">✅ To-Do List</a>
            {{-- Diisi JavaScript di Step 7 & 9: nama user + tombol logout --}}
            <div id="nav-user" class="nav-user"></div>
        </div>
    </header>

    <main class="container @yield('container_class')">
        {{-- Area pesan sukses/error global --}}
        <div id="alert" class="alert hidden" role="alert"></div>

        @yield('content')
    </main>

    <script src="{{ asset('js/config.js') }}"></script>
    <script src="{{ asset('js/mock.js') }}"></script>
    <script src="{{ asset('js/api.js') }}"></script>
    @yield('scripts')
</body>
</html>