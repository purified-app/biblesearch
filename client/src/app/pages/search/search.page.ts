import { AfterViewInit, Component, inject, resource, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Verse } from 'src/app/interfaces';
import { HighlightPipe } from 'src/app/pipes/highlight.pipe';
import { ApiService } from 'src/app/services/api.service';

@Component({
  imports: [
    HighlightPipe,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonSpinner,
    RouterLink,
  ],
  styleUrl: './search.page.css',
  templateUrl: './search.page.html',
})
export class SearchPage implements AfterViewInit {
  apiService = inject(ApiService);

  searchTerm = signal<string>('');
  searchResults = resource<Verse[], { search: string }>({
    request: () => ({ search: this.searchTerm() }),
    loader: async ({ request }) => {
      if (request.search.length < 2) return [];
      return await this.apiService.search(request.search);
    },
  });

  readonly searchbar = viewChild.required(IonSearchbar);

  ngAfterViewInit(): void {
    setTimeout(() => this.searchbar().setFocus(), 10);
  }

  onSearchInput(event: Event) {
    const element = event.target as HTMLInputElement;
    this.searchTerm.set(element.value.trim());
  }

  getListHeader = (data: Verse) => {
    const { bookName, chapter, verse } = data;
    return `${bookName} ${chapter}:${verse}`;
  };
}
