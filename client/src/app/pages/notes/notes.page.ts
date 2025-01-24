import { NoteModalService } from 'src/app/components/note-modal/note-modal.service';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonContent,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonNote,
} from '@ionic/angular/standalone';
import { Note } from 'src/app/interfaces';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import BookmarkUtils from 'src/app/utils/bookmark.utils';
import NoteUtils from 'src/app/utils/note.utils';
import { TextKey } from 'src/app/constants/text-key';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-notes',
  imports: [
    IonContent,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonNote,
    DatePipe,
    TranslatePipe,
  ],
  template: `
    <ion-content class="ion-padding">
      <ion-list>
        @for (note of notes(); track $index) {
        <ion-item-sliding #sliding>
          <ion-item [button]="true" (click)="onNoteClick(note)">
            <ion-label>
              <div class="note-header">
                <strong>{{ getNoteTitle(note) }}</strong>
                <ion-note color="medium">{{ note.createdDate | date : 'medium' }}</ion-note>
              </div>
              <ion-note color="medium">{{ note.content }}</ion-note>
            </ion-label>
          </ion-item>

          <ion-item-options>
            <ion-item-option color="danger" (click)="[onDeleteNote(note), sliding.close()]">{{
              TextKey.Delete | translate
            }}</ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
        }
      </ion-list>
    </ion-content>
  `,
  styleUrl: './notes.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesPage {
  protected store = inject(LocalStorageService);
  protected notes = signal<Note[]>(this.store.getNotes());
  protected selectedNote = signal<Note | undefined>(undefined);
  protected selectedNoteTitle = computed(() => {
    const note = this.selectedNote();
    return note ? NoteUtils.getNoteTitle(note) : '';
  });
  protected noteModalService = inject(NoteModalService);
  protected getNoteTitle = (note: Note) => BookmarkUtils.getTitle(note.bookmark);
  protected TextKey = TextKey;

  protected async onNoteClick(note: Note) {
    const modal = await this.noteModalService.openModal(note);
    const { role } = await modal.onDidDismiss<Note>();
    switch (role) {
      case 'confirm':
      case 'delete':
        this.notes.set(this.store.getNotes());
        break;
    }
    this.selectedNote.set(undefined);
  }

  protected onDeleteNote(note: Note) {
    this.store.deleteNote(note.id);
    this.notes.set(this.store.getNotes());
  }
}
