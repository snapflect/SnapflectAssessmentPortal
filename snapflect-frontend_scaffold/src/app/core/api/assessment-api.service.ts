import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AssessmentApiService extends BaseApiService {
  public getAssessments(): Observable<any> { return this.http.get(this.baseUrl + '/assessments'); }
  public getQuestionBanks(): Observable<any> { return this.http.get(this.baseUrl + '/question-banks'); }
  public getQuestions(): Observable<any> { return this.http.get(this.baseUrl + '/questions'); }
  public getCompetencies(): Observable<any> { return this.http.get(this.baseUrl + '/competencies'); }
  public getBlueprints(): Observable<any> { return this.http.get(this.baseUrl + '/blueprints'); }
  public getPublications(assessmentUuid: string): Observable<any> { return this.http.get(this.baseUrl + '/assessments/' + assessmentUuid + '/publications'); }
}