import { inject, Injectable } from '@angular/core';
import { ALTranslate } from '@angular-libs/translate';
import { en } from 'src/assets/i18n/en';
import { no } from 'src/assets/i18n/no';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private translation = inject(ALTranslate);
  private storage = inject(StorageService);

  initSettings() {
    this.initDarkMode();
    this.initFontSize();
    this.initLanguage();
  }

  private initFontSize() {
    const fontSize = this.storage.get('fontSize');
    document.documentElement.style.fontSize = `${fontSize}px`;
  }

  private initDarkMode() {
    const darkMode = this.storage.get('darkMode');
    document.documentElement.classList.toggle('ion-palette-dark', darkMode);
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
