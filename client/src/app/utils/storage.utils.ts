import { Note } from '../interfaces';
import { StorageService } from '../services/storage.service';
import { VerseHighlight } from '../components/verse-actions-modal/verse-highlight.service';

export class StorageUtils {
  static getNotes(storage: StorageService): Note[] {
    const notes = storage.get('notes', []);
    return StorageUtils.sortNotes(notes);
  }

  static getVersesToHighlightByBook(
    storage: StorageService,
    bookUsfm: string,
    chapter: number,
    translation?: string
  ): VerseHighlight[] {
    const highlights = storage.get('verseHighlights', []);
    return highlights.filter((highlight: VerseHighlight) => {
      return (
        highlight.bookUsfm === bookUsfm &&
        highlight.chapter === chapter &&
        (!translation || highlight.translation === translation)
      );
    });
  }

  static saveNote(note: Note, storage: StorageService): void {
    const date = new Date();
    if (!note.id) {
      note.createdDate = date.toISOString();
      note.id = date.getTime();
    }
    note.updatedDate = new Date().toISOString();
    const notes = storage.get('notes', []);
    const index = notes.findIndex((n) => n.id === note.id);
    if (index > -1) notes[index] = note;
    else notes.push(note);
    storage.set('notes', StorageUtils.sortNotes(notes));
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
