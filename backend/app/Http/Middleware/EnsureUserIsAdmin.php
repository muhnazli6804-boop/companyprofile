<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// TODO: see ARCHITECTURE.md section 6 and Struktur-Folder-Padindi.md section 2
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->user_type !== UserType::ADMIN) {
            return response()->json([
                'message' => 'Akses ditolak. Area khusus administrator.',
                'code' => 'FORBIDDEN',
            ], 403);
        }

        return $next($request);
    }
}
