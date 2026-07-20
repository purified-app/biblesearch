import { computed, inject, Injectable, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, SearchReqParams, SearchResponse } from 'src/app/services/api.service';
import { BibleTranslationService } from 'src/app/services/bible-translation.service';

const SEARCH = 'search';
const QUERY = 'query';
const SORT = 'sort';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private bibleTranslation = inject(BibleTranslationService);

  // Convert queryParams Observable to a Signal
  queryParams = toSignal(this.activatedRoute.queryParams);
  isSearchOpen = computed(() => this.queryParams()?.[SEARCH] === 'open');
  searchTerm = computed(() => this.queryParams()?.[QUERY] || '');
  sortOrder = computed(() => (this.queryParams()?.[SORT] as 'relevance' | 'chronological') || 'chronological');
  private searchParams = computed<SearchReqParams>(() => ({
    ...(this.queryParams() as SearchReqParams),
    translations:
      this.queryParams()?.['translations'] || this.bibleTranslation.translation() || 'KJV',
  }));

  // Global search resource
  searchResults = resource<SearchResponse, SearchReqParams>({
    params: this.searchParams,
    loader: async ({ params }) => {
      const trimmedQuery = params.query?.trim() || '';
      if (trimmedQuery.length < 2) return { verses: [], count: 0 };
      return await this.apiService.search({ ...params, query: trimmedQuery });
    },
  });

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

  updateSortOrder(value: 'relevance' | 'chronological'): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { [SORT]: value === 'chronological' ? null : value },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
