import { ActivatedRouteSnapshot, Params } from '@angular/router';
import { VersePageParams } from '../interfaces/route-params';
import { inject } from '@angular/core';
import { BibleTranslationService } from '../services/bible-translation.service';
import { BookmarkService } from '../services/bookmark.service';
import { UrlPath } from '../constants/url-path';
import { StorageService } from '../services/storage.service';
import { ApiService } from '../services/api.service';

export default class RouteUtils {
  static redirectPathRoot = () => {
    const bookmarkService = inject(BookmarkService);
    const storageService = inject(StorageService);
    const startPage = storageService.get('startPage');
    switch (startPage) {
      case 'search':
        return UrlPath.search;
      case 'read':
        return UrlPath.read;
      case 'recentRead':
        const recentRead = bookmarkService.recentRead();
        const fragment = storageService.get('routeFragment');
        if (!recentRead) return UrlPath.search;
        const { bookUsfm, chapter, translation } = recentRead;
        return `${UrlPath.read}/${translation}/${bookUsfm}/${chapter}${fragment ? `#${fragment}` : ''}`;
      default:
        return UrlPath.search;
    }
  };

  static redirectPathRead = () => {
    const bibleTranslation = inject(BibleTranslationService);
    return `read/${bibleTranslation.translation()}`;
  };

  static getVersePageTitle = async (route: ActivatedRouteSnapshot) => {
    const apiService = inject(ApiService);
    const { bookUsfm, chapter, translation } = route.params as VersePageParams;
    const books = await apiService.getBooks(translation);
    const bookName = books.find((book) => book.usfm === bookUsfm)?.name;
    return `${bookName} ${chapter}`;
  };

  static getChapterPageTitle = async (route: ActivatedRouteSnapshot) => {
    const apiService = inject(ApiService);
    const { bookUsfm, translation } = route.params as VersePageParams;
    const books = await apiService.getBooks(translation);
    return books.find((book) => book.usfm === bookUsfm)?.name;
  };
}
