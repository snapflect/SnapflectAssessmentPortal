import { TestBed } from '@angular/core/testing';
import { GlobalSearchService } from './global-search.service';

describe('GlobalSearchService', () => {
  let service: GlobalSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('filter', () => {
    it('should return original items if items is null or undefined', () => {
      expect(service.filter(null as any, 'test')).toBeNull();
      expect(service.filter(undefined as any, 'test')).toBeUndefined();
    });

    it('should return original items if searchTerm is null or empty', () => {
      const items = [{ id: 1 }];
      expect(service.filter(items, null as any)).toBe(items);
      expect(service.filter(items, '')).toBe(items);
      expect(service.filter(items, '   ')).toBe(items);
    });

    it('should filter items based on string property', () => {
      const items = [
        { name: 'Apple' },
        { name: 'Banana' },
        { name: 'Orange' }
      ];
      const result = service.filter(items, 'app');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Apple');
    });

    it('should filter items based on number property', () => {
      const items = [
        { id: 123, name: 'Apple' },
        { id: 456, name: 'Banana' }
      ];
      const result = service.filter(items, '45');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(456);
    });

    it('should filter items recursively in nested objects', () => {
      const items = [
        { id: 1, info: { tag: 'fruit' } },
        { id: 2, info: { tag: 'vegetable' } }
      ];
      const result = service.filter(items, 'fruit');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
    });

    it('should handle null or undefined property values gracefully', () => {
      const items = [
        { name: 'Apple', desc: null },
        { name: 'Banana', desc: undefined }
      ];
      expect(() => service.filter(items, 'app')).not.toThrow();
    });
  });
});
