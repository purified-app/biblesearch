import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { Note, VerseNotes } from 'src/app/interfaces';
import { HighlightSearchPipe } from 'src/app/pipes/highlight-search.pipe';
import { ScrollToDirective } from './scroll-to.directive';
import { HighlightColorDirective } from './highlight-verse.directive';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-verse-reader',
  imports: [IonButton, IonIcon, HighlightSearchPipe, ScrollToDirective, HighlightColorDirective],
  templateUrl: './verse-reader.component.html',
  styleUrls: ['./verse-reader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerseReaderComponent {
  private storage = inject(StorageService);
  verses = input<VerseNotes[]>([]);
  selectedVerses = input<VerseNotes[]>([]);
  versesToFocus = input<number[]>([]);
  searchTerm = input<string>('');

  verseClick = output<VerseNotes>();
  noteClick = output<{ event: Event; note: Note }>();

  selectedVerseIds = computed(() => {
    return new Set(this.selectedVerses().map((v) => v.id));
  });

  protected readonly renderNotes = this.storage.getSignal('renderNotes');

  onVerseClick(verse: VerseNotes): void {
    this.verseClick.emit(verse);
  }

  onNoteClick(event: Event, note: Note): void {
    this.noteClick.emit({ event, note });
  }
}
