import { Component, signal } from '@angular/core';
import {
  InputChangeEventDetail,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
} from '@ionic/angular/standalone';
import {
  IonInputCustomEvent,
  IonRadioGroupCustomEvent,
  RadioGroupChangeEventDetail,
} from '@ionic/core';
import { LocalStorage } from 'src/app/constants/localStorage';

@Component({
  selector: 'app-settings',
  imports: [
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonRadio,
    IonRadioGroup,
  ],
  template: `
    <ion-content class="ion-padding">
      <ion-list>
        <ion-list-header>
          <ion-label>Bookmark settings</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-input
            label="Number of bookmarks to keep"
            labelPlacement="stacked"
            [clearInput]="true"
            placeholder="Default: 5"
            type="number"
            [value]="bookmarksLimit()"
            (ionChange)="onBookmarkCountChange($event)"
          >
          </ion-input>
        </ion-item>
        <ion-list-header>
          <ion-label>Start page</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-radio-group
            title="Start page"
            [value]="startPage()"
            (ionChange)="onStartPageChange($event)"
          >
            <ion-radio value="search">Search</ion-radio><br />
            <ion-radio value="read">Read</ion-radio><br />
            <ion-radio value="recentRead">Recent read</ion-radio>
          </ion-radio-group>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class SettingsPage {
  bookmarksLimit = signal<number>(Number(localStorage.getItem('bookmarkCount') || 5));
  startPage = signal<string>(localStorage.getItem('startPage') || 'search');

  onBookmarkCountChange(event: IonInputCustomEvent<InputChangeEventDetail>) {
    const { value } = event.detail;
    this.bookmarksLimit.set(value ? Number(value) : 5);
    this.bookmarksLimit
      ? localStorage.setItem(LocalStorage.BookmarksLimit, String(this.bookmarksLimit()))
      : localStorage.removeItem(LocalStorage.BookmarksLimit);
  }

  onStartPageChange(event: IonRadioGroupCustomEvent<RadioGroupChangeEventDetail<string>>) {
    const { value } = event.detail;
    this.startPage.set(value);
    localStorage.setItem(LocalStorage.StartPage, value);
  }
}
