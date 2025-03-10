import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { BibleTranslation, translations } from '../constants/translations';
import { UrlPath } from '../constants/url-path';
import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class BibleTranslationService {
  private localStorage = inject(LocalStorageService);
  private router = inject(Router);

  translations = signal<BibleTranslation[]>(translations);

  readonly translation = computed(() => {
    const urlTree = this.router.parseUrl(this.routerEvents()!.url);
    const segments = urlTree.root.children['primary']?.segments || [];
    if (segments[0]?.path === UrlPath.read && segments[1]) {
      return segments[1].path;
    }
    return this.localStorage.getTranslation();
  });

  private routerEvents = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd))
  );

  constructor() {
    effect(() => {
      this.localStorage.saveTranslation(this.translation());
    });
  }

  public getTranslationObj(translationUsfm: string) {
    return translations.find((t) => t.usfm === translationUsfm);
  }

  public updateTranslation(newTranslation: string): void {
    // Get current URL segments
    const urlTree = this.router.parseUrl(this.router.url);
    const segments = urlTree.root.children['primary']?.segments || [];
    const newSegments = [UrlPath.read, newTranslation, ...segments.slice(2).map((s) => s.path)];
    const { queryParams } = urlTree;
    const fragment = urlTree.fragment || undefined;
    this.router.navigate(newSegments, { queryParams, fragment });
  }
}
