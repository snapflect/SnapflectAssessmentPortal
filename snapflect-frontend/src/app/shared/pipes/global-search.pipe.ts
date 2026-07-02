import { Pipe, PipeTransform, inject } from '@angular/core';
import { GlobalSearchService } from '../services/global-search.service';

@Pipe({
  name: 'globalSearch',
  standalone: true
})
export class GlobalSearchPipe implements PipeTransform {
  private globalSearchService = inject(GlobalSearchService);

  transform<T>(items: T[], searchTerm: string): T[] {
    return this.globalSearchService.filter(items, searchTerm);
  }
}
