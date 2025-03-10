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
import { Verse } from 'src/app/interfaces';
import { HighlightPipe } from 'src/app/pipes/highlight.pipe';
import { ApiService, SearchResponse } from 'src/app/services/api.service';
import { TextKey } from '../../constants/text-key';

@Component({
  imports: [
    HighlightPipe,
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
  apiService = inject(ApiService);

  protected TextKey = TextKey;

  readonly searchbar = viewChild.required(IonSearchbar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  queryParams = toSignal(this.route.queryParams);
  searchTerm = computed(() => this.queryParams()?.['q'] || '');

  searchResults = resource<SearchResponse, { search: string }>({
    request: () => ({ search: this.searchTerm() }),
    loader: async ({ request }) => {
      if (request.search.length < 2) return { verses: [], count: 0 };
      return await this.apiService.search(request.search);
    },
  });

  ngAfterViewInit(): void {
    setTimeout(() => this.searchbar().setFocus(), 10);
  }

  onSearchInput(event: Event) {
    const element = event.target as HTMLInputElement;
    const value = element.value.trim();
    this.updateSearchQueryParam(value);
  }

  getListHeader = (data: Verse) => {
    const { bookName, chapter, verse } = data;
    return `${bookName} ${chapter}:${verse}`;
  };

  private updateSearchQueryParam(value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
