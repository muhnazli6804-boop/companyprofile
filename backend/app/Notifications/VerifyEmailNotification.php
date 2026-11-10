<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

/** Tautan verifikasi email pendaftar. Sengaja tidak di-queue agar langsung terkirim. */
class VerifyEmailNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $minutes = (int) config('auth.verification.expire', 60);
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes($minutes), [
            'id' => $notifiable->getKey(),
            'hash' => sha1($notifiable->getEmailForVerification()),
        ]);

        return (new MailMessage)
            ->subject('Verifikasi Email Akun Yayasan Padindi')
            ->greeting("Halo, {$notifiable->name}")
            ->line('Terima kasih telah membuat akun di Yayasan Padindi. Klik tombol berikut untuk memverifikasi alamat email Anda.')
            ->action('Verifikasi Email', $url)
            ->line("Tautan ini berlaku {$minutes} menit. Jika Anda tidak merasa membuat akun, abaikan email ini.");
    }
}
