<?php

namespace App\Http\Requests\Admin;

/** Aturan sama dengan StoreUserRequest; email akun yang sedang diubah dikecualikan dari cek unik lewat parameter rute. */
class UpdateUserRequest extends StoreUserRequest {}
