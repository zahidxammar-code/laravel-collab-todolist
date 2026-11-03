@extends('layouts.app')
@section('title', 'Daftar Tugas')

@section('content')
    <div class="toolbar">
        <h1>Tugas Saya</h1>
        <div style="display:flex; gap:.5rem;">
            <select id="filter-status">
                <option value="">Semua</option>
                <option value="todo">Belum selesai</option>
                <option value="done">Selesai</option>
            </select>
            <button type="button" class="btn" id="add-btn">+ Tambah Tugas</button>
        </div>
    </div>

    <div id="task-form-card" class="card hidden">
        <h2 id="form-title">Tambah Tugas</h2>
        <form id="task-form" novalidate>
            <div class="form-group">
                <label for="title">Judul</label>
                <input type="text" id="title" name="title" maxlength="150">
                <div class="field-error" data-error-for="title"></div>
            </div>
            <div class="form-group">
                <label for="description">Deskripsi (opsional)</label>
                <textarea id="description" name="description"></textarea>
                <div class="field-error" data-error-for="description"></div>
            </div>
            <div class="form-group">
                <label for="deadline">Deadline (opsional)</label>
                <input type="date" id="deadline" name="deadline">
                <div class="field-error" data-error-for="deadline"></div>
            </div>
            <div class="form-group">
                <label for="status">Status</label>
                <select id="status" name="status">
                    <option value="todo">Belum selesai</option>
                    <option value="done">Selesai</option>
                </select>
                <div class="field-error" data-error-for="status"></div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn" id="save-btn">Simpan</button>
                <button type="button" class="btn btn-outline" id="cancel-btn">Batal</button>
            </div>
        </form>
    </div>

    <div id="state" class="state-box hidden"></div>
    <ul id="task-list" class="task-list"></ul>
    <div id="pagination" class="pagination hidden"></div>
@endsection

@section('scripts')
    <script src="{{ asset('js/tasks.js') }}"></script>
@endsection