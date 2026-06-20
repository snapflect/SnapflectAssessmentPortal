# SNAPFLECT ASSESSMENT PORTAL
## SPRINT 01 – PHASE 1: PROJECT SCAFFOLDING & PLANNING

**Status:** PENDING REVIEW  
**Scope:** Foundation Phase ONLY (No Code Generation)  
**Technology Stack:** Laravel 12, PHP 8.4+, MySQL 8, Laravel Sanctum, Blade, Bootstrap 5, JS/AJAX  

---

### 1. RECOMMENDED PROJECT FOLDER STRUCTURE
To support the Modular Monolith architecture defined in `013` and `019`, the Laravel 12 project structure will be organized as follows:

```text
snapflect/
├── app/
│   ├── Core/                 # Core platform traits, abstracts, interfaces
│   ├── Modules/              # Modular Monolith feature areas
│   │   ├── Security/         # Module 01: Auth, Users, Roles, Permissions
│   │   ├── Governance/       # Module 02: Organizations, Departments, Settings
│   │   └── Shared/           # Shared DTOs, Enums, helpers across modules
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
│   │   ├── layouts/          # Base layouts (app, auth, admin)
│   │   ├── components/       # Reusable UI components
│   │   ├── auth/             # Login, Forgot Password
│   │   └── admin/            # Dashboard, Users, Orgs, Roles
│   ├── js/                   # Vanilla JS / AJAX logic
│   └── css/                  # Custom CSS overriding Bootstrap
├── routes/
│   ├── api.php               # API endpoints (versioned)
│   ├── web.php               # Web endpoints (Blade rendering)
│   └── console.php
└── tests/
    ├── Feature/
    └── Unit/
```

---

### 2. COMPOSER PACKAGE INVENTORY
The following packages are required for Sprint 01 based on the architecture constraints:

| Package | Purpose |
|---------|---------|
| `laravel/framework` (v12.*) | Core application framework |
| `laravel/sanctum` | Stateful authentication and API token management |
| `spatie/laravel-permission` | Robust Role-Based Access Control (RBAC) implementation |
| `laravel/ui` (or vanilla setup) | To quickly scaffold basic Blade/Bootstrap authentication scaffolding if desired, though we will build custom views. |
| `spatie/laravel-data` (Optional but Recommended) | For robust Data Transfer Object (DTO) implementations across layers. |

---

### 3. SANCTUM IMPLEMENTATION PLAN
Following `013B_AUTHENTICATION_ARCHITECTURE_AMENDMENT`:

1. **Installation:** Run `php artisan install:api` to scaffold Sanctum, bypassing passport/JWT.
2. **Configuration (`config/sanctum.php`):**
   - **Stateful Domains:** Configure `SANCTUM_STATEFUL_DOMAINS` to include the local development domains to allow SPA-style cookie authentication for AJAX calls originating from Blade views.
   - **Token Expiration:** Set token expiration limit (if using API tokens).
3. **Middleware:** 
   - Apply `auth:sanctum` middleware to all protected API routes.
   - Ensure `EnsureFrontendRequestsAreStateful` middleware is active in the `api` middleware group.
4. **Session Strategy:**
   - For Blade views, standard Laravel session authentication will work seamlessly alongside Sanctum's CSRF cookie verification for any client-side AJAX requests.

---

### 4. MODULE STRUCTURE
Each module inside `app/Modules/` will follow a strict, self-contained architecture as per `018`:

```text
ModuleName/
├── Controllers/
│   ├── Web/                  # Web controllers rendering Blade views
│   └── Api/                  # API controllers returning JSON
├── Requests/                 # FormRequests for input validation
├── DTOs/                     # Request and Response DTOs
├── Services/                 # Business logic and transaction orchestration
├── Repositories/
│   ├── Interfaces/           # Contracts
│   └── Eloquent/             # MySQL Implementations
├── Policies/                 # Authorization logic (spatie/laravel-permission)
├── Resources/                # API JsonResources
├── Events/                   # Domain events
└── Listeners/                # Event listeners
```

---

### 5. NAMESPACE STRUCTURE
Following `019_LARAVEL_FOLDER_STRUCTURE_AND_CODING_STANDARDS`:

* **Core Base Classes:** `App\Core\...`
* **Security Module:** 
  - `App\Modules\Security\Controllers\Api\...`
  - `App\Modules\Security\Services\...`
  - `App\Modules\Security\Repositories\Eloquent\...`
* **Governance Module:**
  - `App\Modules\Governance\Controllers\Web\...`
  - `App\Modules\Governance\Services\...`

---

### 6. ENVIRONMENT VARIABLE INVENTORY
Variables required to be configured in `.env` for Sprint 01:

```env
APP_NAME="Snapflect Assessment Portal"
APP_ENV=local
APP_URL=http://localhost

# Database Configuration
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

# Queue & Mail (Sprint 01 placeholders)
QUEUE_CONNECTION=database
MAIL_MAILER=log
```

---

### 7. DATABASE MIGRATION EXECUTION SEQUENCE
To prevent foreign key constraint failures, migrations must be executed in this exact sequence:

1. `create_sessions_table` (Laravel Default)
2. `create_personal_access_tokens_table` (Sanctum Default)
3. `create_organizations_table` (Governance)
4. `create_departments_table` (Governance)
5. `create_business_units_table` (Governance)
6. `create_locations_table` (Governance)
7. `create_users_table` (Security - *must come after organizations for FK*)
8. `create_permission_tables` (Security - Spatie Default for Roles/Permissions/Role_Permissions/User_Roles)
9. `create_user_profiles_table` (Security)
10. `create_password_reset_tokens_table` (Security)

> [!IMPORTANT]  
> Migration 012 `create_refresh_tokens_table` has been explicitly removed as per `022A_MVP_EXECUTION_AMENDMENT`.

---

### 8. SEEDER STRATEGY
A master `DatabaseSeeder` will trigger module-specific seeders in dependency order:

1. **`OrganizationSeeder`**: Creates the default platform organization (`ORG-001`).
2. **`RoleAndPermissionSeeder`**: 
   - Creates the 10 defined roles (Platform Administrator, Assessment Manager, etc.).
   - Creates the foundational permissions for Security and Governance (`User.View`, `Organization.Edit`, etc.).
   - Maps permissions to roles.
3. **`UserSeeder`**: Creates an initial `Super Administrator` mapped to `ORG-001`.

---

### 9. FILE CREATION SEQUENCE
When transitioning to code generation (Phase 2), files will be created in this order per module to satisfy dependency inversion:

1. **Database:** Migrations → Seeders
2. **Domain Layer:** Models → Repository Interfaces
3. **Infrastructure Layer:** Eloquent Repositories → RepositoryServiceProvider Bindings
4. **Application Layer:** DTOs → Services
5. **Security Layer:** Policies → Form Requests
6. **Presentation Layer:** API Resources → API Controllers → Web Controllers → Route definitions
7. **Frontend Layer:** Blade Layouts → Blade Views → Vanilla JS/AJAX logic
8. **Validation:** Feature Tests → Unit Tests

---

### 10. RISKS AND ASSUMPTIONS

| Category | Risk/Assumption | Mitigation/Note |
|----------|-----------------|-----------------|
| **Authentication** | Assumption: SPA/AJAX calls from Blade views will rely on cookie-based Sanctum authentication. | Ensure `axios` or standard `fetch` is configured to include credentials (`withCredentials: true`) and X-XSRF-TOKEN headers. |
| **Spatie RBAC** | Risk: Spatie generates its own migration sequence which might conflict with custom user table definitions. | Publish Spatie migrations immediately after creating the Users table and carefully review foreign keys. |
| **Asset Compilation** | Assumption: Vite will be used to compile custom CSS and JS alongside Bootstrap 5. | Setup `vite.config.js` to handle Bootstrap SCSS and custom app JS bundling efficiently. |
| **Testing** | Risk: Complex repository mocking might slow down test creation. | Focus on Feature tests using an in-memory SQLite database (or dedicated testing DB) to test the vertical slice first, as mandated by the 80% coverage rule. |

---

## User Review Required
Please review the scaffolding plan above. Once you approve this structure, we can proceed to generate the actual codebase in the required sequences.
