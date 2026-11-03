@extends('layouts.app')
@section('title', 'Daftar Tugas')

@section('content')
    <div class="toolbar">
        <h1>Tugas Saya</h1>
        <select id="filter-status">
            <option value="">Semua</option>
            <option value="todo">Belum selesai</option>
            <option value="done">Selesai</option>
        </select>
    </div>

    <div id="state" class="state-box hidden"></div>
    <ul id="task-list" class="task-list"></ul>
    <div id="pagination" class="pagination hidden"></div>
@endsection

@section('scripts')
    <script src="{{ asset('js/tasks.js') }}"></script>
@endsection