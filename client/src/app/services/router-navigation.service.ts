import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouterNavigationService {
  private router = inject(Router);
  navigationEnd = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd))
  );

  /** Navigate back to the previous route if history exists */
  back(): void {
    history.back();
  }
}
