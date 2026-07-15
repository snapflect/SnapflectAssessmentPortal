<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class AdminInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $claimUrl,
        public string $organizationName
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to SnapFlect! Set up your account.',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: '<h2>Welcome to SnapFlect, ' . htmlspecialchars($this->organizationName) . '!</h2><p>You have been invited to set up your organization\'s portal.</p><p><a href="' . htmlspecialchars($this->claimUrl) . '">Click here to claim your account and set your password</a>.</p>'
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
