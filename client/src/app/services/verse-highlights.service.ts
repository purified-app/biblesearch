import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class VerseHighlightsService {
  private storage = inject(StorageService);

  verseHighlights = this.storage.getSignal('verseHighlights', []);

  getHighlightVersesForChapter(bookUsfm: string, chapter: number, translation: string) {
    return this.verseHighlights().filter(
      (hL) => hL.bookUsfm === bookUsfm && hL.chapter === chapter && hL.translation === translation,
    );
  }

  getHighlightMap = (bookUsfm: string, chapter: number, translation: string) => {
    const map = new Map<number, string>();
    this.getHighlightVersesForChapter(bookUsfm, chapter, translation).forEach((hL) => {
      map.set(hL.verse, hL.color);
    });
    return map;
  };
}
