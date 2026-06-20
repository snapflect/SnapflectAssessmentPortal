# SNAPFLECT ASSESSMENT PORTAL
## SPRINT 01 - PHASE 8 VALIDATION REQUESTS REVIEW

**Status:** PENDING REVIEW  
**Scope:** HTTP Form Validation Layer ONLY (Requests)  

---

### **SUMMARY OF REQUESTS GENERATED**

I have successfully generated 14 strict Laravel `FormRequest` classes covering both the `Governance` and `Security` modules. These classes act as the absolute first line of structural defense against invalid payloads.

---

### **ARCHITECTURAL RULES APPLIED**

1. **Pure Validation Isolation:** These requests *only* validate structure. There are zero database existence checks, zero business logic computations, and zero `auth()` evaluations.
2. **Authorization Deferred:** Every single request implements `public function authorize(): bool { return true; }`. Authorization is explicitly delegated downstream to the Phase 7 Policies.
3. **Immutability of Keys:** For `Update*` requests, highly immutable/identifying keys like `organization_code` and `role_code` are entirely omitted from the validation payload, preventing them from bleeding into the DTO layer.

---

### **GOVERNANCE MODULE REQUESTS**

#### 1. Organization Requests
* **Location:** `app/Modules/Governance/Requests/`
* **Create Validation:** Strictly enforces `organization_code` (max 50) and `organization_name` (max 255).
* **Update Validation:** Safely sets `organization_name` to `sometimes|required`, allowing partial payloads while blocking empty string submissions.

#### 2. BusinessUnit Requests
* **Location:** `app/Modules/Governance/Requests/`
* **Create Validation:** Demands `organization_id` (integer) to establish the tenant bond, along with standard codes/names.
* **Update Validation:** `business_unit_name` and `status` explicitly mapped as safe-to-update fields.

#### 3. Department Requests
* **Location:** `app/Modules/Governance/Requests/`
* **Create Validation:** Demands `organization_id`. `business_unit_id` is validated as a nullable integer to support flat architectures if necessary.
* **Update Validation:** Validates `department_name` and potential reassignment of `business_unit_id`.

#### 4. Location Requests
* **Location:** `app/Modules/Governance/Requests/`
* **Create Validation:** Validates `organization_id` alongside geo-fields (`address`, `city`, `state`, `country` all string-capped where appropriate).

---

### **SECURITY MODULE REQUESTS**

#### 5. User Requests
* **Location:** `app/Modules/Security/Requests/`
* **Create Validation:** Extremely strict. Forces `organization_id`, `first_name`, `last_name`, and a `min:12` length bound on the `password`.
* **Update Validation:** Protects `organization_id` from being altered by omitting it. Allows `sometimes|required` structural patching of names and emails.

#### 6. Role Requests
* **Location:** `app/Modules/Security/Requests/`
* **Create Validation:** `role_code` and `role_name` enforced. `organization_id` is permitted as a nullable integer to safely construct global/system roles via the platform admin.
* **Update Validation:** Protects `role_code`. Exposes `role_name`, `description`, and `status`.

#### 7. Permission Requests
* **Location:** `app/Modules/Security/Requests/`
* **Create Validation:** Binds `permission_code` and `module`.
* **Update Validation:** Locks `permission_code`, exposing `module` and `description` for refinement.

---

### **STANDARDS AND LOCALIZATION**

* **Messages:** `public function messages()` implemented on every request to provide human-readable API error rejection strings.
* **Attributes:** `public function attributes()` maps payload keys (e.g., `business_unit_id`) to clean phrasing (e.g., "business unit") so Laravel's native validation strings output professionally to the frontend.
* **Typing:** `declare(strict_types=1);` and full method type-hinting implemented globally.

## User Review Required
Please review the generated implementation of Phase 8 Validation Requests. The structural HTTP defense layer is now fully mapped. Let me know your feedback so we can proceed!
