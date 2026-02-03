import { effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class RouteParamsService {
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);
  private routeFragment = toSignal(this.route.fragment);

  constructor() {
    effect(() => {
      this.storage.set('routeFragment', this.routeFragment() ?? '');
    });
  }
}
