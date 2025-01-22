import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AllBooks } from 'src/app/constants/books';

@Component({
  selector: 'app-chapters',
  imports: [IonContent, RouterLink],
  template: `
    <ion-content class="ion-padding">
      @let translation = routeParamMap()?.get('translation');
      <div class="grid-container">
        @for (chapter of chapters; track chapter) {
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
        font-size: 30px;
        justify-content: center;
      }
    `,
  ],
})
export class ChaptersPage {
  bookUsfm: string;
  chapters: number[] = [];

  protected activatedRoute = inject(ActivatedRoute);
  protected routeParamMap = toSignal(this.activatedRoute.paramMap);

  constructor() {
    const { bookUsfm, translation } = this.activatedRoute.snapshot.params;
    this.bookUsfm = bookUsfm;

    const books = AllBooks[translation as keyof typeof AllBooks];
    const { chapters } = books.find((b) => b.usfm === bookUsfm) || {};
    if (!chapters) return;
    this.chapters = Array.from({ length: chapters }, (_, index) => index + 1);
  }
}
