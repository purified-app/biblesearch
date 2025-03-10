import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetButton,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { NoteModalService } from 'src/app/components/note-modal/note-modal.service';
import { VerseActionsModalService } from 'src/app/components/verse-actions-modal/verse-actions-modal.service';
import { AllBooks } from 'src/app/constants/books';
import { UrlPath } from 'src/app/constants/url-path';
import { Note, Verse } from 'src/app/interfaces';
import { VersePageParams } from 'src/app/interfaces/route-params';
import { ApiService } from 'src/app/services/api.service';
import { BookmarkService } from 'src/app/services/bookmark.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import HighlightUtils from 'src/app/utils/highlight.utils';
import NoteUtils from 'src/app/utils/note.utils';

@Component({
  selector: 'app-verses',
  imports: [IonButton, IonContent, IonFab, IonFabButton, IonIcon],
  templateUrl: './verses.page.html',
  styleUrls: ['./verses.page.scss'],
})
export class VersesPage {
  private route = inject(ActivatedRoute);

  selectedVerses = signal<Verse[]>([]);
  selectedVersesText = '';
  actionSheetButtons: ActionSheetButton[] = [
    {
      icon: 'bookmark-outline',
      text: 'Bookmark',
      role: 'bookmark',
    },
    { icon: 'document-text-outline', text: 'Add note', role: 'notes' },
  ];

  protected notes: Note[] = [];
  protected routeQueryParams = toSignal(this.route.queryParams);
  protected routeParams = toSignal(this.route.params);
  protected versesToFocus = computed(() => {
    const { verse } = this.routeQueryParams() || {};
    return verse?.split(',').map(Number);
  });

  private apiService = inject(ApiService);
  private storeService = inject(LocalStorageService);
  private bookmarkService = inject(BookmarkService);
  private noteModalService = inject(NoteModalService);
  private verseActionsModalService = inject(VerseActionsModalService);
  private router = inject(Router);

  protected verses = resource<Verse[], VersePageParams>({
    request: () => this.routeParams() as VersePageParams,
    loader: async ({ request }) => {
      const { translation, bookUsfm, chapter } = request;
      if (!request) return [];
      const verses = await this.apiService.getVerses(translation, bookUsfm, chapter);
      this.addHighlightToVerses(verses);
      this.focusVerse();
      return verses;
    },
  });

  constructor() {
    effect(() => {
      const { bookUsfm, chapter, translation } = this.routeParams() || {};
      const books = AllBooks[translation as keyof typeof AllBooks];
      const bookName = books.find((b) => b.usfm === bookUsfm)?.name;
      const recentRead = { bookName, bookUsfm, chapter: Number(chapter), translation };
      this.bookmarkService.setRecentRead(recentRead);
    });
    this.notes = this.storeService.getNotes();
  }

  async onVerseFabClick() {
    const modal = await this.verseActionsModalService.openModal(this.selectedVerses());
    modal.onDidDismiss().then(({ data, role }) => {
      switch (role) {
        case 'bookmark':
          break;
        case 'highlight':
          this.addHighlightToVerses(this.verses.value()!);
          break;
        case 'note':
          this.notes = data;
          break;
      }
      this.selectedVerses.set([]);
    });
  }

  onNoteClick(event: Event, note: Note) {
    event.stopImmediatePropagation();
    this.noteModalService.openModal(note);
  }

  onVerseClick(verse: Verse) {
    let selectedVerses = this.selectedVerses();
    const found = selectedVerses.find((v) => v.id === verse.id);
    if (!found) selectedVerses.push(verse);
    else selectedVerses = selectedVerses.filter((v) => v.id !== verse.id);

    this.selectedVerses.set(selectedVerses);

    if (!selectedVerses.length) return;
    selectedVerses.sort((a, b) => a.verse - b.verse);

    const { bookName, chapter } = verse;
    const firstVerse = selectedVerses[0].verse;
    const lastVerse = selectedVerses[selectedVerses.length - 1].verse;
    const verseText = selectedVerses.length > 1 ? `${firstVerse}-${lastVerse}` : verse.verse;
    this.selectedVersesText = `${bookName} ${chapter}:${verseText}`;
  }

  isSelected(verse: Verse): boolean {
    return !!this.selectedVerses().find((v) => v.id === verse.id);
  }

  navigateBack() {
    let { bookUsfm, chapter, translation } = this.route.snapshot.params;
    const books = AllBooks[translation as keyof typeof AllBooks];
    const currentBook = books.find((b) => b.usfm === bookUsfm);
    if (!currentBook) return;
    chapter = Number(chapter);

    if (chapter > 1) {
      chapter--;
    } else if (currentBook.bookNumber > 1) {
      const prevBook = books.find((b) => b.bookNumber === currentBook.bookNumber - 1);
      if (!prevBook) return;
      bookUsfm = prevBook.usfm;
      chapter = prevBook?.chapters || 1;
    }
    this.navigate(bookUsfm, chapter);
  }

  navigateForward() {
    let { bookUsfm, chapter, translation } = this.route.snapshot.params;
    const books = AllBooks[translation as keyof typeof AllBooks];
    const currentBook = books.find((b) => b.usfm === bookUsfm);
    if (!currentBook) return;
    chapter = Number(chapter);

    if (chapter < currentBook.chapters) {
      chapter++;
    } else if (currentBook.bookNumber < 66) {
      bookUsfm = books.find((b) => b.bookNumber === currentBook.bookNumber + 1)?.usfm;
      chapter = 1;
    }
    this.navigate(bookUsfm, chapter);
  }

  protected getNotesForVerse = (verse: Verse) => NoteUtils.getNotesForVerse(this.notes, verse);
  protected getHighlightTextColor = HighlightUtils.getHighlightTextColor;
  protected getHighlightBackgroundColor = HighlightUtils.getHighlightBackgroundColor;

  private navigate(bookUsfm: string, chapter: number) {
    const { translation } = this.route.snapshot.params;
    this.router.navigate([`/${UrlPath.read}/${translation}/${bookUsfm}/${chapter}`]);
  }

  private getVerseHighlights() {
    const { bookUsfm, chapter } = this.route.snapshot.params;
    return this.storeService.getVerseHighlightsByBook(bookUsfm, Number(chapter));
  }

  private addHighlightToVerses(verses: (Verse & { color?: string })[]) {
    const highlights = this.getVerseHighlights();
    verses.forEach((verse) => {
      const highlight = highlights.find((highlight) => highlight.verse === verse.verse);
      verse.color = highlight?.color;
    });
  }

  private focusVerse() {
    setTimeout(() => {
      const firstVerse = this.versesToFocus()?.[0];
      if (!firstVerse) return;
      const element = document.getElementById(`verse-${firstVerse}`);
      element?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
