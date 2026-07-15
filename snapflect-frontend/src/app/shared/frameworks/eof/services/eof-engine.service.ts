import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EofWizardConfig, EofStepConfig, EofLifecycleState } from '../models/eof-config.model';
import { EofDraftService } from './eof-draft.service';
import { EofValidationService } from './eof-validation.service';

@Injectable({ providedIn: 'root' })
export class EofEngineService {
  private draftService = inject(EofDraftService);
  private validationService = inject(EofValidationService);

  private configSubject = new BehaviorSubject<EofWizardConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  private activeStepIndexSubject = new BehaviorSubject<number>(0);
  public activeStepIndex$ = this.activeStepIndexSubject.asObservable();

  // Stores the aggregated entity data (the 'form' values across all steps)
  private entityDataSubject = new BehaviorSubject<any>({});
  public entityData$ = this.entityDataSubject.asObservable();

  public initWizard(config: EofWizardConfig, initialData: any = {}) {
    // Try to load a local draft first (Phase 1 fallback)
    const draft = this.draftService.getLocalDraft(config.wizardId, config.entityType);
    if (draft && draft.payload) {
      initialData = { ...initialData, ...draft.payload };
    }

    this.entityDataSubject.next(initialData);
    
    // Evaluate dynamic step visibility
    this.evaluateVisibility(config, initialData);

    this.configSubject.next(config);
    this.activeStepIndexSubject.next(0);
    this.validationService.calculateProgress(config);
  }

  public updateEntityData(partialData: any) {
    const currentData = this.entityDataSubject.value;
    const newData = { ...currentData, ...partialData };
    this.entityDataSubject.next(newData);

    const config = this.configSubject.value;
    if (config) {
      // Trigger autosave
      this.draftService.registerDraftUpdate(config.wizardId, config.entityType, newData);
      // Re-evaluate step visibility based on new data
      this.evaluateVisibility(config, newData);
      this.configSubject.next(config); // Emit updated config with new step visibility
    }
  }

  public updateStepValidation(stepId: string, status: EofStepConfig['status'], rules: EofStepConfig['validationRules']) {
    const config = this.configSubject.value;
    if (!config) return;

    const step = config.steps.find(s => s.id === stepId);
    if (step) {
      step.status = status;
      step.validationRules = rules;
      this.configSubject.next(config);
      this.validationService.calculateProgress(config);
    }
  }

  public goToStep(index: number) {
    const config = this.configSubject.value;
    if (!config || index < 0 || index >= config.steps.length) return;

    // Auto-validate current step if leaving it and it's optional and still pending
    const currentIdx = this.activeStepIndexSubject.value;
    if (currentIdx !== index) {
      const currentStep = config.steps[currentIdx];
      if (currentStep && currentStep.status === 'pending' && !currentStep.isRequired) {
        this.updateStepValidation(currentStep.id, 'valid', currentStep.validationRules);
      }
    }

    this.activeStepIndexSubject.next(index);
  }

  public nextStep() {
    const current = this.activeStepIndexSubject.value;
    this.goToStep(current + 1);
  }

  public previousStep() {
    const current = this.activeStepIndexSubject.value;
    this.goToStep(current - 1);
  }

  public completeOnboarding() {
    // This is where we transition lifecycle from 'in_progress'/'configured' to 'ready'/'activated'
    // Would trigger API call
    console.log('EOF Engine: Onboarding completed. Payload ready for API:', this.entityDataSubject.value);
  }

  private evaluateVisibility(config: EofWizardConfig, data: any) {
    // If visibilityCondition exists, evaluate it.
    // In Phase 1, we don't physically remove them from array (to preserve order),
    // but a robust engine might filter the array or add a hidden flag.
    // We will assume the UI filters by a `hidden` property we can append.
    config.steps.forEach(step => {
      if (step.visibilityCondition) {
        (step as any).hidden = !step.visibilityCondition(data);
      } else {
        (step as any).hidden = false;
      }
    });
  }

  public destroy() {
    this.draftService.destroy();
  }
}
