import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  /**
   * Filters an array of objects based on a search term.
   * Recursively searches through all string or number values in each object.
   */
  public filter<T>(items: T[], searchTerm: string): T[] {
    if (!items || !searchTerm) return items;
    const term = searchTerm.toLowerCase().trim();
    if (term === '') return items;

    return items.filter(item => this.matchItem(item, term));
  }

  private matchItem(item: any, term: string): boolean {
    if (item == null) return false;

    if (typeof item === 'string') {
      return item.toLowerCase().includes(term);
    }
    
    if (typeof item === 'number') {
      return item.toString().includes(term);
    }

    if (typeof item === 'object') {
      for (const key of Object.keys(item)) {
        const value = item[key];
        if (this.matchItem(value, term)) {
          return true;
        }
      }
    }

    return false;
  }
}
