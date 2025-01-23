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

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, RouterOutlet],
})
export class AppComponent {
  protected appPages = [
    { title: 'Search', url: '/search', icon: 'search' },
    { title: 'Read', url: '/read', icon: 'book' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
    { title: 'Notes', url: '/notes', icon: 'document-text' },
  ];

  protected bookmarkService = inject(BookmarkService);
  protected getBookmarkTitle = BookmarkUtils.getTitle;

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
  }
}
