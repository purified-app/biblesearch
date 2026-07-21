import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-back-button',
  imports: [IonButton, IonIcon],
  template: `
    <ion-button (click)="goBack()">
      <ion-icon slot="icon-only" name="arrow-back"></ion-icon>
    </ion-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent {
  protected goBack(): void {
    history.back();
  }
}
