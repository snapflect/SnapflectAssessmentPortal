<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $resetUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Reset your Snapflect Password",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">' .
                        '<h2>Password Reset Request</h2>' .
                        '<p>We received a request to reset the password for your Snapflect account.</p>' .
                        '<p><a href="' . htmlspecialchars($this->resetUrl) . '" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>' .
                        '<p>If you did not request a password reset, no further action is required.</p>' .
                        '</div>'
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
