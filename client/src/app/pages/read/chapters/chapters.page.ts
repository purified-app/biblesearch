import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import RouteUtils from 'src/app/utils/route.utils';
import { LanguageSelectComponent } from '../../../components/language-select/language-select.component';

@Component({
  selector: 'app-chapters',
  imports: [LanguageSelectComponent, PageHeaderComponent, IonContent, RouterLink],
  template: `
    @let bookUsfm = routeParams()?.['bookUsfm']; @let translation = routeParams()?.['translation'];
    <app-page-header>
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
        /* background-color: #2196F3; */
        display: grid;
        gap: 8px;
        grid-template-columns: auto auto auto auto auto;
        padding: 10px;
      }
      .grid-container > a {
        text-decoration: none;
        color: inherit;
      }
      .grid-item {
        aspect-ratio: 1 / 1;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        display: flex;
        font-size: 2rem;
        justify-content: center;
      }
    `,
  ],
})
export class ChaptersPage {
  protected activatedRoute = inject(ActivatedRoute);
  protected routeParams = toSignal(this.activatedRoute.params);
  chapters = computed(() => {
    const { chapters } = RouteUtils.getChapterInfo(this.routeParams()!);
    return chapters ? Array.from({ length: chapters }, (_, index) => index + 1) : [];
  });
}
