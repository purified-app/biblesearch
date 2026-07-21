import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { initializeAppIcons } from './app.icons';
import { InitialTranslationLoaderComponent } from './components/initial-translation-loader/initial-translation-loader.component';
import { UserSettingsService } from './services/user-settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [InitialTranslationLoaderComponent, IonApp, RouterOutlet],
})
export class AppComponent {
  private userSettings = inject(UserSettingsService);

  constructor() {
    initializeAppIcons();
    this.userSettings.initSettings();
  }
}
    