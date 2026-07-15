<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $claimUrl,
        public string $organizationName,
        public string $roleName
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've been invited to join {$this->organizationName} on Snapflect",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: '<h2>Welcome to Snapflect!</h2><p>You have been invited to join the <strong>' . htmlspecialchars($this->organizationName) . '</strong> workspace as a <strong>' . htmlspecialchars($this->roleName) . '</strong>.</p><p><a href="' . htmlspecialchars($this->claimUrl) . '">Click here to claim your account and set your password</a>.</p>'
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
