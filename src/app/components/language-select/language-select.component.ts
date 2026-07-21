import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ALTranslate } from '@angular-libs/translate';
import {
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
  SelectChangeEventDetail,
} from '@ionic/angular/standalone';
import { IonSelectCustomEvent } from '@ionic/core';
import { TextKey } from 'src/app/constants/text-key';
import { ApiService } from 'src/app/services/api.service';
import { AppEventBus } from 'src/app/services/app-event-bus.service';
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
          [selectedText]="selectedText()"
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
  private apiService = inject(ApiService);
  private eventBus = inject(AppEventBus);
  private translate = inject(ALTranslate);
  private pendingTranslation = signal<string | undefined>(undefined);
  private loadingEvent = this.eventBus.onToSignal('translation:loading');
  protected selectedTranslation = computed(() => {
    const ufsm = this.bibleTranslation.translation();
    return ufsm ? this.bibleTranslation.getTranslationObj(ufsm) : undefined;
  });
  protected translations = this.bibleTranslation.translations();
  protected selectedText = computed(() => {
    const usfm = this.pendingTranslation() ?? this.selectedTranslation()?.usfm;
    const event = this.loadingEvent();
    return usfm && event?.translation === usfm && event.phase !== 'ready'
      ? `${usfm} - ${this.translate.get(TextKey.PreparingTranslation)}`
      : usfm;
  });

  protected async selectTranslation($event: IonSelectCustomEvent<SelectChangeEventDetail>) {
    const usfm = String($event.detail.value).toUpperCase();
    this.pendingTranslation.set(usfm);
    try {
      await this.apiService.getBooks(usfm);
      this.bibleTranslation.updateTranslation(usfm);
    } finally {
      this.pendingTranslation.set(undefined);
    }
  }
}
