<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordCodeNotification extends Notification
{
    use Queueable;

    public function __construct(protected string $code) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre code de réinitialisation MedPlanner')
            ->greeting('Bonjour ' . $notifiable->first_name . ',')
            ->line('Voici votre code de réinitialisation de mot de passe :')
            ->line(new \Illuminate\Support\HtmlString('<h1 style="text-align:center;letter-spacing:8px;">' . $this->code . '</h1>'))
            ->line('Ce code est valable pendant 15 minutes.')
            ->line('Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email.');
    }
}