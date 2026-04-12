import { computed, effect, inject, Injectable, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Verse, VerseNotes } from '../../../interfaces';
import { VersePageParams } from '../../../interfaces/route-params';
import { ApiService } from '../../../services/api.service';
import { BookmarkService } from '../../../services/bookmark.service';
import { StorageService } from '../../../services/storage.service';
import { VerseHighlightsService } from '../../../services/verse-highlights.service';
import RouteUtils from '../../../utils/route.utils';
import { StorageUtils } from '../../../utils/storage.utils';

@Injectable()
export class VersesService {
  private apiService = inject(ApiService);
  private bookmarkService = inject(BookmarkService);
  private storage = inject(StorageService);
  private route = inject(ActivatedRoute);
  private verseHighlightsService = inject(VerseHighlightsService);

  // Signals
  routeParams = toSignal<VersePageParams>(this.route.params as any);
  selectedVerses = signal<VerseNotes[]>([]);

  notes = this.storage.getSignal('notes', []);
  allVerseHighlights = this.storage.getSignal('verseHighlights', []);

  chapterHighlights = computed(() => {
    const { bookUsfm, chapter, translation } = this.routeParams()!;
    const highlights = this.verseHighlightsService.getHighlightMap(bookUsfm, +chapter, translation);
    return highlights;
  });
  chapterNotes = computed(() => {
    const { bookUsfm, chapter } = this.routeParams()!;
    const notes = this.notes();
    return notes.filter((note) => {
      return note.bookmark.bookUsfm === bookUsfm && note.bookmark.chapter === +chapter;
    });
  });
  versesIncMetadata = computed(() => {
    const verses = this.versesResource.value();
    return verses?.map((verse) => {
      const color = this.chapterHighlights().get(verse.verse) ?? '';
      const notes = this.chapterNotes().filter((n) => n.bookmark.verses[0] === verse.verse);
      return { ...verse, color, notes };
    });
  });

  constructor() {
    effect(() => {
      const chapterInfo = RouteUtils.getChapterInfo(this.routeParams()!);
      const { chapter, name, translation, usfm } = chapterInfo;
      this.storage.set('recentRead', {
        chapter,
        bookName: name!,
        bookUsfm: usfm,
        translation,
      });
    });
  }
  versesResource = resource<Verse[], VersePageParams>({
    params: () => this.routeParams()!,
    loader: async ({ params }) => {
      const { translation, bookUsfm, chapter } = params;
      if (!params) return [];
      const verses = await this.apiService.getVerses(translation, bookUsfm, chapter);
      return verses;
    },
    defaultValue: [],
  });

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
