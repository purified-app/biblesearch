import { AfterViewInit, Component, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonItem, IonLabel, IonList, IonSearchbar, IonContent } from '@ionic/angular/standalone';
import { books } from 'src/app/constants/books-chapters';
import { Book } from 'src/app/interfaces';

@Component({
  selector: 'app-books',
  imports: [IonContent, IonItem, IonList, IonLabel, RouterLink],
  template: `
    <ion-content class="ion-padding">
      <ion-list>
        @for (book of books(); track book.id) {
        <ion-item routerDirection="forward" [routerLink]="['/read', book.id]" detail="true">
          <ion-label>{{ book.name }}</ion-label>
        </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
  styles: [
    `
      ion-item {
        cursor: pointer;
      }
    `,
  ],
})
export class BooksPage implements AfterViewInit {
  books = signal<Book[]>(books);
  readonly searchbar = viewChild.required(IonSearchbar);

  ngAfterViewInit(): void {
    setTimeout(() => this.searchbar().setFocus());
  }

  onSearch(event: any) {
    const booksFiltered = books.filter((book) =>
      book.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    this.books.set(booksFiltered);
  }
}
