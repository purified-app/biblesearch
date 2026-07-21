import { Injectable, inject } from '@angular/core';
import { Verse } from 'src/app/interfaces';
import { StorageService } from 'src/app/services/storage.service';

@Injectable({ providedIn: 'root' })
export class VerseHighlightService {
  private storage = inject(StorageService);

  saveVerseHighlights(selectedVerses: Verse[], color: string) {
    const highlights = this.buildVerseHighlights(selectedVerses, color);
    this.saveVerseHighlightsToStorage(highlights);
  }

  private buildVerseHighlights(verses: Verse[], color: string): VerseHighlight[] {
    const translation = verses[0].translation;
    // TODO: get real userId
    const userId = 1;
    const date = new Date();
    const dateTime = date.toISOString();
    // TODO: remove sys_createdDate and sys_updatedDate when db is ready
    const sys_createdDate = dateTime;
    const sys_updatedDate = dateTime;
    const common = { color, sys_createdDate, sys_updatedDate, translation, userId };

    return verses.map((verseObj) => {
      const { bookNumber, bookUsfm, chapter, verse } = verseObj;
      return { ...common, bookNumber, bookUsfm, chapter, verse };
    });
  }

  private saveVerseHighlightsToStorage(highlights: VerseHighlight[]): void {
    const existingHighlights = this.storage.get('verseHighlights');
    if (existingHighlights.length) {
      highlights.forEach((highlight) => {
        const index = existingHighlights.findIndex(
          (existingHighlight) =>
            existingHighlight.translation === highlight.translation &&
            existingHighlight.bookUsfm === highlight.bookUsfm &&
            existingHighlight.chapter === highlight.chapter &&
            existingHighlight.verse === highlight.verse,
        );
        if (index > -1) existingHighlights.splice(index, 1);
      });
    }
    const allHighlights = [...existingHighlights, ...highlights];
    this.storage.set('verseHighlights', allHighlights);
  }
}

export interface VerseHighlight {
  id?: number;
  bookNumber: number;
  bookUsfm: string;
  chapter: number;
  color: string;
  translation: string;
  userId: number;
  verse: number;
  sys_createdDate?: string;
  sys_updatedDate?: string;
}
