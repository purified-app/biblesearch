import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { initializeAppIcons } from './app.icons';
import { InitialTranslationLoaderComponent } from './components/initial-translation-loader/initial-translation-loader.component';
import { BookmarkService } from './services/bookmark.service';
import { UserSettingsService } from './services/user-settings.service';
import BookmarkUtils from './utils/bookmark.utils';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [InitialTranslationLoaderComponent, IonApp, RouterOutlet],
})
export class AppComponent {
  protected bookmarkService = inject(BookmarkService);
  protected getBookmarkTitle = BookmarkUtils.getTitle;

  private userSettings = inject(UserSettingsService);

  constructor() {
    initializeAppIcons();
    this.userSettings.initSettings();
  }
}
    