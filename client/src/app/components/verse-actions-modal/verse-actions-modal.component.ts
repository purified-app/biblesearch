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
import { TranslatePipe } from '@ngx-translate/core';
import { TextKey } from 'src/app/constants/text-key';
import { Verse } from 'src/app/interfaces';
import { BookmarkService } from 'src/app/services/bookmark.service';
import NoteUtils from 'src/app/utils/note.utils';
import { NoteModalService } from '../note-modal/note-modal.service';
import { RainbowColor, RainbowColors } from './../../constants/colors';
import { VerseHighlightService } from './verse-highlight.service';

@Component({
  selector: 'app-verse-actions-modal',
  imports: [IonButton, IonIcon, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup, TranslatePipe],
  template: `
    <ion-list>
      <ion-item [button]="true" (click)="onActionClick('note')">
        <ion-icon name="document-text-outline" slot="start"></ion-icon>
        <ion-label>{{ TextKey.AddNote | translate }}</ion-label>
      </ion-item>
      <ion-item [button]="true" (click)="onActionClick('bookmark')">
        <ion-icon name="bookmark-outline" slot="start"></ion-icon>
        <ion-label>{{ TextKey.Bookmark | translate }}</ion-label>
      </ion-item>
      <ion-item [button]="true" (click)="onActionClick('share')">
        <ion-icon name="share-social-outline" slot="start"></ion-icon>
        <ion-label>{{ TextKey.CopyLink | translate }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-radio-group
          [value]="color"
          (ionChange)="onActionClick('highlight', $any($event).target.value)"
        >
          <div>
            <ion-radio class="red" [value]="RainbowColor.red"></ion-radio>
            <ion-radio class="orange" [value]="RainbowColor.orange"></ion-radio>
            <ion-radio class="yellow" [value]="RainbowColor.yellow"></ion-radio>
            <ion-radio class="green" [value]="RainbowColor.green"></ion-radio>
            <ion-radio class="blue" [value]="RainbowColor.blue"></ion-radio>
            <ion-radio class="indigo" [value]="RainbowColor.indigo"></ion-radio>
            <ion-radio class="violet" [value]="RainbowColor.violet"></ion-radio>
            <ion-radio class="white" value="white"></ion-radio>
            <ion-radio class="gray" value="gray"></ion-radio>
            <ion-button
              color="medium"
              shape="round"
              size="medium"
              (click)="onActionClick('highlight', undefined)"
            >
              <ion-icon slot="icon-only" name="close-circle"></ion-icon>
            </ion-button>
          </div>
          <!-- <ion-icon name="document-text-outline" slot="start"></ion-icon> -->
        </ion-radio-group>
      </ion-item>
    </ion-list>
  `,
  styleUrl: './verse-actions-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerseActionsModalComponent implements OnInit, VerseActionsModalProps {
  verses!: (Verse & { color?: string })[];
  protected color?: string;
  protected RainbowColors = RainbowColors;
  protected RainbowColor = RainbowColor;
  protected TextKey = TextKey;

  private bookmarkService = inject(BookmarkService);
  private highlightService = inject(VerseHighlightService);
  private modalController = inject(ModalController);
  private noteModalService = inject(NoteModalService);

  ngOnInit(): void {
    this.color = this.verses.length === 1 ? this.verses[0]?.['color'] : undefined;
  }

  protected async onActionClick(role: string, data?: string) {
    switch (role) {
      case 'share':
        const verseQueryParam = this.verses.map((verse) => verse.verse).join(',');
        const url = `${window.location.href}?verse=${verseQueryParam}`;
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        }
        break;
      case 'note':
        const note = NoteUtils.createNoteFromVerses(this.verses);
        const modal = await this.noteModalService.openModal(note);
        modal.onDidDismiss().then((event) => {
          event.role === 'confirm' ? this.modalController.dismiss(event.data, role) : null;
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
