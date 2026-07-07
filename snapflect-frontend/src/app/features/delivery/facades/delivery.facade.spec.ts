import { TestBed } from '@angular/core/testing';
import { DeliveryFacade } from './delivery.facade';
import { DeliveryApiService } from '../../../core/api/delivery-api.service';
import { SessionStore } from '../../../shared/stores/session.store';
import { AttemptStore } from '../../../shared/stores/attempt.store';
import { of } from 'rxjs';

describe('DeliveryFacade', () => {
  let facade: DeliveryFacade;
  let apiSpy: jasmine.SpyObj<DeliveryApiService>;
  let sessionStoreSpy: jasmine.SpyObj<SessionStore>;
  let attemptStoreSpy: jasmine.SpyObj<AttemptStore>;

  beforeEach(() => {
    const apiMock = jasmine.createSpyObj('DeliveryApiService', ['getSessions', 'startAttempt', 'saveAnswer', 'submitAttempt']);
    const sessionMock = jasmine.createSpyObj('SessionStore', ['setSessions']);
    const attemptMock = jasmine.createSpyObj('AttemptStore', ['setCurrentAttempt', 'updateQuestionState', 'setIsSubmitting', 'setTimeRemaining', 'currentAttempt', 'setSubmissionResult', 'setElapsedSeconds']);

    TestBed.configureTestingModule({
      providers: [
        DeliveryFacade,
        { provide: DeliveryApiService, useValue: apiMock },
        { provide: SessionStore, useValue: sessionMock },
        { provide: AttemptStore, useValue: attemptMock }
      ]
    });

    facade = TestBed.inject(DeliveryFacade);
    apiSpy = TestBed.inject(DeliveryApiService) as jasmine.SpyObj<DeliveryApiService>;
    sessionStoreSpy = TestBed.inject(SessionStore) as jasmine.SpyObj<SessionStore>;
    attemptStoreSpy = TestBed.inject(AttemptStore) as jasmine.SpyObj<AttemptStore>;
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should load sessions and set in store', () => {
    const mockSessions = [{ id: 1 }, { id: 2 }];
    apiSpy.getSessions.and.returnValue(of({ data: mockSessions }));

    facade.loadSessions().subscribe();
    
    expect(apiSpy.getSessions).toHaveBeenCalled();
    expect(sessionStoreSpy.setSessions).toHaveBeenCalledWith(mockSessions);
  });

  it('should call saveAnswer on api service', () => {
    const payload = { answer: 'A' };
    apiSpy.saveAnswer.and.returnValue(of({ data: true }));

    facade.saveAnswer('attemptUuid', 'questionUuid', payload).subscribe();

    expect(apiSpy.saveAnswer).toHaveBeenCalledWith('attemptUuid', { attempt_uuid: 'attemptUuid', attempt_question_uuid: 'questionUuid', ...payload });
  });

  it('should call submitAttempt on api service', () => {
    apiSpy.submitAttempt.and.returnValue(of({ data: true }));

    facade.submitAttempt('uuid').subscribe();
    
    expect(apiSpy.submitAttempt).toHaveBeenCalledWith('uuid');
  });
});