import { inject, Injectable } from '@angular/core';
import { LocalStorageUtils } from '../utils/local-storage.utils';
import { TranslateService } from '@ngx-translate/core';
import { en } from 'src/assets/i18n/en';
import { no } from 'src/assets/i18n/no';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private translation = inject(TranslateService);

  initSettings() {
    this.initDarkMode();
    this.initFontSize();
    this.initLanguage();
  }

  private initFontSize() {
    const fontSize = LocalStorageUtils.getFontSize();
    document.documentElement.style.fontSize = `${fontSize}px`;
  }

  private initDarkMode() {
    const darkMode = LocalStorageUtils.getDarkMode();
    document.documentElement.classList.toggle('ion-palette-dark', darkMode);
  }

  private initLanguage() {
    const language = LocalStorageUtils.getLanguage();
    this.translation.use(language);
    this.translation.setTranslation('en', en);
    this.translation.setTranslation('no', no);
    this.translation.setDefaultLang(language);
  }
}
