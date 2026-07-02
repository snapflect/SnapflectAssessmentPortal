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
            $data = [
                'uuid' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'bank_code' => $dto->bank_code,
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
