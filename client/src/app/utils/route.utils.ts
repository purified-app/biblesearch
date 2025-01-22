import { ActivatedRouteSnapshot } from '@angular/router';
import { AllBooks } from '../constants/books';
import { VersePageParams } from '../interfaces/route-params';
import { inject } from '@angular/core';
import { LocalStorage } from '../constants/localStorage';
import { BibleTranslationService } from '../services/bible-translation.service';
import { BookmarkService } from '../services/bookmark.service';

export default class RouteUtils {
  static redirectPathRoot = () => {
    const bookmarkService = inject(BookmarkService);
    const startPage = localStorage.getItem(LocalStorage.StartPage);
    switch (startPage) {
      case 'search':
        return 'search';
      case 'read':
        return 'read';
      case 'recentRead':
        const recentRead = bookmarkService.recentRead();
        const bibleTranslation = inject(BibleTranslationService);
        const translation = bibleTranslation.activeTranslation();
        if (!recentRead) return 'search';
        const { bookUsfm: bookUfsm, chapter } = recentRead;
        return `read/${translation.usfm}/${bookUfsm}/${chapter}`;
      default:
        return 'search';
    }
  };

  static redirectPathRead = () => {
    const bibleTranslation = inject(BibleTranslationService);
    const translation = bibleTranslation.activeTranslation();
    return `read/${translation.usfm}`;
  };

  static getVersePageTitle = (route: ActivatedRouteSnapshot) => {
    const { bookUsfm, chapter, translation } = route.params as VersePageParams;
    const books = AllBooks[translation as keyof typeof AllBooks];
    const bookName = books.find((b) => b.usfm === bookUsfm)?.name;
    return `${bookName} ${chapter}`;
  };
}
