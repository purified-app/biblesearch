import { Component } from '@angular/core';
import { InputChangeEventDetail, IonInput, IonItem, IonList } from '@ionic/angular/standalone';
import { IonInputCustomEvent } from '@ionic/core';
import { LocalStorage } from 'src/app/constants/localStorage';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [IonList, IonItem, IonInput],
  template: ` <ion-list>
    <ion-item>
      <ion-input
        label="Bookmark count"
        labelPlacement="stacked"
        [clearInput]="true"
        placeholder="Default: 5"
        type="number"
        [value]="bookmarksLimit"
        (ionChange)="onBookmarkCountChange($event)"
      >
      </ion-input>
    </ion-item>
  </ion-list>`,
})
export class SettingsPage {
  bookmarksLimit? = Number(localStorage.getItem('bookmarkCount') || undefined);

  constructor() {}

  onBookmarkCountChange(event: IonInputCustomEvent<InputChangeEventDetail>) {
    const { value } = event.detail;
    this.bookmarksLimit = value ? Number(value) : undefined;
    this.bookmarksLimit
      ? localStorage.setItem(LocalStorage.BookmarksLimit, String(this.bookmarksLimit))
      : localStorage.removeItem(LocalStorage.BookmarksLimit);
  }
}
