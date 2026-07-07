import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { loadingInterceptor } from './loading.interceptor';
import { of } from 'rxjs';

describe('loadingInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: []
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call next and finalize without errors', (done) => {
    TestBed.runInInjectionContext(() => {
      const nextFn = jasmine.createSpy('next').and.returnValue(of('handled'));
      const req = { url: '/api/data' } as any;

      loadingInterceptor(req, nextFn).subscribe({
        next: (result) => {
          expect(result).toEqual('handled' as any);
          expect(nextFn).toHaveBeenCalledWith(req);
          done();
        }
      });
    });
  });
});