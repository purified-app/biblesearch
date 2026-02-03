import { effect, inject, Injectable, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { VerseNotes } from '../../../interfaces';
import { VersePageParams } from '../../../interfaces/route-params';
import { ApiService } from '../../../services/api.service';
import { BookmarkService } from '../../../services/bookmark.service';
import { StorageService } from '../../../services/storage.service';
import NoteUtils from '../../../utils/note.utils';
import RouteUtils from '../../../utils/route.utils';
import { StorageUtils } from '../../../utils/storage.utils';

@Injectable()
export class VersesService {
  private apiService = inject(ApiService);
  private bookmarkService = inject(BookmarkService);
  private storage = inject(StorageService);
  private route = inject(ActivatedRoute);

  // Signals
  routeParams = toSignal<VersePageParams>(this.route.params as any);
  selectedVerses = signal<VerseNotes[]>([]);

  constructor() {
    effect(() => {
      const chapterInfo = RouteUtils.getChapterInfo(this.routeParams()!);
      const { chapter, name, translation, usfm } = chapterInfo;
      this.bookmarkService.recentRead.set({
        chapter,
        bookName: name!,
        bookUsfm: usfm,
        translation,
      });
    });
  }
  versesResource = resource<VerseNotes[], VersePageParams>({
    params: () => this.routeParams()!,
    loader: async ({ params }) => {
      const { translation, bookUsfm, chapter } = params;
      if (!params) return [];
      const verses = await this.apiService.getVerses(translation, bookUsfm, chapter);
      const notes = StorageUtils.getNotes(this.storage);
      const versesWithNotes = verses.map((verse) => ({
        ...verse,
        notes: NoteUtils.getNotesForVerse(notes, verse),
      }));
      this.addHighlightToVerses(versesWithNotes);
      return versesWithNotes;
    },
    defaultValue: [],
  });

  addHighlightToVerses(verses: (VerseNotes & { color?: string })[]) {
    const highlights = this.getHighlightVerses();
    verses.forEach((verse) => {
      const highlight = highlights.find((highlight) => highlight.verse === verse.verse);
      verse.color = highlight?.color;
    });
  }

  removeNoteFromVerses(verses: VerseNotes[], noteId: number) {
    return verses.map((verse) => ({
      ...verse,
      notes: verse.notes.filter((n) => n.id !== noteId),
    }));
  }

  getHighlightVerses() {
    const { bookUsfm, chapter } = this.routeParams()!;
    return StorageUtils.getVersesToHighlightByBook(this.storage, bookUsfm, Number(chapter));
  }
}
