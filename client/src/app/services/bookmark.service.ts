import { effect, inject, Injectable } from '@angular/core';
import { Verse } from '../interfaces';
import BookmarkUtils from '../utils/bookmark.utils';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private storage = inject(StorageService);
  private initialized = false;
  recentRead = this.storage.getSignal('recentRead', {
    bookUsfm: 'GEN',
    chapter: 1,
    translation: 'KJV',
  });
  bookmarks = this.storage.getSignal('bookmarks', []);

  constructor() {
    effect(() => {
      if (this.initialized) this.storage.set('recentRead', this.recentRead());
    });
    this.initialized = true;
  }

  saveVersesAsBookmark(verses: Verse[]) {
    const bookmark = BookmarkUtils.createBookmarkFromVerses(verses);
    const bookmarks = this.storage.get('bookmarks', []);
    const bookmarksLimit = this.storage.get('bookmarksLimit', 5);
    // Check the length of the array'
    if (bookmarks.length >= bookmarksLimit) {
      // Remove the last element if the array is at max length
      bookmarks.pop();
    }
    // Add the new value to the beginning of the array
    bookmarks.unshift(bookmark);
    this.storage.set('bookmarks', bookmarks);
  }
}
