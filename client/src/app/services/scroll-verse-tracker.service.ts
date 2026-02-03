import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ScrollVerseTrackerService {
  private router = inject(Router);
  private urlUpdateTimeout: number | null = null;

  updateTopVerse(scrollEl: HTMLElement) {
    // Get top visible verse
    const verseElements = document.querySelectorAll<HTMLElement>('.verse-number');
    let currentTopVerse: number | null = null;
    let closestOffset = Number.POSITIVE_INFINITY;
    verseElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const offset = Math.abs(rect.top - scrollEl.getBoundingClientRect().top);
      if (offset < closestOffset && rect.bottom > scrollEl.getBoundingClientRect().top) {
        closestOffset = offset;
        currentTopVerse = parseInt(el.id.replace('verse-', ''), 10);
      }
    });

    // Debounced URL update
    if (this.urlUpdateTimeout) {
      clearTimeout(this.urlUpdateTimeout);
    }
    this.urlUpdateTimeout = window.setTimeout(() => {
      if (currentTopVerse !== null) {
        this.router.navigate([], {
          queryParamsHandling: 'preserve',
          fragment: `verse-${currentTopVerse}`,
          replaceUrl: true,
        });
      }
      this.urlUpdateTimeout = null;
    }, 200);
  }
}
