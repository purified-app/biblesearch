import { Injectable } from '@angular/core';
import { Note } from '../interfaces';
import { LocalStorage } from '../constants/localStorage';

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

  saveNotes(notes: Note[]) {
    localStorage.setItem(LocalStorage.Notes, JSON.stringify(this.sortNotes(notes)));
  }

  private sortNotes(notes: Note[]) {
    // sort notes by data.book, data.chapter and first verse
    notes.sort((a, b) => {
      const bookA = a.bookmark.book;
      const bookB = b.bookmark.book;
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
