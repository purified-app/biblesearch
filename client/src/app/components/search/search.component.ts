import { ChangeDetectionStrategy, Component, inject, resource, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonSearchbar,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { TextKey } from 'src/app/constants/text-key';
import { Verse } from 'src/app/interfaces';
import { HighlightPipe } from 'src/app/pipes/highlight.pipe';
import { ApiService, SearchResponse } from 'src/app/services/api.service';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  imports: [
    HighlightPipe,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonPopover,
    IonSearchbar,
    IonSpinner,
    IonText,
    RouterLink,
    TranslatePipe,
  ],
  template: `
    <ion-popover
      alignment="center"
      side="bottom"
      [event]="{ clientX: 0, clientY: 64 }"
      [reference]="'event'"
      [showBackdrop]="false"
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
            @if (searchResults.isLoading()) {
            <ion-spinner></ion-spinner>
            } @if(searchResults.value()?.verses) {
            <ion-text class="search-results-count">
              <sub>
                {{ TextKey.Showing | translate }} {{ searchResults.value()?.verses?.length }}
                {{ TextKey.Of | translate }} {{ searchResults.value()?.count }}
              </sub>
            </ion-text>
            <ion-list>
              @for (verse of searchResults.value()?.verses; track $index) {
              <ion-item
                [routerLink]="['/read', verse.translation, verse.bookUsfm, verse.chapter]"
                [queryParams]="{ verse: verse.verse, search: null }"
              >
                <ion-label>
                  <div class="verse-header">
                    <h2 [innerHTML]="getListHeader(verse) | highlightSearch : searchTerm()"></h2>
                    <!-- <h3>{{ verse.canon.toUpperCase()}}</h3> -->
                  </div>
                  <p [innerHTML]="verse.text | highlightSearch : searchTerm()"></p>
                </ion-label>
              </ion-item>
              }
            </ion-list>
            }
          </div>
        </ion-content>
      </ng-template>
    </ion-popover>
  `,
  styleUrl: './search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  protected searchService = inject(SearchService);
  private apiService = inject(ApiService);

  protected TextKey = TextKey;

  readonly ionSearchbar = viewChild.required(IonSearchbar);

  searchTerm = this.searchService.searchTerm;

  searchResults = resource<SearchResponse, { search: string }>({
    request: () => ({ search: this.searchTerm() }),
    loader: async ({ request }) => {
      if (request.search.length < 2) return { verses: [], count: 0 };
      return await this.apiService.search(request.search);
    },
  });

  protected getListHeader = (data: Verse) => {
    const { bookName, chapter, verse } = data;
    return `${bookName} ${chapter}:${verse}`;
  };

  protected onSearchInput(event: Event) {
    const element = event.target as HTMLInputElement;
    const value = element.value.trim();
    this.searchService.updateSearchQueryParam(value);
  }
}
