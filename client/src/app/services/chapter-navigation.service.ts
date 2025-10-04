import { inject, Injectable } from '@angular/core';
import { NavController } from '@ionic/angular/standalone';
import { NavigationOptions } from 'node_modules/@ionic/angular/common/providers/nav-controller';
import { AllBooks } from 'src/app/constants/books';
import { UrlPath } from 'src/app/constants/url-path';
import { VersePageParams } from 'src/app/interfaces/route-params';

interface Book {
  name: string;
  abbreviation: string;
  bookNumber: number;
  chapters: number;
  usfm: string;
  canon: string;
  translation: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChapterNavigationService {
  private navController = inject(NavController);

  navigateChapter(
    direction: 'forward' | 'backward',
    versePageParams: VersePageParams,
    navOptions?: NavigationOptions
  ) {
    const { translation, bookUsfm, chapter } = versePageParams;
    const books = AllBooks[translation as keyof typeof AllBooks] as Book[];
    const currentBook = books.find((b) => b.usfm === bookUsfm);
    if (!currentBook) return;

    const targetChapter = this.calculateTargetChapter(
      currentBook,
      Number(chapter),
      direction,
      books
    );
    if (!targetChapter) return;

    const url = `/${UrlPath.read}/${translation}/${targetChapter.bookUsfm}/${targetChapter.chapter}`;
    direction === 'forward'
      ? this.navController.navigateForward(url, navOptions)
      : this.navController.navigateBack(url, navOptions);
  }

  private calculateTargetChapter(
    currentBook: Book,
    currentChapter: number,
    direction: 'forward' | 'backward',
    books: Book[]
  ): { bookUsfm: string; chapter: number } | null {
    const increment = direction === 'forward' ? 1 : -1;
    const boundaryCheck =
      direction === 'forward' ? currentChapter < currentBook.chapters : currentChapter > 1;

    if (boundaryCheck) {
      return { bookUsfm: currentBook.usfm, chapter: currentChapter + increment };
    }

    const adjacentBook = books.find((b) => b.bookNumber === currentBook.bookNumber + increment);
    if (!adjacentBook) return null;

    return {
      bookUsfm: adjacentBook.usfm,
      chapter: direction === 'forward' ? 1 : adjacentBook.chapters,
    };
  }
}
