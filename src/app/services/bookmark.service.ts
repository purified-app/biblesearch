import { inject, Injectable } from '@angular/core';
import { AnnotationService } from './annotation.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private readonly storage = inject(StorageService);

  readonly recentRead = this.storage.getSignal('recentRead');
  readonly bookmarks = inject(AnnotationService).bookmarks;
}
