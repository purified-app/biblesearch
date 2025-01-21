import { Component, inject } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  chevronForwardOutline,
  chevronUpCircle,
  searchOutline,
  searchSharp,
  bookOutline,
  bookSharp,
  bookmarkOutline,
  bookmarkSharp,
  settingsOutline,
  settingsSharp,
  timeOutline,
  timeSharp,
  documentTextOutline,
  documentTextSharp,
  trashOutline,
  closeCircle,
  shareSocialOutline,
} from 'ionicons/icons';
import { BookmarkService } from './services/bookmark.service';
import BookmarkUtils from './utils/bookmark.utils';
import { RouterOutlet } from '@angular/router';

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
      chevronBackOutline,
      chevronForwardOutline,
      chevronUpCircle,
      closeCircle,
      documentTextOutline,
      documentTextSharp,
      bookmarkOutline,
      bookmarkSharp,
      searchOutline,
      searchSharp,
      settingsOutline,
      settingsSharp,
      shareSocialOutline,
      timeOutline,
      timeSharp,
      trashOutline,
    });
  }
}
