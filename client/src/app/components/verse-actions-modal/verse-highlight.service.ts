import { effect, inject, Injectable, signal } from '@angular/core';
import { Verse } from 'src/app/interfaces';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Injectable({ providedIn: 'root' })
export class VerseHighlightService {
  selectedVerses: Verse[] = [];
  selectedColor = signal<string | undefined>('');

  private store = inject(LocalStorageService);

  constructor() {
    effect(() => {
      const color = this.selectedColor() ?? '';
      const highlights = this.buildVerseHighlights(this.selectedVerses, color);
      this.store.saveVerseHighlights(highlights);
    });
  }

  private buildVerseHighlights(verses: Verse[], color: string): VerseHighlight[] {
    // TODO: get real translation
    const translation = 'KJV';
    // TODO: get real userId
    const userId = 1;
    const date = new Date();
    const dateTime = date.toISOString();
    // TODO: remove sys_createdDate and sys_updatedDate when db is ready
    const sys_createdDate = dateTime;
    const sys_updatedDate = dateTime;
    const common = { color, sys_createdDate, sys_updatedDate, translation, userId };

    return verses.map((verseObject) => {
      const { book, chapter, verse } = verseObject;
      return { ...common, book, chapter, verse };
    });
  }
}

export interface VerseHighlight {
  id?: number;
  book: number;
  chapter: number;
  color: string;
  translation: string;
  userId: number;
  verse: number;
  sys_createdDate?: string;
  sys_updatedDate?: string;
}
