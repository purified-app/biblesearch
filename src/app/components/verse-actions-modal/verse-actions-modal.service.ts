import { inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { VerseActionsModalComponent } from './verse-actions-modal.component';
import { Verse } from 'src/app/interfaces';

@Injectable({ providedIn: 'root' })
export class VerseActionsModalService {
  private modalController = inject(ModalController);

  async openModal(verses: Verse[]) {
    const modal = await this.modalController.create({
      component: VerseActionsModalComponent,
      // breakpoints: [0, 0.3],
      // initialBreakpoint: 0.3,
      componentProps: { verses },
      cssClass: 'modal-action-sheet',
    });
    modal.present();
    return modal;
  }
}
