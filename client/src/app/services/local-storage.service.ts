import { Injectable } from '@angular/core';
import { Note } from '../interfaces';
import { LocalStorage } from '../constants/localStorage';
import { VerseHighlight } from '../components/verse-actions-modal/verse-highlight.service';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  deleteNote(id: number) {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index > -1) notes.splice(index, 1);
    this.saveNotes(notes);
  }

  saveNote(note: Note) {
    const date = new Date();
    if (!note.id) {
      note.createdDate = date.toISOString();
      note.id = date.getTime();
    }
    note.updatedDate = new Date().toISOString();
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === note.id);
    if (index > -1) notes[index] = note;
    else notes.push(note);
    this.saveNotes(notes);
  }

  getNotes(): Note[] {
    const notes = localStorage.getItem(LocalStorage.Notes);
    return notes ? this.sortNotes(JSON.parse(notes)) : [];
  }

  getTranslation(): string {
    return localStorage.getItem(LocalStorage.Translation) || 'KJV';
  }

  getVerseHighlights(): VerseHighlight[] {
    const highlights = localStorage.getItem(LocalStorage.VerseHighlights);
    return highlights ? JSON.parse(highlights) : [];
  }

  getVerseHighlightsByBook(
    bookUfsm: string,
    chapter: number,
    translation?: string
  ): VerseHighlight[] {
    const highlights = this.getVerseHighlights();
    return highlights.filter((highlight) => {
      return (
        highlight.bookUsfm === bookUfsm &&
        highlight.chapter === chapter &&
        (!translation || highlight.translation === translation)
      );
    });
  }

  saveNotes(notes: Note[]) {
    localStorage.setItem(LocalStorage.Notes, JSON.stringify(this.sortNotes(notes)));
  }

  saveTranslation(translation: string) {
    localStorage.setItem(LocalStorage.Translation, translation);
  }

  saveVerseHighlights(highlights: VerseHighlight[]) {
    const existingHighlights = this.getVerseHighlights();
    // If the new highlights exist, remove them from the array
    if (existingHighlights.length) {
      highlights.forEach((highlight) => {
        // check by translation, book, chapter, and verse
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

  private sortNotes(notes: Note[]) {
    // sort notes by data.book, data.chapter and first verse
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
