import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TextKey } from 'src/app/constants/text-key';
import { Note } from 'src/app/interfaces';
import BookmarkUtils from 'src/app/utils/bookmark.utils';
import { LocalStorageUtils } from 'src/app/utils/local-storage.utils';

@Component({
  selector: 'app-note-modal',
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonFabList,
    IonHeader,
    IonIcon,
    IonToolbar,
    IonTitle,
    TranslatePipe,
  ],
  template: `
    <ion-header collapse="fade">
      <ion-toolbar>
        <ion-title> {{ title }} </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="navigateToBookmark()">
            <ion-icon name="book-outline" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button (click)="modalController.dismiss()">
            {{ TextKey.Cancel | translate }}
          </ion-button>
          <ion-button (click)="onNoteModalConfirm()"> {{ TextKey.Save | translate }} </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="note-modal-content">
        <textarea [value]="note.content" (input)="onNoteInput($event)"></textarea>
      </div>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button>
          <ion-icon name="chevron-up-circle"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button (click)="onDeleteNote()">
            <ion-icon color="danger" name="trash-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>
    </ion-content>
  `,
  styleUrl: './note-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteModalComponent implements OnInit, AfterViewInit, NoteModalProps {
  note!: Note;

  noteContent = signal<string | undefined>(this.note?.content);

  elRef = inject(ElementRef);
  title?: string;

  protected modalController = inject(ModalController);
  protected TextKey = TextKey;

  private alertControler = inject(AlertController);
  private router = inject(Router);
  private translation = inject(TranslateService);

  ngOnInit(): void {
    this.title = BookmarkUtils.getTitle(this.note.bookmark);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const textareaEl = this.elRef.nativeElement.querySelector('textarea');
      textareaEl.focus();
    }, 50);
  }

  protected async onDeleteNote() {
    const alert = await this.alertControler.create({
      header: this.translation.instant(TextKey.DeleteNote),
      message: this.translation.instant(TextKey.DeleteNoteMessage),
      buttons: [
        {
          text: this.translation.instant(TextKey.Cancel),
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: this.translation.instant(TextKey.Delete),
          handler: () => {
            LocalStorageUtils.removeNote(this.note.id);
            this.modalController.dismiss(this.note, 'delete');
          },
        },
      ],
    });
    alert.present();
  }

  protected navigateToBookmark() {
    const { bookUsfm, chapter, translation, verses } = this.note.bookmark;
    this.modalController.dismiss();
    this.router.navigate([`/read/${translation}/${bookUsfm}/${chapter}`], {
      queryParams: { verse: verses.join(',') },
    });
  }

  protected onNoteModalConfirm() {
    const noteContent = this.noteContent();
    if (noteContent !== undefined) {
      this.note.content = noteContent;
    }
    LocalStorageUtils.saveNote(this.note);
    this.modalController.dismiss(this.note, 'confirm');
  }

  protected onNoteInput(event: Event) {
    const element = event.target as HTMLTextAreaElement;
    this.noteContent.set(element.value);
  }
}

interface NoteModalProps {
  note: Note;
}
