<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Support\Str;

trait ArchivesCodesOnDelete
{
    /**
     * Boot the trait to hook into the deleting event.
     */
    public static function bootArchivesCodesOnDelete(): void
    {
        static::deleting(function ($model) {
            // Only archive if this is a soft delete (not a force delete)
            if (method_exists($model, 'isForceDeleting') && !$model->isForceDeleting()) {
                $codeField = $model->getCodeField();
                
                if (!empty($model->{$codeField})) {
                    // Truncate the original code to ensure appending the timestamp doesn't exceed column length
                    $suffix = '::d_' . time();
                    $maxCodeLength = 50; 
                    if (method_exists($model, 'getCodeFieldMaxLength')) {
                        $maxCodeLength = $model->getCodeFieldMaxLength();
                    }
                    
                    $allowedOriginalLength = $maxCodeLength - strlen($suffix);
                    $originalCode = substr($model->{$codeField}, 0, $allowedOriginalLength);
                    
                    $model->{$codeField} = $originalCode . $suffix;
                    $model->saveQuietly();
                }
            }
        });
    }

    /**
     * Get the name of the code field for this model.
     * Models using this trait should define this method if the field is not 'code'.
     *
     * @return string
     */
    public function getCodeField(): string
    {
        return 'code';
    }
}
