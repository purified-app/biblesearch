import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { Note, VerseNotes } from 'src/app/interfaces';
import { HighlightSearchPipe } from 'src/app/pipes/highlight-search.pipe';
import { FocusVerseDirective } from './focus-verse.directive';
import { HighlightColorDirective } from './highlight-verse.directive';

@Component({
  selector: 'app-verse-reader',
  imports: [IonButton, IonIcon, HighlightSearchPipe, FocusVerseDirective, HighlightColorDirective],
  templateUrl: './verse-reader.component.html',
  styleUrls: ['./verse-reader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerseReaderComponent {
  verses = input<VerseNotes[]>([]);
  selectedVerses = input<VerseNotes[]>([]);
  versesToFocus = input<number[]>([]);
  searchTerm = input<string>('');

  verseClick = output<VerseNotes>();
  noteClick = output<{ event: Event; note: Note }>();

  isSelected(verse: VerseNotes): boolean {
    return !!this.selectedVerses().find((v) => v.id === verse.id);
  }

  onVerseClick(verse: VerseNotes): void {
    this.verseClick.emit(verse);
  }

  onNoteClick(event: Event, note: Note): void {
    this.noteClick.emit({ event, note });
  }
}
