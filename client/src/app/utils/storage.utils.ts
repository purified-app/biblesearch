import { Note } from '../interfaces';
import { StorageService } from '../services/storage.service';
import { VerseHighlight } from '../components/verse-actions-modal/verse-highlight.service';

export class StorageUtils {
  static getNotes(storage: StorageService): Note[] {
    const notes = storage.get('notes');
    return StorageUtils.sortNotes(notes);
  }

  static getVersesToHighlightByBook(
    storage: StorageService,
    bookUsfm: string,
    chapter: number,
    translation?: string,
  ): VerseHighlight[] {
    const highlights = storage.get('verseHighlights');
    return highlights.filter((highlight: VerseHighlight) => {
      return (
        highlight.bookUsfm === bookUsfm &&
        highlight.chapter === chapter &&
        (!translation || highlight.translation === translation)
      );
    });
  }

  static updateNoteMeta(note: Note): void {
    const date = new Date();
    if (!note.id) {
      note.createdDate = date.toISOString();
      note.id = date.getTime();
    }
    note.updatedDate = date.toISOString();
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
