import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonNote,
  IonSplitPane,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BibleTranslationService } from 'src/app/services/bible-translation.service';
import { BookmarkService } from 'src/app/services/bookmark.service';
import BookmarkUtils from 'src/app/utils/bookmark.utils';

@Component({
  selector: 'app-layout',
  imports: [
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonNote,
    IonSplitPane,
    IonTitle,
    IonToolbar,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  template: `
    <ion-split-pane contentId="main-content">
      <ion-menu contentId="main-content" type="overlay">
        <ion-header>
          <ion-toolbar>
            <ion-title>Biblesearch (prototype)</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          @let translation = bibleTranslation.activeTranslation();
          <ion-note>Search engine for bible verses</ion-note>
          <ion-list>
            @for (page of appPages; track $index) {
            <ion-menu-toggle auto-hide="false">
              <ion-item
                detail="false"
                lines="none"
                routerDirection="root"
                routerLinkActive="selected"
                [button]="true"
                [routerLink]="[page.url]"
              >
                <ion-icon
                  slot="start"
                  [ios]="page.icon + '-outline'"
                  [md]="page.icon + '-sharp'"
                ></ion-icon>
                <ion-label>{{ page.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
            }
          </ion-list>
          @let recentRead = this.bookmarkService.recentRead();
          <ion-list class="bookmarks-list">
            <ion-menu-toggle auto-hide="false">
              <ion-list-header>Recent read</ion-list-header>
              @if(recentRead){
              <ion-item
                detail="false"
                lines="none"
                routerDirection="root"
                routerLinkActive="selected"
                [routerLink]="['/read', translation, recentRead.book, recentRead.chapter]"
              >
                <ion-icon slot="start" ios="time-outline" md="time-sharp"></ion-icon>
                <ion-label>
                  {{ recentRead.bookName }}
                  {{ recentRead.chapter }}
                </ion-label>
              </ion-item>
              }
            </ion-menu-toggle>
          </ion-list>

          <ion-list class="bookmarks-list">
            <ion-menu-toggle auto-hide="false">
              <ion-list-header>Bookmarks</ion-list-header>

              @for (bookmark of this.bookmarkService.bookmarks(); track $index) {
              <ion-item
                detail="false"
                lines="none"
                routerDirection="root"
                routerLinkActive="selected"
                [routerLink]="['/read', translation, bookmark.book, bookmark.chapter]"
                [queryParams]="{ verse: bookmark?.verses?.join(',') }"
              >
                <ion-icon slot="start" ios="bookmark-outline" md="bookmark-sharp"></ion-icon>
                <ion-label>
                  {{ getBookmarkTitle(bookmark) }}
                </ion-label>
              </ion-item>
              }
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="main-content">
        <ion-header>
          <ion-toolbar>
            @let data = this.activatedRoute.snapshot.firstChild?.data;
            <ion-title>{{ data?.['title'] }}</ion-title>
            <ion-buttons slot="start" [collapse]="true">
              <ion-back-button></ion-back-button>
            </ion-buttons>
            <ion-buttons slot="end" [collapse]="true">
              <ion-menu-button auto-hide="true"></ion-menu-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <router-outlet />
      </div>
    </ion-split-pane>
  `,
  styleUrl: './layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  protected appPages = [
    { title: 'Search', url: '/search', icon: 'search' },
    { title: 'Read', url: '/read', icon: 'book' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
    { title: 'Notes', url: '/notes', icon: 'document-text' },
  ];

  protected activatedRoute = inject(ActivatedRoute);
  protected bookmarkService = inject(BookmarkService);
  protected getBookmarkTitle = BookmarkUtils.getTitle;
  protected bibleTranslation = inject(BibleTranslationService);
}
