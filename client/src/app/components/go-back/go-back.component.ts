import { RouterNavigationService } from '../../services/router-navigation.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-go-back',
  imports: [IonButton, IonIcon],
  template: `
    <ion-button [disabled]="disabled()" (click)="goBack()">
      <ion-icon slot="icon-only" name="arrow-back"></ion-icon>
    </ion-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoBackComponent {
  private routerNavigationService = inject(RouterNavigationService);

  disabled = computed(() => {
    this.routerNavigationService.navigationEnd();
    return history.length <= 2;
  });

  goBack = () => this.routerNavigationService.back();
}
