import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ALTranslate } from '@angular-libs/translate';
import { IonAlert, IonLoading } from '@ionic/angular/standalone';
import type { AlertButton } from '@ionic/core';
import { TextKey } from 'src/app/constants/text-key';
import { ApiService } from 'src/app/services/api.service';
import { AppEventBus } from 'src/app/services/app-event-bus.service';

@Component({
  selector: 'app-initial-translation-loader',
  imports: [IonAlert, IonLoading],
  template: `
    <ion-loading
      [isOpen]="isLoading()"
      [message]="loadingMessage()"
      spinner="crescent"
    ></ion-loading>
    <ion-alert
      [isOpen]="hasError()"
      [header]="errorMessage()"
      [buttons]="retryButtons()"
      (didDismiss)="dismissError()"
    ></ion-alert>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialTranslationLoaderComponent {
  private apiService = inject(ApiService);
  private eventBus = inject(AppEventBus);
  private translate = inject(ALTranslate);
  private loadingEvent = this.eventBus.onToSignal('translation:loading');
  private translation = computed(() => this.loadingEvent()?.translation);
  protected isLoading = computed(() => {
    const event = this.loadingEvent();
    return event !== undefined && event.phase !== 'ready' && event.phase !== 'error';
  });
  protected loadingMessage = computed(() => {
    const message = this.translate.get(TextKey.PreparingTranslation);
    const event = this.loadingEvent();
    return event?.phase === 'download' ? `${message} ${event.progress ?? 0}%` : message;
  });
  protected hasError = computed(() => this.loadingEvent()?.phase === 'error');
  protected errorMessage = computed(() => this.translate.get(TextKey.UnableToOpenBible));
  protected retryButtons = computed<AlertButton[]>(() => [
    {
      text: this.translate.get(TextKey.Retry),
      handler: () => this.retry(),
    },
  ]);

  private retry(): void {
    const translation = this.translation();
    if (translation) void this.apiService.getBooks(translation);
  }

  protected dismissError(): void {
    if (this.loadingEvent()?.phase === 'error') {
      this.eventBus.resetEvent('translation:loading');
    }
  }
}