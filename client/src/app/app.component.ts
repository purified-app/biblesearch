import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  bookSharp,
  bookmarkOutline,
  bookmarkSharp,
  chevronBackOutline,
  chevronForwardOutline,
  chevronUpCircle,
  closeCircle,
  documentTextOutline,
  documentTextSharp,
  earthOutline,
  languageOutline,
  searchOutline,
  searchSharp,
  settingsOutline,
  settingsSharp,
  shareSocialOutline,
  textOutline,
  timeOutline,
  timeSharp,
  trashOutline,
} from 'ionicons/icons';
import { BookmarkService } from './services/bookmark.service';
import BookmarkUtils from './utils/bookmark.utils';
import { TranslateService } from '@ngx-translate/core';
import { en } from 'src/assets/i18n/en';
import { no } from 'src/assets/i18n/no';
import { LocalStorage } from './constants/localStorage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, RouterOutlet],
})
export class AppComponent {
  protected bookmarkService = inject(BookmarkService);
  protected getBookmarkTitle = BookmarkUtils.getTitle;

  private translation = inject(TranslateService);

  constructor() {
    addIcons({
      bookOutline,
      bookSharp,
      bookmarkOutline,
      bookmarkSharp,
      chevronBackOutline,
      chevronForwardOutline,
      chevronUpCircle,
      closeCircle,
      documentTextOutline,
      documentTextSharp,
      earthOutline,
      languageOutline,
      searchOutline,
      searchSharp,
      settingsOutline,
      settingsSharp,
      shareSocialOutline,
      textOutline,
      timeOutline,
      timeSharp,
      trashOutline,
    });
    this.translation.setTranslation('en', en);
    this.translation.setTranslation('no', no);
    this.translation.setDefaultLang(localStorage.getItem(LocalStorage.Language) || 'en');
  }
}
