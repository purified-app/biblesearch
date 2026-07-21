import { Injectable } from '@angular/core';
import { ALStore, entityPlugin, persistPlugin } from '@angular-libs/store';

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
    bookName: 'Genesis',
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
export class StorageService extends ALStore<AppStorage> {
  notesAdapter = this.registerPlugin(entityPlugin('notes', { idField: 'id' }));
  verseHighlights = this.registerPlugin(entityPlugin('verseHighlights', { idField: 'verse' }));
  constructor() {
    super(initialValues);
    this.registerPlugin(persistPlugin('all'));
  }
}
