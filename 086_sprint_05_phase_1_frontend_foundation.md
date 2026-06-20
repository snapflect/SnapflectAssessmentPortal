# Sprint 05 – Phase 1: Frontend Foundation

The Angular 20 Frontend Architecture for the Snapflect Assessment Portal has been successfully scaffolded. This establishes the strict boilerplate environment necessary to drive the SPA without feature logic contamination.

## Directory Structure
The workspace `snapflect-frontend/src` has been initialized with the following strictly defined boundaries:
*   `app/core/` (Singletons, Interceptors, Guards, API Services)
*   `app/shared/` (Models, Enums, Stores, Mappers, Shared Components)
*   `app/layout/` (Application Shell, Sidebars)
*   `app/features/` (Lazy-loaded Feature Modules)
*   `environments/` (Deployment configuration variables)

## Generated Assets

### Interceptor Strategy (`app/core/interceptors/`)
*   `auth.interceptor.ts`: Attaches `Bearer` tokens dynamically extracted from the `AuthStore` Signal.
*   `error.interceptor.ts`: Centralizes global HTTP error trapping via RxJS.
*   `loading.interceptor.ts`: Manages global XHR loading states using `finalize()`.

### Guard Strategy (`app/core/guards/`)
Implemented `CanActivateFn` functional guards mapping to the Signal Stores:
*   `auth.guard.ts`
*   `guest.guard.ts`
*   `role.guard.ts`
*   `permission.guard.ts`
*   `tenant.guard.ts`

### Signal Store Strategy (`app/shared/stores/`)
*   `auth.store.ts`
*   `user.store.ts`
*   `navigation.store.ts`
**Note:** Built entirely natively utilizing Angular 20 `signal()` and `computed()`. Third-party state management layers (NgRx) are strictly forbidden per the execution package.

### API Services (`app/core/api/`)
*   `base-api.service.ts`: Abstraction containing injected `HttpClient` and dynamically bound `environment.apiUrl`.
*   `auth-api.service.ts`: Targeted API mapping for login/logout isolated from UI components.

### Shared Components (`app/shared/components/`)
Configured strictly as `standalone: true`:
*   `AppLoaderComponent`
*   `AppPageHeaderComponent`
*   `AppEmptyStateComponent`

### Environment Configuration (`environments/`)
*   `environment.ts` (dev targeting `localhost:8000/api/v1`)
*   `environment.prod.ts` (prod targeting `api.snapflect.com/v1`)

### Routing Strategy (`app/app.routes.ts`)
Established foundational `Routes` mapping defining the lazy-loading boundaries (Auth, Dashboard, Assessments, Results) and protecting them with the functional `authGuard` and `guestGuard` pipelines.

## Next Steps
Awaiting your command to proceed to Phase 2 or further Sprint 05 execution directives.
