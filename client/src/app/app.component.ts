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
import { UserSettingsService } from './services/user-settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, RouterOutlet],
})
export class AppComponent {
  protected bookmarkService = inject(BookmarkService);
  protected getBookmarkTitle = BookmarkUtils.getTitle;

  private userSettings = inject(UserSettingsService);

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
    this.userSettings.initSettings();
  }
}
