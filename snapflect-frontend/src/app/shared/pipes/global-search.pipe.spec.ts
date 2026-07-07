import { TestBed } from '@angular/core/testing';
import { GlobalSearchPipe } from './global-search.pipe';
import { GlobalSearchService } from '../services/global-search.service';

describe('GlobalSearchPipe', () => {
  let pipe: GlobalSearchPipe;
  let globalSearchService: jasmine.SpyObj<GlobalSearchService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('GlobalSearchService', ['filter']);
    TestBed.configureTestingModule({
      providers: [
        { provide: GlobalSearchService, useValue: spy }
      ]
    });
    globalSearchService = TestBed.inject(GlobalSearchService) as jasmine.SpyObj<GlobalSearchService>;
    TestBed.runInInjectionContext(() => {
      pipe = new GlobalSearchPipe();
    });
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call globalSearchService.filter with items and searchTerm', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const searchTerm = 'test';
    const filteredItems = [{ id: 1 }];
    
    globalSearchService.filter.and.returnValue(filteredItems);

    const result = pipe.transform(items, searchTerm);

    expect(globalSearchService.filter).toHaveBeenCalledWith(items, searchTerm);
    expect(result).toBe(filteredItems);
  });
});
