import { ActivatedRouteSnapshot, Params } from '@angular/router';
import { AllBooks } from '../constants/books';
import { VersePageParams } from '../interfaces/route-params';
import { inject } from '@angular/core';
import { BibleTranslationService } from '../services/bible-translation.service';
import { BookmarkService } from '../services/bookmark.service';
import { UrlPath } from '../constants/url-path';
import { StorageService } from '../services/storage.service';

export default class RouteUtils {
  static redirectPathRoot = () => {
    const bookmarkService = inject(BookmarkService);
    const storageService = inject(StorageService);
    const startPage = storageService.get('startPage', 'search');
    switch (startPage) {
      case 'search':
        return UrlPath.search;
      case 'read':
        return UrlPath.read;
      case 'recentRead':
        const recentRead = bookmarkService.recentRead();
        if (!recentRead) return UrlPath.search;
        const { bookUsfm, chapter, translation } = recentRead;
        return `${UrlPath.read}/${translation}/${bookUsfm}/${chapter}`;
      default:
        return UrlPath.search;
    }
  };

  static redirectPathRead = () => {
    const bibleTranslation = inject(BibleTranslationService);
    return `read/${bibleTranslation.translation()}`;
  };

  static getVersePageTitle = (route: ActivatedRouteSnapshot) => {
    const { bookUsfm, chapter, translation } = route.params as VersePageParams;
    const books = AllBooks[translation as keyof typeof AllBooks];
    const bookName = books?.find((b) => b.usfm === bookUsfm)?.name;
    return `${bookName} ${chapter}`;
  };

  static getChapterInfo = (params: VersePageParams) => {
    const { bookUsfm, chapter, translation } = params;
    const bookData = AllBooks[translation as keyof typeof AllBooks].find(
      (b) => b.usfm === bookUsfm
    );
    return { ...bookData!, chapter: Number(chapter) };
  };
  static getChapterPageTitle = (route: ActivatedRouteSnapshot) => {
    const { bookUsfm, translation } = route.params as VersePageParams;
    const books = AllBooks[translation as keyof typeof AllBooks];
    const bookName = books.find((b) => b.usfm === bookUsfm)?.name;
    return bookName;
  };
}
