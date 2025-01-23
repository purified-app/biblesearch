import { effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { translations } from '../constants/translations';

@Injectable({ providedIn: 'root' })
export class BibleTranslationService {
  private localStorage = inject(LocalStorageService);

  translations = signal<Translation[]>(translations);
  activeTranslation = signal<Translation>(
    this.localStorage.getTranslation() ?? this.getInitTranslation()
  );

  constructor() {
    effect(() => {
      const translations = this.activeTranslation();
      this.localStorage.saveTranslation(translations);
    });
  }

  /** Try to get the translation based on the browser language */
  private getInitTranslation() {
    const lang = navigator.language.slice(0, 2);
    const translation = translations.find((t) => t.lang === lang);
    return translation ?? translations[0];
  }
}

export interface Translation {
  lang: string;
  name: string;
  usfm: string;
}
