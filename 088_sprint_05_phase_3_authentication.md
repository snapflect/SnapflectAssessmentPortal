# Sprint 05 – Phase 3: Authentication

The Authentication feature module has been successfully integrated into the Angular architecture. This module strictly isolates session management, identity mapping, and secure state transitions behind the `AuthFacade`.

## Auth Module Inventory (`src/app/features/auth/`)

### Pages Scaffolded
*   `LoginPageComponent`
*   `ForgotPasswordPageComponent`
*   `ResetPasswordPageComponent`
*   `ProfilePageComponent`
*   `ChangePasswordPageComponent`

### Form Components Scaffolded
*   `LoginFormComponent`: Implements strictly typed `FormBuilder` (nonNullable) with Material Input mapping.
*   `ForgotPasswordFormComponent`
*   `ResetPasswordFormComponent`
*   `ProfileFormComponent`
*   `ChangePasswordFormComponent`

### API Integration & Data Modeling
*   `AuthApiService`: Bound correctly to `/api/v1/auth/login`, `/auth/logout`, `/auth/me`, and `/auth/change-password`.
*   **Models:** Explicitly defined `LoginRequestModel`, `LoginResponseModel`, `AuthenticatedUserModel`, and `ChangePasswordModel` to enforce compile-time strictness.
*   `UserMapper`: Safely marshals the backend API schema (`organization_id`) into the frontend's decoupled Signal state (`tenantId`).

### The Facade Strategy (`auth.facade.ts`)
The `AuthFacade` acts as the single source of truth for the entire application. **Components are strictly barred from injecting the `AuthApiService` or manipulating the stores directly.**
*   **Login Flow:** Emits credentials → calls API → stores `access_token` → sets `UserProfile` → natively navigates to `/dashboard`.
*   **Restore Session Flow:** Invokes `/auth/me` on bootstrap to rehydrate the `UserStore` silently.
*   **Logout Flow:** Dispatches the backend invalidation, clears both Signal stores locally, and forces a redirect back to `/auth/login`.

### State Management Enhancements
The `AuthStore` and `UserStore` (from Phase 1) have been permanently wired to `sessionStorage`. `this._token` exists as a native Angular `signal()`, automatically updating any active `computed()` dependencies like `isAuthenticated` across the application lifecycle without relying on NgRx boilerplate.

### Routing Map (`auth.routes.ts`)
Established lazy-loaded configuration pointing to:
*   `/auth/login`
*   `/auth/forgot-password`
*   `/auth/reset-password`
*   `/auth/profile`
*   `/auth/change-password`

## Security Compliance
*   **Token Isolation:** The `AuthInterceptor` (created in Phase 1) now actively extracts the hydrated JWT directly from the `AuthStore` Signal logic.
*   **Form Vulnerabilities:** Native Angular Material validation (`Validators.required`, `Validators.email`) protects the `LoginFormComponent` button state.

## Next Steps
Awaiting your command to proceed to Phase 4 or further Sprint 05 execution directives.
