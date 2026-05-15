import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { slowRequestsInterceptor } from './interceptors/slow-requests.interceptor';
import { provideALTranslate } from '@angular-libs/translate';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular({}),
    provideHttpClient(withInterceptors([slowRequestsInterceptor])),
    provideALTranslate({ defaultLang: 'en' }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
  ],
};
