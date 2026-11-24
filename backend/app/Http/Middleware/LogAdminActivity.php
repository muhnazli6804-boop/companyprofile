<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class LogAdminActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $this->logActivity($request, $response);

        return $response;
    }

    protected function logActivity(Request $request, Response $response): void
    {
        $user = $request->user();

        // Hanya catat untuk user yang sudah terautentikasi
        if (! $user) {
            return;
        }

        // Hanya catat operasi yang berhasil diproses oleh aplikasi (HTTP status < 400)
        if ($response->getStatusCode() >= 400) {
            return;
        }

        $method = strtoupper($request->method());

        // Abaikan metode non-mutasi umum (HEAD, OPTIONS)
        if (in_array($method, ['HEAD', 'OPTIONS'])) {
            return;
        }

        // Abaikan GET biasa kecuali endpoint unduh/ekspor berkas & laporan
        $isExportOrDownload = $request->is('*/export*')
            || $request->is('*/download*')
            || $request->is('*/reports/summary*');

        if ($method === 'GET' && ! $isExportOrDownload) {
            return;
        }

        // Hindari logging saat melihat daftar activity-logs agar tidak terjadi loop rekursif
        if ($request->is('*/activity-logs*')) {
            return;
        }

        $action = $this->resolveAction($request, $method);

        // Jika aksi ini sudah dicatat secara manual oleh controller pada siklus request yang sama
        if ($this->isAlreadyLogged($user->id, $action)) {
            return;
        }

        $subjectType = $this->resolveSubjectType($request);
        $subjectId = $this->resolveSubjectId($request);

        // Bersihkan parameter sensitif dan objek file agar aman di-encode ke JSON
        $sanitizedPayload = self::sanitizePayload($request->all());

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'properties' => [
                'method' => $method,
                'path' => $request->path(),
                'status_code' => $response->getStatusCode(),
                'payload' => $sanitizedPayload,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 255, ''),
            'created_at' => now(),
        ]);
    }

    protected static function sanitizePayload(mixed $data): mixed
    {
        if ($data instanceof \Symfony\Component\HttpFoundation\File\UploadedFile) {
            return [
                'filename' => $data->getClientOriginalName(),
                'size' => $data->getSize(),
                'mime' => $data->getClientMimeType(),
            ];
        }

        if (is_array($data)) {
            $cleaned = [];
            foreach ($data as $k => $v) {
                if (in_array($k, ['password', 'password_confirmation', 'current_password', 'token', 'access_token'], true)) {
                    continue;
                }
                $cleaned[$k] = self::sanitizePayload($v);
            }
            return $cleaned;
        }

        if (is_scalar($data) || is_null($data)) {
            return $data;
        }

        return null;
    }

    protected function resolveAction(Request $request, string $method): string
    {
        if ($routeName = $request->route()?->getName()) {
            return $routeName;
        }

        $routeAction = $request->route()?->getActionName();
        if ($routeAction && str_contains($routeAction, '@')) {
            [$controller, $methodName] = explode('@', $routeAction);
            $controllerBase = class_basename($controller);
            $resource = Str::snake(str_replace('Controller', '', $controllerBase));

            $verbMap = [
                'store' => 'create',
                'update' => 'update',
                'destroy' => 'delete',
                'bulkStatus' => 'bulk_status',
                'updateStatus' => 'update_status',
                'updateNote' => 'update_note',
                'publish' => 'publish',
                'unpublish' => 'unpublish',
                'archive' => 'archive',
                'export' => 'export',
                'summary' => 'summary',
                'verify' => 'verify',
                'promote' => 'promote',
                'resetPassword' => 'reset_password',
                'uploadLogo' => 'upload_logo',
            ];

            $verb = $verbMap[$methodName] ?? Str::snake($methodName);
            return "{$resource}.{$verb}";
        }

        $cleanPath = Str::replaceFirst('api/v1/admin/', '', $request->path());
        $cleanPath = preg_replace('/\/\d+/', '', (string) $cleanPath);
        $cleanPath = str_replace('/', '.', (string) $cleanPath);

        return strtolower($method) . '.' . $cleanPath;
    }

    protected function resolveSubjectType(Request $request): ?string
    {
        $routeAction = $request->route()?->getActionName();
        if ($routeAction && str_contains($routeAction, '@')) {
            [$controller] = explode('@', $routeAction);
            $controllerBase = class_basename($controller);
            return Str::snake(str_replace('Controller', '', $controllerBase));
        }

        return null;
    }

    protected function resolveSubjectId(Request $request): ?int
    {
        $id = $request->route('id') ?? $request->route('user') ?? $request->route('post') ?? $request->route('banner');
        if (is_numeric($id)) {
            return (int) $id;
        }

        if (is_object($id) && isset($id->id)) {
            return (int) $id->id;
        }

        return null;
    }

    protected function isAlreadyLogged(int $userId, string $action): bool
    {
        return ActivityLog::where('user_id', $userId)
            ->where('action', $action)
            ->where('created_at', '>=', now()->subSeconds(2))
            ->exists();
    }
}
