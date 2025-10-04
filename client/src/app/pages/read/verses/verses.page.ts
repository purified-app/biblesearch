import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonSearchbar,
  NavController,
} from '@ionic/angular/standalone';
import { IonContentCustomEvent, ScrollDetail } from '@ionic/core';
import { NavigationOptions } from 'node_modules/@ionic/angular/common/providers/nav-controller';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { LanguageSelectComponent } from 'src/app/components/language-select/language-select.component';
import { NoteModalService } from 'src/app/components/note-modal/note-modal.service';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { SearchService } from 'src/app/components/search/search.service';
import { VerseActionsModalService } from 'src/app/components/verse-actions-modal/verse-actions-modal.service';
import { TextKey } from 'src/app/constants/text-key';
import { UrlPath } from 'src/app/constants/url-path';
import { PageSwipeDirective } from 'src/app/directives/page-swipe.directive';
import { Note, Verse, VerseNotes } from 'src/app/interfaces';
import { VersePageParams } from 'src/app/interfaces/route-params';
import { HighlightSearchPipe } from 'src/app/pipes/highlight-search.pipe';
import { ApiService } from 'src/app/services/api.service';
import { BookmarkService } from 'src/app/services/bookmark.service';
import { ChapterNavigationService } from 'src/app/services/chapter-navigation.service';
import { LocalStorageUtils } from 'src/app/utils/local-storage.utils';
import NoteUtils from 'src/app/utils/note.utils';
import RouteUtils from 'src/app/utils/route.utils';
import { FocusVerseDirective } from './focus-verse.directive';
import { HighlightColorDirective } from './highlight-verse.directive';
import { versesActionSheetButtons } from './verses-action-sheet-buttons';

@Component({
  selector: 'app-verses',
  imports: [
    BackButtonComponent,
    FocusVerseDirective,
    LanguageSelectComponent,
    HighlightSearchPipe,
    HighlightColorDirective,
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
  private apiService = inject(ApiService);
  private bookmarkService = inject(BookmarkService);
  private chapterNavigationService = inject(ChapterNavigationService);
  private elRef = inject(ElementRef<HTMLElement>);
  private navController = inject(NavController);
  private noteModalService = inject(NoteModalService);
  private route = inject(ActivatedRoute);
  private verseActionsModalService = inject(VerseActionsModalService);
  protected searchService = inject(SearchService);

  protected actionSheetButtons = versesActionSheetButtons;
  protected TextKey = TextKey;

  // Signals
  protected chapterInfo = computed(() => RouteUtils.getChapterInfo(this.routeParams()!));
  protected ionSearchbar = viewChild(IonSearchbar);
  protected routeData = toSignal(this.route.data);
  protected routeParams = toSignal(this.route.params);
  protected routeQueryParams = toSignal(this.route.queryParams);
  protected search = signal('');
  protected selectedVerses = signal<Verse[]>([]);
  protected showFabs = signal(true);

  protected verses = resource<VerseNotes[], VersePageParams>({
    params: () => this.routeParams() as VersePageParams,
    loader: async ({ params }) => {
      const { translation, bookUsfm, chapter } = params;
      if (!params) return [];
      const verses = await this.apiService.getVerses(translation, bookUsfm, chapter);
      const notes = LocalStorageUtils.getNotes();
      const versesWithNotes = verses.map((verse) => ({
        ...verse,
        notes: NoteUtils.getNotesForVerse(notes, verse),
      }));
      this.addHighlightToVerses(versesWithNotes);
      return versesWithNotes;
    },
    defaultValue: [],
  });
  protected versesToFocus = computed(() => {
    const { verse } = this.routeQueryParams() || {};
    return verse?.split(',').map(Number) || [];
  });

  private ionContent = viewChild(IonContent);

  constructor() {
    effect(() => {
      const { chapter, name, translation, usfm } = this.chapterInfo();
      const recentRead = { bookName: name, bookUsfm: usfm, chapter, translation };
      this.bookmarkService.recentRead.set(recentRead);
    });
  }

  ngAfterViewInit(): void {
    this.ionContentScroll();
  }

  async onActionFabClick() {
    const modal = await this.verseActionsModalService.openModal(this.selectedVerses());
    modal.onDidDismiss().then(({ data, role }) => {
      switch (role) {
        case 'bookmark':
          break;
        case 'highlight':
          this.addHighlightToVerses(this.verses.value()!);
          break;
        case 'note':
          this.verses.reload();
          break;
      }
      this.selectedVerses.set([]);
    });
  }

  async onNoteClick(event: Event, note: Note) {
    event.stopImmediatePropagation();
    const modal = await this.noteModalService.openModal(note);
    modal.onDidDismiss().then(({ role }) => {
      switch (role) {
        case 'delete':
          this.verses.reload();
      }
    });
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

  protected navigateForward(options?: NavigationOptions) {
    const versePageParams = this.routeParams() as VersePageParams;
    this.chapterNavigationService.navigateChapter('forward', versePageParams, options);
  }

  protected navigateBack(options?: NavigationOptions) {
    const versePageParams = this.routeParams() as VersePageParams;
    this.chapterNavigationService.navigateChapter('backward', versePageParams, options);
  }

  protected onScroll(event: IonContentCustomEvent<ScrollDetail>) {
    this.showFabs.set(event.detail.deltaY <= 0);
  }

  protected goBackToChapters() {
    const { translation, bookUsfm } = this.routeParams()!;
    this.navController.navigateBack([`/${UrlPath.read}/${translation}/${bookUsfm}`]);
  }

  private async ionContentScroll() {
    const scrollEl = await this.ionContent()?.getScrollElement();
    let lastScrollTop = 0;
    scrollEl?.addEventListener('scroll', () => {
      const currentScrollTop = scrollEl.scrollTop;
      const deltaY = currentScrollTop - lastScrollTop;
      this.showFabs.set(deltaY <= 0);
      lastScrollTop = currentScrollTop;
    });
  }

  private getHighlightVerses() {
    const { bookUsfm, chapter } = this.routeParams()!;
    return LocalStorageUtils.getVersesToHighlightByBook(bookUsfm, Number(chapter));
  }

  private addHighlightToVerses(verses: (Verse & { color?: string })[]) {
    const highlights = this.getHighlightVerses();
    verses.forEach((verse) => {
      const highlight = highlights.find((highlight) => highlight.verse === verse.verse);
      verse.color = highlight?.color;
    });
  }
}
