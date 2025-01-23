import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
          [selectedText]="value()"
          [value]="value()"
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
  protected value = computed(() => {
    const activeTranslation = this.bibleTranslation.activeTranslation().usfm;
    const { translation } = this.route.snapshot.firstChild?.params ?? {};
    const returnValue = this.isFirstCompute && translation ? translation : activeTranslation;
    this.isFirstCompute = false;
    return returnValue;
  });

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private isFirstCompute = true;

  protected selectTranslation($event: IonSelectCustomEvent<SelectChangeEventDetail>) {
    const usfm = $event.detail.value;
    const translation = this.bibleTranslation.translations().find((t) => t.usfm === usfm);
    if (!translation) return;
    this.bibleTranslation.activeTranslation.set(translation);
    this.updateTranslationInRoute(usfm);
  }

  private updateTranslationInRoute(translation: string) {
    const currentRoute = this.router.url;
    const segments = currentRoute.split('/').filter(Boolean); // Remove empty segments

    // Check if we're on a route that includes a translation (like 'read/NB/GEN/3?param=value')
    if (segments[0] === 'read' && segments.length > 1) {
      const { queryParams } = this.route.snapshot;

      // Construct new route segments, updating only the translation part
      const newSegments = [segments[0], translation, ...segments.slice(2)];
      const lastIndex = newSegments.length - 1;
      // Remove the query parameters from the last segment to not mess up the URL
      newSegments[lastIndex] = newSegments[lastIndex].split('?')[0];

      // Navigate with preserved query parameters
      this.router.navigate(newSegments, { queryParams, replaceUrl: true });
    }
  }
}
