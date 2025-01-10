export interface Book {
  id: number;
  name: string;
  chapters: number;
  abbreviation: string;
}

export interface Bookmark {
  book: number;
  bookName?: string;
  chapter: number;
  verses: number[];
  title?: string;
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
  book: number;
  bookName?: string;
  chapter: number;
}

export interface Verse {
  id: number;
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}
