<?php
require __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;

// Build DSN with verify_peer=0
$dsn = 'smtp://official%40snapflect.com:NewMubarak123%23@smtp.hostinger.com:465?verify_peer=0';

try {
    $transport = Transport::fromDsn($dsn);
    $mailer = new Mailer($transport);
    
    $email = (new Email())
        ->from('official@snapflect.com')
        ->to('official@snapflect.com')
        ->subject('SMTP Test')
        ->text('SMTP Works!');
        
    $mailer->send($email);
    echo "SMTP Works and Credentials are Valid!\n";
} catch (\Exception $e) {
    echo "SMTP Error: " . $e->getMessage() . "\n";
}
