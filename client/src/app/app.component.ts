import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
} from 'ionicons/icons';
import { BookmarkService } from './services/bookmark.service';
import { LocalStorage } from './constants/localStorage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
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
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'Search', url: '/search', icon: 'search' },
    { title: 'Read', url: '/read', icon: 'book' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];
  public labels = ['Genesis 1', 'Acts 2', 'Hebrews 11', '1 John 1', '1 Peter 2', 'Revelation 22'];
  bookmarkService = inject(BookmarkService);

  constructor(private router: Router) {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      chevronUpCircle,
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
    });
  }

  ngOnInit() {
    // Check if there's a route saved in localStorage
    const startPage = localStorage.getItem(LocalStorage.StartPage);
    switch (startPage) {
      case 'search':
        this.router.navigate(['/search']);
        break;
      case 'read':
        this.router.navigate(['/read']);
        break;
      case 'recentRead':
        if (!this.bookmarkService.recentRead) return;
        const { book, chapter } = this.bookmarkService.recentRead;
        this.router.navigate(['/read', book, chapter]);
        break;
    }
  }
}
