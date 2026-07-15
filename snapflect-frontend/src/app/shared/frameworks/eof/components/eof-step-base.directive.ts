import { Directive, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EofEngineService } from '../../services/eof-engine.service';
import { EofStepConfig, EofValidationStatus, EofValidationRule } from '../../models/eof-config.model';

@Directive()
export abstract class EofBaseStep implements OnInit, OnDestroy {
  @Input() stepId!: string;

  protected engine = inject(EofEngineService);
  protected subs = new Subscription();
  
  abstract form: FormGroup;

  ngOnInit() {
    // Listen for global data changes and populate local form if needed
    this.subs.add(this.engine.entityData$.subscribe(data => {
      this.onDataLoaded(data);
    }));

    // Listen for local form changes to update global state and validation
    this.subs.add(this.form.valueChanges.subscribe(value => {
      this.engine.updateEntityData(value);
      this.evaluateValidation();
    }));
    
    // Initial validation evaluation
    this.evaluateValidation();
  }

  // Lifecycle hook for child component to patch form values
  protected onDataLoaded(data: any): void {
    if (data) {
      this.form.patchValue(data, { emitEvent: false });
    }
  }

  protected evaluateValidation() {
    const rules = this.getValidationRules();
    
    let status: EofValidationStatus = 'pending';
    if (this.form.valid) {
      status = 'valid';
    } else if (this.form.dirty || this.form.touched) {
      status = 'invalid';
    }

    this.engine.updateStepValidation(this.stepId, status, rules);
  }

  // Child component defines specific rules based on its form state
  protected abstract getValidationRules(): EofValidationRule[];

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
