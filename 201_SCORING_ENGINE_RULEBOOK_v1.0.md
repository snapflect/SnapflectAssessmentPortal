# 201 Scoring Engine Rulebook v1.0

**Document Version:** 1.0
**Phase:** Sprint 07 Phase 1
**Domain:** Assessment Scoring & Evaluation Engine

---

## Executive Summary

The Scoring Engine is an isolated, asynchronous (or delayed-synchronous) system responsible for taking a `SUBMITTED` assessment attempt, evaluating candidate answers against the snapshot blueprint, and generating final scores. 

Scoring is strictly decoupled from the Execution Engine. The Execution Engine's responsibility ends when an attempt transitions to `SUBMITTED`. The Scoring Engine's responsibility begins exactly at that transition.

This Rulebook defines the strict architectural and business rules that govern how scores are calculated, weighted, audited, and finalized.

---

## 1. Supported Question Types & Basic Evaluation

The engine will initially support two execution modes based on question type.

### 1.1 Single Choice (`single_choice`)
- **Payload Structure:** String UUID representing the selected option.
- **Evaluation Rule:** Strict Equality. If `candidate_answer.selected_option_uuid === correct_option_uuid`, award `max_score`. Otherwise, award `0` (or apply negative marking).

### 1.2 Multiple Choice (`multiple_choice`)
- **Payload Structure:** JSON Array of string UUIDs representing selected options.
- **Evaluation Rule:** Set Equality. The selected array must exactly match the set of correct options to award full score, *unless* Partial Credit rules apply (see Section 4).

---

## 2. Scoring Strategies

The engine must support extensible scoring strategies. The strategy to use is defined at the Assessment level within the snapshot blueprint.

### 2.1 Standard Auto-Scoring (Binary)
Answers are evaluated as strictly `CORRECT` or `INCORRECT`. 
- `CORRECT` = 100% of question `max_score`.
- `INCORRECT` = 0% of question `max_score`.

### 2.2 Unscored (Survey/Demographic)
Certain questions may be marked as unscored. These questions are excluded from the `max_possible_score` calculation and award `0` points regardless of the answer.

### 2.3 Manual Grading (Future)
Questions of type `essay` or `file_upload` bypass the Auto-Scoring engine. The attempt transitions to `PENDING_GRADING` instead of `SCORED`, awaiting manual examiner input.

---

## 3. Negative Marking Rules

Assessments may configure negative marking to discourage guessing.

### 3.1 Blueprint Definition
Negative marking is defined in the snapshot blueprint at the assessment level (e.g., `-0.25` points for every incorrect answer) or overridden at the question level.

### 3.2 Floor Constraints
An individual question score may be negative (e.g., `-1.0`).
However, the **Total Assessment Score** cannot be less than `0`. If negative marking drops the cumulative score below zero, it must be floored to `0`.

---

## 4. Partial Credit Rules (Multiple Choice)

For `multiple_choice` questions, the assessment blueprint can define how partial credit is awarded.

### 4.1 `ALL_OR_NOTHING` (Default)
Candidate must select *all* correct options and *no* incorrect options to receive the `max_score`. Any mistake results in `0`.

### 4.2 `PROPORTIONAL`
Credit is awarded proportionally based on the number of correct selections minus the number of incorrect selections.
- Formula: `(Correct Selections / Total Correct Options) * max_score - (Incorrect Selections * penalty_factor)`
- Score floors at `0` for the question.

---

## 5. Competency & Domain Weighting

Modern assessments score specific skills, not just the overall test.

### 5.1 Competency Tagging
Questions in the blueprint may be tagged with one or more `competency_uuids` (e.g., "React Framework", "API Design").

### 5.2 Category Scoring
The Scoring Engine must calculate a sub-score for each mapped competency:
- `competency_score` = Sum of awarded points for questions mapped to Competency X.
- `competency_max` = Sum of max possible points for questions mapped to Competency X.
- `competency_percentage` = `(competency_score / competency_max) * 100`.

---

## 6. Pass/Fail Threshold Rules

Evaluation determines the final outcome of the attempt.

### 6.1 Absolute Threshold
Candidate must achieve a minimum raw score (e.g., `850` points).

### 6.2 Percentage Threshold
Candidate must achieve a minimum percentage (e.g., `75%`).

### 6.3 Competency-Based Thresholds
Candidate must achieve a minimum percentage overall AND pass specific individual competencies (e.g., "70% overall, but must score at least 60% in the Safety domain").

---

## 7. Scoring Audit Requirements

The Scoring Engine is an authoritative financial/compliance system. Its calculations must be completely transparent and reproducible.

### 7.1 Line-Item Audit Trail
For every attempt, a `scoring_audit_logs` record (or JSON blob) must be generated. It must contain:
1. The Question UUID.
2. The Candidate's Answer Payload.
3. The Blueprint Correct Answer.
4. The Strategy Applied (e.g., `Binary`, `Proportional`).
5. Max Score Possible.
6. Score Awarded.
7. Penalty Applied (if any).

### 7.2 Score Explanation
If a candidate challenges a score, the system must be able to present the exact mathematical derivation of their final score using the Audit Trail.

---

## 8. Scoring Immutability Rules

Once an attempt transitions to the `SCORED` state, the score is considered immutable.

### 8.1 No Dynamic Updates
If an assessment author realizes a question was flawed and updates the correct answer in the active Assessment, **existing completed attempts are NOT dynamically re-scored.**

### 8.2 Recalculation Flow
Scores can only be changed via an explicit, audited `RecalculateAttemptScore` action triggered by an administrator.
- The original score is archived.
- The new score is applied.
- The audit log records the recalculation timestamp and the administrator who triggered it.

---

## 9. State Transition Lifecycle

The Scoring Engine drives the final state transitions of an Attempt.

`ACTIVE` → (Execution Engine) → `SUBMITTED`
`SUBMITTED` → (Scoring Engine) → `EVALUATING`
`EVALUATING` → (Scoring Engine) → `SCORED` (if Pass/Fail determined)
`EVALUATING` → (Scoring Engine) → `PENDING_GRADING` (if manual grading required)

---

## Conclusion & Next Phase

This Rulebook establishes the business logic boundaries for the Scoring Engine. It guarantees that execution data remains immutable, scoring logic remains decoupled, and the final results are fully auditable.

**Next Immediate Step:** 
Phase 2 — Generate the `202_SCORING_OPENAPI_CONTRACT` to define the frontend/backend data exchange for scoring results and audit logs.
