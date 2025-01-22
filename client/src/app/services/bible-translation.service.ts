import { effect, inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class BibleTranslationService {
  private localStorage = inject(LocalStorageService);

  translations = signal<Translation[]>([
    { lang: 'eng', name: 'King James Version', usfm: 'KJV' },
    { lang: 'no', name: 'Norsk Bibel 88/07', usfm: 'NB' },
  ]);
  activeTranslation = signal<Translation>(
    this.localStorage.getTranslation() ?? this.translations()[0]
  );

  constructor() {
    effect(() => {
      const translations = this.activeTranslation();
      this.localStorage.saveTranslation(translations);
    });
  }
}

export interface Translation {
  lang: string;
  name: string;
  usfm: string;
}
