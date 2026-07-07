import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManualReviewPageComponent } from './manual-review-page.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

describe('ManualReviewPageComponent', () => {
  let component: ManualReviewPageComponent;
  let fixture: ComponentFixture<ManualReviewPageComponent>;
  let httpMock: HttpTestingController;

  const mockReview = {
    uuid: 'rev-1',
    attributes: { question_text: 'Q1', candidate_answer: 'A1', max_score: 10, status: 'PENDING' },
    relationships: {
      result: {
        uuid: 'res-1',
        relationships: {
          candidate: { attributes: { first_name: 'John', last_name: 'Doe' } }
        }
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualReviewPageComponent, HttpClientTestingModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ManualReviewPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and fetch pending reviews on init', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/pending`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [mockReview] });
    
    expect(component).toBeTruthy();
    expect(component.pendingReviews.length).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when fetching pending reviews', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/pending`);
    req.error(new ErrorEvent('Network error'));
    
    expect(component.pendingReviews).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  describe('selectReview', () => {
    beforeEach(() => {
      const req = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/pending`);
      req.flush({ data: [mockReview] });
    });

    it('should lock and select review successfully', () => {
      component.selectReview(mockReview);
      
      const req = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/${mockReview.uuid}/lock`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: mockReview });
      
      expect(component.activeReview).toEqual(mockReview as any);
      expect(component.currentResultUuid).toBe('res-1');
      expect(component.scoreForm.get('awarded_score')?.value).toBe(0);
    });

    it('should handle 409 conflict when locking review', () => {
      spyOn(window, 'alert');
      component.pendingReviews = [mockReview as any];
      
      component.selectReview(mockReview);
      
      const req = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/${mockReview.uuid}/lock`);
      req.flush('Locked by another user', { status: 409, statusText: 'Conflict' });
      
      expect(window.alert).toHaveBeenCalled();
      expect(component.pendingReviews.length).toBe(0);
      expect(component.activeReview).toBeNull();
    });
  });

  it('should calculate getInitials correctly', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/pending`);
    req.flush({ data: [] });
    
    const initials = component.getInitials(mockReview as any);
    expect(initials).toBe('JD');
  });

  it('should calculate getScorePct correctly', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/pending`);
    req.flush({ data: [] });
    
    component.activeReview = mockReview as any;
    component.scoreForm.patchValue({ awarded_score: 5 });
    
    expect(component.getScorePct()).toBe(50);
  });

  it('should submit score and refresh pending reviews', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/pending`);
    req.flush({ data: [] });
    
    component.activeReview = mockReview as any;
    component.scoreForm.patchValue({ awarded_score: 8, notes: 'Good' });
    
    component.submitScore();
    
    const patchReq = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/${mockReview.uuid}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ awarded_score: 8, notes: 'Good' });
    patchReq.flush({});
    
    expect(component.submitting).toBeFalse();
    expect(component.activeReview).toBeNull();
    
    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/pending`);
    refreshReq.flush({ data: [] });
  });

  it('should skip review and refresh pending reviews', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/pending`);
    req.flush({ data: [] });
    
    component.activeReview = mockReview as any;
    
    component.skipReview();
    
    expect(component.activeReview).toBeNull();
    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/results/manual-reviews/pending`);
    refreshReq.flush({ data: [] });
  });
});
