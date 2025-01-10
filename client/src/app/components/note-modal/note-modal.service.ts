import { inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { NoteModalComponent } from './note-modal.component';
import { Note } from 'src/app/interfaces';

@Injectable({ providedIn: 'root' })
export class NoteModalService {
  modalController = inject(ModalController);

  async openModal(note: Note) {
    const modal = await this.modalController.create({
      component: NoteModalComponent,
      componentProps: { note },
    });
    modal.present();
    return modal;
  }
}
