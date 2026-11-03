<?php


use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect('/login'));

Route::view('/login', 'auth.login')->name('login.page');
Route::view('/register', 'auth.register')->name('register.page');
Route::view('/tasks', 'tasks.index')->name('tasks.page');