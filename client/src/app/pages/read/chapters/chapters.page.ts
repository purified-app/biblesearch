import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { books } from 'src/app/constants/books-chapters';

@Component({
  selector: 'app-chapters',
  imports: [IonContent, RouterLink],
  template: `
    <ion-content class="ion-padding">
      <div class="grid-container">
        @for (chapter of chapters; track chapter) {
        <a [routerLink]="['/read', bookId, chapter]">
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
  bookId: number;
  books = books;
  chapters: number[] = [];

  constructor(private activatedRoute: ActivatedRoute) {
    this.bookId = Number(this.activatedRoute.snapshot.paramMap.get('book'));
    const { chapters } = books.find((b) => b.id === this.bookId) || {};
    if (!chapters) return;
    this.chapters = Array.from({ length: chapters }, (_, index) => index + 1);
  }
}
