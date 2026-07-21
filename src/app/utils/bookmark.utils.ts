import { VerseTarget, BookmarkAnnotation } from '../interfaces';

export default class BookmarkUtils {
  static getTitle(annotation?: BookmarkAnnotation | { targets: VerseTarget[] }) {
    const targets = annotation?.targets ?? [];
    if (!targets.length) return '';
    const first = targets[0];
    const last = targets[targets.length - 1];
    const verseText = first.verse === last.verse ? first.verse : `${first.verse}-${last.verse}`;
    return `${first.bookName} ${first.chapter}:${verseText}`;
  }
}
