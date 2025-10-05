import { Component, effect, inject, signal } from '@angular/core';
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
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import {
  IonInputCustomEvent,
  IonRadioGroupCustomEvent,
  IonSelectCustomEvent,
  RadioGroupChangeEventDetail,
  SelectChangeEventDetail,
} from '@ionic/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { languages } from 'src/app/constants/languages';
import { TextKey } from './../../constants/text-key';
import { SettingsAppearanceComponent } from 'src/app/components/settings-appearance/settings-appearance.component';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { StartPage, StorageService } from 'src/app/services/storage.service';

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
            (ionChange)="onStartPageChange($event)"
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
            (ionChange)="onLanguageChange($event)"
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
            (ionChange)="onBookmarksLimitChange($event)"
          >
          </ion-input>
        </ion-item>
      </ion-list>
      <app-settings-appearance></app-settings-appearance>
    </ion-content>
  `,
})
export class SettingsPage {
  private storage = inject(StorageService);
  bookmarksLimit = signal<number>(this.storage.get('bookmarksLimit', 5));
  language = signal(this.storage.get('language', navigator.language.slice(0, 2)));
  languages = signal(languages);
  startPage = signal(this.storage.get('startPage', 'recentRead'));

  protected TextKey = TextKey;

  private translation = inject(TranslateService);

  constructor() {
    effect(() => {
      const language = this.language();
      this.translation.use(language);
      this.storage.set('language', language);
    });
    effect(() => this.storage.set('startPage', this.startPage()));
  }

  onLanguageChange($event: IonSelectCustomEvent<SelectChangeEventDetail<any>>) {
    this.language.set($event.detail.value);
  }

  onBookmarksLimitChange(event: IonInputCustomEvent<InputChangeEventDetail>) {
    const { value } = event.detail;
    const limit = value ? Number(value) : 5;
    this.bookmarksLimit.set(limit);
    this.storage.set('bookmarksLimit', limit);
  }

  onStartPageChange(event: IonRadioGroupCustomEvent<RadioGroupChangeEventDetail<StartPage>>) {
    this.startPage.set(event.detail.value);
  }
}
