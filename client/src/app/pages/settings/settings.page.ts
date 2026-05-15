import { Component, inject, signal } from '@angular/core';
import {
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@angular-libs/translate';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { languages } from 'src/app/constants/languages';
import { TextKey } from './../../constants/text-key';
import { SettingsAppearanceComponent } from 'src/app/components/settings-appearance/settings-appearance.component';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-settings',
  imports: [
    PageHeaderComponent,
    SettingsAppearanceComponent,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonRadio,
    IonRadioGroup,
    IonSelect,
    IonSelectOption,
    TranslatePipe,
  ],
  template: `
    <app-page-header></app-page-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-list-header>
          <ion-label>{{ TextKey.StartPage | translate }}</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-radio-group
            title="Start page"
            [value]="startPage()"
            (ionChange)="storage.set('startPage', $event.detail.value)"
          >
            <ion-radio value="search">{{ TextKey.Search | translate }}</ion-radio>
            <ion-radio value="read">{{ TextKey.Read | translate }}</ion-radio>
            <ion-radio value="recentRead">{{ TextKey.RecentRead | translate }}</ion-radio>
          </ion-radio-group>
        </ion-item>
        <ion-list-header>
          <ion-label> {{ TextKey.Language | translate }}</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-select
            interface="popover"
            [value]="language()"
            (ionChange)="
              storage.set('language', $event.detail.value);
              userSettings.setLanguage($event.detail.value)
            "
          >
            @for (language of languages(); track language.value) {
              <ion-select-option [value]="language.value">
                {{ language.description }}
              </ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-list-header>
          <ion-label>{{ TextKey.BookmarkSettings | translate }}</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-input
            label="{{ TextKey.NumberOfBookmarks | translate }}"
            labelPlacement="stacked"
            [clearInput]="true"
            placeholder="Default: 5"
            type="number"
            [value]="bookmarksLimit()"
            (ionChange)="storage.set('bookmarksLimit', +$event.detail.value!)"
          >
          </ion-input>
        </ion-item>
      </ion-list>
      <app-settings-appearance></app-settings-appearance>
    </ion-content>
  `,
})
export class SettingsPage {
  protected storage = inject(StorageService);
  protected userSettings = inject(UserSettingsService);
  bookmarksLimit = this.storage.getSignal('bookmarksLimit');
  language = this.storage.getSignal('language');
  languages = signal(languages);
  startPage = this.storage.getSignal('startPage');

  protected TextKey = TextKey;
}
