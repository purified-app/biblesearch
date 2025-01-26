import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  ActionSheetButton,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { combineLatest, debounceTime } from 'rxjs';
import { NoteModalService } from 'src/app/components/note-modal/note-modal.service';
import { VerseActionsModalService } from 'src/app/components/verse-actions-modal/verse-actions-modal.service';
import { AllBooks } from 'src/app/constants/books';
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
  verses = signal<Verse[]>([]);
  verseFocused = false;
  versesToFocus?: number[];
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

  private lastParams?: Params;
  private apiService = inject(ApiService);
  private storeService = inject(LocalStorageService);
  private bookmarkService = inject(BookmarkService);
  private noteModalService = inject(NoteModalService);
  private verseActionsModalService = inject(VerseActionsModalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private routeParamMap = toSignal(this.route.paramMap);

  constructor() {
    combineLatest([this.route.params, this.route.queryParams])
      .pipe(debounceTime(0), takeUntilDestroyed())
      .subscribe(([params, queryParams]) => {
        const { verse } = queryParams;
        const verses = verse?.split(',').map(Number);
        if (verses && verses !== this.versesToFocus) {
          this.versesToFocus = verses;
          this.verseFocused = false;
        }
        if (this.lastParams !== params) {
          const { bookUsfm, chapter, translation } = params as VersePageParams;
          const books = AllBooks[translation as keyof typeof AllBooks];
          const bookName = books.find((b) => b.usfm === bookUsfm)?.name;
          const recentRead = { bookName, bookUsfm, chapter: Number(chapter), translation };
          this.bookmarkService.setRecentRead(recentRead);
          this.getVerses();
        } else {
          this.focusVerse(verse);
        }
        this.lastParams = params;
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
          const verses = this.getVerseWithHighlights(this.verses());
          this.verses.set(verses);
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

    const chapter = verse.chapter;
    const bookName = verse.bookName;
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
    const translation = this.routeParamMap()?.get('translation');
    this.router.navigate([`/read/${translation}/${bookUsfm}/${chapter}`]);
  }

  private async getVerses() {
    const { verse } = this.route.snapshot.queryParams;
    const { bookUsfm, chapter, translation } = this.route.snapshot.params;
    const verses = await this.apiService.getVerses(translation, bookUsfm, chapter);
    this.verses.set(this.getVerseWithHighlights(verses));
    this.focusVerse(verse);
  }

  private getVerseHighlights() {
    const { bookUsfm, chapter, translation } = this.route.snapshot.params;
    return this.storeService.getVerseHighlightsByBook(bookUsfm, Number(chapter));
  }

  private getVerseWithHighlights(verses: (Verse & { color?: string })[]) {
    const highlights = this.getVerseHighlights();
    verses.forEach((verse) => {
      const highlight = highlights.find((highlight) => highlight.verse === verse.verse);
      verse.color = highlight?.color;
    });
    return verses;
  }

  private focusVerse(verse: string) {
    // verse format is either '1' or '1,2,3'
    const firstVerse = verse?.split(',')?.[0];
    if (firstVerse && !this.verseFocused) {
      setTimeout(() => {
        const element = document.getElementById(`verse-${firstVerse}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          this.verseFocused = true;
        }
      });
    }
  }
}
