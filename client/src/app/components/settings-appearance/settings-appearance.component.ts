import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
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
import { StorageService } from 'src/app/services/storage.service';

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
  private storage = inject(StorageService);
  protected fontSize = signal(this.storage.get('fontSize', 16));
  protected darkMode = signal(this.storage.get('darkMode', true));
  protected TextKey = TextKey;

  constructor() {
    effect(() => {
      const fontSize = this.fontSize();
      document.documentElement.style.fontSize = `${fontSize}px`;
      this.storage.set('fontSize', fontSize);
    });
    effect(() => {
      const darkMode = this.darkMode();
      document.documentElement.classList.toggle('ion-palette-dark', darkMode);
      this.storage.set('darkMode', darkMode);
    });
  }
}
