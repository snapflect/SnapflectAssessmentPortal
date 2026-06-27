# 134 Multi-Select Payload Fix Plan

## Executive Summary

This plan resolves OI-009 identified during the Candidate Pilot Readiness Review. Currently, multiple-choice (checkbox) questions send a single option UUID as their `answerPayload`, overwriting any previous selections. 

**Critical Finding:** A deep review of the backend `AutoSaveService` reveals that **the backend already fully supports array payloads.** The `AutoSaveAnswerRequest` validation rules and the persistence layer (`CandidateAnswer` model via `selected_option_uuids_json`) are already designed to handle JSON arrays. **No backend modifications are required.**

This makes OI-009 a **Low Risk Patch** confined entirely to the Angular frontend state management.

---

## Root Cause Analysis

### Current Flow (`attempt-question-page.component.ts`)

1. Candidate clicks a checkbox for Option A.
2. `(change)="onAnswerChange(qUuid, optUuid)"` fires.
3. `onAnswerChange` immediately calls `facade.autoSave(questionUuid, version, optUuid)`.
4. The `answerPayload` sent over the network is exactly `"opt-uuid-A"`.
5. Candidate clicks a checkbox for Option B.
6. The exact same flow happens. The network payload is `"opt-uuid-B"`.
7. The backend receives the single string and overwrites the previous single string.

### Target Flow

1. Candidate clicks a checkbox for Option A.
2. Component reads current state (empty array).
3. Component adds Option A to array: `['opt-uuid-A']`.
4. Component optimistically updates the local `DeliveryStore` draft state.
5. Component calls `facade.autoSave(questionUuid, version, ['opt-uuid-A'])`.
6. Candidate clicks Option B.
7. Component reads current state `['opt-uuid-A']`.
8. Component adds Option B: `['opt-uuid-A', 'opt-uuid-B']`.
9. Store updated.
10. Payload `['opt-uuid-A', 'opt-uuid-B']` sent. Backend natively persists the JSON array.

---

## Frontend Changes Required

### 1. `execution.dto.ts` (DTO Impact)
No changes strictly required since `AutoSaveRequestDto.answerPayload` is already typed as `any`. However, for safety, we should document that it can be `string | string[]`.

### 2. `delivery.store.ts` (State Model)
Currently, `DeliveryStore.recordSaveSuccess()` has a placeholder comment:
`// In a real app we'd map this specific draft back into draftAnswers if needed`

We must implement an **optimistic update** method in the store:
```typescript
updateDraftAnswer(questionUuid: string, answerPayload: any) {
  this.state.update(s => {
    const drafts = [...s.draftAnswers];
    const index = drafts.findIndex(d => d.questionUuid === questionUuid || d.question_uuid === questionUuid);
    
    if (index >= 0) {
      drafts[index] = { ...drafts[index], answerPayload };
    } else {
      drafts.push({ questionUuid, answerPayload, version: 1 });
    }
    
    return { ...s, draftAnswers: drafts };
  });
}
```

### 3. `attempt-question-page.component.ts` (Component Flow)
Update the label/input template to use an array-aware checked state:
```html
[checked]="isOptionSelected(qUuid, optUuid)"
```

Update the event binding for checkboxes to pass the checked state:
```html
(change)="onMultiAnswerChange(qUuid, optUuid, $any($event.target).checked)"
```

Implement the helper methods:
```typescript
isOptionSelected(qUuid: string, optUuid: string): boolean {
  const answer = this.getDraftAnswer(qUuid);
  if (Array.isArray(answer)) {
    return answer.includes(optUuid);
  }
  return answer === optUuid;
}

onMultiAnswerChange(qUuid: string, optUuid: string, isChecked: boolean) {
  if (this.isSubmitted() || this.store.expired()) return;

  let currentAnswer = this.getDraftAnswer(qUuid);
  let newAnswer: string[] = [];

  if (Array.isArray(currentAnswer)) {
    newAnswer = [...currentAnswer];
  } else if (currentAnswer) {
    newAnswer = [currentAnswer];
  }

  if (isChecked) {
    if (!newAnswer.includes(optUuid)) newAnswer.push(optUuid);
  } else {
    newAnswer = newAnswer.filter(id => id !== optUuid);
  }

  // Optimistically update store
  this.store.updateDraftAnswer(qUuid, newAnswer);

  const version = this.draftVersion();
  this.draftVersion.update(v => v + 1);
  this.facade.autoSave(qUuid, version.toString(), newAnswer);
}
```

Update `onAnswerChange` (for radio buttons) to also use the optimistic update:
```typescript
onAnswerChange(qUuid: string, optUuid: string) {
  // ... existing checks ...
  this.store.updateDraftAnswer(qUuid, optUuid);
  this.facade.autoSave(qUuid, version.toString(), optUuid);
}
```

---

## Backend & Resume Impact

**Backend Changes:** None. `AutoSaveService` lines 107-109 natively handle `is_array($dto->answerPayload)`.
**Resume Flow Impact:** None. `DraftRecoveryService` lines 32-33 natively decode `selected_option_uuids_json` back into an array and return it to the frontend.
**Database Impact:** None. Schema already has `selected_option_uuids_json`.

---

## Testing Strategy

| Test Scenario | Action | Expected Result |
|---|---|---|
| Initial Array | Load multiple_choice question | Checkboxes render empty |
| Select A | Click Option A | UI checked, store updated, AutoSave sends `["A"]` |
| Select B | Click Option B | UI checked, store updated, AutoSave sends `["A", "B"]` |
| Deselect A | Uncheck Option A | UI unchecked, store updated, AutoSave sends `["B"]` |
| Resume Persistence | Reload page | Option B remains checked via Resume endpoint |
| Radio Preservation | Click radio option | Still sends string `"C"`, not array |

---

## Risk Assessment & Implementation Sequence

**Risk Level:** Low.
**Impact Level:** High (Unblocks Candidate Pilot for multiple-choice).

**Sequence:**
1. Update `DeliveryStore` to support optimistic draft updates.
2. Update `AttemptQuestionPageComponent` methods (`isOptionSelected`, `onMultiAnswerChange`, `onAnswerChange`).
3. Update `AttemptQuestionPageComponent` template bindings.
4. Execute Runtime Retest (136).

---

## Final Recommendation

The backend is fully ready. The issue is restricted entirely to local Angular state manipulation before the HTTP dispatch. 

**Recommendation:** Proceed immediately with `135_MULTI_SELECT_PAYLOAD_FIX_IMPLEMENTATION`.
