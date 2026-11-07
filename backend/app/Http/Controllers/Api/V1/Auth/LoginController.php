<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    /** Hash bcrypt (cost 12, sama dengan BCRYPT_ROUNDS) dari string acak; tidak cocok dengan kata sandi mana pun. */
    private const DUMMY_HASH = '$2y$12$iOfIE/EiDwsTtiGVtXJT2.ghGdgQptjQidzc2Vs7pKXejKc069pWG';

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $user = User::whereRaw('lower(email) = ?', [strtolower($validated['email'])])->first();

        // Selalu hitung hash (dummy bila email tak terdaftar) agar waktu respons tidak membocorkan keberadaan akun.
        $passwordValid = Hash::check($validated['password'], $user->password ?? self::DUMMY_HASH);

        if (! $user || ! $passwordValid) {
            return response()->json([
                'message' => 'Email atau kata sandi yang Anda masukkan salah.',
                'code' => 'INVALID_CREDENTIALS',
                'errors' => [
                    'email' => ['Email atau kata sandi yang Anda masukkan salah.'],
                ],
            ], 422);
        }

        $isAdmin = $user->user_type === UserType::ADMIN;

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi pengurus yayasan.',
                'code' => $isAdmin ? 'ACCOUNT_DISABLED' : 'ACCOUNT_INACTIVE',
            ], 403);
        }

        // Admin hanya memakai cookie sesi; tanpa sesi (origin bukan stateful) login tidak bisa dibuat.
        if ($isAdmin && ! $request->hasSession()) {
            return response()->json([
                'message' => 'Sesi tidak tersedia. Periksa SANCTUM_STATEFUL_DOMAINS.',
                'code' => 'SESSION_UNAVAILABLE',
            ], 400);
        }

        $user->update(['last_login_at' => now()]);

        // Admin: tanpa "remember" dan tanpa token Bearer.
        Auth::login($user, ! $isAdmin && $request->boolean('remember'));

        if ($isAdmin) {
            $request->session()->regenerate();
        }

        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'user_type' => $user->user_type->value,
            'email_verified' => $user->email_verified_at !== null,
        ];

        if (! $isAdmin) {
            $data['token'] = $user->createToken('auth-token')->plainTextToken;
        }

        return response()->json(['message' => 'Berhasil masuk.', 'data' => $data], 200);
    }
}
