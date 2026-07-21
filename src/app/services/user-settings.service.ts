import { inject, Injectable, effect } from '@angular/core';
import { ALTranslate } from '@angular-libs/translate';
import { en } from 'src/assets/i18n/en';
import { no } from 'src/assets/i18n/no';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private translation = inject(ALTranslate);
  private storage = inject(StorageService);

  constructor() {
    // Reactively update dark mode on change
    effect(() => {
      const darkMode = this.storage.getSignal('darkMode')();
      document.documentElement.classList.toggle('ion-palette-dark', darkMode);
    });

    // Reactively update font size on change
    effect(() => {
      const fontSize = this.storage.getSignal('fontSize')();
      document.documentElement.style.fontSize = `${fontSize}px`;
    });
  }

  initSettings() {
    this.initLanguage();
  }

  private initLanguage() {
    const language = this.storage.get('language') || 'en';
    this.setLanguage(language);
  }

  setLanguage(language: string) {
    if (language === 'no') {
      this.translation.setDictionary(no);
      this.translation.currentLang.set('no');
    } else {
      this.translation.setDictionary(en);
      this.translation.currentLang.set('en');
    }
  }
}
