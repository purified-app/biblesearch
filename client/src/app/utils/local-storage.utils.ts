import { VerseHighlight } from '../components/verse-actions-modal/verse-highlight.service';
import { LocalStorage } from '../constants/localStorage';
import { Note, Bookmark, RecentRead } from '../interfaces';

export class LocalStorageUtils {
  static getBookmarks(): Bookmark[] {
    const bookmarks = localStorage.getItem(LocalStorage.Bookmarks);
    return bookmarks ? JSON.parse(bookmarks) : [];
  }

  static getBookmarkLimit(): number {
    return Number(localStorage.getItem(LocalStorage.BookmarksLimit) || 5);
  }

  static getDarkMode(): boolean {
    let darkModeRaw = localStorage.getItem(LocalStorage.DarkMode);
    return darkModeRaw === null ? true : darkModeRaw === 'true';
  }
  static getFontSize(): number {
    return Number(localStorage.getItem(LocalStorage.FontSize) || 16);
  }

  static getLanguage(): string {
    return localStorage.getItem(LocalStorage.Language) || navigator.language.slice(0, 2);
  }

  static getNotes(): Note[] {
    const notes = localStorage.getItem(LocalStorage.Notes);
    return notes ? LocalStorageUtils.sortNotes(JSON.parse(notes)) : [];
  }

  static getRecentRead(): RecentRead | undefined {
    const recentRead = localStorage.getItem(LocalStorage.RecentRead);
    return recentRead
      ? JSON.parse(recentRead)
      : { bookUsfm: 'GEN', chapter: 1, translation: 'KJV' };
  }

  static getStartPage(): string {
    return localStorage.getItem(LocalStorage.StartPage) || 'recentRead';
  }

  static getTranslation(): string {
    return localStorage.getItem(LocalStorage.Translation) || 'KJV';
  }

  static getVerseHighlights(): VerseHighlight[] {
    const highlights = localStorage.getItem(LocalStorage.VerseHighlights);
    return highlights ? JSON.parse(highlights) : [];
  }

  static getVerseHighlightsByBook(
    bookUsfm: string,
    chapter: number,
    translation?: string
  ): VerseHighlight[] {
    const highlights = LocalStorageUtils.getVerseHighlights();
    return highlights.filter((highlight) => {
      return (
        highlight.bookUsfm === bookUsfm &&
        highlight.chapter === chapter &&
        (!translation || highlight.translation === translation)
      );
    });
  }

  static removeBookmarksLimit(): void {
    localStorage.removeItem(LocalStorage.BookmarksLimit);
  }

  static removeNote(id: number): void {
    const notes = LocalStorageUtils.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index > -1) notes.splice(index, 1);
    LocalStorageUtils.saveNotes(notes);
  }

  static saveBookmarks(bookmarks: Bookmark[]): void {
    localStorage.setItem(LocalStorage.Bookmarks, JSON.stringify(bookmarks));
  }

  static saveBookmarkLimit(limit: number): void {
    localStorage.setItem(LocalStorage.BookmarksLimit, limit.toString());
  }

  static saveDarkMode(darkMode: boolean): void {
    localStorage.setItem(LocalStorage.DarkMode, darkMode.toString());
  }

  static saveFontSize(fontSize: string): void {
    localStorage.setItem(LocalStorage.FontSize, fontSize);
  }

  static saveLanguage(language: string) {
    localStorage.setItem(LocalStorage.Language, language);
  }

  static saveNote(note: Note): void {
    const date = new Date();
    if (!note.id) {
      note.createdDate = date.toISOString();
      note.id = date.getTime();
    }
    note.updatedDate = new Date().toISOString();
    const notes = LocalStorageUtils.getNotes();
    const index = notes.findIndex((n) => n.id === note.id);
    if (index > -1) notes[index] = note;
    else notes.push(note);
    LocalStorageUtils.saveNotes(notes);
  }

  static saveNotes(notes: Note[]): void {
    localStorage.setItem(LocalStorage.Notes, JSON.stringify(LocalStorageUtils.sortNotes(notes)));
  }

  static saveRecentRead(recentRead: RecentRead): void {
    localStorage.setItem(LocalStorage.RecentRead, JSON.stringify(recentRead));
  }

  static saveStartPage(page: string): void {
    localStorage.setItem(LocalStorage.StartPage, page);
  }

  static saveTranslation(translation: string): void {
    localStorage.setItem(LocalStorage.Translation, translation);
  }

  static saveVerseHighlights(highlights: VerseHighlight[]): void {
    const existingHighlights = LocalStorageUtils.getVerseHighlights();
    if (existingHighlights.length) {
      highlights.forEach((highlight) => {
        const index = existingHighlights.findIndex(
          (existingHighlight) =>
            existingHighlight.translation === highlight.translation &&
            existingHighlight.bookUsfm === highlight.bookUsfm &&
            existingHighlight.chapter === highlight.chapter &&
            existingHighlight.verse === highlight.verse
        );
        if (index > -1) existingHighlights.splice(index, 1);
      });
    }
    const allHighlights = [...existingHighlights, ...highlights];
    localStorage.setItem(LocalStorage.VerseHighlights, JSON.stringify(allHighlights));
  }

  private static sortNotes(notes: Note[]): Note[] {
    notes.sort((a, b) => {
      const bookA = a.bookmark.bookNumber;
      const bookB = b.bookmark.bookNumber;
      if (bookA < bookB) return -1;
      if (bookA > bookB) return 1;
      const chapterA = a.bookmark.chapter;
      const chapterB = b.bookmark.chapter;
      if (chapterA < chapterB) return -1;
      if (chapterA > chapterB) return 1;
      const verseA = a.bookmark.verses[0];
      const verseB = b.bookmark.verses[0];
      if (verseA < verseB) return -1;
      if (verseA > verseB) return 1;
      return 0;
    });
    return notes;
  }
}
