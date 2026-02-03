import { AfterViewInit, Component, computed, inject, resource, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { Verse } from 'src/app/interfaces';
import { HighlightSearchPipe } from 'src/app/pipes/highlight-search.pipe';
import { ApiService, SearchReqParams, SearchResponse } from 'src/app/services/api.service';
import { TextKey } from '../../constants/text-key';
import { QueryParam } from '../../constants/query-param';

@Component({
  imports: [
    PageHeaderComponent,
    HighlightSearchPipe,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonSpinner,
    IonText,
    RouterLink,
    TranslatePipe,
  ],
  styleUrl: './search.page.css',
  templateUrl: './search.page.html',
})
export class SearchPage implements AfterViewInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly TextKey = TextKey;
  protected readonly QueryParam = QueryParam;
  protected readonly searchbar = viewChild.required(IonSearchbar);
  protected queryParams = toSignal(this.route.queryParams);
  protected searchTerm = computed(() => this.queryParams()?.['query'] || '');
  protected searchResults = resource<SearchResponse, SearchReqParams>({
    params: () => this.queryParams() as SearchReqParams,
    loader: async ({ params }) => {
      if (!params.query || params.query.length < 2) return { verses: [], count: 0 };
      return await this.apiService.search(params);
    },
  });

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.searchbar().setFocus());
  }

  protected onSearchInput(event: Event) {
    const element = event.target as HTMLInputElement;
    const value = element.value.trim();
    this.updateSearchQueryParam(value);
  }

  protected getListHeader = (data: Verse) => {
    const { bookName, chapter, verse } = data;
    return `${bookName} ${chapter}:${verse}`;
  };

  protected getQueryParams(verse: Verse) {
    return { [QueryParam.FocusVerses]: verse.verse };
  }

  private updateSearchQueryParam(value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { query: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
