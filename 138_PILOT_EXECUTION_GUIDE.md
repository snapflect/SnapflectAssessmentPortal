# 138 Pilot Execution Guide

**Document Version:** 1.0
**Phase:** Candidate Pilot Execution
**Target Audience:** Engineering, QA, Support, and Pilot Coordinators

---

## Executive Summary

This Pilot Execution Guide is the operational handbook for managing, monitoring, and supporting the active Candidate Pilot of the Snapflect Assessment Portal. 

With the core Execution Engine formally authorized, real candidates can now take assessments. This document defines how the pilot should be governed, how system health should be monitored, what metrics define success, and how to respond if critical failures occur.

---

## 1. Pilot Governance & Communication

### 1.1 Scope Management
- Only `single_choice` and `multiple_choice` assessment structures may be published for pilot use.
- No subjective (essay/text) or unverified question types may be included.

### 1.2 Candidate Expectation Setting
Pilot Coordinators **must** include the following disclaimer in candidate invitations:
> *"This is a pilot assessment. Upon submission, you will see a completion confirmation, but no score or detailed results will be provided immediately. Scores will be calculated retroactively once the Scoring Engine is finalized."*

### 1.3 Support Escalation Path
1. **Tier 1 (Pilot Coordinator):** Handles login issues and general inquiries.
2. **Tier 2 (Support Analyst):** Validates issue reproduction in the staging environment.
3. **Tier 3 (Engineering):** Investigates state loss, database deadlocks, and timer desyncs.

---

## 2. Active Pilot Monitoring

Until server-side APM (Application Performance Monitoring) tools are fully implemented (Sprint 08), the Engineering team must conduct manual database pulse checks during active pilot cohorts.

### 2.1 Daily Pulse Check Queries

**A. Check for Orphaned Active Sessions:**
```sql
SELECT attempt_uuid, access_started_at, time_limit_seconds 
FROM assessment_attempts 
WHERE status = 'ACTIVE' 
AND access_started_at < NOW() - INTERVAL 4 HOUR;
```
*Action:* Investigate why these were not caught by the timer expiration policy.

**B. Verify Auto-Save Flow:**
```sql
SELECT attempt_question_id, COUNT(*) as save_frequency 
FROM candidate_answers 
GROUP BY attempt_question_id 
ORDER BY save_frequency DESC 
LIMIT 10;
```
*Action:* Ensure no runaway saves (e.g., thousands of saves for a single question indicating debounce failure).

**C. Monitor Error Submissions:**
```sql
SELECT attempt_uuid, status 
FROM assessment_attempts 
WHERE status = 'ERROR';
```
*Action:* Immediate Tier 3 escalation if `ERROR` status is detected during finalization.

---

## 3. Pilot Escalation Procedures

### 3.1 Severity Definitions
- **SEV-1 (Critical Block):** Cannot launch attempt, timer fails to load, submission button fails globally.
- **SEV-2 (High Impact):** Auto-save fails silently, draft answers do not restore, snapshot text does not render.
- **SEV-3 (Low Impact):** UI alignment issues, slow network responses, minor styling bugs.

### 3.2 Escalation Workflow
1. **Detection:** Coordinator reports issue or Engineering spots it in pulse check.
2. **Triage:** Engineering verifies severity.
3. **Action:** 
   - **SEV-1/SEV-2:** Immediately suspend pilot. Execute Rollback Procedure (Section 5).
   - **SEV-3:** Log issue for Sprint 06.7 backlog. Proceed with pilot.
4. **Resolution:** Implement fix, generate retest report, re-authorize pilot.

---

## 4. Pilot Success Metrics

The pilot will be evaluated against the following quantitative and qualitative metrics:

### 4.1 Quantitative (System Health)
- **Completion Rate:** > 95% of launched attempts successfully reach the `SUBMITTED` state.
- **Save Integrity:** 100% match between the number of answered questions and the number of rows in `candidate_answers` for a given attempt.
- **Timeout Enforcement:** 100% of expired timers successfully lock the attempt and prevent further writes.

### 4.2 Qualitative (Candidate Experience)
- **UX Friction:** Candidates report no confusion regarding how to select answers or submit.
- **Performance:** Candidates report the UI feels responsive and auto-saves are truly silent.

---

## 5. Pilot Rollback Procedures

If a SEV-1 or SEV-2 incident occurs (e.g., widespread state loss or inability to submit), the following rollback procedure must be executed immediately:

### 5.1 Suspend New Attempts
1. Disable new attempt generation at the API Gateway level (if applicable) or update the frontend feature flag to temporarily hide the "Launch Assessment" button.
2. Inform Pilot Coordinators to pause sending invitations.

### 5.2 Quarantine Affected Attempts
1. Identify all currently `ACTIVE` attempts.
2. If the issue is destructive (data loss), manually transition these attempts to `CANCELLED` status with a note in the database.
3. Coordinators must issue new assessment links to affected candidates with an apology.

### 5.3 Technical Reversal
1. Revert the frontend deployment to the last stable snapshot if the issue is UI-related.
2. Revert the backend deployment if the issue is API-related.
3. Perform database restoration from snapshot *only* if catastrophic data corruption occurred (highly unlikely given the append-only nature of snapshots).

---

## Final Readiness Checklist

- [x] Execution APIs fully tested.
- [x] Candidate UI fully tested.
- [x] Multi-select payload bug (OI-009) resolved.
- [x] Governance framework (137) signed off.
- [x] **Pilot Execution Guide (138) published.**

The platform is officially ready for Pilot Operations. Engineering focus may now shift entirely to **Sprint 07 — Scoring Engine**.
