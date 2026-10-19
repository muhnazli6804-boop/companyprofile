<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// TODO: see Rancangan-API-Padindi.md section 5.6 & 12
class RevisionRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        // TODO: payload notifikasi
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pemberitahuan Pendaftaran Yayasan Padindi')
            ->line('Status pendaftaran Anda telah diperbarui.');
    }
}
