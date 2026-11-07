<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Tautan atur kata sandi untuk akun admin (akun baru atau reset oleh super admin). Sengaja tidak di-queue agar langsung terkirim. */
class AdminPasswordLinkNotification extends Notification
{
    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.frontend_url'), '/').'/auth/reset-password?token='.$this->token.'&email='.urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Atur Kata Sandi Akun Admin Yayasan Padindi')
            ->line('Akun admin Anda di Yayasan Padindi siap digunakan. Atur kata sandi Anda lewat tautan berikut.')
            ->action('Atur Kata Sandi', $url)
            ->line('Tautan ini hanya untuk Anda. Jika Anda tidak merasa mengajukannya, abaikan email ini.');
    }
}
