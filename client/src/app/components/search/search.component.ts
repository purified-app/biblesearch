import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { IonContent, IonPopover, IonSearchbar, IonSpinner } from '@ionic/angular/standalone';
import { SearchResultsListComponent } from 'src/app/components/search-results-list/search-results-list.component';
import { TextKey } from 'src/app/constants/text-key';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  imports: [IonContent, IonPopover, IonSearchbar, IonSpinner, SearchResultsListComponent],
  template: `
    <ion-popover
      alignment="center"
      side="bottom"
      [event]="{ clientX: 0, clientY: 64 }"
      [reference]="'event'"
      [showBackdrop]="true"
      [isOpen]="searchService.isSearchOpen()"
      (didDismiss)="searchService.togglePopover(false)"
      (didPresent)="ionSearchbar().setFocus()"
    >
      <ng-template>
        <ion-content>
          <ion-searchbar
            color="light"
            placeholder="Rom 8 | God so loved"
            (ionInput)="onSearchInput($event)"
            [value]="searchTerm()"
          ></ion-searchbar>
          <div class="search-results">
            @if (searchService.searchResults.isLoading()) {
              <ion-spinner></ion-spinner>
            }
            <app-search-results-list
              [results]="searchService.searchResults.value()"
              [searchTerm]="searchTerm()"
            ></app-search-results-list>
          </div>
        </ion-content>
      </ng-template>
    </ion-popover>
  `,
  styleUrl: './search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPopover {
  protected searchService = inject(SearchService);

  protected TextKey = TextKey;

  readonly ionSearchbar = viewChild.required(IonSearchbar);

  searchTerm = this.searchService.searchTerm;

  protected onSearchInput(event: Event) {
    const element = event.target as HTMLInputElement;
    const value = element.value;
    this.searchService.updateSearchQueryParam(value);
  }
}
