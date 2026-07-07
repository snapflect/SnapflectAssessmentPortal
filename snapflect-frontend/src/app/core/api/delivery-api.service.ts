import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class DeliveryApiService extends BaseApiService {
  public getSessions(): Observable<any> { return this.http.get(this.baseUrl + '/delivery/sessions'); }
  public startAttempt(sessionUuid: string): Observable<any> { return this.http.post(this.baseUrl + '/delivery/sessions/' + sessionUuid + '/attempts', {}); }
  public getAttempt(attemptUuid: string): Observable<any> { return this.http.get(this.baseUrl + '/delivery/attempts/' + attemptUuid); }
  public saveAnswer(attemptUuid: string, payload: any): Observable<any> { return this.http.post(this.baseUrl + '/delivery/attempts/' + attemptUuid + '/answers', payload); }
  public submitAttempt(attemptUuid: string): Observable<any> { return this.http.post(this.baseUrl + '/delivery/attempts/' + attemptUuid + '/submit', {}); }
  public getAttemptResult(attemptUuid: string): Observable<any> { return this.http.get(this.baseUrl + '/delivery/attempts/' + attemptUuid + '/result'); }
  public navigateQuestion(attemptUuid: string, direction: 'next' | 'previous' | 'jump', currentQuestionUuid?: string): Observable<any> {
    if (direction === 'jump' && currentQuestionUuid) {
      return this.http.get(`${this.baseUrl}/delivery/attempts/${attemptUuid}/questions/${currentQuestionUuid}?current_question=${currentQuestionUuid}`);
    }
    
    let url = this.baseUrl + `/delivery/questions/${attemptUuid}/${direction}`;
    if (currentQuestionUuid) url += `?current_question=${currentQuestionUuid}`;
    return this.http.get(url);
  }
  public toggleFlag(attemptUuid: string, questionUuid: string, isFlagged: boolean): Observable<any> {
    const endpoint = isFlagged ? 'flag' : 'unflag';
    return this.http.post(`${this.baseUrl}/delivery/questions/${questionUuid}/${endpoint}`, {
      attempt_uuid: attemptUuid,
      attempt_question_uuid: questionUuid
    });
  }
  public getQuestions(attemptUuid: string): Observable<any> {
    return this.http.get(this.baseUrl + `/delivery/attempts/${attemptUuid}/questions`);
  }
  public getQuestion(questionUuid: string): Observable<any> {
    return this.http.get(this.baseUrl + `/delivery/questions/${questionUuid}`);
  }
}