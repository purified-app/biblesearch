import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BibleTranslationService {
  activeTranslation = signal<string>('KJV');
  constructor() {}
}
