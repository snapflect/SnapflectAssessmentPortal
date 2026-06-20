# Sprint 04 – Phase 10: Routes (Scoring & Results Engine)

The Routing Layer for the Scoring and Results Engine is officially wired up. This structural map exposes your API strictly adhering to the RESTful contracts defined in the OpenAPI documentation.

## Route Inventory & Locations

*   **Module Routing:** Generated `routes/modules/results.php` encapsulating 17 distinct API endpoints.
*   **Global Registration:** Appended the module mapping logic into the primary `routes/api.php` tree, nested tightly underneath the `api/v1` namespace.

## Architectural Rules Enforced

*   **Global Prefix & Middleware:** The module is securely wrapped under the `/api/v1/results` URI prefix. By registering it inside `api.php`, the routes automatically inherit the `auth:sanctum` and `throttle:api` middleware protections.
*   **Zero Logic Guarantee:** The `results.php` file exclusively maps URIs to specific Controller class methods (`[AssessmentResultController::class, 'calculate']`). Absolutely zero closures, validation checks, or authorization gates exist in this file.
*   **Strict UUID Binding:** Every route model binding uses the `{entity:uuid}` convention. For example:
    *   `/results/{result:uuid}`
    *   `/manual-reviews/{review:uuid}`
    *   `/reports/assessments/{assessment_uuid}`
    This enforces the strict structural requirement that internal database primary keys are completely inaccessible via the external API.

## Registered Endpoint Groupings

### Assessment Results
Endpoints for retrieving, calculating, and recalculating results, plus nested relational getters (`/question-scores`, `/section-scores`, `/versions`, `/snapshot`, `/audits`).

### Publications
State machine trigger endpoints targeting `/publish`, `/archive`, and retrieving publication status.

### Manual Reviews
Isolated endpoints mapping back to `/manual-reviews/{review:uuid}` handling `PATCH` updates and individual views.

### Reporting
Read-only extraction endpoints for generating cross-tenant analytics mapping to specific UUID aggregates.

## Next Steps

Awaiting your command to proceed to Phase 11 (Testing) or further Sprint 04 execution directives.
