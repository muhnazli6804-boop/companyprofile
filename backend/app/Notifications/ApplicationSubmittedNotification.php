<?php

namespace App\Notifications;

use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public StudentApplication|TeacherApplication $application,
        public string $type = 'student' // 'student' | 'teacher'
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $regNumber = $this->application->registration_number;

        if ($this->type === 'student') {
            return (new MailMessage)
                ->subject("[Yayasan Padindi] Bukti Pendaftaran Siswa Baru - {$regNumber}")
                ->greeting("Halo, {$notifiable->name}")
                ->line('Pendaftaran siswa baru untuk Yayasan Padindi telah berhasil diserahkan dengan nomor pendaftaran:')
                ->line("**{$regNumber}**")
                ->line('Langkah berikutnya: Calon murid perlu mengikuti tes penempatan / observasi secara offline di kampus sekolah Yayasan Padindi.')
                ->action('Lihat Status Pendaftaran', url("/akun/pendaftaran/murid/{$this->application->id}"))
                ->line('Terima kasih telah mempercayakan pendidikan putra-putri Anda kepada Yayasan Padindi.');
        }

        return (new MailMessage)
            ->subject("[Yayasan Padindi] Konfirmasi Pendaftaran Guru - {$regNumber}")
            ->greeting("Halo, {$notifiable->name}")
            ->line('Lamaran posisi tenaga pendidik di Yayasan Padindi telah berhasil diserahkan dengan nomor registrasi:')
            ->line("**{$regNumber}**")
            ->line('Langkah berikutnya: Pelamar akan dihubungi oleh tim rekrutmen melalui nomor telepon terdaftar untuk jadwal wawancara daring.')
            ->action('Lihat Status Lamaran', url("/akun/pendaftaran/guru/{$this->application->id}"))
            ->line('Terima kasih atas minat Anda bergabung bersama keluarga besar Yayasan Padindi.');
    }
}
