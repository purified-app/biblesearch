import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
          (ionChange)="storage.set('darkMode', $event.detail.checked)"
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
          (ionInput)="storage.set('fontSize', +$event.detail.value)"
        >
          <ion-icon slot="start" name="text-outline" style="font-size: 14px;"></ion-icon>
          <ion-icon slot="end" name="text-outline" style="font-size: 20px;"></ion-icon>
        </ion-range>
      </ion-item>
      <ion-item>
        <ion-toggle
          justify="space-between"
          [checked]="renderNotes()"
          (ionChange)="storage.set('renderNotes', $event.detail.checked)"
        >
          Render notes
        </ion-toggle>
      </ion-item>
    </ion-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAppearanceComponent {
  protected storage = inject(StorageService);
  protected fontSize = this.storage.getSignal('fontSize', 16);
  protected darkMode = this.storage.getSignal('darkMode', false);
  protected renderNotes = this.storage.getSignal('renderNotes', true);
  protected TextKey = TextKey;
}
