import { Component, inject, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSelectComponent } from 'src/app/components/language-select/language-select.component';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { AllBooks } from 'src/app/constants/books';
import { TextKey } from 'src/app/constants/text-key';
import { Book } from 'src/app/interfaces';

@Component({
  selector: 'app-books',
  imports: [
    LanguageSelectComponent,
    PageHeaderComponent,
    IonContent,
    IonItem,
    IonList,
    IonListHeader,
    IonLabel,
    IonRouterLink,
    RouterLink,
    TranslatePipe,
  ],
  template: `
    <app-page-header>
      <app-language-select toolbarEnd></app-language-select>
    </app-page-header>
    <ion-content class="ion-padding">
      @let translation = routeParamMap()?.get('translation');
      <ion-list>
        <ion-list-header style="font-size: 1.2em; font-weight: bold;">
          {{ TextKey.OldTestament | translate }}
        </ion-list-header>
        @for (book of booksOT(); track book.bookNumber) {
        <ion-item
          routerDirection="forward"
          [routerLink]="['/read', translation, book.usfm]"
          detail="true"
        >
          <ion-label>{{ book.name }}</ion-label>
        </ion-item>
        }
      </ion-list>
      <ion-list>
        <ion-list-header style="font-size: 1.2em; font-weight: bold;">
          {{ TextKey.NewTestament | translate }}
        </ion-list-header>
        @for (book of booksNT(); track book.bookNumber) {
        <ion-item
          routerDirection="forward"
          [routerLink]="['/read', translation, book.usfm]"
          detail="true"
        >
          <ion-label>{{ book.name }}</ion-label>
        </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
  styles: ['ion-item { cursor: pointer;}'],
})
export class BooksPage {
  booksNT: WritableSignal<Book[]>;
  booksOT: WritableSignal<Book[]>;
  // readonly searchbar = viewChild.required(IonSearchbar);
  protected activatedRoute = inject(ActivatedRoute);
  protected routeParamMap = toSignal(this.activatedRoute.paramMap);
  protected TextKey = TextKey;

  constructor() {
    const { translation } = this.activatedRoute.snapshot.params;
    const books = AllBooks[translation as keyof typeof AllBooks];
    const booksNT = books.filter((b) => b.canon === 'nt');
    const booksOT = books.filter((b) => b.canon === 'ot');
    this.booksNT = signal(booksNT);
    this.booksOT = signal(booksOT);
  }

  // ngAfterViewInit(): void {
  //   setTimeout(() => this.searchbar().setFocus());
  // }

  // onSearch(event: any) {
  //   const translation = this.routeParamMap()?.get('translation');
  //   const books = allBooks[translation as keyof typeof allBooks];
  //   const booksFiltered = books.filter((book) =>
  //     book.name.toLowerCase().includes(event.target.value.toLowerCase())
  //   );
  //   this.books.set(booksFiltered);
  // }
}
