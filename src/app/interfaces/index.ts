export interface Book {
  /** 1-66 */
  bookNumber: number;
  /** `Genesis`, `Exodus` etc */
  name: string;
  chapters: number;
  /** `Gen`, `Exo` etc */
  // abbreviation: string;
  /** `GEN`, `EXO` etc */
  usfm: string;
  /** `ot` or `nt` */
  canon: 'ot' | 'nt';
  /** `KJV`, `NB` etc */
  translation: string;
}

export interface Bookmark {
  /** 1-66 */
  bookNumber: number;
  /** `GEN`, `EXO` etc */
  bookUsfm: string;
  /** `Genesis`, `Exodus` etc */
  bookName?: string;
  chapter: number;
  verses: number[];
  title?: string;
  /** `KJV`, `NB` etc */
  translation: string;
}

export interface Note {
  /** ID is a timestamp from when the note was created */
  id: number;
  bookmark: Bookmark;
  createdDate?: string;
  content?: string;
  updatedDate?: string;
}

export interface RecentRead {
  bookUsfm: string;
  bookName?: string;
  chapter: number;
  translation: string;
}

export interface Verse {
  id: number;
  /** `Genesis`, `Exodus` etc */
  bookName: string;
  /** 1-66 */
  bookNumber: number;
  /** `GEN`, `EXO` etc */
  bookUsfm: string;
  canon: string;
  chapter: number;
  verse: number;
  text: string;
  /** `KJV`, `NB` etc */
  translation: string;
}

export interface VerseNotes extends Verse {
  notes: Note[];
}
