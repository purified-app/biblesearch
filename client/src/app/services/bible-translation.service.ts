import { effect, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { BibleTranslation, translations } from '../constants/translations';
import { UrlPath } from '../constants/url-path';
import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class BibleTranslationService {
  private localStorage = inject(LocalStorageService);
  translations = signal<BibleTranslation[]>(translations);

  translation = signal(this.localStorage.getTranslation());
  private router = inject(Router);

  constructor() {
    effect(() => {
      this.localStorage.saveTranslation(this.translation());
    });
    this.subscribeToUrlChanges();
  }

  public getTranslationObj(translationUsfm: string) {
    return translations.find((t) => t.usfm === translationUsfm);
  }

  public updateTranslation(newTranslation: string): void {
    this.translation.set(newTranslation);

    // Get current URL segments
    const urlTree = this.router.parseUrl(this.router.url);
    const segments = urlTree.root.children['primary']?.segments || [];

    if (segments[0]?.path === UrlPath.read) {
      const newSegments = [UrlPath.read, newTranslation, ...segments.slice(2).map((s) => s.path)];
      this.router.navigate(newSegments, {
        queryParams: urlTree.queryParams,
        fragment: urlTree.fragment ?? undefined,
      });
    }
  }

  private subscribeToUrlChanges() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const urlTree = this.router.parseUrl(this.router.url);
      const segments = urlTree.root.children['primary']?.segments || [];
      if (segments[0]?.path === UrlPath.read && segments[1]) {
        this.translation.set(segments[1].path);
      }
    });
  }
}
