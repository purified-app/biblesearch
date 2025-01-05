import { AfterViewInit, Component, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HeaderMenuTitleComponent } from 'src/app/components/header-menu-title.component';
import { books } from 'src/app/constants/books-chapters';

@Component({
  selector: 'app-books',
  imports: [
    HeaderMenuTitleComponent,
    IonItem,
    IonList,
    IonContent,
    IonLabel,
    IonHeader,
    IonSearchbar,
    IonToolbar,
    RouterLink,
  ],
  template: `
    <ion-header collapse="fade">
      <ion-toolbar>
        <app-header-menu-title titleText="Books"></app-header-menu-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          color="light"
          placeholder="Revelation"
          (ionInput)="onSearch($event)"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        @for (book of books; track book.id) {
        <ion-item [routerLink]="['/read', book.id]" detail="true">
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
  books = books;
  readonly searchbar = viewChild.required(IonSearchbar);

  ngAfterViewInit(): void {
    setTimeout(() => this.searchbar().setFocus());
  }

  onSearch(event: any) {
    this.books = books.filter((book) =>
      book.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
  }
}
