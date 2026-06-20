# SNAPFLECT ASSESSMENT PORTAL
## SPRINT 01 – PHASE 1: PROJECT SCAFFOLDING & PLANNING (V3)

**Status:** PENDING FINAL REVIEW  
**Scope:** Foundation Phase ONLY (No Code Generation)  
**Technology Stack:** Laravel 12, PHP 8.4+, MySQL 8, Laravel Sanctum, Blade, Bootstrap 5, JS/AJAX  

---

### 1. RECOMMENDED PROJECT FOLDER STRUCTURE
Following the approved architecture and the addition of Module Service Providers, the Laravel 12 project structure is frozen as follows:

```text
snapflect/
├── app/
│   ├── Core/                 # Core platform traits, abstracts, interfaces
│   ├── Modules/              # Modular Monolith feature areas
│   │   ├── Security/         # Module 01: Auth, Users, Roles, Permissions
│   │   │   └── Providers/    # -> SecurityServiceProvider
│   │   └── Governance/       # Module 02: Organizations, Departments, etc.
│   │       └── Providers/    # -> GovernanceServiceProvider
│   ├── Shared/               # Shared logic outside of specific modules
│   │   ├── DTOs/
│   │   ├── Enums/
│   │   ├── Traits/
│   │   └── Contracts/
│   ├── Infrastructure/       # External services, integrations, file storage wrappers
│   ├── Providers/            # Global service providers
│   └── Exceptions/           # Global exception handler
├── bootstrap/
├── config/
├── database/
│   ├── migrations/           # Ordered database migrations
│   ├── seeders/              # Master seeder and module seeders
│   └── factories/            # Test data factories
├── resources/
│   ├── views/                # Blade Templates
│   └── js/                   # Vanilla JS / AJAX logic
├── routes/
│   ├── api.php               # API endpoints (versioned)
│   └── web.php               # Web endpoints (Blade rendering)
└── tests/
    ├── Feature/
    └── Unit/
```

---

### 2. MODULE SERVICE PROVIDERS
Every module will encapsulate its own bindings to maintain strict separation of concerns.
* **`SecurityServiceProvider.php`**: Registers Repository bindings (e.g., `UserRepositoryInterface` to `UserRepository`), registers Policies (e.g., `UserPolicy`), and maps Events to Listeners for the Security domain.
* **`GovernanceServiceProvider.php`**: Registers Repository bindings, Policies, and Events for the Governance domain.

---

### 3. COMPOSER PACKAGE INVENTORY
The following packages are required for Sprint 01:

| Package | Purpose |
|---------|---------|
| `laravel/framework` (v12.*) | Core application framework |
| `laravel/sanctum` | Stateful authentication and API token management |
| `spatie/laravel-data` (Optional) | For robust Data Transfer Object (DTO) implementations. |

> [!IMPORTANT]
> **Spatie Permission Removed:** `spatie/laravel-permission` is completely removed. We will build a **Custom RBAC Engine** leveraging Laravel Policies and Gates natively mapped to our custom schema, ensuring better multi-tenancy, custom permission matrices, and organization/department scoping.

---

### 4. UUID STRATEGY (FROZEN)
Every business table must follow this strict primary key and reference strategy:

* **Internal PK (`id`):** Must be a `BIGINT UNSIGNED AUTO_INCREMENT`. Used purely for high-speed internal database joins and indexing. Never exposed to the API.
* **External Reference (`uuid`):** Must be a `CHAR(36)` UUID (typically UUIDv4). This is the only identifier exposed to the frontend, API responses, and external systems.

*Example Migration snippet:*
```php
$table->id(); // BIGINT UNSIGNED AUTO_INCREMENT
$table->uuid('uuid')->unique();
```

---

### 5. SANCTUM IMPLEMENTATION PLAN
1. **Installation:** `composer require laravel/sanctum`
2. **Publish Configuration:** `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
3. **Migrate:** `php artisan migrate` (Ensures `personal_access_tokens` table is created)
4. **Configuration (`config/sanctum.php`):** Configure `SANCTUM_STATEFUL_DOMAINS` to handle local development domains for cookie-based authentication.
5. **Middleware:** Ensure `EnsureFrontendRequestsAreStateful` middleware is active in the `api` middleware group to support Blade/AJAX workflows.

---

### 6. CUSTOM RBAC ENGINE
Instead of relying on a package, the custom RBAC engine will be built around:

* **Models:** `Role`, `Permission`, `RolePermission`, `UserRole`
* **Authorization:** Standard Laravel `Gate::define()` and Model Policies (`UserPolicy`, `RolePolicy`, `OrganizationPolicy`).
* **Caching:** We will implement a custom caching layer for user permissions to prevent N+1 database queries on every request.

---

### 7. DATABASE MIGRATION EXECUTION SEQUENCE
The migration execution order is strictly defined to prevent foreign key failures:

1. `create_sessions_table` (Laravel Default)
2. `create_personal_access_tokens_table` (Sanctum Default)
3. **`create_organizations_table`** (Governance)
4. **`create_business_units_table`** (Governance)
5. **`create_departments_table`** (Governance - depends on business_units)
6. **`create_locations_table`** (Governance)
7. **`create_users_table`** (Security - depends on organizations)
8. **`create_roles_table`** (Security)
9. **`create_permissions_table`** (Security)
10. **`create_role_permissions_table`** (Security)
11. **`create_user_roles_table`** (Security)
12. **`create_user_profiles_table`** (Security)
13. `create_password_reset_tokens_table` (Security)

---

### 8. SEEDER STRATEGY
A master `DatabaseSeeder` will trigger module-specific seeders in dependency order:

1. **`OrganizationSeeder`**: Creates the default platform organization (`ORG-001`), Business Unit, Department, and Location.
2. **`CustomRbacSeeder`**: 
   - Creates the 10 defined roles within our custom schema.
   - Creates foundational permissions.
   - Populates `role_permissions` mapping table.
3. **`UserSeeder`**: Creates an initial `Super Administrator` mapped to `ORG-001` and assigns the Super Administrator role via the `user_roles` table.

---

### 9. FILE CREATION SEQUENCE (CODE GENERATION PHASE)
1. **Database:** Migrations → Seeders
2. **Domain Layer:** Models → Repository Interfaces
3. **Infrastructure Layer:** Eloquent Repositories
4. **Service Providers:** Module-specific Service Providers (`SecurityServiceProvider`, `GovernanceServiceProvider`) → Register Bindings
5. **Application Layer:** DTOs → Services
6. **Security Layer:** Policies → Custom Gates → Form Requests
7. **Presentation Layer:** API Resources → API Controllers → Web Controllers
8. **Frontend Layer:** Blade Views → JS/AJAX logic

---

### 10. RISKS AND ASSUMPTIONS

| Category | Risk/Assumption | Mitigation/Note |
|----------|-----------------|-----------------|
| **Testing Strategy** | **MySQL Test Database:** Using SQLite causes critical feature mismatches (JSON, Indexes, FKs, Collations). | The testing strategy mandates using a separate MySQL Test Database that mirrors the Hostinger production environment. |
| **Custom RBAC** | Risk: Rolling a custom RBAC engine might lead to performance bottlenecks if permissions aren't cached properly. | Implement a robust caching mechanism inside the `SecurityServiceProvider` or a dedicated `PermissionCacheService` to store user permission arrays in memory/Redis per session. |

---

## User Review Required
Please review `implementation_plan_v3.md`. All final recommendations have been explicitly incorporated. Once you approve, we are fully ready to begin Phase 2: Database Migration & Schema implementation.
