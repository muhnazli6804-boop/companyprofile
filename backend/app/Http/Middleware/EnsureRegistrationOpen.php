<?php

namespace App\Http\Middleware;

use App\Models\RegistrationPeriod;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRegistrationOpen
{
    public function handle(Request $request, Closure $next): Response
    {
        $now = now();
        $isOpen = RegistrationPeriod::query()
            ->where('is_active', true)
            ->where('opens_at', '<=', $now)
            ->where('closes_at', '>=', $now)
            ->exists();

        if (! $isOpen) {
            return response()->json([
                'message' => 'Periode pendaftaran sedang ditutup atau belum dibuka.',
                'code' => 'REGISTRATION_CLOSED',
            ], 409);
        }

        return $next($request);
    }
}
