# 137 Full Candidate Pilot Authorization

**Authorization Date:** June 2026
**Platform Milestone:** Core Execution Engine Completion
**Authority:** Architectural Review Board & Engineering Leadership

---

## Executive Summary

Following the successful resolution of UI rendering gaps (OI-001 through OI-004) and payload accumulation flaws (OI-009), the core Assessment Execution Platform has proven highly resilient. State management is secure, the auto-save engine safely persists single-choice and multiple-choice JSON structures, and the resume/submission lifecycle securely boundaries attempts.

This document formally elevates the platform from an internal technical preview to a **Fully Authorized Candidate Pilot Environment**. 

---

## 1. What is Authorized

The following platform capabilities are authorized for active pilot usage:
- **Tenant Context Management:** Workspace and domain isolation.
- **Assessment Publication:** Generating immutable blueprint snapshots.
- **Attempt Launch:** Validating eligibility and initiating a secure, randomized attempt session.
- **Execution Delivery:** Rendering human-readable questions/options for both single and multiple-choice formats.
- **State Synchronization:** Background, debounced Auto-Save of string and array payloads.
- **Timer Governance:** Server-authoritative timer decay with forced expiration.
- **Session Recovery:** Cross-device draft restoration and state hydration.
- **Submission Finalization:** Immutable answer locking and state transition handling.

---

## 2. Who Can Use It

| Target Audience | Status | Purpose |
|---|---|---|
| **Engineering & Architecture Teams** | 🟢 **ACTIVE** | Load testing, structural validation, regression coverage. |
| **Internal QA / UAT Testers** | 🟢 **ACTIVE** | Functional testing, cross-browser validation, edge-case probing. |
| **Controlled Candidate Cohorts** | 🟢 **ACTIVE** | Real-world usability, UX friction discovery, network resilience testing. |
| **General Public / Open Registration** | 🔴 **RESTRICTED** | Awaiting Sprint 07 (Scoring Engine) and public portal components. |

---

## 3. Assessment Types Allowed

There are no longer structural restrictions on assessment composition.

| Assessment Component | Pilot Authorization | Notes |
|---|---|---|
| `single_choice` questions | 🟢 **Authorized** | String payloads fully validated. |
| `multiple_choice` questions | 🟢 **Authorized** | Array payloads fully validated (post-OI-009 fix). |
| Complex routing / skips | 🔴 **Not Authorized** | Engine does not yet support branching logic. |
| Subjective scoring / essays | 🔴 **Not Authorized** | Requires text-box UI implementation and manual grader flow. |

---

## 4. Operational Conditions

To safely conduct the Candidate Pilot, the following conditions must be observed by test administrators:

1. **Clear Expectations:** Candidates must be informed that this is a pilot assessment.
2. **No Immediate Scores:** Because Sprint 07 (Scoring Engine) is pending, candidates will **not** see a score, pass/fail result, or certificate upon submission. They will only see a completion acknowledgment.
3. **Network Constraints:** While Auto-Save is resilient, candidates should be advised not to take the pilot on severely degraded mobile networks until offline-sync is implemented.
4. **Monitoring:** Administrators should manually monitor the `assessment_attempts` and `candidate_answers` tables for anomalies during the first cohort.

---

## 5. Known Non-Blocking Issues

The following issues are known but do not block candidate execution:

| ID | Issue | Impact | Mitigation / Roadmap |
|---|---|---|---|
| **OI-005** | Angular component spec assertions incomplete | Internal Only | To be addressed alongside Sprint 07 test scaffolding. |
| **OI-006** | No server-side APM / structured logging | Ops Only | Manual DB monitoring required during pilot; Sprint 08 targeted. |
| **OI-007** | No score / results display post-submission | Candidate UX | Explicitly deferred to Sprint 07. Addressed via candidate messaging. |
| **OI-008** | No certificate or completion artifact | Candidate UX | Deferred to Sprint 09. |

---

## 6. Pilot Success Criteria

The Candidate Pilot will be considered a success if the following metrics are achieved:

1. **Zero State Loss:** 100% of candidate clicks translate into successfully persisted `candidate_answers` records.
2. **Zero Timeout Drift:** 100% of expired timers enforce a submission lock without frontend manipulation bypassing it.
3. **Zero Snapshot Drift:** 100% of restored drafts correctly map to their original `snapshot_json` blueprints across session resets.
4. **Zero Authentication Breaches:** 100% of attempts remain strictly isolated to the authorized `candidate_user_id`.
5. **Positive UX Feedback:** Candidates report that reading, navigating, answering, and submitting questions felt intuitive and responsive.

---

## Final Declarations

With this document, the foundational execution phase of the project is formally closed out. The system works precisely as architected.

**Authorization Status:** 🟢 **AUTHORIZED**

### Recommended Next Steps
1. Generate `138_PILOT_EXECUTION_GUIDE` to standardise administrator pilot practices.
2. Commence **Sprint 07 — Scoring Engine**.
