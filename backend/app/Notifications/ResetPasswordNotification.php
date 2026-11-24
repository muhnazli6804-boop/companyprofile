<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Tautan atur ulang kata sandi akun pengguna. Sengaja tidak di-queue agar langsung terkirim. */
class ResetPasswordNotification extends Notification
{
    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $minutes = (int) config('auth.passwords.users.expire', 60);
        $url = rtrim(config('app.frontend_url'), '/').'/auth/reset-password?token='.$this->token.'&email='.urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Atur Ulang Kata Sandi Akun Yayasan Padindi')
            ->greeting("Halo, {$notifiable->name}")
            ->line('Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda di Yayasan Padindi.')
            ->action('Atur Ulang Kata Sandi', $url)
            ->line("Tautan atur ulang kata sandi ini hanya berlaku selama {$minutes} menit.")
            ->line('Jika Anda tidak merasa mengajukan permintaan ini, abaikan email ini dan kata sandi Anda tidak akan berubah.');
    }
}
