<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResultPublishedNotification extends Notification
{
    use Queueable;

    private string $assessmentName;
    private string $uuid;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $assessmentName, string $uuid)
    {
        $this->assessmentName = $assessmentName;
        $this->uuid = $uuid;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "Your results for {$this->assessmentName} have been published.",
            'assessment_name' => $this->assessmentName,
            'uuid' => $this->uuid,
        ];
    }
}
