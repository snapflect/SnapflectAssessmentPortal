<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

class CertificateDto
{
    public function __construct(
        public readonly string $certificateUuid,
        public readonly string $verificationCode,
        public readonly string $status, // 'VALID' | 'REVOKED'
        public readonly string $issuedAt,
        public readonly string $candidateName,
        public readonly string $assessmentName,
        public readonly string $downloadUrl
    ) {
    }

    public function toArray(): array
    {
        return [
            'certificateUuid' => $this->certificateUuid,
            'verificationCode' => $this->verificationCode,
            'status' => $this->status,
            'issuedAt' => $this->issuedAt,
            'candidateName' => $this->candidateName,
            'assessmentName' => $this->assessmentName,
            'downloadUrl' => $this->downloadUrl,
        ];
    }
}
