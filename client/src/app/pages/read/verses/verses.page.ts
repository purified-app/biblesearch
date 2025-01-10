import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetButton,
  IonActionSheet,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { combineLatest, debounceTime } from 'rxjs';
import { NoteModalService } from 'src/app/components/note-modal/note-modal.service';
import { books } from 'src/app/constants/books-chapters';
import { Note, RecentRead, Verse } from 'src/app/interfaces';
import { ApiService } from 'src/app/services/api.service';
import { BookmarkService } from 'src/app/services/bookmark.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import NoteUtils from 'src/app/utils/note.utils';

@Component({
  selector: 'app-verses',
  imports: [
    IonActionSheet,
    IonBackButton,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
  ],
  templateUrl: './verses.page.html',
  styleUrls: ['./verses.page.scss'],
})
export class VersesPage {
  chapter = ''; // John 1
  verses: Verse[] = [];
  verseFocused = false;
  versesToFocus?: number[];
  selectedVerses: Verse[] = [];
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

  onNoteClick(event: Event, note: Note) {
    event.stopImmediatePropagation();
    this.noteModalService.openModal(note);
  }

  onVerseClick(verse: Verse) {
    const found = this.selectedVerses.find((v) => v.id === verse.id);
    if (!found) {
      this.selectedVerses.push(verse);
    } else {
      this.selectedVerses = this.selectedVerses.filter((v) => v.id !== verse.id);
    }
    if (!this.selectedVerses.length) return;
    this.selectedVerses.sort((a, b) => a.verse - b.verse);

    const book = books.find((b) => b.id === verse.book);
    const chapter = verse.chapter;
    const firstVerse = this.selectedVerses[0].verse;
    const lastVerse = this.selectedVerses[this.selectedVerses.length - 1].verse;
    const verseText = this.selectedVerses.length > 1 ? `${firstVerse}-${lastVerse}` : verse.verse;
    this.selectedVersesText = `${book?.name} ${chapter}:${verseText}`;
  }

  isSelected(verse: Verse): boolean {
    return !!this.selectedVerses.find((v) => v.id === verse.id);
  }

  async onDismiss(event: any) {
    const { role } = event.detail;
    switch (role) {
      case 'backdrop':
        break;
      case 'bookmark':
        this.bookmarkService.saveVersesAsBookmark(this.selectedVerses);
        this.selectedVerses = [];
        break;
      case 'notes':
        const note = NoteUtils.createNoteFromVerses(this.selectedVerses);
        const modal = await this.noteModalService.openModal(note);
        modal.onDidDismiss().then(({ role }) => {
          if (role === 'confirm') {
            this.notes = this.storeService.getNotes();
          }
        });
        break;
    }
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
    this.verses = await this.apiService.getVerses(book, chapter);
    this.focusVerse(verse);
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
