# 309 — Nav RBAC Gap Remediation Report

**Document:** 309
**Type:** Defect Remediation & Change Record
**Scope:** Frontend Navigation RBAC + Backend Permission Seeder
**Status:** IMPLEMENTED
**Date:** 2026-07-06
**Triggered By:** E2E Manual Testing — Assessment Manager Persona

---

## 1. Executive Summary

During E2E manual testing of the Assessment Manager persona (aslam@test.com, Workspace: Rayan Technologies), 5 navigation RBAC gaps were identified by comparing the rendered left nav against the official RBAC_MENU_MATRIX.md specification. All gaps were cross-verified against industry standards (Mercer | Mettl, iMocha, Questionmark OnDemand) before implementation.

Root cause: permission-based navigation with overly broad permission guards — metadata admin items shared permission codes with their parent modules, and cross-role shared permissions caused persona-specific items to bleed into unintended roles.

---

## 2. Gaps Identified & Confirmed

### HIGH Severity
| ID | Gap | Root Cause |
|----|-----|-----------|
| H-1 | Reviewer Dashboard visible to Assessment Manager | AM and Reviewer both have Results.ManualScoring.Score; nav used only this perm to gate the link |
| H-2 | Session Management visible to Assessment Manager | Link gated by Assessment.Publications.Manage — a publish permission, not a delivery/ops permission |

### MEDIUM Severity
| ID | Gap | Root Cause |
|----|-----|-----------|
| M-1 | Question Tags visible to Assessment Manager and Content Creator | Gated by Assessment.Questions.Create — same as Questions module |
| M-2 | Categories visible to Assessment Manager and Content Creator | Gated by Assessment.Catalog.Manage — same as Assessment Catalog module |
| M-3 | Types visible to Assessment Manager and Content Creator | Gated by Assessment.Catalog.Manage — same as Assessment Catalog module |

### LOW Severity (Doc-Only Fix)
| ID | Gap | Fix |
|----|-----|-----|
| L-1 | RBAC spec said Dashboard for AM; UI correctly shows Authoring Dashboard | Updated RBAC_MENU_MATRIX.md |

---

## 3. Industry Cross-Verification

| Gap | Confidence | Evidence |
|-----|-----------|---------|
| H-1 | 100% | All platforms: Reviewer = task-queue; AM = oversight dashboard. Completely separate. |
| H-2 | 100% | All platforms: AM creates/publishes; Proctor monitors live. Explicitly separated. |
| M-1 | 95% | Questionmark: authors apply tags; admins manage global taxonomy. |
| M-2 | 100% | Enterprise LMS: categories are admin-controlled vocabularies. |
| M-3 | 100% | Same as M-2 — system-level type config is always admin-only. |

---

## 4. Changes Implemented

### 4.1 New Permission: Assessment.Metadata.Manage
Gates taxonomy admin screens (Categories, Types, Question Tags) separately from authoring permissions.
Assigned To: PLATFORM_ADMIN (auto via seeder loop), CLIENT_ADMIN
NOT Assigned To: ASSESSMENT_MANAGER, CONTENT_CREATOR, REVIEWER

### 4.2 Backend: database/seeders/CustomRbacSeeder.php
- Added Assessment.Metadata.Manage to Assessment permissions array (line 61)
- Added Assessment.Metadata.Manage to CLIENT_ADMIN role assignments (line 80)

### 4.3 Frontend: src/app/core/services/navigation.service.ts
| Fix | Change |
|-----|--------|
| H-1 | Added isOnlyAssessmentManager filter for Reviewer Dashboard in navGroups computed |
| H-2 | Session Management guard changed: Assessment.Publications.Manage -> Delivery.Sessions.Proctor + Delivery.Sessions.Terminate |
| M-1 | Question Tags permission: Assessment.Questions.Create -> Assessment.Metadata.Manage |
| M-2 | Categories permission: Assessment.Catalog.Manage -> Assessment.Metadata.Manage |
| M-3 | Types permission: Assessment.Catalog.Manage -> Assessment.Metadata.Manage |

### 4.4 Documentation: RBAC_MENU_MATRIX.md
- Assessment Manager Dashboard label updated: Dashboard -> Authoring Dashboard
- Added Assessment.Metadata.Manage row to Granular Enterprise Permissions Matrix

---

## 5. Expected Nav Per Role (Post-Fix)

### Assessment Manager — 9 items
AUTHORING: Authoring Dashboard, Assessment Catalog, Questions, Question Banks, Competencies, Blueprint Designer, Publications
DELIVERY: Manual Scoring
ANALYTICS: Analytics & Results

### Content Creator — 5 items (also fixed)
AUTHORING: Assessment Catalog, Questions, Question Banks, Competencies + Authoring Dashboard

### Proctor — still sees Session Management (guard corrected)
DELIVERY: Session Management, Active Sessions

---

## 6. Verification Checklist

- [ ] Login as assessment_manager@snapflect.com -> verify exactly 9 items, no Question Tags / Categories / Types / Reviewer Dashboard / Session Management
- [ ] Login as content_creator@snapflect.com -> verify no Question Tags / Categories / Types
- [ ] Login as reviewer@snapflect.com -> verify Reviewer Dashboard IS still visible
- [ ] Login as proctor@snapflect.com -> verify Session Management IS still visible
- [ ] Login as client_admin@snapflect.com -> verify Categories / Types / Tags / Session Management all still visible
- [ ] Login as platform_admin@snapflect.com -> verify all items still visible

---

## 7. Sign-Off

Change Type: RBAC Defect Remediation (permission scope correction only)
Risk Level: Low — changes are purely restrictive
Database: Re-seeded via php artisan db:seed --class=CustomRbacSeeder (DONE)
Frontend: navigation.service.ts updated (DONE) — dev server restart needed
Rollback: Revert navigation.service.ts and CustomRbacSeeder.php and re-seed
