import { RainbowColor, RainbowColors } from './../../constants/colors';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  ModalController,
} from '@ionic/angular/standalone';
import { Verse } from 'src/app/interfaces';
import { VerseHighlightService } from './verse-highlight.service';
import { BookmarkService } from 'src/app/services/bookmark.service';
import { NoteModalService } from '../note-modal/note-modal.service';
import NoteUtils from 'src/app/utils/note.utils';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-verse-actions-modal',
  imports: [IonButton, IonIcon, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup],
  template: `
    <ion-list>
      <ion-item [button]="true" (click)="onActionClick('bookmark')">
        <ion-icon name="bookmark-outline" slot="start"></ion-icon>
        <ion-label>Bookmark</ion-label>
      </ion-item>
      <ion-item [button]="true" (click)="onActionClick('note')">
        <ion-icon name="document-text-outline" slot="start"></ion-icon>
        <ion-label>Add note</ion-label>
      </ion-item>

      <!-- <ion-item-group>
        <ion-item-divider>
          <ion-label>A</ion-label>
        </ion-item-divider> -->

      <ion-item>
        <div class="highlight-item-container">
          <ion-radio-group
            [value]="color"
            (ionChange)="onActionClick('highlight', $any($event).target.value)"
          >
            <!-- <ion-icon name="document-text-outline" slot="start"></ion-icon> -->
            <ion-radio class="red" [value]="RainbowColor.red"></ion-radio>
            <ion-radio class="orange" [value]="RainbowColor.orange"></ion-radio>
            <ion-radio class="yellow" [value]="RainbowColor.yellow"></ion-radio>
            <ion-radio class="green" [value]="RainbowColor.green"></ion-radio>
            <ion-radio class="blue" [value]="RainbowColor.blue"></ion-radio>
            <ion-radio class="indigo" [value]="RainbowColor.indigo"></ion-radio>
            <ion-radio class="violet" [value]="RainbowColor.violet"></ion-radio>
          </ion-radio-group>
          <ion-button
            color="medium"
            shape="round"
            size="medium"
            (click)="onActionClick('highlight', undefined)"
          >
            <ion-icon slot="icon-only" name="close-circle"></ion-icon>
          </ion-button>
        </div>
      </ion-item>
      <!-- </ion-item-group> -->
    </ion-list>
  `,
  styleUrl: './verse-actions-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerseActionsModalComponent implements OnInit, VerseActionsModalProps {
  verses!: Verse[];
  protected color?: string;
  protected RainbowColors = RainbowColors;
  protected RainbowColor = RainbowColor;

  private bookmarkService = inject(BookmarkService);
  private highlightService = inject(VerseHighlightService);
  private modalController = inject(ModalController);
  private noteModalService = inject(NoteModalService);
  private storeService = inject(LocalStorageService);

  ngOnInit(): void {
    this.color = undefined;
  }

  protected async onActionClick(role: string, data?: any) {
    switch (role) {
      case 'note':
        const note = NoteUtils.createNoteFromVerses(this.verses);
        const modal = await this.noteModalService.openModal(note);
        modal.onDidDismiss().then((event) => {
          if (event.role === 'confirm') {
            const notes = this.storeService.getNotes();
            this.modalController.dismiss(notes, role);
          }
        });
        return;
      case 'highlight':
        this.color = data;
        this.highlightService.saveVerseHighlights(this.verses, this.color ?? '');
        break;
      case 'bookmark':
        this.bookmarkService.saveVersesAsBookmark(this.verses);
        break;
    }
    this.modalController.dismiss(data, role);
  }
}

interface VerseActionsModalProps {
  verses: Verse[];
}
