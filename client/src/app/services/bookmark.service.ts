import { effect, Injectable, signal } from '@angular/core';
import { Bookmark, RecentRead, Verse } from '../interfaces';
import BookmarkUtils from '../utils/bookmark.utils';
import { LocalStorageUtils } from '../utils/local-storage.utils';

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  recentRead = signal<RecentRead | undefined>(LocalStorageUtils.getRecentRead());
  bookmarks = signal<Bookmark[]>(LocalStorageUtils.getBookmarks());

  constructor() {
    effect(() => {
      // TODO: skip save for init value
      LocalStorageUtils.saveBookmarks(this.bookmarks());
    });
    effect(() => {
      // TODO: skip save for init value
      LocalStorageUtils.saveRecentRead(this.recentRead()!);
    });
  }

  saveVersesAsBookmark(verses: Verse[]) {
    const bookmark = BookmarkUtils.createBookmarkFromVerses(verses);
    // Retrieve the array from localStorage
    const bookmarks = LocalStorageUtils.getBookmarks();
    const bookmarksLimit = LocalStorageUtils.getBookmarkLimit();
    // Check the length of the array
    if (bookmarks.length >= bookmarksLimit) {
      // Remove the last element if the array is at max length
      bookmarks.pop();
    }
    // Add the new value to the beginning of the array
    bookmarks.unshift(bookmark);
    this.bookmarks.set(bookmarks);
  }
}
