import { inject, Injectable } from '@angular/core';
import { Verse } from 'src/app/interfaces';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Injectable({ providedIn: 'root' })
export class VerseHighlightService {
  private store = inject(LocalStorageService);

  saveVerseHighlights(selectedVerses: Verse[], color: string) {
    const highlights = this.buildVerseHighlights(selectedVerses, color);
    this.store.saveVerseHighlights(highlights);
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
