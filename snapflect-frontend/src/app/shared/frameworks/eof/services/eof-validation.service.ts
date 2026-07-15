import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EofWizardConfig, EofValidationStatus, EofValidationRule } from '../models/eof-config.model';

@Injectable({ providedIn: 'root' })
export class EofValidationService {
  
  private progressSubject = new BehaviorSubject<number>(0);
  public progress$ = this.progressSubject.asObservable();

  // Evaluates the overall progress of the wizard based on all visible steps
  public calculateProgress(config: EofWizardConfig): void {
    if (!config || !config.steps || config.steps.length === 0) {
      this.progressSubject.next(0);
      return;
    }

    const visibleSteps = config.steps.filter(s => !(s as any).hidden);
    if (visibleSteps.length === 0) {
      this.progressSubject.next(0);
      return;
    }

    let completedWeight = 0;
    visibleSteps.forEach(s => {
      if (s.status === 'valid') completedWeight += 1;
      else if (s.status === 'warning') completedWeight += 0.5;
    });

    const percentage = Math.round((completedWeight / visibleSteps.length) * 100);
    this.progressSubject.next(percentage);
  }

  // Returns true if all blocking rules are satisfied
  public isReadyForActivation(config: EofWizardConfig): boolean {
    if (!config) return false;
    for (const step of config.steps) {
      if (step.isRequired && step.status !== 'valid') {
        return false;
      }
      // Even optional steps might have blocking rules if they are partially filled
      const blockingRules = step.validationRules.filter(r => r.isBlocking);
      for (const rule of blockingRules) {
        if (rule.status === 'invalid') {
          return false;
        }
      }
    }
    return true;
  }

  // Aggregate all validation rules across the wizard that are in 'invalid' or 'warning' state
  public getPendingActionables(config: EofWizardConfig): { stepName: string, rule: EofValidationRule }[] {
    const actionables: { stepName: string, rule: EofValidationRule }[] = [];
    if (!config) return actionables;

    config.steps.forEach(step => {
      step.validationRules.forEach(rule => {
        if (rule.status === 'invalid' || rule.status === 'warning') {
          actionables.push({
            stepName: step.displayName,
            rule
          });
        }
      });
    });

    return actionables;
  }
}
