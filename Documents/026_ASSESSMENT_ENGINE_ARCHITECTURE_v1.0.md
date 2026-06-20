# SNAPFLECT ASSESSMENT PORTAL
## ASSESSMENT ENGINE ARCHITECTURE v1.0

**Status:** APPROVED FOR PLANNING  
**Date:** June 2026  
**Scope:** Sprint 02 Architecture Baseline  

---

## 1. EXECUTIVE SUMMARY
The Assessment Engine forms the core intellectual property and configuration wing of the Snapflect Assessment Portal. This architecture document defines the Domain-Driven structure required to author, map, version, and publish complex assessments natively aligned to granular competency frameworks. By enforcing immutable version control and strict state transitions, the engine guarantees that active or completed candidate sessions are eternally protected from retroactive authoring modifications.

## 2. ARCHITECTURE GOALS
* **Absolute Immutability:** Published assessments and their relational trees (questions, blueprints) must be locked. Any modification forces a new version branch.
* **Complex Mapping:** Native integration between specific questions and defined Job Competencies.
* **High Performance:** Deep nested structures (Assessment -> Blueprint -> Sections -> Questions) must serialize efficiently without triggering N+1 query collapse.
* **Strict Tenancy:** Question Banks and Assessments must be fiercely isolated to their respective organizational domains.

## 3. ASSESSMENT DOMAIN MODEL
The domain is partitioned into three core pillars:
1. **The Item Bank:** Raw primitives (Questions, Options, Competencies).
2. **The Constructor:** The structural scaffolding (Blueprints, Sections).
3. **The Deliverable:** The orchestrated final product (Assessments, Templates, Categories).

## 4. ASSESSMENT LIFECYCLE
The lifecycle is rigidly linear:
`Creation` → `Authoring (Drafting)` → `Review Submission` → `Publication (Immutable)` → `Archival / Retirement`.
If an author needs to alter a `Published` assessment, a `Clone` operation triggers, returning a deep copy of the asset back to the `Authoring` phase as a new version branch (e.g., v1.1 or v2.0).

## 5. ASSESSMENT STATES
* **DRAFT:** Completely mutable. Invisible to candidates.
* **IN_REVIEW:** Temporarily locked. Pending Department/Organization Admin approval.
* **PUBLISHED:** Immutable. Actively assignable to candidates. 
* **ARCHIVED:** Immutable. Cannot be assigned, but retained indefinitely for historical reporting.

## 6. QUESTION BANK ARCHITECTURE
* **Structure:** Questions reside inside `QuestionBanks`, which are bound to an `Organization`.
* **Question Attributes:** `question_type` (Multiple Choice, Text, Video), `difficulty_level`, `tags`.
* **Options:** Standardized mapping for choices, explicitly identifying the `is_correct` boolean.

## 7. COMPETENCY FRAMEWORK ARCHITECTURE
* **Competency Groups:** Broad categories (e.g., "Leadership", "Technical Skills").
* **Competencies:** Specific granular skills mapped to Groups (e.g., "Conflict Resolution", "PHP 8").
* **Mapping:** Questions and Assessment Sections independently pivot to Competencies, allowing extreme analytics regarding a candidate's holistic skill profile.

## 8. BLUEPRINT ARCHITECTURE
* **Purpose:** The Blueprint defines the exact structural layout of the assessment.
* **Structure:** An Assessment `hasOne` Blueprint. The Blueprint `hasMany` BlueprintSections.
* **Sections:** Sections dynamically aggregate Questions from the Question Bank either by *Direct Selection* (explicit Question UUID) or *Dynamic Selection* (e.g., "Pull 10 random questions tagged 'PHP' at 'Hard' difficulty").

## 9. VERSIONING ARCHITECTURE
* **SemVer Logic:** Major.Minor tracking.
* **Trigger:** Calling the `PublishService`.
* **Deep Cloning Strategy:** When cloning a Published assessment, the system must deeply clone the Assessment, Blueprint, and Sections to ensure the new Draft branch has unique UUIDs. Original primitives (Questions/Competencies) are referenced by pivot, not cloned natively unless the Question itself is modified.

## 10. PUBLICATION WORKFLOW
1. Author flags Draft as `Ready`.
2. State Machine transitions to `IN_REVIEW`.
3. Policy validates Org Admin approval.
4. Service locks the JSON serialized structure natively for high-speed delivery.
5. State Machine transitions to `PUBLISHED`.

## 11. RBAC MATRIX
* **Platform Admin:** Global oversight. Can view all Tenant structures.
* **Organization Admin:** Full CRUD on Question Banks and Assessments scoped to their Organization. Final approval authority for Publishing.
* **Department Manager:** Authoring rights restricted to their specific Department. Can create Drafts, but cannot bypass Publishing workflows.
* **Candidate:** Zero access to this domain.

## 12. MULTI-TENANT DESIGN
Every core domain entity (`Assessment`, `QuestionBank`, `CompetencyGroup`, `Question`) requires a strict `organization_id` foreign key. Controllers explicitly pass the user's `organization_id` down to the Services, verifying tenant matching before allowing Read/Write operations via the Repositories.

## 13. API BOUNDARIES
* **Prefix:** `/api/v1/assessments/*`
* **Prefix:** `/api/v1/question-banks/*`
* **Prefix:** `/api/v1/competencies/*`
All interfaces enforce the rigid `Controller -> Request -> DTO -> Service -> Resource` flow defined in Sprint 01.

## 14. DATABASE BOUNDARIES
The Assessment Module maintains relational independence from the Candidate/Delivery module. Relationships map securely to the `users` and `organizations` tables established in the Sprint 01 Governance/Security layer.

## 15. SERVICE BOUNDARIES
* `AssessmentService`: Handles CRUD and delegates versioning.
* `PublishingService`: Dedicated State Machine explicitly owning the Draft -> Published transition and deep-cloning logic.
* `BlueprintService`: Handles deep nested array validation and mapping.

## 16. EVENT FLOW
* `AssessmentDraftCreated`
* `AssessmentSubmittedForReview`
* `AssessmentPublished` (Triggers cache warming and notification listeners).
* `AssessmentVersionCloned`

## 17. AUDIT REQUIREMENTS
Inherits native Sprint 01 `HasAuditFields`. Explicit tracking of `created_by`, `modified_by`, and `deleted_by` is mandatory on every action.

## 18. SECURITY REQUIREMENTS
* **Immutability Lock:** Attempting to call an `update()` service on an Assessment possessing a `PUBLISHED` state throws a fatal `BusinessRuleException`.
* **Payload Integrity:** Complex JSON structures representing Blueprints require intense Form Request validations to prevent malicious nested injections.

## 19. PERFORMANCE REQUIREMENTS
Published Assessments will likely be fetched concurrently by hundreds of candidates globally.
* **Eager Loading:** Controllers must invoke precise `.with(['blueprint.sections.questions'])` directives.
* **Caching:** Published states should eventually natively compile and cache the entire assessment schema into Redis/JSON to bypass complex SQL joins during active test sessions.

## 20. SCALABILITY REQUIREMENTS
The DB Architecture maps relationships purely by UUIDs, allowing future sharding or read-replica scaling specifically targeting the massive footprint of Question Banks and Historical Version archives.

## 21. FUTURE AI ASSESSMENT READINESS
The `Question` schema natively isolates prompt text, multimedia attachments, and grading schemas. This guarantees that future Natural Language Processing (NLP) or LLM Evaluation Modules can seamlessly ingest standard open-text answers without requiring architectural rewrites.

---

### ENTITY DEFINITIONS

* **Assessment:** The root container identifying the test.
* **Assessment Category:** High-level tenant groupings (e.g., "Technical", "Psychometric").
* **Assessment Type:** Modality definitions (e.g., "Timed Exam", "Survey").
* **Assessment Template:** A base cloneable Assessment.
* **Question Bank:** The organizational repository for Questions.
* **Question:** The granular testing item.
* **Question Option:** Selectable answers mapped to a Question.
* **Competency:** A distinct verifiable skill.
* **Competency Group:** The clustering of similar skills.
* **Blueprint:** The configuration map determining how an Assessment is structured.
* **Blueprint Section:** A specific block inside a Blueprint dictating question pulling rules.
* **Version:** The numerical index binding a Published instance.
* **Publication:** The finalized, locked state artifact.
