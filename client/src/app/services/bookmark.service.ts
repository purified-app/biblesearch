import { Injectable, signal } from '@angular/core';
import { books } from '../constants/books-chapters';
import { Bookmark, RecentRead, Verse } from '../interfaces';
import Utils from '../utils/utils';
import { LocalStorage } from '../constants/localStorage';

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  recentRead = signal<RecentRead | undefined>(undefined);
  bookmarks = signal<Bookmark[]>([]);

  constructor() {
    this.bookmarks.set(this.getBookmarks());
    this.recentRead.set(this.getRecentRead());
  }

  saveVersesAsBookmark(verses: Verse[]) {
    const bookmark = Utils.getBookmarkFromVerses(verses);
    // Retrieve the array from localStorage
    const bookmarks = this.getBookmarks();
    const bookmarsLimit = Number(localStorage.getItem(LocalStorage.BookmarksLimit) || 5);
    // Check the length of the array
    if (bookmarks.length >= bookmarsLimit) {
      // Remove the last element if the array is at max length
      bookmarks.pop();
    }
    // Add the new value to the beginning of the array
    bookmarks.unshift(bookmark);
    this.bookmarks.set(bookmarks);
    // Store the updated array back to localStorage
    localStorage.setItem(LocalStorage.Bookmarks, JSON.stringify(bookmarks));
  }

  getBookmarks(): Bookmark[] {
    const bookmarks = localStorage.getItem(LocalStorage.Bookmarks);
    return bookmarks ? JSON.parse(bookmarks) : [];
  }

  getRecentRead(): RecentRead | undefined {
    const recentRead = localStorage.getItem(LocalStorage.RecentRead);
    return recentRead ? JSON.parse(recentRead) : undefined;
  }

  setRecentRead(recentRead: RecentRead) {
    const bookId = Number(recentRead['book']);
    const book = books.find((b) => b.id === bookId);
    const recent = { ...recentRead, bookName: book?.name };
    this.recentRead.set(recent);
    localStorage.setItem(LocalStorage.RecentRead, JSON.stringify(recent));
  }
}
