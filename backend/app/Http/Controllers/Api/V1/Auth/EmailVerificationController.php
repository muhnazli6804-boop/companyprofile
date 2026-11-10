<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

// Lihat Rancangan-API-Padindi.md section 4 dan docs/adr/0005-catatan-verifikasi-email.md
class EmailVerificationController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email Anda sudah terverifikasi.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Tautan verifikasi telah dikirim ke email Anda.']);
    }

    /**
     * Tautan dibuka dari email, tanpa login. Semua hasil (berhasil maupun tidak) dialihkan ke frontend;
     * tidak pernah JSON 403 dan tidak membuat sesi.
     */
    public function verify(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = $request->hasValidSignature() ? User::find($id) : null;

        $valid = $user !== null
            && $user->isApplicant()
            && hash_equals(sha1($user->getEmailForVerification()), $hash);

        if ($valid && ! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->away(rtrim(config('app.frontend_url'), '/').'/akun/pendaftaran?verified='.(int) $valid);
    }
}
