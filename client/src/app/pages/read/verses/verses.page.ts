import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
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
import { books } from 'src/app/constants/books-chapters';
import { RainbowColor, RainbowColors } from 'src/app/constants/colors';
import { Note, RecentRead, Verse } from 'src/app/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { BookmarkService } from 'src/app/services/bookmark.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import NoteUtils from 'src/app/utils/note.utils';

@Component({
  selector: 'app-verses',
  imports: [IonButton, IonContent, IonFab, IonFabButton, IonIcon],
  templateUrl: './verses.page.html',
  styleUrls: ['./verses.page.scss'],
})
export class VersesPage {
  chapter = ''; // John 1
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

  private lastParams: any;
  private apiService = inject(ApiService);
  private storeService = inject(LocalStorageService);
  private bookmarkService = inject(BookmarkService);
  private noteModalService = inject(NoteModalService);
  private verseActionsModalService = inject(VerseActionsModalService);

  constructor(private route: ActivatedRoute, private router: Router) {
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
          this.bookmarkService.setRecentRead(params as RecentRead);
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

    const book = books.find((b) => b.id === verse.book);
    const chapter = verse.chapter;
    const firstVerse = selectedVerses[0].verse;
    const lastVerse = selectedVerses[selectedVerses.length - 1].verse;
    const verseText = selectedVerses.length > 1 ? `${firstVerse}-${lastVerse}` : verse.verse;
    this.selectedVersesText = `${book?.name} ${chapter}:${verseText}`;
  }

  isSelected(verse: Verse): boolean {
    return !!this.selectedVerses().find((v) => v.id === verse.id);
  }

  navigateBack() {
    const { book, chapter } = this.route.snapshot.params;
    let newBook = Number(book);
    let newChapter = Number(chapter);

    if (newChapter > 1) {
      newChapter--;
    } else if (newBook > 1) {
      newBook--;
      const previousBook = books.find((b) => b.id === newBook);
      newChapter = previousBook?.chapters || 1;
    }

    this.router.navigate([`/read/${newBook}/${newChapter}`]);
  }

  navigateForward() {
    const { book, chapter } = this.route.snapshot.params;
    let newBook = Number(book);
    let newChapter = Number(chapter);
    const currentBook = books.find((b) => b.id === newBook);

    if (newChapter < (currentBook?.chapters || 0)) {
      newChapter++;
    } else if (newBook < books.length) {
      newBook++;
      newChapter = 1;
    }

    this.router.navigate([`/read/${newBook}/${newChapter}`]);
  }

  protected getNotesForVerse = (verse: Verse) => NoteUtils.getNotesForVerse(this.notes, verse);

  private async getVerses() {
    const { verse } = this.route.snapshot.queryParams;
    const { book, chapter } = this.route.snapshot.params;
    const bookData = books.find((b) => b.id === Number(book));
    this.chapter = `${bookData?.name} ${chapter}`;
    const verses = await this.apiService.getVerses(book, chapter);
    this.verses.set(this.getVerseWithHighlights(verses));
    this.focusVerse(verse);
  }

  private getVerseHighlights() {
    const { book, chapter } = this.route.snapshot.params;
    return this.storeService.getVerseHighlightsByBook(Number(book), Number(chapter));
  }

  protected getHighlightTextColor(color: string) {
    switch (color) {
      case 'red':
      case 'indigo':
      case 'violet':
        return 'rgba(255, 255, 255, 0.95)';
      case 'green':
      case 'blue':
      case 'orange':
      case 'yellow':
      default:
        return '#333';
    }
  }

  protected getHighlightBackgroundColor(color: string) {
    console.log(color);
    console.log(RainbowColors[color as keyof typeof RainbowColors]);
    return RainbowColors[color as keyof typeof RainbowColors];
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
