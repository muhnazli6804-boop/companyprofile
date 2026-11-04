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

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Email atau kata sandi yang Anda masukkan salah.',
                'code' => 'INVALID_CREDENTIALS',
                'errors' => [
                    'email' => ['Email atau kata sandi yang Anda masukkan salah.'],
                ],
            ], 422);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi pengurus yayasan.',
                'code' => 'ACCOUNT_INACTIVE',
            ], 403);
        }

        if ($user->user_type !== UserType::APPLICANT) {
            return response()->json([
                'message' => 'Akun ini bukan akun pendaftar.',
                'code' => 'INVALID_USER_TYPE',
            ], 403);
        }

        $user->update(['last_login_at' => now()]);
        Auth::login($user, $request->boolean('remember'));
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Berhasil masuk.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'user_type' => $user->user_type->value,
                'email_verified' => $user->email_verified_at !== null,
                'token' => $token,
            ],
        ], 200);
    }

    public function adminLogin(): JsonResponse
    {
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
