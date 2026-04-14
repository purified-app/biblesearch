import { inject, Injectable } from '@angular/core';
import { Verse } from '../interfaces';
import BookmarkUtils from '../utils/bookmark.utils';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private storage = inject(StorageService);
  recentRead = this.storage.getSignal('recentRead');
  bookmarks = this.storage.getSignal('bookmarks');

  saveVersesAsBookmark(verses: Verse[]) {
    const bookmark = BookmarkUtils.createBookmarkFromVerses(verses);
    const bookmarks = this.storage.get('bookmarks');
    const bookmarksLimit = this.storage.get('bookmarksLimit');
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
