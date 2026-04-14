import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { en } from 'src/assets/i18n/en';
import { no } from 'src/assets/i18n/no';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private translation = inject(TranslateService);
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
    this.translation.use(language);
    this.translation.setTranslation('en', en);
    this.translation.setTranslation('no', no);
  }
}
