import { AfterViewInit, Component, inject, resource, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonList,
  IonSearchbar,
  IonContent,
  IonItem,
  IonLabel,
  IonToolbar,
  IonHeader,
  IonSpinner,
} from '@ionic/angular/standalone';
import { HeaderMenuTitleComponent } from 'src/app/components/header-menu-title.component';
import { Verse } from 'src/app/interfaces';
import { HighlightPipe } from 'src/app/pipes/highlight.pipe';
import { ApiService } from 'src/app/services/api.service';

@Component({
  imports: [
    HighlightPipe,
    IonLabel,
    IonItem,
    IonHeader,
    IonToolbar,
    IonContent,
    IonSearchbar,
    IonSpinner,
    IonList,
    RouterLink,
    HeaderMenuTitleComponent,
  ],
  styleUrl: './search.page.css',
  templateUrl: './search.page.html',
})
export class SearchPage implements AfterViewInit {
  searchTerm = '';

  search = signal<string>('');
  apiService = inject(ApiService);

  searchResults = resource<Verse[], { search: string }>({
    request: () => ({ search: this.search() }),
    loader: async ({ request }) => {
      if (request.search.length < 2) return [];
      return await this.apiService.search(request.search);
    },
  });
  readonly searchbar = viewChild.required(IonSearchbar);

  ngAfterViewInit(): void {
    setTimeout(() => this.searchbar().setFocus());
  }

  onSearchInput(event: any) {
    this.searchTerm = event.target.value.trim();
    this.search.set(this.searchTerm);
  }

  getListHeader = (data: Verse) => {
    const { book_name, chapter, verse } = data;
    return `${book_name} ${chapter}:${verse}`;
  };
}
