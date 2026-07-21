import { Component, computed, inject, ChangeDetectionStrategy, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent, NavController } from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { UrlPath } from 'src/app/constants/url-path';
import { Book } from 'src/app/interfaces';
import { VersePageParams } from 'src/app/interfaces/route-params';
import { ApiService } from 'src/app/services/api.service';
import { LanguageSelectComponent } from '../../../components/language-select/language-select.component';

@Component({
  selector: 'app-chapters',
  imports: [LanguageSelectComponent, PageHeaderComponent, IonButton, IonContent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let bookUsfm = routeParams()?.['bookUsfm']; @let translation = routeParams()?.['translation'];
    <app-page-header toolbarTitle="">
      <ion-button toolbarButton (click)="goBackToChapters()">
        {{ activatedRoute.snapshot.data['title'] }}
      </ion-button>
      <app-language-select toolbarEnd></app-language-select>
    </app-page-header>
    <ion-content class="ion-padding">
      <div class="grid-container">
        @for (chapter of chapters(); track chapter) {
        <a [routerLink]="['/read', translation, bookUsfm, chapter]">
          <div class="grid-item">{{ chapter }}</div>
        </a>
        }
      </div>
    </ion-content>
  `,
  styles: [
    `
      .grid-container {
        display: grid;
        gap: 8px;
        grid-template-columns: auto auto auto auto auto;
        padding: 10px;
      }
      .grid-container > a {
        background-color: var(--ion-color-light-tint);
        border: 1px solid var(--ion-color-light-shade);
        border-radius: 8px;
        color: inherit;
        text-decoration: none;
      }
      .grid-item {
        aspect-ratio: 1 / 1;
        align-items: center;
        display: flex;
        font-size: 2rem;
        justify-content: center;
      }
    `,
  ],
})
export class ChaptersPage {
  protected activatedRoute = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private navController = inject(NavController);
  protected routeParams = toSignal<VersePageParams>(this.activatedRoute.params as any);
  private bookResource = resource<Book | undefined, VersePageParams>({
    params: () => this.routeParams()!,
    loader: async ({ params }) => {
      const books = await this.apiService.getBooks(params.translation);
      return books.find((book) => book.usfm === params.bookUsfm);
    },
  });
  protected chapters = computed(() => {
    const chapters = this.bookResource.value()?.chapters;
    return chapters ? Array.from({ length: chapters }, (_, index) => index + 1) : [];
  });

  protected goBackToChapters() {
    const { translation } = this.routeParams()!;
    this.navController.navigateBack([`/${UrlPath.read}/${translation}`]);
  }
}
