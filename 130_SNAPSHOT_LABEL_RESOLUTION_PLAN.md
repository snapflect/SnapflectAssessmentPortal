# 130 Snapshot Label Resolution Plan

## Executive Summary

This plan resolves the critical UX defect (OI-001 / OI-002 / OI-003) identified in the Production Readiness Review. The snapshot `JSON` payload already contains **all question text, option text, and question type data** — it is persisted by the `SnapshotGenerationService` on every assessment publication. The gap is purely in the **API response layer** (the `ResumeResource` does not expose this data) and the **Angular rendering layer** (the `AttemptQuestionPageComponent` has no label mapping).

No backend engine changes are required. No database changes are required. This is a targeted, low-risk implementation.

---

## Root Cause Analysis

### What the snapshot_json already contains

`SnapshotGenerationService` (line 52–80) persists the following structure per question:

```json
{
  "blueprint": {
    "sections": [
      {
        "uuid": "...",
        "section_name": "...",
        "questions": [
          {
            "uuid": "q-uuid-here",
            "question_type": "single_choice",
            "question_text": "What is the capital of France?",
            "question_ordering": 0,
            "options": [
              {
                "uuid": "opt-uuid-here",
                "option_text": "Paris",
                "display_order": 0
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Why labels are missing from the UI

The `ResumeResource` returns `questionOrder` (an array of UUIDs) and `optionOrder` (a map of question UUID → option UUIDs). It does **not** return a `questionLabels` or `optionLabels` map. The Angular component receives UUIDs with no way to resolve them to text.

The fix: extend the `ResumeResource` and `LaunchAttemptResource` to include a `snapshotMap` field derived from the snapshot JSON, and extend the Angular DTO + component to consume it.

---

## Architecture Decision

### Option A: Backend-Side Label Map (Recommended ✅)

The backend `ResumeResource` and `LaunchAttemptResource` parse the `snapshot_json` and return a pre-built map:

```json
{
  "snapshotMap": {
    "questions": {
      "q-uuid": {
        "text": "What is the capital of France?",
        "type": "single_choice"
      }
    },
    "options": {
      "opt-uuid": "Paris"
    }
  }
}
```

**Pros:** Angular component is simple; all parsing logic stays server-side; the map is deterministic and cacheable.
**Cons:** Slightly larger API payload (acceptable).

### Option B: Frontend-Side Snapshot Parsing

The backend sends the raw `snapshot_json` string; a `SnapshotParserService` in Angular parses it.

**Pros:** Flexibility for client-side filtering.
**Cons:** Sends the entire raw JSON (larger payload); parsing complexity in Angular; exposes internal snapshot structure to the client unnecessarily.

**Decision: Option A — Backend label map, resolved at the Resource layer.**

---

## Proposed Changes

### Backend Changes

---

#### [MODIFY] `ResumeResource.php`
Add `snapshotMap` field populated by a new `SnapshotLabelMapper` helper.

```
'snapshotMap' => SnapshotLabelMapper::fromJson($this->resource->snapshotJson)
```

---

#### [MODIFY] `LaunchAttemptResource.php`
Add `snapshotMap` field for consistency — the launch response must also provide labels so the Angular component can render immediately after launch (not just after resume).

---

#### [NEW] `app/Modules/Delivery/Helpers/SnapshotLabelMapper.php`

Responsibility: Parse `snapshot_json` and return a flat label map.

```php
public static function fromJson(string $snapshotJson): array
{
    $payload = json_decode($snapshotJson, true);
    $questions = [];
    $options = [];

    foreach ($payload['blueprint']['sections'] ?? [] as $section) {
        foreach ($section['questions'] ?? [] as $question) {
            $questions[$question['uuid']] = [
                'text' => $question['question_text'],
                'type' => $question['question_type'],
            ];
            foreach ($question['options'] ?? [] as $option) {
                $options[$option['uuid']] = $option['option_text'];
            }
        }
    }

    return ['questions' => $questions, 'options' => $options];
}
```

---

#### [MODIFY] `ResumeResultDto.php`
Add `snapshotJson` property so `ResumeResource` can access the raw JSON for mapping.

---

#### [MODIFY] `ResumeEngineService.php`
Pass the `snapshot_json` string from the Eloquent model into `ResumeResultDto`.

---

#### [MODIFY] `LaunchAttemptResource.php`
The launch resource already has access to the `attempt->assessmentSnapshot->snapshot_json` model — no DTO change needed; the Resource reads from the Eloquent relationship directly.

---

### Frontend Changes

---

#### [MODIFY] `execution.dto.ts`
Add `SnapshotMap` interface and extend `LaunchAttemptResponse` and `ResumeResponse`:

```typescript
export interface SnapshotMap {
  questions: Record<string, { text: string; type: string }>;
  options: Record<string, string>;
}

export interface LaunchAttemptResponse {
  // ... existing fields
  snapshotMap: SnapshotMap;
}

export interface ResumeResponse {
  // ... existing fields
  snapshotMap: SnapshotMap;
}
```

---

#### [MODIFY] `delivery.store.ts`
Add `snapshotMap` to `DeliveryState`:

```typescript
snapshotMap: SnapshotMap | null;
```

Expose as:
```typescript
public readonly snapshotMap = computed(() => this.state().snapshotMap);
```

Update `setAttemptFromLaunch()` and `setAttemptFromResume()` to patch `snapshotMap`.

---

#### [MODIFY] `attempt-question-page.component.ts`
Replace stub methods with real label resolution:

```typescript
getQuestionLabel(uuid: string): string {
  return this.store.snapshotMap()?.questions[uuid]?.text ?? uuid;
}

getOptionLabel(uuid: string): string {
  return this.store.snapshotMap()?.options[uuid] ?? uuid;
}
```

Also bind `question_type` to conditionally render radio vs checkbox:

```typescript
getQuestionType(uuid: string): string {
  return this.store.snapshotMap()?.questions[uuid]?.type ?? 'single_choice';
}
```

---

## Files to Create or Modify

| File | Action | Layer |
|---|---|---|
| `app/Modules/Delivery/Helpers/SnapshotLabelMapper.php` | **CREATE** | Backend |
| `app/Modules/Delivery/Resources/ResumeResource.php` | **MODIFY** | Backend |
| `app/Modules/Delivery/Resources/LaunchAttemptResource.php` | **MODIFY** | Backend |
| `app/Modules/Delivery/DTOs/ResumeResultDto.php` | **MODIFY** | Backend |
| `app/Modules/Delivery/Services/ResumeEngineService.php` | **MODIFY** | Backend |
| `src/app/core/models/execution.dto.ts` | **MODIFY** | Frontend |
| `src/app/features/delivery/store/delivery.store.ts` | **MODIFY** | Frontend |
| `src/app/features/delivery/pages/attempt/question/attempt-question-page.component.ts` | **MODIFY** | Frontend |

---

## Scope Boundaries

| In Scope | Out of Scope |
|---|---|
| Label resolution for question text | Scoring logic |
| Label resolution for option text | Reporting |
| Question type binding (single/multi) | Sprint 07 engines |
| snapshotMap in LaunchAttemptResource | Snapshot schema changes |
| snapshotMap in ResumeResource | New API endpoints |

---

## Testing Requirements

| Test | Type |
|---|---|
| `SnapshotLabelMapper::fromJson()` — happy path | Unit |
| `SnapshotLabelMapper::fromJson()` — empty sections | Unit |
| `SnapshotLabelMapper::fromJson()` — missing options | Unit |
| `ResumeResource` includes `snapshotMap` | Feature |
| `LaunchAttemptResource` includes `snapshotMap` | Feature |
| Angular: question label resolves from store | Component |
| Angular: option label resolves from store | Component |
| Angular: UUID fallback when map missing | Component |

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Snapshot JSON structure mismatch | Low | `SnapshotGenerationService` structure is stable and well-tested |
| Large snapshot payload | Low | Map is flat key-value; serializes efficiently |
| Label missing for an unknown UUID | Very Low | Graceful fallback to UUID string already in stubs |
| Breaking existing API consumers | None | `snapshotMap` is additive; no field removed |

---

## Implementation Order

1. Create `SnapshotLabelMapper.php` (backend helper)
2. Modify `ResumeResultDto.php` to add `snapshotJson`
3. Modify `ResumeEngineService.php` to populate it
4. Modify `ResumeResource.php` to include `snapshotMap`
5. Modify `LaunchAttemptResource.php` to include `snapshotMap`
6. Write unit and feature tests for mapper
7. Modify `execution.dto.ts` to add `SnapshotMap` interface
8. Modify `delivery.store.ts` to track and expose `snapshotMap`
9. Modify `attempt-question-page.component.ts` to bind labels and question type
10. Write Angular component tests for label resolution

---

## Acceptance Criteria

- [ ] Question text renders as human-readable text, not UUID
- [ ] Option text renders as human-readable text, not UUID
- [ ] Single-choice questions render radio buttons
- [ ] Multi-choice questions render checkboxes (OI-004 partially resolved)
- [ ] UUID fallback renders gracefully if map entry is missing
- [ ] `LaunchAttemptResource` includes `snapshotMap`
- [ ] `ResumeResource` includes `snapshotMap`
- [ ] All existing API tests still pass (no regression)
- [ ] `SnapshotLabelMapper` unit tests pass

---

## Recommended Document Sequence

| Document | Purpose |
|---|---|
| **130_SNAPSHOT_LABEL_RESOLUTION_PLAN** *(this document)* | Architecture and planning |
| **131_SNAPSHOT_LABEL_RESOLUTION_IMPLEMENTATION** | Code implementation |
| **132_CANDIDATE_PILOT_READINESS_REVIEW** | Gate for first candidate pilot |

---

## Final Recommendation

**Authorize implementation of `131_SNAPSHOT_LABEL_RESOLUTION_IMPLEMENTATION`.**

This is a low-risk, high-impact change. The snapshot JSON already contains all required data. The implementation is additive-only on both the backend and frontend. Once complete, the Candidate-Facing Readiness status will upgrade from 🔴 NO-GO to 🟢 GO and candidate pilot testing can begin.
