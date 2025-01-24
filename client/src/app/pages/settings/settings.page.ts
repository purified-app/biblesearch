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
import { LocalStorage } from 'src/app/constants/localStorage';
import { TextKey } from './../../constants/text-key';
import { SettingsAppearanceComponent } from 'src/app/components/settings-appearance/settings-appearance.component';

@Component({
  selector: 'app-settings',
  imports: [
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
            (ionChange)="onBookmarkCountChange($event)"
          >
          </ion-input>
        </ion-item>
      </ion-list>
      <app-settings-appearance></app-settings-appearance>
    </ion-content>
  `,
})
export class SettingsPage {
  bookmarksLimit = signal<number>(Number(localStorage.getItem('bookmarkCount') || 5));
  language = signal<string>(
    localStorage.getItem(LocalStorage.Language) || navigator.language.slice(0, 2)
  );
  languages = signal<{ value: string; description: string }[]>(languages);
  startPage = signal<string>(localStorage.getItem(LocalStorage.StartPage) || 'search');

  protected TextKey = TextKey;

  private translation = inject(TranslateService);

  constructor() {
    effect(() => {
      const language = this.language();
      this.translation.use(language);
      localStorage.setItem(LocalStorage.Language, language);
    });
  }

  onLanguageChange($event: IonSelectCustomEvent<SelectChangeEventDetail<any>>) {
    const { value } = $event.detail;
    this.language.set(value);
  }

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
