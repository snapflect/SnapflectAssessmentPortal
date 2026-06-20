# SNAPFLECT ASSESSMENT PORTAL
## SPRINT 02 EXECUTION PACKAGE v1.0

**Status:** APPROVED FOR EXECUTION  
**Target:** Sprint 02 (Assessment & Engine Development)  

---

## 1. SPRINT OVERVIEW
With the foundational Modular Monolith, Multi-Tenancy, and RBAC security systems securely locked into production readiness during Sprint 01, Sprint 02 shifts exclusively to core business logic. This Sprint aims to construct the highly complex Assessment Definition, Question Bank, and Competency Framework engines. These modules represent the intellectual property creation wing of the platform, requiring absolute precision regarding data integrity, state management (draft vs. published), and immutable version control mechanisms.

## 2. SPRINT OBJECTIVES
* Build out the Assessment taxonomy (Categories, Types, Templates).
* Build out the robust Question Bank taxonomy (Categories, Difficulty, Question Types).
* Establish the Competency Framework engine mapping questions and assessments to granular skills.
* Implement the Blueprint Engine to dynamically structure assessment configurations.
* Implement strict Assessment Versioning and Publication Workflows ensuring historical data integrity.

## 3. BUSINESS GOALS
* Enable organizations to autonomously draft, categorize, and build robust assessment templates.
* Allow HR and Department Managers to map specific assessment items to predefined Job Competency Frameworks.
* Provide an immutable versioning system so published assessments taken by past candidates are never retroactively corrupted by draft edits.
* Establish a flawless publication workflow (Draft -> Review -> Published -> Archived).

## 4. TECHNICAL GOALS
* Strictly inherit and respect the Tenant Isolation and RBAC parameters frozen in Sprint 01.
* Maintain the rigid Domain-Driven layer separation (Controller → Request → DTO → Service → Repository → Model).
* Implement advanced JSON serialization for complex Blueprint mapping structures natively in the database.
* Achieve deep relational efficiency utilizing Laravel eager-loading and N+1 prevention strategies for highly nested Assessment → Blueprint → Question queries.

## 5. MODULES IN SCOPE
* **Assessment Engine:** Definitions, Categories, Types, Templates.
* **Question Bank Engine:** Questions, Categories, Difficulty levels.
* **Competency Engine:** Competencies, Competency Groups.
* **Publishing Engine:** Blueprints, Versioning hooks, Publication state machines.

## 6. MODULES OUT OF SCOPE
* **Candidate Delivery Engine:** (Test taking UI, Timers, Proctoring)
* **Evaluation & Grading Engine:** (Auto-scoring, Manual grading)
* **Analytics & Reporting:** (Dashboards, Exports)
* **Notifications Engine:** (Email/SMS invites)

## 7. DEPENDENCIES
* **Sprint 01 Core:** Full reliance on the established `Governance` (Tenant isolation) and `Security` (RBAC) schemas and policies.
* **Database:** Strict reliance on UUID primary routing and SoftDeletes to maintain assessment histories.

## 8. RISKS
* **Versioning Complexity:** Modifying a deeply nested Blueprint that is tied to a Published Assessment poses data corruption risks. Strict immutable cloning logic must be flawless in the Service layer.
* **Tenant Bleed:** Question Banks may be scoped globally (Platform) or strictly to an Organization. Filtering logic must be bulletproof.
* **Large Payloads:** Blueprint JSON payloads can become massive. The DTO and Request validation layers must handle deep array validations gracefully.

## 9. DELIVERABLES
* Fully generated Database Schema and Migrations for all in-scope modules.
* Eloquent Models with explicit relationships.
* Dedicated Repositories owning all complex query scopes (e.g., `withoutDrafts()`, `byTenant()`).
* 100% pure Service layer orchestration handling the Draft-to-Published state machines.
* Policies handling precise authorization (e.g., Department Managers can only edit Drafts, not Published versions).
* Full suite of DTOs, Requests, Resources, Controllers, and versioned Routes.

## 10. ACCEPTANCE CRITERIA
* [ ] Sprint 01 Architectural Guardrails are perfectly maintained. No rule deviations.
* [ ] A Question can be created, tagged to a Competency, and stored in a Tenant-scoped Category.
* [ ] An Assessment can be drafted, assigned a Blueprint, and structurally validated.
* [ ] Publishing an Assessment generates an immutable `v1.0` state. Modifying it subsequently forces a `v1.1` draft branch.
* [ ] Automated testing natively proves that immutable versions cannot be overwritten.

## 11. SPRINT TIMELINE
To be defined dynamically by velocity, but structurally mapped out in identical phased progression to Sprint 01 to guarantee quality gates at every vertical slice.

## 12. SPRINT PHASES
* **Phase 1 & 2:** Migrations & Seeders
* **Phase 3:** Models & Relationships
* **Phase 4:** Repositories
* **Phase 5:** DTO Layer
* **Phase 6:** Service Layer (State Machines & Versioning Logic)
* **Phase 7:** Policy Layer
* **Phase 8:** Form Request Validation Layer
* **Phase 9:** API Resource Serialization Layer
* **Phase 10:** Orchestration Controllers
* **Phase 11:** Routing Layer
* **Phase 12:** Automated Testing Scaffold

## 13. CURSOR AI EXECUTION PLAN
Execution will exactly mirror the successful playbook of Sprint 01. The AI will be systematically prompted to generate one strict architectural layer at a time (Phase by Phase). A hard STOP condition will be enforced after every phase generation, requiring explicit Architecture Review and Approval from the Lead Architect before moving upward in the stack.

## 14. ARCHITECTURE GUARDRAILS
* **Controllers:** Absolute ban on business logic, queries, and direct model mutations.
* **Services:** Complete ownership of the Versioning logic and DB Transactions.
* **Validation:** Heavy reliance on Form Requests to enforce structural Blueprint payload integrity.
* **Authorization:** Strict enforcement of `authorize()` via Policies. Department Managers cannot override locked versions.

## 15. TESTING STRATEGY
* **Repository Tests:** Focus heavily on custom Eloquent scoping for Draft vs. Published records.
* **Service Tests:** Heavy focus on mocking DB Transactions to prove Version cloning mechanisms work flawlessly without affecting live data.
* **Policy Tests:** Prove that standard users cannot view Draft assessments, and admins cannot alter Published assessments directly.
* **Feature Tests:** Comprehensive coverage mapping out 422 errors on malformed Blueprint JSON payloads.

## 16. EXIT CRITERIA
* 100% of Phase 1-12 milestones generated, reviewed, and approved.
* Architecture Health Score > 95/100.
* Fully green PHPUnit test suite.
* Completion Report compiled and approved.
