import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
        <ion-select
          interface="popover"
          placeholder="Translation..."
          [selectedText]="selectedTranslation()?.usfm"
          [value]="selectedTranslation()?.usfm"
          (ionChange)="selectTranslation($event)"
        >
          @for (translation of translations; track $index) {
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
  protected selectedTranslation = computed(() => {
    const ufsm = this.bibleTranslation.translation();
    return this.bibleTranslation.getTranslationObj(ufsm);
  });
  protected translations = this.bibleTranslation.translations();

  constructor() {}

  protected selectTranslation($event: IonSelectCustomEvent<SelectChangeEventDetail>) {
    const usfm = $event.detail.value;
    this.bibleTranslation.updateTranslation(usfm);
  }
}
