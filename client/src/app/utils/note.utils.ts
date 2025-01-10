import { Bookmark, Note, Verse } from '../interfaces';

export default class NoteUtils {
  static getNoteTitle(note: Note) {
    if (!note) return '';
    const { verses } = note.bookmark;
    const verseText = verses.length === 1 ? verses[0] : `${verses[0]}-${verses[verses.length - 1]}`;
    return `${note.bookmark.bookName} ${note.bookmark.chapter}:${verseText}`;
  }

  getNoteByBookmark(bookmark: Bookmark, notes: Note[]): Note | undefined {
    return notes.find(
      (note) =>
        note.bookmark.book === bookmark.book &&
        note.bookmark.chapter === bookmark.chapter &&
        note.bookmark.verses.length === bookmark.verses.length &&
        note.bookmark.verses.every((verse, index) => verse === bookmark.verses[index])
    );
  }
  static getNotesForVerse(notes: Note[], verse: Verse) {
    return notes.filter((note) => {
      return (
        note.bookmark.book === verse.book &&
        note.bookmark.chapter === verse.chapter &&
        note.bookmark.verses.includes(verse.verse)
      );
    });
  }

  static createNoteFromVerses(verses: Verse[]): Note {
    const date = new Date();
    const note: Note = {
      id: date.getTime(),
      bookmark: {
        book: verses[0].book,
        bookName: verses[0].book_name,
        verses: verses.map((verse) => verse.verse),
        chapter: verses[0].chapter,
      },
      createdDate: date.toISOString(),
      content: '',
      updatedDate: date.toISOString(),
    };
    return note;
  }
}
