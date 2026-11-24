<?php

namespace App\Notifications;

use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RevisionRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public StudentApplication|TeacherApplication $application,
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

        $category = $this->type === 'student' ? 'pendaftaran siswa' : 'lamaran pendidik';

        $mail = (new MailMessage)
            ->subject("[Yayasan Padindi] Permintaan Revisi / Perbaikan Berkas - {$regNumber}")
            ->greeting("Halo, {$notifiable->name}")
            ->line("Tim verifikator Yayasan Padindi telah memeriksa berkas {$category} Anda dengan nomor registrasi **{$regNumber}**.")
            ->line('Terdapat beberapa dokumen atau data yang memerlukan perbaikan / pengunggahan ulang.');

        if ($this->note) {
            $mail->line('Catatan perbaikan yang harus diperhatikan:')
                ->line("{$this->note}");
        }

        return $mail
            ->action('Perbaiki Berkas Pendaftaran', $portalUrl)
            ->line('Mohon segera memperbarui berkas yang diminta melalui portal agar proses seleksi dapat dilanjutkan.');
    }
}
