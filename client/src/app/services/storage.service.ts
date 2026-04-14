import { Injectable } from '@angular/core';
import { ALStorage, createEntityAdapter } from '@angular-libs/store';

import { Bookmark, Note, RecentRead } from '../interfaces';
import { VerseHighlight } from '../components/verse-actions-modal/verse-highlight.service';

type AppStorage = {
  bookmarks: Bookmark[];
  bookmarksLimit: number;
  darkMode: boolean;
  fontSize: number;
  language: string;
  notes: Note[];
  recentRead: RecentRead | null;
  renderNotes: boolean;
  /** Route fragment. Url `#verse-17` */
  routeFragment: string | undefined;
  startPage: StartPage;
  translation: string;
  verseHighlights: VerseHighlight[];
};

const initialValues: AppStorage = {
  bookmarks: [],
  bookmarksLimit: 5,
  darkMode: true,
  fontSize: 16,
  language: navigator.language.slice(0, 2),
  notes: [],
  recentRead: {
    bookUsfm: 'GEN',
    chapter: 1,
    translation: 'KJV',
  },
  renderNotes: false,
  routeFragment: '',
  startPage: 'search',
  translation: 'KJV',
  verseHighlights: [],
};

export type StartPage = 'recentRead' | 'bookmarks' | 'notes' | 'search' | 'read';

@Injectable({ providedIn: 'root' })
export class StorageService extends ALStorage<AppStorage> {
  notesAdapter = createEntityAdapter(this.storeRef, 'notes', { idField: 'id' });
  verseHighlights = createEntityAdapter(this.storeRef, 'verseHighlights', { idField: 'verse' });
  constructor() {
    super(initialValues);
  }
}
