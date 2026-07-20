import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
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
import { TranslatePipe } from '@angular-libs/translate';
import { LanguageSelectComponent } from 'src/app/components/language-select/language-select.component';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { TextKey } from 'src/app/constants/text-key';
import { Book } from 'src/app/interfaces';
import { ApiService } from 'src/app/services/api.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,

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
  private apiService = inject(ApiService);
  protected activatedRoute = inject(ActivatedRoute);
  protected routeParamMap = toSignal(this.activatedRoute.paramMap);
  protected translation = computed(() => this.routeParamMap()?.get('translation') ?? '');
  private booksResource = resource<Book[], string>({
    params: this.translation,
    loader: ({ params }) => this.apiService.getBooks(params),
    defaultValue: [],
  });
  booksNT = computed(() => this.booksResource.value().filter((book) => book.canon === 'nt'));
  booksOT = computed(() => this.booksResource.value().filter((book) => book.canon === 'ot'));
  protected TextKey = TextKey;
}
