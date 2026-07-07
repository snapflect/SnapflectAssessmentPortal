import { TestBed } from '@angular/core/testing';
import { AssessmentFacade } from './assessment.facade';
import { AssessmentApiService } from '../../../core/api/assessment-api.service';
import { AssessmentStore } from '../../../shared/stores/assessment.store';
import { QuestionBankStore } from '../../../shared/stores/question-bank.store';
import { QuestionStore } from '../../../shared/stores/question.store';
import { CompetencyStore } from '../../../shared/stores/competency.store';
import { BlueprintStore } from '../../../shared/stores/blueprint.store';
import { of } from 'rxjs';

describe('AssessmentFacade', () => {
  let facade: AssessmentFacade;
  let apiServiceSpy: jasmine.SpyObj<AssessmentApiService>;
  let assessmentStoreSpy: jasmine.SpyObj<AssessmentStore>;
  let qbStoreSpy: jasmine.SpyObj<QuestionBankStore>;
  let qStoreSpy: jasmine.SpyObj<QuestionStore>;
  let compStoreSpy: jasmine.SpyObj<CompetencyStore>;
  let bpStoreSpy: jasmine.SpyObj<BlueprintStore>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('AssessmentApiService', [
      'getAssessments',
      'getQuestionBanks',
      'getQuestions',
      'getCompetencies',
      'getBlueprints'
    ]);
    const aStoreSpy = jasmine.createSpyObj('AssessmentStore', ['setAssessments']);
    const qbSpy = jasmine.createSpyObj('QuestionBankStore', ['setQuestionBanks']);
    const qSpy = jasmine.createSpyObj('QuestionStore', ['setQuestions']);
    const compSpy = jasmine.createSpyObj('CompetencyStore', ['setCompetencies']);
    const bpSpy = jasmine.createSpyObj('BlueprintStore', ['setBlueprints']);

    TestBed.configureTestingModule({
      providers: [
        AssessmentFacade,
        { provide: AssessmentApiService, useValue: apiSpy },
        { provide: AssessmentStore, useValue: aStoreSpy },
        { provide: QuestionBankStore, useValue: qbSpy },
        { provide: QuestionStore, useValue: qSpy },
        { provide: CompetencyStore, useValue: compSpy },
        { provide: BlueprintStore, useValue: bpSpy },
      ]
    });

    facade = TestBed.inject(AssessmentFacade);
    apiServiceSpy = TestBed.inject(AssessmentApiService) as jasmine.SpyObj<AssessmentApiService>;
    assessmentStoreSpy = TestBed.inject(AssessmentStore) as jasmine.SpyObj<AssessmentStore>;
    qbStoreSpy = TestBed.inject(QuestionBankStore) as jasmine.SpyObj<QuestionBankStore>;
    qStoreSpy = TestBed.inject(QuestionStore) as jasmine.SpyObj<QuestionStore>;
    compStoreSpy = TestBed.inject(CompetencyStore) as jasmine.SpyObj<CompetencyStore>;
    bpStoreSpy = TestBed.inject(BlueprintStore) as jasmine.SpyObj<BlueprintStore>;
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should load assessments and update the store', () => {
    const mockData = [{ id: 1, title: 'Assessment 1' }];
    apiServiceSpy.getAssessments.and.returnValue(of({ data: mockData }));

    facade.loadAssessments().subscribe();

    expect(apiServiceSpy.getAssessments).toHaveBeenCalled();
    expect(assessmentStoreSpy.setAssessments).toHaveBeenCalledWith(mockData);
  });

  it('should load question banks and update the store', () => {
    const mockData = [{ id: 1, name: 'Bank 1' }];
    apiServiceSpy.getQuestionBanks.and.returnValue(of({ data: mockData }));

    facade.loadQuestionBanks().subscribe();

    expect(apiServiceSpy.getQuestionBanks).toHaveBeenCalled();
    expect(qbStoreSpy.setQuestionBanks).toHaveBeenCalledWith(mockData);
  });

  it('should load questions and update the store', () => {
    const mockData = [{ id: 1, text: 'Question 1' }];
    apiServiceSpy.getQuestions.and.returnValue(of({ data: mockData }));

    facade.loadQuestions().subscribe();

    expect(apiServiceSpy.getQuestions).toHaveBeenCalled();
    expect(qStoreSpy.setQuestions).toHaveBeenCalledWith(mockData);
  });

  it('should load competencies and update the store', () => {
    const mockData = [{ id: 1, name: 'Competency 1' }];
    apiServiceSpy.getCompetencies.and.returnValue(of({ data: mockData }));

    facade.loadCompetencies().subscribe();

    expect(apiServiceSpy.getCompetencies).toHaveBeenCalled();
    expect(compStoreSpy.setCompetencies).toHaveBeenCalledWith(mockData);
  });

  it('should load blueprints and update the store', () => {
    const mockData = [{ id: 1, name: 'Blueprint 1' }];
    apiServiceSpy.getBlueprints.and.returnValue(of({ data: mockData }));

    facade.loadBlueprints().subscribe();

    expect(apiServiceSpy.getBlueprints).toHaveBeenCalled();
    expect(bpStoreSpy.setBlueprints).toHaveBeenCalledWith(mockData);
  });
});