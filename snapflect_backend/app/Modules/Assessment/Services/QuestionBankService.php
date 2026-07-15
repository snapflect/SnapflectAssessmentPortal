<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\DTOs\CreateQuestionBankDto;
use App\Modules\Assessment\DTOs\UpdateQuestionBankDto;
use App\Modules\Assessment\Repositories\Interfaces\QuestionBankRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuestionBankService
{
    public function __construct(
        private QuestionBankRepositoryInterface $repository
    ) {}

    public function create(?int $organizationId, CreateQuestionBankDto $dto, int $userId): \Illuminate\Database\Eloquent\Model
    {
        return DB::transaction(function () use ($organizationId, $dto, $userId) {
            $bankCode = $dto->bank_code;
            if (empty($bankCode)) {
                $baseCode = Str::slug($dto->bank_name);
                $bankCode = $baseCode;
                $counter = 1;
                while (\App\Modules\Assessment\Models\QuestionBank::where('bank_code', $bankCode)->whereNull('deleted_date')->exists()) {
                    $bankCode = $baseCode . '-' . $counter;
                    $counter++;
                }
            }

            $user = \App\Modules\Security\Models\User::find($userId);

            $data = [
                'uuid' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'business_unit_id' => $dto->business_unit_id ?? $user?->business_unit_id,
                'department_id' => $dto->department_id ?? $user?->department_id,
                'bank_code' => $bankCode,
                'bank_name' => $dto->bank_name,
                'is_system_bank' => is_null($organizationId),
                'description' => $dto->description,
                'status' => 'ACTIVE',
                'created_by' => $userId,
                'is_deleted' => false,
            ];

            return $this->repository->create($data);
        });
    }

    public function update(int $id, UpdateQuestionBankDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($id, $dto, $userId) {
            $data = $dto->toArray();
            $data['modified_by'] = $userId;
            
            return $this->repository->update($id, $data);
        });
    }

    public function delete(int $id, int $userId): bool
    {
        return DB::transaction(function () use ($id, $userId) {
            return $this->repository->update($id, [
                'is_deleted' => true,
                'deleted_by' => $userId,
                'deleted_date' => now(),
                'status' => 'DELETED'
            ]);
        });
    }
}
