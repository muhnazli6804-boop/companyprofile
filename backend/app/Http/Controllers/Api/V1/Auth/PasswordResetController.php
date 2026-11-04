<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ]);

        $user = User::whereRaw('lower(email) = ?', [strtolower($validated['email'])])->first();

        if ($user) {
            $token = Str::random(60);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($token), 'created_at' => now()]
            );
        }

        return response()->json([
            'message' => 'Jika email Anda terdaftar, tautan atur ulang kata sandi telah dikirimkan ke email Anda.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)],
        ], [
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', strtolower($validated['email']))->first();

        if (! $record || ! Hash::check($validated['token'], $record->token)) {
            return response()->json([
                'message' => 'Token atur ulang kata sandi tidak valid atau telah kedaluwarsa.',
                'code' => 'INVALID_TOKEN',
            ], 422);
        }

        $user = User::whereRaw('lower(email) = ?', [strtolower($validated['email'])])->first();
        if ($user) {
            $user->update(['password' => Hash::make($validated['password'])]);
            DB::table('password_reset_tokens')->where('email', strtolower($validated['email']))->delete();
        }

        return response()->json([
            'message' => 'Kata sandi berhasil diatur ulang. Silakan masuk menggunakan kata sandi baru Anda.',
        ]);
    }
}
