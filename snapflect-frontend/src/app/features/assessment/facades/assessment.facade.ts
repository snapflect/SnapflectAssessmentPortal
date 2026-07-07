import { Injectable, inject } from '@angular/core';
import { AssessmentApiService } from '../../../core/api/assessment-api.service';
import { AssessmentStore } from '../../../shared/stores/assessment.store';
import { QuestionBankStore } from '../../../shared/stores/question-bank.store';
import { QuestionStore } from '../../../shared/stores/question.store';
import { CompetencyStore } from '../../../shared/stores/competency.store';
import { BlueprintStore } from '../../../shared/stores/blueprint.store';
import { tap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class AssessmentFacade {
  private api = inject(AssessmentApiService);
  private assessmentStore = inject(AssessmentStore);
  private qbStore = inject(QuestionBankStore);
  private qStore = inject(QuestionStore);
  private compStore = inject(CompetencyStore);
  private bpStore = inject(BlueprintStore);
  public loadAssessments() { return this.api.getAssessments().pipe(tap(res => this.assessmentStore.setAssessments(res.data))); }
  public loadQuestionBanks() { return this.api.getQuestionBanks().pipe(tap(res => this.qbStore.setQuestionBanks(res.data))); }
  public loadQuestions() { return this.api.getQuestions().pipe(tap(res => this.qStore.setQuestions(res.data))); }
  public loadCompetencies() { return this.api.getCompetencies().pipe(tap(res => this.compStore.setCompetencies(res.data))); }
  public loadBlueprints() { return this.api.getBlueprints().pipe(tap(res => this.bpStore.setBlueprints(res.data))); }
  
  public createAssessment(data: any): any { return null; }
  public updateAssessment(id: string, data: any): any { return null; }
  public saveBlueprint(data: any): any { return null; }
  public createQuestion(data: any): any { return null; }
}