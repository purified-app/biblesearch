import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NavigationOptions } from '@ionic/angular/common/providers/nav-controller';
import {
  ActionSheetButton,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonSearchbar,
  NavController,
} from '@ionic/angular/standalone';
import { LanguageSelectComponent } from 'src/app/components/language-select/language-select.component';
import { NoteModalService } from 'src/app/components/note-modal/note-modal.service';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { SearchService } from 'src/app/components/search/search.service';
import { VerseActionsModalService } from 'src/app/components/verse-actions-modal/verse-actions-modal.service';
import { AllBooks } from 'src/app/constants/books';
import { TextKey } from 'src/app/constants/text-key';
import { UrlPath } from 'src/app/constants/url-path';
import { PageSwipeDirective } from 'src/app/directives/page-swipe.directive';
import { Note, Verse } from 'src/app/interfaces';
import { HighlightPipe } from 'src/app/pipes/highlight.pipe';
import { BookmarkService } from 'src/app/services/bookmark.service';
import HighlightUtils from 'src/app/utils/highlight.utils';
import { LocalStorageUtils } from 'src/app/utils/local-storage.utils';
import NoteUtils from 'src/app/utils/note.utils';
import RouteUtils from 'src/app/utils/route.utils';

@Component({
  selector: 'app-verses',
  imports: [
    LanguageSelectComponent,
    HighlightPipe,
    PageHeaderComponent,
    PageSwipeDirective,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
  templateUrl: './verses.page.html',
  styleUrls: ['./verses.page.scss'],
})
export class VersesPage implements AfterViewInit {
  private bookmarkService = inject(BookmarkService);
  private elRef = inject(ElementRef<HTMLElement>);
  private navController = inject(NavController);
  private noteModalService = inject(NoteModalService);
  private route = inject(ActivatedRoute);
  private verseActionsModalService = inject(VerseActionsModalService);
  protected searchService = inject(SearchService);

  protected actionSheetButtons: ActionSheetButton[] = [
    {
      icon: 'bookmark-outline',
      text: TextKey.Bookmark,
      role: 'bookmark',
    },
    { icon: 'document-text-outline', text: TextKey.AddNote, role: 'notes' },
  ];
  protected notes: Note[] = [];
  protected TextKey = TextKey;

  // Signals
  protected chapterInfo = computed(() => RouteUtils.getChapterInfo(this.routeParams()!));
  protected ionSearchbar = viewChild(IonSearchbar);
  protected routeData = toSignal(this.route.data);
  protected routeParams = toSignal(this.route.params);
  protected routeQueryParams = toSignal(this.route.queryParams);
  protected search = signal('');
  protected selectedVerses = signal<Verse[]>([]);
  protected verses = computed(() => {
    const { verses } = this.routeData() || {};
    this.addHighlightToVerses(verses);
    return verses;
  });
  protected versesToFocus = computed(() => {
    const { verse } = this.routeQueryParams() || {};
    return verse?.split(',').map(Number);
  });

  private isViewInitialized = signal(false);

  constructor() {
    effect(() => {
      const { chapter, name, translation, usfm } = this.chapterInfo();
      const recentRead = { bookName: name, bookUsfm: usfm, chapter, translation };
      this.bookmarkService.recentRead.set(recentRead);
    });

    effect(() => {
      if (!this.isViewInitialized() || !this.versesToFocus()) return;
      this.focusVerse();
    });
    this.notes = LocalStorageUtils.getNotes();
  }

  ngAfterViewInit(): void {
    this.isViewInitialized.set(true);
  }

  onSearch(event: any) {
    this.search.set(event.detail.value);
    setTimeout(() => {
      const element = this.elRef.nativeElement as HTMLElement;
      const scrollEl = element
        .getElementsByTagName('ion-content')[0]
        .getElementsByClassName('scroll-y')[0];
      const firstSearchHit = element.getElementsByTagName('b')[0];
      firstSearchHit
        ? firstSearchHit.scrollIntoView({ behavior: 'smooth' })
        : scrollEl.scrollTo({ top: 0 });
    });
  }

  async onVerseFabClick() {
    const modal = await this.verseActionsModalService.openModal(this.selectedVerses());
    modal.onDidDismiss().then(({ data, role }) => {
      switch (role) {
        case 'bookmark':
          break;
        case 'highlight':
          this.addHighlightToVerses(this.verses()!);
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
  }

  isSelected(verse: Verse): boolean {
    return !!this.selectedVerses().find((v) => v.id === verse.id);
  }

  navigateBack(options?: NavigationOptions) {
    let { bookUsfm, chapter, translation } = this.routeParams()!;
    const books = AllBooks[translation as keyof typeof AllBooks];
    const currentBook = books.find((b) => b.usfm === bookUsfm);
    if (!currentBook) return;
    chapter = Number(chapter);

    if (chapter > 1) {
      chapter--;
    } else if (currentBook.bookNumber > 1) {
      const nextBook = books.find((b) => b.bookNumber === currentBook.bookNumber - 1);
      if (!nextBook) return;
      bookUsfm = nextBook.usfm;
      chapter = nextBook?.chapters || 1;
    }
    this.navigate(bookUsfm, chapter, options);
  }

  navigateForward(options?: NavigationOptions) {
    let { bookUsfm, chapter, translation } = this.routeParams()!;
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
    this.navigate(bookUsfm, chapter, options);
  }

  protected goBackToChapters() {
    const { translation, bookUsfm } = this.routeParams()!;
    this.navController.navigateBack([`/${UrlPath.read}/${translation}/${bookUsfm}`]);
  }

  protected getNotesForVerse = (verse: Verse) => NoteUtils.getNotesForVerse(this.notes, verse);
  protected getHighlightTextColor = HighlightUtils.getHighlightTextColor;
  protected getHighlightBackgroundColor = HighlightUtils.getHighlightBackgroundColor;

  private navigate(bookUsfm: string, chapter: number, options?: NavigationOptions) {
    const { translation } = this.routeParams()!;
    const url = `/${UrlPath.read}/${translation}/${bookUsfm}/${chapter}`;
    const direction = chapter > Number(this.routeParams()!['chapter']) ? 'forward' : 'backward';
    direction === 'forward'
      ? this.navController.navigateForward(url, options)
      : this.navController.navigateBack(url, options);
  }

  private getVerseHighlights() {
    const { bookUsfm, chapter } = this.routeParams()!;
    return LocalStorageUtils.getVerseHighlightsByBook(bookUsfm, Number(chapter));
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
    }, 100);
  }
}
