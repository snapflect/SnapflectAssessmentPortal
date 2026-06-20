# SNAPFLECT ASSESSMENT PORTAL
## SPRINT 01 - PHASE 7 POLICIES REVIEW

**Status:** PENDING REVIEW  
**Scope:** Authorization Layer ONLY (Policies)  

---

### **SUMMARY OF POLICIES GENERATED**

I have successfully generated 7 strict Laravel Policies isolating all Role-Based Access Control (RBAC) and Multi-Tenancy authorization logic. These policies use Laravel's standard `HandlesAuthorization` trait and are fully decoupled from Business and Database logic.

---

### **GLOBAL RBAC INTERCEPTION**

**Platform Admin Override:**
Every single policy implements the `before()` method to intercept authorization checks globally. If the user possesses the `PLATFORM_ADMIN` role code, they automatically bypass tenant checks and are granted full systemic access.
```php
public function before(User $user, string $ability): ?bool
{
    if ($user->roles->contains('role_code', 'PLATFORM_ADMIN')) {
        return true;
    }
    return null; // Fall through to specific tenant checks
}
```

---

### **GOVERNANCE MODULE POLICIES**

#### 1. OrganizationPolicy
* **Location:** `app/Modules/Governance/Policies/`
* **Models:** `User`, `Organization`
* **Authorization Rules:**
  * `create`, `delete`: Strictly `PLATFORM_ADMIN` only.
  * `update`: `ORG_ADMIN` can update if `$user->organization_id === $organization->id`.
  * `view`: All internal users can view their own mapped Organization.

#### 2. BusinessUnitPolicy
* **Location:** `app/Modules/Governance/Policies/`
* **Models:** `User`, `BusinessUnit`
* **Authorization Rules:**
  * `create`, `update`, `delete`: `ORG_ADMIN` restricted to their specific `organization_id` boundary.
  * `view`: Internal users bounded to the BU's Organization.

#### 3. DepartmentPolicy
* **Location:** `app/Modules/Governance/Policies/`
* **Models:** `User`, `Department`
* **Authorization Rules:**
  * `create`, `delete`: `ORG_ADMIN` restricted to their Organization boundary.
  * `update`: Granted to `ORG_ADMIN` bounded by Organization, OR `DEPT_MANAGER` bounded explicitly to the specific `$department->id`.

#### 4. LocationPolicy
* **Location:** `app/Modules/Governance/Policies/`
* **Models:** `User`, `Location`
* **Authorization Rules:** Maps identical tenant boundaries as `BusinessUnitPolicy` (Org Admin scoped).

---

### **SECURITY MODULE POLICIES**

#### 5. UserPolicy
* **Location:** `app/Modules/Security/Policies/`
* **Models:** `User`, `User` (Model)
* **Authorization Rules:**
  * `create`: Requires `ORG_ADMIN` or `DEPT_MANAGER`.
  * `update`, `view`: Candidates/Users have access to their OWN profile (`$user->id === $model->id`). `ORG_ADMIN` can modify anyone in their Organization. `DEPT_MANAGER` can modify anyone assigned to their specific Department.
  * `delete`: `ORG_ADMIN` (Org scoped) or `DEPT_MANAGER` (Dept scoped). Users cannot delete themselves.

#### 6. RolePolicy
* **Location:** `app/Modules/Security/Policies/`
* **Models:** `User`, `Role`
* **Authorization Rules:**
  * System/Global roles (`is_system_role === true` or `organization_id === null`) are strictly protected from modification or deletion by anyone other than `PLATFORM_ADMIN`.
  * `ORG_ADMIN` can create, update, and delete custom roles explicitly mapped to their `$user->organization_id`.

#### 7. PermissionPolicy
* **Location:** `app/Modules/Security/Policies/`
* **Models:** `User`, `Permission`
* **Authorization Rules:**
  * Permissions are hardcoded system primitives. Therefore, `create`, `update`, `delete` are entirely locked down to `PLATFORM_ADMIN`.

---

### **ARCHITECTURAL RULES APPLIED**

1. **Authorization Isolation:** Policies ONLY return booleans. They execute zero business logic, throw zero exceptions, and execute zero database transactions. 
2. **Tenant Matrix Adherence:** The implementation flawlessly maps the requested multi-tenancy rules (Platform Admin = All, Org Admin = Org Scoped, Dept Manager = Dept Scoped, Candidate = Self Scoped).
3. **Laravel Standardization:** Fully compliant with Laravel's `viewAny`, `view`, `create`, `update`, `delete`, `restore`, and `forceDelete` method signatures. `strict_types=1` enforced.

## User Review Required
Please review the generated implementation of Phase 7 Policies. The codebase strictly governs the authorization matrix. Let me know your feedback so we can proceed!
