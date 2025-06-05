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
import { HighlightPipe } from 'src/app/pipes/highlight.pipe';
import { ApiService, SearchResponse } from 'src/app/services/api.service';
import { TextKey } from '../../constants/text-key';

@Component({
  imports: [
    PageHeaderComponent,
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
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly TextKey = TextKey;
  protected readonly searchbar = viewChild.required(IonSearchbar);
  protected queryParams = toSignal(this.route.queryParams);
  protected searchTerm = computed(() => this.queryParams()?.['q'] || '');
  protected searchResults = resource<SearchResponse, { search: string }>({
    params: () => ({ search: this.searchTerm() }),
    loader: async ({ params }) => {
      if (params.search.length < 2) return { verses: [], count: 0 };
      return await this.apiService.search(params.search);
    },
  });

  ngAfterViewInit(): void {
    setTimeout(() => this.searchbar().setFocus(), 10);
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

  private updateSearchQueryParam(value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
