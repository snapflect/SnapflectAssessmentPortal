# SNAPFLECT ASSESSMENT PORTAL
## SPRINT 01 – PHASE 1: PROJECT SCAFFOLDING & PLANNING (V2)

**Status:** PENDING REVIEW  
**Scope:** Foundation Phase ONLY (No Code Generation)  
**Technology Stack:** Laravel 12, PHP 8.4+, MySQL 8, Laravel Sanctum, Blade, Bootstrap 5, JS/AJAX  

---

### 1. RECOMMENDED PROJECT FOLDER STRUCTURE
Following the approved architecture and the corrections for the `Shared` folder placement, the Laravel 12 project structure is frozen as follows:

```text
snapflect/
├── app/
│   ├── Core/                 # Core platform traits, abstracts, interfaces
│   ├── Modules/              # Modular Monolith feature areas
│   │   ├── Security/         # Module 01: Auth, Users, Roles, Permissions
│   │   └── Governance/       # Module 02: Organizations, Departments, etc.
│   ├── Shared/               # Shared logic outside of specific modules
│   │   ├── DTOs/
│   │   ├── Enums/
│   │   ├── Traits/
│   │   └── Contracts/
│   ├── Infrastructure/       # External services, integrations, file storage wrappers
│   ├── Providers/            # Service providers (Route, Repository bindings, etc.)
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

### 2. COMPOSER PACKAGE INVENTORY
The following packages are required for Sprint 01:

| Package | Purpose |
|---------|---------|
| `laravel/framework` (v12.*) | Core application framework |
| `laravel/sanctum` | Stateful authentication and API token management |
| `spatie/laravel-permission` | Robust Role-Based Access Control (RBAC) engine. *(Note: Must map to approved schema, not default Spatie schema).* |
| `spatie/laravel-data` (Optional) | For robust Data Transfer Object (DTO) implementations. |

---

### 3. SANCTUM IMPLEMENTATION PLAN
To avoid unnecessary API scaffolding introduced by `install:api`, Sanctum will be explicitly installed and configured:

1. **Installation:** 
   `composer require laravel/sanctum`
2. **Publish Configuration:** 
   `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
3. **Migrate:** 
   `php artisan migrate` (Ensures `personal_access_tokens` table is created)
4. **Configuration (`config/sanctum.php`):**
   - **Stateful Domains:** Configure `SANCTUM_STATEFUL_DOMAINS` to handle local development domains for cookie-based authentication.
5. **Middleware:** 
   - Ensure `EnsureFrontendRequestsAreStateful` middleware is active in the `api` middleware group to support Blade/AJAX workflows.

---

### 4. MODULE STRUCTURE
Each module inside `app/Modules/` will follow a strict, self-contained architecture:

```text
ModuleName/
├── Controllers/
├── Requests/
├── DTOs/
├── Services/
├── Repositories/
│   ├── Interfaces/
│   └── Eloquent/
├── Policies/
├── Resources/
├── Events/
└── Listeners/
```

---

### 5. NAMESPACE STRUCTURE
* **Core Classes:** `App\Core\...`
* **Shared Logic:** `App\Shared\...`
* **Security Module:** `App\Modules\Security\...`
* **Governance Module:** `App\Modules\Governance\...`

---

### 6. ENVIRONMENT VARIABLE INVENTORY
Variables required to be configured in `.env` for Sprint 01:

```env
APP_NAME="Snapflect Assessment Portal"
APP_ENV=local
APP_URL=http://localhost

# Database Configuration (MySQL 8)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=snapflect
DB_USERNAME=root
DB_PASSWORD=

# Session & Authentication
SESSION_DRIVER=database
SESSION_LIFETIME=120
SANCTUM_STATEFUL_DOMAINS="localhost,127.0.0.1"
```

---

### 7. DATABASE MIGRATION EXECUTION SEQUENCE
To prevent foreign key constraint failures (specifically `departments` depending on `business_units`), the migration execution order is strictly defined as:

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
12. **`create_user_profiles_table`** *(Status: VALIDATED. Verified against 001_SECURITY_SCHEMA Part 1. It is a mandatory table in the approved schema).*
13. `create_password_reset_tokens_table` (Security)

> [!WARNING]
> **Spatie Mapping:** We will utilize the Spatie authorization engine, but we will strictly MAP it to our custom schema (`roles`, `permissions`, `role_permissions`, `user_roles`). We will NOT execute the default Spatie migration which would replace or conflict with the approved database design.

---

### 8. SEEDER STRATEGY
A master `DatabaseSeeder` will trigger module-specific seeders in dependency order:

1. **`OrganizationSeeder`**: Creates the default platform organization (`ORG-001`), Business Unit, Department, and Location.
2. **`RoleAndPermissionSeeder`**: 
   - Maps to our custom schema using Spatie's engine.
   - Creates the 10 defined roles.
   - Creates foundational permissions for Security and Governance.
3. **`UserSeeder`**: Creates an initial `Super Administrator` mapped to `ORG-001`.

---

### 9. FILE CREATION SEQUENCE
When transitioning to code generation, files will be created in this order per module:

1. **Database:** Migrations → Seeders
2. **Domain Layer:** Models → Repository Interfaces
3. **Infrastructure Layer:** Eloquent Repositories → RepositoryServiceProvider Bindings
4. **Application Layer:** DTOs → Services
5. **Security Layer:** Policies → Form Requests
6. **Presentation Layer:** API Resources → API Controllers → Web Controllers
7. **Frontend Layer:** Blade Views → JS/AJAX logic

---

### 10. RISKS AND ASSUMPTIONS

| Category | Risk/Assumption | Mitigation/Note |
|----------|-----------------|-----------------|
| **Testing Strategy** | **MySQL Test Database:** Using SQLite causes critical feature mismatches (JSON, Indexes, FKs, Collations). | The testing strategy mandates using a separate MySQL Test Database that mirrors the Hostinger production environment. |
| **Spatie Mapping** | Risk: Misconfiguration of Spatie model mapping could lead to runtime RBAC failures. | Override `permission.php` config and custom Models (`App\Modules\Security\Models\Role`) to explicitly define our custom table names. |
| **User Profiles** | Assumption: The separation of `users` and `user_profiles` requires careful service-layer transaction handling. | Use DB transactions in `UserService` to ensure both tables insert successfully or fail together. |

---

## User Review Required
Please review `implementation_plan_v2.md` to ensure all 6 corrections have been addressed satisfactorily. Awaiting your approval.
