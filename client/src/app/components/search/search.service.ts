import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

const SEARCH = 'search';
const QUERY = 'query';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  // Convert queryParams Observable to a Signal
  queryParams = toSignal(this.activatedRoute.queryParams);
  isSearchOpen = computed(() => this.queryParams()?.[SEARCH] === 'open');
  searchTerm = computed(() => this.queryParams()?.[QUERY] || '');

  // Toggle popover and update URL
  togglePopover(open: boolean) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      // search=open
      queryParams: { [SEARCH]: open ? 'open' : null },
      queryParamsHandling: 'merge',
    });
  }

  updateSearchQueryParam(value: string): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { [QUERY]: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
