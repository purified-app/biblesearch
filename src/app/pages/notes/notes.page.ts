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
import BookmarkUtils from 'src/app/utils/bookmark.utils';
import NoteUtils from 'src/app/utils/note.utils';
import { TextKey } from 'src/app/constants/text-key';
import { TranslatePipe } from '@angular-libs/translate';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-notes',
  imports: [
    PageHeaderComponent,
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
    <app-page-header></app-page-header>
    <ion-content class="ion-padding">
      <ion-list>
        @for (note of notes(); track $index) {
          <ion-item-sliding #sliding>
            <ion-item [button]="true" (click)="onNoteClick(note)">
              <ion-label>
                <div class="note-header">
                  <strong>{{ getNoteTitle(note) }}</strong>
                  <ion-note color="medium">{{ note.createdDate | date: 'medium' }}</ion-note>
                </div>
                <ion-note color="medium">{{ note.content }}</ion-note>
              </ion-label>
            </ion-item>

            <ion-item-options>
              <ion-item-option color="danger" (click)="deleteNote(note); sliding.close()">{{
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
  private storage = inject(StorageService);
  protected notes = this.storage.getSignal('notes');
  protected selectedNote = signal<Note | undefined>(undefined);
  protected selectedNoteTitle = computed(() => NoteUtils.getNoteTitle(this.selectedNote()));
  protected noteModalService = inject(NoteModalService);
  protected getNoteTitle = (note: Note) => BookmarkUtils.getTitle(note.bookmark);
  protected TextKey = TextKey;

  protected async onNoteClick(note: Note) {
    const modal = await this.noteModalService.openModal(note);
    await modal.onDidDismiss<Note>();
    this.selectedNote.set(undefined);
  }

  protected deleteNote(note: Note) {
    this.storage.notesAdapter.removeOne(note.id);
  }
}
