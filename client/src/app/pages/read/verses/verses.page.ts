import { AfterViewInit, Component, computed, inject, signal, viewChild } from '@angular/core';
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
import { Note, VerseNotes } from 'src/app/interfaces';
import { ChapterNavigationService } from 'src/app/services/chapter-navigation.service';
import { VersesService } from 'src/app/pages/read/verses/verses.service';
import { versesActionSheetButtons } from './verses-action-sheet-buttons';
import { VerseReaderComponent } from './verse-reader.component';

@Component({
  selector: 'app-verses',
  imports: [
    BackButtonComponent,
    LanguageSelectComponent,
    PageHeaderComponent,
    PageSwipeDirective,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    VerseReaderComponent,
  ],
  templateUrl: './verses.page.html',
  styleUrls: ['./verses.page.scss'],
  providers: [VersesService],
})
export class VersesPage implements AfterViewInit {
  private chapterNavigationService = inject(ChapterNavigationService);
  private navController = inject(NavController);
  private noteModalService = inject(NoteModalService);
  private route = inject(ActivatedRoute);
  private verseActionsModalService = inject(VerseActionsModalService);
  private versesService = inject(VersesService);
  protected searchService = inject(SearchService);

  protected actionSheetButtons = versesActionSheetButtons;
  protected TextKey = TextKey;

  // Signals
  protected ionSearchbar = viewChild(IonSearchbar);
  protected routeData = toSignal(this.route.data);
  protected routeQueryParams = toSignal(this.route.queryParams);
  protected search = signal('');
  protected selectedVerses = this.versesService.selectedVerses;
  protected showFabs = signal(true);

  protected versesResource = this.versesService.versesResource;
  protected versesToFocus = computed(() => {
    const verse = this.routeQueryParams()?.['verse'] as string;
    return verse?.split(',').map(Number) || [];
  });

  private ionContent = viewChild(IonContent);

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
          this.versesService.addHighlightToVerses(this.versesResource.value()!);
          break;
        case 'note':
          this.versesResource.reload();
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
          const updatedVerses = this.versesService.removeNoteFromVerses(
            this.versesResource.value()!,
            note.id
          );
          this.versesResource.set(updatedVerses);
          break;
      }
    });
  }

  onVerseClick(verse: VerseNotes) {
    let selectedVerses = this.selectedVerses();
    const found = selectedVerses.find((v) => v.id === verse.id);
    if (!found) selectedVerses.push(verse);
    else selectedVerses = selectedVerses.filter((v) => v.id !== verse.id);

    this.selectedVerses.set(selectedVerses);

    if (!selectedVerses.length) return;
    selectedVerses.sort((a, b) => a.verse - b.verse);
  }

  protected navigateForward(options?: NavigationOptions) {
    this.chapterNavigationService.navigateChapter(
      'forward',
      this.versesService.routeParams()!,
      options
    );
  }

  protected navigateBack(options?: NavigationOptions) {
    this.chapterNavigationService.navigateChapter(
      'backward',
      this.versesService.routeParams()!,
      options
    );
  }

  protected onScroll(event: IonContentCustomEvent<ScrollDetail>) {
    this.showFabs.set(event.detail.deltaY <= 0);
  }

  protected goBackToChapters() {
    const { translation, bookUsfm } = this.versesService.routeParams()!;
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
}
