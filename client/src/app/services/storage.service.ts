import { Injectable } from '@angular/core';
import { SignalStorage } from '@angular-libs/signal-storage';

import { Bookmark, Note, RecentRead } from '../interfaces';
import { VerseHighlight } from '../components/verse-actions-modal/verse-highlight.service';

type AppStorage = {
  bookmarks: Bookmark[];
  bookmarksLimit: number;
  darkMode: boolean;
  fontSize: number;
  language: string;
  notes: Note[];
  recentRead: RecentRead;
  renderNotes: boolean;
  /** Route fragment. Url `#verse-17` */
  routeFragment: string;
  startPage: StartPage;
  translation: string;
  verseHighlights: VerseHighlight[];
};

export type StartPage = 'recentRead' | 'bookmarks' | 'notes' | 'search' | 'read';

@Injectable({
  providedIn: 'root',
})
export class StorageService extends SignalStorage<AppStorage> {
  constructor() {
    super(localStorage);
  }
}
