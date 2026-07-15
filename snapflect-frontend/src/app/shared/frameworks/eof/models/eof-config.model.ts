export type EofLifecycleState = 'draft' | 'in_progress' | 'configured' | 'validated' | 'ready' | 'activated' | 'suspended' | 'archived';

export type EofValidationStatus = 'pending' | 'valid' | 'invalid' | 'warning';

export interface EofValidationRule {
  id: string;
  description: string;
  status: EofValidationStatus;
  message?: string;
  isBlocking?: boolean; // If true, prevents moving to 'validated'/'ready' state
}

export interface EofStepConfig {
  id: string;
  displayName: string;
  order: number;
  isRequired: boolean;
  componentPath?: string; // e.g., mapping ID for the dynamic component to render
  visibilityCondition?: (context: any) => boolean;
  status: EofValidationStatus;
  validationRules: EofValidationRule[];
}

export interface EofWizardConfig {
  wizardId: string;
  entityType: string;
  title: string;
  description: string;
  steps: EofStepConfig[];
  initialState: EofLifecycleState;
}

export interface EofContextRecommendation {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  actionLabel?: string;
  actionId?: string;
}
