import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
  SelectChangeEventDetail,
} from '@ionic/angular/standalone';
import { IonSelectCustomEvent } from '@ionic/core';
import { BibleTranslationService } from 'src/app/services/bible-translation.service';

@Component({
  selector: 'app-language-select',
  imports: [IonItem, IonList, IonSelect, IonSelectOption],
  template: `
    <ion-list>
      <ion-item>
        @let value = bibleTranslation.activeTranslation().usfm;
        <ion-select
          interface="popover"
          placeholder="Translation..."
          [selectedText]="value"
          [value]="value"
          (ionChange)="selectTranslation($event)"
        >
          @for (translation of bibleTranslation.translations(); track $index) {
          <ion-select-option [value]="translation.usfm">
            {{ translation.usfm }} - {{ translation.name }}
          </ion-select-option>
          }
        </ion-select>
      </ion-item>
    </ion-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectComponent {
  protected bibleTranslation = inject(BibleTranslationService);

  protected selectTranslation($event: IonSelectCustomEvent<SelectChangeEventDetail>) {
    const usfm = $event.detail.value;
    const translation = this.bibleTranslation.translations().find((t) => t.usfm === usfm);
    if (!translation) return;
    this.bibleTranslation.activeTranslation.set(translation);
  }
}
