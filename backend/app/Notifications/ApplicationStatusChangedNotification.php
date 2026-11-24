<?php

namespace App\Notifications;

use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public StudentApplication|TeacherApplication $application,
        public string $status,
        public string $type = 'student', // 'student' | 'teacher'
        public ?string $note = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $regNumber = $this->application->registration_number ?? '-';
        $frontendUrl = rtrim(config('app.frontend_url') ?: config('app.url'), '/');
        $portalUrl = $this->type === 'student'
            ? "{$frontendUrl}/akun/pendaftaran/murid/{$this->application->id}"
            : "{$frontendUrl}/akun/pendaftaran/guru/{$this->application->id}";

        $statusLabels = [
            'draft' => 'Draft / Konsep',
            'submitted' => 'Menunggu Verifikasi',
            'verified' => 'Berkas Terverifikasi',
            'revision_required' => 'Perlu Perbaikan / Revisi Berkas',
            'administrative_review' => 'Seleksi Administrasi',
            'interview_test' => 'Tahap Wawancara / Tes Praktik',
            'passed' => 'Lolos Seleksi',
            'failed' => 'Belum Lolos Seleksi',
            'reserve' => 'Cadangan',
            'accepted' => 'Diterima',
            'rejected' => 'Ditolak / Belum Lolos',
            'cancelled' => 'Dibatalkan',
        ];

        $statusText = $statusLabels[$this->status] ?? ucfirst(str_replace('_', ' ', $this->status));
        $category = $this->type === 'student' ? 'pendaftaran siswa baru' : 'lamaran tenaga pendidik';

        $mail = (new MailMessage)
            ->subject("[Yayasan Padindi] Pembaruan Status Pendaftaran - {$regNumber}")
            ->greeting("Halo, {$notifiable->name}")
            ->line("Status {$category} Anda dengan nomor registrasi **{$regNumber}** telah diperbarui menjadi:")
            ->line("**{$statusText}**");

        if ($this->note) {
            $mail->line('Catatan dari panitia / verifikator:')
                ->line("{$this->note}");
        }

        return $mail
            ->action('Lihat Detail Status', $portalUrl)
            ->line('Terima kasih atas partisipasi dan kerja sama Anda bersama Yayasan Padindi.');
    }
}
