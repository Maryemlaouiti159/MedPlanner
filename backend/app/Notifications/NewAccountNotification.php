<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewAccountNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected string $email,
        protected string $plainPassword,
        protected string $role
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $roleLabel = match ($this->role) {
            'doctor'    => 'Médecin',
            'secretary' => 'Secrétaire',
            default     => 'Utilisateur',
        };

        return (new MailMessage)
            ->subject('Votre compte MedPlanner a été créé')
            ->greeting('Bonjour ' . $notifiable->first_name . ',')
            ->line("Un compte {$roleLabel} a été créé pour vous sur MedPlanner.")
            ->line('Voici vos identifiants de connexion :')
            ->line('**Email :** ' . $this->email)
            ->line('**Mot de passe temporaire :** ' . $this->plainPassword)
            ->line('⚠️ Pour votre sécurité, vous devrez changer ce mot de passe dès votre première connexion.')
            ->line('Merci de votre confiance.');
    }
}