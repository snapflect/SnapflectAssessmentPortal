<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Modules\Assessment\Repositories\Interfaces\CompetencyRepositoryInterface;
use App\Modules\Assessment\Repositories\Interfaces\CompetencyGroupRepositoryInterface;
use App\Modules\Assessment\DTOs\CreateCompetencyDto;
use App\Modules\Assessment\DTOs\UpdateCompetencyDto;
use App\Modules\Assessment\DTOs\CreateCompetencyGroupDto;
use App\Modules\Assessment\DTOs\UpdateCompetencyGroupDto;

class CompetencyService
{
    public function __construct(
        private CompetencyRepositoryInterface $competencyRepo,
        private CompetencyGroupRepositoryInterface $groupRepo
    ) {}

    public function createCompetency(int $organizationId, CreateCompetencyDto $dto)
    {
        return DB::transaction(function () use ($organizationId, $dto) {
            $data = $dto->toArray();
            if (empty($data['competency_code'])) {
                $baseCode = Str::slug($data['competency_name']);
                $code = $baseCode;
                $counter = 1;
                while (\App\Modules\Assessment\Models\Competency::where('competency_code', $code)->whereNull('deleted_date')->exists()) {
                    $code = $baseCode . '-' . $counter;
                    $counter++;
                }
                $data['competency_code'] = $code;
            }
            $data['uuid'] = Str::uuid()->toString();
            $data['organization_id'] = $organizationId;
            $data['created_by'] = auth()->id();

            if (!empty($data['competency_group_uuid'])) {
                $group = $this->groupRepo->findByUuid($data['competency_group_uuid']);
                if (!$group) {
                    throw new \Exception('Competency Group not found.');
                }
                $data['competency_group_id'] = $group->id;
            }
            unset($data['competency_group_uuid']);

            return $this->competencyRepo->create($data);
        });
    }

    public function updateCompetency(int $id, UpdateCompetencyDto $dto)
    {
        return DB::transaction(function () use ($id, $dto) {
            $data = $dto->toArray();
            $data['modified_by'] = auth()->id();

            if (array_key_exists('competency_group_uuid', $data)) {
                if ($data['competency_group_uuid'] === null) {
                    $data['competency_group_id'] = null;
                } else {
                    $group = $this->groupRepo->findByUuid($data['competency_group_uuid']);
                    if (!$group) {
                        throw new \Exception('Competency Group not found.');
                    }
                    $data['competency_group_id'] = $group->id;
                }
                unset($data['competency_group_uuid']);
            }

            return $this->competencyRepo->update($id, $data);
        });
    }

    public function deleteCompetency(int $id)
    {
        return DB::transaction(function () use ($id) {
            return $this->competencyRepo->delete($id);
        });
    }

    public function createGroup(int $organizationId, CreateCompetencyGroupDto $dto)
    {
        return DB::transaction(function () use ($organizationId, $dto) {
            $data = $dto->toArray();
            if (empty($data['group_code'])) {
                $baseCode = Str::slug($data['group_name']);
                $code = $baseCode;
                $counter = 1;
                while (\App\Modules\Assessment\Models\CompetencyGroup::where('group_code', $code)->whereNull('deleted_date')->exists()) {
                    $code = $baseCode . '-' . $counter;
                    $counter++;
                }
                $data['group_code'] = $code;
            }
            $data['uuid'] = Str::uuid()->toString();
            $data['organization_id'] = $organizationId;
            $data['created_by'] = auth()->id();

            return $this->groupRepo->create($data);
        });
    }

    public function updateGroup(int $id, UpdateCompetencyGroupDto $dto)
    {
        return DB::transaction(function () use ($id, $dto) {
            $data = $dto->toArray();
            $data['modified_by'] = auth()->id();

            $group = $this->groupRepo->findById($id);
            if (!$group) return false;
            return $group->update($data);
        });
    }

    public function deleteGroup(int $id)
    {
        return DB::transaction(function () use ($id) {
            $group = $this->groupRepo->findById($id);
            if (!$group) return false;
            
            return $group->update([
                'is_deleted' => true,
                'deleted_date' => now(),
                'status' => 'DELETED'
            ]);
        });
    }
}
