import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRange,
  IonText,
  IonToggle,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { TextKey } from './../../constants/text-key';
import { LocalStorageUtils } from 'src/app/utils/local-storage.utils';

@Component({
  selector: 'app-settings-appearance',
  imports: [
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonRange,
    IonText,
    IonToggle,
    TranslatePipe,
  ],
  template: `
    <ion-text color="medium">
      <h3>{{ TextKey.Appearance | translate }}</h3>
    </ion-text>
    <ion-list>
      <ion-item>
        <ion-toggle
          justify="space-between"
          [checked]="darkMode()"
          (ionChange)="darkMode.set($event.detail.checked ? true : false)"
        >
          Dark Mode
        </ion-toggle>
      </ion-item>
      <ion-list-header>
        <ion-label>{{ TextKey.FontSize | translate }}</ion-label>
      </ion-list-header>
      <ion-item>
        <ion-range
          min="14"
          max="20"
          step="1"
          snaps
          [value]="fontSize() + 'px'"
          (ionInput)="fontSize.set(+$event.detail.value)"
        >
          <ion-icon slot="start" name="text-outline" style="font-size: 14px;"></ion-icon>
          <ion-icon slot="end" name="text-outline" style="font-size: 20px;"></ion-icon>
        </ion-range>
      </ion-item>
    </ion-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAppearanceComponent {
  protected fontSize = signal<number>(LocalStorageUtils.getFontSize());
  protected darkMode = signal<boolean>(LocalStorageUtils.getDarkMode());
  protected TextKey = TextKey;

  constructor() {
    effect(() => {
      const fontSize = this.fontSize();
      document.documentElement.style.fontSize = `${fontSize}px`;
      LocalStorageUtils.saveFontSize(String(fontSize));
    });
    effect(() => {
      const darkMode = this.darkMode();
      document.documentElement.classList.toggle('ion-palette-dark', darkMode);
      LocalStorageUtils.saveDarkMode(darkMode);
    });
  }
}
