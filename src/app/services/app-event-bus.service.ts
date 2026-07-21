import { Injectable } from '@angular/core';
import { ALEventBus } from '@angular-libs/event-bus';

export type TranslationLoadingPhase = 'engine' | 'download' | 'database' | 'ready' | 'error';

export interface TranslationLoadingEvent {
  translation: string;
  phase: TranslationLoadingPhase;
  progress?: number;
  error?: string;
}

interface AppEventMap {
  'translation:loading': TranslationLoadingEvent;
}

@Injectable({ providedIn: 'root' })
export class AppEventBus extends ALEventBus<AppEventMap> {}