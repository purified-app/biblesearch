import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent, NavController } from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { UrlPath } from 'src/app/constants/url-path';
import RouteUtils from 'src/app/utils/route.utils';
import { LanguageSelectComponent } from '../../../components/language-select/language-select.component';

@Component({
  selector: 'app-chapters',
  imports: [LanguageSelectComponent, PageHeaderComponent, IonButton, IonContent, RouterLink],
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
  private navController = inject(NavController);
  protected routeParams = toSignal(this.activatedRoute.params);
  protected chapters = computed(() => {
    const { chapters } = RouteUtils.getChapterInfo(this.routeParams()!);
    return chapters ? Array.from({ length: chapters }, (_, index) => index + 1) : [];
  });

  protected goBackToChapters() {
    const { translation } = this.routeParams()!;
    this.navController.navigateBack([`/${UrlPath.read}/${translation}`]);
  }
}
