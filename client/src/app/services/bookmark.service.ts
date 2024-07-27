import { Injectable } from '@angular/core';
import { books } from '../constants/books-chapters';
import { Bookmark, RecentRead, Verse } from '../interfaces';
import Utils from '../utils/utils';
import { LocalStorage } from '../constants/localStorage';

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  recentRead?: RecentRead;
  bookmarks: Bookmark[] = [];
  constructor() {
    this.bookmarks = this.getBookmarks();
    this.recentRead = this.getRecentRead();
  }

  saveVersesAsBookmark(verses: Verse[]) {
    const bookmark = Utils.convertVersesToBookmark(verses);
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
    this.bookmarks = bookmarks;
    // Store the updated array back to localStorage
    localStorage.setItem(LocalStorage.Bookmarks, JSON.stringify(bookmarks));
  }

  getBookmarks() {
    return JSON.parse(localStorage.getItem(LocalStorage.Bookmarks) || '[]');
  }

  getRecentRead() {
    return JSON.parse(localStorage.getItem(LocalStorage.RecentRead) || 'null');
  }

  setRecentRead(recentRead: RecentRead) {
    const bookId = Number(recentRead['book']);
    const book = books.find((b) => b.id === bookId);
    const recent = { ...recentRead, bookName: book?.name };
    this.recentRead = recent;
    localStorage.setItem(LocalStorage.RecentRead, JSON.stringify(recent));
  }
}
