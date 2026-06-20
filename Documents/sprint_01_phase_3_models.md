# SNAPFLECT ASSESSMENT PORTAL
## SPRINT 01 - PHASE 3 MODELS & TRAITS REVIEW

**Status:** PENDING REVIEW  
**Scope:** Eloquent Models and Supporting Traits ONLY  

---

### **SUPPORTING TRAITS**

#### 1. HasUuid
* **File Path:** `app/Shared/Traits/HasUuid.php`
* **Purpose:** Automatically generates UUIDs on creation and enforces UUID routing.

```php
<?php

namespace App\Shared\Traits;

use Illuminate\Support\Str;

trait HasUuid
{
    protected static function bootHasUuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
```

#### 2. HasAuditFields
* **File Path:** `app/Shared/Traits/HasAuditFields.php`
* **Purpose:** Handles `SoftDeletes` (mapped to `deleted_date`), timestamps, and user audit tracking.

```php
<?php

namespace App\Shared\Traits;

use Illuminate\Database\Eloquent\SoftDeletes;

trait HasAuditFields
{
    use SoftDeletes;

    public function getDeletedAtColumn()
    {
        return defined('static::DELETED_AT') ? static::DELETED_AT : 'deleted_date';
    }

    protected static function bootHasAuditFields(): void
    {
        static::creating(function ($model) {
            $model->created_date = $model->created_date ?: now();
            if (auth()->check()) {
                $model->created_by = $model->created_by ?: auth()->id();
            }
        });

        static::updating(function ($model) {
            $model->modified_date = now();
            if (auth()->check()) {
                $model->modified_by = auth()->id();
            }
        });

        static::deleting(function ($model) {
            $model->is_deleted = true;
            $model->deleted_date = now();
            if (auth()->check()) {
                $model->deleted_by = auth()->id();
            }
            $model->saveQuietly();
        });
    }

    public function creator()
    {
        return $this->belongsTo(\App\Modules\Security\Models\User::class, 'created_by', 'id');
    }

    public function modifier()
    {
        return $this->belongsTo(\App\Modules\Security\Models\User::class, 'modified_by', 'id');
    }

    public function deleter()
    {
        return $this->belongsTo(\App\Modules\Security\Models\User::class, 'deleted_by', 'id');
    }
}
```

#### 3. BelongsToOrganization
* **File Path:** `app/Shared/Traits/BelongsToOrganization.php`
* **Purpose:** Reusable organization scoping trait.

```php
<?php

namespace App\Shared\Traits;

use App\Modules\Governance\Models\Organization;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToOrganization
{
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id', 'id');
    }
}
```

---

### **GOVERNANCE MODULE MODELS**

#### 1. Organization
* **File Path:** `app/Modules/Governance/Models/Organization.php`
* **Relationships Implemented:** `businessUnits()`, `departments()`, `locations()`, `users()` (All `hasMany`)
* **Traits Used:** `HasUuid`, `HasAuditFields`

```php
<?php

namespace App\Modules\Governance\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Modules\Security\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasUuid, HasAuditFields;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'organizations';

    protected $fillable = [
        'organization_code', 'organization_name', 'legal_name', 'contact_email',
        'country', 'timezone', 'status', 'is_deleted', 'created_by', 'modified_by', 'deleted_by',
    ];

    protected $hidden = ['id'];

    protected $casts = [
        'is_deleted' => 'boolean', 'created_date' => 'datetime', 'modified_date' => 'datetime', 'deleted_date' => 'datetime',
    ];

    public function businessUnits(): HasMany { return $this->hasMany(BusinessUnit::class, 'organization_id', 'id'); }
    public function departments(): HasMany { return $this->hasMany(Department::class, 'organization_id', 'id'); }
    public function locations(): HasMany { return $this->hasMany(Location::class, 'organization_id', 'id'); }
    public function users(): HasMany { return $this->hasMany(User::class, 'organization_id', 'id'); }
}
```

#### 2. BusinessUnit
* **File Path:** `app/Modules/Governance/Models/BusinessUnit.php`
* **Relationships Implemented:** `organization()` (`belongsTo` via trait), `departments()`, `users()` (All `hasMany`)
* **Traits Used:** `HasUuid`, `HasAuditFields`, `BelongsToOrganization`

```php
<?php

namespace App\Modules\Governance\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Modules\Security\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessUnit extends Model
{
    use HasUuid, HasAuditFields, BelongsToOrganization;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'business_units';

    protected $fillable = [
        'organization_id', 'business_unit_code', 'business_unit_name', 'status', 'is_deleted', 'created_by', 'modified_by', 'deleted_by',
    ];

    protected $hidden = ['id', 'organization_id'];

    protected $casts = [
        'is_deleted' => 'boolean', 'created_date' => 'datetime', 'modified_date' => 'datetime', 'deleted_date' => 'datetime',
    ];

    public function departments(): HasMany { return $this->hasMany(Department::class, 'business_unit_id', 'id'); }
    public function users(): HasMany { return $this->hasMany(User::class, 'business_unit_id', 'id'); }
}
```

#### 3. Department
* **File Path:** `app/Modules/Governance/Models/Department.php`
* **Relationships Implemented:** `organization()` (`belongsTo` via trait), `businessUnit()` (`belongsTo`), `users()` (`hasMany`)
* **Traits Used:** `HasUuid`, `HasAuditFields`, `BelongsToOrganization`

```php
<?php

namespace App\Modules\Governance\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Modules\Security\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasUuid, HasAuditFields, BelongsToOrganization;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'departments';

    protected $fillable = [
        'organization_id', 'business_unit_id', 'department_code', 'department_name', 'status', 'is_deleted', 'created_by', 'modified_by', 'deleted_by',
    ];

    protected $hidden = ['id', 'organization_id', 'business_unit_id'];

    protected $casts = [
        'is_deleted' => 'boolean', 'created_date' => 'datetime', 'modified_date' => 'datetime', 'deleted_date' => 'datetime',
    ];

    public function businessUnit(): BelongsTo { return $this->belongsTo(BusinessUnit::class, 'business_unit_id', 'id'); }
    public function users(): HasMany { return $this->hasMany(User::class, 'department_id', 'id'); }
}
```

#### 4. Location
* **File Path:** `app/Modules/Governance/Models/Location.php`
* **Relationships Implemented:** `organization()` (`belongsTo` via trait), `users()` (`hasMany`)
* **Traits Used:** `HasUuid`, `HasAuditFields`, `BelongsToOrganization`

```php
<?php

namespace App\Modules\Governance\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Modules\Security\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    use HasUuid, HasAuditFields, BelongsToOrganization;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'locations';

    protected $fillable = [
        'organization_id', 'location_code', 'location_name', 'address', 'city', 'state', 'country', 'status', 'is_deleted', 'created_by', 'modified_by', 'deleted_by',
    ];

    protected $hidden = ['id', 'organization_id'];

    protected $casts = [
        'is_deleted' => 'boolean', 'created_date' => 'datetime', 'modified_date' => 'datetime', 'deleted_date' => 'datetime',
    ];

    public function users(): HasMany { return $this->hasMany(User::class, 'location_id', 'id'); }
}
```

---

### **SECURITY MODULE MODELS**

#### 5. User
* **File Path:** `app/Modules/Security/Models/User.php`
* **Relationships Implemented:** `organization()` (`belongsTo` via trait), `businessUnit()`, `department()`, `location()` (`belongsTo`), `userProfile()` (`hasOne`), `userRoles()` (`hasMany`)
* **Traits Used:** `HasApiTokens` (Sanctum), `HasUuid`, `HasAuditFields`, `BelongsToOrganization`

```php
<?php

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Shared\Traits\BelongsToOrganization;
use App\Modules\Governance\Models\BusinessUnit;
use App\Modules\Governance\Models\Department;
use App\Modules\Governance\Models\Location;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasUuid, HasAuditFields, BelongsToOrganization;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'users';

    protected $fillable = [
        'organization_id', 'business_unit_id', 'department_id', 'location_id', 'first_name', 'last_name',
        'email', 'password', 'status', 'last_login_at', 'is_deleted', 'created_by', 'modified_by', 'deleted_by',
    ];

    protected $hidden = [
        'password', 'id', 'organization_id', 'business_unit_id', 'department_id', 'location_id',
    ];

    protected $casts = [
        'last_login_at' => 'datetime', 'is_deleted' => 'boolean', 'created_date' => 'datetime', 'modified_date' => 'datetime', 'deleted_date' => 'datetime',
    ];

    public function businessUnit(): BelongsTo { return $this->belongsTo(BusinessUnit::class, 'business_unit_id', 'id'); }
    public function department(): BelongsTo { return $this->belongsTo(Department::class, 'department_id', 'id'); }
    public function location(): BelongsTo { return $this->belongsTo(Location::class, 'location_id', 'id'); }
    public function userProfile(): HasOne { return $this->hasOne(UserProfile::class, 'user_id', 'id'); }
    public function userRoles(): HasMany { return $this->hasMany(UserRole::class, 'user_id', 'id'); }
}
```

#### 6. UserProfile
* **File Path:** `app/Modules/Security/Models/UserProfile.php`
* **Relationships Implemented:** `user()` (`belongsTo`)
* **Traits Used:** `HasUuid`, `HasAuditFields`

```php
<?php

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasUuid, HasAuditFields;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id', 'profile_photo_url', 'company', 'designation', 'years_of_experience', 'technology_expertise',
        'country', 'state', 'city', 'bio', 'profile_completion_percentage', 'is_deleted', 'created_by', 'modified_by', 'deleted_by',
    ];

    protected $hidden = ['id', 'user_id'];

    protected $casts = [
        'years_of_experience' => 'decimal:2', 'profile_completion_percentage' => 'decimal:2', 'is_deleted' => 'boolean',
        'created_date' => 'datetime', 'modified_date' => 'datetime', 'deleted_date' => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class, 'user_id', 'id'); }
}
```

#### 7. Role
* **File Path:** `app/Modules/Security/Models/Role.php`
* **Relationships Implemented:** `organization()` (`belongsTo`), `userRoles()`, `rolePermissions()` (`hasMany`)
* **Traits Used:** `HasUuid`, `HasAuditFields`

```php
<?php

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use App\Modules\Governance\Models\Organization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasUuid, HasAuditFields;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'roles';

    protected $fillable = [
        'organization_id', 'role_code', 'role_name', 'description', 'is_system_role', 'status', 'is_deleted', 'created_by', 'modified_by', 'deleted_by',
    ];

    protected $hidden = ['id', 'organization_id'];

    protected $casts = [
        'is_system_role' => 'boolean', 'is_deleted' => 'boolean', 'created_date' => 'datetime', 'modified_date' => 'datetime', 'deleted_date' => 'datetime',
    ];

    public function organization(): BelongsTo { return $this->belongsTo(Organization::class, 'organization_id', 'id'); }
    public function userRoles(): HasMany { return $this->hasMany(UserRole::class, 'role_id', 'id'); }
    public function rolePermissions(): HasMany { return $this->hasMany(RolePermission::class, 'role_id', 'id'); }
}
```

#### 8. Permission
* **File Path:** `app/Modules/Security/Models/Permission.php`
* **Relationships Implemented:** `rolePermissions()` (`hasMany`)
* **Traits Used:** `HasUuid`, `HasAuditFields`

```php
<?php

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasAuditFields;
use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Permission extends Model
{
    use HasUuid, HasAuditFields;

    public const DELETED_AT = 'deleted_date';
    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = 'modified_date';

    protected $table = 'permissions';

    protected $fillable = [
        'permission_code', 'module', 'description', 'status', 'is_deleted', 'created_by', 'modified_by', 'deleted_by',
    ];

    protected $hidden = ['id'];

    protected $casts = [
        'is_deleted' => 'boolean', 'created_date' => 'datetime', 'modified_date' => 'datetime', 'deleted_date' => 'datetime',
    ];

    public function rolePermissions(): HasMany { return $this->hasMany(RolePermission::class, 'permission_id', 'id'); }
}
```

#### 9. UserRole
* **File Path:** `app/Modules/Security/Models/UserRole.php`
* **Relationships Implemented:** `user()`, `role()` (`belongsTo`)
* **Traits Used:** `HasUuid`

```php
<?php

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRole extends Model
{
    use HasUuid;

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = null;

    protected $table = 'user_roles';

    protected $fillable = ['user_id', 'role_id', 'created_by'];

    protected $hidden = ['id', 'user_id', 'role_id'];

    protected $casts = ['created_date' => 'datetime'];

    public function user(): BelongsTo { return $this->belongsTo(User::class, 'user_id', 'id'); }
    public function role(): BelongsTo { return $this->belongsTo(Role::class, 'role_id', 'id'); }
}
```

#### 10. RolePermission
* **File Path:** `app/Modules/Security/Models/RolePermission.php`
* **Relationships Implemented:** `role()`, `permission()` (`belongsTo`)
* **Traits Used:** `HasUuid`

```php
<?php

namespace App\Modules\Security\Models;

use App\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasUuid;

    public const CREATED_AT = 'created_date';
    public const UPDATED_AT = null;

    protected $table = 'role_permissions';

    protected $fillable = ['role_id', 'permission_id', 'created_by'];

    protected $hidden = ['id', 'role_id', 'permission_id'];

    protected $casts = ['created_date' => 'datetime'];

    public function role(): BelongsTo { return $this->belongsTo(Role::class, 'role_id', 'id'); }
    public function permission(): BelongsTo { return $this->belongsTo(Permission::class, 'permission_id', 'id'); }
}
```

#### 11. PersonalAccessToken
* **File Path:** `app/Modules/Security/Models/PersonalAccessToken.php`
* **Relationships Implemented:** `tokenable()` (Inherited from Sanctum)
* **Traits Used:** None directly (extends Sanctum model)

```php
<?php

namespace App\Modules\Security\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // Extends standard Sanctum token behavior to explicitly locate within the Security namespace
}
```

## User Review Required
Please review the generated implementation of Phase 3 models. The models and traits strictly adhere to the definitions provided, omitting any business/repository logic. Let me know if you approve this structure!
