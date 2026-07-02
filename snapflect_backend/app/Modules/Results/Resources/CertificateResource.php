<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'certificateUuid' => $this->certificateUuid,
            'verificationCode' => $this->verificationCode,
            'status' => $this->status, // 'VALID' or 'REVOKED'
            'issuedAt' => $this->issuedAt,
            'candidateName' => $this->candidateName,
            'assessmentName' => $this->assessmentName,
            // Only expose download URL if it's VALID.
            'downloadUrl' => $this->status === 'VALID' ? $this->downloadUrl : null,
        ];
    }
}
