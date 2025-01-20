import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonRouterLink,
} from '@ionic/angular/standalone';
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
  closeCircleOutline,
  closeCircle,
} from 'ionicons/icons';
import { BookmarkService } from './services/bookmark.service';
import BookmarkUtils from './utils/bookmark.utils';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet,
  ],
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
      chevronBackOutline,
      chevronForwardOutline,
      chevronUpCircle,
      closeCircle,
      searchOutline,
      searchSharp,
      bookOutline,
      bookSharp,
      bookmarkOutline,
      bookmarkSharp,
      timeOutline,
      timeSharp,
      settingsOutline,
      settingsSharp,
      documentTextOutline,
      documentTextSharp,
      trashOutline,
    });
  }
}
