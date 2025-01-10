import { Bookmark, Verse } from '../interfaces';

export default class BookmarkUtils {
  static createBookmarkFromVerses(verses: Verse[]): Bookmark {
    if (verses.length === 0) {
      throw new Error('The verses array should not be empty.');
    }

    // Assuming all verses belong to the same book and chapter
    const bookName = verses[0].book_name;
    const book = verses[0].book;
    const chapter = verses[0].chapter;
    const verseNumbers = verses.map((verse) => verse.verse);

    const firstVerse = verseNumbers[0];
    const lastVerse = verseNumbers[verseNumbers.length - 1];
    const verseText = verses.length === 1 ? firstVerse : `${firstVerse}-${lastVerse}`;
    const title = `${bookName} ${chapter}:${verseText}`;

    return {
      book,
      bookName,
      chapter,
      verses: verseNumbers,
      title,
    };
  }
  static getTitle(bookmark: Bookmark) {
    if (!bookmark) return '';
    const { bookName, chapter, verses } = bookmark;
    const verseText = verses.length === 1 ? verses[0] : `${verses[0]}-${verses[verses.length - 1]}`;
    return `${bookName} ${chapter}:${verseText}`;
  }
}
