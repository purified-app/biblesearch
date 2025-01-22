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
        note.bookmark.bookUsfm === bookmark.bookUsfm &&
        note.bookmark.chapter === bookmark.chapter &&
        note.bookmark.verses.length === bookmark.verses.length &&
        note.bookmark.verses.every((verse, index) => verse === bookmark.verses[index])
    );
  }
  static getNotesForVerse(notes: Note[], verse: Verse) {
    return notes.filter((note) => {
      return (
        note.bookmark.bookUsfm === verse.bookUsfm &&
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
        bookNumber: verses[0].bookNumber,
        bookUsfm: verses[0].bookUsfm,
        bookName: verses[0].bookName,
        chapter: verses[0].chapter,
        translation: verses[0].translation,
        verses: verses.map((verse) => verse.verse),
      },
      createdDate: date.toISOString(),
      content: '',
      updatedDate: date.toISOString(),
    };
    return note;
  }
}
