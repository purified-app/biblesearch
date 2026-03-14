import { AfterViewInit, Component, inject, viewChild } from '@angular/core';
import { IonContent, IonSearchbar, IonSpinner } from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { SearchResultsListComponent } from 'src/app/components/search-results-list/search-results-list.component';
import { SearchService } from 'src/app/components/search/search.service';
import { TextKey } from '../../constants/text-key';
import { QueryParam } from '../../constants/query-param';

@Component({
  imports: [PageHeaderComponent, IonContent, IonSearchbar, IonSpinner, SearchResultsListComponent],
  styleUrl: './search.page.css',
  templateUrl: './search.page.html',
})
export class SearchPage implements AfterViewInit {
  protected searchService = inject(SearchService);

  protected readonly TextKey = TextKey;
  protected readonly QueryParam = QueryParam;
  protected readonly searchbar = viewChild.required(IonSearchbar);

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.searchbar().setFocus());
  }

  protected onSearchInput(event: Event) {
    const element = event.target as HTMLInputElement;
    const value = element.value.trim();
    this.searchService.updateSearchQueryParam(value);
  }
}
